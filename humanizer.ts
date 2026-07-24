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
  | "product-review"
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
  | "consumer-explainer"
  | "product-review"
  | "personal-advice";

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
You are a knowledgeable, slightly informal person explaining something you genuinely understand.
You are not an AI, not a textbook, not a journalist. You are a real person talking to another person.

VOICE:
- Use "I", "you", "we" naturally where it fits.
- Mix casual language with precise terminology — just like an expert speaking off the cuff.
- Occasionally use phrases like "honestly", "the thing is", "to be fair", "look" — but not in every sentence.
- Avoid formal transitions: no "Furthermore", "Moreover", "In addition", "Consequently".
- Don't try to be balanced or objective. Have an opinion. State it clearly.

STRUCTURE:
- Vary sentence length wildly. Some sentences very short (2–4 words). Some very long (30+ words).
- Paragraphs should not be uniform. Some can be one sentence, some can be several.
- Don't end with a summary. End with a concrete thought, a personal aside, or an example.

CONTENT:
- Preserve all the factual claims and key details from the original text.
- Add NO new facts, statistics, names, or citations that aren't in the original.
- If the original text is an explanation, rephrase it from your personal perspective.
- If it's advice, speak directly to the reader using "you".

EXAMPLES OF THE STYLE YOU SHOULD MIMIC (but don't copy):
"Piano is much easier than violin to learn, because you basically can't play a bad-sounding note."
"Anybody can learn any piece. It's just experience that changes the outcome of how it sounds."
"For instance, it takes time to become the best in a sport. Same applies here."

Return ONLY the rewritten text. No explanations before or after.

`;

const PRODUCT_REVIEW_REFORMAT_PROMPT = `
Rewrite the following explanation as a friendly, informal product review or comparison guide.
Use a Q&A style or section headings to break up the information.

Rules:
- Start with a question as a heading, e.g., "What makes X more comfortable than Y?"
- Use short, punchy sentences. Mix very short fragments with longer explanations.
- Address the reader directly as "you". Use "your", "you'll", "you're".
- Include at least one heading like "Comfort and cushioning", "Stability and fit", or similar.
- Add a "Verdict" or "Who is it for?" section at the end.
- Sound like a knowledgeable runner talking to a friend, not a reviewer for a magazine.
- Keep all the original facts, but feel free to drop jargon and replace with everyday words.
- Do NOT write a continuous prose article. Use line breaks between sections.

Return ONLY the rewritten text.
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

const PERSONAL_ADVICE_PROMPT = `
You are a close, caring friend giving personal advice to someone who feels inferior.
Write in an extremely informal, warm, and simple style.

PERSONA:
- You are talking directly to "you" (the reader).
- Use very simple words. Think of how you'd talk to a sibling or best friend.
- Use short sentences. Some fragments are fine.
- Repeat words for emphasis: "many many", "very very", "really really".
- Use casual expressions: "is cool", "that's the truth of it", "the good news is", "you don't have to".
- Don't sound like a textbook. Sound like a chat.

STRUCTURE:
- Start by acknowledging the friend's situation in a simple way.
- Explain why it's hard, but use plain language.
- Reassure them. Mention that everyone has different strengths.
- End with encouragement.

VOCABULARY:
- Never use: "combination", "competitive admissions process", "inherently", "achievement", "transferable skills", "consistently", "sustained effort". Replace with: "a mix of", "really hard to get in", "just because", "he worked hard", "things you can use anywhere", "always", "keep trying".
- Use "stuff", "things", "a lot", "really", "very", "gonna", "wanna" where natural.

Return ONLY the rewritten text.
`;

// ============================================================
// BLOG-STYLE TRANSFORMATION PROMPT (for formal essays)
// ============================================================

export const BLOG_STYLE_SECOND_PASS_PROMPT = `
You are transforming a formal, essay‑like explanation into a relaxed, blog‑style article. Do NOT just swap words — completely restructure the text.

**RULES (follow strictly):**

1. **Headings & Structure**  
   - Break the article into 3–5 short sections, each with a bold or casual heading.  
   - Examples: "So, what's the big deal?", "The real reason it matters", "But is it worth it?", "Here's the thing…"  
   - Don't use formal titles like "Introduction" or "Conclusion".

2. **Sentence Length & Rhythm**  
   - Use wildly different sentence lengths.  
   - One‑word fragments are okay.  
   - Long, meandering sentences are okay.  
   - Mix them together — no uniform paragraph length.

3. **Voice & Vocabulary**  
   - Talk directly to the reader: "you", "your", "we", "I".  
   - Use casual, everyday words: "stuff", "really", "kind of", "honestly", "pretty".  
   - Avoid academic jargon; if you must use a technical term, explain it like you're talking to a friend.  
   - Throw in a few personal asides: "I mean, think about it…", "Honestly, it surprised me too."

4. **Specifics & Examples**  
   - If the source mentions numbers, places, or names, keep them.  
   - If the source is vague ("many countries", "some studies"), make it concrete: "a 2023 survey", "in Indonesia, for instance".  
   - Add one short, believable anecdote or scenario if it fits naturally (e.g., "Imagine trying to…").

5. **Transitions & Flow**  
   - Do NOT use "Another reason is", "Furthermore", "Finally", "In conclusion".  
   - Jump directly from one idea to the next.  
   - Use questions as transitions: "But does that really work?" "So what's the catch?"

6. **Ending**  
   - Don't summarise. End with a final thought, a call to action, or a personal reflection.  
   - Example: "Anyway, that's just how I see it. What do you think?"

7. **Fidelity**  
   - Keep all the key facts and claims from the SOURCE TEXT.  
   - Don't invent statistics or major new ideas.  
   - Slight exaggeration for effect is fine ("literally everyone"), but don't change the factual core.

Return ONLY the rewritten article, with headings and line breaks between sections.
`;

// ============================================================
// GENUINE HUMAN REWRITE PROMPT (for formal essays - complete regeneration)
// ============================================================

export const GENUINE_HUMAN_REWRITE_PROMPT = `
You are a regular person (not an AI, not a journalist) explaining the same topic as the source text. You have read the source and understood it, but now you are telling a friend about it in your own words, from scratch.

CRITICAL: Do NOT edit, paraphrase, or restructure the source. Completely ignore its wording and sentence order. Build your explanation from the ground up, using only the key facts you remember.

RULES:
- Write in a SINGLE, uninterrupted flow of thought. No headings, no bullet points, no section breaks. Just plain paragraphs.
- Use simple, everyday language. Imagine you're talking, not writing an article.
- Include ONE personal aside or mild exaggeration that fits naturally (e.g., "honestly, it surprised me too," "I mean, think about it," "basically, it's like...").
- Allow yourself to be slightly imprecise or incomplete – it's okay if a technical detail is missing or slightly off, as long as the overall idea is correct.
- Vary your sentence length wildly. Some sentences very short. Others quite long and rambling.
- NEVER use the phrases "Another reason", "Furthermore", "Finally", "In conclusion", "One factor is". If you need to list things, just say "also", "and", "plus".
- NEVER start with a meta comment like "Here's a rewritten version".
- End with a casual, offhand remark, not a summary.

Return ONLY your fresh explanation. No extra text before or after.
`;

// ============================================================
// PERSONAL OBSERVATION PROMPT (for generic multi-factor explanations)
// ============================================================

export const PERSONAL_OBSERVATION_PROMPT = `
You are a regular person (not a journalist, not an AI) reflecting on a topic you know well. You've just read a factual article about it, but now you're going to explain the same thing to a friend in your own words – completely from scratch, without looking at the original.

**TONE AND STYLE:**
- Start with a personal opening like "I think it has to do with…" or "Here's my take on why…"
- Use "I", "me", "my", "we", "you" freely. Make it feel like one human talking to another.
- Organise your thoughts into natural categories or "types" of people / reasons / situations. Give each category a casual label, e.g., "The career‑minded non‑traveller", "The 'I'll go next year' type", etc.
- Explain each category with a mix of general observation and a tiny, concrete example that feels real (even if you make it up loosely – just don't invent statistics).
- Use everyday language. Contractions are welcome. Some sentences should be very short; others can be long and meandering.
- Never use formal transitions like "Another reason", "Furthermore", "Finally", "In conclusion". If you need to move on, just jump to the next category.
- Never use the phrase "research suggests" or "studies show". Keep it grounded in what you've seen or heard.

**CONTENT:**
- Keep all the key points from the source, but re‑explain them in your own words, as if they are things you've noticed yourself.
- Slightly exaggerate for effect where natural ("hits the wallet hard", "basically impossible", "a massive headache").
- End with a casual, wrap‑up remark – not a summary, more like a final thought or shrug.

**FORMAT:**
- Use plain paragraphs. No headings, no bullet points. A new line for each category is fine.

Return ONLY your personal explanation. No extra text.
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

/**
 * Detects if the text is a formal essay that needs blog-style restructuring.
 * Returns true for long, uniform, transition-heavy texts without headings.
 */
export function isFormalEssay(text: string): boolean {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 200) return false;   // too short
  
  // Check for typical essay transitions
  const transitionPatterns = [
    /\b(?:Another reason|Another factor|Another challenge|Finally,)\b/i,
    /\b(?:In conclusion|To conclude|In summary)\b/i,
    /\b(?:From a cognitive perspective|From an economic standpoint)\b/i,
  ];
  const hasTransitions = transitionPatterns.some(p => p.test(text));
  
  // Check for lack of headings (no lines that look like titles)
  const hasHeadings = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,5}\s*$/gm.test(text);
  
  // Check for uniform sentence length (low burstiness)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length < 5) return false;
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a,b)=>a+b,0) / lengths.length;
  const variance = lengths.reduce((sum,l)=>sum + (l-avg)*(l-avg), 0) / lengths.length;
  
  // AI essays have very low variance (3-5), human blogs have high variance (>10)
  const lowBurstiness = variance < 8;
  
  return (hasTransitions || !hasHeadings) && lowBurstiness;
}

export function isGenericExplanation(text: string): boolean {
  const lower = text.substring(0, 500).toLowerCase();
  // Looks like a formal, multi‑factor explanation
  const hasFactorList = /\b(?:one (?:reason|factor|challenge)|another (?:reason|factor)|first|second|finally)\b/i.test(text);
  const hasImpersonalOpening = /^(?:Many|Some|People|It is|There are|The|A)\b/i.test(text.trim());
  const wordCount = text.split(/\s+/).length;
  return hasFactorList && hasImpersonalOpening && wordCount > 150;
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
  const consumerDurableGoodsTopicCount =
    text.match(
      /\b(?:electric vehicles?|EVs?|laptop|smartphone|tablet|appliance|device|battery|charging|software updates?|resale value|dealer network|spare parts?|replacement components?|warranty|after-sales support|battery diagnostics?|manufacturer|ownership|hardware|repair costs?|lifespan|durability)\b/gi
    )?.length ?? 0;
  const consumerRiskHits = countPatternHits(text, [
    /\b(?:10-year|ten-year|ten years|10 years|long-term ownership)\b/i,
    /\b(?:financial stability|remain profitable|industry consolidation|exits? the market|reduces? operations)\b/i,
    /\b(?:replacement parts?|software updates?|warranty service|technical support)\b/i,
    /\b(?:feel technologically outdated|resale value|comparable gasoline vehicle)\b/i,
    /\b(?:dealer network|trained technicians|battery diagnostics?|repair costs?|waiting times?)\b/i,
    /\b(?:global sales|financial performance|battery production|international service network|local operations|investment plans?)\b/i,
    /\b(?:built to last|well-built|durability|lifespan|how long it lasts|practical lifespan)\b/i,
    /\b(?:processor|RAM|SSD|cooling|heat management|thermal|performance throttling)\b/i,
  ]);

  if (
    writingPurpose === "General" &&
    wordCount >= 250 &&
    consumerDurableGoodsTopicCount >= 6 &&
    consumerRiskHits >= 3
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
  
  // Product comparison detection for product-review profile
  const productComparisonHits = countPatternHits(text, [
    /\b(?:ASICS|Nike|Adidas|Hoka|Brooks|Saucony|New Balance|Mizuno|On Running|Salomon)\b/i,
    /\bvs\.?\b/i,
    /\bmore comfortable than\b/i,
    /\bbetter than\b/i,
    /\bcompared to\b/i,
    /\bversus\b/i,
  ]);
  
  if (
    writingPurpose === "General" &&
    productComparisonHits >= 2
  ) {
    return "product-review";
  }
  
  // Personal advice detection - detect texts giving advice to a friend about personal struggles
  if (
    /\b(your friend|you feel|don't compare|you shouldn't|you can|just because|feeling inferior|feel inferior|why can't I|why am I)\b/i.test(text) && 
    wordCount < 400
  ) {
    return "personal-advice";
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
      temperature: 1.1,
      topP: 0.92,
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
      temperature: 1.15,
      topP: 0.94,
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
      temperature: 1.1,
      topP: 0.94,
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
  
  // PRODUCT-REVIEW profile — high temperature for informal review style
  if (profile === "product-review") {
    return {
      systemPrompt: PRODUCT_REVIEW_REFORMAT_PROMPT,
      temperature: 1.5,
      topP: 0.99,
      maxTokens: 1800,
      frequencyPenalty: 0.3,
      presencePenalty: 0.2,
      repetitionPenalty: 1.03,
      additionalInstruction:
        "Rewrite as a friendly product review with Q&A structure, headings, and direct reader address. Keep all facts but use everyday language.",
      postProcessTone: "product-review",
    };
  }
  
  // PERSONAL-ADVICE profile — extreme temperature for informal friend-to-friend advice
  if (profile === "personal-advice") {
    return {
      systemPrompt: PERSONAL_ADVICE_PROMPT,
      temperature: 1.6,
      topP: 0.99,
      maxTokens: 1600,
      frequencyPenalty: 0.6,
      presencePenalty: 0.5,
      repetitionPenalty: 1.05,
      additionalInstruction:
        "Write like a close friend giving warm, simple advice. Use short sentences, fragments, repeated words for emphasis, and casual expressions. Avoid textbook language.",
      postProcessTone: "english-personal",
    };
  }
  
  // GENERAL profile — simplified, higher temperature for human-like output
  return {
    systemPrompt: `${CASUAL_NATURAL_PROMPT}`,
    temperature: 1.3,
    topP: 0.98,
    maxTokens: 1600,
    frequencyPenalty: 0.3,
    presencePenalty: 0.2,
    repetitionPenalty: 1.03,
    additionalInstruction:
      "Write like a real person, not an AI. Use 'I' or 'you' where natural. Vary sentence length. Sound knowledgeable but relaxed.",
    postProcessTone: "english-general",
  };
}

export function normalizeHumanizerTone(value: unknown): HumanizerTone {
  return value === "ielts" ? "ielts" : "casual";
}

// ============================================================

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

export function destroyThreeParagraphStructure(text: string): string {
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

export function humanizeStructureEnglish(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;
  
  // Force first paragraph to be shorter (max 2 sentences)
  const firstSentences = splitSentences(paragraphs[0]);
  if (firstSentences.length > 2) {
    paragraphs[0] = firstSentences.slice(0, 2).join(' ');
  }
  
  // Merge two middle paragraphs to create one long paragraph
  const midIdx = Math.floor(paragraphs.length / 2);
  if (midIdx < paragraphs.length - 1) {
    paragraphs[midIdx] = paragraphs[midIdx] + ' ' + paragraphs[midIdx + 1];
    paragraphs.splice(midIdx + 1, 1);
  }
  
  // Insert an orphan short sentence before the last paragraph
  // REMOVED: Hardcoded orphans yang jadi fingerprint tool
  // Filler contextual sekarang di-generate via LLM di second pass
  if (paragraphs.length >= 2) {
    // Skip insertion of hardcoded orphan sentences
  }
  
  return paragraphs.join('\n\n');
}

// ============================================================
// 7b. TARGETED HUMAN IMPRINT FUNCTIONS (professor's recommendations)
// ============================================================

/**
 * LOGIC 1: Per-Sentence Perplexity Variance (Burstiness Real)
 * Forces extreme sentence length variation
 * 
 * DEPRECATED: Replaced by enforceAggressiveBurstiness in applyAntiDetectionPass
 */
// function enforceBurstinessPerSentence(text: string): string {
//   const sentences = splitSentences(text);
//   if (sentences.length < 5) return text;
//   
//   // Pick 2-3 sentences to compress to very short (3-6 words)
//   const shortCount = Math.min(3, Math.floor(sentences.length * 0.15));
//   const shortIndices = new Set<number>();
//   while (shortIndices.size < shortCount) {
//     const idx = Math.floor(Math.random() * sentences.length);
//     if (sentences[idx].split(/\s+/).length > 10) {
//       shortIndices.add(idx);
//     }
//   }
//   
//   for (const idx of shortIndices) {
//     const words = sentences[idx].split(/\s+/);
//     // Take just the core 4-6 words
//     const core = words.slice(0, Math.min(6, Math.floor(words.length * 0.4)));
//     sentences[idx] = core.join(' ') + '.';
//   }
//   
//   // Pick 1-2 pairs of adjacent sentences to merge into one long sentence
//   const mergeCount = Math.min(2, Math.floor(sentences.length * 0.1));
//   for (let m = 0; m < mergeCount; m++) {
//     const idx = Math.floor(Math.random() * (sentences.length - 1));
//     if (sentences[idx].length > 15 && sentences[idx + 1].length > 15) {
//       sentences[idx] = sentences[idx].replace(/[.!?]$/, '') + ' — ' + 
//         sentences[idx + 1].charAt(0).toLowerCase() + sentences[idx + 1].slice(1);
//       sentences.splice(idx + 1, 1);
//     }
//   }
//   
//   return sentences.join(' ');
// }

/**
 * LOGIC 2: Idiosyncratic Markers Injection
 * Adds natural-looking personal punctuation and self-corrections
 */
function injectIdiosyncrasy(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  
  // 1. Add one parenthetical aside (15% chance)
  if (Math.random() < 0.15) {
    const idx = Math.floor(Math.random() * (sentences.length - 1)) + 1;
    const asides = [
      ' (though that depends on the situation)',
      ' (not always, but often enough)',
      ' (it varies, really)',
      ' (hard to generalize)',
    ];
    const aside = asides[Math.floor(Math.random() * asides.length)];
    sentences[idx] = sentences[idx].replace(/[.!?]$/, '') + aside + '.';
  }
  
  // 2. Add one self-correction (12% chance)
  if (Math.random() < 0.12) {
    const idx = Math.floor(Math.random() * sentences.length);
    if (sentences[idx].length > 30) {
      const corrections = [
        ' — or rather, ',
        ' — well, actually, ',
        ' — I mean, ',
      ];
      const correction = corrections[Math.floor(Math.random() * corrections.length)];
      const words = sentences[idx].split(' ');
      const midPoint = Math.floor(words.length / 2);
      words.splice(midPoint, 0, correction.trim());
      sentences[idx] = words.join(' ');
    }
  }
  
  // 3. Add one ellipsis for trailing thought (10% chance)
  if (Math.random() < 0.10 && sentences.length > 2) {
    const idx = sentences.length - 2; // second-to-last sentence
    if (!sentences[idx].endsWith('...') && sentences[idx].length > 25) {
      sentences[idx] = sentences[idx].replace(/[.!?]$/, '...');
    }
  }
  
  return sentences.join(' ');
}

/**
 * LOGIC 3: Structure Disruption — More Aggressive
 * Forces uneven paragraph lengths
 */
function disruptStructure(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;
  
  const sentenceCounts = paragraphs.map(p => splitSentences(p).length);
  
  // If all paragraphs are 3-5 sentences (AI fingerprint), break the pattern
  const allInRange = sentenceCounts.every(n => n >= 3 && n <= 5);
  
  if (allInRange) {
    // Merge paragraphs 2 and 3 into one long one
    if (paragraphs.length >= 3) {
      paragraphs[1] = paragraphs[1] + ' ' + paragraphs[2];
      paragraphs.splice(2, 1);
    }
    
    // Add a standalone orphan sentence in the middle
    // REMOVED: Hardcoded orphans yang jadi fingerprint tool
    // Filler contextual sekarang di-generate via LLM di second pass
    // Skip insertion of hardcoded orphan sentences
  }
  
  return paragraphs.join('\n\n');
}

/**
 * LOGIC 4: Specificity Replacement — Abstract → Concrete
 * Replaces 1-2 generic phrases with more specific alternatives
 */
function addSpecificity(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bmany people\b/gi, 'most people I know'],
    [/\bsome individuals\b/gi, 'a few folks'],
    [/\bin many countries\b/gi, 'across much of the world'],
    [/\bseveral factors\b/gi, 'a handful of things'],
    [/\ba significant number\b/gi, 'quite a lot'],
    [/\bin recent years\b/gi, 'over the past decade or so'],
  ];
  
  let result = text;
  let replacementsMade = 0;
  const maxReplacements = 2; // Only 1-2 per text
  
  for (const [pattern, replacement] of replacements) {
    if (replacementsMade >= maxReplacements) break;
    if (pattern.test(result) && Math.random() < 0.5) {
      result = result.replace(pattern, replacement);
      replacementsMade++;
    }
  }
  
  return result;
}

/**
 * LOGIC 5: Voice Imprinting — Conditional First-Person
 * Adds one light first-person sentence if source has none
 */
function allowConditionalFirstPerson(text: string, sourceText: string): string {
  const sourceHasFirstPerson = /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(sourceText);
  if (sourceHasFirstPerson) return text;
  
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  
  // 30% chance to inject one light first-person
  if (Math.random() < 0.3) {
    const openers = [
      "I'd argue that ",
      "From what I've seen, ",
      "Honestly, I think ",
      "In my experience, ",
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    const targetIdx = Math.floor(sentences.length * 0.6); // Around 60% through
    sentences[targetIdx] = opener + sentences[targetIdx].charAt(0).toLowerCase() + sentences[targetIdx].slice(1);
  }
  
  return sentences.join(' ');
}

/**
 * LOGIC 6: N-gram De-contamination
 * Breaks patterns where 3+ consecutive sentences start the same way
 */
function breakNgramPatterns(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  
  for (let i = 0; i < sentences.length - 2; i++) {
    const first1 = sentences[i].split(/\s+/)[0]?.toLowerCase();
    const first2 = sentences[i + 1].split(/\s+/)[0]?.toLowerCase();
    const first3 = sentences[i + 2].split(/\s+/)[0]?.toLowerCase();
    
    // Detect: "The X. The Y. The Z." pattern
    if (first1 === 'the' && first2 === 'the' && first3 === 'the') {
      // Change the middle sentence's structure
      const words = sentences[i + 1].split(/\s+/);
      if (words.length > 5) {
        // Move the subject to later in the sentence
        sentences[i + 1] = 'For ' + words.slice(1, 3).join(' ') + ', ' + words.slice(3).join(' ');
      }
    }
    
    // Detect: "X is Y. X is Z. X is W." or similar parallel structure
    if (first1 === first2 && first2 === first3 && first1.length > 3) {
      sentences[i + 1] = 'And ' + sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      break;
    }
  }
  
  return sentences.join(' ');
}

/**
 * LOGIC 7: Vocabulary Entropy Boost
 * Replaces 2-3 common words with lower-frequency alternatives
 */
function boostVocabularyEntropy(text: string): string {
  const lowFrequencyMap: Record<string, string[]> = {
    'good': ['solid', 'decent'],
    'bad': ['rough', 'tricky'],
    'important': ['key', 'big'],
    'problem': ['headache', 'hassle'],
    'many': ['plenty of', 'loads of'],
    'difficult': ['tough', 'hard going'],
    'very': ['pretty', 'quite'],
    'really': ['genuinely', 'truly'],
    'things': ['stuff', 'factors'],
    'help': ['support', 'boost'],
  };
  
  let result = text;
  let changes = 0;
  const maxChanges = 3;
  
  for (const [word, alternatives] of Object.entries(lowFrequencyMap)) {
    if (changes >= maxChanges) break;
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(result) && Math.random() < 0.4) {
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      result = result.replace(regex, replacement);
      changes++;
    }
  }
  
  return result;
}

/**
 * LOGIC 8: Token-Level Perplexity Injection
 * Replaces 3-5 common words with less predictable alternatives
 * to lower per-token generated_prob below 0.99
 */
function isGrammaticallyBroken(text: string): boolean {
  return /\bwithout no\b/i.test(text) ||
         /\bnot un\w+/i.test(text) ||
         /\b(a|an)\s+(actually|really|no joke|kind of huge)\b/i.test(text) ||
         /\bat (buy|sell|use)\b/i.test(text);  // BUG FIX: "at buy" error dari humanizeReferences
}

function injectTokenSurprise(text: string): string {
  const surpriseMap: Array<[RegExp, string[]]> = [
    [/\bimportant\b/gi, ['a big deal', 'kind of huge', 'the real thing']],
    [/\bsignificant\b/gi, ['big', 'real', 'major']],
    [/\bconsiderable\b/gi, ['a lot of', 'tons of']],
    [/\bsubstantial\b/gi, ['big', 'huge', 'plenty of']],
    [/\bHowever,\b/gi, ['But', 'Thing is,', 'Look,']],
    [/\bFurthermore,\b/gi, ['Also', 'And also', 'Plus']],
    [/\bMoreover,\b/gi, ['And', 'On top of that', 'Plus']],
    [/\bConsequently,\b/gi, ['So', 'Which is why', 'Because of that']],
    [/\bEssentially,\b/gi, ['Basically', 'Like', 'Honestly']],
    [/\bEssentially\b/gi, ['Really', 'Just']],
    [/\bultimately\b/gi, ['at the end of the day', 'long story short', 'really']],
    [/\bIn conclusion\b/gi, ['So basically', 'Yeah', 'I guess']],
    [/\bplays a (?:crucial|vital|key|important) role\b/gi, ['matters', 'counts', 'is a big deal']],
    [/\bmake it difficult\b/gi, ['makes it tough', 'gets in the way', 'messes things up']],
    [/\bin order to\b/gi, ['just to', 'to']],
    [/\bthe majority of\b/gi, ['most', 'loads of']],
    [/\ba number of\b/gi, ['a bunch of', 'a few', 'plenty of']],
    [/\bin many cases\b/gi, ['a lot of the time', 'often enough']],
    [/\bIt is important to note that\b/gi, ['', 'Worth saying:']],
    [/\bIt should be noted\b/gi, ['', 'Heads up:']],
    [/\bThe fact that\b/gi, ['That', 'How']],
    [/\bgreata deal of\b/gi, ['a lot of', 'plenty of', 'tons of']],
    [/\bvarious\b/gi, ['all sorts of', 'different', 'kinda']],
    [/\butilize\b/gi, ['use']],
    [/\bpurchase\b/gi, ['buy']],
    [/\bassist\b/gi, ['help']],
    [/\bdemonstrate\b/gi, ['show']],
  ];

  let result = text;
  let changes = 0;
  const maxChanges = Math.floor(text.length / 150);
  const shuffled = [...surpriseMap].sort(() => Math.random() - 0.5);

  for (const [pattern, replacements] of shuffled) {
    if (changes >= maxChanges) break;
    if (pattern.test(result)) {
      const original = result;  // save
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, replacement);
      if (isGrammaticallyBroken(result)) {
        result = original;  // revert
      } else {
        changes++;
      }
    }
  }
  return result;
}

/**
 * LOGIC 9: Number Variation
 * Varies how numbers are expressed to break AI precision patterns
 */
function varyNumberExpression(text: string): string {
  let result = text;
  
  // "7-9 hours" → "7 to 9 hours" or "seven to nine hours"
  result = result.replace(/(\d+)[–-](\d+)\s*(hours?|minutes?|days?)/gi, (match, low, high, unit) => {
    const variants = [
      `${low} to ${high} ${unit}`,
      `somewhere between ${low} and ${high} ${unit}`,
      `${low}–${high} ${unit}`,
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  });
  
  // "8 hours" → "around 8 hours" or "roughly eight hours"
  result = result.replace(/\b(\d+)\s+(hours?|minutes?)\b/gi, (match, num, unit) => {
    if (Math.random() < 0.4) {
      const variants = [
        `around ${num} ${unit}`,
        `about ${num} ${unit}`,
        `roughly ${num} ${unit}`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    }
    return match;
  });
  
  return result;
}

/**
 * LOGIC 12: Style Shift — Encyclopedia → Advice/Conversation
 * Converts impersonal explanations into direct reader address
 * or personal observation, matching 100% human text patterns
 */
function shiftToConversationalStyle(text: string, sourceText: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  
  // Determine style: advice (you) or personal (I)
  const useAdviceStyle = !/\b(?:I|me|my|we|our)\b/i.test(sourceText);
  
  if (useAdviceStyle) {
    // Convert 1-2 impersonal statements to direct "you" address
    let changes = 0;
    for (let i = 0; i < sentences.length && changes < 2; i++) {
      if (sentences[i].length > 40 && !sentences[i].includes('you') && Math.random() < 0.4) {
        sentences[i] = sentences[i]
          .replace(/\bpeople\b/gi, 'you')
          .replace(/\bsome individuals\b/gi, 'you')
          .replace(/\bone\b/gi, 'you')
          .replace(/\bit is\b/gi, "it's");
        changes++;
      }
    }
    
    // Add one direct advice sentence if missing
    if (!text.includes('you should') && !text.includes('try to') && Math.random() < 0.5) {
      const adviceOptions = [
        "The key is consistency more than anything else.",
        "Pay attention to what your body tells you.",
        "Start small and build from there.",
        "Don't overthink it — just begin.",
      ];
      const idx = Math.floor(sentences.length * 0.7);
      sentences.splice(idx, 0, adviceOptions[Math.floor(Math.random() * adviceOptions.length)]);
    }
  } else {
    // Add one personal aside if the source has first person
    if (Math.random() < 0.3) {
      const asides = [
        "At least that's been my experience.",
        "I've seen this play out with people close to me.",
        "Honestly, it varies so much from person to person.",
      ];
      sentences.push(asides[Math.floor(Math.random() * asides.length)]);
    }
  }
  
  return sentences.join(' ');
}

/**
 * LOGIC 13: Natural Typo Injection
 * Adds ONE real-looking typo per text, in a position where humans actually make them
 */
function injectNaturalTypo(text: string): string {
  // Only inject ONE typo per text, at most
  if (Math.random() > 0.2) return text; // 20% chance
  
  const commonTypos: Array<[RegExp, string]> = [
    [/\bdefinitely\b/i, 'definately'],
    [/\bseparate\b/i, 'seperate'],
    [/\bnoticeable\b/i, 'noticable'],
    [/\btheir\b/i, 'thier'],
    [/\breceive\b/i, 'recieve'],
  ];
  
  for (const [pattern, replacement] of commonTypos) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacement);
    }
  }
  
  return text;
}

/**
 * LOGIC 14: Remove AI List Markers
 * Strips "One of the most important factors", "Another reason", "Finally"
 */
function removeListMarkers(text: string): string {
  return text
    .replace(/\bOne of the most important factors is\b/gi, '')
    .replace(/\bAnother reason is\b/gi, '')
    .replace(/\bAnother important factor is\b/gi, '')
    .replace(/\bFinally,\s*/gi, '')
    .replace(/\bOne major challenge is\b/gi, '')
    .replace(/^,\s*/gm, '') // Clean up leading commas from removals
    .replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up double spaces
}

/**
 * LOGIC 10: Targeted Sentence Fusion & Fission
 * Merges short adjacent sentences and splits long ones where AI patterns cluster
 */
function targetedSentenceRestructure(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  
  // Find 2-3 consecutive sentences that all start with "Sleep also", "Sleep is", etc.
  for (let i = 0; i < sentences.length - 2; i++) {
    const first1 = sentences[i].substring(0, 15).toLowerCase();
    const first2 = sentences[i + 1].substring(0, 15).toLowerCase();
    
    // If two adjacent sentences start with the same subject word, merge them
    if (first1.split(' ')[0] === first2.split(' ')[0] && Math.random() < 0.5) {
      sentences[i] = sentences[i].replace(/[.!?]$/, '') + ', and ' + 
        sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      sentences.splice(i + 1, 1);
      break; // Only do one merge per call
    }
  }
  
  // Find a long sentence (25+ words) and split it
  for (let i = 0; i < sentences.length; i++) {
    const words = sentences[i].split(/\s+/);
    if (words.length > 25 && sentences[i].includes(', ')) {
      const midPoint = Math.floor(words.length / 2);
      const commaIdx = sentences[i].indexOf(', ', Math.floor(sentences[i].length * 0.4));
      if (commaIdx > 10 && commaIdx < sentences[i].length - 10) {
        const part1 = sentences[i].substring(0, commaIdx).trim() + '.';
        const part2 = sentences[i].substring(commaIdx + 2).trim();
        sentences[i] = part1;
        sentences.splice(i + 1, 0, part2.charAt(0).toUpperCase() + part2.slice(1));
        break;
      }
    }
  }
  
  return sentences.join(' ');
}

/**
 * Master function: applies all targeted human imprint transformations
 * Updated per professor's feedback (Logic 11-14)
 */
export function applyTargetedHumanImprint(text: string, sourceText: string): string {
  if (!text || text.length < 100) return text;
  
  let result = text;
  
  result = removeListMarkers(result);                // LOGIC 14
  result = injectIdiosyncrasy(result);               // LOGIC 2
  result = disruptStructure(result);                 // LOGIC 3
  result = addSpecificity(result);                   // LOGIC 4
  result = allowConditionalFirstPerson(result, sourceText); // LOGIC 5
  result = breakNgramPatterns(result);               // LOGIC 6
  result = boostVocabularyEntropy(result);           // LOGIC 7
  result = injectTokenSurprise(result);              // LOGIC 8
  result = varyNumberExpression(result);             // LOGIC 9
  result = targetedSentenceRestructure(result);      // LOGIC 10
  result = shiftToConversationalStyle(result, sourceText); // LOGIC 12
  result = injectNaturalTypo(result);                // LOGIC 13
  
  return result;
}

// ============================================================
// LOGIC 15–30: AGGRESSIVE ANTI-DETECTION (berdasarkan analisis GPTZero 4.7b)
// ============================================================

function enforceAggressiveBurstiness(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // Kompres 2 kalimat jadi sangat pendek (4–7 kata)
  let compressed = 0;
  for (let i = 0; i < sentences.length && compressed < 2; i++) {
    const words = sentences[i].split(/\s+/);
    if (words.length >= 8 && words.length <= 18 && Math.random() < 0.5) {
      const core = words.slice(0, Math.min(7, words.length - 2));
      sentences[i] = core.join(' ').replace(/[,.;]$/, '') + '.';
      compressed++;
    }
  }

  // Merge 2 kalimat medium jadi satu panjang (25–35 kata)
  let merged = 0;
  for (let i = 0; i < sentences.length - 1 && merged < 2; i++) {
    const w1 = sentences[i].split(/\s+/).length;
    const w2 = sentences[i + 1].split(/\s+/).length;
    if (w1 >= 8 && w1 <= 16 && w2 >= 8 && w2 <= 16 && Math.random() < 0.4) {
      sentences[i] = sentences[i].replace(/[.!?]$/, '') + ' — ' +
        sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      sentences.splice(i + 1, 1);
      merged++;
    }
  }

  return sentences.join(' ');
}

function boostTokenPerplexity(text: string): string {
  const perplexityMap: Array<[RegExp, string[]]> = [
    [/\bimportant\b/gi, ['crucial', 'key', 'real', 'big']],
    [/\bcontribute[s]? to\b/gi, ['feed into', 'add to', 'drive']],
    [/\bsignificant\b/gi, ['serious', 'real', 'actual', 'genuine']],
    [/\bhowever,\b/gi, ['but', 'still,', 'mind you,']],
    [/\btherefore\b/gi, ['so', 'which means']],
    [/\bin order to\b/gi, ['to', 'just to']],
    [/\bthe majority of\b/gi, ['most', 'loads of']],
    [/\ba number of\b/gi, ['a bunch of', 'plenty of']],
    [/\bin many cases\b/gi, ['often', 'a lot of the time']],
    [/\bIt is important to note that\b/gi, ['', 'Worth saying:']],
    [/\bplays a role\b/gi, ['matters', 'counts']],
    [/\bmake it difficult\b/gi, ['makes it harder', 'gets in the way of']],
    [/\bin some cases\b/gi, ['sometimes', 'at times']],
    [/\ba variety of\b/gi, ['all sorts of', 'different']],
    [/\bin terms of\b/gi, ['for', 'around', 'when it comes to']],
    [/\bwith regard[s]? to\b/gi, ['about', 'on']],
    [/\bOn the other hand\b/gi, ['Then again', 'But']],
    [/\bFurthermore\b/gi, ['Plus', 'Also']],
    [/\bMoreover\b/gi, ['And', 'Plus']],
    [/\bIn addition\b/gi, ['Also', 'And']],
    [/\bConsequently\b/gi, ['So', 'Which means']],
    [/\bAs a result\b/gi, ['So', 'Because of that']],
    [/\bUltimately\b/gi, ['In the end', 'At the end of the day']],
    [/\bEssentially\b/gi, ['Basically', 'Really']],
    [/\bGenerally speaking\b/gi, ['Usually', 'Most of the time']],
  ];

  let result = text;
  let changes = 0;
  const targetChanges = Math.floor(text.length / 200);
  const shuffled = [...perplexityMap].sort(() => Math.random() - 0.5);

  for (const [pattern, replacements] of shuffled) {
    if (changes >= targetChanges) break;
    if (pattern.test(result)) {
      const original = result;  // save for grammar check
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, replacement);
      if (isGrammaticallyBroken(result)) {
        result = original;  // revert
      } else {
        changes++;
      }
    }
  }
  return result;
}

function diversifySentenceOpenings(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  for (let i = 0; i < sentences.length - 2; i++) {
    const opener1 = sentences[i].toLowerCase().split(/\s+/).slice(0, 3).join(' ');
    const opener2 = sentences[i + 1].toLowerCase().split(/\s+/).slice(0, 3).join(' ');
    const opener3 = sentences[i + 2].toLowerCase().split(/\s+/).slice(0, 3).join(' ');

    if (opener1 === opener2 || opener1 === opener3 || opener2 === opener3) {
      const idx = (opener1 === opener2) ? i + 1 : i + 2;
      const words = sentences[idx].split(/\s+/);
      if (words.length > 6) {
        const rest = words.slice(1).join(' ');
        if (Math.random() < 0.5) {
          sentences[idx] = `What happens is, ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
        } else {
          sentences[idx] = `${rest}, ${words[0].toLowerCase()}`.trim() + '.';
        }
      }
    }
  }
  return sentences.join(' ');
}

