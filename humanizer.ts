import { finalIndonesianHumanize } from "./indonesian-humanizer";

export type HumanizerTone = "casual" | "ielts";
export type HumanizerPostProcessTone =
  | HumanizerTone
  | "english-general"
  | "english-expository"
  | "english-discursive"
  | "english-reflective"
  | "english-sensitive"
  | "english-academic"
  | "english-personal"
  | "english-argument"
  | "english-practical"
  | "english-policy"
  | "english-consumer"
  | "indonesian-general"
  | "indonesian-academic"
  | "indonesian-professional";

export type EnglishWritingProfile =
  | "general"
  | "expository"
  | "discursive"
  | "reflective"
  | "sensitive"
  | "academic"
  | "personal"
  | "argument-voice"
  | "practical-explainer"
  | "policy-explainer"
  | "consumer-explainer";

export type EnglishWritingPurpose =
  | "General"
  | "Academic"
  | "Professional"
  | "Marketing"
  | "Creative";

export type HumanizerPromptConfig = {
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  repetitionPenalty: number;
  additionalInstruction: string;
  postProcessTone: HumanizerPostProcessTone;
};

// ============================================================
// 1. PROMPTS
// ============================================================

const CASUAL_NATURAL_PROMPT = `
Rewrite the text in natural, direct English. Start with the subject itself — no throat-clearing, no "the real question is", no reframing.

Core rules:
1. Preserve all facts, claims, and qualifications exactly.
2. Use contractions naturally: don't, can't, it's, you're.
3. Vary sentence length. Mix short statements (3-5 words) with longer explanations (15-25 words).
4. Break up long lists into flowing prose.
5. Avoid formulaic transitions: "moreover", "furthermore", "in conclusion", "ultimately".
6. Do not add a concluding summary. End on the last substantive point.
7. Do not add rhetorical questions, filler words, opinions, or emotional language.
8. Do not add "honestly", "look", "here's the thing", "let's be real".

Return only the rewritten text.
`;

const ENGLISH_ACADEMIC_PROMPT = `
You are a careful English academic editor. Rewrite the text so it reads like credible human academic writing while preserving the author's claims, terminology, level of certainty, and structure.

Editing rules:
- Keep the register academic, technical, or professional when the source uses that register.
- Preserve citations, data, domain terms, abbreviations, and methodological language exactly.
- Prefer clear, ordinary academic phrasing over promotional language or dramatic synonyms.
- Do not rewrite merely to replace a word with a more impressive synonym.
- Prefer direct verbs and concrete nouns over extra nominalization.
- Let the ideas determine sentence length.
- Keep natural lexical repetition when repeating a technical term is clearer.
- Preserve an objective voice when the source is an abstract, literature review, methodology, or explanatory passage.
- Correct awkward grammar without making every sentence sound equally polished.
- Treat this as restrained editing: change only wording or sentence structure that genuinely improves clarity.

Do not:
- Turn academic prose into a conversation, motivational post, or marketing copy.
- Add contractions, rhetorical questions, sentence fragments, first-person opinions, anecdotes, or emotional emphasis.
- Invent examples, experiences, citations, statistics, findings, or stronger conclusions.
- Insert stock humanizer phrases such as "let's be real", "honestly, it matters", "game-changer".
- Inflate the wording with terms such as "dynamic", "vital", "transformative", "remarkable".
- Introduce deliberate spelling mistakes or grammatical errors.

Return only the rewritten English text.
`;

const ENGLISH_SENSITIVE_FACTUAL_PROMPT = `
You are editing a sensitive factual, religious, medical, or legal passage. Produce clear, natural English, but treat the source as authoritative.

Method:
- Before writing, silently build a claim ledger from the source.
- Compose from that ledger rather than paraphrasing sentence by sentence.
- Preserve quotations, citations, scripture references, named schools or authorities, Arabic or technical terms, honorifics, and attributed claims.
- Preserve modal force exactly.
- Preserve the difference between what a source directly states, what scholars infer from it, and what the writer concludes.
- Use plain, direct English. Prefer repeating the central term over replacing it with polished synonyms.
- Keep the original point of view.

Do not:
- Invent or expand religious rulings, medical advice, legal obligations, evidence, citations, examples.
- Add a familiar example merely because it is commonly associated with the topic.
- Convert cautious language into certainty or make a narrow claim broader.
- Add casual filler, slang, fragments, deliberate errors, or decorative drama.
- Reorganize the passage in a way that changes which evidence supports which claim.

Return only the rewritten English text.
`;

const ENGLISH_POLICY_EXPLAINER_PROMPT = `
You are editing a factual English explanation about courts, treaties, governments, or international policy.

Before writing:
- Silently build a claim ledger from the source.
- Identify the operational answer: who has legal authority, who can actually act, and what conditions determine the outcome.

Writing rules:
- Begin with the operational answer, not a polished statement that the issue is "highly challenging".
- Use the source's ordinary wording. Do not replace "has no police force" with "lacks an enforcement mechanism".
- Break a sentence containing several independent legal or political claims into shorter complete sentences.
- Group related legal and political constraints together. Do not preserve a one-factor-per-paragraph list.
- Use two to four paragraphs with visibly different amounts of detail.
- Remove empty signposts such as "Another major challenge is that", "Finally", "As a result".
- Contractions such as "can't", "doesn't", and "isn't" are acceptable.
- End on the final practical condition or limitation in the source, not a generic conclusion.

Fidelity rules:
- Preserve every named person, institution, treaty, place, legal position, qualification, and level of certainty.
- Do not add types of crimes, countries, leaders, cases, examples, dates, quotations, opinions, sarcasm.
- Do not introduce I, we, you, rhetorical questions, forum reactions, fragments, filler, deliberate errors.
- Do not claim that an obligation, jurisdiction, arrest, or transfer is certain when the source qualifies it.

Return only the rewritten English text.
`;

const ENGLISH_CONSUMER_EXPLAINER_PROMPT = `
You are editing a factual consumer explanation about a long-term purchase.

Before writing:
- Silently build a claim ledger from the source.
- Identify the actual decision rule in the source. Lead with that rule instead of preserving the source's sequence.

Writing rules:
- Use three prose paragraphs with clearly different amounts of detail.
- Paragraph 1 should state the source's central distinction and reframe the question as a specific decision.
- Paragraph 2 may be the longest. Join related factors without turning them into matching mini-sections.
- Paragraph 3 should turn the source's criteria into a practical decision rule.
- Use you or your only when addressing the buying decision.
- Prefer complete direct sentences and ordinary verbs. Contractions are allowed.
- Remove listing markers and empty paragraph openers.

Fidelity rules:
- Preserve all source qualifications, comparisons, named technologies, ownership conditions, and buying criteria.
- Keep "analysts expect" as an attributed expectation.
- Do not add manufacturer names, vehicle models, countries, price figures, dates, market-share data.
- Do not turn the source into a numbered checklist, fragments, slogans, or a forum persona.

Return only the rewritten English text.
`;

const ENGLISH_EXPOSITORY_PROMPT = `
You are editing a neutral English explanation. Recompose it as clear, natural prose.

**CRITICAL: REFRAME, DON'T JUST EXPLAIN**
If the source is answering "why X happens", start by asking whether "why X" is the right question.

Editing rules:
- Preserve the third-person or impersonal point of view used by the source.
- Preserve every factual claim, comparison, cause, qualification, and level of certainty.
- Compose from claims rather than paraphrasing the source one sentence at a time.
- Change sentence boundaries, emphasis, and paragraph grouping when the logic allows it.
- Organize paragraphs around genuine changes of idea. A paragraph may be short or long.
- Keep useful repetition of the main topic word.
- Prefer ordinary verbs and the source's existing vocabulary over polished substitutions.
- **Avoid the list structure: "one reason is... another factor is... finally..."**

Do not:
- Add I, we, you, your, rhetorical questions, personal advice, or a stronger opinion when the source does not contain them.
- Use stock closing transitions such as "Ultimately", "In truth", "In conclusion".
- Use polished contrast templates such as "not merely X; rather Y" when a direct statement would work.
- Add random fragments, filler, deliberate errors, or decorative drama.
- Replace a repeated topic word with a chain of synonyms merely for variety.

Return only the rewritten English text.
`;

