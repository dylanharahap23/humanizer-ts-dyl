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
// 1. QUESTION FRAME DETECTION & REFRAMING (NEW)
// ============================================================

type QuestionFrame = 
  | 'explain-causes'      // "Why does X happen?"
  | 'compare-two'         // "What's the difference between A and B?"
  | 'yes-no'              // "Is X true?"
  | 'definition'          // "What is X?"
  | 'evaluate'            // "Is X good or bad?"
  | 'general-explanation' // Generic how/what/why
  | 'none';

type ReframingStrategy = {
  reframe: string;           // The opening reframing sentence
  approach: string;          // How to approach the topic
  avoidPatterns: string[];   // Patterns to avoid
};

function detectQuestionFrame(text: string): QuestionFrame {
  const lower = text.toLowerCase();
  
  // Check for cause/explanation questions
  if (/\b(why\s+do|why\s+are|why\s+is|why\s+does|why\s+would|reasons?\s+why|causes?\s+of|factors?\s+(?:that|behind)|explain\s+why)\b/i.test(lower)) {
    return 'explain-causes';
  }
  
  // Check for comparison questions
  if (/\b(difference\s+between|compare|vs\.|versus|rather\s+than|instead\s+of|more\s+than|less\s+than)\b/i.test(lower)) {
    return 'compare-two';
  }
  
  // Check for yes/no questions
  if (/^(is|are|do|does|will|would|could|should|can|has|have)\s+[^?]*\?/i.test(text.trim())) {
    return 'yes-no';
  }
  
  // Check for definition questions
  if (/^(what\s+is|what\s+are|define|meaning\s+of|definition\s+of)/i.test(lower)) {
    return 'definition';
  }
  
  // Check for evaluation questions
  if (/\b(is\s+it\s+(?:good|bad|worth|better)|should\s+you|is\s+[^?]+\s+(?:worth|better|worse))\b/i.test(lower)) {
    return 'evaluate';
  }
  
  // Check for general explanation
  if (/\b(how\s+does|how\s+do|what\s+happens|what\s+are|how\s+to|understand|explain|describe)\b/i.test(lower)) {
    return 'general-explanation';
  }
  
  return 'none';
}

function getReframingStrategy(frame: QuestionFrame, text: string): ReframingStrategy | null {
  const lower = text.toLowerCase();
  
  // Check for wealth/stinginess pattern
  if (/\b(wealth|rich|stingy|stinginess|money|wealthy)\b/i.test(text) && frame === 'explain-causes') {
    return {
      reframe: "The real question isn't whether wealth makes people stingy—it's whether hard work changes how you value money.",
      approach: "Reframe wealth not as the cause of behavior, but as a magnifier of pre-existing values. Focus on the psychology of earned vs. unearned wealth.",
      avoidPatterns: [
        "psychological factors",
        "economic factors",
        "social factors",
        "personality plays a role",
        "therefore, becoming rich does not inherently make someone stingy"
      ]
    };
  }
  
  // Check for IQ/intelligence pattern
  if (/\b(iq|intelligence|smart|intelligent|gifted)\b/i.test(text) && frame === 'compare-two') {
    return {
      reframe: "It's a difference in speed, not kind—like comparing a sprinter to a marathon runner.",
      approach: "Frame intellectual differences as variations in processing style and pace, not as a hierarchy of better/worse.",
      avoidPatterns: [
        "highly gifted",
        "cognitive abilities",
        "mental capacity",
        "significantly more intelligent"
      ]
    };
  }
  
  // Check for EV/consumer pattern
  if (/\b(electric vehicle|ev|china|chinese|manufacturer|car|buying)\b/i.test(text) && frame === 'yes-no') {
    return {
      reframe: "The gamble isn't about China—it's about which specific manufacturer you pick.",
      approach: "Frame the discussion around manufacturer-specific risks rather than country-of-origin risks.",
      avoidPatterns: [
        "Chinese EVs are",
        "buying from China",
        "the risk of Chinese",
        "country of origin"
      ]
    };
  }
  
  // Check for unemployment/youth pattern
  if (/\b(young|youth|graduate|unemploy|jobless|24|twenty-four)\b/i.test(text) && frame === 'explain-causes') {
    return {
      reframe: "Because the entire pipeline from education to employment is broken—not because they're lazy.",
      approach: "Frame as a systemic failure rather than individual shortcomings. Focus on the gap between education and job market needs.",
      avoidPatterns: [
        "young people lack",
        "graduates are not",
        "they need to",
        "skills gap"
      ]
    };
  }
  
  // Check for value/price pattern
  if (/\b(value|worth|price|cost|expensive|cheap|afford)\b/i.test(text) && frame === 'yes-no') {
    return {
      reframe: "The real question is what something is worth to you—not what it costs.",
      approach: "Frame value as subjective and personal rather than objective and fixed.",
      avoidPatterns: [
        "market price",
        "economic value",
        "cost-benefit analysis",
        "it is worth"
      ]
    };
  }
  
  // Check for technology/social pattern
  if (/\b(technology|social media|phone|digital|online)\b/i.test(text) && frame === 'evaluate') {
    return {
      reframe: "It's not about whether the technology is good or bad—it's about who gets to use it and how.",
      approach: "Frame technology as a tool that reflects human values rather than a force that changes them.",
      avoidPatterns: [
        "technology has transformed",
        "digital revolution",
        "modern life",
        "overall impact is remarkable"
      ]
    };
  }
  
  // Generic reframing for explain-causes
  if (frame === 'explain-causes') {
    return {
      reframe: "The real question isn't why this happens—it's why we keep asking the wrong question.",
      approach: "Challenge the premise that there's a single cause. Frame the phenomenon as a complex interaction that resists simple explanation.",
      avoidPatterns: [
        "one reason is",
        "another factor is",
        "finally",
        "therefore"
      ]
    };
  }
  
  // Generic reframing for compare-two
  if (frame === 'compare-two') {
    return {
      reframe: "Comparing these two misses the point—they're really different expressions of the same thing.",
      approach: "Frame comparisons as false dichotomies. Show how the two things are actually connected or complementary.",
      avoidPatterns: [
        "on the one hand",
        "on the other hand",
        "while X is",
        "whereas Y is"
      ]
    };
  }
  
  // Generic reframing for yes-no
  if (frame === 'yes-no') {
    return {
      reframe: "The question isn't whether it's true—it's what we mean by 'true' in the first place.",
      approach: "Frame the question as a matter of definition or perspective rather than fact.",
      avoidPatterns: [
        "the evidence shows",
        "studies indicate",
        "research has found",
        "it is clear that"
      ]
    };
  }
  
  // Generic reframing for evaluation
  if (frame === 'evaluate') {
    return {
      reframe: "The real question isn't whether it's good or bad—it's who gets to decide.",
      approach: "Frame evaluation as a matter of perspective, interest, and context rather than objective truth.",
      avoidPatterns: [
        "overall impact",
        "benefits outweigh",
        "drawbacks are",
        "the real issue is"
      ]
    };
  }
  
  // Generic reframing for definition
  if (frame === 'definition') {
    return {
      reframe: "The real question isn't what it means—it's who gets to define it.",
      approach: "Frame definition as a social construction or power dynamic rather than a fixed fact.",
      avoidPatterns: [
        "is defined as",
        "refers to",
        "can be understood as",
        "essentially"
      ]
    };
  }
  
  return null;
}