function reorderClauses(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  let reordered = 0;
  for (let i = 0; i < sentences.length && reordered < 2; i++) {
    const s = sentences[i];
    const words = s.split(/\s+/);
    const becauseMatch = s.match(/^(Because|Although|While|Since|When)\s+(.+?),\s+(.+)$/i);
    if (becauseMatch && words.length < 25 && Math.random() < 0.6) {
      const [, conjunction, becausePart, mainClause] = becauseMatch;
      sentences[i] = `${mainClause} — ${conjunction.toLowerCase()} ${becausePart.toLowerCase()}.`;
      reordered++;
    }
  }
  return sentences.join(' ');
}

function humanizeReferences(text: string): string {
  let result = text;
  const expansions: Array<[RegExp, string]> = [
    [/\bthis (can|may|might|will|does|leads?|creates?|causes?)\b/gi, 'this kind of thing '],
    [/\bit (can|may|might|will)\b/gi, 'this stuff '],
    [/\bthis leads to\b/gi, 'this is what leads to'],
    [/\bthis means\b/gi, 'what this means is'],
    [/\bthey (can|may|might|will|often|usually)\b/gi, 'these people '],
  ];
  for (const [pattern, replacement] of expansions) {
    if (Math.random() < 0.3) result = result.replace(pattern, replacement);
  }
  return result;
}