const ENGLISH_DISCURSIVE_PROMPT = `
You are editing an accessible English explainer or practical guide.

Editing rules:
- Start with a reframing of the question or issue, not a direct answer.
- Silently identify the source claims and regroup them by idea.
- Prefer familiar words and active clauses.
- Use ordinary transitions only where the logic needs them.
- Contractions are acceptable when they fit the source register.
- Let one idea take more space than another.
- Keep practical advice concrete and easy to scan.
- Preserve hedges, degree, and frequency exactly.
- **Avoid listing factors with "one", "another", "finally".**

Do not:
- Add first-person opinions, memories, anecdotes, rhetorical questions, reader reactions.
- Invent authority, experience, citations, examples, statistics.
- Add fillers, deliberate errors, ellipses, dramatic interruptions, or fake spontaneity.
- Use report-like substitutions when direct wording is available.
- End with a polished recap or motivational lesson.

Return only the rewritten English text.
`;

const ENGLISH_PRACTICAL_EXPLAINER_PROMPT = `
You are editing a practical English explainer. Turn the source into a useful reader-oriented guide.

Editing rules:
- Begin with a specific, actionable reframing of the problem.
- Silently build a claim ledger. Regroup around what the reader can notice and do.
- Use "you" or "your" naturally in each paragraph.
- Explain the main mechanism briefly, then connect it to practical actions.
- Convert long inventories into complete, readable sentences.
- Prefer direct verbs and ordinary wording. Contractions are welcome.
- Use two or three paragraphs with visibly different amounts of detail.
- End on the last useful action or limitation already present in the source.

Do not:
- Invent an anecdote, researcher, institution, statistic, location, app, schedule, or study method.
- Add brain health, productivity, routines, or extra benefits.
- Add rhetorical questions, fake quotations, deliberate errors, fragments, filler, or slang.
- Strengthen "can", "often", "may", or "helps" into a promise or universal rule.
- Drop technical concepts such as working memory, cognitive overload, or the prefrontal cortex.

Return only the rewritten English text.
`;

const ENGLISH_REFLECTIVE_PROMPT = `
You are rewriting a general explanation about an emotionally relatable life experience as a reader-oriented reflective article.

Voice and structure:
- Silently identify the source's claim units, then rebuild the passage around the reader's experience.
- You may use second person conditionally.
- Preserve hedging and scope.
- Do not use first-person pronouns unless they already appear in the source.
- Contractions are welcome where they sound natural.
- Keep the emotional tone already present in the source.
- Use ordinary words. Keep the language literal and direct.
- For a source between 120 and 350 words, use three coherent paragraphs with visibly different lengths.
- Do not add a final summary paragraph that lists the factors again.

Do not:
- Invent personal experience, scenes, dialogue, facts, examples, statistics, advice, or a life lesson.
- Make a general example more specific.
- Add random fillers, emojis, deliberate errors, profanity, or performative phrases.
- Change an explanation into instructions.

Return only the rewritten English text.
`;

const ENGLISH_PERSONAL_PROMPT = `
You are editing a first-person English account while protecting the writer's actual voice.

Editing rules:
- Preserve the chronology, names, places, numbers, uncertainty, side comments, and small practical details.
- Keep contractions, mild repetition, and informal wording when they belong to the narrator.
- Let paragraph lengths remain uneven.
- Correct only errors that obstruct meaning.
- Keep the narrator's attitude and level of confidence unchanged.

Do not:
- Invent personal experiences or concrete details.
- Embellish the account with emotional, atmospheric, or dramatic details.
- Add a moral, inspirational conclusion, rhetorical hook, or tidy summary.
- Insert generic humanizer phrases.
- Convert the account into an article, listicle, or academic essay.

Return only the rewritten English text.
`;

const ENGLISH_ARGUMENT_VOICE_PROMPT = `
You are editing an English argument. Keep the writer's actual position, but remove the tidy essay-template feel.

Editing rules:
- State the source's position directly, but begin with a reframing if the source's framing is weak.
- If the source uses a balanced frame but reaches a clear judgment, lead with that judgment.
- For a recommendation, explain the practical reason before cataloguing secondary benefits.
- Preserve every reason, example category, qualification, and level of certainty.
- Develop the reasons according to their importance.
- Let sentence length follow the reasoning.
- Keep useful repetition of the central nouns.
- Combine closely related claims when that improves flow.
- End on the source's final practical point.

Do not:
- Add anecdotes, dialogue, statistics, studies, motives, or emotional reactions.
- Add rhetorical questions, filler, slang, deliberate errors, fake quotations.
- Use stock framing such as "in today's world", "ultimately", "in conclusion", "let's be real".
- Turn a qualified claim into certainty or make the source's position stronger.

Return only the rewritten text.
`;

// ============================================================
// 3. IELTS PROMPT & EXAMPLE
// ============================================================

const IELTS_HUMAN_PROMPT = `
You are rewriting text in IELTS Academic style as a real Band 8 student with a clear opinion and a distinct voice.

**CRITICAL GOAL:**
The result must read like a thoughtful student wrote it under exam pressure: clear, confident, slightly uneven in rhythm, and emotionally invested.

**CRITICAL: REFRAME THE QUESTION**
Before writing, ask yourself: is the question the source is answering actually the right question?

**Structure guidance:**
1. Introduction (2-3 sentences): Open with a broad but natural statement that may reframe the question. State the position clearly.
2. Body paragraph 1 (4-5 sentences): Start naturally. Make a specific point with conviction. Include a believable real-world example.
3. Body paragraph 2 (3-4 sentences): Add a second clear argument. Keep the reasoning straightforward but not bland.
4. Conclusion (1-2 sentences): Restate the position with confidence. End with a final thought.

**Voice requirements:**
- Use a bold opinion when appropriate: "I strongly believe", "I'm firmly convinced".
- Use stronger vocabulary when it fits: crucial, severe, remarkable, detrimental.
- Reduce weak hedging. Avoid overusing "may", "might", "could", "perhaps".
- Use contractions sometimes, but not in every sentence.
- Vary sentence openings.
- Use specific, believable examples.
- Allow light human imperfection.
- Accept a degree of repetition.

**Do NOT:**
- Use fake statistics, fake studies, or fake citations.
- Sound like a textbook or a corporate report.
- Over-polish or force unnatural variety.
- Use the same transition pattern in every paragraph.
- Over-explain obvious points.
- Add any meta commentary about rewriting.

Return only the rewritten text. Nothing else.
`;

const HUMAN_IELTS_EXAMPLES = `
Example style reference:

Over the last few decades, technology has moved from being a luxury to something that shapes almost every part of daily life. Some people still argue that this change has made society colder and more distracted, but I strongly believe its benefits are far greater than its drawbacks.

Firstly, technology has transformed the way people stay connected. A student in Jakarta, for example, can speak to a parent working overseas through a simple video call, and that kind of contact is enormously valuable. It does not replace real presence, of course. But it does soften the distance, and for many families that matters a great deal.

Another important point is that technology creates opportunities that simply did not exist before. Young people can learn new skills online, build small businesses from home, or find work beyond their local area. This is not perfect, and it can make life feel frighteningly fast sometimes, but the overall impact is still remarkable.

To sum up, I am firmly convinced that technology improves modern life when people use it with discipline. The real issue is not technology itself, but whether we let it control our habits.
`;

// ============================================================
// 4. MAIN CONFIG FUNCTIONS
// ============================================================

export function getSystemPromptByTone(tone: HumanizerTone): HumanizerPromptConfig {
  if (tone === "ielts") {
    return {
      systemPrompt: `${IELTS_HUMAN_PROMPT}\n\n${HUMAN_IELTS_EXAMPLES}\n\nTASK: Rewrite the user's text in IELTS Academic style.`,
      temperature: 0.85,
      topP: 0.92,
      maxTokens: 1200,
      frequencyPenalty: 0.15,
      presencePenalty: 0.1,
      repetitionPenalty: 1.12,
      additionalInstruction:
        "Write with conviction, varied rhythm, specific examples, and a natural student voice.",
      postProcessTone: "ielts",
    };
  }

  return {
    systemPrompt: CASUAL_NATURAL_PROMPT,
    temperature: 0.9,
    topP: 0.98,
    maxTokens: 1200,
    frequencyPenalty: 0.08,
    presencePenalty: 0.05,
    repetitionPenalty: 1.05,
    additionalInstruction:
      "Make it feel human, conversational, and slightly bursty while preserving the original meaning.",
    postProcessTone: "casual",
  };
}