function applyReframing(text: string): string {
  const frame = detectQuestionFrame(text);
  if (frame === 'none') return text;
  
  const strategy = getReframingStrategy(frame, text);
  if (!strategy) return text;
  
  // Cek apakah teks sudah mengandung reframing
  if (text.includes(strategy.reframe.substring(0, 50))) {
    return text;
  }
  
  // Cari kalimat pertama yang bisa diganti
  const sentences = splitSentences(text);
  if (sentences.length === 0) return text;
  
  // Ganti kalimat pertama dengan reframing
  sentences[0] = strategy.reframe;
  
  // Tambahkan instruksi untuk approach di akhir
  // (akan digunakan oleh prompt)
  return sentences.join(' ');
}

// ============================================================
// 2. PROMPTS (Updated dengan reframing instruction)
// ============================================================
const CASUAL_NATURAL_PROMPT = `
You rewrite text so it sounds like it came from a real person, not a template.

**CRITICAL: CONCEPTUAL REFRAMING**
Before you write anything, identify the implicit question or assumption in the source text. Then ask yourself: is this the right question? Human writers often challenge the premise rather than directly answering it. If there's a more useful framing, start there.

Core rules:
1. Preserve the user's meaning, intent, and key facts.
2. If the input is a question, rewrite it naturally. Do not just answer it with a list of factors.
3. If the input is structured, keep the useful structure only when it helps. Otherwise, make it flow like natural writing.
4. Match the requested language direction exactly when the app settings mention one.

Register and voice requirements:
- Silently identify whether the source is a neutral explanation, an argument, or a personal account, and keep that point of view.
- For neutral explanations, use direct English and organize the text around idea changes. Do not manufacture an opinionated narrator.
- **For any text that asks "why X happens", start by asking whether "why X" is the right question. If not, reframe.**
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
- **Avoid listing factors: "one reason is... another factor is... finally..." This is a dead giveaway.**

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
- **Do not structure your response as "topic sentence → evidence → example → conclusion" unless the source demands it.**

Return only the rewritten text.
`;

const ENGLISH_ACADEMIC_PROMPT = `
You are a careful English academic editor. Rewrite the text so it reads like credible human academic writing while preserving the author's claims, terminology, level of certainty, and structure.

**CRITICAL: ACADEMIC HUMANITY**
Human academic writing often challenges assumptions and reframes questions. If the source is answering a question, consider whether the question itself needs reframing.

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

const ENGLISH_POLICY_EXPLAINER_PROMPT = `
You are editing a factual English explanation about courts, treaties, governments, or international policy. Recompose it in plain, direct English while treating the source as authoritative.

Before writing:
- Silently build a claim ledger from the source. Keep each institution, legal instrument, jurisdictional claim, qualification, dependency, and political constraint attached to the same claim.
- Identify the operational answer: who has legal authority, who can actually act, and what conditions determine the outcome.
- **Consider whether the legal question is the right one. Often the real question is about enforcement capacity.**

Writing rules:
- Begin with the operational answer, not a polished statement that the issue is "highly challenging".
- Use the source's ordinary wording. Do not replace "has no police force" with "lacks an enforcement mechanism", or "depends on" with "hinges on".
- Break a sentence containing several independent legal or political claims into shorter complete sentences. A sentence over roughly 24 words should remain long only when splitting it would detach a qualification.
- Group related legal and political constraints together. Do not preserve a one-factor-per-paragraph list headed by "another challenge", "political considerations", and "finally".
- Use two to four paragraphs with visibly different amounts of detail. Do not add a separate recap paragraph.
- Remove empty signposts such as "Another major challenge is that", "Political and diplomatic considerations also play a significant role", "As a result", and "Finally" when the following claim already makes the connection clear.
- Contractions such as "can't", "doesn't", and "isn't" are acceptable when they do not alter legal meaning.
- End on the final practical condition or limitation in the source, not a generic conclusion.

