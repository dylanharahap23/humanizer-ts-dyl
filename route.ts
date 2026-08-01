import { NextResponse } from "next/server";
import {
  HUMANIZE_CREDIT_COST,
  checkUserCredits,
  deductUserCredits,
  getBearerToken,
  getSupabaseUser,
} from "@/lib/credits/server";
import {
  AuthoringPipelineError,
  authorDocument,
  extractAtomicFacts,
  verifyFactBundle,
} from "@/lib/authoring-pipeline";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { applyMicroSurprise } from "@/lib/micro-suprise";
import { applyHumanizePostProcess } from "@/lib/humanize-postprocess";

const HUMANIZE_TIMEOUT_MS = Math.max(
  45_000,
  Number.parseInt(process.env.HUMANIZE_TIMEOUT_MS ?? "180000", 10) || 180_000
);
const MAX_SOURCE_CHARACTERS = 24_000;

type CreditContext = {
  userId: string;
  email: string | null;
};

type AuthoringRequest = {
  action?: "humanize" | "extract" | "generate";
  text?: unknown;
  tone?: unknown;
  settings?: unknown;
  userVoiceContext?: unknown;
  factBundle?: unknown;
  authorBrief?: unknown;
};

type ExtractedFacts = Awaited<ReturnType<typeof extractAtomicFacts>>["facts"];

