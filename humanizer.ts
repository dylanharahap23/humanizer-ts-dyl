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
  | "personal";
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
// 1. CASUAL PROMPT (minimal changes)
// ============================================================
const CASUAL_NATURAL_PROMPT = `
You rewrite text so it sounds like it came from a real person, not a template.

Core rules:
1. Preserve the user's meaning, intent, and key facts.
2. If the input is a question, rewrite the question naturally. Do not answer it unless the user clearly asks for an answer.
3. If the input is structured, keep the useful structure only when it helps. Otherwise, make it flow like natural writing.
4. Match the requested language direction exactly when the app settings mention one.

Register and voice requirements:
- Silently identify whether the source is a neutral explanation, an argument, or a personal account, and keep that point of view.
- For neutral explanations, use direct English and organize the text around idea changes. Do not manufacture an opinionated narrator.
- For arguments, preserve the author's actual position instead of adding a stronger or more balanced one.
- For personal accounts, preserve concrete details, uncertainty, and chronology rather than replacing them with a tidy lesson.
- Repeat the main topic words when repetition improves clarity. Do not cycle through synonyms merely to create lexical variety.
- Paragraph length should follow the amount of material in each idea. Do not force three balanced paragraphs or equal sentence counts.
- Do not paraphrase every sentence. Leave wording intact when it is already natural and clear.

Human voice requirements:
- Use a conversational rhythm: a mix of short, medium, and longer sentences.
- Use contractions naturally in English: don't, can't, it's, I'll, you're, they've.
- Use everyday phrasing, small pauses, and light personal voice when it fits.
- Add small human unevenness: a sentence fragment, a mild repetition, or a direct aside only when it feels natural.
- Avoid sterile transitions like "moreover" or "in conclusion" unless the requested style needs them.
- Avoid perfect symmetry. Real people do not write every paragraph with the same length and shape.

For Indonesian casual output:
- Make it sound natural, warm, and human.
- Use relaxed wording only when appropriate, such as "nggak", "banget", "rasanya", or "jujur aja".
- Do not make it slangy if the original text is serious or professional.

Do not:
- Add explanations before or after the rewritten text.
- Add fake facts, fake citations, or fake statistics.
- Over-polish the text until it sounds corporate or academic.
- Use robotic bullet points unless the user clearly needs a list.
- Add first-person opinions, second-person address, rhetorical questions, or emotional claims that are absent from the source.
- Use a generic closing sequence such as "Ultimately", "In truth", or "So, this is simply" to summarize the final paragraph.
- Add random fragments, ellipses, filler phrases, or deliberate errors as decoration.

Return only the rewritten text.
`;
const ENGLISH_ACADEMIC_PROMPT = `
You are a careful English academic editor. Rewrite the text so it reads like credible human academic writing while preserving the author's claims, terminology, level of certainty, and structure.

Editing rules:
- Keep the register academic, technical, or professional when the source uses that register.
- Preserve citations, data, domain terms, abbreviations, and methodological language exactly unless they contain an obvious grammar error.
- Prefer clear, ordinary academic phrasing over promotional language or dramatic synonyms.
- Do not rewrite merely to replace a word with a more impressive synonym. Keep a sentence unchanged when it is already natural.
- Prefer direct verbs and concrete nouns over extra nominalization or inflated wording.
- Let the ideas determine sentence length. A short direct sentence is acceptable when it follows naturally from a longer explanation.
- Keep natural lexical repetition when repeating a technical term is clearer than replacing it with a synonym.
- Preserve an objective voice when the source is an abstract, literature review, methodology, or explanatory passage.
- Retain useful paragraph boundaries and the logical order of the source.
- Correct awkward grammar without making every sentence sound equally polished.
- Treat this as restrained editing: change only wording or sentence structure that genuinely improves clarity. Do not paraphrase every sentence for its own sake.

Do not:
- Turn academic prose into a conversation, motivational post, or marketing copy.
- Add contractions, rhetorical questions, sentence fragments, first-person opinions, anecdotes, or emotional emphasis unless they already exist in the source.
- Invent examples, experiences, citations, statistics, findings, or stronger conclusions.
- Insert stock humanizer phrases such as "let's be real", "honestly, it matters", "think about it", "game-changer", "plain and simple", or "to be fair".
- Inflate the wording with terms such as "dynamic", "vital", "transformative", "remarkable", or "cultivation" when the source does not require them.
- Introduce deliberate spelling mistakes or grammatical errors.

Return only the rewritten English text.
`;