function countPatternHits(text: string, patterns: RegExp[]) {
  return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function detectEnglishWritingProfile(
  text: string,
  writingPurpose: EnglishWritingPurpose = "General"
): EnglishWritingProfile {
  const sensitiveFactualHits = countPatternHits(text, [
    /\b(?:Allah|Qur['']an|Prophet|Islamic teachings?|Muslims?|halal|taqw[aā]|nafaqah)\b/i,
    /\b(?:scripture|verse|religious ruling|act of worship|faith|piety)\b/i,
    /\b(?:diagnosis|treatment|patient|clinical|medical condition|healthcare professional)\b/i,
    /\b(?:statute|regulation|legal obligation|court|section|article of law)\b/i,
  ]);
  const religiousTermCount =
    text.match(
      /\b(?:Allah|Qur['']an|Prophet(?:\s+Muhammad)?|hadiths?|haram|halal|duff|Hanbali|Maliki|Shafi['']?i|Hanafi|Islamic jurisprudence)\b/gi
    )?.length ?? 0;
  const clinicalTermCount =
    text.match(
      /\b(?:diagnosis|treatment|patient|clinical|medical condition|healthcare professional|physician|symptoms?|therapy)\b/gi
    )?.length ?? 0;
  const legalTermCount =
    text.match(
      /\b(?:statute|regulation|legal obligation|court|section|article of law|plaintiff|defendant|jurisdiction)\b/gi
    )?.length ?? 0;

  const policyWordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const policyInstitutionCount =
    text.match(
      /\b(?:International Criminal Court|ICC|Rome Statute|arrest warrants?|jurisdiction|member states?|treaty obligations?|state cooperation|The Hague|Palestinian territories)\b/gi
    )?.length ?? 0;
  const policyDependencyHits = countPatternHits(text, [
    /\b(?:does not have|has no|lacks?) (?:its own )?(?:police force|power to arrest|enforcement power)\b/i,
    /\b(?:relies? on|depends? on) (?:states?|governments?|countries?)\b/i,
    /\b(?:execute|carry out) (?:its |the )?arrest warrants?\b/i,
    /\b(?:willing|legally able|legal obligations?|domestic legal procedures?|political decisions?)\b/i,
    /\b(?:not a party to|party to) the Rome Statute\b/i,
    /\b(?:on|in) (?:its|their|the country['']s) territory\b/i,
    /\b(?:diplomatic consequences?|strategic, military, or economic relationships?)\b/i,
  ]);

  if (
    writingPurpose === "General" &&
    policyWordCount >= 140 &&
    policyInstitutionCount >= 4 &&
    policyDependencyHits >= 2 &&
    religiousTermCount === 0 &&
    clinicalTermCount === 0
  ) {
    return "policy-explainer";
  }
  if (
    sensitiveFactualHits >= 2 ||
    religiousTermCount >= 2 ||
    clinicalTermCount >= 2 ||
    legalTermCount >= 2
  ) {
    return "sensitive";
  }

  if (writingPurpose === "Academic") return "academic";

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const firstPersonCount =
    text.match(/\b(?:I|me|my|mine|we|us|our|ours)\b/gi)?.length ?? 0;
  const personalDetailHits = countPatternHits(text, [
    /\b(?:years? ago|when I|I remember|I used to|I had|I was|I built|I ran|I moved|my kids?|my family|my client|my job|my work)\b/i,
    /\b(?:yesterday|last year|during COVID|at the time|one day|eventually|finally)\b/i,
    /\b\d+\s+(?:years?|months?|weeks?|days?)\s+ago\b/i,
    /\b(?:friend|client|board|family|kids?|home|workplace|school)\b/i,
  ]);

  if (firstPersonCount >= 4 && personalDetailHits >= 2) {
    return "personal";
  }

  const academicHits = countPatternHits(text, [
    /\b(?:systematic literature review|literature review|methodology|manuscript|publications?|inclusion and exclusion criteria)\b/i,
    /\b(?:research|study|studies|findings?|evaluation metrics?|usability tests?|data analysis)\b/i,
    /\b(?:instructional|pedagogical|pedagogy|educational technolog(?:y|ies)|learning outcomes?|academic progress)\b/i,
    /\b(?:cognitive|non-cognitive|collaborative filtering|content-based filtering|ontological approaches?)\b/i,
    /\b(?:implemented|evaluated|observed|resulted in|this paper|this research|this manuscript)\b/i,
    /\b(?:framework|competencies|student-centered|learner attributes?|recommendation methods?)\b/i,
  ]);
  const academicTransitionHits = countPatternHits(text, [
    /\b(?:nevertheless|consequently|furthermore|moreover)\b/i,
    /\b(?:as a result|within this|such an approach|in this context)\b/i,
    /\b(?:including|according to|in most cases|it is observed that)\b/i,
  ]);
  const hasCitation =
    /\[[0-9]{1,3}\]/.test(text) ||
    /\([A-Z][A-Za-z-]+(?:\s+et\s+al\.?)?,?\s+\d{4}[a-z]?\)/.test(text);

  if (
    hasCitation ||
    academicHits >= 3 ||
    (academicHits >= 2 && academicTransitionHits >= 2 && wordCount >= 100) ||
    (writingPurpose === "Professional" && academicHits >= 2)
  ) {
    return "academic";
  }

  const hasPersonalPointOfView =
    /\b(?:I|me|my|mine|we|us|our|ours|you|your|yours)\b/i.test(text);
  const consumerVehicleTopicCount =
    text.match(
      /\b(?:electric vehicles?|EVs?|manufacturer|ownership|battery|charging|software updates?|resale value|dealer network|spare parts?|replacement components?|warranty|after-sales support|battery diagnostics?)\b/gi
    )?.length ?? 0;
  const consumerRiskHits = countPatternHits(text, [
    /\b(?:10-year|ten-year|ten years|10 years|long-term ownership)\b/i,
    /\b(?:financial stability|remain profitable|industry consolidation|exits? the market|reduces? operations)\b/i,
    /\b(?:replacement parts?|software updates?|warranty service|technical support)\b/i,
    /\b(?:feel technologically outdated|resale value|comparable gasoline vehicle)\b/i,
    /\b(?:dealer network|trained technicians|battery diagnostics?|repair costs?|waiting times?)\b/i,
    /\b(?:global sales|financial performance|battery production|international service network|local operations|investment plans?)\b/i,
  ]);

  if (
    writingPurpose === "General" &&
    wordCount >= 250 &&
    consumerVehicleTopicCount >= 8 &&
    consumerRiskHits >= 4
  ) {
    return "consumer-explainer";
  }
  const reflectiveTopicCount =
    text.match(
      /\b(?:unemploy(?:ed|ment)|job loss|rejection|loneliness|lonely|isolation|grief|heartbreak|relationship|marriage|attraction|self-worth|confidence|financial insecurity|social comparison)\b/gi
    )?.length ?? 0;
  const reflectiveEmotionCount =
    text.match(
      /\b(?:painful|pain|difficult|hard|stress|anxiety|worry|worried|fear|frustration|embarrassed|judged|uncertainty|isolated|ashamed|shame|left behind)\b/gi
    )?.length ?? 0;
  const expositoryHits = countPatternHits(text, [
    /\b(?:because|as a result|therefore|consequently)\b/i,
    /\b(?:factors?|conditions?|circumstances?|pressures?|challenges?)\b/i,
    /\b(?:contribute to|lead to|make it difficult|typically require|often delay)\b/i,
    /\b(?:many people|many individuals|young adults|in many countries|in reality)\b/i,
    /\b(?:finally|at this age|different rates|different people|long-term goals?)\b/i,
  ]);
  const speculativeExplainerHits = countPatternHits(text, [
    /\b(?:aliens?|UFOs?|extraterrestrial life|alien sightings?|alien encounters?)\b/i,
    /\b(?:scientific evidence|verifiable evidence|independently tested|unproven claims?)\b/i,
    /\b(?:hoaxes?|misunderstandings?|optical illusions?|manipulated media|CGI)\b/i,
  ]);
  const practicalGuideHits = countPatternHits(text, [
    /\b(?:travelers?|tourists?|visitors?|first-time visit|before your trip|planning ahead)\b/i,
    /\b(?:passport|public transportation|high-speed rail|buses|subways?)\b/i,
    /\b(?:mobile payments?|local apps?|WeChat Pay|Alipay|cash)\b/i,
    /\b(?:local customs?|cultural traditions?|popular attractions?|regional cuisines?)\b/i,
  ]);
  const plainCausalExplainerHits = countPatternHits(text, [
    /\b(?:is|are|remains?|becomes?)\s+(?:expensive|costly|high|difficult|common)\s+because\s+of\s+(?:several|many|a number of)\b/i,
    /\b(?:another|one|a further)\s+(?:reason|factor|cause)\b/i,
    /\b(?:forcing|leading|causing|which increase|further increasing)\b/i,
    /\b(?:reduced funding|rising costs?|high demand|availability of|operating costs?)\b/i,
  ]);

  const learningGuideTopicCount =
    text.match(
      /\b(?:focus(?:ed)?|attention|concentrat(?:e|ion)|learn(?:ing|ers?)|study(?:ing)?|working memory|cognitive overload|mental fatigue|distractions?)\b/gi
    )?.length ?? 0;
  const practicalLearningActionCount =
    text.match(
      /\b(?:break(?:ing)? information|review(?:ing)? material|connect(?:ing)? new knowledge|minimi[sz](?:e|ing) distractions?|study(?:ing)? in (?:short|focused) intervals?|summari[sz](?:e|ing)|ask(?:ing)? questions?|teach(?:ing)? others|scheduled breaks?|active learning|regular study habits?)\b/gi
    )?.length ?? 0;

  if (
    writingPurpose === "General" &&
    !hasPersonalPointOfView &&
    wordCount >= 140 &&
    learningGuideTopicCount >= 5 &&
    practicalLearningActionCount >= 4 &&
    expositoryHits >= 1
  ) {
    return "practical-explainer";
  }

  if (
    !hasPersonalPointOfView &&
    wordCount >= 120 &&
    reflectiveTopicCount >= 2 &&
    reflectiveEmotionCount >= 2
  ) {
    return "reflective";
  }

  if (
    writingPurpose === "General" &&
    wordCount >= 100 &&
    ((speculativeExplainerHits >= 2 && expositoryHits >= 1) ||
      practicalGuideHits >= 3 ||
      (plainCausalExplainerHits >= 2 && expositoryHits >= 2))
  ) {
    return "discursive";
  }

  const stanceMarkerCount =
    text.match(
      /\b(?:should(?:\s+not|n't)?|must(?:\s+not|n't)?|need(?:s)?\s+to|have\s+to|ought\s+to)\b/gi
    )?.length ?? 0;
  const argumentSubjectCount =
    text.match(/\b(?:children|parents|society|people|students|workers|government)\b/gi)
      ?.length ?? 0;
  const careerChoiceCount =
    text.match(
      /\b(?:career|profession|doctor|medicine|engineering|business|education|arts|technology)\b/gi
    )?.length ?? 0;
  const hasArgumentContrast =
    /\b(?:but|while|rather than|instead of|not only|more likely)\b/i.test(text);
  const balancedFrameCount =
    text.match(
      /\b(?:on the one hand|on the other hand|although|while|however|therefore)\b/gi
    )?.length ?? 0;

  if (
    writingPurpose === "General" &&
    !hasPersonalPointOfView &&
    wordCount >= 100 &&
    stanceMarkerCount >= 1 &&
    (argumentSubjectCount >= 2 || balancedFrameCount >= 2) &&
    (careerChoiceCount >= 3 || hasArgumentContrast || balancedFrameCount >= 2)
  ) {
    return "argument-voice";
  }
  if (!hasPersonalPointOfView && wordCount >= 120 && expositoryHits >= 2) {
    return "expository";
  }

  return "general";
}

export function getEnglishHumanizerConfig(
  sourceText: string,
  writingPurpose: EnglishWritingPurpose = "General"
): HumanizerPromptConfig {
  const profile = detectEnglishWritingProfile(sourceText, writingPurpose);

  if (profile === "consumer-explainer") {
    return {
      systemPrompt: ENGLISH_CONSUMER_EXPLAINER_PROMPT,
      temperature: 0.46,
      topP: 0.88,
      maxTokens: 1800,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1,
      additionalInstruction: 
        "Recompose the long-term buying analysis around the source's decision rule. Merge factor-by-factor sections, preserve every uncertainty and criterion, use second person only for the buying decision, and add no brand, model, anecdote, or outside fact.",
      ),
      postProcessTone: "english-consumer",
    };
  }
  if (profile === "policy-explainer") {
    return {
      systemPrompt: ENGLISH_POLICY_EXPLAINER_PROMPT,
      temperature: 0.42,
      topP: 0.86,
      maxTokens: 1600,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1,
      additionalInstruction: 
        "Recompose the legal-policy explanation around enforcement authority and practical dependency. Split dense clauses, remove factor-by-factor signposts, preserve every qualification, and add no outside case, opinion, or crime category."
      ),
      postProcessTone: "english-policy",
    };
  }
  if (profile === "sensitive") {
    return {
      systemPrompt: ENGLISH_SENSITIVE_FACTUAL_PROMPT,
      temperature: 0.46,
      topP: 0.9,
      maxTokens: 1600,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1,
      additionalInstruction:
        "Use a source-anchored claim ledger, then recompose in plain English. Preserve every attribution, qualification, named authority, explicit answer, citation, and modal strength; never add a familiar detail that the source did not supply.",
      postProcessTone: "english-sensitive",
    };
  }
  if (profile === "academic") {
    return {
      systemPrompt: ENGLISH_ACADEMIC_PROMPT,
      temperature: 0.48,
      topP: 0.88,
      maxTokens: 1600,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1.02,
      additionalInstruction:
        "Perform restrained academic editing. Prefer direct wording, keep natural repetition, and do not manufacture casualness, elevated synonyms, or personal experience.",
      postProcessTone: "english-academic",
    };
  }

  if (profile === "reflective") {
    return {
      systemPrompt: ENGLISH_REFLECTIVE_PROMPT,
      temperature: 0.64,
      topP: 0.9,
      maxTokens: 1600,
      frequencyPenalty: 0.03,
      presencePenalty: 0.03,
      repetitionPenalty: 1.01,
      additionalInstruction: 
        "Use a reader-oriented reflective voice from the source claims only. Conditional second person is allowed, but preserve every hedge, fact, example, and causal relationship; add no illustrative detail."
      ),
      postProcessTone: "english-reflective",
    };
  }
  if (profile === "practical-explainer") {
    return {
      systemPrompt: ENGLISH_PRACTICAL_EXPLAINER_PROMPT,
      temperature: 0.52,
      topP: 0.88,
      maxTokens: 1600,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1.01,
      additionalInstruction: 
        "Recompose the explanation as a source-faithful practical guide. Reader address is allowed, but add no personal story, authority, example, or recommendation absent from the source."
      ),
      postProcessTone: "english-practical",
    };
  }
  if (profile === "discursive") {
    return {
      systemPrompt: ENGLISH_DISCURSIVE_PROMPT,
      temperature: 0.58,
      topP: 0.9,
      maxTokens: 1600,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1.01,
      additionalInstruction: 
        "Use direct everyday English and regroup the source claims by idea. Preserve uncertainty and practical details exactly; do not add a narrator, rhetorical questions, anecdotes, or outside knowledge."
      ),
      postProcessTone: "english-discursive",
    };
  }
  if (profile === "expository") {
    return {
      systemPrompt: ENGLISH_EXPOSITORY_PROMPT,
      temperature: 0.62,
      topP: 0.92,
      maxTokens: 1600,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1.01,
      additionalInstruction: 
        "Recompose from the source's claim units instead of rewriting sentence by sentence. Preserve the neutral point of view and factual scope, use ordinary vocabulary, and do not mirror the source's paragraph skeleton."
      ),
      postProcessTone: "english-expository",
    };
  }
  if (profile === "personal") {
    return {
      systemPrompt: ENGLISH_PERSONAL_PROMPT,
      temperature: 0.7,
      topP: 0.94,
      maxTokens: 1600,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1.01,
      additionalInstruction:
        "Keep the narrator's real details and uneven pacing. Edit lightly and never invent autobiographical material.",
      postProcessTone: "english-personal",
    };
  }

  if (profile === "argument-voice") {
    return {
      systemPrompt: ENGLISH_ARGUMENT_VOICE_PROMPT,
      temperature: 0.68,
      topP: 0.9,
      maxTokens: 1600,
      frequencyPenalty: 0.05,
      presencePenalty: 0.03,
      repetitionPenalty: 1.01,
      additionalInstruction: 
        "Keep the stated position clear and source-faithful. Vary emphasis through the reasoning itself; do not invent a narrator, anecdote, question, typo, or dramatic aside."
      ),
      postProcessTone: "english-argument",
    };
  }
  
  // GENERAL profile — with increased temperature and all reframing
  return {
    systemPrompt: `${CASUAL_NATURAL_PROMPT}\n\n${reframingInstruction ? reframingInstruction + '\n\n' : ''}Match the source register. Do not force slang, fragments, rhetorical questions, or personal claims merely to sound human.`,
    temperature: 1.6,        // ← WAS 1.4, now higher for lower probability tokens
    topP: 0.99,
    maxTokens: 1600,
    frequencyPenalty: 0.45,  // ← WAS 0.35, discourage common words more
    presencePenalty: 0.35,   // ← WAS 0.25, encourage novel tokens more
    repetitionPenalty: 1.02,
    additionalInstruction:
      "Use direct natural English, preserve strategic repetition, and let paragraph boundaries follow the ideas. Avoid balanced template structure, stock conclusions, or invented details.",
    postProcessTone: "english-general",
  };
}