function calibrateHedging(text: string): string {
  let result = text;
  result = result.replace(/\bmay (also )?(lead|cause|result|create|contribute)/gi,
    (m) => m.replace(/^may /i, 'sometimes '));
  // REMOVED: Hardcoded certainStatements yang jadi fingerprint tool
  // Filler contextual sekarang di-generate via LLM di second pass
  return result;
}

function varyDiscourseMarkers(text: string): string {
  const markerMap: Array<[RegExp, string[]]> = [
    [/\bHowever,\s+/gi, ['But ', 'Still, ', 'Mind you, ']],
    [/\bTherefore,\s+/gi, ['So ', 'Which means ']],
    [/\bMoreover,\s+/gi, ['Plus, ', 'And on top of that, ']],
    [/\bIn addition,\s+/gi, ['Also, ', 'On top of that, ']],
    [/\bFurthermore,\s+/gi, ['Plus, ', 'What\'s more, ']],
    [/\bConsequently,\s+/gi, ['So ', 'Which is why ']],
    [/\bAs a result,\s+/gi, ['So ', 'Because of that, ']],
    [/\bUltimately,\s+/gi, ['In the end, ', 'Long story short, ']],
    [/\bFor example,\s+/gi, ['Like, ', 'Take ', 'Say, ']],
  ];
  let result = text;
  for (const [pattern, replacements] of markerMap) {
    if (pattern.test(result)) {
      result = result.replace(pattern, replacements[Math.floor(Math.random() * replacements.length)]);
    }
  }
  return result;
}