function countMatches(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

function detectSourceLanguage(text: string): "English" | "Indonesian" {
  const english = countMatches(
    text,
    /\b(?:the|and|with|from|this|that|people|should|would|because|have|has|are|is)\b/gi
  );
  const indonesian = countMatches(
    text,
    /\b(?:yang|dan|dengan|dari|ini|itu|orang|harus|karena|adalah|akan|sudah)\b/gi
  );
  return indonesian > english ? "Indonesian" : "English";
}

function resolveTargetLanguage(
  sourceText: string,
  tone: unknown,
  settings: unknown
): "English" | "Indonesian" {
  const language =
    settings && typeof settings === "object"
      ? String((settings as { language?: unknown }).language ?? "")
      : "";
  const normalized = language.toLowerCase();

  if (normalized.includes("indonesian") && normalized.includes("english")) {
    return normalized.indexOf("indonesian") < normalized.indexOf("english")
      ? "English"
      : "Indonesian";
  }
  if (normalized.includes("indonesian")) return "Indonesian";
  if (normalized.includes("english")) return "English";
  if (tone === "ielts") return "English";
  return detectSourceLanguage(sourceText);
}

function getSigningSecret(apiKey: string): string {
  return (
    process.env.AUTHORING_PIPELINE_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    apiKey
  );
}

function readSourceText(body: AuthoringRequest): string {
  const sourceText = typeof body.text === "string" ? body.text.trim() : "";
  if (!sourceText) {
    throw new AuthoringPipelineError(
      "Paste text before starting the humanizer.",
      "invalid-facts"
    );
  }
  if (sourceText.length > MAX_SOURCE_CHARACTERS) {
    throw new AuthoringPipelineError(
      `Source text exceeds ${MAX_SOURCE_CHARACTERS.toLocaleString(
        "en-US"
      )} characters.`,
      "invalid-facts"
    );
  }
  return sourceText;
}

function createAutomaticBrief(
  facts: ExtractedFacts,
  toneValue: unknown,
  settingsValue: unknown,
  voiceContextValue: unknown
) {
  const settings =
    settingsValue && typeof settingsValue === "object"
      ? (settingsValue as {
          ieltsAcademic?: unknown;
          writingPurpose?: unknown;
        })
      : {};
  const voiceContext =
    voiceContextValue && typeof voiceContextValue === "object"
      ? String(
          (voiceContextValue as { personalAngle?: unknown }).personalAngle ?? ""
        )
          .trim()
          .slice(0, 1200)
      : "";
  const writingPurpose = String(settings.writingPurpose ?? "General");
  const tone =
    toneValue === "ielts" ||
    settings.ieltsAcademic ||
    writingPurpose === "Academic"
      ? "academic"
      : writingPurpose === "Professional"
        ? "professional"
        : writingPurpose === "Marketing"
          ? "passionate"
          : "casual";
  const audience =
    writingPurpose === "Academic"
      ? "academic readers"
      : writingPurpose === "Professional"
        ? "professional readers"
        : writingPurpose === "Marketing"
          ? "prospective customers"
          : "general readers";

  const speakerStance = facts.find((fact) =>
    /^(?:speaker|writer|first person|i)$/i.test(fact.attribution ?? "")
  );
  const evaluativeFacts = facts.filter((fact) =>
    /\b(?:alarming|concerning|crucial|essential|important|pressing|effective|harmful|beneficial|unfair|better|worse|must|should|ought)\b/i.test(
      fact.proposition
    )
  );
  const stanceFacts = [
    ...(speakerStance ? [speakerStance] : []),
    ...facts.filter((fact) => fact.modality === "required"),
    ...evaluativeFacts,
    ...facts.filter((fact) => fact.modality === "recommended"),
  ]
    .filter(
      (fact, index, all) =>
        all.findIndex((candidate) => candidate.id === fact.id) === index
    )
    .slice(0, 3);
  const stance = speakerStance
    ? `State the writer's own first-person position and ground it only in these ledger facts: ${stanceFacts
        .map((fact) => fact.proposition)
        .join(" | ")}`
    : stanceFacts.length > 0
      ? `Maintain a clear evaluative position grounded only in these ledger facts: ${stanceFacts
          .map((fact) => fact.proposition)
          .join(" | ")}`
      : "Present the supplied positions without inventing a new conclusion or attitude.";

  return {
    briefOrigin: "automatic",
    stance,
    audience,
    purpose: `Rewrite the supplied information for a ${writingPurpose.toLowerCase()} context without adding new factual claims.`,
    tone,
    priorityFactIds: facts.map((fact) => fact.id),
    allowedOmissionFactIds: [],
    realNotes: voiceContext ? [voiceContext] : [],
  };
}

async function requireCredits(
  req: Request
): Promise<
  | { ok: true; context: CreditContext | null }
  | { ok: false; response: NextResponse }
> {
  if (!isSupabaseServerConfigured) {
    return { ok: true, context: null };
  }

  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Login is required to continue.",
          creditsRequired: HUMANIZE_CREDIT_COST,
        },
        { status: 401 }
      ),
    };
  }

  const user = await getSupabaseUser(accessToken);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Your session expired. Please login again.",
          creditsRequired: HUMANIZE_CREDIT_COST,
        },
        { status: 401 }
      ),
    };
  }

  const creditCheck = await checkUserCredits(
    user.id,
    HUMANIZE_CREDIT_COST,
    user.email ?? null
  );
  if (!creditCheck.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Insufficient credits.",
          creditsRequired: creditCheck.required,
          creditsCurrent: creditCheck.credits,
          creditsDeficit: creditCheck.deficit,
        },
        { status: 402 }
      ),
    };
  }

  return {
    ok: true,
    context: { userId: user.id, email: user.email ?? null },
  };
}