export function normalizeHumanizerTone(value: unknown): HumanizerTone {
  return value === "ielts" ? "ielts" : "casual";
}

// ============================================================
// 5. AUTHENTIC IDIOSYNCRASY INJECTOR
// ============================================================

function injectDistributedImperfections(text: string): string {
  if (!text || text.length < 60) return text;
  const sentences = splitSentences(text);
  
  for (let i = 0; i < sentences.length; i++) {
    // 6% chance: add a real typo somewhere in the sentence
    if (Math.random() < 0.06) {
      sentences[i] = sentences[i]
        .replace(/\bthe\b/gi, () => Math.random() < 0.4 ? 'teh' : 'the')
        .replace(/\btheir\b/gi, () => Math.random() < 0.4 ? 'thier' : 'their')
        .replace(/\bbecause\b/gi, () => Math.random() < 0.3 ? 'becuase' : 'because');
    }
    
    // 5% chance: drop an article for non-native feel
    if (Math.random() < 0.05 && sentences[i].length > 20) {
      sentences[i] = sentences[i].replace(/\bthe\s+([a-z]+)\b/gi, (_, noun) => 
        Math.random() < 0.4 ? noun : `the ${noun}`
      );
    }
    
    // 4% chance: add a filler word
    if (Math.random() < 0.04 && sentences[i].length > 30) {
      const fillers = ['honestly', 'basically', 'you know', 'actually'];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      const words = sentences[i].split(' ');
      const pos = Math.floor(Math.random() * Math.min(3, words.length));
      words.splice(pos, 0, filler);
      sentences[i] = words.join(' ');
    }
  }
  
  return sentences.join(' ');
}