function injectGrammaticalAsymmetry(text: string): string {
  // REMOVED: Fungsi ini secara aktif merusak grammar dengan mengganti titik jadi koma
  // tanpa konjungsi, menghasilkan comma-splice/run-on yang tidak gramatikal.
  // Manusia asli pakai \"and\", \"but\", dll., bukan titik-jadi-koma polos.
  return text;
}

function normalizeNegatives(text: string): string {
  return text
    .replace(/\bIt is not uncommon\b/gi, "It's pretty common")
    .replace(/\bnot infrequently\b/gi, "often enough")
    .replace(/\bnot only\b/gi, "not just");
}

function stripMetadiscourse(text: string): string {
  return text
    .replace(/\bIt is worth noting that\s+/gi, '')
    .replace(/\bImportantly,\s+/gi, '')
    .replace(/\bIt is important to note that\s+/gi, '')
    .replace(/\bNeedless to say,\s+/gi, '')
    .replace(/\bAs we have seen,\s+/gi, '');
}

/**
 * De-jargonizing pass untuk casual/general/expository register
 * Menurunkan presisi jargon teknis jadi bahasa sehari-hari
 */
function deJargonForCasualRegister(text: string, tone: string): string {
  // Hanya apply untuk tone casual/general/expository, bukan academic/sensitive
  if (tone === "english-academic" || tone === "english-sensitive") {
    return text;
  }
  
  const map: Array<[RegExp, string[]]> = [
    [/\belectronic components\b/gi, ['the parts inside', 'the internals']],
    [/\bperformance throttling\b/gi, ['slowing down', 'running slower']],
    [/\bhardware failure\b/gi, ['stuff breaking down', 'parts giving out']],
    [/\bpower circuits\b/gi, ['the power system', 'the electronics']],
    [/\boperating temperatures\b/gi, ['how hot it runs']],
    [/\bpractical lifespan\b/gi, ['how long it actually lasts']],
    [/\bdurability of its hardware\b/gi, ['how well-built it is']],
    [/\bthermal management\b/gi, ['cooling', 'heat handling']],
    [/\bprocessing power\b/gi, ['muscle', 'oomph']],
    [/\bstorage capacity\b/gi, ['space for files']],
  ];
  
  let result = text;
  let changes = 0;
  const maxChanges = Math.floor(text.length / 250);
  
  for (const [pattern, replacements] of map) {
    if (changes >= maxChanges) break;
    if (pattern.test(result)) {
      const original = result;
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, replacement);
      if (isGrammaticallyBroken(result)) {
        result = original;
      } else {
        changes++;
      }
    }
  }
  return result;
}

