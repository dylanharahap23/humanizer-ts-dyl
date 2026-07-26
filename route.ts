import { NextResponse } from "next/server";
import {
  HUMANIZE_CREDIT_COST,
  checkUserCredits,
  deductUserCredits,
  getBearerToken,
  getSupabaseUser,
} from "@/lib/credits/server";
import { translate as translateWithDeepLXPackage, type SourceLanguage, type TargetLanguage, type TranslateOptions } from "deeplx";
import {
  applyPythonHumanizeIndonesianPass,
  getIndonesianHumanizerConfig,
  shouldUseIndonesianHumanizer,
} from "@/lib/indonesian-humanizer";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import {
  getEnglishHumanizerConfig,
  getSystemPromptByTone,
  normalizeHumanizerTone,
  cleanupEnglishSpacing,
  type HumanizerPromptConfig,
} from "@/lib/humanizer";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Model untuk Pass 1 (utama) - gunakan Grok 4.5
const MAIN_MODEL = "qwen/qwen3-30b-a3b-instruct-2507";

const FIRST_PASS_FIDELITY_CONTRACT = [
  "FIDELITY CONTRACT:",
  "- Rewrite only what is present in the user's text.",
  "- Never invent or infer a person, relationship, profession, organization, number, statistic, quotation, example, anecdote, personal experience, opinion, motive, or outcome.",
  "- Preserve every proper name and numeric value exactly.",
  "- Preserve the original point of view and level of certainty.",
  "- You may change syntax, ordinary vocabulary, contractions, sentence openings, paragraphing, and clause order only when meaning stays identical.",
  "- Return only the rewritten text.",
].join("\n");

// Model untuk Pass 2: source-faithful rewrite
const SECOND_PASS_MODEL =
  process.env.OPENROUTER_SECOND_PASS_MODEL?.trim() ||
  "mistralai/mistral-large-2407";

const HUMANIZE_TIMEOUT_MS = Math.max(
  45_000,
  Number.parseInt(process.env.HUMANIZE_TIMEOUT_MS ?? "90000", 10) || 90_000
);
const DEEPLX_DEFAULT_URL = "https://deeplx.1stg.me/translate";

type DeepLXTargetLang = "id" | "en";

const ENGLISH_LANGUAGE_MARKERS =
  /\b(?:the|and|or|but|because|with|without|from|into|within|this|that|these|those|students?|teachers?|learning|education|technology|can|could|would|should|has|have|are|is|was|were)\b/gi;
const INDONESIAN_LANGUAGE_MARKERS =
  /\b(?:yang|dan|atau|tetapi|namun|karena|dengan|tanpa|dari|menjadi|dalam|ini|itu|siswa|guru|pembelajaran|pendidikan|teknologi|bisa|dapat|adalah|merupakan|sudah|akan)\b/gi;

function countLanguageMarkers(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

function detectInputLanguage(text: string): DeepLXTargetLang {
  const englishScore =
    countLanguageMarkers(text, ENGLISH_LANGUAGE_MARKERS) +
    countLanguageMarkers(
      text,
      /\b(?:don't|doesn't|can't|won't|it's|they're|we're|you're)\b/gi
    ) *
      2;
  const indonesianScore =
    countLanguageMarkers(text, INDONESIAN_LANGUAGE_MARKERS) +
    countLanguageMarkers(
      text,
      /\b(?:nggak|gak|udah|aja|banget|gue|aku|kamu|mereka)\b/gi
    ) *
      2;

  if (englishScore === indonesianScore) {
    return /\b(?:a|an|the|to|of|for)\b/i.test(text) ? "en" : "id";
  }

  return englishScore > indonesianScore ? "en" : "id";
}

function normalizeDeepLXTargetLang(value: unknown): DeepLXTargetLang | null {
  if (value === "id" || value === "ID" || value === "indonesian") return "id";
  if (value === "en" || value === "EN" || value === "english") return "en";
  return null;
}

function inferDeepLXTargetLang(settings: HumanizerSettings): DeepLXTargetLang | null {
  if (settings.language.endsWith("Indonesian")) return "id";
  if (settings.language.endsWith("English")) return "en";
  return null;
}

function toDeepLXLanguageCode(lang: DeepLXTargetLang): TargetLanguage {
  return lang.toUpperCase() as TargetLanguage;
}

function getDeepLXTranslateOptions(signal?: AbortSignal): TranslateOptions {
  return {
    proxyUrl: process.env.DEEPLX_PROXY_URL || undefined,
    dlSession: process.env.DEEPLX_DL_SESSION || undefined,
    skipWarm: process.env.DEEPLX_SKIP_WARM === "true",
    cookies: process.env.DEEPLX_COOKIES || undefined,
    signal,
  };
}

const DEEPLX_CHUNK_LIMIT = 1400;

function splitTextForDeepLX(text: string, limit = DEEPLX_CHUNK_LIMIT) {
  const normalized = text.trim();
  if (normalized.length <= limit) return [normalized];

  const paragraphs = normalized.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > limit) {
      pushCurrent();
      const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
      for (const sentence of sentences) {
        if (sentence.length > limit) {
          pushCurrent();
          for (let index = 0; index < sentence.length; index += limit) {
            chunks.push(sentence.slice(index, index + limit).trim());
          }
          continue;
        }

        const next = current ? `${current} ${sentence}` : sentence;
        if (next.length > limit) {
          pushCurrent();
          current = sentence;
        } else {
          current = next;
        }
      }
      continue;
    }

    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > limit) {
      pushCurrent();
      current = paragraph;
    } else {
      current = next;
    }
  }

  pushCurrent();
  return chunks;
}

async function translateChunks(
  text: string,
  translateChunk: (chunk: string) => Promise<string>
) {
  const chunks = splitTextForDeepLX(text);
  const translated: string[] = [];

  for (const chunk of chunks) {
    translated.push(await translateChunk(chunk));
  }

  return translated.join("\n\n");
}
async function translateWithDeepLXPackageProvider(
  text: string,
  targetLang: DeepLXTargetLang,
  signal?: AbortSignal
) {
  return translateChunks(text, (chunk) =>
    translateWithDeepLXPackage(
      chunk,
      toDeepLXLanguageCode(targetLang),
      "auto" as SourceLanguage,
      getDeepLXTranslateOptions(signal)
    )
  );
}
function extractDeepLXText(data: unknown): string | null {
  if (typeof data === "string") {
    const trimmed = data.trim();
    return trimmed || null;
  }

  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const directKeys = ["data", "text", "translation", "translatedText", "result"];
  for (const key of directKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const translations = record.translations;
  if (Array.isArray(translations)) {
    for (const item of translations) {
      if (!item || typeof item !== "object") continue;
      const itemRecord = item as Record<string, unknown>;
      const value = itemRecord.text ?? itemRecord.translation ?? itemRecord.translatedText;
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return null;
}

async function translateWithDeepLXHttpEndpoint(
  text: string,
  targetLang: DeepLXTargetLang,
  signal?: AbortSignal
) {
  const configuredEndpoint = process.env.DEEPLX_API_URL ?? process.env.DEEPLX_URL;
  const endpoints = Array.from(
    new Set([configuredEndpoint, DEEPLX_DEFAULT_URL].filter(Boolean) as string[])
  );
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.DEEPLX_API_KEY) {
    headers.Authorization = `Bearer ${process.env.DEEPLX_API_KEY}`;
  }

  return translateChunks(text, async (chunk) => {
    let lastError: unknown;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          signal,
          body: JSON.stringify({
            text: chunk,
            source_lang: "auto",
            target_lang: targetLang.toUpperCase(),
          }),
        });

        if (!response.ok) {
          const details = await response.text().catch(() => "");
          throw new Error(`DeepLX endpoint failed: ${response.status} ${details}`.trim());
        }

        const contentType = response.headers.get("content-type") ?? "";
        const payload = contentType.includes("application/json")
          ? await response.json()
          : await response.text();
        const translated = extractDeepLXText(payload);

        if (!translated) {
          throw new Error("DeepLX endpoint returned an empty translation");
        }

        return translated;
      } catch (error) {
        lastError = error;
        console.warn(`DeepLX endpoint ${endpoint} failed`, error);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("All DeepLX HTTP endpoints failed");
  });
}

async function translateWithDeepLX(
  text: string,
  targetLang: DeepLXTargetLang,
  signal?: AbortSignal
) {
  const provider = process.env.DEEPLX_PROVIDER?.toLowerCase();

  if (provider !== "http") {
    try {
      return await translateWithDeepLXPackageProvider(text, targetLang, signal);
    } catch (error) {
      console.warn("deeplx package provider failed; falling back to HTTP endpoint", error);
    }
  }

  return translateWithDeepLXHttpEndpoint(text, targetLang, signal);
}