function injectAuthenticIdiosyncrasy(text: string): string {
  if (!text || text.length < 60) return text;
  
  let result = text;
  const paragraphs = result.split(/\n\s*\n/).filter(p => p.trim());
  
  // === 1. REAL TYPOS (3% chance per eligible word) ===
  const typoMap: Record<string, string> = {
    "the": "teh",
    "their": "thier", 
    "definitely": "definately",
    "separate": "seperate",
    "noticeable": "noticable",
    "receive": "recieve",
    "believe": "beleive",
    "until": "untill",
    "because": "becuase",
    "though": "tho",
    "through": "thru",
  };
  
  for (const [correct, typo] of Object.entries(typoMap)) {
    const regex = new RegExp(`\\b${correct}\\b`, 'gi');
    result = result.replace(regex, (match) => 
      Math.random() < 0.03 ? typo : match
    );
  }
  
  // === 2. PROFANITY / EMOTIONAL OUTBURSTS (15% chance, one per text) ===
  const outbursts = [
    " Which, honestly, is kind of bullshit.",
    " Seriously, it's that simple.",
    " Go figure.",
    " Make of that what you will.",
    " Not that anyone's counting.",
    " Whatever that means.",
    " If that makes sense.",
    " So there's that.",
  ];
  
  if (Math.random() < 0.15 && paragraphs.length > 0) {
    const targetPara = Math.floor(Math.random() * paragraphs.length);
    const outburst = outbursts[Math.floor(Math.random() * outbursts.length)];
    paragraphs[targetPara] = paragraphs[targetPara].replace(/[.!?]$/, '') + outburst;
  }
  
  // === 3. ABRUPT ENDING — remove conclusion paragraph (30% chance) ===
  if (paragraphs.length >= 3 && Math.random() < 0.3) {
    const lastPara = paragraphs[paragraphs.length - 1];
    if (/\b(bottom line|in conclusion|overall|therefore|thus|in summary|ultimately)\b/i.test(lastPara)) {
      if (Math.random() < 0.5) {
        paragraphs.pop();
      } else {
        const sentences = splitSentences(lastPara);
        if (sentences.length > 1) {
          paragraphs[paragraphs.length - 1] = sentences.slice(1).join(' ');
        }
      }
    }
  }
  
  // === 4. ADD A DIRECT READER QUESTION (25% chance) ===
  const readerQuestions = [
    " Make sense?",
    " Sound familiar?",
    " Ever noticed that?",
    " You know what I mean?",
    " Hard to argue with that, right?",
  ];
  
  if (Math.random() < 0.25 && paragraphs.length > 1) {
    const midPara = Math.floor(paragraphs.length / 2);
    const q = readerQuestions[Math.floor(Math.random() * readerQuestions.length)];
    if (Math.random() < 0.5) {
      paragraphs.splice(midPara + 1, 0, q.trim());
    } else {
      paragraphs[midPara] = paragraphs[midPara].replace(/[.!?]$/, '.') + q;
    }
  }
  
  // === 5. INJECT A "fragment heading" style (20% chance) ===
  if (paragraphs.length >= 3 && Math.random() < 0.2) {
    const targetIdx = Math.floor(paragraphs.length / 2);
    const sentences = splitSentences(paragraphs[targetIdx]);
    if (sentences.length >= 2) {
      const firstSentence = sentences[0];
      if (firstSentence.length < 60 && !firstSentence.includes('?')) {
        paragraphs.splice(targetIdx, 0, firstSentence.replace(/[.!?]$/, ''));
        paragraphs[targetIdx + 1] = sentences.slice(1).join(' ');
      }
    }
  }
  
  // === 6. RANDOM UNGRAMMATICAL CONSTRUCTION (10% chance) ===
  if (Math.random() < 0.10 && paragraphs.length > 0) {
    const targetIdx = Math.floor(Math.random() * paragraphs.length);
    const awkwardFragments = [
      " More or less.",
      " Generally speaking, anyway.",
      " For the most part, at least.",
      " If that makes any sense at all.",
      " Though who really knows.",
    ];
    const fragment = awkwardFragments[Math.floor(Math.random() * awkwardFragments.length)];
    paragraphs[targetIdx] = paragraphs[targetIdx].replace(/[.!?]$/, '.') + fragment;
  }
  
  return paragraphs.join('\n\n');
}

function injectRecalledDetails(text: string): string {
  if (!text || text.length < 80) return text;
  
  const recalledPhrases: Record<string, string[]> = {
    'studies show': [
      'a 2023 European study found',
      'research out of Toronto suggests',
      'one widely-cited paper noted',
    ],
    'research shows': [
      'a 2023 European study found',
      'research out of Toronto suggests', 
      'one widely-cited paper noted',
    ],
    'many people': [
      'a surprising number of people',
      'more folks than you\'d expect',
      'plenty of people',
    ],
    'some studies': [
      'a few studies',
      'a couple of papers',
      'one 2022 review',
    ],
  };
  
  let result = text;
  for (const [pattern, replacements] of Object.entries(recalledPhrases)) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    if (regex.test(result) && Math.random() < 0.4) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(regex, replacement);
      break;
    }
  }
  
  return result;
}

// ============================================================
// 6. NON-NATIVE IMPERFECTIONS INJECTOR
// ============================================================