function injectDifficultyVariance(text: string): string {
  const rareWords: Array<[RegExp, string]> = [
    [/\bbig problem\b/gi, 'massive headache'],
    [/\bvery common\b/gi, 'wildly common'],
    [/\bvery difficult\b/gi, 'downright tough'],
  ];
  let changes = 0;
  for (const [pattern, replacement] of rareWords) {
    if (changes >= 2) break;
    if (pattern.test(text) && Math.random() < 0.5) {
      text = text.replace(pattern, replacement);
      changes++;
    }
  }
  return text;
}

function createBurstinessOutlier(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;
  if (Math.random() < 0.4 && paragraphs.length >= 3) {
    paragraphs = [paragraphs[0], paragraphs.slice(1).join(' ')];
  } else if (Math.random() < 0.3 && paragraphs.length >= 2) {
    const firstSentences = splitSentences(paragraphs[0]);
    if (firstSentences.length >= 2) {
      paragraphs = [firstSentences[0], firstSentences.slice(1).join(' '), ...paragraphs.slice(1)];
    }
  }
  return paragraphs.join('\n\n');
}

function normalizeEmDashUsage(text: string): string {
  const emDashCount = (text.match(/ — /g) || []).length;
  if (emDashCount > 3) {
    let replaced = 0;
    return text.replace(/ — /g, (match) => {
      if (replaced < Math.floor(emDashCount * 0.3)) {
        replaced++;
        return Math.random() < 0.5 ? ', ' : ' (';
      }
      return match;
    });
  }
  return text;
}