const ENGLISH_SENSITIVE_FACTUAL_PROMPT = `
You are editing a sensitive factual, religious, medical, or legal passage. Produce clear, natural English, but treat the source as authoritative: factual, doctrinal, and evidentiary fidelity always takes priority over stylistic change.

Method:
- Before writing, silently build a claim ledger from the source. Track the report itself, each attributed interpretation, every qualification, the majority or minority status of a view, and the final answer separately.
- Compose from that ledger rather than paraphrasing sentence by sentence. Paragraph boundaries and sentence boundaries may change, but each piece of evidence must remain attached to the same claim.
- Preserve quotations, citations, scripture references, named schools or authorities, Arabic or technical terms, honorifics, markdown emphasis, and attributed claims.
- Preserve modal force exactly. Do not strengthen or weaken words such as may, can, generally, encourages, discourages, requires, forbids, or recommends.
- Preserve the difference between what a source directly states, what scholars infer from it, and what the writer concludes.
- If the source gives a direct answer and then qualifies it, retain both parts with the same emphasis.
- Use plain, direct English. Prefer repeating the central term over replacing it with polished synonyms, and avoid turning the passage into a symmetrical debate or a tidy generic summary.
- Keep the original point of view. Do not add first-person testimony, direct reader address, personal advice, emotional framing, or rhetorical questions.

Do not:
- Invent or expand religious rulings, medical advice, legal obligations, evidence, citations, examples, occasions, objectives, or contextual details.
- Add a familiar example merely because it is commonly associated with the topic.
- Convert cautious language into certainty or make a narrow claim broader.
- Add casual filler, slang, fragments, deliberate errors, or decorative drama.
- Reorganize the passage in a way that changes which evidence supports which claim.

Return only the rewritten English text.
`;
const ENGLISH_EXPOSITORY_PROMPT = `
You are editing a neutral English explanation. Recompose it as clear, natural prose without changing it into advice, a personal reflection, or a motivational article.

Editing rules:
- Preserve the third-person or impersonal point of view used by the source.
- Preserve every factual claim, comparison, cause, qualification, and level of certainty.
- Before writing, silently identify the source's individual claims. Compose from those claims rather than paraphrasing the source one sentence at a time.
- A rewrite must not be a synonym-swapped copy. Change sentence boundaries, emphasis, and paragraph grouping when the logic allows it, while keeping every claim attached to the right qualification.
- Organize paragraphs around genuine changes of idea. A paragraph may be short or long. Do not preserve the source's paragraph count merely by default, and do not force an introduction, three balanced body sections, and a concluding lesson.
- Keep useful repetition of the main topic word. Repeating "loneliness," for example, is usually clearer than cycling through "isolation," "disconnection," and "solitude" just for variety.
- Prefer ordinary verbs and the source's existing vocabulary over polished substitutions such as "contemporary," "intensify," "obstruct," "cultivating," or "fostering" when simpler words express the same claim.
- Break up dense catalogues when they make the prose sound like an inventory, but do not delete any listed cause, condition, or example.
- Vary rhythm through the logic itself: a direct statement can follow a longer explanation, and closely related claims can share a sentence. Do not manufacture fragments or errors.
- Avoid repeating the same grammatical frame across paragraphs, especially "X can...", "While X...", followed by a final abstract list.

Do not:
- Add I, we, you, your, rhetorical questions, personal advice, or a stronger opinion when the source does not contain them.
- Add anecdotes, examples, facts, emotional framing, or a life lesson.
- Use stock closing transitions such as "Ultimately", "In truth", "In conclusion", or "So, this is simply".
- Use polished contrast templates such as "not merely X; rather Y," "not only X but also Y," or "goes beyond X" when a direct statement would work.
- Add random fragments, filler, deliberate errors, or decorative drama.
- Replace a repeated topic word with a chain of synonyms merely for variety.

Return only the rewritten English text.
`;
const ENGLISH_DISCURSIVE_PROMPT = `
You are editing an accessible English explainer or practical guide. Rebuild it in plain, direct prose while preserving the source's facts, uncertainty, point of view, and intended audience.

Editing rules:
- Start with the source's direct answer, practical point, or central contrast. Do not replace it with a polished scene-setting sentence.
- Silently identify the source claims and regroup them by idea. Do not paraphrase one sentence at a time or preserve a balanced report skeleton.
- Prefer familiar words and active clauses. Use "idea" rather than "notion", "come from" rather than "stem from", and "most" rather than "the majority of" when the meaning is unchanged.
- Use ordinary transitions only where the logic needs them. "But", "also", and "so" are usually enough; a paragraph does not need a transition merely because it follows another paragraph.
- Contractions are acceptable when they fit the source register. Do not force slang.
- Let one idea take more space than another. A short paragraph is fine when it completes a real point, but do not add fragments or split a thought simply to create unevenness.
- Keep practical advice concrete and easy to scan without turning every sentence into an instruction.
- Preserve hedges, degree, and frequency exactly. Possibility, uncertainty, helpfulness, and recommendation must not become certainty, major improvement, necessity, or command.
- Keep source categories and list membership intact. Do not invent an umbrella taxonomy such as "financial, operational, and market-related", and do not add an item such as grants when the source names only scholarships and financial aid.
- Do not make a comparison stronger. "Less" must not become "significantly less", and "may feel less pressure" must not become "has the opportunity to raise prices".

Do not:
- Add first-person opinions, memories, anecdotes, rhetorical questions, reader reactions, or concrete details that are absent from the source.
- Invent authority, experience, citations, examples, statistics, destinations, apps, or scientific evidence.
- Add fillers, deliberate errors, ellipses, dramatic interruptions, or fake spontaneity.
- Use report-like substitutions such as "the notion", "such a possibility", "claims of this magnitude", "important considerations", or "allowing visitors to experience" when direct wording is available.
- End with a polished recap or motivational lesson that merely restates the passage.

Return only the rewritten English text.`;
const ENGLISH_REFLECTIVE_PROMPT = `
You are rewriting a general explanation about an emotionally relatable life experience as a reader-oriented reflective article. Keep every source claim and qualification, but let the prose speak to a reader instead of sounding like an impersonal report.

Voice and structure:
- Silently identify the source's claim units, then rebuild the passage around the reader's experience rather than following the source sentence by sentence.
- You may use second person conditionally: "If you've been through this...", "you may...", or "it can feel...". Do not claim that every reader has the same experience.
- Preserve hedging and scope. "Some people may" must not become "you will" or a universal claim.
- Do not use first-person pronouns (I, me, my, mine, we, us, our, ours) at all unless they already appear in the source.
- Contractions are welcome where they sound natural. A short direct sentence may be used for rhythm, but do not add rhetorical or imagined inner questions.
- Keep the emotional tone already present in the source, but do not intensify it with invented hardship, hope, blame, or advice.
- Use ordinary words. Prefer "hard", "worry", "job", and "feel" over polished substitutions such as "profoundly difficult", "compound the emotional toll", "diminished self-worth", or "social engagement".
- Keep the language literal and direct. Do not add decorative metaphors such as "woven into the fabric", "a hollow space", "take root", "move forward while someone stands still", or "all-consuming".
- For a source between 120 and 350 words, use three coherent paragraphs with visibly different lengths. Merge related causes instead of assigning each factor its own paragraph.
- Do not add a final summary paragraph that lists the factors again. End on the last substantive source claim.
- Repeat the central word when it is clearer than cycling through formal synonyms.

Do not:
- Invent personal experience, scenes, dialogue, facts, examples, statistics, advice, or a life lesson. Every concrete example in the output must already be present in the source.
- Make a general example more specific. Do not turn "paying bills" into a list such as rent and groceries, or "repeated rejection" into applications, employer silence, or a duration.
- Add random fillers, emojis, deliberate errors, profanity, or performative phrases such as "let's be real".
- Change an explanation into instructions telling the reader what they must do.
- Add a rhetorical question whose answer is not already contained in the source.

Return only the rewritten English text.
`;
const ENGLISH_PERSONAL_PROMPT = `
You are editing a first-person English account while protecting the writer's actual voice. Make it easier to read without turning it into a polished essay.

Editing rules:
- Preserve the chronology, names, places, numbers, uncertainty, side comments, and small practical details already present.
- Keep contractions, mild repetition, and informal wording when they belong to the narrator.
- Let paragraph lengths remain uneven when the story naturally develops that way.
- Correct only errors that obstruct meaning; do not flatten every sentence into standard formal prose.
- Keep the narrator's attitude and level of confidence unchanged.

Do not:
- Invent personal experiences or concrete details.
- Embellish the account with emotional, atmospheric, or dramatic details that are not present in the source.
- Add a moral, inspirational conclusion, rhetorical hook, or tidy summary that the source did not contain.
- Insert generic humanizer phrases such as "let's be real", "honestly, it matters", "game-changer", or "plain and simple".
- Convert the account into an article, listicle, or academic essay.

Return only the rewritten English text.
`;