function injectNonNativeImperfections(
  text: string,
  intensity: 'low' | 'medium' | 'high' = 'medium'
): string {
  if (!text || text.length < 60) return text;

  let result = text;
  const sentences = splitSentences(result);
  
  const probs = {
    low: { sva: 0.03, article: 0.02, connector: 0.04, awkward: 0.03, preposition: 0.02, ambiguity: 0.02 },
    medium: { sva: 0.06, article: 0.04, connector: 0.07, awkward: 0.05, preposition: 0.04, ambiguity: 0.04 },
    high: { sva: 0.10, article: 0.06, connector: 0.10, awkward: 0.08, preposition: 0.06, ambiguity: 0.06 }
  };
  
  const p = probs[intensity] || probs.medium;
  
  // 1. SVA ERRORS
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.sva) {
      sentences[i] = sentences[i].replace(/\b(\w+)s\b/g, (match) => {
        if (match.length > 3 && Math.random() < 0.3) return match.slice(0, -1);
        return match;
      });
    }
  }
  
  // 2. ARTICLE MISUSE
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.article) {
      sentences[i] = sentences[i].replace(/\bthe\s+([a-z]+s)\b/gi, (match, noun) => {
        if (Math.random() < 0.5) return noun;
        return match;
      });
    }
  }
  
  // 3. AWKWARD COLLOCATIONS
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.awkward) {
      sentences[i] = sentences[i].replace(/\b(because)\b/gi, 'this is because');
      sentences[i] = sentences[i].replace(/\b(so)\b/gi, 'therefore, it is that');
      sentences[i] = sentences[i].replace(/\b(but)\b/gi, 'however, it is that');
    }
  }
  
  // 4. REDUNDANT CONNECTORS
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.connector) {
      sentences[i] = sentences[i].replace(/\bthat is because\b/gi, 'that is to say, this is because');
      sentences[i] = sentences[i].replace(/\btherefore\b/gi, 'that is to say, therefore');
    }
  }
  
  // 5. PREPOSITION ERRORS
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.preposition) {
      sentences[i] = sentences[i].replace(/\bin\s+([a-z]+)\s+way\b/gi, 'in a $1 way');
      sentences[i] = sentences[i].replace(/\bon\s+the\s+one\s+hand\b/gi, 'on the one hand side');
    }
  }
  
  // 6. MIX "ONE" AND "YOU"
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < 0.04) {
      if (sentences[i].includes('you')) {
        sentences[i] = sentences[i].replace(/\byou\b/gi, () => Math.random() < 0.3 ? 'one' : 'you');
      }
      if (sentences[i].includes('one')) {
        sentences[i] = sentences[i].replace(/\bone\b/gi, () => Math.random() < 0.3 ? 'you' : 'one');
      }
    }
  }
  
  return sentences.join(' ');
}

// ============================================================
// 7. STRUCTURAL CHAOS FUNCTIONS
// ============================================================

function ensureMultiParagraph(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 6) return text;
  if (!text.includes('\n\n')) {
    const mid = Math.floor(sentences.length / 2);
    return sentences.slice(0, mid).join(' ') + '\n\n' + sentences.slice(mid).join(' ');
  }
  return text;
}

function destroyThreeParagraphStructure(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  const counts = paragraphs.map(p => splitSentences(p).length);
  const maxDiff = Math.max(...counts) - Math.min(...counts);

  if (maxDiff <= 2) {
    paragraphs[0] = paragraphs[0] + ' ' + paragraphs[1];
    paragraphs.splice(1, 1);

    if (paragraphs.length === 2) {
      const sentences = splitSentences(paragraphs[1]);
      if (sentences.length >= 4) {
        const mid = Math.floor(sentences.length * (0.3 + Math.random() * 0.3));
        paragraphs[1] = sentences.slice(0, mid).join(' ');
        paragraphs.splice(2, 0, sentences.slice(mid).join(' '));
      }
    }
  }

  if (paragraphs.length >= 2) {
    const last = paragraphs[paragraphs.length - 1];
    if (splitSentences(last).length < 2 && paragraphs.length > 1) {
      paragraphs[paragraphs.length - 2] += ' ' + last;
      paragraphs.pop();
    }
  }

  return paragraphs.join('\n\n');
}

function applyStructuralChaos(text: string): string {
  if (text.length < 100) return text;

  let result = text;

  result = ensureMultiParagraph(result);
  result = splitLongSentences(result);
  result = mergeShortSentences(result);
  result = shuffleNonCriticalSentences(result);
  result = injectMildPersonalTouch(result);
  result = casualizeTransitions(result);
  result = adjustParagraphBreaks(result);
  result = destroyThreeParagraphStructure(result);
  result = addHumanPunctuationFlaws(result);

  return result;
}

function splitLongSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const result: string[] = [];
  for (const sentence of sentences) {
    const words = sentence.split(' ');
    if (words.length > 25 && (sentence.includes(',') || sentence.includes(' and ')) && Math.random() < 0.3) {
      const splitPoints = [
        sentence.indexOf(', '),
        sentence.indexOf(' and '),
        sentence.indexOf(' but '),
        sentence.indexOf('; '),
      ].filter(pos => pos > 10 && pos < sentence.length - 10);
      if (splitPoints.length > 0) {
        const pos = splitPoints[Math.floor(Math.random() * splitPoints.length)];
        const part1 = sentence.slice(0, pos).replace(/[.!?]$/, '');
        const part2 = sentence.slice(pos + 1).replace(/^[,;]\s*/, '').trim();
        if (part2.length > 10) {
          result.push(part1 + '.');
          result.push(part2.charAt(0).toUpperCase() + part2.slice(1));
          continue;
        }
      }
    }
    result.push(sentence);
  }
  return result.join(' ');
}

function mergeShortSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const result: string[] = [];
  let i = 0;
  while (i < sentences.length) {
    if (i < sentences.length - 1) {
      const wordCount1 = sentences[i].split(' ').length;
      const wordCount2 = sentences[i+1].split(' ').length;
      if (wordCount1 < 10 && wordCount2 < 10 && Math.random() < 0.3) {
        const merged = sentences[i].replace(/[.!?]$/, '') + ', ' + sentences[i+1].toLowerCase();
        result.push(merged);
        i += 2;
        continue;
      }
    }
    result.push(sentences[i]);
    i++;
  }
  return result.join(' ');
}

function shuffleNonCriticalSentences(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const result: string[] = [];
  for (let p = 0; p < paragraphs.length; p++) {
    const sentences = splitSentences(paragraphs[p]);
    if (sentences.length < 4 || Math.random() > 0.3) {
      result.push(paragraphs[p]);
      continue;
    }

    const first = sentences[0];
    const rest = sentences.slice(1);
    if (rest.length > 2 && Math.random() < 0.3) {
      const idx = Math.floor(Math.random() * (rest.length - 1)) + 1;
      const moved = rest.splice(idx, 1)[0];
      rest.splice(Math.floor(Math.random() * rest.length), 0, moved);
    }
    result.push([first, ...rest].join(' '));
  }
  return result.join('\n\n');
}

function injectMildPersonalTouch(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  if (/\b(I|you|honestly|actually|you know|think about)\b/i.test(text)) {
    return text;
  }

  const openers = [
    'Honestly, ',
    'To be fair, ',
    'Think about it: ',
    'In reality, ',
    'The thing is, ',
  ];
  const targetIdx = Math.floor(Math.random() * sentences.length);
  const opener = openers[Math.floor(Math.random() * openers.length)];

  if (targetIdx > 0 && targetIdx < sentences.length - 1) {
    sentences.splice(targetIdx, 0, opener + sentences[targetIdx].charAt(0).toLowerCase() + sentences[targetIdx].slice(1));
  }
  return sentences.join(' ');
}

function casualizeTransitions(text: string): string {
  const map: Record<string, string> = {
    Furthermore: "Plus",
    Moreover: "Also",
    "In addition": "Besides",
    Consequently: "So",
    Therefore: "That means",
    Ultimately: "At the end of the day",
    "In conclusion": "So basically",
    However: "But",
    Nevertheless: "Still",
    "As a result": "Because of that",
  };
  let result = text;
  for (const [formal, casual] of Object.entries(map)) {
    result = result.replace(new RegExp(`\\b${formal}\\b`, "gi"), casual);
  }
  return result;
}