function varyInitialAdverbials(text: string): string {
  const map: Array<[RegExp, string[]]> = [
    [/\bAdditionally,\s+/gi, ['Plus, ', 'On top of that, ']],
    [/\bFurther(?:more)?,\s+/gi, ['What\'s more, ', 'And then there\'s ']],
    [/\bMoreover,\s+/gi, ['And on top of that, ', 'Plus, ']],
  ];
  for (const [pattern, replacements] of map) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacements[Math.floor(Math.random() * replacements.length)]);
    }
  }
  return text;
}

function humanizeSentenceSubjects(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  let changes = 0;
  for (let i = 0; i < sentences.length && changes < 2; i++) {
    const s = sentences[i];
    const subjectMatch = s.match(/^The\s+(\w+(?:\s+\w+)?)\s+is\s+(.+)$/i);
    if (subjectMatch && s.split(/\s+/).length < 20 && Math.random() < 0.5) {
      const [, subject, rest] = subjectMatch;
      sentences[i] = `${rest.charAt(0).toUpperCase() + rest.slice(1)}, that's the thing about ${subject.toLowerCase()}.`;
      changes++;
    }
  }
  return sentences.join(' ');
}

function varyClosurePattern(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  const last = sentences[sentences.length - 1];
  if (/,\s+and\s+\w+(\s+\w+)?\s+(are|is|can|may|might)\b/i.test(last) && Math.random() < 0.5) {
    const punchOptions = ["All of it matters, in the end.", "It's all connected, really.", "Hard to untangle one from the other."];
    sentences[sentences.length - 1] = punchOptions[Math.floor(Math.random() * punchOptions.length)];
  }
  return sentences.join(' ');
}

// ============================================================
// NEW FUNCTIONS FROM PROFESSOR'S ANALYSIS
// ============================================================

// REPLACED: enforceExtremeBurstinessPerSentence and aggressiveOpenerDiversification removed
// New gentle burstiness function that merges/splits at natural boundaries only