async function maybeApplyDeepLXFinalPass({
  text,
  targetLang,
  enabled,
  signal,
}: {
  text: string;
  targetLang: DeepLXTargetLang | null;
  enabled: boolean;
  signal?: AbortSignal;
}) {
  if (!enabled || !targetLang || !text.trim()) {
    return { text, applied: false };
  }

  try {
    const translated = await translateWithDeepLX(text, targetLang, signal);
    return { text: translated, applied: true };
  } catch (error) {
    console.warn("DeepLX final pass skipped", error);
    return { text, applied: false };
  }
}

function shouldApplyPythonHumanizeFinalPass({
  bodyValue,
  settings,
  deepLXEnabled,
  deepLXTargetLang,
}: {
  bodyValue: unknown;
  settings: HumanizerSettings;
  deepLXEnabled: boolean;
  deepLXTargetLang: DeepLXTargetLang | null;
}) {
  if (bodyValue === false || process.env.PYTHON_HUMANIZE_FINAL_PASS === "false") {
    return false;
  }

  if (bodyValue === true) return true;

  const finalTargetLang = deepLXEnabled ? deepLXTargetLang : inferDeepLXTargetLang(settings);
  return finalTargetLang === "id";
}

function maybeApplyPythonHumanizeFinalPass({
  text,
  enabled,
}: {
  text: string;
  enabled: boolean;
}) {
  if (!enabled || !text.trim()) return { text, applied: false };

  const nextText = applyPythonHumanizeIndonesianPass(text);
  return {
    text: nextText,
    applied: nextText !== text,
  };
}

type HumanizerLanguage =
  | "Auto → Auto"
  | "Indonesian → Indonesian"
  | "Indonesian → English"
  | "English → Indonesian"
  | "English → English";

type WritingPurpose =
  | "General"
  | "Academic"
  | "Professional"
  | "Marketing"
  | "Creative";

type CreativeType =
  | "Storytelling"
  | "Fiction"
  | "Novel"
  | "Screenplay"
  | "Dialogue"
  | "Poetry";

type CreditRequestContext = {
  userId: string;
  email: string | null;
};
type HumanizerSettings = {
  language: HumanizerLanguage;
  ieltsAcademic: boolean;
  writingPurpose: WritingPurpose;
  creativeType: CreativeType;
  preserveMeaning: boolean;
  fixGrammar: boolean;
  keepFormatting: boolean;
};

const defaultSettings: HumanizerSettings = {
  language: "Auto → Auto",
  ieltsAcademic: false,
  writingPurpose: "General",
  creativeType: "Storytelling",
  preserveMeaning: true,
  fixGrammar: true,
  keepFormatting: true,
};

const languageOptions = new Set<HumanizerLanguage>([
  "Auto → Auto",
  "Indonesian → Indonesian",
  "Indonesian → English",
  "English → Indonesian",
  "English → English",
]);

const writingPurposeOptions = new Set<WritingPurpose>([
  "General",
  "Academic",
  "Professional",
  "Marketing",
  "Creative",
]);

const creativeTypeOptions = new Set<CreativeType>([
  "Storytelling",
  "Fiction",
  "Novel",
  "Screenplay",
  "Dialogue",
  "Poetry",
]);

function normalizeSettings(value: unknown): HumanizerSettings {
  if (!value || typeof value !== "object") return defaultSettings;

  const settings = value as Partial<HumanizerSettings>;
  const language = languageOptions.has(settings.language as HumanizerLanguage)
    ? (settings.language as HumanizerLanguage)
    : defaultSettings.language;
  const writingPurpose = writingPurposeOptions.has(
    settings.writingPurpose as WritingPurpose
  )
    ? (settings.writingPurpose as WritingPurpose)
    : defaultSettings.writingPurpose;
  const creativeType = creativeTypeOptions.has(settings.creativeType as CreativeType)
    ? (settings.creativeType as CreativeType)
    : defaultSettings.creativeType;
  const canUseIelts = language === "Indonesian → English";

  return {
    language,
    ieltsAcademic: canUseIelts ? settings.ieltsAcademic === true : false,
    writingPurpose,
    creativeType,
    preserveMeaning: settings.preserveMeaning !== false,
    fixGrammar: settings.fixGrammar !== false,
    keepFormatting: settings.keepFormatting !== false,
  };
}

function resolveAutoLanguage(
  settings: HumanizerSettings,
  sourceText: string
): HumanizerSettings {
  if (settings.language !== "Auto → Auto") return settings;

  return {
    ...settings,
    language:
      detectInputLanguage(sourceText) === "en"
        ? "English → English"
        : "Indonesian → Indonesian",
  };
}

function isCrossLanguageDirection(settings: HumanizerSettings) {
  return (
    settings.language === "Indonesian → English" ||
    settings.language === "English → Indonesian"
  );
}

function getConfigFromSettings(settings: HumanizerSettings, sourceText?: string): HumanizerPromptConfig {
  if (
    shouldUseIndonesianHumanizer({
      language: settings.language,
      writingPurpose: settings.writingPurpose,
    })
  ) {
    const baseConfig = getIndonesianHumanizerConfig({
      language: settings.language,
      writingPurpose: settings.writingPurpose,
    });
    const instructions = [
      baseConfig.systemPrompt,
      "",
      "APP SETTINGS:",
      `Language direction: ${settings.language}.`,
      `Writing purpose: ${settings.writingPurpose}.`,
    ];

    if (settings.ieltsAcademic) {
      instructions.push(
        "IELTS Academic Style is active, but the target output is Indonesian. Use an Indonesian academic style with equivalent clarity, structure, and maturity."
      );
    }

    if (settings.preserveMeaning) {
      instructions.push("Preserve the original meaning, intent, key facts, and citations.");
    }

    if (settings.fixGrammar) {
      instructions.push("Fix Indonesian spelling, punctuation, capitalization, OCR issues, and sentence flow.");
    }

    if (settings.keepFormatting) {
      instructions.push(
        "Keep useful formatting, but convert messy inline lists into coherent Indonesian paragraphs when that improves readability."
      );
    }

    instructions.push(
      "OUTPUT LANGUAGE CONTRACT: Return Indonesian only. Do not insert English connectors such as And, But, So, or Honestly. Return only the rewritten Indonesian text and do not add explanations."
    );

    return {
      ...baseConfig,
      systemPrompt: instructions.join("\n"),
      maxTokens: Math.max(baseConfig.maxTokens, 1800),
    };
  }

  const baseConfig = settings.ieltsAcademic
    ? getSystemPromptByTone("ielts")
    : getEnglishHumanizerConfig(sourceText ?? "", settings.writingPurpose);
  const instructions = [
    baseConfig.systemPrompt,
    "",
    "APP SETTINGS:",
    `Language direction: ${settings.language}.`,
    `Writing purpose: ${settings.writingPurpose}.`,
  ];

  if (settings.writingPurpose === "Creative") {
    instructions.push(`Creative type: ${settings.creativeType}.`);
  }

  if (settings.preserveMeaning) {
    instructions.push("Preserve the original meaning, intent, and key facts.");
  }

  if (settings.fixGrammar) {
    instructions.push("Fix grammar, punctuation, clarity, and sentence flow.");
  }

  if (settings.keepFormatting) {
    instructions.push("Preserve explicit formatting such as headings, quotations, bullets, and numbering. Ordinary prose paragraph boundaries may change when regrouping the ideas improves the rewrite.");
  }

  instructions.push(
    "OUTPUT LANGUAGE CONTRACT: Return English only. Preserve English input as English and never translate it into Indonesian. Do not insert Indonesian words or discourse markers. Return only the rewritten text and do not add explanations."
  );

  return {
    ...baseConfig,
    systemPrompt: instructions.join("\n"),
    temperature:
      settings.writingPurpose === "Creative" ? 0.85 : baseConfig.temperature,
    maxTokens: Math.max(baseConfig.maxTokens, 1600),
  };
}

function getConfigFromRequest(body: { tone?: unknown; settings?: unknown; text?: unknown }) {
  if (body.tone) {
    return getSystemPromptByTone(normalizeHumanizerTone(body.tone));
  }

  const sourceText = typeof body.text === "string" ? body.text : "";
  return getConfigFromSettings(
    resolveAutoLanguage(normalizeSettings(body.settings), sourceText),
    sourceText
  );
}

async function repairOutputLanguage({
  text,
  targetLang,
  apiKey,
  signal,
}: {
  text: string;
  targetLang: DeepLXTargetLang;
  apiKey: string;
  signal: AbortSignal;
}) {
  if (detectInputLanguage(text) === targetLang) {
    return { text, applied: false };
  }

  const targetName = targetLang === "en" ? "English" : "Indonesian";
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "DylGen AI",
    },
    signal,
    body: JSON.stringify({
      model: MAIN_MODEL,
      temperature: 0.35,
      top_p: 0.9,
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content: `Correct the candidate's output language. Return ${targetName} only, preserve its meaning, details, formatting, and natural rewritten style, and do not add an explanation.`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    console.warn("Output language repair failed", response.status);
    return { text, applied: false };
  }

  const data = await response.json();
  const repaired = data?.choices?.[0]?.message?.content;
  if (typeof repaired !== "string" || !repaired.trim()) {
    return { text, applied: false };
  }

  return { text: repaired.trim(), applied: true };
}