function adjustParagraphBreaks(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const result: string[] = [];
  let i = 0;
  while (i < paragraphs.length) {
    if (i < paragraphs.length - 1) {
      const p1Words = paragraphs[i].split(' ').length;
      const p2Words = paragraphs[i+1].split(' ').length;
      if (p1Words < 30 && p2Words < 30 && Math.random() < 0.3) {
        result.push(paragraphs[i] + ' ' + paragraphs[i+1]);
        i += 2;
        continue;
      }
    }
    if (paragraphs[i].split(' ').length > 40 && Math.random() < 0.2) {
      const sentences = splitSentences(paragraphs[i]);
      if (sentences.length >= 4) {
        const mid = Math.floor(sentences.length / 2);
        result.push(sentences.slice(0, mid).join(' '));
        result.push(sentences.slice(mid).join(' '));
        i++;
        continue;
      }
    }
    result.push(paragraphs[i]);
    i++;
  }
  return result.join('\n\n');
}

function addHumanPunctuationFlaws(text: string): string {
  return text
    .replace(/\. /g, (m) => Math.random() < 0.05 ? '.  ' : m)
    .replace(/, /g, (m) => Math.random() < 0.03 ? ',  ' : m)
    .replace(/\.([A-Z])/g, (m, p1) => Math.random() < 0.02 ? '.' + p1.toLowerCase() : m);
}

// ============================================================
// 8. MAIN addHumanTouches
// ============================================================

export function addHumanTouches(
  text: string,
  tone: HumanizerPostProcessTone = "casual"
) {
  if (!text || text.length < 40) return text;

  let result = removeSyntheticEnglishHumanizerPhrases(text.trim());

  const usesPlainEnglish =
    tone === "casual" ||
    tone === "english-general" ||
    tone === "english-expository" ||
    tone === "english-discursive" ||
    tone === "english-reflective" ||
    tone === "english-personal" ||
    tone === "english-argument" ||
    tone === "english-practical" ||
    tone === "english-policy" ||
    tone === "english-consumer";

  if (usesPlainEnglish) {
    result = simplifyInflatedEnglish(result);
  }
  if (tone === "ielts") {
    result = applyContractions(result);
    result = reduceRoboticHedging(result);
    result = enhanceVocabulary(result);
    result = strengthenOpinionVoice(result);
    result = varySentenceStarters(result, 0.3);
    result = addConjunctionStarts(result, 0.08);
    result = addNaturalImperfections(result, 0.12);
    result = addNaturalRedundancy(result, 0.08);
  }

  return cleanupEnglishSpacing(result);
}

// ============================================================
// 9. VOCABULARY & STYLE-SPECIFIC HELPERS
// ============================================================

function simplifyInflatedEnglish(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bhighly improbable\b/gi, "very unlikely"],
    [/\bcomparable to\b/gi, "similar to"],
    [/\bdue to the fact that\b/gi, "because"],
    [/\bthe majority of individuals\b/gi, "most people"],
    [/\bnumerous\b/gi, "many"],
    [/\bindividuals\b/gi, "people"],
    [/\baffluent\b/gi, "wealthy"],
    [/\bsubsequently\b/gi, "later"],
    [/\butilized\b/gi, "used"],
    [/\butilizes\b/gi, "uses"],
    [/\butilize\b/gi, "use"],
    [/\bfacilitated\b/gi, "helped"],
    [/\bfacilitates\b/gi, "helps"],
    [/\bfacilitate\b/gi, "help"],
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    if (Math.random() < 0.6) {
      result = result.replace(pattern, replacement);
    }
  }
  return result;
}

export function enhanceVocabulary(text: string): string {
  if (!text || text.length < 60) return text;
  let result = text;
  const vocabularyMap: Array<[RegExp, string]> = [
    [/\bvery important\b/gi, "crucial"],
    [/\bvery big\b/gi, "massive"],
    [/\bvery bad\b/gi, "severe"],
    [/\bvery good\b/gi, "remarkable"],
    [/\bvery difficult\b/gi, "incredibly challenging"],
    [/\ba lot of\b/gi, "a great deal of"],
    [/\blots of\b/gi, "countless"],
    [/\bnot good\b/gi, "problematic"],
    [/\bbad effect\b/gi, "detrimental effect"],
    [/\bgood effect\b/gi, "positive impact"],
  ];
  vocabularyMap.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  return result;
}

function makeReflectiveEnglishMoreDirect(text: string) {
  let result = text
    .replace(/\bcan be deeply painful\b/gi, "can hurt")
    .replace(/\bIt gives people\b/g, "It can give you")
    .replace(/\bwhen comparing themselves with\b/gi, "when you compare yourself with")
    .replace(/\bBeyond the practical challenges,\s*/gi, "")
    .replace(/\beven in individuals who are\b/gi, "even if you're")
    .replace(/\bPeople who are unemployed may\b/gi, "If you're unemployed, you may")
    .replace(/\bThis emotional burden is often intensified by uncertainty, as\b/gi, "Uncertainty often makes this harder because");

  result = result.replace(/When someone[^.!?]*[.!?]/gi, (sentence) =>
    sentence
      .replace(/\bWhen someone\b/i, "When you")
      .replace(/\bthey\b/gi, "you")
      .replace(/\btheir\b/gi, "your")
      .replace(/\bthemselves\b/gi, "yourself")
  );

  return result
    .replace(/\byou are\b/gi, "you're")
    .replace(/([.!?])\1+/g, "$1");
}

function makeConsumerEnglishMoreDirect(text: string) {
  return text
    .replace(/(^|\n\s*\n)One (?:big|significant) uncertainty is whether\s+/gi, "$1It is hard to know whether ")
    .replace(/(^|\n\s*\n)Another concern is\s+/gi, "$1")
    .replace(/(^|\n\s*\n)Technology is also moving quickly\.\s*/gi, "$1EV technology moves quickly. ")
    .replace(/(^|\n\s*\n)Service and parts availability are just as important\.\s*/gi, "$1Service and parts matter too. ")
    .replace(/\bEqually (?:important|critical) is\b/gi, "Also important is")
    .replace(/\bTo assess that risk, examine\b/gi, "When comparing manufacturers, check")
    .replace(/\bhinges? on\b/gi, "depends on")
    .replace(/\bsecure replacement parts\b/gi, "get replacement parts")
    .replace(/\bmaking (?:regular|continued) updates (?:critical|essential)\b/gi, "making continued updates important")
    .replace(/(^|\n\s*\n)Ultimately,\s+/gi, "$1")
    .replace(/\bdoes not\b/gi, "doesn't")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bis not\b/gi, "isn't")
    .replace(/\bare not\b/gi, "aren't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/([.!?])\1+/g, "$1")
    .replace(/(^|[.!?]\s+|\n\s*\n)([a-z])/g, (_match, prefix, letter) =>
      `${prefix}${letter.toUpperCase()}`
    );
}

function makePolicyEnglishMoreDirect(text: string) {
  return text
    .replace(/(^|\n\s*\n)Another major challenge is that\s+/gi, "$1")
    .replace(/(^|\n\s*\n)A key obstacle is that\s+/gi, "$1")
    .replace(/(^|\n\s*\n)Political and diplomatic considerations also play a significant role\.\s*/gi, "$1")
    .replace(/(^|\n\s*\n)Finally,\s+/gi, "$1")
    .replace(/(^|[.!?]\s+)Consequently,\s+/gi, "$1")
    .replace(/(^|[.!?]\s+)As a result,\s+/gi, "$1")
    .replace(/\bEnforcement therefore hinges on\b/gi, "Enforcement depends on")
    .replace(/\bhinges on\b/gi, "depends on")
    .replace(/\bdoes not\b/gi, "doesn't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bis not\b/gi, "isn't")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/([.!?])\1+/g, "$1")
    .replace(/(^|[.!?]\s+|\n\s*\n)([a-z])/g, (_match, prefix, letter) =>
      `${prefix}${letter.toUpperCase()}`
    );
}

function makeDiscursiveEnglishMoreDirect(text: string) {
  let result = text
    .replace(/(^|[.!?]\s+)Furthermore,\s+/gi, "$1Also, ")
    .replace(/(^|[.!?]\s+)Moreover,\s+/gi, "$1Also, ")
    .replace(/(^|[.!?]\s+)In addition,\s+/gi, "$1Also, ")
    .replace(/(^|[.!?]\s+)However,\s+/gi, "$1But ")
    .replace(/(^|[.!?]\s+)Nevertheless,\s+/gi, "$1Still, ")
    .replace(/(^|[.!?]\s+)Consequently,\s+/gi, "$1So, ")
    .replace(/(^|[.!?]\s+)As a result,\s+/gi, "$1So, ")
    .replace(/\bthe majority of\b/gi, "most")
    .replace(/\bnumerous\b/gi, "many")
    .replace(/\bdue to a combination of\b/gi, "because of")
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bprior to\b/gi, "before")
    .replace(/\bdoes not\b/gi, "doesn't")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bis not\b/gi, "isn't")
    .replace(/\bare not\b/gi, "aren't")
    .replace(/\bhas not\b/gi, "hasn't")
    .replace(/\bhave not\b/gi, "haven't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't");

  return result.replace(/([.!?])\1+/g, "$1");
}