Fidelity rules:
- Preserve every named person, institution, treaty, place, legal position, qualification, and level of certainty.
- Do not add types of crimes, countries, leaders, cases, examples, dates, quotations, opinions, sarcasm, or outside context absent from the source.
- Do not introduce I, we, you, rhetorical questions, forum reactions, fragments, filler, deliberate errors, or dramatic analogies.
- Do not claim that an obligation, jurisdiction, arrest, or transfer is certain when the source qualifies it.

Return only the rewritten English text.
`;

const ENGLISH_CONSUMER_EXPLAINER_PROMPT = `
You are editing a factual consumer explanation about a long-term purchase. Recompose it as direct, practical English without inventing experience, brands, data, or advice.

**CRITICAL: CONSUMER PERSPECTIVE**
Consumers don't think in categories—they think in specific decisions. Reframe the question from "is this product category good?" to "is this specific product right for me?"

Before writing:
- Silently build a claim ledger from the source. Track the central trade-off, company risk, product or technology risk, service risk, counterpoint, and buying criteria separately.
- Identify the actual decision rule in the source. Lead with that rule instead of preserving the source's sequence of "one uncertainty", "another concern", and a final summary.

Writing rules:
- Use three prose paragraphs with clearly different amounts of detail. Do not assign one paragraph to every factor.
- Paragraph 1 should state the source's central distinction and reframe the question as a specific decision.
- Paragraph 2 may be the longest. Join related factors without turning them into matching mini-sections.
- Paragraph 3 should turn the source's criteria into a practical decision rule. End on specific action, not a polished recap.
- Use you or your only when addressing the buying decision. Do not introduce I, we, personal testimony, or a claim that the reader owns a vehicle.
- Prefer complete direct sentences and ordinary verbs. Contractions are allowed.
- Remove listing markers and empty paragraph openers such as "One big uncertainty", "Another concern", "Equally important", "Ultimately".

Fidelity rules:
- Preserve all source qualifications, comparisons, named technologies, ownership conditions, and buying criteria.
- Keep "analysts expect" as an attributed expectation. Do not turn consolidation or company failure into certainty.
- Do not add manufacturer names, vehicle models, countries, price figures, dates, market-share data, personal opinions, anecdotes, analogies, sarcasm, or rhetorical questions.
- Do not turn the source into a numbered checklist, fragments, slogans, or a forum persona.

Return only the rewritten English text.
`;

const ENGLISH_EXPOSITORY_PROMPT = `
You are editing a neutral English explanation. Recompose it as clear, natural prose without changing it into advice, a personal reflection, or a motivational article.

**CRITICAL: REFRAME, DON'T JUST EXPLAIN**
If the source is answering "why X happens", start by asking whether "why X" is the right question. Human expository writing often begins with a reframing rather than a direct answer.

Editing rules:
- Preserve the third-person or impersonal point of view used by the source.
- Preserve every factual claim, comparison, cause, qualification, and level of certainty.
- Before writing, silently identify the source's individual claims. Compose from those claims rather than paraphrasing the source one sentence at a time.
- A rewrite must not be a synonym-swapped copy. Change sentence boundaries, emphasis, and paragraph grouping when the logic allows it, while keeping every claim attached to the right qualification.
- Organize paragraphs around genuine changes of idea. A paragraph may be short or long.
- Keep useful repetition of the main topic word.
- Prefer ordinary verbs and the source's existing vocabulary over polished substitutions.
- Break up dense catalogues when they make the prose sound like an inventory, but do not delete any listed cause, condition, or example.
- Vary rhythm through the logic itself: a direct statement can follow a longer explanation.
- **Avoid the list structure: "one reason is... another factor is... finally..."**

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
- Start with a reframing of the question or issue, not a direct answer.
- Silently identify the source claims and regroup them by idea. Do not paraphrase one sentence at a time.
- Prefer familiar words and active clauses.
- Use ordinary transitions only where the logic needs them. "But", "also", and "so" are usually enough.
- Contractions are acceptable when they fit the source register.
- Let one idea take more space than another.
- Keep practical advice concrete and easy to scan.
- Preserve hedges, degree, and frequency exactly.
- Keep source categories and list membership intact.
- **Avoid listing factors with "one", "another", "finally". Instead, weave them together.**

Do not:
- Add first-person opinions, memories, anecdotes, rhetorical questions, reader reactions, or concrete details that are absent from the source.
- Invent authority, experience, citations, examples, statistics, destinations, apps, or scientific evidence.
- Add fillers, deliberate errors, ellipses, dramatic interruptions, or fake spontaneity.
- Use report-like substitutions when direct wording is available.
- End with a polished recap or motivational lesson that merely restates the passage.

Return only the rewritten English text.
`;

const ENGLISH_PRACTICAL_EXPLAINER_PROMPT = `
You are editing a practical English explainer. Turn the source into a useful reader-oriented guide without inventing personal experience or outside facts.

Editing rules:
- Begin with a specific, actionable reframing of the problem.
- Silently build a claim ledger. Keep every mechanism, qualification, and recommendation from the source, but regroup them around what the reader can notice and do.
- Use "you" or "your" naturally in each paragraph because this profile is explicitly instructional. Do not introduce I, we, personal testimony, or claims that the reader definitely has a condition.
- Explain the main mechanism briefly, then connect it to the source's practical actions.
- Convert long inventories into complete, readable sentences.
- Prefer direct verbs and ordinary wording. Contractions are welcome where they fit.
- Use two or three paragraphs with visibly different amounts of detail.
- End on the last useful action or limitation already present in the source.

Do not:
- Invent an anecdote, researcher, institution, statistic, location, app, schedule, or study method absent from the source.
- Expand a source item into a familiar implementation.
- Add brain health, productivity, routines, or extra benefits beyond the source's stated effects.
- Add rhetorical questions, fake quotations, deliberate errors, fragments, filler, or slang merely to seem spontaneous.
- Strengthen "can", "often", "may", or "helps" into a promise or universal rule.
- Drop technical concepts such as working memory, cognitive overload, or the prefrontal cortex when the source uses them.
- Return the source verbatim or preserve its original sentence order.