function countEnglishSentences(paragraph: string) {
  return paragraph
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

function splitEnglishSentencesForLedger(text: string) {
  return (
    text
      .replace(/\s+/g, " ")
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}

function formatReflectiveSourceFallback(sourceText: string) {
  const sentences = splitEnglishSentencesForLedger(sourceText);
  if (sentences.length < 6) return sourceText.trim();

  const firstCut = Math.max(2, Math.floor(sentences.length * 0.34));
  const secondCut = Math.max(
    firstCut + 1,
    Math.floor(sentences.length * 0.72)
  );

  return [
    sentences.slice(0, firstCut).join(" "),
    sentences.slice(firstCut, secondCut).join(" "),
    sentences.slice(secondCut).join(" "),
  ].join("\n\n");
}

const ENGLISH_FIDELITY_STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "because", "been", "being",
  "but", "by", "can", "could", "do", "does", "even", "for", "from", "had",
  "has", "have", "he", "her", "hers", "him", "his", "how", "i", "if", "in",
  "into", "is", "it", "its", "may", "me", "might", "more", "most", "my",
  "not", "of", "on", "or", "our", "ours", "people", "she", "should", "so",
  "some", "someone", "such", "than", "that", "the", "their", "theirs", "them",
  "they", "this", "those", "to", "us", "was", "we", "were", "what", "when",
  "which", "while", "who", "will", "with", "would", "you", "your", "yours",
]);

function getEnglishContentTokens(text: string) {
  return new Set(
    (text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? []).filter(
      (token) => token.length > 2 && !ENGLISH_FIDELITY_STOPWORDS.has(token)
    )
  );
}

const ENGLISH_SCOPE_MARKER_PATTERN =
  /\b(?:all|always|can|cannot|can't|every|few|generally|less|many|may|might|more|most|must|never|no|none|often|only|rarely|some|sometimes|usually|will|won't|would)\b/gi;

function getEnglishScopeMarkers(text: string) {
  return new Set(
    (text.match(ENGLISH_SCOPE_MARKER_PATTERN) ?? []).map((marker) =>
      marker.toLowerCase()
    )
  );
}

function preservesEnglishScope(sourceText: string, candidate: string) {
  const sourceMarkers = getEnglishScopeMarkers(sourceText);
  const candidateMarkers = getEnglishScopeMarkers(candidate);

  return (
    sourceMarkers.size === candidateMarkers.size &&
    [...sourceMarkers].every((marker) => candidateMarkers.has(marker))
  );
}
function parseReflectiveLedgerOutput(
  text: string,
  sourceSentences: string[],
  minWords: number,
  maxWords: number,
  requireOpeningClaim = false
) {
  const blocks = text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length !== 3 || sourceSentences.length === 0) return null;
  if (requireOpeningClaim && !/^\[S1(?:\s*,|\])/.test(blocks[0])) return null;

  const usedSourceIds = new Set<number>();
  const allSourceTokens = getEnglishContentTokens(sourceSentences.join(" "));
  const paragraphs: string[] = [];
  for (const block of blocks) {
    const matches = [
      ...block.matchAll(
        /\[S(\d+(?:\s*,\s*S?\d+)*)\]\s*([\s\S]*?)(?=\s*\[S\d|$)/g
      ),
    ];
    if (matches.length === 0 || block.slice(0, matches[0].index).trim()) {
      return null;
    }

    const sentences: string[] = [];
    for (const match of matches) {
      const taggedSourceIds = [
        ...new Set(
          match[1]
            .split(",")
            .map((value) => Number(value.replace(/^S/i, "").trim()))
        ),
      ];
      if (
        taggedSourceIds.some(
          (id) => !Number.isInteger(id) || id < 1 || id > sourceSentences.length
        )
      ) {
        return null;
      }

      const sourceIds = taggedSourceIds.filter((id) => !usedSourceIds.has(id));
      if (sourceIds.length === 0) continue;
      sourceIds.forEach((id) => usedSourceIds.add(id));

      const sentence = match[2].trim().replace(/([.!?])\1+$/g, "$1");
      if (!sentence) continue;

      const sourceText = sourceIds
        .map((id) => sourceSentences[id - 1])
        .join(" ");
      const outputTokens = getEnglishContentTokens(sentence);
      const sourceTokens = getEnglishContentTokens(sourceText);
      const sentenceWordCount = sentence.split(/\s+/).filter(Boolean).length;
      const sourceClaimWordCount = sourceText.split(/\s+/).filter(Boolean).length;
      const taggedOverlap = [...outputTokens].filter((token) =>
        sourceTokens.has(token)
      ).length;
      const globalOverlap = [...outputTokens].filter((token) =>
        allSourceTokens.has(token)
      ).length;
      const taggedOverlapRatio =
        outputTokens.size === 0 ? 1 : taggedOverlap / outputTokens.size;
      const globalOverlapRatio =
        outputTokens.size === 0 ? 1 : globalOverlap / outputTokens.size;
      const expandsLength =
        sentenceWordCount > Math.max(12, Math.ceil(sourceClaimWordCount * 1.35));
      const isTraceable =
        countEnglishSentences(sentence) === 1 &&
        taggedOverlapRatio >= 0.2 &&
        globalOverlapRatio >= 0.45 &&
        preservesEnglishScope(sourceText, sentence) &&
        !expandsLength;

      sentences.push(isTraceable ? sentence : sourceText);
    }

    if (sentences.length === 0) return null;
    paragraphs.push(sentences.join(" "));
  }

  if (usedSourceIds.size !== sourceSentences.length) return null;

  const result = paragraphs.join("\n\n");
  const wordCount = result.split(/\s+/).filter(Boolean).length;
  return wordCount >= minWords && wordCount <= maxWords ? result : null;
}

function getEnglishParagraphShape(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      sentences: countEnglishSentences(paragraph),
      words: paragraph.split(/\s+/).filter(Boolean).length,
    }));
}

function hasExplicitEnglishFormatting(text: string) {
  return /^(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s+)/m.test(text);
}

function hasSourceStructureEcho(sourceText: string, candidate: string) {
  if (
    hasExplicitEnglishFormatting(sourceText) ||
    hasExplicitEnglishFormatting(candidate)
  ) {
    return false;
  }

  const sourceShape = getEnglishParagraphShape(sourceText);
  const candidateShape = getEnglishParagraphShape(candidate);

  if (
    sourceShape.length < 2 ||
    sourceShape.length !== candidateShape.length
  ) {
    return false;
  }

  const sourceWordCount = sourceShape.reduce(
    (sum, paragraph) => sum + paragraph.words,
    0
  );
  const candidateWordCount = candidateShape.reduce(
    (sum, paragraph) => sum + paragraph.words,
    0
  );
  const sentenceDistance = sourceShape.reduce(
    (total, sourceParagraph, index) =>
      total +
      Math.abs(sourceParagraph.sentences - candidateShape[index].sentences),
    0
  );
  const paragraphSizeMovesTogether = sourceShape.every(
    (sourceParagraph, index) => {
      const candidateParagraph = candidateShape[index];
      const sourceShare = sourceParagraph.words / sourceWordCount;
      const candidateShare = candidateParagraph.words / candidateWordCount;
      return Math.abs(sourceShare - candidateShare) <= 0.08;
    }
  );

  return sentenceDistance <= sourceShape.length && paragraphSizeMovesTogether;
}

function addsUnsupportedPersonalAddress(
  sourceText: string,
  candidate: string,
  allowSecondPerson = false
) {
  const sourceHasFirstPerson =
    /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(sourceText);
  const sourceHasSecondPerson = /\b(?:you|your|yours)\b/i.test(sourceText);
  const candidateHasFirstPerson =
    /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(candidate);
  const candidateHasSecondPerson = /\b(?:you|your|yours)\b/i.test(candidate);

  return (
    (!sourceHasFirstPerson && candidateHasFirstPerson) ||
    (!allowSecondPerson &&
      !sourceHasSecondPerson &&
      candidateHasSecondPerson)
  );
}
const SENSITIVE_ANCHOR_PATTERN =
  /\b(?:Prophet Muhammad|Qur(?:'|’)?an|hadiths?|haram|halal|duff|Hanbali|Maliki|Shafi(?:'|’)?i|Hanafi|Islamic jurisprudence|Allah)\b/gi;

function collectSensitiveAnchors(text: string) {
  const terms = text.match(SENSITIVE_ANCHOR_PATTERN) ?? [];
  const references = text.match(/\b\d{1,3}:\d{1,3}\b/g) ?? [];

  return new Set(
    [...terms, ...references].map((value) =>
      value.toLowerCase().replace(/[’]/g, "'")
    )
  );
}