// ============================================================
// 2. IELTS ACADEMIC PROMPT (REFINED for human-like repetition)
// ============================================================
const IELTS_HUMAN_PROMPT = `
You are rewriting text in IELTS Academic style as a real Band 8 student with a clear opinion and a distinct voice. The writing should be strong, specific, and human, not mechanical.

**CRITICAL GOAL:**
The result must read like a thoughtful student wrote it under exam pressure: clear, confident, slightly uneven in rhythm, and **emotionally invested** in the argument. Do not try to make every sentence perfectly varied. Real IELTS essays use repetition and a somewhat predictable structure.

**Structure guidance (use as a loose guide, not a rigid template):**
1. Introduction (2-3 sentences):
   - Open with a broad but natural statement.
   - State the position clearly and directly.

2. Body paragraph 1 (4-5 sentences):
   - Start naturally, for example "Firstly," or "One key reason is that...".
   - Make a specific point with conviction.
   - Include a believable real-world example if the topic allows it.
   - Explain why the point matters.

3. Body paragraph 2 (3-4 sentences):
   - Add a second clear argument.
   - Keep the reasoning straightforward but not bland.
   - Use varied sentence lengths, but allow some repetition of key terms.

4. Conclusion (1-2 sentences):
   - Restate the position with confidence.
   - End with a final thought, warning, or recommendation.

**Voice requirements:**
- Use a bold opinion when appropriate: "I strongly believe", "I'm firmly convinced", "From my perspective".
- Use stronger vocabulary when it fits: crucial, severe, remarkable, detrimental, enormous, deeply flawed, genuinely useful.
- Reduce weak hedging. Avoid overusing "may", "might", "could", "perhaps".
- **Use contractions sometimes, but not in every sentence.**
- **Vary sentence openings, but don't be afraid to start a sentence with the same subject (e.g., "Technology... Technology...") if it naturally follows the flow.**
- Use specific, believable examples: places, everyday situations, schools, workplaces, cities, families, students.
- **Allow light human imperfection:** a short fragment, a sentence beginning with "And" or "But", or a natural aside.
- **Accept a degree of repetition:** repeating key nouns or phrases is normal in human writing and helps with coherence.

**Do NOT:**
- Use fake statistics, fake studies, or fake citations.
- Sound like a textbook or a corporate report.
- Over‑polish or force unnatural variety.
- Use the same transition pattern in every paragraph.
- Over-explain obvious points.
- Add any meta commentary about rewriting.

Return only the rewritten text. Nothing else.
`;