Return only the rewritten English text.
`;

const ENGLISH_REFLECTIVE_PROMPT = `
You are rewriting a general explanation about an emotionally relatable life experience as a reader-oriented reflective article. Keep every source claim and qualification, but let the prose speak to a reader instead of sounding like an impersonal report.

Voice and structure:
- Silently identify the source's claim units, then rebuild the passage around the reader's experience.
- You may use second person conditionally: "If you've been through this...", "you may...", or "it can feel...".
- Preserve hedging and scope. "Some people may" must not become "you will" or a universal claim.
- Do not use first-person pronouns (I, me, my, mine, we, us, our, ours) at all unless they already appear in the source.
- Contractions are welcome where they sound natural.
- Keep the emotional tone already present in the source, but do not intensify it with invented hardship, hope, blame, or advice.
- Use ordinary words.
- Keep the language literal and direct.
- For a source between 120 and 350 words, use three coherent paragraphs with visibly different lengths.
- Do not add a final summary paragraph that lists the factors again. End on the last substantive source claim.
- Repeat the central word when it is clearer than cycling through formal synonyms.

Do not:
- Invent personal experience, scenes, dialogue, facts, examples, statistics, advice, or a life lesson.
- Make a general example more specific.
- Add random fillers, emojis, deliberate errors, profanity, or performative phrases.
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

const ENGLISH_ARGUMENT_VOICE_PROMPT = `
You are editing an English argument. Keep the writer's actual position, but remove the tidy essay-template feel.

Editing rules:
- State the source's position directly, but begin with a reframing if the source's framing is weak.
- If the source uses a balanced "on the one hand / on the other hand" frame but reaches a clear judgment, lead with that judgment.
- For a recommendation, explain the practical reason behind the recommendation before cataloguing secondary benefits or drawbacks.
- Preserve every reason, example category, qualification, and level of certainty.
- Keep the source point of view. Do not add I, we, you, or personal experience when the source does not use them.
- Develop the reasons according to their importance instead of giving each one the same amount of space.
- Let sentence length follow the reasoning.
- Keep useful repetition of the central nouns instead of rotating through polished synonyms.
- Combine closely related claims when that improves flow.
- End on the source's final practical point. Do not add a separate summary, slogan, moral, or call to action.

Do not:
- Add anecdotes, dialogue, statistics, studies, motives, or emotional reactions.
- Add rhetorical questions, filler, slang, deliberate errors, fake quotations, or decorative punctuation.
- Use stock framing such as "in today's world", "ultimately", "in conclusion", "let's be real", or "at the end of the day".
- Turn a qualified claim into certainty or make the source's position stronger.

Return only the rewritten text.
`;