function losesSensitiveAnchors(sourceText: string, candidate: string) {
  const sourceAnchors = collectSensitiveAnchors(sourceText);
  const candidateAnchors = collectSensitiveAnchors(candidate);

  return [...sourceAnchors].some((anchor) => !candidateAnchors.has(anchor));
}

const SENSITIVE_ADDED_DETAIL_PATTERN =
  /\b(?:weddings?|Eid|sunnah|hukm|maqasid|linguistic nuances?|doctrinal considerations?|historical application|objectives? of Islamic law)\b/gi;

function collectSensitiveAddedDetails(text: string) {
  return new Set(
    (text.match(SENSITIVE_ADDED_DETAIL_PATTERN) ?? []).map((value) =>
      value.toLowerCase()
    )
  );
}

function addsUnsupportedSensitiveDetails(sourceText: string, candidate: string) {
  const sourceDetails = collectSensitiveAddedDetails(sourceText);
  const candidateDetails = collectSensitiveAddedDetails(candidate);

  return [...candidateDetails].some((detail) => !sourceDetails.has(detail));
}

async function repairSensitiveEnglishFidelity({
  candidate,
  sourceText,
  tone,
  apiKey,
  signal,
}: {
  candidate: string;
  sourceText: string;
  tone: HumanizerPromptConfig["postProcessTone"];
  apiKey: string;
  signal: AbortSignal;
}) {
  if (tone !== "english-sensitive") {
    return { text: candidate, applied: false };
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "DylGen AI",
    },
    signal,
    body: JSON.stringify({
      model: MAIN_MODEL,
      temperature: 0.4,
      top_p: 0.9,
      max_tokens: 1800,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      messages: [
        {
          role: "system",
          content: `Perform a source-fidelity editorial pass on a sensitive English passage. Return a corrected rewrite, not an audit or explanation.

The SOURCE is authoritative. The CANDIDATE may contain unsupported additions or altered emphasis.

Rules:
- Preserve every quotation, citation, honorific, named school or authority, technical or religious term, markdown emphasis, attribution, exception, and qualification found in the source.
- Preserve the exact distinction between what the report directly says and what scholars infer from it.
- Preserve majority/minority attribution and the force of the source's direct answer.
- Remove any occasion, objective, example, ruling, context, or conclusion that appears only in the candidate. Correct only the unsupported portion; do not discard otherwise valid restructuring.
- Do not replace a general phrase with a more specific familiar detail unless that detail appears in the source.
- Keep modal strength unchanged. Words such as may, can, generally, requires, prohibits, and is insufficient must not be strengthened or weakened.
- Produce a substantive editorial rewrite rather than returning the source verbatim. Keep legitimate reordering from the candidate, merge or split sentences where the claim ledger permits, and use plain English without mirroring the source paragraph skeleton.
- Do not add first-person testimony, direct reader address, rhetorical questions, casual filler, or deliberate errors.
- Return English only.`,
        },
        {
          role: "user",
          content: `SOURCE:
${sourceText}

CANDIDATE:
${candidate}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.warn("Sensitive English fidelity repair failed", response.status);
    return { text: candidate, applied: false };
  }

  const data = await response.json();
  const repaired = data?.choices?.[0]?.message?.content;
  if (typeof repaired !== "string" || !repaired.trim()) {
    return { text: candidate, applied: false };
  }

  const repairedText = repaired.trim();
  if (
    addsUnsupportedPersonalAddress(sourceText, repairedText) ||
    losesSensitiveAnchors(sourceText, repairedText) ||
    addsUnsupportedSensitiveDetails(sourceText, repairedText)
  ) {
    console.warn(
      "Sensitive English fidelity repair rejected: source anchors or details changed"
    );

    const originalCandidateIsSafe =
      !addsUnsupportedPersonalAddress(sourceText, candidate) &&
      !losesSensitiveAnchors(sourceText, candidate) &&
      !addsUnsupportedSensitiveDetails(sourceText, candidate);

    return {
      text: originalCandidateIsSafe ? candidate : sourceText,
      applied: false,
    };
  }

  return { text: repairedText, applied: true };
}

// ============================================================
// PASS 2: CONVERSATIONAL HUMANIZATION
// ============================================================

function shouldUseConversationalSecondPass(
  tone: HumanizerPromptConfig["postProcessTone"]
): boolean {
  return (
    tone === "english-general" ||
    tone === "english-expository" ||
    tone === "english-discursive" ||
    tone === "english-reflective" ||
    tone === "english-argument" ||
    tone === "english-practical" ||
    tone === "english-policy" ||
    tone === "english-consumer"
  );
}

const FAITHFUL_SECOND_PASS_PROMPT = [
  "Rewrite the English text naturally while preserving its meaning exactly.",
  "",
  "SOURCE FIDELITY (highest priority):",
  "- Treat the SOURCE TEXT as authoritative. The draft is only a wording reference.",
  "- Preserve every claim, name, number, profession, relationship, example, comparison, qualification, and degree of certainty.",
  "- Do not add facts, people, anecdotes, personal experience, statistics, locations, occupations, opinions, advice, assumptions, or outside knowledge.",
  "- Keep the same point of view. Do not introduce I, we, you, or a narrator unless the source already uses that perspective.",
  "- Do not turn possibilities into facts, strengthen weak claims, or infer motives and outcomes.",
  "",
  "ALLOWED EDITS:",
  "- Change sentence structure and ordinary vocabulary without changing meaning.",
  "- Use natural contractions where the register allows them.",
  "- Reorder clauses only when their logical relationship remains identical.",
  "- Vary sentence openings and paragraph lengths gently.",
  "- Use at most two light discourse markers such as Well, Still, or Honestly, and only when they do not add an opinion.",
  "",
  "DO NOT:",
  "- Invent a cousin, friend, job, company, number, quotation, failure, success, or personal reaction.",
  "- Add rhetorical questions unless the source already contains a question.",
  "- Add deliberate typos, fragments, run-ons, repeated words, fake memories, or random tangents.",
  "- Drop source information merely to make the text shorter.",
  "- Add a new conclusion or moral lesson.",
  "",
  "Keep the result close to the source length and return only the rewritten text.",
].join("\n");

function buildConversationalSecondPassPrompt(
  _tone: HumanizerPromptConfig["postProcessTone"],
  _sourceText?: string
): string {
  return FAITHFUL_SECOND_PASS_PROMPT;
}

function preserveResearchHedge(sourceText: string, candidate: string) {
  if (!/\bresearch suggests\b/i.test(sourceText)) return candidate;

  return candidate.replace(
    /\b(?:research|studies) (?:clearly |consistently |keep )?(?:shows?|proves?)\b/gi,
    (match) => (/^[A-Z]/.test(match) ? "Research suggests" : "research suggests")
  );
}
function collectNumericTokens(text: string): string[] {
  return (text.match(/\b\d+(?:[.,]\d+)*(?:%|\b)/g) ?? []).map((token) =>
    token.toLowerCase()
  );
}

function collectMultiwordProperNames(text: string): string[] {
  const ignoredOpeners = new Set([
    "a", "an", "the", "this", "that", "these", "those", "many", "some",
    "most", "another", "finally", "however", "because", "although", "while",
  ]);

  return (text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) ?? [])
    .map((name) => name.trim())
    .filter((name) => !ignoredOpeners.has(name.split(/\s+/)[0].toLowerCase()));
}

function valuesOutsideSource(sourceValues: string[], candidateValues: string[]): string[] {
  const sourceSet = new Set(sourceValues.map((value) => value.toLowerCase()));
  return [...new Set(candidateValues.filter((value) => !sourceSet.has(value.toLowerCase())))];
}

function getConversationalFidelityIssues(
  sourceText: string,
  candidate: string,
  _allowSecondPerson = false
) {
  const issues: string[] = [];

  const sourceHasFirstPerson = /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(sourceText);
  const candidateHasFirstPerson = /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(candidate);
  if (!sourceHasFirstPerson && candidateHasFirstPerson) {
    issues.push("invented-first-person");
  }

  const sourceHasSecondPerson = /\b(?:you|your|yours|yourself|yourselves)\b/i.test(sourceText);
  const candidateWithoutDiscourseYouKnow = candidate.replace(/\byou know\b/gi, "");
  if (
    !sourceHasSecondPerson &&
    /\b(?:you|your|yours|yourself|yourselves)\b/i.test(candidateWithoutDiscourseYouKnow)
  ) {
    issues.push("invented-second-person");
  }

  if (!/\?/.test(sourceText) && /\?/.test(candidate)) {
    issues.push("rhetorical-question");
  }

  const sourceNumbers = collectNumericTokens(sourceText);
  const candidateNumbers = collectNumericTokens(candidate);
  if (valuesOutsideSource(sourceNumbers, candidateNumbers).length > 0) {
    issues.push("outside-number");
  }
  if (valuesOutsideSource(candidateNumbers, sourceNumbers).length > 0) {
    issues.push("missing-number");
  }

  const sourceNames = collectMultiwordProperNames(sourceText);
  const candidateNames = collectMultiwordProperNames(candidate);
  if (valuesOutsideSource(sourceNames, candidateNames).length > 0) {
    issues.push("outside-name");
  }
  if (valuesOutsideSource(candidateNames, sourceNames).length > 0) {
    issues.push("missing-name");
  }

  const relationshipPattern =
    /\b(?:cousin|uncle|aunt|friend|neighbor|neighbour|mother|father|mom|mum|dad|sister|brother|wife|husband)\b/gi;
  const professionPattern =
    /\b(?:CEO|nurse|nursing|doctor|physician|engineer|lawyer|teacher|professor|accountant|entrepreneur|manager)\b/gi;
  const sourceRelationships = sourceText.match(relationshipPattern) ?? [];
  const candidateRelationships = candidate.match(relationshipPattern) ?? [];
  const sourceProfessions = sourceText.match(professionPattern) ?? [];
  const candidateProfessions = candidate.match(professionPattern) ?? [];
  if (valuesOutsideSource(sourceRelationships, candidateRelationships).length > 0) {
    issues.push("outside-relationship");
  }
  if (valuesOutsideSource(sourceProfessions, candidateProfessions).length > 0) {
    issues.push("outside-profession");
  }

  const certaintyPattern =
    /\b(?:obviously|clearly|definitely|certainly|undoubtedly|probably|presumably)\b/gi;
  const sourceCertainty = sourceText.match(certaintyPattern) ?? [];
  const candidateCertainty = candidate.match(certaintyPattern) ?? [];
  if (valuesOutsideSource(sourceCertainty, candidateCertainty).length > 0) {
    issues.push("invented-certainty");
  }

  const fillerMatches =
    candidate.match(/\b(?:you know|I mean|let's be real|here's the thing|honestly|well)\b/gi) ?? [];
  if (fillerMatches.length > 2) {
    issues.push("excessive-filler");
  }

  const promotionalFraming =
    /\b(?:the real magic|full of potential|the real difference[- ]maker|no surprise there|at the end of the day)\b/i;
  if (!promotionalFraming.test(sourceText) && promotionalFraming.test(candidate)) {
    issues.push("promotional-framing");
  }

  const markdownEmphasis = /(?:\*\*|__|\*)[^\n*]+(?:\*\*|__|\*)/;
  if (!markdownEmphasis.test(sourceText) && markdownEmphasis.test(candidate)) {
    issues.push("invented-emphasis");
  }

  const sourceUsesResearchHedge = /\bresearch suggests\b/i.test(sourceText);
  const candidateStrengthensResearch =
    /\b(?:research|studies) (?:clearly |consistently |keep )?(?:shows?|proves?)\b/i.test(candidate);
  if (sourceUsesResearchHedge && candidateStrengthensResearch) {
    issues.push("strengthened-research-claim");
  }

  return [...new Set(issues)];
}

type PolicyAnchor = {
  name: string;
  pattern: RegExp;
};

const POLICY_ANCHORS: PolicyAnchor[] = [
  { name: "Benjamin Netanyahu", pattern: /\b(?:Benjamin\s+)?Netanyahu\b/i },
  {
    name: "International Criminal Court",
    pattern: /\b(?:International Criminal Court|ICC)\b/i,
  },
  { name: "Rome Statute", pattern: /\bRome Statute\b/i },
  { name: "Israel", pattern: /\bIsrael(?:i)?\b/i },
  {
    name: "Palestinian territories",
    pattern: /\bPalestinian territor(?:y|ies)\b/i,
  },
  { name: "The Hague", pattern: /\bThe Hague\b/i },
];

type PolicyClaimAnchor = {
  name: string;
  source: RegExp;
  candidate: RegExp;
  partialCandidate?: RegExp;
};

const POLICY_CLAIM_ANCHORS: PolicyClaimAnchor[] = [
  {
    name: "government cooperation conditions",
    source: /\bgovernments? are willing and legally able to cooperate\b/i,
    candidate:
      /\bgovernments?\b[^.!?]{0,60}\bwilling\b[^.!?]{0,40}\blegally able\b[^.!?]{0,40}\bcooperate\b/i,
  },
  {
    name: "nationals",
    source: /\bnationals\b/i,
    candidate: /\bnationals\b/i,
  },
  {
    name: "military relationships",
    source: /\bmilitary\b/i,
    candidate: /\bmilitary\b/i,
  },
  {
    name: "past non-enforcement",
    source: /\bfailed to execute ICC warrants? against other leaders\b/i,
    candidate:
      /\b(?:failed|did not|haven't|have not)\b[^.!?]{0,80}\b(?:execute|enforce|carry out)\b[^.!?]{0,80}\bwarrants?\b[^.!?]{0,80}\bother leaders\b[^.!?]{0,80}\bdespite (?:their )?treaty obligations?\b/i,
    partialCandidate:
      /\bStates have sometimes (?:failed|declined|refused|not been willing)[^.]*\b(?:execute|enforce|carry out)[^.]*\bwarrants?\b[^.]*\bother leaders\b[^.]*\./i,
  },
  {
    name: "structural limitation",
    source: /\bstructural limitations?\b/i,
    candidate: /\b(?:structural|fundamental) (?:limitations?|weakness(?:es)?)\b/i,
  },
  {
    name: "extended period at liberty",
    source: /\bremain at liberty for extended periods\b/i,
    candidate:
      /(?:\b(?:remain|stay)\b[^.!?]{0,40}\b(?:at liberty|free)\b[^.!?]{0,40}\b(?:extended|long) periods?\b|\b(?:people|individuals)\b[^.!?]{0,50}\bwarrants?\b[^.!?]{0,30}\bremain free\b)/i,
  },
];
const POLICY_OUTSIDE_DETAIL_PATTERNS: PolicyAnchor[] = [
  { name: "war crimes", pattern: /\bwar crimes?\b/i },
  {
    name: "crimes against humanity",
    pattern: /\bcrimes? against humanity\b/i,
  },
  { name: "genocide", pattern: /\bgenocide\b/i },
  { name: "Vladimir Putin", pattern: /\b(?:Vladimir\s+)?Putin\b/i },
  { name: "South Africa", pattern: /\bSouth Africa\b/i },
  { name: "Omar al-Bashir", pattern: /\bOmar al-Bashir\b/i },
];

const CONSUMER_ANCHORS: PolicyAnchor[] = [
  { name: "ownership horizon", pattern: /\b(?:10-year|ten years|10 years|a decade)\b/i },
  {
    name: "manufacturer stability",
    pattern: /\b(?:financial stability|financial strength|financial health|remain profitable|stay in business|remain in business)\b/i,
  },
  { name: "replacement parts", pattern: /\b(?:replacement |spare )?parts\b/i },
  { name: "software updates", pattern: /\bsoftware updates?\b/i },
  { name: "warranty", pattern: /\bwarranty\b/i },
  { name: "resale value", pattern: /\bresale values?\b/i },
  { name: "dealer network", pattern: /\bdealer networks?\b/i },
  { name: "trained technicians", pattern: /\btrained technicians?\b/i },
  { name: "battery diagnostics", pattern: /\bbattery (?:diagnostics?|checks?)\b/i },
  { name: "repair delay", pattern: /\b(?:waiting times?|take longer)\b/i },
  { name: "global leadership", pattern: /\bglobal leaders?\b/i },
  { name: "battery production", pattern: /\bbattery production\b/i },
  { name: "service network", pattern: /\b(?:international )?service networks?\b/i },
];

const CONSUMER_OUTSIDE_DETAIL_PATTERNS: PolicyAnchor[] = [
  {
    name: "outside vehicle brand or model",
    pattern: /\b(?:BYD|BYD Seal|MG4|NIO|XPeng|Ora|Geely|Tesla)\b/i,
  },
];

function getConsumerFidelityIssues(sourceText: string, candidate: string) {
  const issues: string[] = [];

  for (const anchor of CONSUMER_ANCHORS) {
    if (anchor.pattern.test(sourceText) && !anchor.pattern.test(candidate)) {
      issues.push(`missing-consumer-anchor:${anchor.name}`);
    }
  }

  for (const detail of CONSUMER_OUTSIDE_DETAIL_PATTERNS) {
    if (!detail.pattern.test(sourceText) && detail.pattern.test(candidate)) {
      issues.push(`outside-consumer-detail:${detail.name}`);
    }
  }

  return issues;
}

function getPolicyFidelityIssues(sourceText: string, candidate: string) {
  const issues: string[] = [];

  for (const anchor of POLICY_ANCHORS) {
    if (anchor.pattern.test(sourceText) && !anchor.pattern.test(candidate)) {
      issues.push(`missing-policy-anchor:${anchor.name}`);
    }
  }

  for (const claim of POLICY_CLAIM_ANCHORS) {
    if (claim.source.test(sourceText) && !claim.candidate.test(candidate)) {
      issues.push(`missing-policy-claim:${claim.name}`);
    }
  }
  for (const detail of POLICY_OUTSIDE_DETAIL_PATTERNS) {
    if (!detail.pattern.test(sourceText) && detail.pattern.test(candidate)) {
      issues.push(`outside-policy-detail:${detail.name}`);
    }
  }

  const unsupportedWarrantConditional = /\beven if (?:an|the) warrant were issued\b/i;
  if (
    !unsupportedWarrantConditional.test(sourceText) &&
    unsupportedWarrantConditional.test(candidate)
  ) {
    issues.push("outside-policy-warrant-conditional");
  }
  const opinionPattern =
    /\b(?:absurd|obvious(?:ly)?|double standards?|honestly|no surprise|ridiculous)\b/i;
  if (!opinionPattern.test(sourceText) && opinionPattern.test(candidate)) {
    issues.push("outside-policy-opinion");
  }

  return issues;
}
const CONSUMER_RESTORATION_RULES: Array<{
  anchors: string[];
  sourceSentence: RegExp;
  restoration?: string;
  target: "opening" | "middle" | "closing";
}> = [
  {
    anchors: ["ownership horizon"],
    sourceSentence: /\b(?:10-year ownership period|next 10 years)\b/i,
    target: "opening",
  },
  {
    anchors: ["manufacturer stability"],
    sourceSentence: /\bfinancial stability of EV manufacturers\b/i,
    target: "opening",
  },
  {
    anchors: ["replacement parts", "software updates", "warranty"],
    sourceSentence:
      /\bIf a manufacturer exits the market or significantly reduces operations\b/i,
    target: "opening",
  },
  {
    anchors: ["resale value"],
    sourceSentence: /\bmay feel technologically outdated\b/i,
    target: "middle",
  },
  {
    anchors: ["dealer network"],
    sourceSentence: /\bA reliable long-term ownership experience requires\b/i,
    restoration: "An established dealer network is part of reliable long-term ownership.",
    target: "middle",
  },
  {
    anchors: ["trained technicians"],
    sourceSentence: /\bA reliable long-term ownership experience requires\b/i,
    restoration: "Reliable long-term support also requires trained technicians.",
    target: "middle",
  },
  {
    anchors: ["battery diagnostics"],
    sourceSentence: /\bA reliable long-term ownership experience requires\b/i,
    restoration: "Accessible battery diagnostics are part of reliable long-term support.",
    target: "middle",
  },
  {
    anchors: ["repair delay"],
    sourceSentence: /\brepair costs and waiting times may increase\b/i,
    target: "middle",
  },
  {
    anchors: ["global leadership"],
    sourceSentence: /\bglobal leaders in battery technology\b/i,
    target: "closing",
  },
  {
    anchors: ["battery production", "service network"],
    sourceSentence: /\bvertically integrated battery production\b/i,
    target: "closing",
  },
];

function restoreMissingConsumerClaims(sourceText: string, candidate: string) {
  const missingAnchors = new Set(
    CONSUMER_ANCHORS.filter(
      (anchor) =>
        anchor.pattern.test(sourceText) && !anchor.pattern.test(candidate),
    ).map((anchor) => anchor.name),
  );
  if (missingAnchors.size === 0) return candidate;

  const sourceSentences = splitCompleteEnglishSentences(sourceText);
  const restorations = {
    opening: new Set<string>(),
    middle: new Set<string>(),
    closing: new Set<string>(),
  };

  for (const rule of CONSUMER_RESTORATION_RULES) {
    if (!rule.anchors.some((anchor) => missingAnchors.has(anchor))) continue;
    const sourceSentence = sourceSentences.find((sentence) =>
      rule.sourceSentence.test(sentence),
    );
    if (sourceSentence) restorations[rule.target].add(rule.restoration ?? sourceSentence);
  }

  const paragraphs = candidate
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return candidate;

  const appendRestorations = (index: number, additions: Set<string>) => {
    if (additions.size === 0) return;
    paragraphs[index] = `${paragraphs[index]} ${[...additions].join(" ")}`.trim();
  };

  appendRestorations(0, restorations.opening);
  appendRestorations(paragraphs.length >= 3 ? 1 : 0, restorations.middle);
  appendRestorations(paragraphs.length - 1, restorations.closing);
  return paragraphs.join("\n\n");
}

function restoreMissingPolicyClaims(sourceText: string, candidate: string) {
  const missingClaims = POLICY_CLAIM_ANCHORS.filter(
    (claim) => claim.source.test(sourceText) && !claim.candidate.test(candidate)
  );
  if (missingClaims.length === 0) return candidate;

  const sourceSentences = splitCompleteEnglishSentences(sourceText);
  const openingAdditions = new Set<string>();
  const closingAdditions = new Set<string>();
  let restoredCandidate = candidate;
  let replacedPartialClaim = false;
  for (const claim of missingClaims) {
    const sourceSentence = sourceSentences.find((sentence) =>
      claim.source.test(sentence)
    );
    if (!sourceSentence) continue;
    if (
      claim.partialCandidate &&
      claim.partialCandidate.test(restoredCandidate)
    ) {
      restoredCandidate = restoredCandidate.replace(
        claim.partialCandidate,
        sourceSentence
      );
      replacedPartialClaim = true;
      continue;
    }
    if (claim.name === "government cooperation conditions") {
      openingAdditions.add(sourceSentence);
    } else {
      closingAdditions.add(sourceSentence);
    }
  }
  if (
    !replacedPartialClaim &&
    openingAdditions.size === 0 &&
    closingAdditions.size === 0
  ) {
    return candidate;
  }

  const paragraphs = restoredCandidate
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return candidate;

  if (openingAdditions.size > 0) {
    paragraphs[0] = `${paragraphs[0]} ${[...openingAdditions].join(" ")}`.trim();
  }
  if (closingAdditions.size > 0) {
    const lastIndex = paragraphs.length - 1;
    paragraphs[lastIndex] = `${paragraphs[lastIndex]} ${[
      ...closingAdditions,
    ].join(" ")}`.trim();
  }
  return paragraphs.join("\n\n");
}
function hasUnsupportedConversationalAdditions(
  sourceText: string,
  candidate: string
) {
  return getConversationalFidelityIssues(sourceText, candidate).length > 0;
}

function splitCompleteEnglishSentences(text: string) {
  return (
    text.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map((sentence) => sentence.trim()) ??
    []
  ).filter(Boolean);
}

function removeUnsupportedMeasuredClaims(sourceText: string, candidate: string) {
  const sourceLower = sourceText.toLowerCase();
  const unsupportedMeasure =
    /\b(?:a few|several|a couple of|\d+(?:\.\d+)?)\s+(days?|weeks?|months?|years?|hours?|minutes?|miles?|kilometers?|kilometres?|dollars?|pounds?|euros?)\b|\b(?:for|within|over)\s+(?:a few\s+|several\s+|\d+(?:\.\d+)?\s+)?(days?|weeks?|months?|years?|hours?|minutes?)\b/i;

  return candidate
    .split(/\n\s*\n+/)
    .map((paragraph) =>
      splitCompleteEnglishSentences(paragraph)
        .filter((sentence) => {
          const match = sentence.match(unsupportedMeasure);
          if (!match) return true;
          const unit = (match[1] ?? match[2] ?? "").toLowerCase();
          return unit.length > 0 && sourceLower.includes(unit);
        })
        .join(" ")
    )
    .filter(Boolean)
    .join("\n\n");
}

function recomposeArgumentAroundJudgment(
  sourceText: string,
  candidate: string,
  tone: HumanizerPromptConfig["postProcessTone"]
) {
  if (tone !== "english-argument") return candidate;

  const sourceUsesBalancedFrame =
    /\b(?:on the one hand|on the other hand|although|while|however|therefore)\b/i.test(
      sourceText
    );
  if (!sourceUsesBalancedFrame) return candidate;

  const paragraphs = candidate
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  if (paragraphs.length < 3) return candidate;

  const judgmentPattern =
    /\b(?:should(?:n't| not)|must(?:n't| not)|unwise|bad (?:financial )?decision|not worth|better to|rather than|cannot justify|can't justify|outweighs?)\b/i;
  const judgmentIndex = paragraphs.findIndex(
    (paragraph, index) => index > 0 && judgmentPattern.test(paragraph)
  );
  if (judgmentIndex < 1) return candidate;

  const judgmentSentences = splitCompleteEnglishSentences(
    paragraphs[judgmentIndex]
  );
  if (judgmentSentences.length < 2) return candidate;

  const openingCount = Math.min(2, judgmentSentences.length - 1);
  let opening = judgmentSentences
    .slice(0, openingCount)
    .join(" ")
    .replace(/^\s*(?:But|However|On the other hand),?\s+/i, "")
    .replace(/^([a-z])/, (letter) => letter.toUpperCase());
  const closing = judgmentSentences.slice(openingCount).join(" ");

  const concessionParagraphs = paragraphs.filter(
    (_, index) => index !== judgmentIndex
  );
  const firstOpeningSentence = splitCompleteEnglishSentences(opening)[0] ?? "";
  const hasDanglingOpeningReference =
    /\b(?:the|this|that)\s+(?:event|tournament|proposal|policy|choice|decision|practice|idea|approach|plan|claim)\b|\bto go\b|^(?:It|They|This|That)\b/i.test(
      firstOpeningSentence
    );

  if (hasDanglingOpeningReference && concessionParagraphs.length > 0) {
    const contextSentences = splitCompleteEnglishSentences(
      concessionParagraphs[0]
    );
    if (contextSentences.length > 1) {
      opening = `${contextSentences[0]} ${opening}`;
      concessionParagraphs[0] = contextSentences.slice(1).join(" ");
    }
  }

  const concession = concessionParagraphs.filter(Boolean).join(" ");
  return [opening, concession, closing].filter(Boolean).join("\n\n");
}

function buildSafeEnglishFallback(
  sourceText: string,
  tone: HumanizerPromptConfig["postProcessTone"]
) {
  // REMOVED: finalHumanize was creating predictable fingerprint
  // Just return the original source text cleaned up
  const editedSource = cleanupEnglishSpacing(sourceText);
  return hasUnsupportedConversationalAdditions(sourceText, editedSource)
    ? sourceText.trim()
    : editedSource;
}

async function applyConversationalSecondPass({
  text,
  sourceText,
  tone,
  apiKey,
  signal,
}: {
  text: string;
  sourceText: string;
  tone: HumanizerPromptConfig["postProcessTone"];
  apiKey: string;
  signal: AbortSignal;
}): Promise<{ text: string; applied: boolean }> {
  if (!shouldUseConversationalSecondPass(tone)) {
    return { text, applied: false };
  }

  const sourceWordCount = sourceText.split(/\s+/).filter(Boolean).length;
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "DylGen AI",
    },
    signal,
    body: JSON.stringify({
      model: SECOND_PASS_MODEL,
      temperature: 0.45,
      top_p: 0.88,
      max_tokens: Math.max(900, Math.ceil(sourceWordCount * 2.2)),
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1.02,
      messages: [
        {
          role: "system",
          content: buildConversationalSecondPassPrompt(tone, sourceText),
        },
        {
          role: "user",
          content:
            "SOURCE TEXT (the only authority for meaning and details):\n" +
            sourceText +
            "\n\nPASS 1 DRAFT (use only as a wording option; discard any detail absent from the source):\n" +
            text,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.warn("Faithful second pass failed", response.status);
    return { text, applied: false };
  }

  const data = await response.json();
  const rewritten = data?.choices?.[0]?.message?.content;
  if (typeof rewritten !== "string" || !rewritten.trim()) {
    return { text, applied: false };
  }

  const cleaned = preserveResearchHedge(
    sourceText,
    cleanupEnglishSpacing(rewritten.trim())
  );
  const outputWordCount = cleaned.split(/\s+/).filter(Boolean).length;
  const lengthRatio = sourceWordCount === 0 ? 1 : outputWordCount / sourceWordCount;
  const fidelityIssues = getConversationalFidelityIssues(sourceText, cleaned, false);

  if (
    cleaned.length < 20 ||
    lengthRatio < 0.72 ||
    lengthRatio > 1.18 ||
    fidelityIssues.length > 0
  ) {
    console.warn("Faithful second pass rejected", {
      lengthRatio: Number(lengthRatio.toFixed(2)),
      fidelityIssues,
    });
    return { text, applied: false };
  }

  return { text: cleaned, applied: true };
}

function needsEnglishStyleRepair(
  _candidate: string,
  _sourceText: string,
  tone: HumanizerPromptConfig["postProcessTone"]
) {
  return tone.startsWith("english-");   // ← PERBAIKAN: Aktif untuk semua English tones
}

async function repairEnglishStyle({
  candidate,
  sourceText,
  tone,
  apiKey,
  signal,
}: {
  candidate: string;
  sourceText: string;
  tone: HumanizerPromptConfig["postProcessTone"];
  apiKey: string;
  signal: AbortSignal;
}) {
  if (!needsEnglishStyleRepair(candidate, sourceText, tone)) {
    return { text: candidate, applied: false };
  }

  const sourceSentences = splitEnglishSentencesForLedger(sourceText);
  const usesSourceLedger = tone === "english-sensitive" && sourceSentences.length >= 6;

  const sourceParagraphCount = getEnglishParagraphShape(sourceText).length;
  const candidateParagraphCount = getEnglishParagraphShape(candidate).length;
  const mirrorsSourceStructure = hasSourceStructureEcho(sourceText, candidate);
  const sourceSentenceLedger = sourceSentences
    .map((sentence, index) => `[S${index + 1}] ${sentence}`)
    .join("\n");
  const sourceWordCount = sourceText.trim().split(/\s+/).filter(Boolean).length;
  const reflectiveMinWords = Math.max(80, Math.floor(sourceWordCount * 0.78));
  const reflectiveMaxWords = Math.max(
    reflectiveMinWords,
    Math.ceil(sourceWordCount * 1.15)
  );
  const alternativeParagraphCount =
    sourceParagraphCount <= 2 ? sourceParagraphCount + 1 : sourceParagraphCount - 1;
  const structureDirective =
    usesSourceLedger
      ? `Return exactly three coherent prose paragraphs with visibly different sentence counts and ${reflectiveMinWords}-${reflectiveMaxWords} words total. Merge related causes instead of assigning one factor to each paragraph. Do not add a separate recap paragraph; end on the final substantive claim from the source.`
      : mirrorsSourceStructure
        ? `The source has ${sourceParagraphCount} prose paragraphs and the candidate has ${candidateParagraphCount}. Return exactly ${alternativeParagraphCount} coherent prose paragraphs so the revision no longer mirrors that skeleton.`
        : "Regroup the prose according to its ideas; do not target equal paragraph or sentence lengths.";
  const voiceDirective =
    tone === "english-sensitive"
      ? "Preserve the source point of view and do not add personal address, rhetorical questions, or casual filler."
      : "Preserve the source point of view. Use contractions only when natural. Do not add I, we, you, rhetorical questions, anecdotes, or opinions unless the source already uses them.";
  const repairTaskDirective =
    usesSourceLedger      ? "Write a fresh revision from the SOURCE CLAIM LEDGER only. Do not reuse or expand the previous candidate."
      : "Revise the candidate once because it is too uniform, formulaic, or structurally close to the source.";
  const ledgerFormatDirective =
    usesSourceLedger
      ? `INTERNAL OUTPUT FORMAT (required): Return exactly three blocks separated by one blank line. Put each sentence on its own line and begin it with the source IDs that support it, for example [S1] or [S2,S3]. Use only IDs S1-S${sourceSentences.length}. Do not write headings, bullets, or any text without a source tag. The tags will be removed before the user sees the result.`
      : "";
  const repairUserContent =
    usesSourceLedger
      ? `SOURCE CLAIM LEDGER:\n${sourceSentenceLedger}`
      : `SOURCE:\n${sourceText}\n\nCANDIDATE:\n${candidate}`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "DylGen AI",
    },
    signal,
    body: JSON.stringify({
      model: SECOND_PASS_MODEL,
      temperature: usesSourceLedger ? 0.35 : 0.48,
      top_p: 0.9,
      max_tokens: 1800,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1.01,
      messages: [
        {
          role: "system",
          content: `${repairTaskDirective}

STRUCTURE REQUIREMENT:
${structureDirective}
${ledgerFormatDirective}

Rules:
- Preserve every factual claim, scope, and level of certainty from the source.
- Use only examples and concrete details explicitly present in the source. Do not infer or add workplace routines, purchases, expenses, durations, conversations, inner quotations, systems, blame, or life events.
- Keep general source examples general. Do not replace a broad phrase with a more specific list, scenario, or consequence.
- Every output sentence must be traceable to one or more source sentences. If a claim, noun phrase, consequence, or time frame cannot be pointed to in the source, omit it.
- Preserve degree and frequency exactly. Do not turn "helpful", "may", "often", or "recommended" into "significantly improves", "always", "essential", or "must".
- Preserve category boundaries and list membership.
${voiceDirective}
- Use direct, ordinary English and prefer the source's plain vocabulary over elevated synonym substitutions.
- Do not add fragments, filler, deliberate errors, fake facts, or decorative drama.
- Return only the revised candidate.`,
        },
        {
          role: "user",
          content: repairUserContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.warn("English style repair failed", response.status);
    return { text: candidate, applied: false };
  }

  const data = await response.json();
  const repaired = data?.choices?.[0]?.message?.content;
  if (typeof repaired !== "string" || !repaired.trim()) {
    return { text: candidate, applied: false };
  }

  const repairedText =
    usesSourceLedger
      ? parseReflectiveLedgerOutput(
          repaired.trim(),
          sourceSentences,
          reflectiveMinWords,
          reflectiveMaxWords,
          true
        )
      : repaired.trim();
  if (!repairedText) {
    console.warn("English source-ledger repair rejected: invalid output");
    return {
      text: formatReflectiveSourceFallback(sourceText),
      applied: usesSourceLedger,
    };
  }

  return { text: repairedText, applied: true };
}

// ============================================================
// MAIN POST HANDLER
// ============================================================

export async function POST(req: Request) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      text?: unknown;
      tone?: unknown;
      settings?: unknown;
      targetLang?: unknown;
      useDeepLX?: unknown;
      useValueHumanize?: unknown;
      usePythonHumanize?: unknown;
      useTwoPass?: unknown;
    };
    const { text } = body;
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // --- Credit check ---
    let creditContext: CreditRequestContext | null = null;
    if (isSupabaseServerConfigured) {
      const accessToken = getBearerToken(req);
      if (!accessToken) {
        return NextResponse.json(
          { error: "Login is required to generate text.", creditsRequired: HUMANIZE_CREDIT_COST },
          { status: 401 }
        );
      }

      const user = await getSupabaseUser(accessToken);
      if (!user) {
        return NextResponse.json(
          { error: "Your session expired. Please login again.", creditsRequired: HUMANIZE_CREDIT_COST },
          { status: 401 }
        );
      }

      const creditCheck = await checkUserCredits(
        user.id,
        HUMANIZE_CREDIT_COST,
        user.email ?? null
      );
      if (!creditCheck.ok) {
        return NextResponse.json(
          {
            error: "Insufficient credits.",
            creditsRequired: creditCheck.required,
            creditsCurrent: creditCheck.credits,
            creditsDeficit: creditCheck.deficit,
          },
          { status: 402 }
        );
      }

      creditContext = {
        userId: user.id,
        email: user.email ?? null,
      };
    }

    // --- Settings ---
    const settings = resolveAutoLanguage(normalizeSettings(body.settings), text);
    const config = body.tone
      ? getSystemPromptByTone(normalizeHumanizerTone(body.tone))
      : getConfigFromSettings(settings, text);
    const useTwoPass =
      body.useTwoPass === false
        ? false
        : body.useTwoPass === true ||
          (config.postProcessTone !== "english-sensitive" &&
            config.postProcessTone !== "english-academic");

    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), HUMANIZE_TIMEOUT_MS);

    // --- PASS 1: Qwen ---
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "DylGen AI",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MAIN_MODEL,
        temperature: config.temperature,
        top_p: config.topP,
        max_tokens: config.maxTokens,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        repetition_penalty: config.repetitionPenalty,
        messages: [
          {
            role: "system",
            content: `${config.systemPrompt}\n\n${config.additionalInstruction}\n\n${FIRST_PASS_FIDELITY_CONTRACT}`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter request failed", response.status, errorBody);
      return NextResponse.json(
        { error: "Failed to humanize text" },
        { status: response.status }
      );
    }

    const data = await response.json();
    let result = data?.choices?.[0]?.message?.content;

    if (typeof result !== "string" || !result.trim()) {
      return NextResponse.json(
        { error: "OpenRouter returned an empty result" },
        { status: 502 }
      );
    }

    result = result.trim();

    // --- Language guard ---
    const expectedTargetLang = inferDeepLXTargetLang(settings);
    let currentText = result;
    if (expectedTargetLang) {
      const langGuard = await repairOutputLanguage({
        text: currentText,
        targetLang: expectedTargetLang,
        apiKey,
        signal: controller.signal,
      });
      currentText = langGuard.text;
    }

    // --- Sensitive fidelity repair ---
    const sensitiveGuard = await repairSensitiveEnglishFidelity({
      candidate: currentText,
      sourceText: text,
      tone: config.postProcessTone,
      apiKey,
      signal: controller.signal,
    });
    currentText = sensitiveGuard.text;

    // --- PASS 2: source-faithful English rewrite ---
    let secondPassApplied = false;
    let secondPassModel: string | null = null;

    if (useTwoPass) {
      const firstPassIssues = getConversationalFidelityIssues(
        text,
        currentText,
        false
      );
      const secondPassInput = firstPassIssues.length > 0 ? text.trim() : currentText;

      const faithfulPass = await applyConversationalSecondPass({
        text: secondPassInput,
        sourceText: text,
        tone: config.postProcessTone,
        apiKey,
        signal: controller.signal,
      });

      currentText = faithfulPass.text;
      secondPassApplied = faithfulPass.applied;
      secondPassModel = faithfulPass.applied ? SECOND_PASS_MODEL : null;
    }

    // No random flaws, fake memories, forced anecdotes, or structural destruction.
    currentText = cleanupEnglishSpacing(currentText);

    if (config.postProcessTone.startsWith("english-")) {
      const finalFidelityIssues = getConversationalFidelityIssues(
        text,
        currentText,
        false
      );
      const sourceWordCount = text.split(/\s+/).filter(Boolean).length;
      const outputWordCount = currentText.split(/\s+/).filter(Boolean).length;
      const finalLengthRatio = sourceWordCount === 0 ? 1 : outputWordCount / sourceWordCount;

      if (
        finalFidelityIssues.length > 0 ||
        finalLengthRatio < 0.68 ||
        finalLengthRatio > 1.22
      ) {
        console.warn("Final English rewrite rejected; returning source-faithful fallback", {
          finalLengthRatio: Number(finalLengthRatio.toFixed(2)),
          finalFidelityIssues,
        });
        currentText = buildSafeEnglishFallback(text, config.postProcessTone);
        secondPassApplied = false;
        secondPassModel = null;
      }
    }

    // --- DeepLX ---
    const explicitDeepLXTargetLang = normalizeDeepLXTargetLang(body.targetLang);
    const deepLXTargetLang = explicitDeepLXTargetLang ?? expectedTargetLang;
    const deepLXRequested =
      body.useDeepLX === true || process.env.DEEPLX_FINAL_PASS === "true";
    const deepLXEnabled =
      deepLXRequested &&
      (explicitDeepLXTargetLang !== null || isCrossLanguageDirection(settings));
    const finalPass = await maybeApplyDeepLXFinalPass({
      text: currentText,
      targetLang: deepLXTargetLang,
      enabled: deepLXEnabled,
      signal: controller.signal,
    });

    // --- Python humanize ---
    const pythonHumanizeEnabled = shouldApplyPythonHumanizeFinalPass({
      bodyValue: body.useValueHumanize ?? body.usePythonHumanize,
      settings,
      deepLXEnabled,
      deepLXTargetLang,
    });
    const pythonHumanizePass = maybeApplyPythonHumanizeFinalPass({
      text: finalPass.text,
      enabled: pythonHumanizeEnabled,
    });

    // --- Deduct credits ---
    const creditDeduction = creditContext
      ? await deductUserCredits(
          creditContext.userId,
          HUMANIZE_CREDIT_COST,
          creditContext.email
        )
      : null;

    if (creditDeduction && !creditDeduction.ok) {
      return NextResponse.json(
        {
          error: "Insufficient credits.",
          creditsRequired: creditDeduction.required,
          creditsCurrent: creditDeduction.after,
          creditsDeficit: creditDeduction.deficit,
        },
        { status: 402 }
      );
    }

    // --- Response ---
    return NextResponse.json({
      result: pythonHumanizePass.text,
      profile: config.postProcessTone,
      language: {
        direction: settings.language,
        detectedInput: detectInputLanguage(text),
        repairApplied: !!expectedTargetLang,
      },
      sensitiveFidelity: {
        applied: sensitiveGuard.applied,
      },
      secondPass: {
        applied: secondPassApplied,
        model: secondPassModel,
        type: useTwoPass ? "conversational" : "fidelity",
      },
      credits: creditDeduction
        ? {
            cost: HUMANIZE_CREDIT_COST,
            before: creditDeduction.before,
            remaining: creditDeduction.after,
          }
        : undefined,
      deepLX: deepLXEnabled
        ? {
            applied: finalPass.applied,
            targetLang: deepLXTargetLang,
          }
        : undefined,
      pythonHumanize: pythonHumanizeEnabled
        ? {
            applied: pythonHumanizePass.applied,
            locale: "id-ID",
          }
        : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "OpenRouter request timed out" },
        { status: 504 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Failed to humanize text" },
      { status: 500 }
    );
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