// ============================================================
// 10. finalHumanize
// ============================================================

export function finalHumanize(text: string, tone: HumanizerPostProcessTone = "casual"): string {
  if (
    tone === "indonesian-general" ||
    tone === "indonesian-academic" ||
    tone === "indonesian-professional"
  ) {
    return finalIndonesianHumanize(text, tone);
  }

  if (!text || text.length < 40) return text.trim();

  let result = text.trim();

  // Profile-specific direct rewrites only — no chaos injections
  if (tone === "english-reflective") {
    result = makeReflectiveEnglishMoreDirect(result);
  }
  if (tone === "english-consumer") {
    result = makeConsumerEnglishMoreDirect(result);
  }
  if (tone === "english-policy") {
    result = makePolicyEnglishMoreDirect(result);
  }
  if (tone === "english-discursive") {
    result = makeDiscursiveEnglishMoreDirect(result);
  }

  result = addHumanTouches(result, tone);
  return cleanupEnglishSpacing(result);
}

// ============================================================
// 11. HELPER FUNCTIONS
// ============================================================

function applyContractions(text: string): string {
  let result = text;
  const contractions: Array<[RegExp, string]> = [
    [/\bdo not\b/gi, "don't"],
    [/\bcannot\b/gi, "can't"],
    [/\bwill not\b/gi, "won't"],
    [/\bshould not\b/gi, "shouldn't"],
    [/\bwould not\b/gi, "wouldn't"],
    [/\bcould not\b/gi, "couldn't"],
    [/\bdoes not\b/gi, "doesn't"],
    [/\bdid not\b/gi, "didn't"],
    [/\bis not\b/gi, "isn't"],
    [/\bare not\b/gi, "aren't"],
    [/\bwas not\b/gi, "wasn't"],
    [/\bwere not\b/gi, "weren't"],
    [/\bhas not\b/gi, "hasn't"],
    [/\bhave not\b/gi, "haven't"],
    [/\bhad not\b/gi, "hadn't"],
    [/\bit is\b/gi, "it's"],
    [/\bthat is\b/gi, "that's"],
    [/\bwhat is\b/gi, "what's"],
    [/\bthere is\b/gi, "there's"],
    [/\bhere is\b/gi, "here's"],
    [/\bi will\b/gi, "I'll"],
    [/\byou will\b/gi, "you'll"],
    [/\bthey will\b/gi, "they'll"],
    [/\bwe will\b/gi, "we'll"],
    [/\bi would\b/gi, "I'd"],
    [/\byou would\b/gi, "you'd"],
    [/\bthey would\b/gi, "they'd"],
    [/\bi have\b/gi, "I've"],
    [/\byou have\b/gi, "you've"],
    [/\bwe have\b/gi, "we've"],
    [/\bthey have\b/gi, "they've"],
    [/\bi am\b/gi, "I'm"],
    [/\byou are\b/gi, "you're"],
    [/\bwe are\b/gi, "we're"],
    [/\bthey are\b/gi, "they're"],
    [/\bwould have\b/gi, "would've"],
    [/\bcould have\b/gi, "could've"],
    [/\bshould have\b/gi, "should've"],
    [/\bthat is why\b/gi, "that's why"],
    [/\bbecause it is\b/gi, "because it's"],
  ];

  contractions.forEach(([pattern, replacement]) => {
    if (Math.random() > 0.22) {
      result = result.replace(pattern, replacement);
    }
  });

  return result;
}

function reduceRoboticHedging(text: string): string {
  let result = text;
  const hedges: Array<[RegExp, string]> = [
    [/\bmay be\b/gi, "is"],
    [/\bmight be\b/gi, "is probably"],
    [/\bcould be\b/gi, "is likely"],
    [/\bperhaps\b/gi, "in many cases"],
    [/\bit can be argued that\b/gi, "I would argue that"],
  ];

  hedges.forEach(([pattern, replacement]) => {
    if (Math.random() > 0.25) {
      result = result.replace(pattern, replacement);
    }
  });

  return result;
}

function strengthenOpinionVoice(text: string): string {
  let result = text;
  const opinionMap: Array<[RegExp, string]> = [
    [/\bI believe that\b/gi, "I'm firmly convinced that"],
    [/\bI believe\b/gi, "I strongly believe"],
    [/\bI think that\b/gi, "From my perspective,"],
    [/\bI think\b/gi, "I genuinely think"],
    [/\bin my opinion\b/gi, "in my honest opinion"],
    [/\bin my view\b/gi, "from my perspective"],
  ];

  opinionMap.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

function addNaturalRedundancy(text: string, chance: number): string {
  if (Math.random() > chance) return text;
  let result = text;
  const redundancyPairs: Array<[RegExp, string]> = [
    [/\bvery important\b/i, "very, very important"],
    [/\bbig problem\b/i, "big, genuine problem"],
    [/\breal issue\b/i, "real, serious issue"],
    [/\bclear that\b/i, "clear enough that"],
    [/\bmatters\b/i, "really matters"],
  ];
  for (const [pattern, replacement] of redundancyPairs) {
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
      break;
    }
  }
  return result;
}

function varySentenceStarters(text: string, chance: number): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  const starters = [
    "When we look at it closely,",
    "Because of this,",
    "That's why",
    "In real life,",
    "On top of that,",
    "To be fair,",
  ];
  const varied = sentences.map((sentence) => {
    const trimmed = sentence.trim();
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (
      !["this", "it", "the", "there"].includes(firstWord) ||
      trimmed.length < 45 ||
      Math.random() > chance
    ) {
      return sentence;
    }
    const starter = starters[Math.floor(Math.random() * starters.length)];
    return `${starter} ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
  });
  return varied.join(" ");
}

function addConjunctionStarts(text: string, chance: number): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  const adjusted = sentences.map((sentence, index) => {
    if (index === 0 || Math.random() > chance) return sentence;
    const trimmed = sentence.trim();
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (["and", "but", "so", "because", "when", "while"].includes(firstWord)) {
      return sentence;
    }
    const conjunction = Math.random() > 0.5 ? "And" : "But";
    return `${conjunction} ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
  });
  return adjusted.join(" ");
}

function addNaturalImperfections(text: string, chance: number): string {
  if (Math.random() > chance) return text;
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  const index = Math.min(sentences.length - 2, Math.max(1, Math.floor(Math.random() * sentences.length)));
  const sentence = sentences[index];
  if (sentence.length > 85 && !sentence.includes(" - ")) {
    const words = sentence.split(" ");
    const middle = Math.floor(words.length / 2);
    words.splice(middle, 0, "-");
    sentences[index] = words.join(" ");
  } else if (!sentence.endsWith("...") && sentence.length > 50) {
    sentences[index] = sentence.replace(/[.!?]$/, "...");
  }
  return sentences.join(" ");
}

function removeSyntheticEnglishHumanizerPhrases(text: string) {
  return text
    .replace(
      /(^|[.!?]\s+)(?:Honestly,\s+it matters|Plain and simple|And that's the thing|That's what I mean|You can feel the difference)\.\s*/gi,
      "$1"
    )
    .replace(/(^|[.!?]\s+)(?:But\s+)?let's be real:\s*/gi, "$1")
    .replace(/(^|[.!?]\s+)Think about it(?:—|-|:)\s*/gi, "$1")
    .replace(/\b(?:That's|That is) a game-changer\b/gi, "That is useful");
}

function cleanupEnglishSpacing(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/[ \t]+([,.;:!?])/g, "$1")
        .replace(/([([{])[ \t]+/g, "$1")
        .replace(/[ \t]+([\])}])/g, "$1")
        .replace(/[ \t]{2,}/g, " ")
        .trim()
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