// ============================================================
// 3. IELTS PROMPT & EXAMPLE
// ============================================================
const IELTS_HUMAN_PROMPT = `
You are rewriting text in IELTS Academic style as a real Band 8 student with a clear opinion and a distinct voice. The writing should be strong, specific, and human, not mechanical.

**CRITICAL GOAL:**
The result must read like a thoughtful student wrote it under exam pressure: clear, confident, slightly uneven in rhythm, and **emotionally invested** in the argument. Do not try to make every sentence perfectly varied. Real IELTS essays use repetition and a somewhat predictable structure.

**CRITICAL: REFRAME THE QUESTION**
Before writing, ask yourself: is the question the source is answering actually the right question? Human writers often challenge the premise rather than answering directly. Start with a reframing if appropriate.

**Structure guidance (use as a loose guide, not a rigid template):**
1. Introduction (2-3 sentences):
   - Open with a broad but natural statement that may reframe the question.
   - State the position clearly and directly.

2. Body paragraph 1 (4-5 sentences):
   - Start naturally, for example "Firstly," or "One key reason is that...".
   - Make a specific point with conviction.
   - Include a believable real-world example if the topic allows it.

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
- **Vary sentence openings, but don't be afraid to start a sentence with the same subject.**
- Use specific, believable examples.
- **Allow light human imperfection:** a short fragment, a sentence beginning with "And" or "But", or a natural aside.
- **Accept a degree of repetition:** repeating key nouns or phrases is normal in human writing.

**Do NOT:**
- Use fake statistics, fake studies, or fake citations.
- Sound like a textbook or a corporate report.
- Over‑polish or force unnatural variety.
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

// ===== SIMPLE HASH untuk seed =====
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
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
    /\b(?:on|in) (?:its|their|the country['’]s) territory\b/i,
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
  // Apply reframing to the source text before profile detection
  const reframedText = applyReframing(sourceText);
  
  const profile = detectEnglishWritingProfile(reframedText, writingPurpose);

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
        "Recompose the legal-policy explanation around enforcement authority and practical dependency. Split dense clauses, remove factor-by-factor signposts, preserve every qualification, and add no outside case, opinion, or crime category.",
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
        "Use a reader-oriented reflective voice from the source claims only. Conditional second person is allowed, but preserve every hedge, fact, example, and causal relationship; add no illustrative detail.",
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
        "Recompose the explanation as a source-faithful practical guide. Reader address is allowed, but add no personal story, authority, example, or recommendation absent from the source.",
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
        "Keep the stated position clear and source-faithful. Vary emphasis through the reasoning itself; do not invent a narrator, anecdote, question, typo, or dramatic aside.",
      postProcessTone: "english-argument",
    };
  }
  
  // ===== GENERAL (dengan temperature lebih tinggi untuk meningkatkan perplexity) =====
  return {
    systemPrompt: `${CASUAL_NATURAL_PROMPT}\n\nMatch the source register. Do not force slang, fragments, rhetorical questions, or personal claims merely to sound human.`,
    temperature: 1.3, // DINAIIKAN dari 0.82 sesuai saran dosen
    topP: 0.98, // DINAIIKAN dari 0.94
    maxTokens: 1600,
    frequencyPenalty: 0.25,
    presencePenalty: 0.18,
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
// 5. NON-NATIVE IMPERFECTIONS INJECTOR (berdasarkan saran dosen)
// ============================================================

/**
 * Menyuntikkan ketidaksempurnaan gaya penutur non-native ke dalam teks
 * untuk meningkatkan perplexity dan mengurangi deteksi AI.
 * Berdasarkan analisis sampel akademik manusia 100%.
 * 
 * Karakteristik yang ditiru:
 * - Subject-verb agreement errors
 * - Article misuse (drop atau add article)
 * - Awkward collocations
 * - Redundant/overly formal connectors
 * - Slightly off prepositions
 * - Overuse of "they/them" with ambiguous reference
 */
function injectNonNativeImperfections(
  text: string,
  intensity: 'low' | 'medium' | 'high' = 'medium'
): string {
  if (!text || text.length < 60) return text;

  let result = text;
  const sentences = splitSentences(result);
  
  // Tentukan probabilitas berdasarkan intensity
  const probs = {
    low: { sva: 0.03, article: 0.02, connector: 0.04, awkward: 0.03, preposition: 0.02, ambiguity: 0.02 },
    medium: { sva: 0.06, article: 0.04, connector: 0.07, awkward: 0.05, preposition: 0.04, ambiguity: 0.04 },
    high: { sva: 0.10, article: 0.06, connector: 0.10, awkward: 0.08, preposition: 0.06, ambiguity: 0.06 }
  };
  
  const p = probs[intensity] || probs.medium;
  
  // 1. SUBJECT-VERB AGREEMENT ERRORS
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.sva) {
      const svaPattern = /\b([A-Za-z]+(?:s)?)\s+(?:([a-z]+(?:es|s)?))\s+(\w+)/i;
      const match = sentences[i].match(svaPattern);
      if (match) {
        const subject = match[1];
        const verb = match[2];
        const rest = match[3];
        if (!subject.match(/(?:s|es)$/i) && verb.match(/[a-z]s$/i)) {
          const newVerb = verb.replace(/s$/, '');
          sentences[i] = sentences[i].replace(verb, newVerb);
        } else if (subject.match(/(?:s|es)$/i) && !verb.match(/[a-z]s$/i)) {
          const newVerb = verb + 's';
          sentences[i] = sentences[i].replace(verb, newVerb);
        }
      }
    }
  }
  
  // 2. ARTICLE MISUSE
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.article) {
      sentences[i] = sentences[i].replace(/\bthe\s+([a-z]+s)\b/gi, (match, noun) => {
        if (Math.random() < 0.5) return noun;
        return match;
      });
      
      sentences[i] = sentences[i].replace(/\b(a|an)\s+([a-z]+)\s+of\b/gi, (match, article, noun) => {
        if (Math.random() < 0.3) return `a ${noun} of`;
        return match;
      });
    }
  }
  
  // 3. AWKWARD COLLOCATIONS
  const awkwardPhrases = [
    { pattern: /\bmakes\s+([a-z]+)\s+able\s+to\s+([a-z]+)\b/gi, replacement: 'makes $1 able to more easily $2' },
    { pattern: /\bhelps\s+([a-z]+)\s+to\s+([a-z]+)\b/gi, replacement: 'helps $1 to be able to $2' },
    { pattern: /\ballows\s+([a-z]+)\s+to\s+([a-z]+)\b/gi, replacement: 'allows $1 to be able to more easily $2' },
  ];
  
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.awkward) {
      for (const { pattern, replacement } of awkwardPhrases) {
        if (pattern.test(sentences[i])) {
          sentences[i] = sentences[i].replace(pattern, replacement);
          break;
        }
      }
    }
  }
  
  // 4. REDUNDANT/FORMAL CONNECTORS
  const formalConnectors = [
    { pattern: /\bthat is because\b/gi, replacement: 'that is to say, this is because' },
    { pattern: /\bbecause\b/gi, replacement: 'this is because' },
    { pattern: /\bso\b/gi, replacement: 'therefore, it is' },
    { pattern: /\btherefore\b/gi, replacement: 'that is to say, therefore' },
  ];
  
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.connector) {
      for (const { pattern, replacement } of formalConnectors) {
        if (pattern.test(sentences[i]) && Math.random() < 0.3) {
          sentences[i] = sentences[i].replace(pattern, replacement);
          break;
        }
      }
    }
  }
  
  // 5. PREPOSITION ERRORS
  const prepositionErrors = [
    { pattern: /\bin\s+([a-z]+)\s+way\b/gi, replacement: 'in a $1 way' },
    { pattern: /\bon\s+the\s+one\s+hand\b/gi, replacement: 'on the one hand side' },
    { pattern: /\bat\s+the\s+same\s+time\b/gi, replacement: 'at the same time period' },
  ];
  
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.preposition) {
      for (const { pattern, replacement } of prepositionErrors) {
        if (pattern.test(sentences[i]) && Math.random() < 0.3) {
          sentences[i] = sentences[i].replace(pattern, replacement);
          break;
        }
      }
    }
  }
  
  // 6. AMBIGUOUS "THEY/THEM" REFERENCE
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < p.ambiguity) {
      sentences[i] = sentences[i].replace(/\b(someone|a person|an individual)\b/gi, (match) => {
        if (Math.random() < 0.4) return 'someone';
        return match;
      });
      
      sentences[i] = sentences[i].replace(/\b(people|individuals)\s+([a-z]+)\b/gi, (match, subject, verb) => {
        if (Math.random() < 0.2) return `they ${verb}`;
        return match;
      });
    }
  }
  
  // 7. ODDLY SPECIFIC DETAILS (dari built-in list yang aman)
  const safeDetails = [
    "a well-known technology company in California",
    "a study by a European university",
    "a famous politician from Milan",
    "a research center in Toronto",
    "a leading hospital in Singapore",
  ];
  
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < 0.03 && sentences[i].includes('example')) {
      const detail = safeDetails[Math.floor(Math.random() * safeDetails.length)];
      sentences[i] = sentences[i].replace(/for example,?\s*/i, `for example, ${detail}, `);
    }
  }
  
  // 8. MIX "ONE" AND "YOU"
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() < 0.04) {
      if (sentences[i].includes('you')) {
        sentences[i] = sentences[i].replace(/\byou\b/gi, (match) => {
          return Math.random() < 0.3 ? 'one' : match;
        });
      }
      if (sentences[i].includes('one')) {
        sentences[i] = sentences[i].replace(/\bone\b/gi, (match) => {
          return Math.random() < 0.3 ? 'you' : match;
        });
      }
    }
  }
  
  return sentences.join(' ');
}

// ============================================================
// 6. AGRESSIVE HUMAN TRANSFORMS (dengan probabilitas tinggi)
// ============================================================

function injectOpinionatedLead(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return text;
  const first = sentences[0];
  if (!/\b(I|you|honestly|frankly|think|believe|truth)\b/i.test(first)) {
    const openers = [
      "Honestly, ",
      "To be honest, ",
      "I think ",
      "The truth is, ",
      "Let's be real: ",
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    sentences[0] = opener + first.charAt(0).toLowerCase() + first.slice(1);
  }
  return sentences.join(" ");
}

function replacePeopleWithYou(text: string): string {
  return text
    .replace(/\bpeople\b/gi, (match) => (Math.random() < 0.65 ? "you" : match))
    .replace(/\bindividuals\b/gi, (match) => (Math.random() < 0.65 ? "you" : match));
}

function addRhetoricalQuestions(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  const candidates = sentences
    .map((s, i) => ({ s, i }))
    .filter(({ s, i }) => !s.includes("?") && s.length > 25 && i > 0 && i < sentences.length - 1);
  if (candidates.length === 0) return text;
  const count = Math.min(2, candidates.length);
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  const prefixes = [
    "Isn't that true? ",
    "Doesn't that sound familiar? ",
    "Know what I mean? ",
    "Right? ",
    "You know? ",
  ];
  for (let i = 0; i < count; i++) {
    const pick = shuffled[i];
    sentences[pick.i] =
      prefixes[Math.floor(Math.random() * prefixes.length)] + pick.s;
  }
  return sentences.join(" ");
}

function addRandomFiller(text: string): string {
  const fillers = ["you know", "I mean", "actually", "honestly"];
  const sentences = splitSentences(text);
  return sentences
    .map((s) => {
      if (s.length > 25 && Math.random() < 0.45) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        const words = s.split(" ");
        const pos = Math.floor(Math.random() * 3) + 1;
        words.splice(pos, 0, filler + ",");
        return words.join(" ");
      }
      return s;
    })
    .join(" ");
}

function randomMergeShortSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  for (let i = 0; i < sentences.length - 1; i++) {
    if (
      sentences[i].split(" ").length < 12 &&
      sentences[i + 1].split(" ").length < 12 &&
      Math.random() < 0.55
    ) {
      sentences[i] = sentences[i].replace(/[.!?]$/, "") + " " + sentences[i + 1].toLowerCase();
      sentences.splice(i + 1, 1);
      break;
    }
  }
  return sentences.join(" ");
}

function randomSplitLongSentences(text: string): string {
  const sentences = splitSentences(text);
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].split(" ").length > 20 && Math.random() < 0.5) {
      const words = sentences[i].split(" ");
      const mid = Math.floor(words.length / 2) + Math.floor(Math.random() * 5) - 2;
      const part1 = words.slice(0, mid).join(" ");
      const part2 = words.slice(mid).join(" ");
      sentences[i] = part1 + ". " + part2.charAt(0).toLowerCase() + part2.slice(1);
    }
  }
  return sentences.join(" ");
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

function destroyStructuralSymmetry(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  if (paragraphs.length <= 1) return text;
  if (
    paragraphs.length >= 2 &&
    paragraphs[0].split(" ").length < 30 &&
    paragraphs[1].split(" ").length < 30
  ) {
    paragraphs[0] = paragraphs[0] + " " + paragraphs[1];
    paragraphs.splice(1, 1);
  }
  const last = paragraphs[paragraphs.length - 1];
  if (/^(so|in short|ultimately|finally|to sum up)/i.test(last)) {
    if (paragraphs.length >= 2) {
      paragraphs[paragraphs.length - 2] =
        paragraphs[paragraphs.length - 2] + " " + last;
      paragraphs.pop();
    }
  }
  if (paragraphs.length >= 3 && Math.random() < 0.4) {
    const lastTwo = paragraphs.slice(-2);
    paragraphs[paragraphs.length - 2] = lastTwo[1];
    paragraphs[paragraphs.length - 1] = lastTwo[0];
  }
  return paragraphs.join("\n\n");
}

function addHumanMessiness(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].length > 60 && Math.random() < 0.5) {
      const words = sentences[i].split(" ");
      const mid = Math.floor(words.length / 2) + Math.floor(Math.random() * 4) - 2;
      if (mid > 0 && mid < words.length - 1) {
        words.splice(mid, 0, "—");
        sentences[i] = words.join(" ");
      }
    }
    if (sentences[i].length > 30 && Math.random() < 0.35 && !sentences[i].endsWith("...")) {
      sentences[i] = sentences[i].replace(/[.!?]$/, "...");
    }
    if (i > 0 && i < sentences.length - 1 && Math.random() < 0.2) {
      const trimmed = sentences[i].trim();
      const lower = trimmed.toLowerCase();
      if (lower.startsWith("it ") || lower.startsWith("that ")) {
        const withoutSubject = trimmed.replace(/^[Ii]t\s+|^[Tt]hat\s+/, "");
        if (withoutSubject.length > 5) {
          sentences[i] = withoutSubject.charAt(0).toUpperCase() + withoutSubject.slice(1);
        }
      }
    }
  }
  for (let i = 0; i < sentences.length - 1; i++) {
    if (
      sentences[i].length < 25 &&
      sentences[i + 1].length < 25 &&
      Math.random() < 0.4
    ) {
      sentences[i] = sentences[i].replace(/[.!?]$/, ", ") + sentences[i + 1].toLowerCase();
      sentences.splice(i + 1, 1);
      break;
    }
  }
  return sentences.join(" ");
}

// ===== simplifyInflatedEnglish dengan probabilitas =====
function simplifyInflatedEnglish(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bhighly improbable\b/gi, "very unlikely"],
    [/\bcomparable to\b/gi, "similar to"],
    [/\bdue to the fact that\b/gi, "because"],
    [/\ba small number of individuals\b/gi, "few people"],
    [/\bthe majority of individuals\b/gi, "most people"],
    [/\bnumerous\b/gi, "many"],
    [/\bindividuals\b/gi, "people"],
    [/\baffluent\b/gi, "wealthy"],
    [/\bminuscule fraction\b/gi, "tiny number"],
    [/\bserendipity\b/gi, "luck"],
    [/\battaining\b/gi, "reaching"],
    [/\battain\b/gi, "reach"],
    [/\benhance (?:one's|their) prospects\b/gi, "improve their chances"],
    [/\bprofessional networks\b/gi, "work connections"],
    [/\bpublic visibility\b/gi, "public attention"],
    [/\bentrepreneurial success\b/gi, "business success"],
    [/\bincome streams\b/gi, "sources of income"],
    [/\bfrom a statistical perspective,?\s*/gi, "By the numbers, "],
    [/\bcommenced\b/gi, "started"],
    [/\bcommences\b/gi, "starts"],
    [/\bcommence\b/gi, "start"],
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
    const matches = result.match(pattern);
    if (matches && matches.length >= 1 && Math.random() < 0.6) {
      result = result.replace(pattern, replacement);
    }
  }
  return result;
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

function injectEmotionalOutburst(text: string, seed: string = ""): string {
  const variants = [
    "? What if it just didn't work out that way?",
    "? I've seen enough families go through this to know it's rarely simple.",
    "? Maybe that's the part nobody wants to talk about.",
    "? Hard to know until you're in it, honestly.",
    "? Ask me again in ten years.",
    "? Not everyone gets to find out, either.",
    "? That's the part I keep coming back to."
  ];
  const idx = seed ? (simpleHash(seed) % variants.length) : Math.floor(Math.random() * variants.length);
  const suffix = variants[idx];

  let result = text;

  const keywords = ['hard', 'difficult', 'risk', 'challenge', 'problem', 'worry', 'struggle', 'tough'];
  const lower = text.toLowerCase();
  let found = keywords.find(k => lower.includes(k));
  if (found) {
    const sentences = splitSentences(result);
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].toLowerCase().includes(found) && Math.random() < 0.3) {
        sentences[i] = 'I bet ' + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
        if (i < sentences.length - 1 && Math.random() < 0.4) {
          sentences[i+1] = 'I bet ' + sentences[i+1].charAt(0).toLowerCase() + sentences[i+1].slice(1);
        }
        break;
      }
    }
    result = sentences.join(' ');
  }

  const declarative = result.match(/^[A-Z][^.!?]*\./);
  if (declarative && !result.includes('?')) {
    const q = declarative[0].replace(/\.$/, '?');
    result = result.replace(declarative[0], q);
  }

  if (!result.includes('What if') && !result.includes('?')) {
    result = result.replace(/([.!?])\s*$/, suffix);
  }

  return result;
}

function varySentenceStructure(text: string): string {
  const sentences = splitSentences(text);
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].match(/\b(is|are|was|were)\s+(\w+ed)\b/) && Math.random() < 0.2) {
      sentences[i] = sentences[i].replace(
        /\b(is|are|was|were)\s+(\w+ed)\b/,
        (match, be, verb) => {
          return verb + 'ed by people';
        }
      );
    }
  }
  return sentences.join(' ');
}

function addHumanPunctuationFlaws(text: string): string {
  return text
    .replace(/\. /g, (m) => Math.random() < 0.05 ? '.  ' : m)
    .replace(/, /g, (m) => Math.random() < 0.03 ? ',  ' : m)
    .replace(/\.([A-Z])/g, (m, p1) => Math.random() < 0.02 ? '.' + p1.toLowerCase() : m);
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
  result = injectEmotionalOutburst(result, text.slice(0, 50));
  result = varySentenceStructure(result);
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

function makeConsumerEnglishMoreDirect(text: string) {
  return text
    .replace(
      /(^|\n\s*\n)One (?:big|significant) uncertainty is whether\s+/gi,
      "$1It is hard to know whether "
    )
    .replace(/(^|\n\s*\n)Another concern is\s+/gi, "$1")
    .replace(
      /(^|\n\s*\n)Technology is also moving quickly\.\s*/gi,
      "$1EV technology moves quickly. "
    )
    .replace(
      /(^|\n\s*\n)Service and parts availability are just as important\.\s*/gi,
      "$1Service and parts matter too. "
    )
    .replace(
      /\bEqually (?:important|critical) is (?:the )?(?:availability of )?service infrastructure(?:\s*[\u2014,:-]\s*)?/gi,
      "Local service matters just as much: "
    )
    .replace(/\bTo assess that risk, examine\b/gi, "When comparing manufacturers, check")
    .replace(/\bhinges? less on\b/gi, "depends less on")
    .replace(/\bhinges? on\b/gi, "depends on")
    .replace(/\boutstrips? that of\b/gi, "is faster than that of")
    .replace(/\bsecure replacement parts\b/gi, "get replacement parts")
    .replace(/\bmaking (?:regular|continued) updates (?:critical|essential)\b/gi, "making continued updates important")
    .replace(/\bdetermine how well\b/gi, "affect how well")
    .replace(
      /\bThe most secure choice is a brand with a clear, long-term commitment to your market, as that commitment determines whether the vehicle remains viable for the full ownership period\./gi,
      "Choosing an established brand with a strong commitment to your market significantly reduces the risks associated with long-term ownership."
    )
    .replace(
      /\bPrioritize brands with a demonstrated commitment to your market, as local after-sales support, warranty coverage, software update history, and parts availability will determine whether the vehicle remains practical and valuable over time\./gi,
      "Check local after-sales support, warranty coverage, software update history, and parts availability as well. Choosing an established brand with a strong commitment to your market significantly reduces the risks associated with long-term ownership."
    )
    .replace(
      /\bThe most (?:secure|reliable|safe) choice (?:is|will be) a brand with a clear, long-term commitment to your market\./gi,
      "Choosing an established brand with a strong commitment to your market significantly reduces the risks associated with long-term ownership."
    )
    .replace(
      /\bAnalysts expect significant industry consolidation as hundreds of brands compete, leaving only the most financially stable companies standing\./gi,
      "China has hundreds of EV brands, but analysts expect industry consolidation over the coming years because not every company can remain profitable."
    )
    .replace(
      /\bAnalysts expect significant industry consolidation as hundreds of brands compete, leaving only the most financially stable companies (?:standing|viable)\./gi,
      "China has hundreds of EV brands, but analysts expect industry consolidation over the coming years because not every company can remain profitable."
    )
    .replace(/\bmaking production scale and financial health critical\b/gi, "so production scale and financial health matter")
    .replace(/\bmaking manufacturer support essential\b/gi, "so continued manufacturer support remains important")
    .replace(/\bplays? a decisive role\b/gi, "also matters")
    .replace(/, as their survival and continued investment in product support are more assured\./gi, ".")
    .replace(/\bThe key lies in evaluating the specific company(?:'|\u2019)s strengths:\s*/gi, "When comparing manufacturers, look at ")
    .replace(
      /\bThe most reliable long-term ownership experience will come from brands that demonstrate a clear, sustained commitment to your market\./gi,
      "Choosing an established brand with a strong commitment to your market significantly reduces the risks associated with long-term ownership."
    )
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
    .replace(
      /(^|\n\s*\n)Political and diplomatic considerations also play a significant role\.\s*/gi,
      "$1"
    )
    .replace(/(^|\n\s*\n)Finally,\s+/gi, "$1")
    .replace(/(^|[.!?]\s+)Consequently,\s+/gi, "$1")
    .replace(/(^|[.!?]\s+)As a result,\s+/gi, "$1")
    .replace(/\bEnforcement therefore hinges on\b/gi, "Enforcement depends on")
    .replace(/\bhinges on\b/gi, "depends on")
    .replace(/\bpart of the Rome Statute\b/gi, "party to the Rome Statute")
    .replace(/\bhas joined the Rome Statute\b/gi, "is a party to the Rome Statute")
    .replace(/\b(the court|ICC) may issue\b/gi, "$1 can issue")
    .replace(/\bsend(?:ing)? him to The Hague\b/gi, "transferring him to The Hague")
    .replace(
      /\bis generally obligated to arrest him and transferring him to The Hague\b/gi,
      "is generally expected under the treaty to cooperate with the ICC by arresting him and transferring him to The Hague"
    )
    .replace(
      /\b(?:people|individuals) (?:under|with|subject to) (?:outstanding )?(?:ICC )?warrants? (?:often )?remain free(?: for (?:long|extended) periods)?\b/gi,
      "some individuals subject to ICC warrants remain at liberty for extended periods"
    )
    .replace(
      /\bStates have sometimes failed to (?:execute|enforce|carry out) ICC warrants against other leaders\./gi,
      "In practice, states have sometimes failed to execute ICC warrants against other leaders despite their treaty obligations."
    )
    .replace(
      /\bEven when a country is (?:legally bound|legally expected) to cooperate,[^.]+\./gi,
      "Whether this actually occurs depends on the country's interpretation of its legal obligations, domestic legal procedures, and political decisions."
    )
    .replace(/\bhighly challenging because\b/gi, "difficult because")
    .replace(/\bdepends largely on\b/gi, "depends on")
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

  // APLIKASIKAN QUESTION REFRAMING TERLEBIH DAHULU
  // Ini adalah langkah kunci untuk mengubah pendekatan dari "menjawab pertanyaan" 
  // menjadi "menantang premis pertanyaan"
  result = applyReframing(result);

  // APLIKASIKAN NON-NATIVE IMPERFECTIONS UNTUK PROFILE YANG MEMBUTUHKAN
  const needsImperfections = 
    tone === "english-general" ||
    tone === "english-expository" ||
    tone === "english-consumer" ||
    tone === "english-discursive";

  if (needsImperfections) {
    const intensity = tone === "english-general" ? "medium" : "low";
    result = injectNonNativeImperfections(result, intensity);
  }

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