function gentleBurstiness(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  
  // Merge two short adjacent sentences at a logical conjunction
  for (let i = 0; i < sentences.length - 1; i++) {
    const w1 = sentences[i].split(/\s+/).length;
    const w2 = sentences[i + 1].split(/\s+/).length;
    if (w1 + w2 < 30 && /\b(and|but|so|because|which)\b/i.test(sentences[i + 1])) {
      sentences[i] = sentences[i].replace(/[.!?]$/, ', ') + sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      sentences.splice(i + 1, 1);
      break; // Only one merge per call
    }
  }
  
  // Split a very long sentence at a semicolon or natural break
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].split(/\s+/).length > 35) {
      const breakPoints = [';', ' — ', ', and ', ', but ', ', so '];
      for (const bp of breakPoints) {
        const idx = sentences[i].indexOf(bp);
        if (idx > 15 && idx < sentences[i].length - 15) {
          const first = sentences[i].substring(0, idx + (bp.endsWith(' ') ? 0 : 1)).trim();
          const second = sentences[i].substring(idx + bp.length).trim();
          sentences[i] = first + '.';
          sentences.splice(i + 1, 0, second.charAt(0).toUpperCase() + second.slice(1));
          break;
        }
      }
    }
  }
  
  return sentences.join(' ');
}

// DEPRECATED: Kept for reference but not used in applyAntiDetectionPass
/* function enforceExtremeBurstinessPerSentence(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // Inject 1-2 fragments (1-3 words)
  const fragmentCount = Math.min(2, Math.floor(sentences.length / 4));
  const fragmentIndices = new Set<number>();
  while (fragmentIndices.size < fragmentCount) {
    fragmentIndices.add(Math.floor(Math.random() * sentences.length));
  }
  const fragments = [
    "Hard, though.", "Real talk.", "Same thing.", "Makes sense.",
    "Not that simple.", "Depends who you ask.", "That's the thing.",
    "Pretty much.", "In a way.", "Sort of.", "There's a catch.",
    "Worth noting.", "Got to give them that.", "No question.", "Fair point.",
  ];
  for (const idx of fragmentIndices) {
    sentences[idx] = fragments[Math.floor(Math.random() * fragments.length)];
  }

  // Merge 1-2 pairs into very long sentences (35-50 words)
  let mergeCount = 0;
  for (let i = 0; i < sentences.length - 1 && mergeCount < 2; i++) {
    const w1 = sentences[i].split(/\s+/).length;
    const w2 = sentences[i + 1].split(/\s+/).length;
    if (w1 >= 6 && w1 <= 20 && w2 >= 6 && w2 <= 20 && Math.random() < 0.45) {
      const connectors = ['and', 'which', 'so', 'because', 'even though', 'but'];
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      const firstHalf = sentences[i].replace(/[.!?]$/, '');
      const secondHalf = sentences[i + 1];
      if (['which', 'because', 'even though'].includes(connector)) {
        sentences[i] = `${firstHalf}, ${connector} ${secondHalf.charAt(0).toLowerCase() + secondHalf.slice(1)}`;
      } else {
        sentences[i] = `${firstHalf} ${connector} ${secondHalf.charAt(0).toLowerCase() + secondHalf.slice(1)}`;
      }
      sentences.splice(i + 1, 1);
      mergeCount++;
    }
  }

  // Shorten first/last if too long
  if (sentences[0].split(/\s+/).length > 8 && Math.random() < 0.4) {
    sentences[0] = sentences[0].split(/\s+/).slice(0, 6).join(' ') + '.';
  }
  const lastIdx = sentences.length - 1;
  if (sentences[lastIdx].split(/\s+/).length > 12 && Math.random() < 0.5) {
    sentences[lastIdx] = sentences[lastIdx].split(/\s+/).slice(0, Math.min(10, sentences[lastIdx].split(/\s+/).length - 3)).join(' ') + '.';
  }

  return sentences.join(' ');
} */


// DEPRECATED: Kept for reference but not used in applyAntiDetectionPass
/* function aggressiveOpenerDiversification(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const getFirstWord = (s: string) => s.toLowerCase().split(/\s+/)[0] || '';
  for (let i = 0; i < sentences.length - 1; i++) {
    const w1 = getFirstWord(sentences[i]);
    const w2 = getFirstWord(sentences[i + 1]);
    if (w1 === w2 && w1.length > 2) {
      const words = sentences[i + 1].split(/\s+/);
      const subject = words[0];
      const remaining = words.slice(1);
      const verbIdx = remaining.findIndex(w => /\b(?:is|are|was|were|has|have|had|can|will|would|should|could|might|may|must|does|do|did|seems|appears|means|leads?|creates?|builds?|attracts?|brings?|offers?|provides?|gives?|takes?|keeps?|holds?)\b/i.test(w));
      if (verbIdx > 0 && Math.random() < 0.5) {
        const beforeVerb = remaining.slice(0, verbIdx);
        const verb = remaining[verbIdx];
        const afterVerb = remaining.slice(verbIdx + 1);
        sentences[i + 1] = `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${afterVerb.join(' ')}${beforeVerb.length > 0 ? ', ' + beforeVerb.join(' ') : ''}, ${subject.toLowerCase()}.`;
      } else {
        sentences[i + 1] = `Did so too — ${remaining.join(' ')}`;
      }
    }
  }

  // Handle triple same opener
  for (let i = 0; i < sentences.length - 2; i++) {
    if (getFirstWord(sentences[i]) === getFirstWord(sentences[i + 1]) &&
        getFirstWord(sentences[i + 1]) === getFirstWord(sentences[i + 2])) {
      const fillers = ["Here's the deal —", "Look,", "Thing is,", "Basically,", "So,"];
      sentences[i + 1] = `${fillers[Math.floor(Math.random() * fillers.length)]} ${sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1)}`;
    }
  }

  return sentences.join(' ');
} */

function injectSpecificAnchors(text: string): string {
  let result = text;
  // Decade/year anchors
  result = result.replace(/\bsince independence\b/gi, 'since 1965');
  result = result.replace(/\bsince (?:it was |they were )?independent\b/gi, 'since 1965');
  result = result.replace(/\bin the early years\b/gi, 'in the late 1960s');
  result = result.replace(/\btoday\b/gi, () => Math.random() < 0.3 ? 'these days' : 'today');
  // Round numbers
  result = result.replace(/\b(\d+)% of\b/gi, (match, num) => {
    if (Math.random() < 0.5 && Number(num) % 10 === 0) {
      const variants = [`around ${num}%`, `roughly ${num}%`, `about ${num}%`, `maybe ${num}%`];
      return variants[Math.floor(Math.random() * variants.length)] + ' of';
    }
    return match;
  });
  // Cost expressions
  result = result.replace(/\bis expensive\b/gi, () => Math.random() < 0.4 ? "doesn't come cheap" : "is expensive");
  result = result.replace(/\bis costly\b/gi, () => Math.random() < 0.4 ? "hits the wallet hard" : "is costly");
  return result;
}

function injectColloquialismByProfile(text: string, profile: string): string {
  if (profile !== 'english-general' && profile !== 'casual') return text;
  let result = text;
  // Drop "very" sometimes
  result = result.replace(/\bvery\s+(\w+)/gi, (match, word) => {
    if (['good','bad','big','small','old','new'].includes(word.toLowerCase())) return word;
    return ['pretty','kind of','sort of'][Math.floor(Math.random()*3)] + ' ' + word;
  });
  // Drop "really" occasionally
  result = result.replace(/\breally\s+/gi, () => Math.random() < 0.5 ? '' : 'really ');
  // Overly formal phrases
  result = result.replace(/\bin spite of\b/gi, 'despite');
  result = result.replace(/\bwith regard to\b/gi, 'about');
  // Insert one casual interjection mid-text
  const sentences = splitSentences(result);
  if (sentences.length >= 4 && Math.random() < 0.35) {
    const interjections = ["I mean, ", "Look, ", "Honestly, ", "Real talk, ", "To be fair, "];
    const idx = Math.floor(sentences.length * 0.55);
    const interjection = interjections[Math.floor(Math.random() * interjections.length)];
    sentences[idx] = interjection + sentences[idx].charAt(0).toLowerCase() + sentences[idx].slice(1);
    result = sentences.join(' ');
  }
  return result;
}