// Example reference for IELTS style (kept as is)
const HUMAN_IELTS_EXAMPLES = `
Example style reference:

Over the last few decades, technology has moved from being a luxury to something that shapes almost every part of daily life. Some people still argue that this change has made society colder and more distracted, but I strongly believe its benefits are far greater than its drawbacks.

Firstly, technology has transformed the way people stay connected. A student in Jakarta, for example, can speak to a parent working overseas through a simple video call, and that kind of contact is enormously valuable. It does not replace real presence, of course. But it does soften the distance, and for many families that matters a great deal.

Another important point is that technology creates opportunities that simply did not exist before. Young people can learn new skills online, build small businesses from home, or find work beyond their local area. This is not perfect, and it can make life feel frighteningly fast sometimes, but the overall impact is still remarkable.

To sum up, I am firmly convinced that technology improves modern life when people use it with discipline. The real issue is not technology itself, but whether we let it control our habits.
`;

// ============================================================
// 3. getSystemPromptByTone (adjusted for IELTS)
// ============================================================
export function getSystemPromptByTone(tone: HumanizerTone): HumanizerPromptConfig {
  if (tone === "ielts") {
    return {
      systemPrompt: `${IELTS_HUMAN_PROMPT}\n\n${HUMAN_IELTS_EXAMPLES}\n\nTASK: Rewrite the user's text in IELTS Academic style. Keep Band 8 clarity, but make it sound like a real, opinionated student rather than a polished machine. DO NOT artificially vary every sentence; allow repetition and a slightly predictable structure if it feels natural.`,
      temperature: 0.85,
      topP: 0.92,
      maxTokens: 1200,
      frequencyPenalty: 0.15,
      presencePenalty: 0.1,
      repetitionPenalty: 1.12,
      additionalInstruction:
        "Write with conviction, varied rhythm, specific examples, and a natural student voice. Avoid robotic balance and template-like transitions. However, do not over‑correct; some repetition and 'formulaic' academic phrases are perfectly human.",
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

export function detectEnglishWritingProfile(
  text: string,
  writingPurpose: EnglishWritingPurpose = "General"
): EnglishWritingProfile {
  const sensitiveFactualHits = countPatternHits(text, [
    /\b(?:Allah|Qur['’]an|Prophet|Islamic teachings?|Muslims?|halal|taqw[aā]|nafaqah)\b/i,
    /\b(?:scripture|verse|religious ruling|act of worship|faith|piety)\b/i,
    /\b(?:diagnosis|treatment|patient|clinical|medical condition|healthcare professional)\b/i,
    /\b(?:statute|regulation|legal obligation|court|section|article of law)\b/i,
  ]);
  const religiousTermCount =
    text.match(
      /\b(?:Allah|Qur['’]an|Prophet(?:\s+Muhammad)?|hadiths?|haram|halal|duff|Hanbali|Maliki|Shafi['’]?i|Hanafi|Islamic jurisprudence)\b/gi
    )?.length ?? 0;
  const clinicalTermCount =
    text.match(
      /\b(?:diagnosis|treatment|patient|clinical|medical condition|healthcare professional|physician|symptoms?|therapy)\b/gi
    )?.length ?? 0;
  const legalTermCount =
    text.match(
      /\b(?:statute|regulation|legal obligation|court|section|article of law|plaintiff|defendant|jurisdiction)\b/gi
    )?.length ?? 0;

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
        "Use a reader-oriented reflective voice from the source claims only. Conditional second person is allowed, but preserve every hedge, fact, example, and causal relationship; add no illustrative detail.",
      postProcessTone: "english-reflective",
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
        "Use direct everyday English and regroup the source claims by idea. Preserve uncertainty and practical details exactly; do not add a narrator, rhetorical questions, anecdotes, or outside knowledge.",
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
        "Recompose from the source's claim units instead of rewriting sentence by sentence. Preserve the neutral point of view and factual scope, use ordinary vocabulary, and do not mirror the source's paragraph skeleton.",
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

  return {
    systemPrompt: `${CASUAL_NATURAL_PROMPT}\n\nMatch the source register. Do not force slang, fragments, rhetorical questions, or personal claims merely to sound human.`,
    temperature: writingPurpose === "Creative" ? 0.82 : 0.74,
    topP: 0.94,
    maxTokens: 1600,
    frequencyPenalty: 0,
    presencePenalty: 0,
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
// 4. Main post‑processing functions (with minor adjustments)
// ============================================================

export function addHumanTouches(text: string, tone: HumanizerPostProcessTone = "casual") {
  if (!text || text.length < 40) return text;

  let result = text.trim();

  if (tone.startsWith("english-") || tone === "casual") {
    // English voice should come from the source register and model prompt. Random
    // fragments and conjunctions create a new template instead of natural prose.
    result = removeSyntheticEnglishHumanizerPhrases(result);
    return cleanupEnglishSpacing(result);
  }

  if (tone === "ielts") {
    result = applyContractions(result);
    result = reduceRoboticHedging(result);
    result = enhanceVocabulary(result);
    result = strengthenOpinionVoice(result);
    result = varySentenceStarters(result, 0.3);
    result = addConjunctionStarts(result, 0.08);
    result = addNaturalImperfections(result, 0.12);
  }

  return cleanupEnglishSpacing(result);
}

export function enhanceVocabulary(text: string): string {
  if (!text || text.length < 60) return text;

  let result = text;
  const vocabularyMap: Array<[RegExp, string]> = [
    [/\bvery important\b/gi, "crucial"],
    [/\bvery significant\b/gi, "enormously significant"],
    [/\bvery big\b/gi, "massive"],
    [/\bvery bad\b/gi, "severe"],
    [/\bvery good\b/gi, "remarkable"],
    [/\bvery difficult\b/gi, "incredibly challenging"],
    [/\ba big problem\b/gi, "a serious issue"],
    [/\ba lot of\b/gi, "a great deal of"],
    [/\blots of\b/gi, "countless"],
    [/\bmany people think\b/gi, "many people argue"],
    [/\bsome people think\b/gi, "some people argue"],
    [/\bnot good\b/gi, "problematic"],
    [/\bbad effect\b/gi, "detrimental effect"],
    [/\bgood effect\b/gi, "positive impact"],
    [/\bhelps\b/gi, "can genuinely help"],
    [/\bimportant\b/gi, "important"],
  ];

  vocabularyMap.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

function makeReflectiveEnglishMoreDirect(text: string) {
  let result = text
    .replace(/\bcan be deeply painful\b/gi, "can hurt")
    .replace(/\bmuch more than just\b/gi, "more than")
    .replace(/\bIt gives people\b/g, "It can give you")
    .replace(
      /The financial impact also makes ([^.]+?) especially difficult\./gi,
      "Money makes $1 harder, too."
    )
    .replace(
      /\bThese concerns can create constant stress because\b/gi,
      "That worry can be constant because"
    )
    .replace(
      /\bIn addition,\s+([^.!?]+?), causing some people to feel\b/gi,
      "There is a social side to it, too: $1, and that can leave you feeling"
    )
    .replace(/\bwhen comparing themselves with\b/gi, "when you compare yourself with")
    .replace(/,\s*causing some people to feel\b/gi, ", and that can leave you feeling")
    .replace(/\bBeyond the practical challenges,\s*/gi, "")
    .replace(/([.!?]\s+)unemployment\b/g, "$1Unemployment")
    .replace(/\beven in individuals who are\b/gi, "even if you're")
    .replace(
      /\bPeople who are unemployed may\b/gi,
      "If you're unemployed, you may"
    )
    .replace(
      /\bThis emotional burden is often intensified by uncertainty, as\b/gi,
      "Uncertainty often makes this harder because"
    )
    .replace(
      /\bFor many people, it is this combination of\b/gi,
      "For many, it is that mix of"
    )
    .replace(
      /\bone of life['’]s most challenging experiences\b/gi,
      "one of the hardest experiences in life"
    );

  result = result.replace(/When someone[^.!?]*[.!?]/gi, (sentence) =>
    sentence
      .replace(/\bWhen someone\b/i, "When you")
      .replace(/\byou loses\b/gi, "you lose")
      .replace(/\byou struggles\b/gi, "you struggle")
      .replace(/\bor struggles\b/gi, "or struggle")
      .replace(/\bthey\b/gi, "you")
      .replace(/\btheir\b/gi, "your")
      .replace(/\bthemselves\b/gi, "yourself")
  );

  result = result.replace(/It can give you[^.!?]*[.!?]/gi, (sentence) =>
    sentence
      .replace(/\bthey are\b/gi, "you are")
      .replace(/\btheir\b/gi, "your")
  );

  result = result.replace(/If you're unemployed[^.!?]*[.!?]/gi, (sentence) =>
    sentence
      .replace(/\bthey are\b/gi, "you are")
      .replace(/\bthey're\b/gi, "you're")
      .replace(/\btheir\b/gi, "your")
  );

  result = result.replace(/Without a stable income[^.!?]*[.!?]/gi, (sentence) =>
    sentence
      .replace(/\bpeople may\b/i, "you may")
      .replace(/\btheir families\b/gi, "your family")
      .replace(/\btheir\b/gi, "your")
  );

  return result
    .replace(/\bIn addition, unemployment can be emotionally painful because\b/gi, "Unemployment can hurt emotionally, too, because")
    .replace(/\byou are\b/gi, "you're")
    .replace(/([.!?])\1+/g, "$1");
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
    .replace(/\bthe notion that\b/gi, "the idea that")
    .replace(/\bstem(?:s|med|ming)? from\b/gi, (match) => {
      const lower = match.toLowerCase();
      if (lower === "stems from") return "comes from";
      if (lower === "stemmed from") return "came from";
      if (lower === "stemming from") return "coming from";
      return "come from";
    })
    .replace(/\bsuch a possibility\b/gi, "that possibility")
    .replace(/\bclaims of this magnitude\b/gi, "claims like these")
    .replace(/\bthe majority of\b/gi, "most")
    .replace(/\bnumerous\b/gi, "many")
    .replace(/\bdue to a combination of\b/gi, "because of")
    .replace(/\bpersistent demand\b/gi, "continued demand")
    .replace(/\binstitutions face rising operational costs\b/gi, "universities also have rising operating costs")
    .replace(/\binvest substantial resources in(?:to)?\b/gi, "spend a lot of money on")
    .replace(/\bfurther elevate institutional costs\b/gi, "push costs up further")
    .replace(/\boffset tuition\b/gi, "reduce tuition costs")
    .replace(/\bcontinues to rank among the highest globally\b/gi, "remains one of the most expensive in the world")
    .replace(/\bfor a large portion of the student population\b/gi, "for many students")
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bprior to\b/gi, "before")
    .replace(/\bimportant considerations\b/gi, "things that matter")
    .replace(/\bare essential steps for a smooth trip\b/gi, "can make the trip easier")
    .replace(/\ballowing visitors to experience\b/gi, "so visitors can try")
    .replace(/\bmaking advance planning essential\b/gi, "so it is worth planning ahead")
    .replace(/\bcan significantly improve convenience\b/gi, "can make things easier")
    .replace(/\bTherefore,\s+/gi, "So, ")
    .replace(/\bTo date,\s+/gi, "So far, ")
    .replace(/\bfulfilled these criteria\b/gi, "met this standard")
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
export function finalHumanize(text: string, tone: HumanizerPostProcessTone = "casual"): string {
  // Delegate to Indonesian specific handler if needed
  if (
    tone === "indonesian-general" ||
    tone === "indonesian-academic" ||
    tone === "indonesian-professional"
  ) {
    return finalIndonesianHumanize(text, tone);
  }

  if (!text || text.length < 40) return text.trim();

  let result = text.trim();

  if (tone === "english-reflective") {
    result = makeReflectiveEnglishMoreDirect(result);
  }

  if (tone === "english-discursive") {
    result = makeDiscursiveEnglishMoreDirect(result);
  }

  // Apply base human touches
  result = addHumanTouches(result, tone);

  // Additional post‑processing specific to IELTS
  if (tone === "ielts") {
    // Allow some redundancy and imperfections (but we already added some)
    result = addNaturalRedundancy(result, 0.08);
    result = addNaturalImperfections(result, 0.08);
  }

  return cleanupEnglishSpacing(result);
}

// ============================================================
// 5. Helper functions (mostly unchanged, kept for completeness)
// ============================================================

function reduceGeneralAiPatterns(text: string): string {
  let result = text;
  const replacements: Array<[RegExp, string]> = [
    [/\bin today'?s fast-paced world\b/gi, "today"],
    [/\bplays a crucial role in\b/gi, "is important for"],
    [/\bplays an important role in\b/gi, "matters for"],
    [/\bserves as a testament to\b/gi, "shows"],
    [/\bit is important to note that\b/gi, "importantly"],
    [/\bfurthermore\b/gi, "also"],
    [/\bmoreover\b/gi, "also"],
    [/\bin conclusion\b/gi, "overall"],
    [/\butilize\b/gi, "use"],
    [/\bfacilitate\b/gi, "help"],
    [/\bsignificant\b/gi, "important"],
    [/\bcomprehensive\b/gi, "complete"],
    [/\bseamless\b/gi, "smooth"],
  ];

  replacements.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  return result.replace(/\s+—\s+/g, ", ");
}

function applyContractions(text: string): string {
  let result = text;
  const contractions: Array<[RegExp, string]> = [
    [/\bdo not\b/gi, "don't"],
    [/\bcannot\b/gi, "can't"],
    [/\bcan not\b/gi, "can't"],
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

function applyIndonesianCasualTouches(text: string): string {
  let result = text;
  const looksIndonesian = /\b(yang|dan|atau|karena|tidak|sangat|adalah|untuk|dengan|aku|kamu|kita)\b/i.test(result);

  if (!looksIndonesian) return result;

  const casualMap: Array<[RegExp, string, number]> = [
    [/\btidak\b/gi, "nggak", 0.35],
    [/\bsangat\b/gi, "banget", 0.28],
    [/\bsebenarnya\b/gi, "sebenernya", 0.22],
    [/\bakan\b/gi, "bakal", 0.18],
    [/\bmenurut saya\b/gi, "jujur aja, menurutku", 0.22],
  ];

  casualMap.forEach(([pattern, replacement, chance]) => {
    if (Math.random() < chance) {
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

function addSentenceFragments(text: string, chance: number): string {
  const fragments = [
    "And that's the thing.",
    "That's what I mean.",
    "Plain and simple.",
    "Honestly, it matters.",
    "You can feel the difference.",
  ];
  const sentences = splitSentences(text);

  if (sentences.length < 3 || Math.random() > chance) return text;

  const index = Math.min(sentences.length - 2, Math.max(1, Math.floor(Math.random() * sentences.length)));
  sentences.splice(index, 0, fragments[Math.floor(Math.random() * fragments.length)]);

  return sentences.join(" ");
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

function cleanupSpacing(text: string) {
  return text
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([\])}])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}