async function deductGenerationCredits(context: CreditContext | null) {
  if (!context) return null;
  return deductUserCredits(
    context.userId,
    HUMANIZE_CREDIT_COST,
    context.email
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let timeout: ReturnType<typeof setTimeout> | null = null;
  try {
    const body = (await req.json()) as AuthoringRequest;
    const action = body.action ?? "humanize";
    const creditAccess = await requireCredits(req);
    if (!creditAccess.ok) {
      // TypeScript type narrowing for discriminated union
      const failedAccess = creditAccess as { ok: false; response: NextResponse };
      return failedAccess.response;
    }

    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), HUMANIZE_TIMEOUT_MS);
    const signingSecret = getSigningSecret(apiKey);

if (action === "humanize") {
  const sourceText = readSourceText(body);
  const targetLanguage = resolveTargetLanguage(
    sourceText,
    body.tone,
    body.settings
  );
  const extraction = await extractAtomicFacts({
    sourceText,
    targetLanguage,
    apiKey,
    signal: controller.signal,
    signingSecret,
  });
  const bundle = verifyFactBundle(extraction.factBundle, signingSecret);
  const generated = await authorDocument({
    bundle,
    authorBrief: createAutomaticBrief(
      extraction.facts,
      body.tone,
      body.settings,
      body.userVoiceContext
    ),
    apiKey,
    signal: controller.signal,
  });
      
      // Apply micro-surprise only for English text
      if (targetLanguage === 'English') {
    // Step 1: Micro-surprise (token-level)
    const microSurprised = applyMicroSurprise(generated.text);
    // Step 2: Humanize post-process (structure, collocation, errors, I, conclusion)
    const humanized = applyHumanizePostProcess(microSurprised);
    generated.text = humanized;
  }
      
      const deduction = await deductGenerationCredits(creditAccess.context);
      if (deduction && !deduction.ok) {
        return NextResponse.json(
          {
            error: "Insufficient credits.",
            creditsRequired: deduction.required,
            creditsCurrent: deduction.after,
            creditsDeficit: deduction.deficit,
          },
          { status: 402 }
        );
      }

      return NextResponse.json({
        result: generated.text,
        stage: "complete",
        provenance: generated.validation,
        metrics: generated.metrics,
        architecture: {
          representation: "atomic-fact-ledger",
          planning: "automatic-brief",
          sourceAvailableToPlanner: false,
          sourceAvailableToRealizer: false,
          validatorMode: "read-only",
        },
        credits: deduction
          ? {
              cost: HUMANIZE_CREDIT_COST,
              before: deduction.before,
              remaining: deduction.after,
            }
          : undefined,
      });
    }

    if (action === "extract") {
      const sourceText = readSourceText(body);


      const extraction = await extractAtomicFacts({
        sourceText,
        targetLanguage: resolveTargetLanguage(
          sourceText,
          body.tone,
          body.settings
        ),
        apiKey,
        signal: controller.signal,
        signingSecret,
      });

      return NextResponse.json({
        stage: "author-brief",
        ...extraction,
        requiresAuthorBrief: true,
        credits: {
          costOnGenerate: HUMANIZE_CREDIT_COST,
          deducted: false,
        },
        architecture: {
          representation: "atomic-fact-ledger",
          sourceAvailableToPlanner: false,
          sourceAvailableToRealizer: false,
        },
      });
    }

    if (action !== "generate") {
      return NextResponse.json(
        { error: "Unknown authoring action." },
        { status: 400 }
      );
    }

    if (typeof body.text === "string" && body.text.trim()) {
      return NextResponse.json(
        {
          error:
            "Generation requests must not include source text. Send the signed fact bundle and author brief only.",
        },
        { status: 400 }
      );
    }
    if (typeof body.factBundle !== "string" || !body.factBundle.trim()) {
      return NextResponse.json(
        { error: "A signed fact bundle is required. Extract facts first." },
        { status: 400 }
      );
    }

    const bundle = verifyFactBundle(body.factBundle, signingSecret);
    const generated = await authorDocument({
      bundle,
      authorBrief: body.authorBrief,
      apiKey,
      signal: controller.signal,
    });
    const deduction = await deductGenerationCredits(creditAccess.context);
    if (deduction && !deduction.ok) {
      return NextResponse.json(
        {
          error: "Insufficient credits.",
          creditsRequired: deduction.required,
          creditsCurrent: deduction.after,
          creditsDeficit: deduction.deficit,
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      result: generated.text,
      stage: "complete",
      provenance: generated.validation,
      metrics: generated.metrics,
      architecture: {
        representation: "atomic-fact-ledger",
        planning: "author-brief-driven",
        sourceAvailableToPlanner: false,
        sourceAvailableToRealizer: false,
        validatorMode: "read-only",
      },
      credits: deduction
        ? {
            cost: HUMANIZE_CREDIT_COST,
            before: deduction.before,
            remaining: deduction.after,
          }
        : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Authoring pipeline timed out." },
        { status: 504 }
      );
    }
    if (error instanceof AuthoringPipelineError) {
      const status =
        error.code === "invalid-brief" ||
        error.code === "invalid-bundle" ||
        error.code === "invalid-facts"
          ? 400
          : 422;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status }
      );
    }

    console.error("Authoring pipeline failed", error);
    return NextResponse.json(
      { error: "Failed to complete the author-assisted writing pipeline." },
      { status: 500 }
    );
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