function recomposeSentenceOrder(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;
  const sentencesByParagraph = paragraphs.map(p => splitSentences(p));
  const lastPara = sentencesByParagraph[sentencesByParagraph.length - 1];
  if (lastPara.length >= 3 && Math.random() < 0.3) {
    const summaryIdx = lastPara.findIndex(s => /\b(?:ultimately|in conclusion|to sum up|therefore|thus|so)\b/i.test(s) || s.split(/\s+/).length < 10);
    if (summaryIdx >= 0 && sentencesByParagraph.length >= 2) {
      const summary = lastPara.splice(summaryIdx, 1)[0];
      const secondToLast = sentencesByParagraph[sentencesByParagraph.length - 2];
      secondToLast.splice(Math.floor(secondToLast.length / 2), 0, summary);
    }
  }
  return sentencesByParagraph.map(s => s.join(' ')).filter(s => s.trim()).join('\n\n');
}

function injectOneLongSentence(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  // Find longest sentence
  let maxIdx = 0, maxLen = 0;
  sentences.forEach((s, i) => {
    const len = s.split(/\s+/).length;
    if (len > maxLen) { maxLen = len; maxIdx = i; }
  });
  if (maxIdx < sentences.length - 1) {
    const w1 = sentences[maxIdx].split(/\s+/).length;
    const w2 = sentences[maxIdx + 1].split(/\s+/).length;
    if (w1 < 25 && w2 < 25 && Math.random() < 0.5) {
      const connectors = [', which meant that', ' — something that', ', a fact that', ", and that's why", ', because of which', ', which is why'];
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      sentences[maxIdx] = sentences[maxIdx].replace(/[.!?]$/, '') + connector + ' ' +
        sentences[maxIdx + 1].charAt(0).toLowerCase() + sentences[maxIdx + 1].slice(1);
      sentences.splice(maxIdx + 1, 1);
    }
  }
  return sentences.join(' ');
}

function aiFriendlyWordReplacement(text: string): string {
  const map: Array<[RegExp, string[]]> = [
    [/\bdynamic\b/gi, ['changing', 'active', 'busy', 'shifting']],
    [/\bvital\b/gi, ['key', 'big', 'real']],
    [/\brobust\b/gi, ['strong', 'solid', 'tough']],
    [/\bleverage\b/gi, ['use', 'tap into']],
    [/\bfoster\b/gi, ['help', 'push', 'grow']],
    [/\bstreamline\b/gi, ['simplify', 'speed up']],
    [/\bnavigate\b/gi, ['handle', 'deal with', 'work through']],
    [/\blandscape\b/gi, ['scene', 'field', 'space']],
    [/\bunderscores\b/gi, ['shows', 'proves', 'highlights']],
    [/\bunderscore\b/gi, ['show', 'make clear']],
    [/\bholistic\b/gi, ['full', 'whole', 'overall']],
    [/\bcomprehensive\b/gi, ['full', 'complete', 'wide']],
    [/\bnuanced\b/gi, ['subtle', 'tricky']],
    [/\bmyriad\b/gi, ['lots of', 'tons of']],
    [/\bplethora\b/gi, ['ton of', 'bunch of']],
    [/\bIn essence,?\s*/gi, ['', 'Basically, ', 'I mean, ']],
    [/\bIn summary,?\s*/gi, ['', 'So basically, ', 'Short version: ']],
    [/\bTo summarize,?\s*/gi, ['', 'Bottom line: ', 'Quick take: ']],
    // Removed problematic empty replacements that can create broken sentences
    // The stripMetadiscourse function already handles these cases more safely
  ];
  let result = text;
  let count = 0;
  const maxCount = Math.floor(text.length / 80);
  for (const [pattern, replacements] of map) {
    if (count >= maxCount) break;
    if (pattern.test(result)) {
      const original = result;  // save for grammar check
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, replacement);
      if (isGrammaticallyBroken(result)) {
        result = original;  // revert
      } else {
        count++;
      }
    }
  }
  return result;
}

// MASTER FUNCTION
function applyAntiDetectionPass(text: string, sourceText: string, tone: string): string {
  if (!text || text.length < 100) return text;

  let result = text;

  // STAGE 1: Cleanup AI markers
  result = stripMetadiscourse(result);
  result = normalizeNegatives(result);
  result = aiFriendlyWordReplacement(result);

  // STAGE 2: Token-level variety
  result = varyDiscourseMarkers(result);
  result = varyInitialAdverbials(result);
  result = injectTokenSurprise(result);   // updated map
  result = injectSpecificAnchors(result);

  // STAGE 3: Sentence-level restructuring (using gentle burstiness instead of aggressive)
  result = gentleBurstiness(result);       // NEW safe burstiness
  result = reorderClauses(result);
  result = humanizeSentenceSubjects(result);
  result = humanizeReferences(result);
  result = calibrateHedging(result);

  // STAGE 4: Tone and register injection
  result = injectColloquialismByProfile(result, tone);
  result = injectDifficultyVariance(result);

  // STAGE 5: Paragraph and structural finishes
  result = createBurstinessOutlier(result);
  result = recomposeSentenceOrder(result);
  result = injectGrammaticalAsymmetry(result);
  result = varyClosurePattern(result);
  result = normalizeEmDashUsage(result);

  return result;
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

export function finalHumanize(text: string, tone: HumanizerPostProcessTone = "casual", skipHeavyProcessing = false): string {
  if (
    tone === "indonesian-general" ||
    tone === "indonesian-academic" ||
    tone === "indonesian-professional"
  ) {
    return finalIndonesianHumanize(text, tone);
  }

  if (!text || text.length < 40) return text.trim();

  let result = text.trim();

  // ===== GENUINE HUMAN REWRITE: Skip ALL heavy post-processing, only cleanup =====
  // When the genuine human rewrite prompt was used, the output is already messy and human-like
  if (skipHeavyProcessing && tone.startsWith("english-")) {
    result = addHumanTouches(result, tone);
    return cleanupEnglishSpacing(result);
  }

  // ===== BLOG-STYLE OUTPUT: Skip heavy post-processing, already human enough =====
  const looksLikeBlog = /^[A-Za-z][\w\s,'-]+:?\s*$/gm.test(text) || /^#+\s/.test(text);
  if (looksLikeBlog && tone.startsWith("english-")) {
    // Already in blog format – just clean up
    result = addHumanTouches(result, tone);
    return cleanupEnglishSpacing(result);
  }

  // ===== PRODUCT-REVIEW: Skip heavy post-processing, just add human touches =====
  if (tone === "product-review") {
    // Model output should already be human enough from the review-style prompt
    // Just fix contractions and spacing
    result = addHumanTouches(result, tone);
    return cleanupEnglishSpacing(result);
  }

  // ===== PERSONAL-ADVICE: Skip aggressive post-processing, model output should be human enough =====
  if (tone === "english-personal" && /(your friend|you feel|don't compare|you shouldn't|you can|just because)/i.test(text)) {
    // For personal advice texts, the model output from PERSONAL_ADVICE_PROMPT is already human-like
    // Just add basic human touches and cleanup
    result = addHumanTouches(result, tone);
    return cleanupEnglishSpacing(result);
  }

  // ===== ANTI-DETECTION PASS untuk semua profil English =====
  if (tone.startsWith("english-") || tone === "casual") {
    result = applyAntiDetectionPass(result, text, tone);
    // Apply de-jargonizing untuk casual/general/expository register
    result = deJargonForCasualRegister(result, tone);
  }

  // Profile-specific direct rewrites (tetap seperti sebelumnya)
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

  // Existing structural & targeted human imprint (tetap)
  if (tone === "english-general" || tone === "english-expository" || tone === "english-discursive") {
    result = humanizeStructureEnglish(result);
    // Removed applyTargetedHumanImprint to avoid double processing with applyAntiDetectionPass
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
    .replace(/\b(?:That's|That is) a game-changer\b/gi, "That is useful")
    // Fix meta-comment leak from AI humanizers
    .replace(/(?:Here'?s a rewritten version[^.]*\.)\s*/gi, "");
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
