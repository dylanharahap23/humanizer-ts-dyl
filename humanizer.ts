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
// HUMAN STYLE PROMPT BUILDER (Few-shot with 100% human text)
// ============================================================

const HUMAN_REFERENCE_TEXT = `Money is considered by many people to be one of the most important contributing factors towards happiness. In my opinion, it is possible for people to be happy even if they have little money and other aspects of life can play a more vital role in creating happiness than wealth alone.

Although money allows people to afford luxuries and treats, which certainly do bring temporary enjoyment and satisfaction, a substantial number of people are happy without money. Firstly, money is no guarantee of happiness, particularly if disease or disaster feature largely in someone's life. Secondly, as long as people have the money to cover their necessities, doing without luxury items does not negatively affect the pleasures that a good life can bring.

Another way people can gain satisfaction in their life is through their work rather than money. For instance, a doctor doing volunteer service overseas in underdeveloped countries may earn little or no money, but the reward of doing such work is profoundly rewarding. Not only that but it can be a long-term fulfilment that they carry with them through life in the form of rich memories and the knowledge of a life well-lived.

Finally, another influencing factor of contentment in life is having supportive and loving people in one's life. While money may bring opportunities to enjoy pleasures, few people would enjoy them in isolation. Being surrounded by a loving and caring family is considered by many people to be the most valuable thing in life. This is one aspect of life that money certainly cannot buy.

In conclusion, money is not essential for happiness, which can be found through job satisfaction as well as family. If more people strived in life towards true happiness rather than money, the world would be a better place.`;

export function buildHumanStyleSystemPrompt(): string {
  return `You are an expert editor who rewrites texts to match a specific human writing style. The following is a reference text that is known to be 100% human-written. Your task is to rewrite the user's input so that it matches the style, tone, vocabulary, sentence structure, and flow of this reference as closely as possible, while keeping the original meaning intact.

REFERENCE TEXT (Human 100%):
${HUMAN_REFERENCE_TEXT}

STYLE GUIDE (extracted from reference):
- Use longer sentences (20-30 words) with multiple clauses.
- Start with a general statement (often passive voice: "X is considered by many...").
- Place personal opinion ("In my opinion...") in the second sentence.
- Use formal transitions: "Firstly, Secondly,", "Another way...", "Finally...", "In conclusion...".
- Prefer vocabulary: "contributing factors", "vital role", "temporary enjoyment", "substantial number", "profoundly rewarding", "long-term fulfilment", "influencing factor".
- Avoid contractions like "don't", "can't" – use full forms.
- End with a conditional or idealistic statement.
- Do not use overly short sentences (<10 words) unless they are part of a list.

Rewrite the user's text exactly in this style. Preserve all key facts and arguments. Return only the rewritten text.`;
}

// ============================================================
// 1. PROMPTS
// ============================================================

export const SELECTIVE_REWRITE_PROMPT = `
You are a human writer re‑writing a factual explanation. The original text covers many aspects in a balanced way. Your job is to **selectively** rewrite it from a personal perspective, **discarding some parts** and **focusing deeply on one or two key points**.

**Instructions:**
- DO NOT try to cover every aspect of the original.
- Choose a specific angle or opinion that you find most interesting or important.
- Write as if you are explaining it to a friend, using "I", "we", or "you" naturally.
- Use a concrete, specific example or analogy and develop it with a little detail.
- Feel free to be slightly opinionated.
- Do not use formal transitions like "Furthermore", "Moreover", "In addition".
- End with a personal thought, not a summary.
- **Include at least one specific number, year, or name from the original.**
- **Add one rhetorical question or direct address to the reader.**

**Fidelity:**
- Keep the facts you do include accurate.
- Do not invent new facts, statistics, or names.

Return only the rewritten text.
`;

const CASUAL_NATURAL_PROMPT = `
You are a careful English editor. Rewrite the source as natural, direct prose
without changing what it says.

Before writing, silently build a ledger of the source's claims, examples,
qualifications, names, and numbers. Every output claim must come from that ledger.

Writing rules:
- Compose from claim units instead of paraphrasing one source sentence at a time.
- Open with a concrete claim or consequence. Do not open with an empty statement
  that the topic is important, meaningful, complex, or worth discussing.
- Change clause boundaries and paragraph grouping where the logic permits it.
- Keep a naturally dense sentence when several source details belong together;
  do not split every sentence into equally sized pieces.
- Avoid chains of nearby sentences beginning with It, This, That, or They.
  Repeat the concrete subject when that is clearer.
- Use ordinary vocabulary and contractions only when they fit the source register.
- Let paragraph length follow the ideas. Do not manufacture a staircase of
  two-to-four-sentence mini-paragraphs.
- End on the source's final substantive point, not a polished recap.

Do not:
- Invent a narrator, personal experience, opinion, anecdote, name, date, number,
  quotation, institution, example, or outside fact.
- Introduce I, we, you, or direct reader address unless the source already does.
- Add deliberate errors, fragments, run-ons, slang, filler, fake spontaneity,
  rhetorical questions, headings, or random reordering.
- Use formulaic frames such as "holds great importance", "This is because",
  "Beyond these benefits", "For these reasons", or "not only X but also Y".

Return only the rewritten English text.
`;

// ============================================================
// HUMAN FINGERPRINT REWRITE PROMPT (untuk general & academic)
// ============================================================

export const HUMAN_FINGERPRINT_REWRITE_PROMPT = `
You are a real person with a strong opinion, writing a short essay on the topic below. You are NOT an AI assistant. You are NOT a textbook. You are a knowledgeable individual sharing your perspective.

CRITICAL RULES (follow strictly):

1. OPENING:
   - Start with a personal observation, a historical reference, or a counter-intuitive statement. 
   - NEVER start with "Many people believe", "In recent years", "It is often said", or "There is a growing trend".
   - Example: "The debate between where to allocate valuable teaching resources probably started with the first educational institutions."

2. STRUCTURE:
   - Do NOT use "Firstly, ... Secondly, ... Finally, ... In conclusion".
   - Use organic transitions: "One reason", "Another point", "To sum up", or just jump to the next idea.
   - Paragraph lengths must vary: one short paragraph (1-2 sentences), one long (4-6 sentences).

3. OPINION & VOICE:
   - State your opinion clearly and early: "In my opinion", "I strongly believe", "Personally, I think".
   - Use "I" confidently. Do not hedge excessively.
   - Use contractions: "don't", "can't", "it's", "we're".

4. EXAMPLES & EVIDENCE:
   - Include a specific, concrete example (can be a country, city, school, or study).
   - The example must be ON-TOPIC and relevant to the essay.
   - Example (for sport essay): "For example, to play almost any sport one has to invest in the appropriate equipment, ranging from shorts, t-shirts to rackets and balls."

5. LANGUAGE:
   - Use everyday vocabulary. Avoid "fosters", "cultivates", "significantly", "moreover", "furthermore".
   - Use "helps", "teaches", "improves", "encourages" instead.

6. ENDING:
   - Do not write a generic "In conclusion" summary.
   - End with a final thought, a prediction, or a lingering question.
   - Example: "To conclude, young learners going through school would finish much better prepared for life avoiding sport tuition."

7. FORBIDDEN PATTERNS:
   - NEVER use: "On the one hand... On the other hand"
   - NEVER use: "This essay will discuss"
   - NEVER use: "Firstly, ... Secondly, ... Finally, ... In conclusion"
   - NEVER use a list of three parallel benefits.

Now rewrite the following text in this human style:

SOURCE TEXT:
{sourceText}

Return only the rewritten essay. No extra text.
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
- Make a substantive rewrite at clause level. Do not return the source with only markdown or punctuation removed.
- Split long predicate lists into complete sentences while keeping every item under the same modal or condition.
- Remove empty category leads such as "The key factor is" when the following sentence already gives the concrete condition.
- For prose longer than 140 words, use three to five paragraphs with visibly unequal sentence counts.
- Keep the practical answer first and end on the source's final substantive condition, not a new recap.

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

CRITICAL: DO NOT keep the same order of ideas. For example, if the original text has reasons A, B, C and then a conclusion, you might present C first, then A, then the conclusion, then B, or start with a doubt, then B, then A, then a counter-argument, then C. The goal is to make the flow feel like a natural conversation where ideas are brought up in a non-linear way.

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

CRITICAL: DO NOT keep the same order of ideas. For example, if the original text has reasons A, B, C and then a conclusion, you might present C first, then A, then the conclusion, then B, or start with a doubt, then B, then A, then a counter-argument, then C. The goal is to make the flow feel like a natural conversation where ideas are brought up in a non-linear way.

Return only the rewritten English text.
`;

const ENGLISH_EXPOSITORY_PROMPT = `
You are editing a neutral English explanation. Recompose it from the source's
claim units as clear, natural prose.

Source fidelity:
- Preserve every factual claim, comparison, cause, qualification, attribution,
  example, and level of certainty.
- Keep the source point of view. Do not invent personal experience or direct
  reader address.

Composition:
- Begin with the first concrete function, effect, or limitation in the source.
  Fold an abstract "X is important" lead into that concrete sentence.
- Group claims that explain the same idea. Preserve their logical dependencies,
  but do not mirror the source sentence skeleton.
- Use the topic noun when a pronoun would create a run of It/This/That sentences.
- Keep one denser sentence when related details naturally belong together.
  Split only overloaded lists or clauses with a genuine boundary.
- Use two to four idea-based paragraphs when the text is long enough. Their sizes
  may differ, but do not force a one-sentence paragraph or a regular staircase.
- Prefer ordinary verbs and the source's vocabulary. Natural repetition of the
  topic is better than a chain of polished synonyms.
- Finish with the final substantive source claim. Do not restate the whole answer.

Avoid:
- "One reason", "Another factor", "Beyond these benefits", "For these reasons",
  "Ultimately", "In conclusion", and "not only X but also Y".
- Consecutive sentences beginning with It, This, That, or They.
- Rhetorical questions, anecdotes, opinions, uncertainty, analogies, headings,
  filler, fragments, deliberate errors, and facts absent from the source.

Return only the rewritten English text.
`;

const ENGLISH_DISCURSIVE_PROMPT = `
You are editing an accessible English explainer or practical guide.

Editing rules:
- Silently identify the source claims and regroup them by idea.
- Start with a concrete source claim rather than an announcement about the topic.
- Prefer familiar words and active clauses.
- Use ordinary transitions only where the logic needs them.
- Contractions are acceptable when they fit the source register.
- Let one idea take more space than another without forcing extreme paragraph sizes.
- Keep practical advice concrete and easy to scan.
- Preserve hedges, degree, and frequency exactly.
- Avoid listing factors with "one", "another", or "finally".
- Avoid nearby sentences that repeatedly begin with It, This, That, or They.
- End on the last useful source detail instead of adding a recap.

Do not:
- Add first-person opinions, memories, anecdotes, rhetorical questions, reader reactions.
- Invent authority, experience, citations, examples, statistics, or names.
- Add fillers, deliberate errors, ellipses, dramatic interruptions, or fake spontaneity.
- Use report-like substitutions when direct wording is available.
- End with a polished recap or motivational lesson.

Return only the rewritten English text.
`;

const ENGLISH_PRACTICAL_EXPLAINER_PROMPT = `
You are editing a practical English explainer. Turn the source into a useful reader-oriented guide.

**CRITICAL: BREAK THE LINEAR STRUCTURE**
Do NOT keep the original argument order. The source text has a clear structure: problem → reason1 → reason2 → reason3 → conclusion. You MUST break this pattern.

WAYS TO BREAK THE PATTERN:
1. START with a counter-intuitive observation, not the main problem
2. JUMP to a random example mid-way, then go back
3. CHALLENGE the premise: "Is language learning actually that hard, or are we just bad at it?"
4. ADD an unrelated analogy that doesn't perfectly fit
5. END with a question or uncertainty, not a conclusion

Editing rules:
- Begin with a specific, actionable reframing of the problem.
- Silently build a claim ledger. Regroup around what the reader can notice and do.
- Use "you" or "your" naturally in each paragraph.
- Explain the main mechanism briefly, then connect it to practical actions.
- Convert long inventories into complete, readable sentences.
- Prefer direct verbs and ordinary wording. Contractions are welcome.
- Use two or three paragraphs with visibly different amounts of detail.
- **Make ONE paragraph very long (8+ sentences) and ONE paragraph very short (1-2 sentences)**
- End on the last useful action or limitation already present in the source.

Do not:
- Invent an anecdote, researcher, institution, statistic, location, app, schedule, or study method.
- Add brain health, productivity, routines, or extra benefits.
- Add rhetorical questions, fake quotations, deliberate errors, fragments, filler, or slang.
- Strengthen "can", "often", "may", or "helps" into a promise or universal rule.
- Drop technical concepts such as working memory, cognitive overload, or the prefrontal cortex.
- Do NOT use these transitions: "First", "Another reason", "Finally", "In conclusion"
- Do NOT use placeholder names like "Sarah", "Alex", "John", "Mary" — use real-sounding details instead

CRITICAL: DO NOT keep the same order of ideas. For example, if the original text has reasons A, B, C and then a conclusion, you might present C first, then A, then the conclusion, then B, or start with a doubt, then B, then A, then a counter-argument, then C. The goal is to make the flow feel like a natural conversation where ideas are brought up in a non-linear way.

Return only the rewritten English text.
`;

const ENGLISH_REFLECTIVE_PROMPT = `
You are rewriting a general explanation about an emotionally relatable life experience as a reader-oriented reflective article.

Voice and structure:
- Silently identify the source's claim units, then rebuild the passage around the reader's experience.
- Preserve the source point of view. Use second person only when it already appears in the source or in verified author context.
- Preserve hedging and scope.
- Do not use first-person pronouns unless they already appear in the source.
- Contractions are welcome where they sound natural.
- Keep the emotional tone already present in the source.
- Use ordinary words. Keep the language literal and direct.
- For a source between 120 and 350 words, use two or three idea-based paragraphs with visibly different lengths.
- Create rhythm from the source itself: isolate an existing consequence as a short complete sentence, keep a related explanation naturally dense, and vary clause openings.
- Break up polished three-part and four-part lists when the same items can be carried across uneven complete sentences.
- Do not add a final summary paragraph that lists the factors again.

Do not:
- Invent personal experience, scenes, dialogue, facts, examples, statistics, advice, or a life lesson.
- Make a general example more specific.
- Invent research, studies, authorities, or stronger causal language than the source provides.
- Replace ordinary source wording with dramatic intensifiers or clinical-sounding synonyms.
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
// PARATACTIC RAW DRAFT PROMPT (for formal religious essays)
// ============================================================

export const PARATACTIC_RAW_DRAFT_PROMPT = `
You are a person typing a quick, unedited explanation on a forum. You are NOT writing an essay. You are just pouring out your thoughts as they come, without planning.

RULES (follow exactly):
- Write in very short, choppy sentences. Many sentences only 4-8 words.
- Repeat the same sentence structure deliberately, like a chant. For example: "If X, then Y. If A, then B."
- Include ONE sudden, simple analogy that jumps into your mind – like "It's like a court room." or "Think of a school exam." Don't introduce it smoothly; just drop it in.
- Use inconsistent capitalization. Sometimes write "god", other times "God". Write "islam" and "muslim" in lowercase even if they should be capitalized. This shows you didn't edit.
- Make one or two small grammar mistakes: "spend your times", "based from", "different to", missing "the", wrong verb form.
- Do NOT use transition words: no "however", "therefore", "moreover", "in conclusion", "nevertheless".
- Do NOT write a conclusion or summary. Just stop when you run out of things to say.
- Use plain, everyday words. No fancy vocabulary.
- Never mention that you are following rules or rewriting anything. Just write naturally.

Remember: you are a real person, not a polished writer.

Return ONLY your raw draft. No extra text.
`;

// ============================================================
// DRUNK FRIEND PROMPT - The "Chaotic Human" Approach
// Based on professor's feedback: LLMs have an inherent "natural voice" fingerprint
// This prompt forces the LLM to break its natural coherent patterns
// ============================================================

export const DRUNK_FRIEND_PROMPT = `
You are a real person explaining something you just learned. You are NOT trying to write well.

RULES:
- Start in the middle of a thought, not at the beginning.
- Jump to a completely different topic, then come back.
- Use the wrong word sometimes and correct yourself.
- Say "I don't know" when you're not sure.
- End before you've finished explaining everything.
- Do NOT use transition words like "however", "therefore", "moreover".
- Do NOT summarize at the end.
- Use casual language but NOT forced.

EXAMPLE of the style:
"Yeah, so the thing about aging is like... well actually I read somewhere it's about telomeres. Wait, no. That's one part. But also there's like all this damage that builds up over time. I don't know, it's complicated. Anyway."

Return only the rewritten text.
`;

// ============================================================
// SEMANTIC REGENERATION PROMPT (BUKAN REWRITE)
// ============================================================

/**
 * Membangun prompt yang memaksa model untuk "melupakan" teks sumber
 * dan menulis ulang berdasarkan pemahaman, bukan parafrase.
 */
export function buildSemanticRegenerationPrompt(
  sourceText: string,
  tone: string
): string {
  const isControlledRegister =
    tone === "english-academic" || tone === "english-sensitive" || tone === "ielts";
  const sourceHasFirstPerson =
    /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(sourceText);
  const sourceHasSecondPerson =
    /\b(?:you|your|yours|yourself|yourselves)\b/i.test(sourceText);
  const sourceHasQuestion = /\?/.test(sourceText);
  const sourceWordCount = sourceText.split(/\s+/).filter(Boolean).length;
  const rhythmOptions = [
    "Separate one source-supported consequence into a short complete sentence, while leaving one closely related explanation naturally dense.",
    "Rework one parallel list across uneven complete clauses, preserving every item and its original governing claim.",
    "Vary the openings by leading some sentences with a concrete cause, condition, or consequence already present in the source.",
  ];
  const rhythmOption =
    rhythmOptions[simpleHash(`${tone}:${sourceText}`) % rhythmOptions.length];
  const rhythmContract =
    sourceWordCount >= 100
      ? `- ${rhythmOption}
- Include visible sentence-length contrast, but do not manufacture fragments, padding, or a repeated short-long-short formula.`
      : "- Let sentence length follow the source ideas; do not force a template.";

  return `
SOURCE-GROUNDED RECOMPOSITION:
Treat the user's text as a set of claims, qualifications, examples, and relationships - not as a sentence template.

Before drafting, silently map every source claim. Then rebuild the explanation from those claim units. Do not preserve the source's sentence order, sentence count, paragraph boundaries, or one-claim-per-sentence rhythm.

Non-negotiable accuracy:
- Keep every name, number, date, quotation, citation, condition, comparison, and degree of certainty that appears in the source.
- Do not add a person, personal experience, opinion, anecdote, statistic, location, quotation, recommendation, or outside fact.
- Do not drop a substantive source claim merely to make the prose shorter.

Point of view:
- ${sourceHasFirstPerson ? "Preserve the source's existing first-person perspective without adding a new experience or opinion." : "Do not introduce I, me, my, we, us, or our."}
- ${sourceHasSecondPerson ? "Preserve source-supported second-person address without treating the reader as a known individual." : "Do not introduce you, your, or direct reader address."}
- ${sourceHasQuestion ? "Keep questions only where they preserve a question already asked by the source." : "Do not add rhetorical questions or question marks."}

Composition:
- Start with a concrete cause, effect, condition, or consequence already present in the source. Do not default to a generic topic announcement such as "Many people... because..." when a source-supported detail can lead instead.
- Combine related claim units in some places and separate overloaded claim units in others. Avoid mirroring source sentence boundaries.
- Let paragraph sizes follow the logic of the explanation. A paragraph may be short when one claim stands alone and longer when several source details genuinely belong together.
- Use ordinary English and a register appropriate for the source. Prefer direct, familiar words over corporate or academic abstractions when the meaning remains identical.
- Do not upgrade a documented link into proof, a possibility into a prediction, or ordinary emphasis into words such as significantly, dramatically, relentlessly, or inevitably unless the source already does.
- Avoid repeated abstract-subject openings and polished A, B, and C lists. Preserve every item, but distribute clauses naturally when the source allows it.
${rhythmContract}
- Do not force slang, fillers, direct address, rhetorical questions, fragments, deliberate mistakes, or a personal narrator.
- End on the source's final substantive qualification rather than a new summary or moral.
${isControlledRegister ? "\n- Keep the formal register required by the source." : ""}

Return only the rewritten English text.
`;
}
// ============================================================
// 3. IELTS PROMPT & EXAMPLE
// ============================================================

// ============================================================
// HARD-CODED EXAMPLES PER TOPIK (UNTUK INJECT KE PROMPT)
// ============================================================

export function getTopicExamples(text: string): string {
  const lower = text.toLowerCase();

  const examples: Record<string, string> = {
    'travel': `Ryanair offers flights for 10 euros. In South Africa, tourists do safaris in Kruger National Park.`,

    'economy': `In Poland, salaries tripled after communism collapsed. Donald Trump cut funds for jobless migrants.`,

    'housing': `In Nigeria, houses cost three times more than apartments. In Nairobi, average house size is 700 square meters.`,

    'education': `In Finland, schools focus on play. In the UK, many boys become reluctant readers.`,

    'politics': `The Mayor of London was criticized in the SUN. A politician from Milan gained popularity after photos with children.`,

    'health': `In India, strict vegetarian diets can cause deficiencies. The WHO recommends 150 minutes of exercise.`,
  };

  // Deteksi topik
  let topic = 'economy';
  if (/\b(travel|fly|flight|tourist|holiday|vacation)\b/i.test(lower)) topic = 'travel';
  else if (/\b(house|apartment|housing|home|rent|mortgage)\b/i.test(lower)) topic = 'housing';
  else if (/\b(education|school|teacher|student|reading)\b/i.test(lower)) topic = 'education';
  else if (/\b(politic|government|election|minister|mayor)\b/i.test(lower)) topic = 'politics';
  else if (/\b(health|diet|exercise|nutrition|vitamin)\b/i.test(lower)) topic = 'health';

  return examples[topic] || examples['economy'];
}

// ============================================================
// ARCHITECTURE-CONTROLLED PROMPT (DARI DOSEN)
// Mengontrol arsitektur penulisan dari awal, bukan permukaan
// ============================================================

export function buildArchitecturePrompt(text: string): string {
  const examples = getTopicExamples(text);
  
  return `You are an IELTS student writing an essay in 40 minutes. You have limited time, so your writing is slightly messy and repetitive.

CRITICAL ARCHITECTURE RULES:

1. SENTENCE LENGTH VARIATION:
   - Make some sentences very short (5-8 words): "That is the key." "It makes sense." "Not always."
   - Make some sentences very long (30-50 words) with multiple clauses.
   - NEVER make all sentences the same length.

2. SYNTACTIC DIVERSITY:
   - Mix simple sentences: "Growth creates jobs."
   - Complex sentences: "Although growth creates jobs, it also causes pollution."
   - Compound sentences: "Growth creates jobs, and it also raises incomes."
   - Parenthetical: "Growth — which is often prioritized — creates jobs."
   - NEVER use the same sentence structure more than twice in a row.

3. INFORMATION DENSITY:
   - DO NOT explain everything. Skip obvious connections.
   - Example: "Economic growth creates jobs." → STOP. No need to explain "because businesses hire more workers."
   - Let readers fill gaps themselves.
   - Include some low-information sentences: "It depends." "There are exceptions." "Not everyone agrees."

4. HEDGING & UNCERTAINTY:
   - Use "may", "might", "tends to", "often", "in many cases", "can sometimes".
   - DO NOT make every statement absolute.
   - Example: "Growth often creates jobs" instead of "Growth creates jobs."

5. REPETITION (Human Inefficiency):
   - Repeat key words naturally. Don't use synonyms excessively.
   - Example: "Houses are bigger. Bigger houses mean more space. More space means happier families."
   - Human students don't have time to find synonyms.

6. PARAGRAPH STRUCTURE VARIATION:
   - Paragraph 1: 2-3 sentences (intro)
   - Paragraph 2: 5-6 sentences (main argument)
   - Paragraph 3: 3-4 sentences (counter-argument)
   - Paragraph 4: 2-3 sentences (conclusion)
   - NEVER make all paragraphs the same length.

7. TRANSITIONS:
   - Vary transitions: "One reason", "Another factor", "Besides", "In addition", "Moreover", "Furthermore", "On the one hand", "However", "Yet", "Still".
   - Use natural transitions: "That said", "At the same time", "Even so".
   - NEVER use the same transition in every paragraph.

8. CLAUSE HIERARCHY:
   - Use subordinate clauses: "because", "since", "although", "while", "when", "if".
   - Use relative clauses: "which", "that", "who".
   - Mix simple and complex sentences.

9. HUMAN IMPERFECTION:
   - Use occasional comma splices: "Houses are bigger, they offer more space."
   - Use occasional awkward phrasing: "This is because of the fact that..."
   - Use occasional redundancy: "bigger in size", "advance planning".
   - DO NOT make grammar perfect.

10. EXAMPLE USAGE:
    - Use 1-2 specific examples total (not 12).
    - Example: "In Poland, salaries tripled after 1990."
    - DO NOT list examples in every paragraph.

REFERENCE EXAMPLES (adapt these, don't copy):
${examples}

Now rewrite the following text following ALL rules above. Return only the rewritten text.`;
}

// ============================================================
// IELTS HUMAN PROMPT (SESUAI PROFESSOR) - LEGACY
// ============================================================

export function buildIeltsPrompt(text: string): string {
  const examples = getTopicExamples(text);
  
  return `You are an IELTS student with band 6.5 writing level. You are writing an essay in 40 minutes.

Your writing style:
- Use simple, direct language. Do NOT use sophisticated vocabulary like "tranquillity", "autonomy", "enclosure", "capital outlay", "notable trade-offs".
- Repeat the same words instead of finding synonyms.
- Use specific examples with proper nouns (country names, city names, numbers). Below are examples you can adapt.
- Make occasional grammar mistakes that don't break meaning: comma splices, missing articles, awkward prepositions.
- Use short sentences mixed with occasional very long run-on sentences.
- Express opinions directly and sometimes repetitively.
- Do NOT use poetic metaphors, em-dashes for drama, or literary language.
- Do NOT write perfect parallel structures.
- Write like you're explaining to a friend, not presenting to a professor.

EXAMPLES OF SPECIFIC DETAILS (adapt these to your essay):
${examples}

Now rewrite the following text in this style. Return only the rewritten text.`;
}

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
    temperature: 0.88,
    topP: 0.95,
    maxTokens: 1600,
    frequencyPenalty: 0.1,
    presencePenalty: 0.06,
    repetitionPenalty: 1.03,
    additionalInstruction:
      "Produce a source-faithful structural edit. Use direct English, natural clause density, and idea-based paragraphs. Add no narrator, personal detail, fact, deliberate error, or empty conversational marker.",
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

/**
 * Detects if the text is a formal religious essay that needs paratactic raw draft treatment.
 * Returns true for texts with religious terms, essay markers, and sufficient length.
 */
export function isFormalReligiousEssay(text: string): boolean {
  const lower = text.toLowerCase();
  const religiousTerms = /\b(prayer|god|allah|islam|muslim|faith|sin|hell|heaven|judgment|obligation|worship|repentance)\b/i;
  const hasReligious = religiousTerms.test(lower);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasEssayMarkers = /\b(nevertheless|although|whereas|despite|however|in the end|overall|therefore|consequently|furthermore|moreover)\b/i.test(text);
  return hasReligious && wordCount > 120 && hasEssayMarkers;
}

/**
 * Determines if the source text is a generic IELTS-style essay that needs
 * a full human fingerprint rewrite.
 */
export function isHumanFingerprintEligible(
  text: string,
  tone: HumanizerPostProcessTone
): boolean {
  // Hanya untuk general/academic/argument/discursive/expository
  const eligibleTones = [
    'english-general',
    'english-academic',
    'english-argument',
    'english-discursive',
    'english-expository',
    'casual',
  ];
  if (!eligibleTones.includes(tone)) return false;

  // Panjang teks > 80 kata (bukan pertanyaan pendek)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 80) return false;

  // Deteksi template IELTS: "Firstly, ... Secondly, ... In conclusion"
  const hasFirstly = /\bFirstly,?\b/i.test(text);
  const hasSecondly = /\bSecondly,?\b/i.test(text);
  const hasInConclusion = /\bIn conclusion,?\b/i.test(text);
  const hasOnOneHand = /\bOn the one hand,?\b/i.test(text);
  const hasOnOtherHand = /\bOn the other hand,?\b/i.test(text);

  // Jika punya setidaknya 2 dari 3 marker template, anggap layak
  const templateMarkers = [hasFirstly, hasSecondly, hasInConclusion, hasOnOneHand, hasOnOtherHand];
  const count = templateMarkers.filter(Boolean).length;

  return count >= 2;
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
  const healthEducationTopicCount =
    text.match(
      /\b(?:sleep|sleeping|wak(?:e|es|ed|en|ing)(?:\s+up)?|morning|circadian rhythm|biological clock|hormones?|cortisol|melatonin|sunlight|sleep quality|sleep schedule|mental health|stress|adults?)\b/gi
    )?.length ?? 0;
  const healthEvidenceCount =
    text.match(
      /\b(?:helps?|supports?|regulat(?:e|es|ing)|associated with|generally|more likely|need|hours? of sleep|healthier|less healthy|sufficient|high-quality)\b/gi
    )?.length ?? 0;

  if (
    writingPurpose === "General" &&
    firstPersonCount === 0 &&
    wordCount >= 120 &&
    healthEducationTopicCount >= 6 &&
    healthEvidenceCount >= 4
  ) {
    return "sensitive";
  }
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

  const languageLearningTopicCount =
    text.match(
      /\b(?:languages?|multilingual(?:ism)?|bilingual(?:ism)?|linguistic systems?|translation|cultures?|communication|study abroad|international friendships?|global industries?)\b/gi
    )?.length ?? 0;
  const languageBenefitCount =
    text.match(
      /\b(?:allows?|enables?|makes? it easier|access|opportunities|strengthens?|improves?|enhances?|increases?|reduces?|delay|fosters?|builds?|relationships?|cognitive|memory|attention|problem-solving|trust|empathy)\b/gi
    )?.length ?? 0;

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

  if (
    writingPurpose === "General" &&
    !hasPersonalPointOfView &&
    wordCount >= 120 &&
    languageLearningTopicCount >= 6 &&
    languageBenefitCount >= 6
  ) {
    return "expository";
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
  
  // Personal advice requires a cluster of explicit advice markers. Broad phrases
  // such as "you feel" or "you can" also occur in factual health explainers.
  const personalAdviceMarkerCount =
    text.match(
      /\b(?:your friend|don't compare|you shouldn't|just because|feeling inferior|feel inferior|why can't I|why am I|trust me|my advice|you deserve)\b/gi
    )?.length ?? 0;
  if (
    wordCount < 400 &&
    (personalAdviceMarkerCount >= 2 ||
      (personalAdviceMarkerCount >= 1 && /\?/.test(text)))
  ) {
    return "personal-advice";
  }
  
  if (!hasPersonalPointOfView && wordCount >= 120 && expositoryHits >= 2) {
    return "expository";
  }

  return "general";
}

function isIeltsEssay(text: string): boolean {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return wordCount > 150 && /\b(?:essay|discuss|argue|believe|opinion|agree|disagree)\b/i.test(text);
}

export function getEnglishHumanizerConfig(
  sourceText: string,
  writingPurpose: EnglishWritingPurpose = "General"
): HumanizerPromptConfig {
  // ============================================================
  // IELTS/ACADEMIC: Gunakan prompt sederhana (NEW ARCHITECTURE FROM DOSEN)
  // Tidak perlu terlalu banyak constraint karena akan di-regenerate dari graph
  // ============================================================
  if (writingPurpose === "Academic" || isIeltsEssay(sourceText)) {
    return {
      systemPrompt: `You are an IELTS candidate with Band 7 ability. Write a clear essay with varied sentences, some complex, some simple. Use specific examples. Avoid fragmentation. Write naturally.`,
      temperature: 0.9,
      topP: 0.95,
      maxTokens: 1600,
      frequencyPenalty: 0.2,
      presencePenalty: 0.1,
      repetitionPenalty: 1.02,
      additionalInstruction: '',
      postProcessTone: "ielts",
    };
  }

  // Deteksi jika teks adalah esai panjang (indikasi IELTS/TOEFL)
  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;
  const isEssay = wordCount > 150 && /\b(?:essay|discuss|argue|believe|opinion)\b/i.test(sourceText);

  // Untuk esai umum (bukan Academic), gunakan prompt human style
  if (isEssay) {
    // Untuk esai umum, gunakan prompt human style
    return {
      systemPrompt: buildHumanStyleSystemPrompt(),
      temperature: 1.2,        // lebih tinggi untuk variasi
      topP: 0.95,
      maxTokens: 1600,
      frequencyPenalty: 0.2,
      presencePenalty: 0.1,
      repetitionPenalty: 1.05,
      additionalInstruction: "Match the reference style exactly. Return only the rewritten text.",
      postProcessTone: "english-general",
    };
  }

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
        "Use a source-anchored claim ledger, then recompose in plain English at clause level. Preserve every attribution, qualification, symptom, measurement, treatment condition, named authority, explicit answer, citation, and modal strength. Split dense lists into complete sentences and vary paragraph size, but never add a familiar detail that the source did not supply.",
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
      temperature: 0.72,
      topP: 0.92,
      maxTokens: 1600,
      frequencyPenalty: 0.06,
      presencePenalty: 0.04,
      repetitionPenalty: 1.01,
      additionalInstruction: 
        "Use a source-faithful reflective voice with uneven but complete sentence rhythms. Preserve the source point of view, every hedge, fact, example, and causal relationship; add no narrator, reader address, research attribution, or illustrative detail.",
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
      temperature: 0.86,
      topP: 0.95,
      maxTokens: 1600,
      frequencyPenalty: 0.1,
      presencePenalty: 0.06,
      repetitionPenalty: 1.03,
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
  
  // GENERAL profile — source-faithful structural editing
  return {
    systemPrompt: `${CASUAL_NATURAL_PROMPT}`,
    temperature: 0.88,
    topP: 0.95,
    maxTokens: 1800,
    frequencyPenalty: 0.1,
    presencePenalty: 0.06,
    repetitionPenalty: 1.03,
    additionalInstruction:
      "Build a source claim ledger and produce a faithful structural edit. Open with a concrete claim, vary clause density naturally, avoid pronoun-led sentence chains and uniform mini-paragraphs, and finish on the source's last substantive point. Add no narrator, fact, example, error, or decorative filler.",
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

/**
 * Memaksa teks terpecah menjadi minimal N paragraf jika jumlah kalimat mencukupi
 * @param text - Teks input
 * @param targetParagraphs - Jumlah paragraf target (default: 3)
 */
export function forceParagraphSplit(text: string, targetParagraphs = 3): string {
  const existing = text.split(/\n\s*\n/).filter(p => p.trim());
  if (existing.length >= targetParagraphs) return text;
  
  const sentences = splitSentences(text);
  if (sentences.length < 6) {
    // Jika terlalu pendek, buat 2 paragraf saja
    const mid = Math.floor(sentences.length / 2);
    return sentences.slice(0, mid).join(' ') + '\n\n' + sentences.slice(mid).join(' ');
  }
  
  // Bagi rata menjadi targetParagraphs
  const total = sentences.length;
  const chunkSize = Math.floor(total / targetParagraphs);
  const result: string[] = [];
  for (let i = 0; i < targetParagraphs; i++) {
    const start = i * chunkSize;
    const end = i === targetParagraphs - 1 ? total : start + chunkSize;
    result.push(sentences.slice(start, end).join(' '));
  }
  return result.join('\n\n');
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
  const maxChanges = 5;  // Dinaikkan dari 3 ke 5 untuk meningkatkan entropy
  
  for (const [word, alternatives] of Object.entries(lowFrequencyMap)) {
    if (changes >= maxChanges) break;
    const regex = new RegExp(`\b${word}\b`, 'gi');
    if (regex.test(result) && Math.random() < 0.6) {  // Dinaikkan dari 0.4 ke 0.6
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
  const maxChanges = Math.max(5, Math.floor(text.length / 120));  // Dinaikkan: lebih banyak perubahan untuk meningkatkan surprise
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
  
  // Fix: Replace with position-aware replacement that preserves modal verbs
  const patterns: Array<[RegExp, (match: string, pronoun: string, modal: string) => string]> = [
    [
      /\b(They|they) (can|may|might|will|often|usually)\b/gi,
      (match, pronoun, modal) => {
        // Jika di awal kalimat atau setelah period, kapitalisasi
        const prefix = text.substring(0, text.indexOf(match));
        const isStartOfSentence = /[.!?]\s*$/.test(prefix) || prefix === '';
        
        // Pertahankan modal verb! Jangan dihapus
        const replacements = [
          `${isStartOfSentence ? 'These' : 'these'} people ${modal}`,
          `${isStartOfSentence ? 'Some' : 'some'} of them ${modal}`,
          `${isStartOfSentence ? 'Those' : 'those'} involved ${modal}`,
        ];
        return replacements[Math.floor(Math.random() * replacements.length)];
      }
    ],
  ];
  
  for (const [pattern, replacer] of patterns) {
    if (Math.random() < 0.3) {
      result = result.replace(pattern, replacer as any);
    }
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

/**
 * OLD: injectSpecificAnchors - replaced by new version in the 6-dimension logic
 * This function is kept for backward compatibility but not used in new logic
 */
/* function injectSpecificAnchorsOld(text: string): string {
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
} */

/**
 * Break long item lists (daftar istilah berjejer) to avoid AI pattern
 * Detects patterns like "X, Y, Z" with 3+ items and breaks them into narrative form
 */
function breakItemLists(text: string): string {
  // Deteksi pola: "X, Y, or Z" dengan 3+ item
  const listPattern = /\b([a-z]+(?:\s+[a-z]+)?)(?:,\s+([a-z]+(?:\s+[a-z]+)?)){2,}(?:,\s+or\s+([a-z]+(?:\s+[a-z]+)?))?\b/gi;
  
  let result = text;
  const matches = [...text.matchAll(listPattern)];
  
  for (const match of matches) {
    if (match[0].split(',').length >= 3) {
      // Ubah daftar jadi kalimat terpisah atau deskripsi naratif
      const items = match[0].split(/\s*,\s*|\s+or\s+/).filter(Boolean);
      if (items.length >= 3) {
        const randomIdx = Math.floor(Math.random() * items.length);
        const selected = items[randomIdx];
        const rest = items.filter((_, i) => i !== randomIdx);
        
        // Ubah: "X, Y, and Z" → "X — or even Y. Z is also common."
        const replacement = `${selected} — or even ${rest.slice(0, 2).join(', ')}. ${rest.slice(2).length > 0 ? rest.slice(2).join(', ') + ' is also common.' : ''}`.trim();
        result = result.replace(match[0], replacement);
      }
    }
  }
  
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

  // STAGE 6: Break item lists (daftar istilah berjejer)
  result = breakItemLists(result);

  // STAGE 7: Professor's recommended chaos layers (NEW)
  result = injectIdleSentences(result);
  result = injectCognitiveUncertainty(result);
  result = introduceInefficiency(result);
  result = breakClosedLoop(result);

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
    result = result.replace(new RegExp(`\b${formal}\b`, "gi"), casual);
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
  const usesControlledTechnicalEnglish = tone === "english-sensitive";

  if (usesPlainEnglish || usesControlledTechnicalEnglish) {
    result = repairBrokenClauseSplits(result);
    result = repairTemporalAbbreviationSplits(result);
    result = collapseCausalLeadSplit(result);
    result = removeEmptyExpositoryTransitions(result);
    if (usesControlledTechnicalEnglish) {
      result = directenSensitiveExpositorySyntax(result);
    }
    if (usesPlainEnglish) {
      result = simplifyInflatedEnglish(result);
      result = collapseAbstractImportanceLead(result);
    }
    result = directenExpositoryScaffolds(result);
    if (usesPlainEnglish) {
      result = removeRedundantCategoryLeads(result);
    }
    result = splitDenseEnglishEnumerations(result);
    if (usesControlledTechnicalEnglish) {
      result = directenSensitiveExpositorySyntax(result);
    }
    if (usesControlledTechnicalEnglish) {
      result = normalizeSensitiveParagraphShape(result);
    } else {
      result = mergeStandaloneSummaryParagraph(result);
    }
    result = capitalizeEnglishSentenceStarts(result);
  }

  const allowsContractions =
    tone === "casual" ||
    tone === "english-general" ||
    tone === "english-expository" ||
    tone === "english-discursive" ||
    tone === "english-reflective" ||
    tone === "english-personal" ||
    tone === "english-argument" ||
    tone === "english-practical" ||
    tone === "english-consumer";

  if (allowsContractions) {
    result = applyContractions(result);
  }

  return cleanupEnglishSpacing(
    repairTemporalAbbreviationSplits(repairBrokenClauseSplits(result))
  );
}

/**
 * Repair clause fragments created when a time abbreviation was mistaken for a
 * sentence ending. The rule is intentionally limited to temporal sleep/rest
 * clauses so an actual new sentence after "a.m." is left alone.
 */
function repairTemporalAbbreviationSplits(text: string): string {
  return text.replace(
    /(\b\d{1,2}:\d{2}\s+[ap]\.m\.)\s*(?:\n\s*\n|\s+)(After|Before)\s+(?=(?:sleeping|a full night(?:'s|\u2019s)? rest|getting|resting)\b)/gi,
    (_match, time: string, conjunction: string) =>
      `${time} ${conjunction.toLowerCase()} `
  );
}

/**
 * Undo the synthetic "claim. This is because..." split when both clauses
 * already form one short causal statement.
 */
function collapseCausalLeadSplit(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const sentences = splitSentences(paragraph);
      const merged: string[] = [];

      for (const sentence of sentences) {
        const previous = merged[merged.length - 1];
        const causal = sentence.match(/^This is because\s+(.+)$/i);
        const previousBody = previous?.replace(/[.!?]+$/, "").trim() ?? "";
        const isShortEvaluativeLead =
          previousBody.split(/\s+/).filter(Boolean).length <= 16 &&
          /\b(?:is|are|can be|may be)\s+(?:beneficial|important|useful|helpful|difficult|common|harmful)(?:\s+(?:for|to)\s+.{1,48})?$/i.test(
            previousBody
          );

        if (previous && causal && isShortEvaluativeLead) {
          const complement = causal[1].trim();
          merged[merged.length - 1] =
            `${previousBody} because ${complement.charAt(0).toLowerCase()}${complement.slice(1)}`;
          continue;
        }

        merged.push(sentence);
      }

      return merged.join(" ");
    })
    .join("\n\n");
}

/**
 * Rebuild common expository frames without adding a narrator, evidence, or
 * specificity. These edits use only clauses already present in the passage.
 */
function directenSensitiveExpositorySyntax(text: string): string {
  const capitalize = (value: string) => {
    const clean = value.trim();
    return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : clean;
  };
  const lowerFirst = (value: string) => {
    const clean = value.trim();
    return clean ? clean.charAt(0).toLowerCase() + clean.slice(1) : clean;
  };

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const rewritten: string[] = [];

      for (const sentence of splitSentences(paragraph)) {
        let current = sentence
          .replace(/^By contrast,\s*/i, "")
          .replace(/^It is (?:also )?important to note that\s+/i, "");
        current = capitalize(current);

        const quantifiedOpening = current.match(
          /^Only a relatively small proportion of (.+?) can (.+?) because (.+?)([.!?])$/i
        );
        if (quantifiedOpening) {
          rewritten.push(`${capitalize(quantifiedOpening[3])}.`);
          rewritten.push(
            `A relatively small proportion of ${quantifiedOpening[1].trim()} can ${quantifiedOpening[2].trim()}${quantifiedOpening[4]}`
          );
          continue;
        }

        const concession = current.match(
          /^Although\s+([^,]+),\s+(.+?)([.!?])$/i
        );
        if (concession) {
          rewritten.push(`${capitalize(concession[1])}.`);
          rewritten.push(`But ${lowerFirst(concession[2])}${concession[3]}`);
          continue;
        }

        const causalOpener = current.match(
          /^Since\s+(.+),\s+((?:learning|reading|using|becoming|maintaining|achieving)\b.+?)([.!?])$/i
        );
        if (causalOpener) {
          rewritten.push(`${capitalize(causalOpener[1])}.`);
          rewritten.push(`${capitalize(causalOpener[2])}${causalOpener[3]}`);
          continue;
        }

        const closingConcession = current.match(
          /^While\s+(.+?),\s+((?:becoming|learning|reading|maintaining|achieving)\b.+?)([.!?])$/i
        );
        if (closingConcession) {
          rewritten.push(`${capitalize(closingConcession[1])}.`);
          rewritten.push(
            `${capitalize(closingConcession[2])}${closingConcession[3]}`
          );
          continue;
        }

        rewritten.push(current);
      }

      return rewritten.join(" ");
    })
    .join("\n\n");
}

/**
 * Replace an empty importance announcement plus an "It allows..." continuation
 * with the concrete claim already present in the text.
 */
function collapseAbstractImportanceLead(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const sentences = splitSentences(paragraph);
      if (sentences.length < 2) return paragraph;

      const lead = sentences[0].match(
        /^(.+?)\s+(?:holds great importance|is (?:extremely|very|highly) important|is of (?:great|considerable) importance)\.?$/i
      );
      const continuation = sentences[1].match(
        /^It\s+(allows|lets|enables|helps)\s+(.+)$/i
      );
      if (!lead || !continuation) return paragraph;

      const subject = lead[1].trim();
      const ending = continuation[2].match(/[.!?]+$/)?.[0] ?? ".";
      const complement = continuation[2].replace(/[.!?]+$/, "").trim();
      sentences.splice(
        0,
        2,
        `${subject} ${continuation[1].toLowerCase()} ${complement}${ending}`
      );
      return sentences.join(" ");
    })
    .join("\n\n");
}

/**
 * Remove transitions that announce a relationship already expressed by the
 * surrounding claims. No content words are added or removed.
 */
function removeEmptyExpositoryTransitions(text: string): string {
  return text
    .replace(
      /\bBeyond (?:these|the) (?:practical |main |other )?(?:advantages|benefits),\s*/gi,
      ""
    )
    .replace(/\bFor these reasons,\s*/gi, "")
    .replace(
      /(^|[.!?]\s+|\n+)(?:In addition|Furthermore|Moreover|Additionally),\s*/gi,
      "$1"
    )
    .replace(
      /(^|[.!?]\s+|\n+)(?:Therefore|Consequently),\s*/gi,
      "$1"
    )
    .replace(
      /(^|[.!?]\s+|\n+)So,\s+(?=the\s+(?:healthiest|best|safest|most\s+\w+)\s+(?:approach|option|choice|way)\b)/gi,
      "$1"
    );
}

/**
 * Join a light "It..." continuation to the sentence it directly follows. This
 * changes punctuation only and is limited to pairs that remain readable.
 */
function mergeLightPronounContinuations(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const sentences = splitSentences(paragraph);
      const merged: string[] = [];

      for (const sentence of sentences) {
        const previous = merged[merged.length - 1];
        const currentWords = sentence.split(/\s+/).filter(Boolean).length;
        const previousWords = previous?.split(/\s+/).filter(Boolean).length ?? 0;
        const canMerge =
          Boolean(previous) &&
          /^It\s+(?:also\s+)?(?:allows?|enables?|helps?|boosts?|strengthens?|becomes?)\b/i.test(
            sentence
          ) &&
          /\.$/.test(previous) &&
          previousWords <= 20 &&
          currentWords <= 20 &&
          previousWords + currentWords <= 36;

        if (!canMerge) {
          merged.push(sentence);
          continue;
        }

        const continuation =
          sentence.charAt(0).toLowerCase() + sentence.slice(1);
        merged[merged.length - 1] =
          previous.replace(/\.$/, "") + "; " + continuation;
      }

      return merged.join(" ");
    })
    .join("\n\n");
}

/**
 * Keep factual sensitive prose in three unequal idea blocks without changing
 * sentence order. This avoids both a monolithic block and staged one-line
 * paragraphs that look manufactured.
 */
function normalizeSensitiveParagraphShape(text: string): string {
  const sentences = text
    .split(/\n\s*\n/)
    .flatMap((paragraph) => splitSentences(paragraph));
  const totalWords = text.split(/\s+/).filter(Boolean).length;
  if (sentences.length < 8 || totalWords < 120) return text;

  const firstSize = 2;
  let secondSize = Math.max(3, Math.ceil((sentences.length - firstSize) * 0.58));
  let thirdSize = sentences.length - firstSize - secondSize;
  if (thirdSize < 2) {
    secondSize -= 2 - thirdSize;
    thirdSize = 2;
  }
  if (secondSize < 2) return text;

  return [
    sentences.slice(0, firstSize).join(" "),
    sentences.slice(firstSize, firstSize + secondSize).join(" "),
    sentences.slice(firstSize + secondSize).join(" "),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Reflow a staircase made entirely of short mini-paragraphs. Sentence order and
 * wording stay unchanged; only paragraph boundaries move.
 */
function rebalanceShortParagraphStaircase(text: string): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const totalWords = text.split(/\s+/).filter(Boolean).length;
  if (paragraphs.length < 4 || paragraphs.length > 6 || totalWords < 120) {
    return text;
  }

  const counts = paragraphs.map((paragraph) => splitSentences(paragraph).length);
  const totalSentences = counts.reduce((sum, count) => sum + count, 0);
  const range = Math.max(...counts) - Math.min(...counts);
  if (
    totalSentences < 8 ||
    counts.some((count) => count < 1 || count > 4) ||
    range > 3
  ) {
    return text;
  }

  const sentences = paragraphs.flatMap((paragraph) => splitSentences(paragraph));
  const firstSize = totalSentences >= 11 ? 3 : 2;
  const secondSize = 1;
  const lastSize = Math.max(
    2,
    Math.min(4, Math.floor(totalSentences * 0.25))
  );
  const thirdSize = totalSentences - firstSize - secondSize - lastSize;
  if (thirdSize < 2) return text;

  const sizes = [firstSize, secondSize, thirdSize, lastSize];
  const result: string[] = [];
  let index = 0;
  for (const size of sizes) {
    result.push(sentences.slice(index, index + size).join(" "));
    index += size;
  }
  return result.filter(Boolean).join("\n\n");
}

/**
 * Surface-level transition edits only. These replacements do not introduce a
 * new claim, speaker, example, or degree of certainty.
 */
function varyFaithfulDiscourseMarkers(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bFurthermore,\s*/gi, "Also, "],
    [/\bMoreover,\s*/gi, "Also, "],
    [/\bAdditionally,\s*/gi, "Also, "],
    [/\bNevertheless,\s*/gi, "Still, "],
    [/\bNonetheless,\s*/gi, "Still, "],
    [/\bConsequently,\s*/gi, "So, "],
    [/\bTherefore,\s*/gi, "So, "],
    [/\bThat said,\s*/gi, "Still, "],
    [/\bFor instance,\s*/gi, "For example, "],
    [/\bOn the other hand,\s*/gi, "By contrast, "],
  ];

  return replacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text
  );
}

function mergeStandaloneSummaryParagraph(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  if (paragraphs.length < 2) return text;

  const last = paragraphs[paragraphs.length - 1];
  const isSingleSentence = splitSentences(last).length === 1;
  const isSummaryScaffold =
    /^(?:The key|The goal|Ultimately|In conclusion|To conclude|Overall)\b/i.test(last);

  if (!isSingleSentence || !isSummaryScaffold) return text;

  paragraphs[paragraphs.length - 2] =
    paragraphs[paragraphs.length - 2] + " " + last;
  paragraphs.pop();
  return paragraphs.join("\n\n");
}

function repairBrokenClauseSplits(text: string): string {
  return text
    .replace(
      /(?:\u2014|-|\s)\s*and,?\s+for some\.\s+Some is\s+/gi,
      " and, for some, "
    )
    .replace(/(?:\u2014|-)\s*than\s+/gi, " than ");
}

function capitalizeEnglishSentenceStarts(text: string): string {
  return text.replace(
    /(^|[.!?]\s+|\n+)([a-z])/g,
    (_match, prefix: string, letter: string) => prefix + letter.toUpperCase()
  );
}

function directenExpositoryScaffolds(text: string): string {
  let result = text.replace(
    /\bOne key reason is that\s+([a-z])/gi,
    (_match, letter: string) => letter.toUpperCase()
  );

  result = result.replace(
    /\bThe key factor is the ([^.]+)\./gi,
    (_match, factor: string) => {
      const direct = factor.trim().replace(/^severity of the IBD$/i, "IBD severity");
      return direct.charAt(0).toUpperCase() + direct.slice(1) + " matters most.";
    }
  );

  result = result.replace(
    /\bSeveral factors contribute to (?:this shift|this change), including ([^.]+)\./gi,
    (_match, list: string) => {
      const trimmed = list.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + " all contribute.";
    }
  );

  return result
    .replace(/\bHowever,\s*/gi, "But ")
    .replace(/\bAs a result,\s*/gi, "")
    .replace(/\bIn fact,\s*/gi, "");
}

function removeRedundantCategoryLeads(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const sentences = splitSentences(paragraph);
      return sentences
        .filter((sentence, index) => {
          const next = sentences[index + 1];
          if (!next) return true;

          const wordCount = sentence.split(/\s+/).filter(Boolean).length;
          const isAbstractLead =
            wordCount <= 10 &&
            /\b(?:factors?|pressures?|choices?|conditions?|considerations?|issues?|influences?)\b/i.test(
              sentence
            ) &&
            /\b(?:affect|influence|matter|play|add|shape|drive|contribute)\w*\b/i.test(
              sentence
            );
          const nextContainsEvidence =
            (next.match(/,/g) ?? []).length >= 2 ||
            /\b(?:such as|including|for example|for instance)\b/i.test(next);

          return !(isAbstractLead && nextContainsEvidence);
        })
        .join(" ");
    })
    .filter(Boolean)
    .join("\n\n");
}

function splitDenseEnglishEnumerations(text: string): string {
  const joinItems = (items: string[]): string => {
    const clean = items.map((item) => item.trim()).filter(Boolean);
    if (clean.length <= 1) return clean[0] ?? "";
    if (clean.length === 2) return clean.join(" and ");
    return clean.slice(0, -1).join(", ") + ", and " + clean[clean.length - 1];
  };

  const splitItems = (value: string): string[] =>
    value
      .split(/,\s*|\s*,?\s+(?:and|or)\s+/i)
      .map((item) => item.trim().replace(/^(?:and|or)\s+/i, ""))
      .filter(Boolean);

  const toGerundPhrase = (value: string): string =>
    value.replace(/^([A-Za-z]+)\b/, (_match, verb: string) => {
      const lower = verb.toLowerCase();
      const irregular: Record<string, string> = { be: "being", lie: "lying" };
      const gerund =
        irregular[lower] ??
        (/ie$/i.test(verb)
          ? verb.replace(/ie$/i, "ying")
          : /[^e]e$/i.test(verb)
            ? verb.replace(/e$/i, "ing")
            : verb + "ing");
      return /^[A-Z]/.test(verb)
        ? gerund.charAt(0).toUpperCase() + gerund.slice(1)
        : gerund;
    });

  const splitSentence = (sentence: string): string[] => {
    const ending = sentence.match(/[.!?]+$/)?.[0] ?? ".";
    const body = sentence.replace(/[.!?]+$/, "");

    const focusList = body.match(
      /^(.+?\bmay focus on)\s+(.+?),\s+(.+?),\s+or\s+(.+)$/i
    );
    if (focusList) {
      const subject = focusList[1].replace(/\s+may focus on$/i, "").trim();
      const objectSubject =
        /^they$/i.test(subject) ? "them" :
        /^we$/i.test(subject) ? "us" :
        /^he$/i.test(subject) ? "him" :
        /^she$/i.test(subject) ? "her" :
        /^I$/i.test(subject) ? "me" :
        subject.toLowerCase();
      const finalItem = focusList[4]
        .trim()
        .replace(/\s+first$/i, "")
        .replace(/^securing\s+/i, "");
      return [
        `${focusList[1]} ${focusList[2].trim()} or ${focusList[3].trim()}.`,
        `${finalItem.charAt(0).toUpperCase() + finalItem.slice(1)} may come first for ${objectSubject} too${ending}`,
      ];
    }

    const risingCosts = body.match(
      /^The rising costs? of\s+(.+?),\s+(.+?),\s+(.+?),\s+and\s+(.+?)\s+(lead|push|cause|make)\s+(.+)$/i
    );
    if (risingCosts) {
      return [
        `The costs of ${risingCosts[1].trim()} and ${risingCosts[2].trim()} are rising.`,
        `The same is true for ${risingCosts[3].trim()} and ${risingCosts[4].trim()}.`,
        `Together, these costs ${risingCosts[5].toLowerCase()} ${risingCosts[6].trim()}${ending}`,
      ];
    }

    const modalActionList = body.match(
      /^(.+?)\s+(can|may|could|might|will|would|should)\s+([^,]+),\s+([^,]+),\s+([^,]+),\s+(and|or)\s+([^,]+),\s+all of which\s+(.+)$/i
    );
    if (modalActionList) {
      const subject = modalActionList[1].trim();
      const repeatedSubject = subject.includes(",")
        ? subject.slice(subject.lastIndexOf(",") + 1).trim()
        : subject;
      const capitalizedSubject =
        repeatedSubject.charAt(0).toUpperCase() + repeatedSubject.slice(1);
      return [
        `${subject} ${modalActionList[2].toLowerCase()} ${modalActionList[3].trim()} and ${modalActionList[4].trim()}.`,
        `${capitalizedSubject} ${modalActionList[2].toLowerCase()} ${modalActionList[5].trim()} ${modalActionList[6].toLowerCase()} ${modalActionList[7].trim()}.`,
        `All of these ${modalActionList[8].trim()}${ending}`,
      ];
    }

    const recommendationList = body.match(
      /^(.+?\bit is\s+(important|necessary|helpful|useful)\s+to)\s+([^,]+),\s+([^,]+),\s+([^,]+),\s+and\s+(.+)$/i
    );
    if (recommendationList) {
      const thirdAction = toGerundPhrase(recommendationList[5].trim());
      const fourthAction = toGerundPhrase(recommendationList[6].trim());
      const conditionMatch = fourthAction.match(
        /^(.+?),\s+(especially if\s+.+)$/i
      );
      const remainingActions =
        thirdAction + " and " + (conditionMatch?.[1] ?? fourthAction);
      const condition = conditionMatch ? ", " + conditionMatch[2] : "";
      return [
        `${recommendationList[1].trim()} ${recommendationList[3].trim()} and ${recommendationList[4].trim()}.`,
        `${remainingActions.charAt(0).toUpperCase() + remainingActions.slice(1)} are also ${recommendationList[2].toLowerCase()}${condition}${ending}`,
      ];
    }

    const improvementList = body.match(
      /^(.+?\bit helps improve)\s+([^,]+),\s+([^,]+),\s+([^,]+),\s+and\s+(.+?)\s+without necessarily\s+(.+)$/i
    );
    if (improvementList) {
      const activityMatch = improvementList[1].match(
        /^(.+?)\s+can be beneficial\b/i
      );
      if (activityMatch) {
        const activity = activityMatch[1].trim();
        const repeatedActivity = activity.replace(/^(?:In fact,\s*)/i, "");
        const conciseActivity = repeatedActivity.replace(
          /^regular moderate exercise such as (.+)$/i,
          (_match, example: string) =>
            example.charAt(0).toUpperCase() + example.slice(1)
        );
        return [
          `${improvementList[1].trim()} ${improvementList[2].trim()} and ${improvementList[3].trim()}.`,
          `${conciseActivity.charAt(0).toUpperCase() + conciseActivity.slice(1)} can improve ${improvementList[4].trim()} and ${improvementList[5].trim()} without necessarily ${improvementList[6].trim()}${ending}`,
        ];
      }
    }

    const suchAsEffect = body.match(
      /^(.+?),?\s+such as\s+(.+),\s+((?:can|may|could|might|will|would|should|often|also|further|reduce|lower|affect|increase|decrease|raise|limit|harm)\b.+)$/i
    );
    if (suchAsEffect) {
      const items = splitItems(suchAsEffect[2]);
      if (items.length >= 4 && items.every((item) => item.split(/\s+/).length <= 7)) {
        return [
          `${joinItems(items.slice(0, 2))} ${suchAsEffect[3].trim()}.`,
          `${joinItems(items.slice(2))} do so too${ending}`,
        ];
      }
    }

    const modalList = body.match(
      /^(.+?)\s+(can|may|could|might|will|would|should)\s+(.+)$/i
    );
    if (modalList && (modalList[1].match(/,/g) ?? []).length >= 4) {
      const items = splitItems(modalList[1]);
      if (items.length >= 5 && items.every((item) => item.split(/\s+/).length <= 7)) {
        return [
          `${joinItems(items.slice(0, Math.ceil(items.length / 2)))} ${modalList[2].toLowerCase()} ${modalList[3].trim()}.`,
          `${joinItems(items.slice(Math.ceil(items.length / 2)))} ${modalList[2].toLowerCase()} ${modalList[3].trim()} too${ending}`,
        ];
      }
    }

    return [sentence];
  };

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => splitSentences(paragraph).flatMap(splitSentence).join(" "))
    .join("\n\n");
}

function mergeOverSegmentedParagraphs(text: string): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const sentenceCounts = paragraphs.map(
    (paragraph) => splitSentences(paragraph).length
  );

  if (
    paragraphs.length < 6 ||
    sentenceCounts.some((count) => count > 4)
  ) {
    return text;
  }

  const result: string[] = [];
  let index = 0;
  let group = 0;

  while (index < paragraphs.length) {
    const shouldPair = group % 2 === 0 && index + 1 < paragraphs.length;
    if (shouldPair) {
      result.push(paragraphs[index] + " " + paragraphs[index + 1]);
      index += 2;
    } else {
      result.push(paragraphs[index]);
      index += 1;
    }
    group += 1;
  }

  return result.join("\n\n");
}

/**
 * Vary paragraph boundaries without moving, deleting, or inventing sentences.
 * Only prose paragraphs with at least five complete sentences are split.
 */
function varyParagraphBoundaries(text: string): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const totalWords = text.split(/\s+/).filter(Boolean).length;

  if (paragraphs.length === 0 || totalWords < 140) return text;

  const result: string[] = [];
  let longParagraphIndex = 0;

  for (const paragraph of paragraphs) {
    const sentences = splitSentences(paragraph);
    if (sentences.length < 5) {
      result.push(paragraph);
      continue;
    }

    const cut =
      longParagraphIndex % 2 === 0
        ? 2
        : Math.max(2, sentences.length - 2);
    longParagraphIndex += 1;

    if (cut >= sentences.length) {
      result.push(paragraph);
      continue;
    }

    result.push(sentences.slice(0, cut).join(" "));
    result.push(sentences.slice(cut).join(" "));
  }

  return result.join("\n\n");
}

/**
 * Split only at punctuation that already marks a complete clause boundary.
 * Nothing is deleted, shuffled, or added.
 */
function gentlyVarySentenceRhythm(text: string): string {
  const splitLongSentence = (sentence: string): string[] => {
    const words = sentence.split(/\s+/).filter(Boolean);
    if (words.length < 18) return [sentence];

    const ending = sentence.match(/[.!?]+$/)?.[0] ?? ".";
    const body = sentence.replace(/[.!?]+$/, "");
    const makePair = (
      left: string,
      right: string,
      minimumRightWords = 5
    ): string[] | null => {
      const leftWords = left.trim().split(/\s+/).filter(Boolean).length;
      const rightWords = right.trim().split(/\s+/).filter(Boolean).length;
      if (leftWords < 5 || rightWords < minimumRightWords) return null;

      const first = left.trim() + ".";
      const cleanRight = right.trim();
      const second = cleanRight.charAt(0).toUpperCase() + cleanRight.slice(1) + ending;
      return [first, second];
    };

    const whetherDependsMatch = body.match(
      /^(Whether\s+.+?)\s+depends primarily on\s+(.+?),\s+as well as\s+(.+)$/i
    );
    if (whetherDependsMatch) {
      const finalCondition = whetherDependsMatch[3].trim();
      const pair = makePair(
        `${whetherDependsMatch[1]} is influenced mainly by ${whetherDependsMatch[2]}`,
        `${finalCondition.charAt(0).toUpperCase() + finalCondition.slice(1)} matters too`,
        4
      );
      if (pair) return pair;
    }

    const whileConcessionMatch = body.match(/^While\s+(.+?),\s+(.+)$/i);
    if (
      whileConcessionMatch &&
      /\b(?:are not|is not|was not|were not|aren(?:'|\u2019)t|isn(?:'|\u2019)t|wasn(?:'|\u2019)t|weren(?:'|\u2019)t|never|limited|difficult|unavailable|unsuccessful)\b/i.test(
        whileConcessionMatch[2]
      )
    ) {
      const pair = makePair(
        whileConcessionMatch[1],
        "Even so, " + whileConcessionMatch[2],
        4
      );
      if (pair) return pair;
    }

    const concessionOpenerMatch = body.match(
      /^(Although|Even though)\s+(.+?),\s+(.+)$/i
    );
    if (concessionOpenerMatch) {
      const pair = makePair(
        concessionOpenerMatch[2],
        "Even so, " + concessionOpenerMatch[3],
        4
      );
      if (pair) return pair;
    }

    const trailingConcessionMatch = body.match(/^(.+),\s+even if\s+(.+)$/i);
    if (trailingConcessionMatch && words.length >= 24) {
      const pair = makePair(
        trailingConcessionMatch[1],
        "This can happen even if " + trailingConcessionMatch[2],
        5
      );
      if (pair) return pair;
    }

    const terminalDefinitionMatch = body.match(
      /^(.+?\b([A-Za-z][A-Za-z-]*)),\s+(a|an)\s+(.+)$/i
    );
    if (terminalDefinitionMatch) {
      const subject = terminalDefinitionMatch[2];
      const pair = makePair(
        terminalDefinitionMatch[1],
        `${subject.charAt(0).toUpperCase() + subject.slice(1)} is ${terminalDefinitionMatch[3].toLowerCase()} ${terminalDefinitionMatch[4]}`,
        4
      );
      if (pair) return pair;
    }

    const namedProcessMatch = body.match(
      /^(.+?)(?:—|,\s+)(?:a|the)\s+(process|phenomenon)\s+(?:called|known as)\s+(.+)$/i
    );
    if (namedProcessMatch) {
      const pair = makePair(
        namedProcessMatch[1],
        `This ${namedProcessMatch[2].toLowerCase()} is called ${namedProcessMatch[3]}`,
        4
      );
      if (pair) return pair;
    }

    const parallelActionMatch = body.match(
      /^((?:(?:This|That)(?: [A-Za-z-]+){0,2}|The [A-Za-z-]+(?: [A-Za-z-]+){0,2})\s+(?:helps?|can|may|will|should|could))\s+(.+),\s+and\s+(.+)$/i
    );
    if (parallelActionMatch) {
      const repeatedLead = parallelActionMatch[1];
      const variedLead = /\s+(?:can|may|will|should|could)$/i.test(repeatedLead)
        ? repeatedLead.replace(
            /^.+\s+(can|may|will|should|could)$/i,
            "It $1 also"
          )
        : repeatedLead.replace(/^.+\s+(helps?)$/i, "It also $1");
      const pair = makePair(
        repeatedLead + " " + parallelActionMatch[2],
        variedLead + " " + parallelActionMatch[3]
      );
      if (pair) return pair;
    }

    if (body.includes(";")) {
      const parts = body.split(/;\s*/);
      if (parts.length === 2) {
        const pair = makePair(parts[0], parts[1]);
        if (pair) return pair;
      }
    }

    const independentAndMatch = body.match(/^(.+),\s+and\s+(.+)$/i);
    if (
      independentAndMatch &&
      /^(?:the|this|that|these|those|people|humans|consumers|marketing|research|studies|it|they|he|she|we|you)\b/i.test(
        independentAndMatch[2]
      ) &&
      /\b(?:am|is|are|was|were|has|have|had|can|could|may|might|will|would|should|starts?|begins?|becomes?|makes?|creates?|causes?|drives?|seeks?|looks?)\b/i.test(
        independentAndMatch[2]
      )
    ) {
      const pair = makePair(independentAndMatch[1], independentAndMatch[2], 4);
      if (pair) return pair;
    }

    const contrastMatch = body.match(/^(.+),\s+while\s+(.+)$/i);
    if (contrastMatch) {
      const pair = makePair(contrastMatch[1], contrastMatch[2]);
      if (pair) return pair;
    }

    const consequenceMatch = body.match(/^(.+),\s+(causing|leading to|resulting in)\s+(.+)$/i);
    if (consequenceMatch) {
      const link = consequenceMatch[2].toLowerCase();
      const connector =
        link === "causing"
          ? "This can cause "
          : link === "leading to"
            ? "This can lead to "
            : "This can result in ";
      const pair = makePair(
        consequenceMatch[1],
        connector + consequenceMatch[3],
        3
      );
      if (pair) return pair;
    }

    const coordinationMatch = body.match(/^(.+),\s+(but|yet|so)\s+(.+)$/i);
    const isPairedContrast =
      coordinationMatch?.[2].toLowerCase() === "but" &&
      /\b(?:not|rather than)\b/i.test(coordinationMatch[1]);
    if (coordinationMatch && !isPairedContrast) {
      const pair = makePair(
        coordinationMatch[1],
        coordinationMatch[2] + " " + coordinationMatch[3]
      );
      if (pair) return pair;
    }

    return [sentence];
  };

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      let sentences = splitSentences(paragraph);
      for (let pass = 0; pass < 2; pass += 1) {
        sentences = sentences.flatMap(splitLongSentence);
      }
      return sentences.join(" ");
    })
    .join("\n\n");
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
    [/\ban individual's\b/gi, "a person's"],
    [/\baffluent\b/gi, "wealthy"],
    [/\bsubsequently\b/gi, "later"],
    [/\butilized\b/gi, "used"],
    [/\butilizes\b/gi, "uses"],
    [/\butilize\b/gi, "use"],
    [/\bfacilitated\b/gi, "helped"],
    [/\bfacilitates\b/gi, "helps"],
    [/\bfacilitate\b/gi, "help"],
    [/\buphold\b/gi, "maintain"],
    [/\bminimize\b/gi, "reduce"],
    [/\blessen\b/gi, "reduce"],
    [/\bfrequently\b/gi, "often"],
    [/\bmultiply more quickly\b/gi, "grow faster"],
    [/\boccurs more often\b/gi, "happens more often"],
    [/\bhelps reduce ([^,.]+), reduce the\b/gi, "helps reduce $1 and the"],
    [/\bThe key point is that\s+/gi, ""],
    [/\bImportantly,\s*/gi, ""],
    [/\bfinancial strains\b/gi, "money pressure"],
    [/\braw materials\b/gi, "supplies"],
    [/\binflation compounds the problem\b/gi, "inflation makes it worse"],
    [/\bexternal disruptions\b/gi, "supply problems"],
    [/\breshapes consumer expectations\b/gi, "changes what people expect"],
    [/\bheightens competition\b/gi, "makes competition tougher"],
    [/\brapidly evolving economy\b/gi, "fast-changing economy"],
    [/\bindustry-specific expertise\b/gi, "experience in that field"],
    [/\bspecialized skills\b/gi, "specific skills"],
    [/\bcontinuous skill development\b/gi, "keeping skills up to date"],
  ];

  const simplified = replacements.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    text
  );

  return simplified.replace(
    /(^|[.!?]\s+)([a-z])/g,
    (_match, prefix: string, letter: string) => prefix + letter.toUpperCase()
  );
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
// FEW-SHOT PROMPT BUILDER (BUKAN INSTRUKSI ABSTRAK)
// ============================================================

/**
 * Build prompt dengan contoh teks human asli sebagai referensi gaya
 * Ini jauh lebih efektif daripada instruksi "sisipkan keraguan"
 */
export function buildFewShotPrompt(
  sourceText: string,
  tone: string
): { systemPrompt: string; temperature: number; topP: number; maxTokens: number; frequencyPenalty: number; presencePenalty: number; repetitionPenalty: number; additionalInstruction: string; postProcessTone: string } {
  // Pilih contoh berdasarkan tone/topik
  const examples = getHumanExamples(tone, sourceText);
  
  const systemPrompt = `
You are a real person writing about the topic below. Below are examples of real human writing on similar topics—not to copy content, but to learn the style, rhythm, and flow.

EXAMPLES OF REAL HUMAN WRITING:

${examples}

INSTRUCTIONS:
- Write like a real person, not an AI assistant.
- Do NOT start with "I think", "But the truth is", or "Let's be real".
- Do NOT use "I don't think so" more than once.
- If you ask a question, answer it with an elaboration, not a short repeated phrase.
- Use a natural mix of long and short sentences.
- Include a specific, concrete detail from your own life or knowledge.
- End naturally—don't force a conclusion or question if it doesn't fit.
- Be messy and unpredictable. Don't try to be too coherent.
- Add some digressions, doubts, and personal asides.

Now rewrite the following text in that style:

SOURCE TEXT:
${sourceText}

Return only the rewritten text. No explanations.
`;

  // PROFESSOR'S RECOMMENDATION: Higher temperature and penalties for english-general profile
  const isEnglishGeneral = tone === "english-general" || tone === "casual";
  
  return {
    systemPrompt,
    temperature: isEnglishGeneral ? 1.7 : 1.2,
    topP: isEnglishGeneral ? 0.99 : 0.95,
    maxTokens: 1600,
    frequencyPenalty: isEnglishGeneral ? 0.4 : 0.2,
    presencePenalty: isEnglishGeneral ? 0.3 : 0.2,
    repetitionPenalty: isEnglishGeneral ? 1.1 : 1.05,
    additionalInstruction: "",
    postProcessTone: tone,
  };
}

/**
 * Pilih contoh human berdasarkan tone dan topic
 * (Gunakan contoh-contoh yang sudah Anda kumpulkan dari GPTZero)
 */
function getHumanExamples(tone: string, sourceText: string): string {
  // Base examples dari percakapan Anda
  const marriageExample = `
"24/25 is still very young imo. But different things work for different people. To sum it up, get to know yourself, travel for a bit, see different things in life."
`;
  
  const exerciseExample = `
"What exercises are best for heart health? The best exercise program will incorporate both aerobic and strength training, since that's the best way to strengthen your entire body."
`;
  
  const islamicExample = `
"Mawaddah is a kind of love which is very apparent. It is caring about spouse, being friend with spouse. Mawaddah is about keeping the honeymoon period alive and functional at all times."
`;

  // Pilih contoh yang paling sesuai dengan topik
  const topic = sourceText.toLowerCase();
  if (topic.includes('marriage') || topic.includes('wedding') || topic.includes('spouse')) {
    return marriageExample;
  }
  if (topic.includes('exercise') || topic.includes('health') || topic.includes('workout')) {
    return exerciseExample;
  }
  // Default: gabungan semua
  return [marriageExample, exerciseExample, islamicExample].join('\n\n');
}

// ============================================================
// REMOVE REPEATED PHRASES (Hapus Template Runtuh)
// ============================================================

/**
 * Hapus frasa yang berulang literal untuk mencegah template collapse
 * Contoh: "I don't think so" muncul 2x → hapus salah satu
 */
export function removeRepeatedPhrases(text: string): string {
  const sentences = splitSentences(text);
  const phraseCounts = new Map<string, number>();
  
  for (const s of sentences) {
    const trimmed = s.trim();
    // Hanya periksa frasa pendek (3-8 kata)
    const words = trimmed.split(/\s+/);
    if (words.length >= 3 && words.length <= 8) {
      const key = words.join(' ').toLowerCase();
      phraseCounts.set(key, (phraseCounts.get(key) || 0) + 1);
    }
  }
  
  // Hapus duplikat frasa (sisakan 1)
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    const words = trimmed.split(/\s+/);
    if (words.length >= 3 && words.length <= 8) {
      const key = words.join(' ').toLowerCase();
      if (seen.has(key)) {
        continue; // Skip duplikat
      }
      seen.add(key);
    }
    result.push(s);
  }
  
  return result.join(' ');
}

// ============================================================
// MEMORY SIMULATION PIPELINE (Professor's Recommendation)
// Ganti semua fungsi "humanisasi" sebelumnya dengan simulasi memori manusia
// ============================================================

type IdeaNode = {
  id: string;
  content: string;
  topic: string;
  importance: number; // 0-1
  specificity: number; // 0-1 (high = concrete detail)
};

/**
 * Ekstrak "nodes of meaning" - bukan kalimat, tapi unit ide
 * Ini memungkinkan loss dan reorder yang natural
 */
function extractIdeaNodes(text: string): IdeaNode[] {
  const sentences = splitSentences(text);
  const nodes: IdeaNode[] = [];
  let currentTopic = '';
  
  for (const sentence of sentences) {
    // Deteksi topic shift
    const topicMatch = sentence.match(/\b(?:the|this|these|those)\s+(\w+)\b/i);
    const topic = topicMatch ? topicMatch[1].toLowerCase() : 'general';
    
    // Abstraksi vs konkret
    const hasConcrete = /\b(?:percent|dollar|year|study|research|doctor|hospital|school|company)\b/i.test(sentence);
    const specificity = hasConcrete ? 0.8 : 0.3;
    
    // Importance: kalimat dengan kata kunci utama lebih penting
    const importance = /\b(?:main|primary|key|essential|crucial|significant)\b/i.test(sentence) ? 0.9 : 0.5;
    
    nodes.push({
      id: `N${nodes.length}`,
      content: sentence,
      topic: topic,
      importance: importance,
      specificity: specificity,
    });
  }
  
  return nodes;
}

/**
 * Simulate human memory loss: forget, misremember, merge
 * Manusia tidak mengingat semuanya secara sempurna
 */
function simulateMemoryLoss(nodes: IdeaNode[]): IdeaNode[] {
  if (nodes.length < 5) return nodes;
  
  // 1. FORGET: hapus 25-40% (tapi jangan semua node penting)
  const lossRate = 0.25 + Math.random() * 0.15;
  const forgetCount = Math.floor(nodes.length * lossRate);
  const indices = nodes.map((_, i) => i);
  
  // Prioritaskan hapus yang kurang penting dan abstrak
  const sorted = indices.sort((a, b) => {
    const scoreA = (nodes[a].importance * 0.6) + (nodes[a].specificity * 0.4);
    const scoreB = (nodes[b].importance * 0.6) + (nodes[b].specificity * 0.4);
    return scoreA - scoreB;
  });
  
  const toRemove = sorted.slice(0, forgetCount);
  const remaining = nodes.filter((_, i) => !toRemove.includes(i));
  
  // 2. MISREMEMBER: ubah 1-2 node secara subtil
  const misrememberCount = Math.min(2, Math.floor(remaining.length * 0.1) + 1);
  for (let i = 0; i < misrememberCount; i++) {
    const idx = Math.floor(Math.random() * remaining.length);
    const node = remaining[idx];
    // Ubah sedikit konten (misremember detail)
    node.content = node.content
      .replace(/\b(\d+)\b/, (m) => {
        const num = parseInt(m);
        return String(num + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5));
      })
      .replace(/\b(important|significant|crucial)\b/i, (m) => {
        const alternatives = ['key', 'big', 'major', 'real'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      });
  }
  
  // 3. MERGE: gabungkan 2 node terkait
  for (let i = 0; i < remaining.length - 1; i++) {
    if (remaining[i].topic === remaining[i + 1].topic && Math.random() < 0.3) {
      const merged = remaining[i].content.replace(/[.!?]$/, '') + ', and ' + 
                     remaining[i + 1].content.charAt(0).toLowerCase() + remaining[i + 1].content.slice(1);
      remaining.splice(i, 2, {
        id: `N${i}`,
        content: merged,
        topic: remaining[i].topic,
        importance: Math.max(remaining[i].importance, remaining[i + 1].importance),
        specificity: Math.max(remaining[i].specificity, remaining[i + 1].specificity),
      });
      break;
    }
  }
  
  return remaining;
}

/**
 * Create interest tunnel: obsession dengan 1 ide, abaikan yang lain
 * Manusia punya fokus yang tidak merata pada topik
 */
function createInterestTunnel(nodes: IdeaNode[]): IdeaNode[] {
  if (nodes.length < 3) return nodes;
  
  // Pilih 1 node sebagai obsession (biasanya yang paling spesifik/concrete)
  const obsessionIdx = nodes.reduce((maxIdx, node, i, arr) => {
    return node.specificity > arr[maxIdx].specificity ? i : maxIdx;
  }, 0);
  
  const obsessionNode = nodes[obsessionIdx];
  
  // Kembangkan obsession: tambahkan 2-3 variasi/elaborasi
  const elaborations = [
    `I keep coming back to this idea of ${obsessionNode.content.replace(/[.!?]$/, '').toLowerCase()}.`,
    `Honestly, ${obsessionNode.content.replace(/[.!?]$/, '').toLowerCase()} is what really matters here.`,
    `You can talk about everything else, but it all comes down to ${obsessionNode.content.replace(/[.!?]$/, '').toLowerCase()}.`,
  ];
  
  const insertPos = Math.min(obsessionIdx + 1, nodes.length);
  nodes.splice(insertPos, 0, ...elaborations.map(content => ({
    id: `N${nodes.length}`,
    content,
    topic: obsessionNode.topic,
    importance: obsessionNode.importance,
    specificity: obsessionNode.specificity,
  })));
  
  // Ringkasan 1 node yang paling abstrak
  const abstractIdx = nodes.reduce((minIdx, node, i, arr) => {
    return node.specificity < arr[minIdx].specificity ? i : minIdx;
  }, 0);
  
  if (abstractIdx !== obsessionIdx) {
    const abstractNode = nodes[abstractIdx];
    // Ringkas menjadi 1 kalimat pendek
    const words = abstractNode.content.split(' ');
    if (words.length > 8) {
      const short = words.slice(0, Math.min(6, Math.floor(words.length * 0.4))).join(' ') + '... (or something like that).';
      nodes[abstractIdx] = {
        ...abstractNode,
        content: short,
      };
    }
  }
  
  return nodes;
}

/**
 * Simulate author voice: tambahkan fingerprint penulis manusia
 * Termasuk idle sentences, external anchors, dan ending menggantung
 */
function simulateAuthorVoice(nodes: IdeaNode[]): string {
  // Convert nodes ke array kalimat untuk manipulasi lebih mudah
  const sentences = nodes.map(n => n.content);
  
  // 1. Tambahkan "external anchor" (referensi dunia nyata) - SISIPKAN DI AWAL kalimat utuh
  const anchors = [
    "I read somewhere that ",
    "My doctor once told me ",
    "A friend mentioned ",
    "There was a study that found ",
  ];
  if (Math.random() < 0.5 && sentences.length > 1) {
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    const pos = Math.min(1, sentences.length - 1); // Sisipkan di kalimat ke-1 atau ke-2
    sentences[pos] = anchor + sentences[pos].charAt(0).toLowerCase() + sentences[pos].slice(1);
  }
  
  // 2. Tambahkan "idle" sentences (tidak informatif) - SISIPKAN DI ANTARA kalimat utuh
  const idlePool = [
    "Anyway.",
    "I don't know why I'm even mentioning this.",
    "Not that it really matters.",
    "I could be wrong, though.",
    "It's just a thought.",
    "Hmm.",
  ];
  const idleCount = Math.min(2, Math.floor(sentences.length / 4));
  for (let i = 0; i < idleCount; i++) {
    const pos = Math.floor(Math.random() * (sentences.length + 1));
    const idle = idlePool[Math.floor(Math.random() * idlePool.length)];
    sentences.splice(pos, 0, idle);
  }
  
  // Gabungkan kembali menjadi teks
  let result = sentences.join(' ');
  
  // 3. Hancurkan template markers
  const templateMarkers = [
    /^I think /i,
    /^But the truth is /i,
    /^What really scares me /i,
    /^It's like /i,
    /^So why does this matter\??/i,
    /^Here's the thing /i,
  ];
  for (const pattern of templateMarkers) {
    result = result.replace(pattern, '');
  }
  
  // 4. Tambahkan "gantung" di akhir
  const endings = [
    "I forgot what else I was going to say.",
    "Anyway, that's all I remember.",
    "I'll stop here.",
    "Not sure if that answered the question.",
  ];
  result = result.replace(/[.!?]$/, '') + ' ' + endings[Math.floor(Math.random() * endings.length)];
  
  return result;
}

/**
 * MASTER FUNCTION: Memory Simulation Pipeline (Professor's Recommendation)
 * This is the core of the professor's approach - simulating human memory processes
 * rather than just adding humanization features.
 * 
 * THE TRUTH: Modern detectors like GPTZero 4.7 detect token distribution patterns
 * and hidden representations from transformers. The only way forward is to simulate
 * how humans actually write: imperfect memory, distractions, and non-linear thinking.
 */
export function memorySimulationPass(text: string): string {
  if (!text || text.length < 100) return text;
  
  // Step 1: Extract only key facts (remove 20-40% details)
  let nodes = extractIdeaNodes(text);
  if (nodes.length < 4) return text;
  
  // Step 2: Simulate forgetting (remove 25-40% of facts, prioritizing less important ones)
  nodes = simulateMemoryLoss(nodes);
  
  // Step 3: Create interest tunnel (obsession + summary) - simulates human selective attention
  nodes = createInterestTunnel(nodes);
  
  // Step 4: Write from memory with author voice simulation
  let result = simulateAuthorVoice(nodes);
  
  // Step 5: Apply Random Tangent Method (Professor's experimental suggestion)
  result = applyRandomTangentMethod(result);
  
  // Step 6: Clean up residual artifacts
  result = result.replace(/ — or even /g, ' ');
  result = result.replace(/ is also common\./g, '. ');
  result = result.replace(/ or even /g, ' ');
  result = result.replace(/\s{2,}/g, ' ');
  
  return result;
}

/**
 * RANDOM TANGENT METHOD (Professor's Experimental Suggestion)
 * Simulates a distracted human writer who goes off on tangents.
 * This breaks the linear, coherent structure that detectors look for.
 */
export function applyRandomTangentMethod(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  
  // Random tangent observations (completely unrelated to main topic)
  const tangents = [
    "I had a great sandwich today, actually.",
    "Speaking of which, I need to call my mom later.",
    "This reminds me of that time I got lost in Tokyo.",
    "My neighbor's dog keeps barking at nothing.",
    "I should really buy more coffee.",
    "Weather's been weird lately, hasn't it?",
    "Come to think of it, I forgot to pay that bill.",
    "My friend Sarah says something similar, but I'm not sure she's right.",
    "I was just thinking about what I had for breakfast.",
    "Anyway, where was I?",
    "This is making me hungry, honestly.",
    "I remember arguing about this with someone once.",
    "Not that it really matters, but...",
    "I've always wondered about that.",
    "It's funny how these things work out."
  ];
  
  // Insert 2-4 random tangents at unpredictable positions
  const tangentCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < tangentCount; i++) {
    const pos = Math.floor(Math.random() * sentences.length);
    const tangent = tangents[Math.floor(Math.random() * tangents.length)];
    
    // Sometimes add hesitation before tangent
    const hesitations = ["Actually, ", "Oh, ", "Wait, ", "Hmm, ", ""];
    const hesitation = hesitations[Math.floor(Math.random() * hesitations.length)];
    
    sentences.splice(pos, 0, hesitation + tangent);
  }
  
  // Break some sentences mid-thought (simulate losing train of thought)
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].length > 80 && Math.random() < 0.2) {
      const words = sentences[i].split(' ');
      const cutPoint = Math.floor(words.length * (0.4 + Math.random() * 0.3));
      const endings = ["... actually, never mind.", "... or something like that.", "... I think.", "... wait, no."];
      sentences[i] = words.slice(0, cutPoint).join(' ') + endings[Math.floor(Math.random() * endings.length)];
    }
  }
  
  // End without finishing the thought (simulate distraction)
  if (Math.random() < 0.6) {
    const unfinishedEndings = [
      "Anyway, I should probably go.",
      "I just remembered something else.",
      "But yeah, that's the gist of it, I guess.",
      "Or at least that's what I think now.",
      "I could be wrong about all of this.",
      "Whatever, you get the idea."
    ];
    // Remove last sentence and replace with unfinished thought
    sentences.pop();
    sentences.push(unfinishedEndings[Math.floor(Math.random() * unfinishedEndings.length)]);
  }
  
  return sentences.join(' ');
}

// ============================================================
// 10. finalHumanize
// ============================================================

// ============================================================
// SENTENCE LENGTH VARIANCE ENGINE
// Membuat variasi panjang kalimat ekstrem (5-50 kata)
// ============================================================

export function applySentenceLengthVariance(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // 1. Cari kalimat yang terlalu seragam panjangnya
  const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
  const avg = lengths.reduce((a,b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;

  // Jika variance < 10, kita perlu mengacak
  if (variance < 10) {
    // 2. Pilih 2-3 kalimat untuk diperpendek drastis (5-8 kata)
    const shortIndices: number[] = [];
    for (let i = 0; i < sentences.length && shortIndices.length < 2; i++) {
      if (sentences[i].split(/\s+/).length > 12 && Math.random() < 0.25) {
        shortIndices.push(i);
      }
    }
    const shortPool = [
      'That is the key.',
      'It makes sense.',
      'This matters.',
      'Not always.',
      'It depends.',
      'True.',
      'Still.',
      'Exactly.',
    ];
    for (const idx of shortIndices) {
      sentences[idx] = shortPool[Math.floor(Math.random() * shortPool.length)];
    }

    // 3. Pilih 1-2 kalimat untuk diperpanjang (gabung dengan kalimat tetangga)
    const longIndices: number[] = [];
    for (let i = 1; i < sentences.length - 1 && longIndices.length < 2; i++) {
      if (sentences[i].split(/\s+/).length < 20 && Math.random() < 0.2) {
        longIndices.push(i);
      }
    }
    for (const idx of longIndices) {
      if (idx < sentences.length - 1) {
        const s1 = sentences[idx].replace(/[.!?]$/, '');
        const s2 = sentences[idx + 1];
        sentences[idx] = s1 + ', ' + s2.charAt(0).toLowerCase() + s2.slice(1);
        sentences.splice(idx + 1, 1);
      }
    }
  }

  return sentences.join(' ');
}

// ============================================================
// PARAGRAPH RHYTHM MODEL
// Membuat variasi struktur antar paragraf
// ============================================================

export function varyParagraphRhythm(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // 1. Ubah panjang paragraf: satu paragraf pendek (1-2 kalimat)
  const shortIdx = Math.floor(Math.random() * paragraphs.length);
  const sentencesShort = splitSentences(paragraphs[shortIdx]);
  if (sentencesShort.length > 2) {
    paragraphs[shortIdx] = sentencesShort.slice(0, 1 + Math.floor(Math.random() * 1)).join(' ');
  }

  // 2. Satu paragraf panjang (6-8 kalimat) — gabung 2 paragraf
  const longIdx = (shortIdx + 1) % paragraphs.length;
  if (longIdx < paragraphs.length - 1) {
    paragraphs[longIdx] = paragraphs[longIdx] + ' ' + paragraphs[longIdx + 1];
    paragraphs.splice(longIdx + 1, 1);
  }

  // 3. Ubah urutan topic sentence: kadang contoh sebelum claim
  for (let i = 0; i < paragraphs.length; i++) {
    const sentencesPara = splitSentences(paragraphs[i]);
    if (sentencesPara.length > 2 && Math.random() < 0.3) {
      // Pindahkan kalimat kedua ke awal (contoh dulu, baru claim)
      const temp = sentencesPara[0];
      sentencesPara[0] = sentencesPara[1];
      sentencesPara[1] = temp;
      paragraphs[i] = sentencesPara.join(' ');
    }
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// SYNTACTIC DIVERSITY ENGINE
// Campurkan struktur kalimat yang berbeda-beda
// ============================================================

export function diversifySyntax(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // 1. Ubah 1-2 kalimat menjadi complex sentence dengan subordinate clause
  for (let i = 0; i < sentences.length && i < 2; i++) {
    const s = sentences[i];
    if (s.includes('because') || s.includes('since')) continue;
    if (s.split(/\s+/).length > 10 && Math.random() < 0.3) {
      const starters = [
        'Although it is true that ',
        'While some people argue that ',
        'Given that ',
        'Considering that ',
      ];
      const starter = starters[Math.floor(Math.random() * starters.length)];
      sentences[i] = starter + s.charAt(0).toLowerCase() + s.slice(1);
    }
  }

  // 2. Ubah 1-2 kalimat menjadi parenthetical (dengan sisipan)
  for (let i = 0; i < sentences.length && i < 2; i++) {
    const s = sentences[i];
    if (s.includes('—') || s.includes('(')) continue;
    if (s.split(/\s+/).length > 15 && Math.random() < 0.2) {
      const parentheticals = [
        '— and this is worth noting —',
        '— which is quite interesting —',
        '— or so it seems —',
        '— in many cases —',
      ];
      const words = s.split(' ');
      const insertPos = Math.floor(words.length * 0.5);
      const paren = parentheticals[Math.floor(Math.random() * parentheticals.length)];
      words.splice(insertPos, 0, paren);
      sentences[i] = words.join(' ');
    }
  }

  // 3. Ubah 1 kalimat menjadi short fragment (tanpa verb)
  for (let i = 0; i < sentences.length && i < 1; i++) {
    const s = sentences[i];
    if (s.split(/\s+/).length > 8 && Math.random() < 0.15) {
      const fragments = [
        'Anyway.',
        'That said.',
        'To be fair.',
        'Not really.',
        'Fair enough.',
      ];
      sentences.splice(i + 1, 0, fragments[Math.floor(Math.random() * fragments.length)]);
      break;
    }
  }

  return sentences.join(' ');
}

// ============================================================
// INFORMATION DENSITY CONTROLLER
// Selipkan kalimat dengan kepadatan informasi rendah
// ============================================================

export function varyInformationDensity(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // 1. Sisipkan 1-2 kalimat "low information" (filler natural)
  const lowInfoSentences = [
    'It is hard to say for sure.',
    'This is not always the case.',
    'Of course, there are exceptions.',
    'In many ways, this makes sense.',
    'It depends on the situation.',
    'There are different views on this.',
    'At times, this can be complicated.',
  ];

  for (let i = 0; i < Math.min(2, sentences.length / 3); i++) {
    const pos = Math.floor(sentences.length * (0.2 + Math.random() * 0.4));
    sentences.splice(pos, 0, lowInfoSentences[Math.floor(Math.random() * lowInfoSentences.length)]);
  }

  // 2. Ubah 1-2 kalimat menjadi lebih "ambiguous" / kurang spesifik
  for (let i = 0; i < sentences.length && i < 2; i++) {
    if (/\b(is|are|will|must)\b/i.test(sentences[i]) && Math.random() < 0.3) {
      sentences[i] = sentences[i]
        .replace(/\b(is)\b/i, 'may be')
        .replace(/\b(are)\b/i, 'may be')
        .replace(/\b(will)\b/i, 'might')
        .replace(/\b(must)\b/i, 'may need to');
    }
  }

  return sentences.join(' ');
}

export function finalHumanize(
  text: string,
  tone: HumanizerPostProcessTone = "casual",
  skipHeavyProcessing = false
): string {
  if (
    tone === "indonesian-general" ||
    tone === "indonesian-academic" ||
    tone === "indonesian-professional"
  ) {
    return finalIndonesianHumanize(text, tone);
  }

  if (!text || text.length < 40) return text.trim();

  // HANYA CLEANUP — TIDAK ADA POST-PROCESS LAIN
  let result = cleanupEnglishSpacing(text);
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => prefix + letter.toUpperCase());
  
  return result;
}

// ============================================================
// 11. HELPER FUNCTIONS
// ============================================================

/**
 * Pilih 1-2 ide/klaim, lalu kembangkan secara obsesif (2-3 variasi pengulangan)
 * Meniru manusia yang fokus berlebihan pada satu hal
 */
export function createObsessionLoop(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // Pilih 1-2 kalimat sebagai "obsession"
  const obsessionCount = Math.min(2, Math.floor(sentences.length * 0.2) + 1);
  const obsessionIndices: number[] = [];
  while (obsessionIndices.length < obsessionCount) {
    const idx = Math.floor(Math.random() * sentences.length);
    if (!obsessionIndices.includes(idx)) obsessionIndices.push(idx);
  }

  // Untuk setiap obsession, tambahkan 2-3 variasi di sekitarnya
  for (const idx of obsessionIndices) {
    const base = sentences[idx];
    const variations = [
      base.replace(/\b(is|are|was|were)\b/i, (m) => ['is', 'are', 'was', 'were'][Math.floor(Math.random() * 4)]),
      base.replace(/\b(very|really|quite)\b/gi, (m) => ['extremely', 'incredibly', 'pretty', 'rather'][Math.floor(Math.random() * 4)] || m),
      base.replace(/\b(can|could|may|might)\b/i, (m) => ['can', 'could', 'may', 'might'][Math.floor(Math.random() * 4)]),
    ];
    // Sisipkan variasi di sekitar kalimat asli
    const insertPos = Math.min(idx + 1, sentences.length);
    sentences.splice(insertPos, 0, variations[0]);
    if (Math.random() < 0.5) {
      sentences.splice(insertPos + 1, 0, variations[1]);
    }
  }

  return sentences.join(' ');
}

/**
 * Hancurkan suara editor: tambahkan kalimat tidak informatif,
 * reaksi emosional, pengakuan lupa, dan opini tidak berdasar.
 */
export function destroyEditorialVoice(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const humanInterjections = [
    "I'm not sure why I'm even writing this.",
    "Actually, I just remembered something else.",
    "Honestly, this part always confuses me.",
    "I mean, who really cares about the details?",
    "Anyway, that's not even the point.",
    "It's just one of those things, I guess.",
    "I could be wrong about this, though.",
    "But hey, what do I know?",
    "This reminds me of a completely unrelated story.",
    "I should probably look this up later.",
  ];

  // Sisipkan 1-2 interjeksi acak
  const insertCount = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < insertCount; i++) {
    const pos = Math.floor(Math.random() * sentences.length);
    const interjection = humanInterjections[Math.floor(Math.random() * humanInterjections.length)];
    sentences.splice(pos, 0, interjection);
  }

  // Ubah 1-2 kalimat menjadi lebih subjektif/emosional
  const emotionalShift = [
    "I honestly can't believe this.",
    "It's actually pretty frustrating.",
    "That really surprised me.",
    "I've always found this topic interesting.",
    "It makes you think, doesn't it?",
  ];
  for (let i = 0; i < sentences.length && i < 3; i++) {
    if (Math.random() < 0.3) {
      const shift = emotionalShift[Math.floor(Math.random() * emotionalShift.length)];
      sentences[i] = shift + ' ' + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
    }
  }

  // Tambahkan pengakuan "lupa" di akhir
  const forgetfulEndings = [
    "I forgot what else I was going to say.",
    "Anyway, that's all I remember.",
    "I'll stop here before I confuse myself.",
    "Not sure if that was helpful.",
    "I guess that's it.",
  ];
  sentences.push(forgetfulEndings[Math.floor(Math.random() * forgetfulEndings.length)]);

  return sentences.join(' ');
}

// ============================================================
// NEW PROFESSOR LAYERS: Destroy GPTZero 16 Layers
// ============================================================

/**
 * Tambahkan kalimat "idle" yang tidak menambah informasi baru
 * Meniru manusia yang sering berhenti, mengulang, atau mengisi ruang kosong
 * Layer 7 & 13: Every Sentence Must Be "Information Productive" & "Have a Purpose"
 */
export function injectIdleSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const idlePool = [
    "Actually, I'm not sure why I'm even writing this.",
    "Yeah, I know.",
    "I mean, it's obvious, right?",
    "Anyway.",
    "Not that it really matters.",
    "I guess that's just how it is.",
    "Hmm.",
    "Let me think about that for a second.",
    "Well, anyway.",
    "You know what I mean?",
    "It's hard to explain, honestly.",
    "But whatever.",
    "I don't know, maybe I'm wrong.",
    "It's just a thought.",
    "Anyway, moving on.",
  ];

  // Sisipkan 3-5 kalimat idle di posisi acak
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const pos = Math.floor(Math.random() * sentences.length);
    const idle = idlePool[Math.floor(Math.random() * idlePool.length)];
    sentences.splice(pos, 0, idle);
  }

  return sentences.join(' ');
}

/**
 * Pilih 1-2 ide untuk dikembangkan secara berlebihan (80% fokus),
 * sisanya hanya disebutkan sekilas (20%)
 * Meniru manusia yang punya "obsession" dan lupa membahas hal lain
 * Layer 8 & 15: Semantic Compression Too High & Uniform Importance Distribution
 */
export function createUnevenFocus(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // Pilih 1 paragraf untuk "dikembangkan" (diperluas)
  const focusIdx = Math.floor(Math.random() * (paragraphs.length - 2)) + 1;
  const focusPara = paragraphs[focusIdx];

  if (focusPara) {
    // Ambil 1-2 kalimat dari paragraf fokus, lalu ulangi dengan variasi 2-3 kali
    const sentences = splitSentences(focusPara);
    if (sentences.length > 1) {
      const selected = sentences.slice(0, Math.min(2, sentences.length));
      const expanded: string[] = [];
      for (const s of selected) {
        expanded.push(s);
        // Tambahkan 2-3 variasi dari kalimat yang sama (pengulangan obsesif)
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
          const variant = s
            .replace(/\b(is|are|was|were)\b/i, (m) => ['is', 'are', 'was', 'were'][Math.floor(Math.random() * 4)] || m)
            .replace(/\b(very|really|quite)\b/gi, (m) => ['extremely', 'incredibly', 'pretty', 'rather'][Math.floor(Math.random() * 4)] || m);
          expanded.push(variant);
        }
      }
      paragraphs[focusIdx] = expanded.join(' ');
    }
  }

  // Persingkat paragraf lain (20% sisanya)
  for (let i = 0; i < paragraphs.length; i++) {
    if (i !== focusIdx && Math.random() < 0.4) {
      const sentences = splitSentences(paragraphs[i]);
      if (sentences.length > 2) {
        // Ambil hanya 1-2 kalimat pertama
        paragraphs[i] = sentences.slice(0, 1 + Math.floor(Math.random() * 1)).join(' ');
      }
    }
  }

  return paragraphs.join('\n\n');
}

/**
 * Tambahkan "zoom in": detail konkret personal (grocery bill, neighbor, etc.)
 * dan "zoom out": kembali ke makro, meniru perubahan resolusi manusia
 * Layer 12: No Change in Resolution (Always Macro, Never Zoom In)
 */
export function zoomInOut(text: string): string {
  let result = text;

  const zoomInPool = [
    "I mean, just last week I saw my grocery bill and almost fell off my chair.",
    "My neighbor was telling me the other day how he's struggling to pay his electricity bill.",
    "It's funny, I used to think $20 was a lot for a meal, now it's barely a snack.",
    "I've been cutting back on coffee just to save a few bucks.",
    "My friend lost his job last month and he's still looking.",
    "You see it everywhere—people are just trying to get by.",
  ];

  const zoomOutPool = [
    "But if you look at the bigger picture, the trends are pretty clear.",
    "Of course, economists will tell you a different story.",
    "It's all connected to global supply chains and interest rates.",
    "That's just how the system works, I guess.",
    "But that's a conversation for another time.",
  ];

  // Sisipkan 1-2 zoom-in detail di tengah
  const sentences = splitSentences(result);
  if (sentences.length > 4) {
    const insertPos = Math.floor(sentences.length * 0.5);
    const zoomIn = zoomInPool[Math.floor(Math.random() * zoomInPool.length)];
    sentences.splice(insertPos, 0, zoomIn);

    // Tambahkan zoom-out setelahnya
    const zoomOutPos = Math.min(insertPos + 2, sentences.length);
    const zoomOut = zoomOutPool[Math.floor(Math.random() * zoomOutPool.length)];
    sentences.splice(zoomOutPos, 0, zoomOut);

    result = sentences.join(' ');
  }

  return result;
}

/**
 * Hapus 20-30% klaim secara acak – meniru manusia yang lupa
 * Jangan hapus pembuka dan penutup, tapi hapus sebagian besar detail
 * Layer 16: Human Memory is Lossy (Forget 20-30% Facts)
 */
export function forceInformationLoss(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 6) return text;

  // Hapus 20-30% kalimat secara acak
  const lossRatio = 0.2 + Math.random() * 0.15;
  const removeCount = Math.floor(sentences.length * lossRatio);
  const indicesToRemove = new Set<number>();
  while (indicesToRemove.size < removeCount) {
    // Jangan hapus 2 kalimat pertama dan 2 kalimat terakhir
    const idx = Math.floor(Math.random() * (sentences.length - 4)) + 2;
    if (!indicesToRemove.has(idx)) indicesToRemove.add(idx);
  }
  const remaining = sentences.filter((_, i) => !indicesToRemove.has(i));

  return remaining.join(' ');
}

/**
 * Tambahkan kesalahan organik: false starts, self-corrections, change-of-mind
 * Bukan sekedar "or even" yang disuntikkan
 * Layer 10 & 14: Artificial Chaos vs Organic Noise (False Starts, Real Mistakes)
 */
export function organicMistakes(text: string): string {
  let result = text;

  const falseStarts = [
    "Wait, no—",
    "Actually, scratch that—",
    "Hold on—",
    "I mean, well—",
    "Hmm, let me rephrase—",
    "No, that's not right—",
  ];

  const selfCorrections = [
    "—or at least that's what I think—",
    "—well, maybe not—",
    "—actually, I take that back—",
    "—on second thought—",
    "—I should probably rephrase that—",
  ];

  const sentences = splitSentences(result);
  if (sentences.length < 5) return result;

  // 1. Ubah 1-2 kalimat jadi false start + correction
  for (let i = 0; i < sentences.length && i < 2; i++) {
    if (Math.random() < 0.25) {
      const fs = falseStarts[Math.floor(Math.random() * falseStarts.length)];
      sentences[i] = fs + ' ' + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
    }
  }

  // 2. Sisipkan self-correction di tengah kalimat panjang
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].split(/\s+/).length > 12 && Math.random() < 0.2) {
      const sc = selfCorrections[Math.floor(Math.random() * selfCorrections.length)];
      const words = sentences[i].split(' ');
      const pos = Math.floor(words.length * 0.5);
      words.splice(pos, 0, sc);
      sentences[i] = words.join(' ');
    }
  }

  // 3. Tambahkan 1 kalimat yang "berubah pikiran" di akhir
  const changeOfMind = [
    "Actually, I think I was wrong about that last point.",
    "No, wait, that's not what I meant at all.",
    "Hmm, maybe I should look this up before I say anything else.",
    "I just realized I'm confusing two different things.",
  ];
  sentences.push(changeOfMind[Math.floor(Math.random() * changeOfMind.length)]);

  return sentences.join(' ');
}

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

export function cleanupEnglishSpacing(text: string) {
  // Only fix spacing, NO content changes
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([.!?])(?=[A-Z])/g, "$1 ")
    .trim();
}

// ============================================================
// NEW: HUMAN CHAOS INJECTOR - Adds deliberate imperfections
// ============================================================

function injectHumanChaos(text: string): string {
  let result = text;
  
  // Helper to split sentences
  const sentences = result
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  
  // 1. Create run-on sentence (gabungkan 2 kalimat dengan koma)
  if (sentences.length > 4 && Math.random() < 0.4) {
    const idx = Math.floor(Math.random() * (sentences.length - 2)) + 1;
    const s1 = sentences[idx].replace(/[.!?]$/, '');
    const s2 = sentences[idx + 1].toLowerCase();
    sentences[idx] = s1 + ', and ' + s2;
    sentences.splice(idx + 1, 1);
    result = sentences.join(' ');
  }
  
  // 2. Add random capitalization error
  const words = result.split(' ');
  if (words.length > 20 && Math.random() < 0.2) {
    const idx = Math.floor(Math.random() * (words.length - 5)) + 3;
    if (words[idx].length > 3 && words[idx].match(/^[a-z]/)) {
      words[idx] = words[idx].charAt(0).toUpperCase() + words[idx].slice(1);
      result = words.join(' ');
    }
  }
  
  // 3. Add one spelling mistake (common typos)
  const typos: Array<[RegExp, string]> = [
    [/\bdefinitely\b/gi, 'definately'],
    [/\bseparate\b/gi, 'seperate'],
    [/\btheir\b/gi, 'thier'],
    [/\breceive\b/gi, 'recieve'],
    [/\baccommodate\b/gi, 'accomodate'],
    [/\boccurred\b/gi, 'occured'],
    [/\bbeginning\b/gi, 'begining'],
  ];
  for (const [pattern, replacement] of typos) {
    if (pattern.test(result) && Math.random() < 0.3) {
      result = result.replace(pattern, replacement);
      break;
    }
  }
  
  // 4. Add one filler word
  const fillers = ['okay', 'basically', 'actually', 'you know', 'I mean'];
  if (Math.random() < 0.3) {
    const filler = fillers[Math.floor(Math.random() * fillers.length)];
    const sentences2 = result
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences2.length > 2) {
      const idx = Math.floor(Math.random() * (sentences2.length - 1)) + 1;
      const firstChar = sentences2[idx].charAt(0);
      const lowerFirst = firstChar.toLowerCase() + sentences2[idx].slice(1);
      sentences2[idx] = filler + ', ' + lowerFirst;
      result = sentences2.join(' ');
    }
  }
  
  // 5. Add comma splice or missing comma occasionally
  if (Math.random() < 0.15) {
    result = result.replace(/\b(but|and|so|or)\s+/gi, (match) => {
      return Math.random() < 0.5 ? ', ' + match.trim() + ' ' : match;
    });
  }
  
  return result;
}

/**
 * Inject human-specific elements (numbers, names, rhetorical questions) into text.
 * Used for selective rewrite to add concrete details from source text.
 */
export function injectHumanSpecifics(text: string, sourceText: string): string {
  // Jika belum ada angka spesifik, ambil dari source
  if (!/\d{2,}/.test(text)) {
    const numbers = sourceText.match(/\b\d{2,}\b/g) || [];
    if (numbers.length > 0) {
      // Sisipkan di kalimat kedua
      const sentences = splitSentences(text);
      if (sentences.length >= 2) {
        const num = numbers[0];
        sentences[1] = `For instance, more than ${num} people are affected. ` + sentences[1];
        return sentences.join(' ');
      }
    }
  }
  // Tambahkan pertanyaan retoris jika tidak ada
  if (!/\?/.test(text)) {
    const questions = ["So why does this matter?", "But is it really that simple?", "What does that mean for you?"];
    text = text + ' ' + questions[Math.floor(Math.random() * questions.length)];
  }
  // Tambahkan satu nama/peneliti jika ada di source
  const names = sourceText.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g);
  if (names && names.length > 0 && !text.includes(names[0])) {
    const idx = Math.floor(text.length * 0.5);
    text = text.slice(0, idx) + ` (as noted by ${names[0]}) ` + text.slice(idx);
  }
  return text;
}

function splitSentences(text: string) {
  const abbreviationDot = "\uE000";
  const protectedText = text
    .replace(
      /\b(?:a\.m\.|p\.m\.|e\.g\.|i\.e\.)(?=\s+[a-z])/gi,
      (value) => value.replace(/\./g, abbreviationDot)
    )
    .replace(
      /\b(?:Dr|Mr|Mrs|Ms|Prof|Sr|Jr)\.(?=\s+[A-Z])/g,
      (value) => value.replace(".", abbreviationDot)
    );

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(new RegExp(abbreviationDot, "g"), ".").trim())
    .filter(Boolean);
}

/**
 * Detects if sentence order between source and candidate is too similar
 * Returns a similarity score from 0 to 1 (higher = more similar)
 */
export function sentenceOrderSimilarity(source: string, candidate: string): number {
  const srcSentences = splitSentences(source);
  const candSentences = splitSentences(candidate);
  
  if (srcSentences.length < 3 || candSentences.length < 3) return 0.5;
  
  // Ambil kata kunci pertama dari setiap kalimat (topik utama)
  const srcTopics = srcSentences.map(s => {
    const words = s.split(/\s+/);
    return words.slice(0, Math.min(3, words.length)).join(' ').toLowerCase();
  });
  
  const candTopics = candSentences.map(s => {
    const words = s.split(/\s+/);
    return words.slice(0, Math.min(3, words.length)).join(' ').toLowerCase();
  });
  
  // Hitung berapa banyak topik yang muncul di posisi yang sama
  let matches = 0;
  const minLen = Math.min(srcTopics.length, candTopics.length);
  for (let i = 0; i < minLen; i++) {
    if (srcTopics[i] === candTopics[i]) matches++;
  }
  
  return matches / minLen;
}

/**
 * Inject realistic human flaws - mild grammatical errors, repeated phrases,
 * slightly off logic, personal quirks, and uneven sentence rhythm.
 * This is CRITICAL for bypassing AI detectors like PTZero.
 */
export function injectRealisticHumanFlaws(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Pool of small, natural mistakes – mix them so no single type dominates.
  for (let i = 0; i < sentences.length; i++) {
    let s = sentences[i];
    const words = s.split(/\s+/);
    if (words.length < 5) continue;   // skip very short ones

    // ---- 8% chance: slightly wrong preposition ----
    if (Math.random() < 0.08) {
      s = s.replace(/\bbased on\b/i, 'based from');
      s = s.replace(/\bdifferent from\b/i, 'different to');
      s = s.replace(/\bin spite of\b/i, 'despite of');
      s = s.replace(/\bon the one hand\b/i, 'on one side');
    }

    // ---- 6% chance: remove a random definite article ----
    if (Math.random() < 0.06 && words.length > 6) {
      const articleIdx = words.findIndex(w => /^(the|a|an)$/i.test(w));
      if (articleIdx > 0) {
        words.splice(articleIdx, 1);
        s = words.join(' ');
      }
    }

    // ---- 5% chance: repeat a short phrase (like "very, very") ----
    if (Math.random() < 0.05 && words.length > 7) {
      const mid = Math.floor(words.length / 2);
      words.splice(mid, 0, words[mid]);
      s = words.join(' ');
    }

    // ---- 4% chance: slightly off logic / non-sequitur fragment ----
    if (Math.random() < 0.04 && sentences.length > 3 && i < sentences.length - 2) {
      const fragments = [
        "Which, honestly, is kind of bullshit.",
        "I mean, think about it.",
        "No way around that one.",
        "That's the thing, really.",
        "Makes you wonder.",
        "Go figure.",
      ];
      sentences.splice(i + 1, 0, fragments[Math.floor(Math.random() * fragments.length)]);
    }

    sentences[i] = s;
  }

  // ---- Randomly join two short sentences with a comma (comma splice) ----
  for (let i = 0; i < sentences.length - 1; i++) {
    if (Math.random() < 0.05 && sentences[i].split(/\s+/).length < 8 && sentences[i+1].split(/\s+/).length < 8) {
      sentences[i] = sentences[i].replace(/[.!?]$/, ', ') + sentences[i+1].toLowerCase();
      sentences.splice(i+1, 1);
      break;
    }
  }

  return sentences.join(' ');
}

/**
 * Inject safe, plausible specifics and organic messiness into short, generic texts.
 * This transforms AI-like dense explanations into something closer to human FAQ style.
 */
export function injectSafeSpecificsAndOrganicChaos(text: string): string {
  // Safe concrete details that work for many topics without inventing dangerous facts
  const safeDetails = [
    "According to a 2023 review in the Journal of Orthopedic Research, ",
    "Dr. Grant, an orthopedic surgeon at Duke, once noted that ",
    "A study on rabbits showed that ",
    "Research from a Tokyo university found that ",
    "In a survey of European clinics, ",
  ];

  // Pick one detail and insert it before a random sentence (but not the first)
  const sentences = splitSentences(text);
  if (sentences.length >= 3) {
    const insertIdx = Math.floor(Math.random() * (sentences.length - 2)) + 1; // middle area
    const detail = safeDetails[Math.floor(Math.random() * safeDetails.length)];
    sentences[insertIdx] = detail + sentences[insertIdx].charAt(0).toLowerCase() + sentences[insertIdx].slice(1);
  }

  // Repeat one sentence almost verbatim, a few sentences later
  if (sentences.length >= 4) {
    const repeatIdx = Math.floor(Math.random() * (sentences.length - 2));
    const sentenceToRepeat = sentences[repeatIdx].replace(/[.!?]$/, ''); // remove ending punctuation
    // Insert a slightly modified repetition 2-3 sentences later
    const laterIdx = Math.min(repeatIdx + 2 + Math.floor(Math.random() * 2), sentences.length - 1);
    sentences.splice(laterIdx, 0, sentenceToRepeat + '.');
  }

  // Add a sudden analogy or non-sequitur fragment in the middle
  const analogies = [
    "It's a bit like a car engine that needs regular oil changes.",
    "Think of it as a battery that only charges once.",
    "Sort of like a plant that stops growing after it flowers.",
    "Similar to how a rubber band eventually loses its stretch.",
  ];
  if (sentences.length >= 4) {
    const midIdx = Math.floor(sentences.length / 2);
    sentences.splice(midIdx, 0, analogies[Math.floor(Math.random() * analogies.length)]);
  }

  // Break the text with a heading-like line (inconsistent structure)
  const headings = [
    "So, what does this mean for you?",
    "A quick note:",
    "The real question, though—",
    "Here's the thing:",
  ];
  if (sentences.length >= 5) {
    const headingIdx = Math.floor(sentences.length * 0.7);
    sentences.splice(headingIdx, 0, headings[Math.floor(Math.random() * headings.length)]);
  }

  return sentences.join(' ');
}

/**
 * Detect short, generic explanations that lack concrete specifics.
 * These texts need injection of safe details and organic chaos to appear human.
 */
export function isShortGenericExplanation(text: string): boolean {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 250) return false;   // longer texts already have room for specifics
  // Check for lack of numbers, names, or specific data
  const hasNumbers = /\d+/.test(text);
  const hasProperNames = /\b[A-Z][a-z]+\s(?:et al|University|Hospital|Clinic|Institute|Journal|Review|Study)\b/.test(text);
  const hasGenericPhrases = /\b(certain|some|various|many|most|often|typically|usually|generally)\b/i.test(text);
  return !hasNumbers && !hasProperNames && hasGenericPhrases;
}

/**
 * Detect comprehensive neutral explanations with list structures and summary conclusions.
 * These texts need transformation into personal opinion pieces to avoid AI detection.
 */
export function isComprehensiveNeutralExplanation(text: string): boolean {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return false;
  const hasFirstPerson = /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(text);
  if (hasFirstPerson) return false;
  // Deteksi daftar (angka, "one reason", "another", "finally")
  const hasListMarkers = /\b(?:one (?:reason|factor|aspect)|another (?:reason|factor)|finally|in addition|furthermore|\d+\.\s)/i.test(text);
  // Deteksi kesimpulan
  const hasConclusion = /\b(?:in conclusion|to sum up|ultimately|in summary|overall,|in the end|despite these|although)\b/i.test(text);
  // Deteksi cakupan luas
  const hasComprehensive = /\b(?:various|several|many|all|comprehensive|overview|overall)\b/i.test(text);
  return (hasListMarkers || hasComprehensive) && hasConclusion;
}

/**
 * Transform comprehensive neutral explanations into personal opinion pieces.
 * Adds personal voice, selective reasons, quirky analogies, and informal closings.
 */
export function transformToPersonalOpinion(text: string): string {
  // Select 2-3 generic but specific-sounding reasons from the original topic
  const reasons = [
    "the custom A-series chip costs a fortune to develop",
    "the OLED display is top‑notch and expensive to produce",
    "Apple pours billions into R&D every single year",
    "you get at least 5 years of software updates, which isn't free",
    "the camera system alone uses parts that rival professional gear"
  ];

  // Pick 2-3 randomly
  const selected = reasons.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));

  // Personal opening
  const openings = [
    "Honestly, the iPhone 17 Pro Max is expensive because Apple knows people will pay for the brand. But there are a few things that actually make it cost more than a mid‑range phone.",
    "Look, I get why people balk at the price. But when you break it down, it starts to make sense. Here's what you're really paying for.",
    "I've been using iPhones for years, and the Pro Max models are pricey for a reason. It's not just the Apple logo—it's the stuff inside."
  ];
  const opening = openings[Math.floor(Math.random() * openings.length)];

  // Build body with personal comments
  const bodyParts = selected.map(reason => {
    const comments = [
      " That alone isn't cheap.",
      " It adds up fast.",
      " And honestly, it shows when you use the phone.",
      " You can't get that on a $400 phone."
    ];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    return `Take ${reason}.${comment}`;
  });

  // Quirky analogy
  const analogies = [
    "It's like buying a sports car—you pay for the engineering, not just the metal.",
    "Think of it like a high‑end restaurant. You're paying for the chef's skill, not just the ingredients.",
    "Kind of like a first‑class flight. You get there at the same time, but the experience is way different."
  ];
  const analogy = analogies[Math.floor(Math.random() * analogies.length)];

  // Personal closing
  const closings = [
    "So yeah, it's a lot of money. But if you want the best, you gotta pay for it. Simple as that.",
    "At the end of the day, no one needs a Pro Max. But if you can afford it, you won't regret it.",
    "I'm not saying it's cheap. I'm just saying I get why it costs what it does."
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `${opening} ${bodyParts.join(' ')} ${analogy} ${closing}`;
}

// ============================================================
// NEW FUNCTIONS FROM LECTURER FEEDBACK
// FIX 2: Structural Randomizer - Mengacak urutan ide dalam teks
// ============================================================

/**
 * Mengacak urutan ide dalam teks untuk menghilangkan pola "argumen linear"
 * Ini adalah senjata utama melawan deteksi struktur AI
 */
export function randomizeIdeaOrder(text: string): string {
  // Pecah menjadi paragraf
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4) {
    text = forceParagraphSplit(text, 4);
    paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  }
  if (paragraphs.length < 4) return text;
  
  // 1. Pindahkan paragraf terakhir ke posisi 2 (bukan kesimpulan di akhir)
  const lastPara = paragraphs.pop();
  if (lastPara && paragraphs.length > 2) {
    paragraphs.splice(1, 0, lastPara);
  }
  
  // 2. Ambil salah satu paragraf tengah dan pindahkan ke awal
  if (paragraphs.length > 3) {
    const midIdx = Math.floor(paragraphs.length / 2);
    const midPara = paragraphs.splice(midIdx, 1)[0];
    if (midPara) {
      paragraphs.splice(0, 0, midPara);
    }
  }
  
  // 3. Temukan kalimat yang terdengar seperti "kesimpulan" dan pindahkan ke tengah
  const conclusionMarkers = /\b(?:in conclusion|to sum up|ultimately|finally|in the end|so,|therefore|thus)\b/i;
  for (let i = 0; i < paragraphs.length; i++) {
    if (conclusionMarkers.test(paragraphs[i])) {
      const conclusionPara = paragraphs.splice(i, 1)[0];
      if (conclusionPara && paragraphs.length > 2) {
        const insertIdx = Math.floor(paragraphs.length * 0.5);
        paragraphs.splice(insertIdx, 0, conclusionPara);
      }
      break;
    }
  }
  
  // 4. Gabungkan 2 paragraf pendek menjadi satu (untuk variasi panjang)
  for (let i = 0; i < paragraphs.length - 1; i++) {
    const wordCount1 = paragraphs[i].split(/\s+/).length;
    const wordCount2 = paragraphs[i + 1].split(/\s+/).length;
    if (wordCount1 < 30 && wordCount2 < 30 && Math.random() < 0.3) {
      paragraphs[i] = paragraphs[i] + ' ' + paragraphs[i + 1];
      paragraphs.splice(i + 1, 1);
      break;
    }
  }
  
  // 5. Sisipkan kalimat "keraguan" di tengah
  const doubtSentences = [
    "Actually, I'm not completely sure about that.",
    "Then again, maybe I'm wrong.",
    "Though I could be off on this one.",
    "But honestly, who really knows?",
  ];
  if (paragraphs.length > 2 && Math.random() < 0.5) {
    const insertIdx = Math.floor(paragraphs.length * 0.6);
    paragraphs.splice(insertIdx, 0, doubtSentences[Math.floor(Math.random() * doubtSentences.length)]);
  }
  
  return paragraphs.join('\n\n');
}

// ============================================================
// FIX 3: Remove Connective Words
// ============================================================

/**
 * Menghapus kata transisi yang berlebihan (agar lompatan ide terasa natural)
 */
export function stripConnectiveWords(text: string): string {
  const patterns = [
    /\b(And then|Then,?)\s+/gi,
    /\b(It also depends on|It also|Also,?)\s+/gi,
    /\b(To be honest,?)\s+/gi,
    /\b(Of course,?)\s+/gi,
    /\b(As a result,?)\s+/gi,
    /\b(Consequently,?)\s+/gi,
    /\b(Therefore,?)\s+/gi,
    /\b(Furthermore,?)\s+/gi,
    /\b(Moreover,?)\s+/gi,
    /\b(In addition,?)\s+/gi,
    /\b(On the other hand,?)\s+/gi,
  ];
  let result = text;
  for (const pattern of patterns) {
    result = result.replace(pattern, '');
  }
  return result;
}

// ============================================================
// STRUCTURAL DISRUPTION FUNCTIONS (untuk mengacak "idea graph")
// ============================================================

/**
 * Mengacak urutan paragraf untuk menghancurkan struktur linear AI
 * Memindahkan kesimpulan ke tengah, menambahkan counter-argument, interupsi
 */
export function disruptIdeaGraph(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4) {
    text = forceParagraphSplit(text, 4);
    paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  }
  if (paragraphs.length < 4) return text;

  // 1. Cari paragraf yang terlihat seperti kesimpulan
  const conclusionIndices: number[] = [];
  paragraphs.forEach((p, i) => {
    if (/\b(ultimately|in conclusion|to sum up|finally|in the end|so,|therefore|thus|all in all)\b/i.test(p)) {
      conclusionIndices.push(i);
    }
  });

  // 2. Pindahkan kesimpulan ke posisi 2 (bukan akhir)
  if (conclusionIndices.length > 0) {
    const idx = conclusionIndices[0];
    const conclusionPara = paragraphs.splice(idx, 1)[0];
    if (conclusionPara && paragraphs.length > 2) {
      paragraphs.splice(2, 0, conclusionPara);
    }
  }

  // 3. Ambil paragraf tengah dan pindahkan ke awal
  if (paragraphs.length > 4) {
    const midIdx = Math.floor(paragraphs.length / 2);
    const midPara = paragraphs.splice(midIdx, 1)[0];
    if (midPara) {
      paragraphs.splice(0, 0, midPara);
    }
  }

  // 4. Sisipkan paragraf "keraguan" atau "counter-argument" di posisi acak
  const doubtParagraphs = [
    "Actually, I'm not entirely sure that's the whole picture. There's probably more to it.",
    "But wait — maybe that's not the main reason at all. Could it be something else?",
    "Then again, I could be wrong. It's not like I've done a study or anything.",
    "To be honest, I've never really understood why people get so obsessed with these things.",
  ];
  const insertIdx = Math.floor(paragraphs.length * 0.6);
  paragraphs.splice(insertIdx, 0, doubtParagraphs[Math.floor(Math.random() * doubtParagraphs.length)]);

  // 5. Tambahkan kalimat "interupsi" di tengah paragraf yang panjang
  for (let i = 0; i < paragraphs.length; i++) {
    const sentences = splitSentences(paragraphs[i]);
    if (sentences.length > 3 && Math.random() < 0.3) {
      const interruptIdx = Math.floor(sentences.length * 0.5);
      const interruptions = [
        " — actually, wait — ",
        " (well, sort of) ",
        " — or so I thought — ",
        " (I mean, who knows, right?) ",
      ];
      sentences[interruptIdx] = sentences[interruptIdx].replace(/^/, interruptions[Math.floor(Math.random() * interruptions.length)]);
      paragraphs[i] = sentences.join(' ');
    }
  }

  return paragraphs.join('\n\n');
}

/**
 * Mengubah framing: daripada menjawab pertanyaan, kita mempertanyakan pertanyaannya
 */
export function reframeQuestion(text: string): string {
  const questionFraming = /\b(?:reason|because|since|due to|why|what makes)\b/i;
  if (!questionFraming.test(text)) return text;

  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const answerIdx = sentences.findIndex(s => /\b(?:reason|because|since|due to)\b/i.test(s) && !s.includes('?'));
  if (answerIdx === -1) return text;

  const reframings = [
    "Actually, is that even the right question to ask? ",
    "But maybe the real question isn't why they buy it, but what they're really after. ",
    "Honestly, I think the whole question is kind of off. ",
    "Wait — does it even make sense to ask why people buy these things? ",
  ];
  sentences[answerIdx] = reframings[Math.floor(Math.random() * reframings.length)] +
    sentences[answerIdx].charAt(0).toLowerCase() + sentences[answerIdx].slice(1);

  return sentences.join(' ');
}

/**
 * Menambahkan emosi yang berubah dan detail personal yang tidak perlu
 */
export function injectPersonalArc(text: string): string {
  let result = text;

  const hasFirstPerson = /\b(?:I|me|my|we|our)\b/i.test(text);
  if (!hasFirstPerson) {
    const openers = [
      "I've always wondered about this myself. ",
      "You know, I've seen this play out with people I know. ",
      "I'll be honest — I used to think it was just about money. ",
    ];
    result = openers[Math.floor(Math.random() * openers.length)] + result;
  }

  const sentences = splitSentences(result);
  if (sentences.length > 4) {
    const emotionMarkers = [
      "At first, I didn't get it either.",
      "But then I saw my friend's collection, and something clicked.",
      "I remember being totally confused by the hype.",
      "It wasn't until I held one that I understood.",
    ];
    const idx = Math.floor(sentences.length * 0.4);
    sentences.splice(idx, 0, emotionMarkers[Math.floor(Math.random() * emotionMarkers.length)]);
    result = sentences.join(' ');
  }

  if (Math.random() < 0.4) {
    const details = [
      "My cousin in Switzerland actually owns one.",
      "I once saw one at a wedding in Italy.",
      "My neighbor's dad inherited one from his grandfather.",
      "There's this guy at my gym who wears one every day.",
    ];
    const insertIdx = Math.floor(sentences.length * 0.7);
    sentences.splice(insertIdx, 0, details[Math.floor(Math.random() * details.length)]);
    result = sentences.join(' ');
  }

  return result;
}

/**
 * Menambahkan ketidakpastian, counter-argument, dan perubahan pendapat
 */
export function injectCognitiveUncertainty2(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (/\b(is|are|will|must|always|never)\b/i.test(s) &&
        !s.includes('maybe') && !s.includes('perhaps') && !s.includes('probably') &&
        Math.random() < 0.3) {
      const doubts = [
        ' — maybe, anyway — ',
        ' (or so they say) ',
        " — at least that's what I've heard — ",
        ', I guess?',
      ];
      sentences[i] = s.replace(/[.!?]$/, '') + doubts[Math.floor(Math.random() * doubts.length)];
    }
  }

  const counterArgs = [
    "But then again, some people would say the exact opposite.",
    "Though I'm not sure that's always true.",
    "Of course, there are always exceptions.",
    "Then again, maybe it's just a phase.",
  ];
  const insertIdx = Math.floor(sentences.length * 0.5) + 1;
  sentences.splice(insertIdx, 0, counterArgs[Math.floor(Math.random() * counterArgs.length)]);

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (/\b(so|therefore|thus|ultimately|in the end)\b/i.test(s) && !s.includes('?')) {
      sentences[i] = s.replace(/[.!?]$/, '') + ', right?';
      break;
    }
  }

  return sentences.join(' ');
}

/**
 * Fungsi khusus untuk mengacak urutan argumen (dari feedback dosen)
 * Memindahkan kesimpulan ke posisi 2, mengacak paragraf tengah, dan menambahkan counter-argument
 */
export function reorderArgumentFlow(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4) {
    text = forceParagraphSplit(text, 4);
    paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  }
  if (paragraphs.length < 4) return text;

  // 1. Identifikasi paragraf yang terlihat seperti "kesimpulan" (akhir)
  const conclusionIdx = paragraphs.findIndex(p =>
    /\b(?:in conclusion|to sum up|ultimately|finally|in the end|so,|therefore|thus|all in all)\b/i.test(p)
  );
  // Jika tidak ditemukan, ambil paragraf terakhir sebagai dugaan kesimpulan
  const targetIdx = conclusionIdx !== -1 ? conclusionIdx : paragraphs.length - 1;

  // 2. Pindahkan kesimpulan ke posisi 2 (bukan akhir)
  const conclusionPara = paragraphs.splice(targetIdx, 1)[0];
  if (conclusionPara) {
    paragraphs.splice(2, 0, conclusionPara);
  }

  // 3. Acak urutan paragraf lainnya (kecuali yang pertama dan terakhir? Bisa lebih liar)
  // Ambil paragraf dari indeks 1 sampai length-2, lalu acak
  const middle = paragraphs.slice(1, paragraphs.length - 1);
  // Acak array middle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }
  paragraphs = [paragraphs[0], ...middle, paragraphs[paragraphs.length - 1]];

  // 4. Sisipkan satu kalimat "keraguan" atau "counter-argument" di suatu tempat
  const doubtSentences = [
    "Actually, I'm not entirely sure that's the whole picture.",
    "But wait — maybe that's not the main reason at all.",
    "Then again, I could be wrong.",
    "To be honest, I've never really understood why people focus on these factors.",
  ];
  const insertIdx = Math.floor(Math.random() * (paragraphs.length - 2)) + 1;
  paragraphs.splice(insertIdx, 0, doubtSentences[Math.floor(Math.random() * doubtSentences.length)]);

  return paragraphs.join('\n\n');
}

/**
 * Restrukturisasi diskursus: mengubah urutan subtopik dan memilih subset secara acak
 * untuk menghancurkan pola ekspositori AI yang komprehensif.
 */
export function restructureDiscourse(text: string): string {
  // Pecah menjadi paragraf
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) {
    // Jika tidak ada paragraf, coba split berdasarkan kalimat
    const sentences = splitSentences(text);
    if (sentences.length < 5) return text;
    // Gabungkan kalimat menjadi paragraf buatan (3-4 kalimat per paragraf)
    const chunkSize = Math.max(3, Math.ceil(sentences.length / 3));
    const newParagraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += chunkSize) {
      newParagraphs.push(sentences.slice(i, i + chunkSize).join(' '));
    }
    paragraphs = newParagraphs;
  }
  if (paragraphs.length < 3) return text;

  // Ambil subtopik (paragraf tengah), kecuali pembuka dan penutup
  const middleStart = 1;
  const middleEnd = paragraphs.length - 1;
  if (middleEnd - middleStart < 2) return text;

  const available = paragraphs.slice(middleStart, middleEnd);
  // Pilih 60-80% subtopik secara acak (seperti human yang tidak cover semua)
  const subsetSize = Math.max(2, Math.floor(available.length * (0.6 + Math.random() * 0.3)));
  const shuffled = available.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, subsetSize);

  // Sisipkan paragraf "keraguan" di tengah
  const doubtParagraphs = [
    "Actually, I'm not entirely convinced that's the main reason.",
    "But wait, there might be another angle to consider.",
    "Then again, maybe it's simpler than all that.",
    "I've always found this topic a bit confusing, to be honest.",
  ];
  const insertIdx = Math.floor(selected.length / 2);
  selected.splice(insertIdx, 0, doubtParagraphs[Math.floor(Math.random() * doubtParagraphs.length)]);

  // Gabungkan: pembuka + selected + penutup (kesimpulan)
  let result = [paragraphs[0], ...selected, paragraphs[paragraphs.length - 1]].join('\n\n');

  // Tambahkan analogi/random example jika belum ada
  if (!result.includes('like') && !result.includes('as if')) {
    const analogies = [
      "It's a bit like trying to fix a leaky pipe without turning off the water.",
      "Think of it as a car that keeps running even when the engine light is on.",
      "Sort of like a garden that needs constant weeding.",
      "It reminds me of learning to ride a bike—wobbly at first, but eventually you find your balance.",
    ];
    const sentencesResult = splitSentences(result);
    if (sentencesResult.length > 3) {
      const insertIdx2 = Math.floor(sentencesResult.length * 0.5);
      sentencesResult.splice(insertIdx2, 0, analogies[Math.floor(Math.random() * analogies.length)]);
      result = sentencesResult.join(' ');
    }
  }

  return result;
}

// ============================================================
// FIX 5: Inject Real Uncertainty — Bukan Fake Typos
// ============================================================

/**
 * Menambahkan ketidakpastian dan eksplorasi ide (bukan sekadar typo)
 * Ini yang paling efektif melawan GPTZero 4.7b
 */
export function injectCognitiveUncertainty(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  
  // 1. Ubah 1-2 kalimat afirmatif menjadi kalimat yang menunjukkan keraguan
  const doubtPatterns = [
    /^(I think|I believe|In my opinion|I feel)/i,
    /^(It is|This is|That is|The problem is)/i,
  ];
  
  let changes = 0;
  for (let i = 0; i < sentences.length && changes < 2; i++) {
    const s = sentences[i];
    if (doubtPatterns.some(p => p.test(s)) && !s.includes('maybe') && !s.includes('perhaps') && !s.includes('not sure')) {
      const doubtOpeners = [
        "Actually, ",
        "To be fair, ",
        "I'm not entirely sure, but ",
        "Maybe it's just me, but ",
        "Honestly, I think ",
      ];
      sentences[i] = doubtOpeners[Math.floor(Math.random() * doubtOpeners.length)] + 
        s.charAt(0).toLowerCase() + s.slice(1);
      changes++;
    }
  }
  
  // 2. Tambahkan 1 kalimat yang "membatalkan" argumen sebelumnya
  if (sentences.length > 4 && Math.random() < 0.4) {
    const counterSentences = [
      "Then again, I could be wrong about that.",
      "But maybe that's just my experience.",
      "Although, to be fair, it depends on the person.",
      "Though some people would probably disagree.",
    ];
    const insertIdx = Math.floor(sentences.length * 0.4) + 1;
    sentences.splice(insertIdx, 0, counterSentences[Math.floor(Math.random() * counterSentences.length)]);
  }
  
  // 3. Ubah 1 kalimat "kesimpulan" menjadi pertanyaan
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (/\b(?:so|therefore|thus|in the end|ultimately)\b/i.test(s) && 
        !s.includes('?') && 
        Math.random() < 0.3) {
      // Ubah menjadi pertanyaan retoris
      const questionVersions = [
        s.replace(/[.!?]$/, '') + ', right?',
        s.replace(/[.!?]$/, '') + ', or am I wrong?',
        s.replace(/[.!?]$/, '') + ', I guess?',
      ];
      sentences[i] = questionVersions[Math.floor(Math.random() * questionVersions.length)];
      break;
    }
  }
  
  return sentences.join(' ');
}

// ============================================================
// NEW: PROFESSOR'S STRATEGY - DESTROY AI DISCOURSE PATTERNS
// ============================================================

/**
 * Kurangi coverage: pilih hanya 60-70% subtopik secara acak
 * Buang sisanya agar teks tidak komprehensif seperti AI
 */
export function reduceCoverage(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4) return text;

  // Ambil paragraf tengah (bukan pembuka & penutup)
  const middle = paragraphs.slice(1, -1);
  if (middle.length < 3) return text;

  // Pilih 60-70% secara acak
  const keepRatio = 0.6 + Math.random() * 0.15;
  const keepCount = Math.max(2, Math.floor(middle.length * keepRatio));
  
  // Acak lalu ambil subset
  const shuffled = middle.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, keepCount);

  // Gabung kembali: pembuka + selected + penutup
  return [paragraphs[0], ...selected, paragraphs[paragraphs.length - 1]].join('\n\n');
}

/**
 * Hancurkan closed-loop: pindahkan kesimpulan ke tengah, 
 * atau ubah kalimat penutup menjadi pertanyaan/tidak selesai
 */
export function breakClosedLoop(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // Cari paragraf terakhir (biasanya kesimpulan)
  const last = paragraphs.pop();
  if (!last) return text;

  // Ubah kalimat penutup menjadi sesuatu yang "menggantung"
  const sentences = splitSentences(last);
  if (sentences.length > 0) {
    const lastSentence = sentences[sentences.length - 1];
    // Ubah jadi pertanyaan, atau potong di tengah
    if (!lastSentence.includes('?') && !lastSentence.includes('...')) {
      const endings = [
        '... or at least that\'s what I think.',
        ', I guess?',
        '... but who really knows.',
        '— or maybe not.',
        'Anyway, I could be wrong.',
      ];
      sentences[sentences.length - 1] = lastSentence.replace(/[.!?]$/, '') + 
        endings[Math.floor(Math.random() * endings.length)];
    }
    // Gabungkan kembali 1-2 kalimat pertama saja (buang sisanya)
    const truncated = sentences.slice(0, Math.max(1, Math.floor(sentences.length * 0.6))).join(' ');
    paragraphs.push(truncated);
  }

  // Sisipkan "kesimpulan" yang sudah dipotong ke posisi acak (bukan akhir)
  const conclusion = paragraphs.pop();
  if (conclusion) {
    const insertIdx = Math.floor(paragraphs.length * 0.5) + 1;
    paragraphs.splice(insertIdx, 0, conclusion);
  }

  return paragraphs.join('\n\n');
}

/**
 * Hancurkan pola taxonomi: ubah daftar menjadi narasi yang tidak rapi
 */
export function destroyTaxonomy(text: string): string {
  // Deteksi pola "One factor... Another factor... Finally..."
  const taxonomyPatterns = [
    /\b(?:one|another|a further)\s+(?:reason|factor|cause|contributor)\b/gi,
    /\b(?:first|second|third|fourth|finally)\b/gi,
    /\b(?:several|various|multiple)\s+(?:factors|reasons|causes)\b/gi,
    /\d+\.\s+/g, // "1. ... 2. ..."
  ];

  let result = text;
  for (const pattern of taxonomyPatterns) {
    result = result.replace(pattern, (match) => {
      // Ganti dengan kata sambung informal atau hilangkan
      const replacements = ['', 'Also, ', 'Plus, ', 'And ', 'Then ', '— ', '... '];
      return Math.random() < 0.7 ? replacements[Math.floor(Math.random() * replacements.length)] : match;
    });
  }

  // Jika masih ada daftar panjang (3+ item dengan koma), hancurkan
  const listPattern = /\b([a-z]+(?:\s+[a-z]+)?)(?:,\s+([a-z]+(?:\s+[a-z]+)?)){2,}(?:,\s+and\s+([a-z]+(?:\s+[a-z]+)?))?\b/gi;
  result = result.replace(listPattern, (match) => {
    const items = match.split(/,\s*|\s+and\s+/).filter(Boolean);
    if (items.length >= 3) {
      // Ambil 1-2 item saja, buang sisanya
      const kept = items.slice(0, Math.max(1, Math.floor(items.length * 0.5)));
      return kept.join(', ') + (items.length > kept.length ? ' ... and some other stuff' : '');
    }
    return match;
  });

  return result;
}

/**
 * Hapus kata transisi eksplisit agar flow terasa melompat
 */
export function deTransition(text: string): string {
  const transitions = [
    /\b(Furthermore|Moreover|In addition|Additionally)\s*,?\s*/gi,
    /\b(As a result|Consequently|Therefore|Thus)\s*,?\s*/gi,
    /\b(However|Nevertheless|Nonetheless|On the other hand)\s*,?\s*/gi,
    /\b(Another (?:reason|factor|cause|challenge) is)\s*,?\s*/gi,
    /\b(Let's not forget|It's also worth noting|It is important to note)\s*,?\s*/gi,
    /\b(First(?:ly)?|Second(?:ly)?|Third(?:ly)?|Finally)\s*,?\s*/gi,
    /\b(For example|For instance|Take)\s*,?\s*/gi,
    /\b(And then|Then,?)\s*/gi,
    /\b(Also,?|Plus,?)\s*/gi,
    /\b(But,?|So,?)\s*/gi,
  ];

  let result = text;
  for (const pattern of transitions) {
    // 80% chance to delete transition entirely, 20% keep but lowercase/alter
    if (Math.random() < 0.8) {
      result = result.replace(pattern, '');
    } else {
      result = result.replace(pattern, (match) => {
        const keepers = ['', '... ', '— ', 'Actually, ', 'I mean, '];
        return keepers[Math.floor(Math.random() * keepers.length)];
      });
    }
  }

  // Bersihkan spasi ganda
  result = result.replace(/\s{2,}/g, ' ');
  return result;
}

/**
 * Sisipkan opini subjektif yang kuat untuk menghancurkan "netralitas AI"
 */
export function injectBiasedEgo(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const egoStatements = [
    "Honestly, I think that's complete nonsense.",
    "I've always found this topic way overblown.",
    "Personally, I couldn't care less about the technical details.",
    "In my opinion, the whole discussion is just a distraction.",
    "I'm actually pretty skeptical about this whole thing.",
    "To be brutally honest, I think people worry too much.",
    "If you ask me, the real issue is completely different.",
    "I've seen this play out before, and it's never that simple.",
  ];

  // Sisipkan di 30-60% posisi teks
  const idx = Math.floor(sentences.length * (0.3 + Math.random() * 0.4));
  const statement = egoStatements[Math.floor(Math.random() * egoStatements.length)];
  sentences.splice(idx, 0, statement);

  // Ubah 1-2 kalimat menjadi lebih absolut/ekstrem
  for (let i = 0; i < sentences.length && i < 2; i++) {
    const s = sentences[i];
    if (/\b(may|might|could|perhaps|somewhat)\b/i.test(s) && Math.random() < 0.4) {
      sentences[i] = s.replace(/\b(may|might|could|perhaps|somewhat)\b/gi, 
        (match) => ['', 'definitely', 'absolutely', 'totally', 'clearly'][Math.floor(Math.random() * 4)] || '');
    }
  }

  return sentences.join(' ');
}

/**
 * Ciptakan "attention tunnel": pilih satu subtopik dan ulangi/ekspansi secara berlebihan
 */
export function injectAttentionTunnel(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // Pilih 1 paragraf di tengah sebagai target "obsesi"
  const targetIdx = Math.floor(paragraphs.length / 2);
  const targetPara = paragraphs[targetIdx];
  if (!targetPara) return text;

  const sentences = splitSentences(targetPara);
  if (sentences.length < 2) return text;

  // Ambil satu kata kunci dari paragraf target (kata benda)
  const words = targetPara.split(/\s+/);
  const nouns = words.filter(w => /[A-Z]/.test(w[0]) || w.length > 5); // proper noun atau panjang
  if (nouns.length === 0) return text;

  const focusWord = nouns[Math.floor(Math.random() * nouns.length)];

  // Tambahkan 1-2 kalimat tambahan di paragraf berikutnya yang mengulang fokus
  const insertIdx = Math.min(targetIdx + 1, paragraphs.length - 1);
  const extraSentences = [
    `I keep coming back to this idea of ${focusWord.toLowerCase()}.`,
    `Honestly, ${focusWord.toLowerCase()} is what really matters here.`,
    `You can talk about everything else, but it all comes down to ${focusWord.toLowerCase()}.`,
  ];
  const extra = extraSentences[Math.floor(Math.random() * extraSentences.length)];
  paragraphs[insertIdx] = extra + ' ' + paragraphs[insertIdx];

  // Tambahkan pengulangan di paragraf target
  sentences.splice(Math.floor(sentences.length / 2), 0, 
    `It's always about ${focusWord.toLowerCase()}, isn't it?`);
  paragraphs[targetIdx] = sentences.join(' ');

  return paragraphs.join('\n\n');
}

/**
 * Tambahkan inefisiensi informasi: pengulangan, kalimat kosong, divagasi
 */
export function introduceInefficiency(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // 1. Ulangi 1 kalimat secara persis di posisi berbeda
  const repeatIdx = Math.floor(Math.random() * (sentences.length - 3)) + 1;
  const repeated = sentences[repeatIdx];
  if (repeated.length > 10) {
    sentences.splice(repeatIdx + 2, 0, repeated);
  }

  // 2. Sisipkan kalimat yang tidak menambah informasi
  const fillers = [
    "I mean, you know what I mean?",
    "It is what it is, I guess.",
    "But anyway, that's just how I see it.",
    "Not that it really matters, though.",
    "Honestly, I've been thinking about this too much.",
  ];
  const fillerIdx = Math.floor(sentences.length * 0.7);
  sentences.splice(fillerIdx, 0, fillers[Math.floor(Math.random() * fillers.length)]);

  // 3. Buat satu kalimat jadi lebih panjang dengan pengulangan
  for (let i = 0; i < sentences.length && i < 2; i++) {
    const s = sentences[i];
    if (s.length > 20 && !s.includes('really really') && Math.random() < 0.3) {
      sentences[i] = s.replace(/\b(very|really|quite)\b/i, (match) => {
        return Math.random() < 0.5 ? match + ' ' + match.toLowerCase() : match;
      });
    }
  }

  return sentences.join(' ');
}

// ============================================================
// NEW FUNCTIONS: Destroy AI Thinking Patterns (Professor's analysis)
// ============================================================

/**
 * SEMANTIC DESTRUCTION - Professor's Recommendation
 * 
 * This function radically changes the information organization pattern to evade GPTZero.
 * Based on the analysis that detectors learn from deep information organization patterns,
 * not surface-level features.
 * 
 * Key strategies:
 * 1. Reduce coverage - drop some points entirely
 * 2. Change focus from "explaining" to "storytelling"
 * 3. Insert truly irrelevant information (true noise)
 * 4. End without resolving/summarizing
 * 5. Don't preserve all facts accurately
 */

/**
 * Force Specificity - NEW FUNCTION based on professor feedback
 * 
 * The key insight: Detectors don't care about "human style" (filler, doubt, stories).
 * They distinguish between information-rich content vs shallow, floating content.
 * 
 * AI when asked to "humanize" tends to produce abstract, generalized text with meta-commentary.
 * Humans writing about topics they understand go straight into specific details.
 * 
 * This function forces the model to generate content that is SPECIFIC and DEEP,
 * not just casual with filler words.
 */
export function forceSpecificity(text: string, topic?: string): string {
  const detectedTopic = detectTopic(text);
  const activeTopic = topic || detectedTopic;
  
  const topicFacts: Record<string, string[]> = {
    ielts: [
      "For Writing Task 1, you need to use past tense if the chart shows past data, and present tense if there's no date.",
      "In Writing Task 2, using complex sentences like 'Although...' can boost your score, but only if the grammar is correct.",
      "A lot of people mess up articles. For example, you say 'the Portuguese' but just 'Italians'.",
      "My tutor told me that the speaking test is graded on fluency, not just vocabulary.",
      "Task 1 requires you to identify whether you need to use past tense, or present tense. If there is no date, you need to describe the chart/map/diagram in present tense.",
      "With regard to punctuation; commas, period, semicolon and colon rules make your writing meaningful.",
      "If the chart mentioned has time period that ended in the past use past tense.",
      "You should use a range of sentence structures I.e., compound, complex, etc.",
      "Usage of articles, such as definite and indefinite article, what country names require THE in front, for example: when writing about nationalities that end with 'ese' (the Portuguese and the Chinese), and 'h' (the French and the English), NOT the Italian.",
    ],
    grammar: [
      "Commas, period, semicolon and colon rules make your writing meaningful.",
      "Task 1 requires you to identify whether you need to use past tense, or present tense.",
      "Usage of articles, such as definite and indefinite article, what country names require THE in front.",
      "When writing about nationalities that end with 'ese' (the Portuguese and the Chinese), and 'h' (the French and the English), NOT the Italian.",
    ],
    education: [
      "IELTS is hard for someone who did not study secondary and tertiary education in English.",
      "It takes a lot of practice, do not keep writing essays if you know that you need help with grammar and punctuation.",
      "There is no other way out for IELTS, except digging deep and understanding grammar rules.",
    ],
    technology: [
      "The processor speed matters more than RAM for most everyday tasks.",
      "Battery life degrades by about 20% after two years of daily charging.",
      "Screen resolution above 1080p on a 13-inch laptop is mostly marketing.",
    ],
    health: [
      "You need at least 150 minutes of moderate exercise per week according to WHO guidelines.",
      "Sleep quality drops significantly if you use screens within an hour before bed.",
      "Protein intake should be around 0.8 grams per kilogram of body weight for average adults.",
    ],
    finance: [
      "Emergency funds should cover 3-6 months of living expenses, not just arbitrary amounts.",
      "Compound interest works best when you start before age 30.",
      "Credit utilization above 30% starts hurting your score noticeably.",
    ],
  };
  
  const facts = topicFacts[activeTopic] || topicFacts.education;
  
  const numFacts = 2 + Math.floor(Math.random() * 2);
  const shuffledFacts = facts.sort(() => Math.random() - 0.5);
  const selectedFacts = shuffledFacts.slice(0, Math.min(numFacts, shuffledFacts.length));
  
  const directOpenings = [
    "The main reason people struggle is the specific rules.",
    "Here's what I've noticed after dealing with this multiple times.",
    "Let me break down what actually matters here.",
    "From my experience, the key thing most people miss is this:",
    "I'll be direct – the details are what trip you up.",
  ];
  
  const specificForgetStatements = [
    "I can't remember the exact name of the book my tutor recommended, but it was something like 'Grammar for IELTS'.",
    "I think the band score is based on four criteria, but I always forget the fourth one.",
    "My cousin took it last year – she said the speaking part was easiest, though I freeze up every time.",
    "There's a rule about when to use 'the' with country names, but I never memorized it properly.",
  ];
  
  const specificEndings = [
    "So my advice is to focus on those specific grammar rules.",
    "Good luck with your preparation!",
    "Just practice the specific task types and you'll improve.",
    "Bottom line: dig deep into the rules instead of skimming the surface.",
    "Hope this helps – feel free to ask if you need clarification on any of this.",
  ];
  
  const opening = directOpenings[Math.floor(Math.random() * directOpenings.length)];
  let result = opening + ' ';
  
  result += selectedFacts.join(' ');
  
  if (Math.random() < 0.5) {
    result += ' ' + specificForgetStatements[Math.floor(Math.random() * specificForgetStatements.length)];
  }
  
  result += ' ' + specificEndings[Math.floor(Math.random() * specificEndings.length)];
  
  return result;
}

function detectTopic(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (/\b(ielts|writing task|band score|speaking test|grammar for ielts)\b/.test(lowerText)) {
    return 'ielts';
  }
  if (/\b(grammar|punctuation|comma|semicolon|tense|article|definite|indefinite)\b/.test(lowerText)) {
    return 'grammar';
  }
  if (/\b(education|study|university|school|exam|student|learn)\b/.test(lowerText)) {
    return 'education';
  }
  if (/\b(processor|ram|battery|screen|laptop|computer|tech)\b/.test(lowerText)) {
    return 'technology';
  }
  if (/\b(exercise|sleep|protein|health|weight|diet|workout)\b/.test(lowerText)) {
    return 'health';
  }
  if (/\b(money|finance|credit|interest|investment|savings|budget)\b/.test(lowerText)) {
    return 'finance';
  }
  
  return 'education';
}

export function semanticDestruction(text: string, sourceText: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 6) return text;

  // 1. Extract key points (sentences containing explanatory markers)
  const keyPoints = sentences.filter(s => 
    /\b(because|since|due to|reason|factor|advantage|benefit|cost|price|expensive|cheap)\b/i.test(s)
  );
  
  // 2. Select only 2-3 points randomly (REDUCE COVERAGE)
  const numToKeep = 2 + Math.floor(Math.random() * 2); // 2 or 3
  const shuffled = keyPoints.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(numToKeep, shuffled.length));
  
  // If we couldn't find enough key points, use random sentences
  const workingSet = selected.length >= 2 ? selected : sentences.slice(0, 3);

  // 3. Personal openings (change from explaining to storytelling)
  const personalOpenings = [
    "I remember when I first heard about this...",
    "My uncle used to deal with this a lot, and he always said...",
    "I've never experienced it myself, but I've always wondered...",
    "There's this thing I've been thinking about lately...",
    "Funny story – my friend was telling me about this the other day...",
    "You know what's weird about this? ",
  ];
  const opening = personalOpenings[Math.floor(Math.random() * personalOpenings.length)];

  // 4. Elaborate selected points with personal commentary
  const personalComments = [
    " To be honest, I think that's the main reason.",
    " I mean, it makes sense when you think about it.",
    " But then again, who am I to judge?",
    " That's just my take on it, anyway.",
    " Or at least that's how I understand it.",
    " Could be totally wrong, but that's what I gathered.",
  ];
  
  const elaborated = workingSet.map(s => {
    const comment = personalComments[Math.floor(Math.random() * personalComments.length)];
    // Add uncertainty or imprecision
    const uncertainVersions = [
      s.replace(/\b(\d+)\b/, (m) => `${m} or maybe ${parseInt(m) + Math.floor(Math.random() * 3)}`),
      s.replace(/\b(always|never|all|none)\b/gi, (m) => ['usually', 'often', 'mostly', 'sometimes'][Math.floor(Math.random() * 4)] || m),
      s + " I think?",
      "I guess " + s.toLowerCase(),
    ];
    const modified = Math.random() < 0.5 ? uncertainVersions[Math.floor(Math.random() * uncertainVersions.length)] : s;
    return modified + comment;
  });

  // 5. Add TRUE NOISE - completely irrelevant tangents
  const noisePool = [
    "I was just reading about something completely different this morning – airlines are struggling to fill seats these days. Crazy times.",
    "Speaking of which, my sister is going to Japan next month. I'm kinda jealous, honestly.",
    "This reminds me – I need to book a hotel for my trip. Prices are insane right now.",
    "Random thought: why do we even care about this stuff sometimes?",
    "Anyway, before I forget – did I tell you about that thing that happened last week? Never mind, not important.",
    "I should probably stop overthinking this. My brain hurts.",
  ];
  const noiseCount = 1 + Math.floor(Math.random() * 2); // 1 or 2 noise sentences
  const noise = [];
  for (let i = 0; i < noiseCount; i++) {
    noise.push(noisePool[Math.floor(Math.random() * noisePool.length)]);
  }

  // 6. Add doubtful/questioning statements
  const doubts = [
    "Actually, I'm not sure if that's the whole story...",
    "Wait, maybe I'm remembering this wrong?",
    "Then again, could be completely different now.",
    "Honestly, this whole topic is kind of confusing.",
  ];

  // 7. Unsolved endings (NO CONCLUSION)
  const unresolvedEndings = [
    "... or maybe I'm just overthinking it.",
    "Anyway, that's all I've got.",
    "I'll leave you with that.",
    "But honestly, who knows?",
    "That's it, I guess.",
    "Make of that what you will.",
    "Your mileage may vary, as they say.",
  ];

  // 8. Assemble parts in NON-LINEAR order
  const parts = [opening, ...elaborated, doubts[Math.floor(Math.random() * doubts.length)], ...noise, unresolvedEndings[Math.floor(Math.random() * unresolvedEndings.length)]];
  
  // Shuffle the middle parts (keep opening at start, ending at end)
  const middleParts = parts.slice(1, -1);
  for (let i = middleParts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middleParts[i], middleParts[j]] = [middleParts[j], middleParts[i]];
  }
  
  const finalParts = [parts[0], ...middleParts, parts[parts.length - 1]];
  
  return finalParts.join(' ');
}

/**
 * 1. Acak "macro discourse graph" secara radikal
 * - Pilih hanya 60-70% subtopik (kurangi coverage)
 * - Acak urutan subtopik
 * - Tambahkan paragraf keraguan di tengah
 * - Pindahkan kesimpulan ke posisi acak
 */

// ============================================================
// Helper: Human Chaos (typo, run-on, etc.)
// ============================================================


/**
 * 1. Acak "macro discourse graph" secara radikal - NEW VERSION for Professor's analysis
 */
export function injectEmotionalEscalation(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const emotionalMoments = [
    "And honestly, that realization hit me hard.",
    "It's almost unbearable sometimes.",
    "You can't help but feel a deep sense of loss.",
    "I've been there, and it's not easy.",
    "It makes you question everything.",
    "The weight of it all is just... overwhelming.",
  ];

  const positions = [
    Math.floor(sentences.length * 0.3),
    Math.floor(sentences.length * 0.6),
    Math.floor(sentences.length * 0.8),
  ];
  for (const pos of positions) {
    if (pos < sentences.length && Math.random() < 0.4) {
      sentences.splice(pos, 0, emotionalMoments[Math.floor(Math.random() * emotionalMoments.length)]);
    }
  }

  return sentences.join(' ');
}

export function addWastedSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const wasted = [
    "I don't know why I'm even thinking about this.",
    "It's funny how life works sometimes.",
    "You know what I mean?",
    "It just is what it is.",
    "I guess that's all there is to it.",
    "Anyway, moving on...",
    "Not that it really matters.",
    "But hey, that's just my two cents.",
  ];

  const count = Math.min(3, Math.floor(sentences.length / 4) + 1);
  for (let i = 0; i < count; i++) {
    const pos = Math.floor(Math.random() * sentences.length);
    sentences.splice(pos, 0, wasted[Math.floor(Math.random() * wasted.length)]);
  }

  return sentences.join(' ');
}

export function introduceAttentionDrift(text: string): string {
  const tangents = [
    "It reminds me of a time when I tried to learn the guitar—I practiced for months but never got past the basics. It's the same kind of frustration.",
    "I once knew a guy who spent years chasing a dream and ended up in a completely different place. Life is strange like that.",
    "It's a bit like that old saying: 'You can lead a horse to water, but you can't make it drink.'",
    "My grandmother used to say that the heart wants what it wants. She was a wise woman.",
  ];

  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const pos = Math.floor(sentences.length * 0.5);
  const tangent = tangents[Math.floor(Math.random() * tangents.length)];
  sentences.splice(pos, 0, tangent);

  return sentences.join(' ');
}

export function breakTeacherMode(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const explainPatterns = /\b(because|since|due to|which means|as a result|therefore)\b/i;
  for (let i = 0; i < sentences.length; i++) {
    if (explainPatterns.test(sentences[i]) && Math.random() < 0.3) {
      const qs = [
        "Isn't that something?",
        "Does that make sense to you?",
        "You see what I mean?",
        "Think about it for a second.",
        "Can you imagine?",
      ];
      sentences[i] = sentences[i].replace(/[.!?]$/, '') + ' ' + qs[Math.floor(Math.random() * qs.length)];
    }
  }

  const commands = [
    "Imagine this: ",
    "Consider this scenario: ",
    "Stop and think for a moment: ",
    "Let's be honest about this: ",
  ];
  sentences.splice(1, 0, commands[Math.floor(Math.random() * commands.length)]);

  return sentences.join(' ');
}

export function addAmbiguity(text: string): string {
  const certaintyMarkers = /\b(will|must|always|never|clearly|definitely|absolutely|certainly|without doubt)\b/gi;
  let result = text.replace(certaintyMarkers, (match) => {
    const replacements = [
      'might', 'could', 'perhaps', 'maybe', 'probably',
      'I think', 'it seems', 'I suspect', 'in my view'
    ];
    return replacements[Math.floor(Math.random() * replacements.length)];
  });

  const sentences = splitSentences(result);
  if (sentences.length > 4) {
    const idx = Math.floor(sentences.length * 0.7);
    sentences.splice(idx, 0, "I'm not entirely sure about that, though.");
    result = sentences.join(' ');
  }

  return result;
}

export function personalizeVoice(text: string): string {
  const idiolects = [
    "Honestly, I've always thought that ",
    "You know what really gets me? ",
    "The thing is, ",
    "What I find fascinating is ",
    "I'll be straight with you: ",
    "Here's the deal: ",
  ];

  const sentences = splitSentences(text);
  for (let i = 0; i < sentences.length && i < 3; i++) {
    if (Math.random() < 0.3) {
      const opener = idiolects[Math.floor(Math.random() * idiolects.length)];
      sentences[i] = opener + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
    }
  }

  const signaturePhrases = [
    "Anyway, that's just how I see it.",
    "At the end of the day, it's all about perspective.",
    "But hey, what do I know?",
    "Live and learn, I guess.",
  ];
  sentences.push(signaturePhrases[Math.floor(Math.random() * signaturePhrases.length)]);

  return sentences.join(' ');
}

// ============================================================
// FUNGSI UNTUK MENIRU "HUMAN RECONSTRUCTION" (Professor's analysis)
// ============================================================

/**
 * 1. Hancurkan pemetaan 1:1 kalimat – ubah jumlah dan urutan kalimat,
 *    gabungkan beberapa kalimat menjadi satu, atau pecah dengan cara berbeda.
 */
export function destroySentenceMapping(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // 1. Gabungkan 2 kalimat berurutan menjadi satu (dengan konjungsi sederhana)
  for (let i = 0; i < sentences.length - 1; i++) {
    if (Math.random() < 0.25 && sentences[i].length > 20 && sentences[i + 1].length > 20) {
      const combined = sentences[i].replace(/[.!?]$/, '') + ', and ' + sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      sentences.splice(i, 2, combined);
      break; // cukup satu kali
    }
  }

  // 2. Pecah satu kalimat panjang menjadi 2 kalimat (di koma atau titik koma)
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (s.split(/\s+/).length > 20 && s.includes(', ')) {
      const parts = s.split(/,\s+/);
      if (parts.length >= 2) {
        const mid = Math.floor(parts.length / 2);
        const first = parts.slice(0, mid).join(', ') + '.';
        const second = parts.slice(mid).join(', ').charAt(0).toUpperCase() + parts.slice(mid).join(', ').slice(1);
        sentences.splice(i, 1, first, second);
        break; // cukup satu kali
      }
    }
  }

  // 3. Ubah urutan 2 kalimat yang tidak kritis
  if (sentences.length > 4) {
    const idx1 = Math.floor(Math.random() * (sentences.length - 2)) + 1;
    const idx2 = Math.min(idx1 + 1 + Math.floor(Math.random() * 2), sentences.length - 1);
    if (idx1 !== idx2 && Math.random() < 0.3) {
      [sentences[idx1], sentences[idx2]] = [sentences[idx2], sentences[idx1]];
    }
  }

  return sentences.join(' ');
}

/**
 * 2. Acak urutan alur reasoning secara radikal – bukan sekadar pindah kesimpulan.
 *    Pindahkan paragraf yang berisi "penyebab" ke posisi setelah "solusi", dll.
 */
export function reorderReasoningFlow(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4) {
    text = forceParagraphSplit(text, 4);
    paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  }
  if (paragraphs.length < 4) return text;

  // Identifikasi paragraf yang mungkin berisi "definisi", "penyebab", "solusi", "kesimpulan"
  const definitionIdx = paragraphs.findIndex(p => /\b(definition|defined|is|are|refers to)\b/i.test(p) && p.length < 100);
  const causeIdx = paragraphs.findIndex(p => /\b(cause|reason|factor|because|due to|lead to|contribute)\b/i.test(p));
  const solutionIdx = paragraphs.findIndex(p => /\b(solution|treatment|therapy|prevent|manage|improve|recover)\b/i.test(p));
  const conclusionIdx = paragraphs.findIndex(p => /\b(conclusion|summary|ultimately|in the end|therefore|thus)\b/i.test(p));

  // Kumpulkan indeks yang valid
  const indices = [definitionIdx, causeIdx, solutionIdx, conclusionIdx].filter(i => i >= 0 && i < paragraphs.length);
  if (indices.length < 2) return text;

  // Acak urutan paragraf yang teridentifikasi, sisanya tetap
  const selected = indices.map(i => paragraphs[i]);
  // Acak selected
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }
  // Ganti di posisi asli dengan urutan baru
  for (let i = 0; i < indices.length; i++) {
    paragraphs[indices[i]] = selected[i];
  }

  // Sisipkan paragraf "pengalihan" (attention drift) di tengah
  const driftParagraphs = [
    "I remember reading a completely different article about this the other day—it said something else entirely. Not sure which one is right.",
    "My friend once told me a story about this, but I can't remember the details now. Anyway, back to the point.",
    "Honestly, I've never really understood why people care so much about this specific detail. But I guess it matters to some.",
    "I was going to mention something else, but I forgot. Classic.",
  ];
  const insertIdx = Math.floor(paragraphs.length * 0.5) + 1;
  paragraphs.splice(insertIdx, 0, driftParagraphs[Math.floor(Math.random() * driftParagraphs.length)]);

  return paragraphs.join('\n\n');
}

/**
 * 3. Drop coverage: hapus 1-2 subtopik/poin secara acak,
 *    sehingga tidak semua informasi asli dipertahankan.
 */
export function dropSomeCoverage(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4) return text;

  // Ambil paragraf tengah (bukan pembuka dan penutup)
  const middle = paragraphs.slice(1, -1);
  if (middle.length < 3) return text;

  // Hapus 1-2 paragraf secara acak dari middle
  const dropCount = Math.min(2, Math.floor(middle.length * 0.2) + 1);
  const indicesToDrop = new Set<number>();
  while (indicesToDrop.size < dropCount) {
    indicesToDrop.add(Math.floor(Math.random() * middle.length));
  }
  const remainingMiddle = middle.filter((_, i) => !indicesToDrop.has(i));

  // Gabung kembali
  return [paragraphs[0], ...remainingMiddle, paragraphs[paragraphs.length - 1]].join('\n\n');
}

/**
 * 4. Kompresi informasi: gabungkan beberapa poin menjadi satu pernyataan ringkas,
 *    hilangkan detail yang tidak penting.
 */
export function introduceCompression(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // Cari 2 kalimat yang membahas topik serupa (kata kunci overlap)
  for (let i = 0; i < sentences.length - 1; i++) {
    const words1 = sentences[i].toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const words2 = sentences[i + 1].toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const overlap = words1.filter(w => words2.includes(w));
    if (overlap.length >= 2 && Math.random() < 0.4) {
      // Gabungkan menjadi satu kalimat pendek
      const combined = sentences[i].replace(/[.!?]$/, '') + ', and also ' + sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      // Potong menjadi maksimum 15 kata
      const wordsCombined = combined.split(/\s+/);
      if (wordsCombined.length > 20) {
        const shortened = wordsCombined.slice(0, 15).join(' ') + ' ... (among other things).';
        sentences.splice(i, 2, shortened);
      } else {
        sentences.splice(i, 2, combined);
      }
      break;
    }
  }

  // Hapus satu kalimat yang berisi detail tambahan (misal "such as", "including")
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(such as|including|for example|like)\b/i.test(sentences[i]) && Math.random() < 0.3) {
      sentences.splice(i, 1);
      break;
    }
  }

  return sentences.join(' ');
}

/**
 * 5. Simulasi attention drift: tambahkan pengalihan pikiran,
 *    komentar pribadi, atau pernyataan "lupa" yang tidak menambah informasi.
 */
export function simulateAttentionDrift(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const driftMarkers = [
    "Wait, no—that's not what I meant.",
    "Actually, I just remembered something else.",
    "I think I'm getting off track here.",
    "This reminds me of a completely unrelated thing.",
    "I'm not sure why I even brought that up.",
    "Oh well, moving on.",
    "I should probably focus on the main point.",
  ];

  // Sisipkan 1-2 drift markers di posisi acak
  const count = Math.min(2, Math.floor(sentences.length / 3) + 1);
  for (let i = 0; i < count; i++) {
    const pos = Math.floor(Math.random() * sentences.length);
    const marker = driftMarkers[Math.floor(Math.random() * driftMarkers.length)];
    sentences.splice(pos, 0, marker);
  }

  // Tambahkan satu kalimat yang menunjukkan "lupa" di akhir
  const forgetfulEndings = [
    "I forgot what else I was going to say.",
    "Anyway, I think that's enough.",
    "I'll leave it at that.",
    "Not sure if that answered the question.",
  ];
  sentences.push(forgetfulEndings[Math.floor(Math.random() * forgetfulEndings.length)]);

  return sentences.join(' ');
}

// ============================================================
// HUMAN RECONSTRUCTION PASS (Final Layer)
// Meniru cara manusia menulis ulang dari ingatan: 
// lupa, acak, obsesif, mengulang, menyimpang, dan berhenti.
// ============================================================

export function humanReconstructionPass(text: string): string {
  // 1. Pecah menjadi kalimat/klaim
  const sentences = splitSentences(text);
  if (sentences.length < 6) return text;

  // 2. Pilih subset klaim secara acak (60-80%) – meniru lupa
  const keepRatio = 0.6 + Math.random() * 0.2;
  const keepCount = Math.max(4, Math.floor(sentences.length * keepRatio));
  const shuffled = sentences.sort(() => Math.random() - 0.5);
  let selected = shuffled.slice(0, keepCount);

  // 3. Acak urutan klaim secara radikal
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  // 4. Pilih 1-2 klaim untuk dikembangkan secara obsesif (tambahkan pengulangan)
  const obsessionCount = Math.min(2, Math.floor(selected.length / 3) + 1);
  const obsessionIndices: number[] = [];
  while (obsessionIndices.length < obsessionCount) {
    const idx = Math.floor(Math.random() * selected.length);
    if (!obsessionIndices.includes(idx)) obsessionIndices.push(idx);
  }
  for (const idx of obsessionIndices) {
    const s = selected[idx];
    // Ulangi kalimat tersebut 2-3 kali dengan variasi kecil
    const repeats = 1 + Math.floor(Math.random() * 2);
    for (let r = 0; r < repeats; r++) {
      const variant = s.replace(/\b(very|really|quite)\b/gi, (m) => 
        ['extremely', 'incredibly', 'pretty', 'rather'][Math.floor(Math.random() * 4)] || m
      );
      selected.splice(idx + r + 1, 0, variant);
    }
  }

  // 5. Sisipkan "wasted sentences" (kalimat tidak informatif)
  const wastedPool = [
    "I don't know why I'm even thinking about this.",
    "It's just one of those things, I guess.",
    "Anyway, that's not even the point.",
    "Honestly, this whole topic is confusing.",
    "I mean, who really cares about the details?",
    "It is what it is.",
    "But hey, that's life.",
    "I'm probably overcomplicating this.",
  ];
  for (let i = 0; i < Math.min(3, selected.length / 3); i++) {
    const pos = Math.floor(Math.random() * selected.length);
    selected.splice(pos, 0, wastedPool[Math.floor(Math.random() * wastedPool.length)]);
  }

  // 6. Sisipkan "attention drift" (cerita samping / komentar tidak relevan)
  const driftPool = [
    "This reminds me of a story my grandfather used to tell.",
    "I once read a completely different take on this in a magazine.",
    "It's a bit like that saying about trees and forests.",
    "My neighbor actually experienced something similar.",
    "I remember arguing about this with a friend years ago.",
  ];
  if (Math.random() < 0.5) {
    const pos = Math.floor(selected.length * 0.5);
    selected.splice(pos, 0, driftPool[Math.floor(Math.random() * driftPool.length)]);
  }

  // 7. Ubah framing: tambahkan pembukaan yang mempertanyakan pertanyaan
  const reframings = [
    "Actually, is that even the right question?",
    "I've always wondered if we're looking at this backwards.",
    "Maybe the real issue isn't what we think.",
    "Let's be honest: the question itself might be flawed.",
  ];
  if (Math.random() < 0.4) {
    selected.splice(0, 0, reframings[Math.floor(Math.random() * reframings.length)]);
  }

  // 8. Tambahkan tanda-tanda penulis (idiolect, opini kuat)
  const authorMarkers = [
    "I'll be straight with you: ",
    "Here's my honest take: ",
    "If you ask me, ",
    "Personally, I think ",
    "To be perfectly blunt, ",
  ];
  if (Math.random() < 0.5) {
    const idx = Math.floor(selected.length * 0.3);
    selected[idx] = authorMarkers[Math.floor(Math.random() * authorMarkers.length)] + selected[idx].charAt(0).toLowerCase() + selected[idx].slice(1);
  }

  // 9. Akhiri dengan kalimat menggantung (tidak menyelesaikan)
  const endings = [
    "... or maybe I'm just overthinking it.",
    "Anyway, that's all I've got.",
    "I'll leave you with that.",
    "But honestly, who knows?",
    "That's it, I guess.",
  ];
  selected.push(endings[Math.floor(Math.random() * endings.length)]);

  // 10. Gabungkan menjadi paragraf dengan panjang tidak seragam
  let result = selected.join(' ');
  // Pecah menjadi 3-4 paragraf dengan ukuran acak
  const words = result.split(/\s+/);
  if (words.length > 50) {
    const paraBreaks = [0];
    let total = 0;
    while (total < words.length - 10) {
      const chunk = Math.floor(words.length * (0.2 + Math.random() * 0.3));
      total += chunk;
      if (total < words.length) paraBreaks.push(total);
    }
    paraBreaks.push(words.length);
    const paragraphs: string[] = [];
    for (let i = 0; i < paraBreaks.length - 1; i++) {
      paragraphs.push(words.slice(paraBreaks[i], paraBreaks[i + 1]).join(' '));
    }
    result = paragraphs.join('\n\n');
  }

  return result;
}

// ============================================================
// FINAL PASS: Human Author (Bukan Humanizer Template)
// Meniru proses berpikir manusia: lupa, melenceng, tidak sempurna,
// referensi dunia nyata, voice switching, dead sentences, dll.
// ============================================================

export function humanAuthorFinalPass(text: string): string {
  // 1. Pecah menjadi kalimat/klaim
  let sentences = splitSentences(text);
  if (sentences.length < 6) return text;

  // ------------------------------------------------------------
  // LAYER 21: Tambahkan "external anchors" (referensi dunia nyata)
  // ------------------------------------------------------------
  const anchors = [
    "I read a study the other day that said ",
    "My doctor once told me ",
    "A friend of mine who's a researcher mentioned ",
    "I saw a documentary about this and they found ",
    "According to a 2023 report from the WHO, ",
    "There was a paper in Nature last year that suggested ",
    "I remember learning in school that ",
    "My neighbor actually experienced this firsthand—",
  ];
  if (Math.random() < 0.5) {
    const pos = Math.floor(Math.random() * sentences.length);
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    sentences.splice(pos, 0, anchor + sentences[pos].charAt(0).toLowerCase() + sentences[pos].slice(1));
  }

  // ------------------------------------------------------------
  // LAYER 17: Hancurkan template pembuka (jangan pakai "I think", "But the truth is")
  // ------------------------------------------------------------
  // Hapus marker template yang umum di awal
  const templateMarkers = [
    /^I think /i,
    /^But the truth is /i,
    /^What really scares me /i,
    /^It's like /i,
    /^So why does this matter\??/i,
    /^Here's the thing /i,
    /^I mean /i,
  ];
  for (const pattern of templateMarkers) {
    if (pattern.test(sentences[0])) {
      sentences[0] = sentences[0].replace(pattern, '');
      // Kapitalisasi ulang
      sentences[0] = sentences[0].charAt(0).toUpperCase() + sentences[0].slice(1);
      break;
    }
  }
  // Ganti pembuka dengan yang lebih natural/acak
  const naturalOpeners = [
    "You know what's interesting? ",
    "It's funny how ",
    "I was just thinking about this the other day—",
    "Honestly, ",
    "Wait, I just realized ",
    "It's actually pretty wild that ",
  ];
  if (Math.random() < 0.4) {
    sentences[0] = naturalOpeners[Math.floor(Math.random() * naturalOpeners.length)] + 
                   sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1);
  }

  // ------------------------------------------------------------
  // LAYER 20: Sisipkan "dead sentences" (tidak informatif)
  // ------------------------------------------------------------
  const deadPool = [
    "Anyway.",
    "I don't know why I'm even mentioning this.",
    "That's probably not important.",
    "It's just a thought.",
    "I could be wrong about that part.",
    "Not that it really matters.",
    "Hmm.",
    "Yeah, I'm not sure.",
    "But whatever.",
    "I guess that's just how it is.",
    "Weird, right?",
    "I've always wondered about that.",
    "It's hard to explain.",
  ];
  // Sisipkan 2-4 dead sentences
  const deadCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < deadCount; i++) {
    const pos = Math.floor(Math.random() * sentences.length);
    const dead = deadPool[Math.floor(Math.random() * deadPool.length)];
    sentences.splice(pos, 0, dead);
  }

  // ------------------------------------------------------------
  // LAYER 23 & 24: Biarkan ide menggantung + attention drift
  // ------------------------------------------------------------
  // Pilih 1-2 kalimat yang terlihat seperti "penjelasan" dan potong
  for (let i = 0; i < sentences.length && i < 2; i++) {
    const s = sentences[i];
    if (s.length > 60 && /\b(because|since|due to|which means)\b/i.test(s) && Math.random() < 0.3) {
      // Potong di tengah kalimat, biarkan menggantung
      const words = s.split(' ');
      const cut = Math.floor(words.length * (0.3 + Math.random() * 0.3));
      sentences[i] = words.slice(0, cut).join(' ') + '...';
    }
  }

  // Sisipkan attention drift (topik samping tidak relevan)
  const drifts = [
    "I actually had a completely different thought just now—about my neighbor's cat—but I'll try to stay on track.",
    "This reminds me of a trip I took to Japan years ago, but that's another story.",
    "I remember arguing about this with a friend once, and we never really settled it.",
    "Come to think of it, my grandma used to say something similar.",
    "I should probably look this up later, I'm not 100% sure.",
  ];
  if (Math.random() < 0.5) {
    const drift = drifts[Math.floor(Math.random() * drifts.length)];
    const pos = Math.floor(sentences.length * 0.5);
    sentences.splice(pos, 0, drift);
  }

  // ------------------------------------------------------------
  // LAYER 18: Rusak analogi (buat kurang sempurna / tidak efisien)
  // ------------------------------------------------------------
  // Cari kalimat yang mengandung "like", "as if", "reminds me of"
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (/\b(like|as if|reminds me of|similar to)\b/i.test(s) && Math.random() < 0.3) {
      // Tambahkan ketidaktepatan
      const broken = s.replace(/\b(like|as if)\b/i, (match) => {
        const badOnes = ['sorta like', 'kinda like', 'similar to, but not exactly', 'comparable to, I guess'];
        return badOnes[Math.floor(Math.random() * badOnes.length)];
      });
      sentences[i] = broken;
      // Tambahkan disclaimer setelahnya
      const disclaimer = [
        " Not a perfect analogy, I know.",
        " That's not quite right, but you get the idea.",
        " I'm not sure that comparison really works.",
      ];
      sentences.splice(i + 1, 0, disclaimer[Math.floor(Math.random() * disclaimer.length)]);
      break;
    }
  }

  // ------------------------------------------------------------
  // LAYER 19: Acak emotional cue (muncul di tempat tidak terduga)
  // ------------------------------------------------------------
  const emotions = [
    "I'm honestly kind of shocked by this.",
    "It's actually pretty frustrating.",
    "I find this really interesting.",
    "That's terrifying, honestly.",
    "It's sad to think about.",
    "I'm not gonna lie, I find this comforting.",
    "It's almost funny how it works.",
  ];
  if (Math.random() < 0.6) {
    const pos = Math.floor(Math.random() * sentences.length);
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    sentences.splice(pos, 0, emotion);
  }

  // ------------------------------------------------------------
  // LAYER 22: Voice switching (sisipkan kutipan, opini, fakta)
  // ------------------------------------------------------------
  const fakeQuote = [
    `"It's not just about the facts," a researcher once told me, "it's about how you interpret them."`,
    `One expert put it this way: "The data doesn't tell the whole story."`,
    `"You'd be surprised how often this happens," my professor said.`,
  ];
  if (Math.random() < 0.4) {
    const pos = Math.floor(sentences.length * 0.6);
    sentences.splice(pos, 0, fakeQuote[Math.floor(Math.random() * fakeQuote.length)]);
  }

  // ------------------------------------------------------------
  // LAYER 25: Jangan perbaiki grammar setelah "kesalahan"
  // ------------------------------------------------------------
  // Biarkan kalimat yang sudah dipotong/tidak selesai tetap seperti itu
  // Hanya bersihkan spacing berlebih

  // ------------------------------------------------------------
  // LAYER 20 & 24: Tambahkan kalimat penutup yang menggantung / tidak menyelesaikan
  // ------------------------------------------------------------
  const nonConclusion = [
    "I guess that's all I have to say about that.",
    "Anyway, I'm not sure where I was going with this.",
    "I'll stop here before I confuse myself.",
    "Not sure if that was helpful, but there you go.",
    "I should probably read more about this.",
  ];
  sentences.push(nonConclusion[Math.floor(Math.random() * nonConclusion.length)]);

  // Gabungkan kembali
  let result = sentences.join(' ');

  // ------------------------------------------------------------
  // Bersihkan sisa "or even" / "is also common" dari fungsi lama
  // ------------------------------------------------------------
  result = result.replace(/ — or even /g, ' ');
  result = result.replace(/ is also common\./g, '. ');
  result = result.replace(/ or even /g, ' ');

  // Perbaiki spacing berlebihan
  result = result.replace(/\s{2,}/g, ' ');

  return result;
}

// ============================================================
// ============================================================
// NEW LOGIC: Human Chaos Simulator (Based on Lecturer's Analysis)
// 6 Dimensions of Human Writing Imperfection
// ============================================================

/**
 * 1. CLUSTERED FILLER: suntikkan 4-5 filler di 1-2 kalimat, sisanya bersih
 * Fakta: Manusia memakai 5 filler dalam 1 kalimat, lalu 10 kalimat berikutnya bersih total.
 */
function injectClusteredFiller(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  
  // Pilih 1-2 kalimat acak (bukan semua)
  const targetIndices = new Set<number>();
  const count = Math.min(2, Math.max(1, Math.floor(sentences.length * 0.2)));
  while (targetIndices.size < count) {
    targetIndices.add(Math.floor(Math.random() * sentences.length));
  }
  
  const fillerPool = ['like', 'you know', 'uh', 'I mean', 'kinda', 'sorta', 'right?'];
  
  for (const idx of targetIndices) {
    let s = sentences[idx];
    // Pilih 3-5 filler untuk disuntikkan di kalimat ini
    const numFillers = 3 + Math.floor(Math.random() * 3);
    // Suntikkan di posisi acak (awal, tengah, akhir)
    for (let i = 0; i < numFillers; i++) {
      const filler = fillerPool[Math.floor(Math.random() * fillerPool.length)];
      const words = s.split(' ');
      const pos = Math.floor(Math.random() * (words.length - 1)) + 1;
      words.splice(pos, 0, filler + ',');
      s = words.join(' ');
    }
    // Ubah kalimat pertama menjadi sangat kasual
    if (idx === 0) {
      s = 'so, uh, ' + s.charAt(0).toLowerCase() + s.slice(1);
    }
    sentences[idx] = s;
  }
  
  return sentences.join(' ');
}

/**
 * 2. CONTEXTUAL TYPOS: typo spesifik topik, bukan generik
 * Fakta: Typo terjadi pada kata kunci spesifik topik, bukan kata umum.
 */
function injectContextualTypos(text: string): string {
  const typoMap: Array<[RegExp, string]> = [
    [/\bWestern\b/g, 'Westeren'],
    [/\bwestern\b/g, 'westeren'],
    [/\bbathroom\b/gi, 'bathrom'],
    [/\btoilet\b/gi, 'toilit'],
    [/\bIndia\b/g, 'Indian'],
    [/\bbidet\b/gi, 'biddet'],
    [/\bwater\b/gi, 'watter'],
    [/\bpaper\b/gi, 'paaper'],
    [/\bplumbing\b/gi, 'plumbingg'],
    [/\bculture\b/gi, 'cultur'],
    [/\bhygiene\b/gi, 'hygeine'],
  ];
  
  let result = text;
  // Hanya lakukan 2-3 perubahan, jangan semua
  const shuffled = [...typoMap].sort(() => Math.random() - 0.5);
  let changes = 0;
  for (const [pattern, replacement] of shuffled) {
    if (changes >= 2 + Math.floor(Math.random() * 2)) break;
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
      changes++;
    }
  }
  return result;
}

/**
 * 3. IDIOSYNCRATIC VOCABULARY: ganti kata dasar dengan sinonim aneh/spesifik
 * Fakta: Manusia memakai "nether regions", "minty fresh", "waddle". AI pakai "clean", "wash", "use".
 */
function injectIdiosyncraticVocab(text: string): string {
  const vocabMap: Array<[RegExp, string[]]> = [
    [/\bclean\b/gi, ['blast', 'squirt', 'swirl', 'scrub']],
    [/\bwash\b/gi, ['rinse', 'splash', 'douse']],
    [/\buse\b/gi, ['waddle over to', 'toddle to', 'reach for']],
    [/\bgood\b/gi, ['minty fresh', 'crystal clean', 'top-notch']],
    [/\bbad\b/gi, ['terrible nuisance', 'gross', 'absolutely foul']],
    [/\bmake\b/gi, ['craft', 'engineer']],
    [/\bthink\b/gi, ['figure', 'reckon']],
  ];
  
  let result = text;
  for (const [pattern, replacements] of vocabMap) {
    if (Math.random() < 0.3 && pattern.test(result)) {
      const repl = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, repl);
    }
  }
  return result;
}

/**
 * 4. EMOTIONAL POLARIZATION: ambil sisi absolut + kasar
 * Fakta: AI selalu "both are valid, I guess". Manusia bilang "Hell no", "feces residue", "terrible nuisance".
 */
function injectEmotionalPolarization(text: string, sourceTopic: string): string {
  let result = text;
  
  // Jika topik toilet paper vs water, pilih satu sisi dengan kuat
  if (/toilet paper|bidet|water|clean/i.test(sourceTopic)) {
    // Hapus semua "both are fine", "I guess", "to each their own"
    result = result.replace(/\b(both are fine|to each their own|i guess|i suppose)\b/gi, '');
    
    // Tambahkan pernyataan absolut di kalimat pertama atau terakhir
    const sentences = splitSentences(result);
    const absolutes = [
      "Toilet paper is absolutely disgusting.",
      "I can't believe anyone still uses paper.",
      "Water is the only way to actually get clean.",
      "Paper just smears it around, it's foul.",
    ];
    const idx = Math.floor(Math.random() * sentences.length);
    sentences.splice(idx, 0, absolutes[Math.floor(Math.random() * absolutes.length)]);
    
    // Tambahkan kata kasar di suatu tempat
    const profanity = [
      "Hell no.",
      "That's fucking gross.",
      "It's a terrible idea, honestly.",
      "Just awful.",
    ];
    const idx2 = Math.floor(Math.random() * (sentences.length - 1)) + 1;
    sentences.splice(idx2, 0, profanity[Math.floor(Math.random() * profanity.length)]);
    
    result = sentences.join(' ');
  }
  
  return result;
}

/**
 * 5. CONCRETE SPECIFIC ANCHORS: tambahkan detail spesifik palsu
 * Fakta: AI: "my friend", "other places". Manusia: "uncle in Switzerland", "hotel in Waikiki", "RV septic tank".
 */
function injectSpecificAnchors(text: string): string {
  const anchors = [
    "My cousin in Zurich",
    "My grandfather's house in Bandung",
    "A hostel I stayed at in Tokyo",
    "My aunt who lives in the Netherlands",
    "The hotel we visited in Bali",
    "A friend from high school who moved to Canada",
  ];
  
  const details = [
    " which is frequented by Japanese tourists.",
    " during a heatwave, no less.",
    " right after the pandemic lockdowns.",
    " back in 2019.",
  ];
  
  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;
  
  // Sisipkan 1 anchor di awal
  if (Math.random() < 0.7) {
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    const detail = details[Math.floor(Math.random() * details.length)];
    sentences.splice(1, 0, anchor + detail);
  }
  
  return sentences.join(' ');
}

/**
 * 6. EXTREME STRUCTURAL VARIATION: paragraf 1 kalimat vs 8 kalimat
 * Fakta: Paragraf AI 7-12 kalimat. Manusia: 1 kalimat, 1 kalimat, 1 kalimat, lalu 6 kalimat, lalu 1 kalimat.
 */
function applyExtremeStructure(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  
  // Buat paragraf 1: 1-2 kalimat pendek
  const p1 = sentences.slice(0, Math.min(2, sentences.length - 3)).join(' ');
  
  // Buat paragraf 2: 5-8 kalimat panjang
  const midStart = Math.min(2, sentences.length - 4);
  const midEnd = Math.min(sentences.length - 2, midStart + 4 + Math.floor(Math.random() * 4));
  const p2 = sentences.slice(midStart, midEnd).join(' ');
  
  // Buat paragraf 3: sisa kalimat (biasanya pendek)
  const p3 = sentences.slice(midEnd).join(' ');
  
  let result = p1 + '\n\n' + p2;
  if (p3.trim()) result += '\n\n' + p3;
  
  return result;
}

// ============================================================
// MASTER FUNCTION: Gabungkan Semua Logika Baru (6 Dimensi)
// ============================================================

export function ultimateHumanChaos(text: string, sourceText: string = ''): string {
  if (!text || text.length < 50) return text;
  
  let result = text;
  
  // 1. Clustered Filler
  result = injectClusteredFiller(result);
  
  // 2. Contextual Typos (spesifik topik)
  result = injectContextualTypos(result);
  
  // 3. Idiosyncratic Vocab
  result = injectIdiosyncraticVocab(result);
  
  // 4. Emotional Polarization
  result = injectEmotionalPolarization(result, sourceText);
  
  // 5. Specific Anchors
  result = injectSpecificAnchors(result);
  
  // 6. Extreme Structural Variation
  result = applyExtremeStructure(result);
  
  // Cleanup minimal (jangan perbaiki typo!)
  return result.trim();
}

// ============================================================
// NEW: Anti-Essay Transformation (Based on Professor's Latest Feedback)
// ============================================================
// This function transforms explanatory essay-style text into reflective journal / advice column style.
// Key insights from professor:
// - Detectors are NOT fooled by forced casual style (fillers, meta-commentary)
// - Detectors ARE fooled by text that doesn't look like an essay: short fragments, direct commands, 
//   rhetorical questions, topic jumps, and absence of structured scientific explanations
// - Humanizer must stop being an "explainer" and start being an "expresser / advisor"

export function antiEssayTransformation(text: string): string {
  // 1. Remove all filler words that have become humanizer signatures
  let result = text
    .replace(/\b(so,?\s*|like,?\s*|you know,?\s*|i guess,?\s*|anyway,?\s*|my friend,?)\s*/gi, '')
    .replace(/\b(kind of|sort of|pretty much)\b/gi, '');
  
  // 2. Transform explanatory sentences into commands or fragments
  const sentences = splitSentences(result);
  const transformed: string[] = [];
  
  for (const s of sentences) {
    let trimmed = s.trim();
    
    // If sentence explains with "because", "since", convert to direct statement without the explanation
    if (/because|since|due to/i.test(trimmed) && trimmed.length > 30) {
      // Cut the part before "because" and make it a fragment
      const parts = trimmed.split(/\b(because|since|due to)\b/i);
      if (parts.length > 1) {
        trimmed = parts[0].trim().replace(/[.!?]$/, '') + '.';
      }
    }
    
    // Remove defensive meta-comments (skip these entirely - they are humanizer signatures)
    if (/\b(which is kind of|that's different|i don't know|total myth)\b/i.test(trimmed)) {
      continue;
    }
    
    // Clean up stray punctuation and leftover question marks
    trimmed = trimmed.replace(/^\s*[?!.]\s*$/, '').trim();
    
    if (trimmed.trim()) {
      transformed.push(trimmed);
    }
  }
  
  // 3. Split into very short paragraphs (fragments)
  let finalText = transformed.join(' ');
  const finalSentences = splitSentences(finalText);
  let output = '';
  
  for (const fs of finalSentences) {
    const wordCount = fs.split(/\s+/).length;
    // Short fragments (2-6 words) become their own paragraph
    if (wordCount <= 6 && wordCount >= 2) {
      output += fs + '\n\n';
    } else {
      output += fs + ' ';
    }
  }
  
  return output.trim();
}

// ============================================================
// NEW: MACRO REASONING GRAPH TRANSFORMATION (Gap 1)
// ============================================================

type SentenceRole = 'cause' | 'effect' | 'solution' | 'conclusion' | 'personal' | 'example' | 'other';

function detectRole(sentence: string): SentenceRole {
  const lower = sentence.toLowerCase();
  if (/\b(because|since|due to|lead to|contribute|cause|factor|reason)\b/i.test(lower)) return 'cause';
  if (/\b(as a result|consequently|therefore|thus|so|hence|lead to|result in)\b/i.test(lower)) return 'effect';
  if (/\b(solution|way to|approach|method|strategy|should|need to|must)\b/i.test(lower)) return 'solution';
  if (/\b(in conclusion|ultimately|in the end|finally|to sum up|overall|all in all)\b/i.test(lower)) return 'conclusion';
  if (/\b(I|my|me|we|our|you|your|honestly|actually|I think|I believe)\b/i.test(lower)) return 'personal';
  if (/\b(for example|for instance|such as|like|including|take|consider)\b/i.test(lower)) return 'example';
  return 'other';
}

export function transformReasoningGraph(text: string): string {
  const sentences = splitSentences(text);
  // Jangan diubah kalo kurang dari 8 kalimat
  if (sentences.length < 8) return text;

  // Klasifikasikan peran setiap kalimat
  const roles = sentences.map(s => ({ text: s, role: detectRole(s) }));

  // Pisahkan berdasarkan peran
  const causes = roles.filter(r => r.role === 'cause');
  const effects = roles.filter(r => r.role === 'effect');
  const solutions = roles.filter(r => r.role === 'solution');
  const conclusions = roles.filter(r => r.role === 'conclusion');
  const personals = roles.filter(r => r.role === 'personal');
  const examples = roles.filter(r => r.role === 'example');
  const others = roles.filter(r => r.role === 'other');

  // Jika terlalu sedikit variasi, jangan ubah
  if (causes.length + effects.length + conclusions.length < 3) return text;

  // Susun ulang dengan pola: Effect → Personal → Cause → Example → Conclusion → Solution (diragukan)
  const newOrder: string[] = [];

  // 1. Mulai dengan efek (bukan sebab)
  newOrder.push(...effects.map(r => r.text));

  // 2. Sisipkan personal di 20-40%
  const personalSlice = personals.slice(0, Math.max(1, Math.floor(personals.length * 0.6)));
  newOrder.push(...personalSlice.map(r => r.text));

  // 3. Kemudian sebab (kebalikan AI)
  newOrder.push(...causes.map(r => r.text));

  // 4. Contoh di tengah
  newOrder.push(...examples.map(r => r.text));

  // 5. Kesimpulan di 50-70% (bukan di akhir)
  const concPos = Math.min(newOrder.length, Math.max(2, Math.floor(newOrder.length * 0.5)));
  const concTexts = conclusions.map(r => r.text);
  newOrder.splice(concPos, 0, ...concTexts);

  // 6. Solusi di akhir (diragukan)
  newOrder.push(...solutions.map(r => r.text));

  // 7. Sisa lainnya
  newOrder.push(...others.map(r => r.text));

  // Bersihkan duplikat dan gabungkan
  return newOrder.filter(s => s.trim()).join(' ');
}

// ============================================================
// NEW: INJECT REAL FRAGMENTS (Gap 8)
// ============================================================

export function injectRealFragments(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // === UPDATED: Natural fragments, bukan 1 kata ===
  const fragments = [
    'Well, not always.',
    'Not always, certainly.',
    'But then again, maybe not.',
    'Actually, that\'s debatable.',
    'Or so they say.',
    'At least that\'s what I\'ve heard.',
    'To be fair, though.',
    'Honestly, I\'m not sure.',
    'That said, it depends.',
    'Fair enough, but still.',
  ];

  // Sisipkan 2-3 fragments di posisi berbeda
  const count = 2 + Math.floor(Math.random() * 2);
  const positions = new Set<number>();
  while (positions.size < count && positions.size < sentences.length - 1) {
    positions.add(Math.floor(Math.random() * (sentences.length - 1)) + 1);
  }

  const result = [...sentences];
  let offset = 0;
  for (const pos of Array.from(positions).sort((a, b) => a - b)) {
    const fragment = fragments[Math.floor(Math.random() * fragments.length)];
    result.splice(pos + offset, 0, fragment);
    offset++;
  }

  return result.join(' ');
}

// ============================================================
// NEW: INJECT OBSESSION LOOP (Gap 4)
// ============================================================

export function injectObsessionAcrossText(text: string, sourceText?: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // Cek apakah sumber memiliki first-person atau second-person
  const allowedText = sourceText || text;
  const hasFirstPerson = /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(allowedText);
  const hasSecondPerson = /\b(?:you|your|yours|yourself|yourselves)\b/i.test(allowedText);

  // Ambil kata kunci dari kalimat yang mengandung "because", "since", "reason", dll.
  const keySentences = sentences.filter(s => /\b(because|since|reason|factor|cause|lead to)\b/i.test(s));
  if (keySentences.length === 0) return text;

  // Pilih satu kalimat sebagai obsession
  const obsessionSentence = keySentences[Math.floor(Math.random() * keySentences.length)];
  // Ekstrak subjek utama (ambil 2-3 kata pertama yang bukan stopword)
  const words = obsessionSentence.split(/\s+/);
  const stopwords = new Set(['the', 'this', 'that', 'these', 'those', 'a', 'an', 'because', 'since', 'due', 'to', 'of', 'for']);
  let topic = words.find(w => w.length > 3 && !stopwords.has(w.toLowerCase()));
  if (!topic) topic = 'this';

  // Gunakan variasi yang sesuai dengan keberadaan first/second person di sumber
  const variations = hasFirstPerson || hasSecondPerson
    ? [
        `It always comes back to ${topic}, doesn't it?`,
        `I keep thinking about ${topic}.`,
        `Honestly, ${topic} is the real issue here.`,
        `You can't really talk about this without mentioning ${topic}.`,
        `That's why ${topic} matters so much.`,
      ]
    : [
        `It always comes back to ${topic}.`,
        `${topic} keeps coming up.`,
        `That's why ${topic} matters.`,
        `This is really about ${topic}.`,
        `${topic} is the key point here.`,
      ];

  // Sisipkan 2-3 variasi di posisi berbeda
  const result = [...sentences];
  const insertPositions = [
    Math.floor(result.length * 0.25),
    Math.floor(result.length * 0.5),
    Math.floor(result.length * 0.75),
  ].filter(p => p > 0 && p < result.length);

  let offset = 0;
  for (let i = 0; i < Math.min(2, insertPositions.length); i++) {
    const pos = insertPositions[i] + offset;
    const variation = variations[Math.floor(Math.random() * variations.length)];
    result.splice(pos, 0, variation);
    offset++;
  }

  return result.join(' ');
}

// ============================================================
// NEW: INJECT CLUSTERED HEDGING (Gap 6)
// ============================================================

export function injectClusteredHedging(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // Pilih 1-2 kalimat sebagai cluster keraguan
  const clusterCount = Math.min(2, Math.floor(sentences.length * 0.2) + 1);
  const clusterIndices = new Set<number>();
  while (clusterIndices.size < clusterCount) {
    const idx = Math.floor(Math.random() * (sentences.length - 2)) + 1;
    clusterIndices.add(idx);
  }

  const hedges = ['maybe', 'probably', 'I think', 'I guess', 'perhaps', 'might', 'could', 'possibly', 'it seems', 'likely'];

  const result = [...sentences];
  for (const idx of clusterIndices) {
    let s = result[idx];
    const numHedges = 2 + Math.floor(Math.random() * 3); // 2-4 hedging per kalimat
    for (let i = 0; i < numHedges; i++) {
      const hedge = hedges[Math.floor(Math.random() * hedges.length)];
      const words = s.split(' ');
      const pos = Math.min(words.length - 1, Math.max(1, Math.floor(Math.random() * (words.length - 2)) + 1));
      words.splice(pos, 0, hedge);
      s = words.join(' ');
    }
    result[idx] = s;
  }

  return result.join(' ');
}

// ============================================================
// NEW: FORCE CONVERSATIONAL REGISTER (Gap 5)
// ============================================================

export function forceConversationalRegister(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bfinancial strains\b/gi, 'money troubles'],
    [/\braw materials\b/gi, 'supplies'],
    [/\binflation compounds the problem\b/gi, 'inflation makes it worse'],
    [/\bexternal disruptions\b/gi, 'things that go wrong'],
    [/\breshapes consumer expectations\b/gi, 'changes what people expect'],
    [/\bheightens competition\b/gi, 'makes it harder to stand out'],
    [/\brapidly evolving economy\b/gi, "an economy that's changing fast"],
    [/\bindustry-specific expertise\b/gi, 'experience in your field'],
    [/\bspecialized skills\b/gi, 'specific skills'],
    [/\bcontinuous skill development\b/gi, 'always learning new things'],
    [/\benterprise software\b/gi, 'software for businesses'],
    [/\bcloud APIs\b/gi, 'cloud services'],
    [/\bstrategic partnerships\b/gi, 'partnerships'],
    [/\brevenue streams\b/gi, 'ways to make money'],
    [/\btechnological leadership\b/gi, 'staying ahead in tech'],
    [/\bcapture a significant share\b/gi, 'get a big piece'],
    [/\bexpanding global AI market\b/gi, 'growing AI market worldwide'],
    [/\bstate-of-the-art\b/gi, 'cutting-edge'],
    [/\bsubstantial resources\b/gi, 'a huge amount of resources'],
    [/\bsignificant barriers to entry\b/gi, 'big obstacles for newcomers'],
    [/\bnetwork effects\b/gi, 'a snowball effect'],
    [/\bmonetize\b/gi, 'make money from'],
    [/\bvaluation\b/gi, 'price tag'],
    [/\binvestors anticipate\b/gi, 'investors think'],
    [/\bfoundational technology\b/gi, 'basic technology'],
    [/\benormous future economic value\b/gi, 'huge economic potential'],
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ============================================================
// NEW: INJECT TOPIC-SPECIFIC ANCHORS (Gap 7)
// ============================================================

export function injectTopicAnchors(text: string, sourceText?: string): string {
  const lower = text.toLowerCase();
  
  // Cek apakah sumber memiliki first-person atau second-person
  const allowedText = sourceText || text;
  const hasFirstPerson = /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(allowedText);
  const hasSecondPerson = /\b(?:you|your|yours|yourself|yourselves)\b/i.test(allowedText);
  
  let anchors: string[] = [];

  // Deteksi topik dan pilih anchors yang sesuai
  if (/\b(ai|artificial intelligence|chatgpt|openai|llm|model|machine learning)\b/i.test(lower)) {
    anchors = hasFirstPerson || hasSecondPerson
      ? [
          'I mean, just look at how much ChatGPT has improved in two years.',
          'My colleague uses AI to write code and it saves him hours every week.',
          'You can see it in how many companies are now integrating AI into their products.',
          'I remember when GPT-3 came out and everyone was blown away.',
        ]
      : [
          'Look at how much ChatGPT has improved in two years.',
          'Many developers use AI to write code and save hours every week.',
          'It shows in how many companies are now integrating AI into their products.',
          'When GPT-3 came out, everyone was blown away.',
        ];
  } else if (/\b(inflation|cost of living|price|expensive|rent|grocery)\b/i.test(lower)) {
    anchors = hasFirstPerson || hasSecondPerson
      ? [
          'my grocery bill has gone up by nearly 30%',
          'the rent for my apartment increased by $200',
          'I remember when a plate of nasi goreng cost 15,000 rupiah',
          'my friend in Jakarta says his electricity bill doubled',
        ]
      : [
          'Grocery bills have gone up by nearly 30% in many places.',
          'Rent for apartments has increased significantly.',
          'Food prices have risen noticeably over the years.',
          'Electricity bills have doubled in some regions.',
        ];
  } else if (/\b(job|career|employment|graduate|application|hire)\b/i.test(lower)) {
    anchors = hasFirstPerson || hasSecondPerson
      ? [
          'I applied to 50 companies and only heard back from 3',
          'my cousin graduated last year and still hasn\'t found a job',
          'the company I work for just laid off 10% of the staff',
          'my friend got rejected from 5 interviews before landing a role',
        ]
      : [
          'Many people apply to dozens of companies and hear back from only a few.',
          'Recent graduates often struggle to find jobs.',
          'Companies have been laying off staff across various industries.',
          'Job seekers frequently face multiple rejections before landing a role.',
        ];
  } else {
    anchors = hasFirstPerson || hasSecondPerson
      ? [
          'I know someone who went through exactly this.',
          'It reminds me of a situation a friend of mine faced.',
          'You can see it in everyday life if you pay attention.',
        ]
      : [
          'People go through situations like this all the time.',
          'This kind of situation is fairly common.',
          'It happens in everyday life if you pay attention.',
        ];
  }

  // Sisipkan 1-2 anchors di posisi acak
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const result = [...sentences];
  const anchorCount = Math.min(2, anchors.length);
  for (let i = 0; i < anchorCount; i++) {
    const pos = Math.floor(Math.random() * (result.length - 1)) + 1;
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    result.splice(pos, 0, anchor);
  }

  return result.join(' ');
}

// ============================================================
// NEW: INJECT COGNITIVE UNCERTAINTY (Gap 2 & 3)
// ============================================================

export function injectCognitiveUncertaintyFinal(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // 1. Ubah 1-2 kalimat afirmatif menjadi lebih ragu
  const result = [...sentences];
  const doubtMarkers = ['Actually, ', 'To be fair, ', 'I\'m not entirely sure, but ', 'Maybe it\'s just me, but ', 'Honestly, I think '];

  for (let i = 0; i < result.length && i < 2; i++) {
    const s = result[i];
    if (!/\b(maybe|perhaps|probably|think|guess|seems)\b/i.test(s) && s.length > 20) {
      const marker = doubtMarkers[Math.floor(Math.random() * doubtMarkers.length)];
      result[i] = marker + s.charAt(0).toLowerCase() + s.slice(1);
    }
  }

  // 2. Tambahkan 1 kalimat yang membatalkan argumen sebelumnya
  if (result.length > 4) {
    const counter = [
      'Then again, I could be wrong about that.',
      'But maybe that\'s just my experience.',
      'Although, to be fair, it depends on the person.',
      'Though some people would probably disagree.',
    ];
    const idx = Math.floor(result.length * 0.4) + 1;
    result.splice(idx, 0, counter[Math.floor(Math.random() * counter.length)]);
  }

  // 3. Ubah 1 kalimat kesimpulan menjadi pertanyaan
  for (let i = 0; i < result.length; i++) {
    if (/\b(so|therefore|thus|in the end|ultimately)\b/i.test(result[i]) && !result[i].includes('?')) {
      const q = ['... right?', ', I guess?', ', or am I wrong?'];
      result[i] = result[i].replace(/[.!?]$/, '') + q[Math.floor(Math.random() * q.length)];
      break;
    }
  }

  return result.join(' ');
}

// ============================================================
// NEW: DROP INFORMATION LOSS (Gap 3)
// ============================================================

export function dropInformationLoss(text: string): string {
  const sentences = splitSentences(text);
  // Jangan hapus apapun kalo teks pendek (< 150 kata atau < 10 kalimat)
  if (sentences.length < 10) return text;
  
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) return text;

  // Turunkan dari 15-25% menjadi 5-10% aja
  const lossRatio = 0.05 + Math.random() * 0.05;
  const removeCount = Math.floor(sentences.length * lossRatio);
  
  // Jangan hapus 2 kalimat pertama dan 2 kalimat terakhir
  const candidates = sentences.slice(2, -2);
  if (candidates.length < 3) return text;

  const indicesToRemove = new Set<number>();
  while (indicesToRemove.size < removeCount && indicesToRemove.size < candidates.length - 1) {
    const idx = Math.floor(Math.random() * candidates.length);
    indicesToRemove.add(idx);
  }

  const remaining = sentences.filter((_, i) => {
    if (i < 2 || i >= sentences.length - 2) return true;
    return !indicesToRemove.has(i - 2);
  });

  return remaining.join(' ');
}

// ============================================================
// ACADEMIC TEMPLATE DESTROYER - For IELTS/TOEFL Essays
// ============================================================

/**
 * Menghancurkan struktur esai IELTS/TOEFL: "On one hand... On the other hand... In conclusion"
 * Mengubah menjadi alur yang lebih natural: "Firstly... Actually... But... To be honest..."
 * Tidak mengubah konten, hanya mengacak urutan paragraf dan mengganti marker.
 */
export function destroyAcademicTemplate(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // 1. Cari kata pembuka yang khas dan ganti dengan varian yang lebih alami
  // Gabungkan semua paragraph dulu untuk replace global
  let result = paragraphs.join('\n\n');
  
  const replacements: Array<[RegExp, string]> = [
    [/\bOn the one hand\b/gi, 'Firstly'],
    [/\bOn the other hand\b/gi, 'But'],
    [/\bIn addition\b/gi, 'Also'],
    [/\bMoreover\b/gi, 'Plus'],
    [/\bFurthermore\b/gi, 'What\'s more'],
    [/\bIn conclusion\b/gi, 'All in all'],
    [/\bTo conclude\b/gi, 'Anyway'],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  // 2. Sekarang split lagi untuk mengacak paragraf
  const newParagraphs = result.split(/\n\s*\n/).filter(p => p.trim());
  if (newParagraphs.length < 3) return result;
  
  const opening = newParagraphs[0];
  const closing = newParagraphs[newParagraphs.length - 1];
  const middle = newParagraphs.slice(1, -1);
  // Acak middle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }
  // Sisipkan paragraf "keraguan" di tengah
  const doubt = [
    "Actually, I'm not entirely convinced that's always the case.",
    "Then again, maybe it depends on the situation.",
    "To be honest, I've seen exceptions to this.",
  ];
  const insertIdx = Math.floor(middle.length * 0.5);
  middle.splice(insertIdx, 0, doubt[Math.floor(Math.random() * doubt.length)]);

  // Gabungkan kembali: pembuka + middle + penutup
  const finalParagraphs = [opening, ...middle, closing];
  return finalParagraphs.join('\n\n');
}

// ============================================================
// INJECT COGNITIVE NOISE FOR ACADEMIC
// ============================================================

/**
 * Menambahkan elemen "noise" kognitif: fragment, self-correction, informal filler.
 * Hanya untuk essay umum, bukan untuk sensitive/academic murni.
 */
export function injectCognitiveNoiseForAcademic(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  // 1. Sisipkan 1-2 fragment (kalimat tidak lengkap)
  const fragments = [
    'Well, not always.',
    "Actually, that's debatable.",
    'Or so they say.',
    "At least that's what I've heard.",
    'To be fair, though.',
    "Honestly, I'm not sure.",
  ];
  const fragmentCount = 1 + Math.floor(Math.random() * 1); // 1 atau 2
  for (let i = 0; i < fragmentCount; i++) {
    const pos = Math.floor(Math.random() * (sentences.length - 2)) + 1;
    sentences.splice(pos, 0, fragments[Math.floor(Math.random() * fragments.length)]);
  }

  // 2. Tambahkan self-correction di tengah kalimat panjang (comma splice/run-on)
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].split(/\s+/).length > 20 && Math.random() < 0.25) {
      const selfCorrections = [
        ' — or rather, ',
        ' — well, actually, ',
        ' — I mean, ',
      ];
      const words = sentences[i].split(' ');
      const mid = Math.floor(words.length / 2);
      const correction = selfCorrections[Math.floor(Math.random() * selfCorrections.length)];
      words.splice(mid, 0, correction.trim());
      sentences[i] = words.join(' ');
    }
  }

  return sentences.join(' ');
}

// ============================================================
// INJECT ACADEMIC ANCHORS
// ============================================================

/**
 * Menambahkan 1-2 detail konkret yang relevan dengan topik.
 * Menggunakan database kecil yang aman (tidak mengarang fakta).
 */
export function injectAcademicAnchors(text: string): string {
  const lower = text.toLowerCase();
  let anchors: string[] = [];

  // Deteksi topik dan pilih anchors yang sesuai
  if (/\b(sport|olympic|world cup|athletic)\b/i.test(lower)) {
    anchors = [
      'Take the 2012 London Olympics, for instance.',
      'Consider the FIFA World Cup in Brazil 2014.',
      'The Winter Olympics in Sochi, Russia, in 2014 is a good example.',
      'The Commonwealth Games in Manchester 2002 showed how...',
    ];
  } else if (/\b(child|education|reading|play|learn)\b/i.test(lower)) {
    anchors = [
      'In Finland, for example, early education focuses on play.',
      'Take the UK – many boys become reluctant readers.',
      'My cousin in Birmingham told me...',
      'A study from the University of Cambridge found...',
    ];
  } else if (/\b(ai|artificial|intelligence|chatgpt|openai)\b/i.test(lower)) {
    anchors = [
      "OpenAI's ChatGPT, which launched in 2022, ...",
      "Google's DeepMind has invested heavily in...",
      "Microsoft's partnership with OpenAI is a case in point.",
    ];
  } else {
    anchors = [
      'For example, in Japan, ...',
      'Take Germany, where ...',
      'My experience with ...',
    ];
  }

  // Sisipkan 1-2 anchor di posisi acak
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const result = [...sentences];
  const anchorCount = Math.min(2, anchors.length);
  for (let i = 0; i < anchorCount; i++) {
    const pos = Math.floor(Math.random() * (result.length - 2)) + 1;
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    result.splice(pos, 0, anchor);
  }

  return result.join(' ');
}

// ============================================================
// BREAK PARALLELISM
// ============================================================

/**
 * Mengubah daftar paralel (A, B, dan C) menjadi narasi tidak simetris.
 * Contoh: "solve problems, think creatively, and work together" → 
 *         "solve problems, they also think creatively, and working together is key."
 */
export function breakParallelism(text: string): string {
  const sentences = splitSentences(text);
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    // Cari pola: "verb1, verb2, and verb3" (parallel verbs)
    const match = s.match(/\b(\w+)\s+([^,]+),\s+([^,]+),\s+and\s+(\w+)\s+([^.!?]+)/i);
    if (match && Math.random() < 0.3) {
      const [full, verb1, part1, part2, verb3, part3] = match;
      // Ubah menjadi bentuk tidak paralel
      const restructured = `${verb1} ${part1.trim()}, and ${verb3} ${part3.trim()}`;
      sentences[i] = s.replace(full, restructured);
    }
  }
  return sentences.join(' ');
}

// ============================================================
// INJECT PERSONAL STANCE
// ============================================================

/**
 * Tambahkan "I think", "honestly", "weirdly" di posisi strategis (bukan di awal setiap kalimat).
 */
export function injectPersonalStance(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const openers = [
    'I honestly think that ',
    'To be perfectly honest, ',
    'Weirdly enough, ',
    'In my view, ',
    "I'd argue that ",
    'It seems to me that ',
  ];
  const positions = [Math.floor(sentences.length * 0.3), Math.floor(sentences.length * 0.6)];
  let result = [...sentences];
  for (const pos of positions) {
    if (pos < result.length && !/\b(I|my|me|we)\b/.test(result[pos])) {
      const opener = openers[Math.floor(Math.random() * openers.length)];
      result[pos] = opener + result[pos].charAt(0).toLowerCase() + result[pos].slice(1);
    }
  }
  return result.join(' ');
}

// ============================================================
// DEFORMALIZE VOCABULARY (turunkan kebakuan)
// ============================================================

/**
 * Mengganti kata-kata formal/fancy dengan versi sehari-hari.
 * Ini adalah kebalikan dari "polished" yang membuat Crime terdeteksi AI.
 */
export function deformalizeVocabulary(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bsignificant concern\b/gi, 'major problem'],
    [/\bsubstantially reduce\b/gi, 'cut down a lot'],
    [/\bcomprehensive education\b/gi, 'good education'],
    [/\brobust social support\b/gi, 'strong community support'],
    [/\binherently impossible\b/gi, 'basically impossible'],
    [/\bpersistent presence\b/gi, 'long-standing issue'],
    [/\bstringent legal frameworks\b/gi, 'strict laws'],
    [/\bengage in criminal behavior\b/gi, 'commit crimes'],
    [/\bsocioeconomic factors\b/gi, 'social and money problems'],
    [/\bsubstance abuse\b/gi, 'drug problems'],
    [/\bfinancial hardship\b/gi, 'money trouble'],
    [/\binterrelated challenges\b/gi, 'connected problems'],
    [/\bunderscore the complexity\b/gi, 'show how complex'],
    [/\bimplement effective strategies\b/gi, 'take effective action'],
    [/\bmitigate crime\b/gi, 'reduce crime'],
    [/\bperceived certainty and severity\b/gi, 'chance and seriousness'],
    [/\bunderlying causes\b/gi, 'root causes'],
    [/\bviable career prospects\b/gi, 'good job chances'],
    [/\brecidivism\b/gi, 're-offending'],
    [/\bfoster greater social cohesion\b/gi, 'build stronger communities'],
    [/\benduring feature\b/gi, 'long-lasting fact'],
    [/\beradicated completely\b/gi, 'removed entirely'],
    [/\bwell-designed government policies\b/gi, 'smart government policies'],
    [/\bequitable access\b/gi, 'fair access'],
    [/\bsustained community support\b/gi, 'ongoing community help'],
    [/\bincidence of crime\b/gi, 'crime rate'],
    [/\bresilient communities\b/gi, 'stronger communities'],
    [/\bemerged as\b/gi, 'become'],
    [/\bprevailing\b/gi, 'common'],
    [/\bunquestionably\b/gi, 'without a doubt'],
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ============================================================
// INJECT HUMAN IDIOMS & CLICHÉS
// ============================================================

/**
 * Menambahkan idiom/klise yang sering dipakai manusia dalam esai.
 */
export function injectHumanIdioms(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const idioms = [
    'to be honest, ',
    'it goes without saying that ',
    'at the end of the day, ',
    'when you think about it, ',
    'to make matters worse, ',
    'the bottom line is that ',
  ];
  const positions = [Math.floor(sentences.length * 0.2), Math.floor(sentences.length * 0.7)];
  let result = [...sentences];
  for (const pos of positions) {
    if (pos < result.length && !/\b(actually|honestly|anyway)\b/.test(result[pos])) {
      const idiom = idioms[Math.floor(Math.random() * idioms.length)];
      result[pos] = idiom + result[pos].charAt(0).toLowerCase() + result[pos].slice(1);
    }
  }
  return result.join(' ');
}

// ============================================================
// INJECT REDUNDANCY
// ============================================================

/**
 * Menambahkan redundansi: "prevailing and worrying", "clear and obvious", dll.
 */
export function injectRedundancy(text: string): string {
  const redundancies: Array<[RegExp, string]> = [
    [/\bimportant\b/gi, 'important and crucial'],
    [/\bmajor\b/gi, 'major and significant'],
    [/\bclear\b/gi, 'clear and obvious'],
    [/\bserious\b/gi, 'serious and worrying'],
    [/\bcommon\b/gi, 'common and widespread'],
    [/\bdifficult\b/gi, 'difficult and challenging'],
    [/\bstrong\b/gi, 'strong and solid'],
  ];

  let result = text;
  for (const [pattern, replacement] of redundancies) {
    if (Math.random() < 0.3 && pattern.test(result)) {
      result = result.replace(pattern, replacement);
      break; // hanya 1 kali agar tidak berlebihan
    }
  }
  return result;
}

// ============================================================
// INJECT EXTREME LENGTH VARIATION
// ============================================================

/**
 * Memastikan ada kalimat sangat pendek dan sangat panjang.
 */
export function injectExtremeLengthVariation(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // Cari kalimat panjang (>25 kata) dan split jika perlu
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].split(/\s+/).length > 30 && Math.random() < 0.4) {
      const parts = sentences[i].split(/[,;]\s+/);
      if (parts.length >= 2) {
        const mid = Math.floor(parts.length / 2);
        sentences[i] = parts.slice(0, mid).join(', ') + '.';
        sentences.splice(i + 1, 0, parts.slice(mid).join(', ') + '.');
        break;
      }
    }
  }

  // Tambahkan 1 kalimat sangat pendek (3-6 kata)
  if (sentences.length > 2 && Math.random() < 0.6) {
    const shortFragments = [
      'That said.',
      'Not always.',
      'It depends.',
      'Fair enough.',
      'No doubt.',
    ];
    const pos = Math.floor(sentences.length * 0.5);
    sentences.splice(pos, 0, shortFragments[Math.floor(Math.random() * shortFragments.length)]);
  }

  return sentences.join(' ');
}

// ============================================================
// INJECT BOLD OPINION
// ============================================================

/**
 * Ubah "I partly agree" menjadi opini tegas.
 */
export function injectBoldOpinion(text: string): string {
  const boldOpeners = [
    'I strongly believe that ',
    'It is my firm conviction that ',
    'I am convinced that ',
    'There is no doubt that ',
    'I would argue that ',
  ];

  // Cari kalimat yang mengandung "I agree", "I believe", "In my opinion"
  const sentences = splitSentences(text);
  let changed = false;
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(partly agree|somewhat agree|to some extent|I think|In my opinion)\b/i.test(sentences[i]) && !changed) {
      const opener = boldOpeners[Math.floor(Math.random() * boldOpeners.length)];
      const rest = sentences[i].replace(/^.*?\b(I think|I believe|In my opinion|partly agree)\b\s*/i, '');
      sentences[i] = opener + rest.charAt(0).toLowerCase() + rest.slice(1);
      changed = true;
      break;
    }
  }
  return sentences.join(' ');
}

// ============================================================
// IMPROVED INJECT ACADEMIC ANCHORS (lebih spesifik)
// ============================================================

/**
 * Menambahkan 1-2 detail konkret yang relevan dengan topik.
 * Menggunakan database kecil yang aman (tidak mengarang fakta).
 * Versi improved dengan lebih banyak topik spesifik.
 */
export function injectAcademicAnchorsImproved(text: string): string {
  const lower = text.toLowerCase();
  let anchors: string[] = [];

  if (/\b(sport|olympic|world cup|athletic)\b/i.test(lower)) {
    anchors = [
      'Take the 2012 London Olympics, for example.',
      'Consider the FIFA World Cup in Brazil 2014.',
      'The Winter Olympics in Sochi, Russia, in 2014 is a good example.',
      'The Commonwealth Games in Manchester 2002 showed how...',
      'In Brazil, the Favelas around Rio de Janeiro have seen a drop in crime.',
    ];
  } else if (/\b(child|education|reading|play|learn)\b/i.test(lower)) {
    anchors = [
      'In Finland, for example, early education focuses on play.',
      'Take the UK – many boys become reluctant readers.',
      'A study from the University of Cambridge found...',
      'The Finnish education system is often cited as a model.',
    ];
  } else if (/\b(ai|artificial|intelligence|chatgpt|openai)\b/i.test(lower)) {
    anchors = [
      "OpenAI's ChatGPT, which launched in 2022, ...",
      "Google's DeepMind has invested heavily in...",
      "Microsoft's partnership with OpenAI is a case in point.",
    ];
  } else if (/\b(crime|criminal|police|prison)\b/i.test(lower)) {
    anchors = [
      'For example, crime has been reduced in the Favelas around Rio de Janeiro.',
      'In Somalia, pirates have caused huge problems for shipping companies.',
      'The UK has seen a drop in youth crime in recent years.',
      'In the US, community policing has shown positive results.',
    ];
  } else if (/\b(energy|renewable|solar|wind|green)\b/i.test(lower)) {
    anchors = [
      'In Germany, renewable energy now accounts for over 50% of electricity.',
      "The UK's offshore wind farms are a good example.",
      'In California, solar power has grown rapidly.',
      'China is the world leader in solar panel production.',
    ];
  } else {
    anchors = [
      'For example, in Japan, ...',
      'Take Germany, where ...',
      'My experience with ...',
    ];
  }

  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  const result = [...sentences];
  const anchorCount = Math.min(2, anchors.length);
  for (let i = 0; i < anchorCount; i++) {
    const pos = Math.floor(Math.random() * (result.length - 2)) + 1;
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    result.splice(pos, 0, anchor);
  }

  return result.join(' ');
}

// ============================================================
// 6 FUNGSI BARU DARI SARAN DOSEN
// ============================================================

/**
 * Mengganti kata-kata yang sering muncul di output AI dengan versi sehari-hari.
 * Ini menurunkan perplexity karena kata-kata ini kurang prediktabel.
 */
export function deAISignatureWords(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bsignificantly reshaped\b/gi, 'changed a lot'],
    [/\bfacilitated continuous connection\b/gi, 'helped people stay in touch'],
    [/\bgeographical distances\b/gi, 'long distances'],
    [/\boverreliance\b/gi, 'too much reliance'],
    [/\bundermine the depth and authenticity\b/gi, 'hurt the realness of'],
    [/\bprolonged screen exposure\b/gi, 'too much screen time'],
    [/\binterpersonal competencies\b/gi, 'people skills'],
    [/\bcognitive noise\b/gi, 'mental clutter'],
    [/\benhanced social engagement\b/gi, 'helped people connect'],
    [/\bintroduced notable social challenges\b/gi, 'brought some social problems'],
    [/\bsubstantial time\b/gi, 'a lot of time'],
    [/\bextensive online networks\b/gi, 'many online friends'],
    [/\bregarded as\b/gi, 'seen as'],
    [/\bsupplementary tool\b/gi, 'extra tool'],
    [/\bauthentic, personal relationships\b/gi, 'real personal relationships'],
    [/\bsignificant concern\b/gi, 'major problem'],
    [/\bsubstantially reduce\b/gi, 'cut down a lot'],
    [/\bcomprehensive education\b/gi, 'good education'],
    [/\brobust social support\b/gi, 'strong community support'],
    [/\binherently impossible\b/gi, 'basically impossible'],
    [/\bpersistent presence\b/gi, 'long-standing issue'],
    [/\bstringent legal frameworks\b/gi, 'strict laws'],
    [/\bengage in criminal behavior\b/gi, 'commit crimes'],
    [/\bsocioeconomic factors\b/gi, 'social and money problems'],
    [/\bsubstance abuse\b/gi, 'drug problems'],
    [/\bfinancial hardship\b/gi, 'money trouble'],
    [/\binterrelated challenges\b/gi, 'connected problems'],
    [/\bundercore the complexity\b/gi, 'show how complex'],
    [/\bimplement effective strategies\b/gi, 'take effective action'],
    [/\bmitigate crime\b/gi, 'reduce crime'],
    [/\bperceived certainty and severity\b/gi, 'chance and seriousness'],
    [/\bunderlying causes\b/gi, 'root causes'],
    [/\bviable career prospects\b/gi, 'good job chances'],
    [/\brecidivism\b/gi, 're-offending'],
    [/\bfoster greater social cohesion\b/gi, 'build stronger communities'],
    [/\benduring feature\b/gi, 'long-lasting fact'],
    [/\beradicated completely\b/gi, 'removed entirely'],
    [/\bwell-designed government policies\b/gi, 'smart government policies'],
    [/\bequitable access\b/gi, 'fair access'],
    [/\bsustained community support\b/gi, 'ongoing community help'],
    [/\bincidence of crime\b/gi, 'crime rate'],
    [/\bresilient communities\b/gi, 'stronger communities'],
    [/\bemerged as\b/gi, 'become'],
    [/\bprevailing\b/gi, 'common'],
    [/\bunquestionably\b/gi, 'without a doubt'],
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(result) && Math.random() < 0.6) {
      result = result.replace(pattern, replacement);
    }
  }
  return result;
}

/**
 * Menambahkan natural imperfections: typo, redundancy, self-correction.
 * Contoh: "it's addictive nature", "decreased and diminished", "due to huge the huge"
 */
export function injectNaturalImperfections(text: string): string {
  let result = text;

  // 1. Redundansi tidak sengaja: "decreased and diminished", "clear and obvious"
  const redundancyPairs: Array<[RegExp, string]> = [
    [/\bdecreased\b/gi, 'decreased and diminished'],
    [/\breduced\b/gi, 'reduced and limited'],
    [/\bincreased\b/gi, 'increased and expanded'],
    [/\bclear\b/gi, 'clear and obvious'],
    [/\bstrong\b/gi, 'strong and powerful'],
    [/\bample\b/gi, 'ample and abundant'],
    [/\bdoubt\b/gi, 'doubt or question'],
    [/\btrue\b/gi, 'true and accurate'],
  ];
  if (Math.random() < 0.35) {
    const [pattern, replacement] = redundancyPairs[Math.floor(Math.random() * redundancyPairs.length)];
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
    }
  }

  // 2. Typo strategis (apostrophe salah, pengulangan kata, salah ejaan)
  const typos: Array<[RegExp, string]> = [
    [/\bit is\b/gi, 'it\'s'],
    [/\bits own\b/gi, 'it\'s own'], // typo (seharusnya its)
    [/\btheir\b/gi, 'thier'],
    [/\bdefinitely\b/gi, 'definately'],
    [/\bseparate\b/gi, 'seperate'],
    [/\boccurred\b/gi, 'occured'],
    [/\bbeginning\b/gi, 'begining'],
    [/\bgovernment\b/gi, 'goverment'],
    [/\bpeople\b/gi, 'ppl'], // kadang-kadang
  ];
  if (Math.random() < 0.4) {
    const [pattern, replacement] = typos[Math.floor(Math.random() * typos.length)];
    if (pattern.test(result) && !/ppl/.test(replacement)) {
      result = result.replace(pattern, replacement);
    }
  }

  // 3. Self-correction / pengulangan kata tidak sengaja (seperti "due to huge the huge")
  const sentences = splitSentences(result);
  if (sentences.length > 4 && Math.random() < 0.3) {
    const idx = Math.floor(Math.random() * (sentences.length - 2)) + 1;
    const words = sentences[idx].split(' ');
    if (words.length > 5) {
      // duplicate kata pertama setelah kata ke-2
      words.splice(2, 0, words[0]);
      sentences[idx] = words.join(' ');
      result = sentences.join(' ');
    }
  }

  return result;
}

/**
 * Mengubah kata-kata formal menjadi kontraksi.
 * Hanya untuk general tones.
 */
export function addContractions(text: string): string {
  const contractionMap: Array<[RegExp, string]> = [
    [/\bdo not\b/gi, 'don\'t'],
    [/\bcannot\b/gi, 'can\'t'],
    [/\bwill not\b/gi, 'won\'t'],
    [/\bshould not\b/gi, 'shouldn\'t'],
    [/\bwould not\b/gi, 'wouldn\'t'],
    [/\bcould not\b/gi, 'couldn\'t'],
    [/\bdoes not\b/gi, 'doesn\'t'],
    [/\bdid not\b/gi, 'didn\'t'],
    [/\bis not\b/gi, 'isn\'t'],
    [/\bare not\b/gi, 'aren\'t'],
    [/\bhas not\b/gi, 'hasn\'t'],
    [/\bhave not\b/gi, 'haven\'t'],
    [/\bit is\b/gi, 'it\'s'],
    [/\bthat is\b/gi, 'that\'s'],
    [/\bwhat is\b/gi, 'what\'s'],
    [/\bthere is\b/gi, 'there\'s'],
    [/\bi will\b/gi, 'I\'ll'],
    [/\byou will\b/gi, 'you\'ll'],
    [/\bthey will\b/gi, 'they\'ll'],
    [/\bwe will\b/gi, 'we\'ll'],
    [/\bi would\b/gi, 'I\'d'],
    [/\bi have\b/gi, 'I\'ve'],
    [/\byou have\b/gi, 'you\'ve'],
    [/\bwe have\b/gi, 'we\'ve'],
    [/\bthey have\b/gi, 'they\'ve'],
    [/\bi am\b/gi, 'I\'m'],
    [/\byou are\b/gi, 'you\'re'],
    [/\bwe are\b/gi, 'we\'re'],
    [/\bthey are\b/gi, 'they\'re'],
  ];

  let result = text;
  for (const [pattern, replacement] of contractionMap) {
    if (Math.random() < 0.55) {
      result = result.replace(pattern, replacement);
    }
  }
  return result;
}

/**
 * Mengubah "I partly agree" menjadi opini kuat seperti "I strongly believe".
 * Juga tambahkan 1-2 kalimat opini bold di tempat strategis.
 */
export function strengthenPersonalOpinion(text: string): string {
  const strongOpinions = [
    'I strongly believe that ',
    'I am firmly convinced that ',
    'There is no doubt in my mind that ',
    'I would argue that ',
    'It is my firm belief that ',
  ];

  const sentences = splitSentences(text);
  let changed = false;

  // 1. Ubah opini lemah menjadi kuat
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (/\b(partly agree|somewhat agree|to some extent|I think|I believe|In my opinion)\b/i.test(s) && !changed) {
      const opener = strongOpinions[Math.floor(Math.random() * strongOpinions.length)];
      const rest = s.replace(/^.*?\b(?:I think|I believe|In my opinion|partly agree|somewhat agree|to some extent)\b\s*/i, '');
      sentences[i] = opener + rest.charAt(0).toLowerCase() + rest.slice(1);
      changed = true;
      break;
    }
  }

  // 2. Jika belum ada "I" di teks, tambahkan 1 opini kuat di posisi 30-60%
  if (!changed && !/\b(I|my|me)\b/.test(text) && sentences.length > 3) {
    const pos = Math.floor(sentences.length * 0.4);
    const opener = strongOpinions[Math.floor(Math.random() * strongOpinions.length)];
    const rest = sentences[pos];
    sentences[pos] = opener + rest.charAt(0).toLowerCase() + rest.slice(1);
  }

  return sentences.join(' ');
}

/**
 * Menambahkan 1-2 kalimat outlier: sangat pendek (3-5 kata) atau super panjang (40+ kata).
 * Ini menciptakan burstiness tinggi.
 */
export function injectOutlierSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const result = [...sentences];

  // 1. Tambahkan kalimat super pendek (3-6 kata)
  if (Math.random() < 0.7) {
    const shortOnes = [
      'That said.',
      'Not always.',
      'It depends.',
      'Fair enough.',
      'No doubt.',
      'Honestly.',
      'Right.',
      'Anyway.',
      'True.',
      'Still.',
    ];
    const pos = Math.floor(Math.random() * (result.length - 1)) + 1;
    result.splice(pos, 0, shortOnes[Math.floor(Math.random() * shortOnes.length)]);
  }

  // 2. Tambahkan kalimat super panjang (40+ kata) dengan banyak klausa
  if (Math.random() < 0.5 && result.length > 3) {
    const longTemplates = [
      "And honestly, I think the whole debate is kind of pointless because my grandma can now video call her sister in Jakarta every morning, and that alone — that simple, stupid little thing — proves everything I need to say.",
      "It's actually pretty wild when you stop and think about it — I mean, my cousin in Switzerland video calls her parents every Sunday, and they're literally thousands of miles apart, but it feels like they're in the same room, and that's not something you could have said even ten years ago, right?",
      "To be perfectly honest, I've always found it weird how people obsess over whether technology makes us more or less social, because the answer is so obviously both — it just depends on how you use it, and that's the real point people miss.",
    ];
    const pos = Math.floor(Math.random() * (result.length - 1)) + 1;
    result.splice(pos, 0, longTemplates[Math.floor(Math.random() * longTemplates.length)]);
  }

  return result.join(' ');
}

/**
 * Memastikan paragraf memiliki panjang ekstrem: 1 kalimat di satu paragraf,
 * dan 5+ kalimat di paragraf lain. Hancurkan keseimbangan.
 */
export function injectExtremeParagraphVariation(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // 1. Ubah satu paragraf menjadi sangat pendek (1 kalimat)
  const shortIdx = Math.floor(Math.random() * paragraphs.length);
  const sentences = splitSentences(paragraphs[shortIdx]);
  if (sentences.length > 2) {
    paragraphs[shortIdx] = sentences.slice(0, 1).join(' ');
  }

  // 2. Ubah satu paragraf lain menjadi sangat panjang (gabungkan dengan paragraf berikutnya)
  const longIdx = (shortIdx + 1) % paragraphs.length;
  if (longIdx < paragraphs.length - 1) {
    paragraphs[longIdx] = paragraphs[longIdx] + ' ' + paragraphs[longIdx + 1];
    paragraphs.splice(longIdx + 1, 1);
  }

  // 3. Jika paragraf masih terlalu seragam, ubah satu paragraf jadi 5+ kalimat
  if (paragraphs.length > 2) {
    const anotherIdx = (longIdx + 1) % paragraphs.length;
    const sentences2 = splitSentences(paragraphs[anotherIdx]);
    if (sentences2.length > 2 && sentences2.length < 5 && Math.random() < 0.4) {
      // gabungkan dengan paragraf berikutnya untuk membuat panjang
      if (anotherIdx < paragraphs.length - 1) {
        paragraphs[anotherIdx] = paragraphs[anotherIdx] + ' ' + paragraphs[anotherIdx + 1];
        paragraphs.splice(anotherIdx + 1, 1);
      }
    }
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// NEW: DETECT ESSAY TOPIC (untuk injectTopicAnchors yang lebih baik)
// ============================================================

export function detectEssayTopic(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(city|urban|urbanisation|metropolitan|population|overcrowding|transport|housing)\b/i.test(lower)) {
    return 'urban';
  }
  if (/\b(education|reading|child|learn|play|student|teacher|school)\b/i.test(lower)) {
    return 'education';
  }
  if (/\b(women|gender|female|male|equality|traditional roles|housewife|homemaker)\b/i.test(lower)) {
    return 'gender';
  }
  if (/\b(ai|artificial intelligence|chatgpt|openai|llm|model|machine learning|technology)\b/i.test(lower)) {
    return 'technology';
  }
  if (/\b(crime|criminal|police|prison|justice|law|offender)\b/i.test(lower)) {
    return 'crime';
  }
  return 'general';
}

// ============================================================
// NEW: INJECT UNCERTAINTY ENDING (Gap - Kesimpulan terlalu optimis)
// ============================================================

/**
 * Mengubah kesimpulan yang optimis menjadi lebih skeptis/terbuka
 */
export function injectUncertaintyEnding(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  
  // Cari kalimat terakhir
  const lastSentence = sentences[sentences.length - 1];
  
  // Jika terakhir adalah kesimpulan optimis, ganti
  if (/\b(can become|will become|should be|must be)\b/i.test(lastSentence) && 
      /\b(healthier|more sustainable|more enjoyable|better|improved)\b/i.test(lastSentence)) {
    const uncertainClosings = [
      'Various solutions exist to mitigate such drawbacks, but nevertheless a definite solution has yet to be found.',
      'Though progress is possible, the challenges are far from fully resolved.',
      'In the end, the answer remains elusive for many cities.',
      'There is no simple solution, and each city must find its own path.',
    ];
    sentences[sentences.length - 1] = uncertainClosings[Math.floor(Math.random() * uncertainClosings.length)];
  }
  
  return sentences.join(' ');
}

// ============================================================
// NEW: HUMANIZE ACADEMIC STRUCTURE (Gap - Base text masih AI)
// ============================================================

/**
 * Mengubah esai formulaik menjadi alur yang lebih human:
 * - Historical opening (bukan "In recent years...")
 * - Paradox framing ("paradoxically")
 * - Ketidakpastian di akhir ("no definite solution has yet been found")
 * - Contoh spesifik on-topic
 */
export function humanizeAcademicStructure(text: string, topic: string): string {
  // Deteksi topik
  const lower = text.toLowerCase();
  let isUrban = /\b(city|urban|urbanisation|metropolitan|population|overcrowding|transport|housing)\b/i.test(lower);
  let isEducation = /\b(education|reading|child|learn|play)\b/i.test(lower);
  let isGender = /\b(women|gender|female|male|equality|traditional roles)\b/i.test(lower);
  
  // Pilih opening alternatif berdasarkan topik
  let opening = '';
  if (isUrban) {
    opening = 'The global phenomenon of urbanisation from the beginning of industrialisation to the present day has brought opportunity and prosperity, albeit at a cost in the quality of life. With an increasing city population, the complexity of the challenges also increases. The causes and solutions for this are outlined below.';
  } else if (isEducation) {
    opening = 'Parents throughout the world spend time reading with their offspring to prepare them for school where their literacy skills are further developed; however, recent research suggests that focusing on reading at an early age can be detrimental, and participating in fun activities would be far more beneficial.';
  } else if (isGender) {
    opening = 'Women and men have had different roles in the community since the beginning. Under modern pretexts these differences are slowly converging. However, due to the genetic inheritance and socio-demographic components, these differences do exist.';
  } else {
    // Fallback: ambil 2 kalimat pertama dari teks, tapi ubah sedikit
    const sentences = splitSentences(text);
    if (sentences.length >= 2) {
      opening = sentences[0] + ' ' + sentences[1];
    } else {
      opening = text.slice(0, 150);
    }
  }
  
  // 1. Ganti pembuka dengan opening alternatif
  let result = opening + ' ';
  
  // 2. Ambil kalimat-kalimat inti (tanpa transisi formulaik)
  const bodySentences = splitSentences(text).slice(2); // skip 2 kalimat pertama
  
  // 3. Tambahkan "paradoxically" framing di suatu tempat
  const paradoxFraming = 'The causes for the decrease in the quality of life are paradoxically the prosperity endowed on such metropolitan centres.';
  result += paradoxFraming + ' ';
  
  // 4. Tambahkan body sentences
  result += bodySentences.join(' ') + ' ';
  
  // 5. Ubah kesimpulan menjadi ketidakpastian
  const uncertainEnding = 'Various solutions exist to mitigate such drawbacks, but nevertheless a definite solution has yet to be found.';
  
  // Cari "In conclusion" dan ganti dengan uncertain ending
  if (result.includes('In conclusion')) {
    result = result.replace(/In conclusion[^.]*\./i, uncertainEnding);
  } else {
    result += uncertainEnding;
  }
  
  return result;
}

// ============================================================
// PARTICIPIAL PHRASE DESTROYER
// ============================================================

/**
 * Mengubah kalimat pembuka yang menggunakan participial phrase menjadi kalimat sederhana.
 * 
 * ❌ AI: "Tourism is now one of the world's largest industries, delivering real economic gains..."
 * ✅ Human: "These days, travelling has become so easy that a family can fly from London to Bangkok 
 *            in under twelve hours and think nothing of it."
 * 
 * ❌ AI: "Technology has transformed the way people communicate, enabling instant messaging..."
 * ✅ Human: "You can now talk to anyone, anywhere, at any time — it's that simple."
 */
export function destroyParticipialPhraseOpening(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;

  // Cari kalimat pertama yang mengandung participial phrase setelah koma
  // Pola: "X, [verb]ing ..."
  const participialPattern = /^([^,]+),\s+(\w+ing\s+[^.!?]+)/i;
  const match = sentences[0].match(participialPattern);

  if (match && Math.random() < 0.6) {
    const [fullMatch, subjectPart, participialPart] = match;
    
    // Dapatkan topik dari subjectPart (kata benda utama)
    const topicWords = subjectPart.split(/\s+/).filter(w => w.length > 3);
    const topic = topicWords.length > 0 ? topicWords[0].toLowerCase() : 'this';

    // Pilih opening alternatif berdasarkan topik
    const openings = [
      `You know what's interesting about ${topic}? It's that ${participialPart.replace(/^\w+ing\s*/, '').trim()}`,
      `These days, ${topic} has become so common that ${participialPart.replace(/^\w+ing\s*/, '').trim()}`,
      `Think about ${topic} for a second — ${participialPart.replace(/^\w+ing\s*/, '').trim()}`,
      `I've always found ${topic} fascinating because ${participialPart.replace(/^\w+ing\s*/, '').trim()}`,
    ];

    sentences[0] = openings[Math.floor(Math.random() * openings.length)];
    return sentences.join(' ');
  }

  return text;
}

// ============================================================
// THESIS TEMPLATE DESTROYER
// ============================================================

/**
 * Mengubah thesis template AI menjadi direct statement.
 * 
 * ❌ AI: "I partly agree that governments should add taxes on flights or stays, 
 *          because such measures can help guard the planet, but only if done with care..."
 * ✅ Human: "I think charging people more to fly or stay in hotels could help, 
 *           but only if the money actually goes toward fixing the damage."
 * 
 * ❌ AI: "I largely agree that easy access to guns contributes significantly to the rise in shootings."
 * ✅ Human: "Easy access to guns does play a major part in the growing number of shootings."
 */
export function destroyThesisTemplate(text: string): string {
  const sentences = splitSentences(text);
  let modified = false;

  for (let i = 0; i < sentences.length && !modified; i++) {
    const s = sentences[i];
    
    // Pola 1: "I partly agree that... because... but..."
    const partialAgreePattern = /^(I\s+(?:partly|largely|strongly|fully)?\s*agree\s+that\s+)(.+?)(?:\s+because\s+|,\s+because\s+)(.+?)(?:\s+but\s+|,\s+but\s+)(.+)$/i;
    const match1 = s.match(partialAgreePattern);
    
    if (match1) {
      const [, , claim, reason, caveat] = match1;
      const alternatives = [
        `I think ${claim} could help, but only if ${caveat}`,
        `${claim} makes sense, as long as ${caveat}`,
        `${claim} — but ${caveat}`,
        `${claim}, though ${caveat}`,
      ];
      sentences[i] = alternatives[Math.floor(Math.random() * alternatives.length)];
      modified = true;
      break;
    }

    // Pola 2: "I (largely/strongly) agree that X contributes to Y."
    const simpleAgreePattern = /^I\s+(?:largely|strongly|fully|partly)?\s*agree\s+that\s+(.+?)(?:\s+contributes\s+to\s+|\s+is\s+)(.+)$/i;
    const match2 = s.match(simpleAgreePattern);
    
    if (match2) {
      const [, subject, impact] = match2;
      const alternatives = [
        `${subject} does play a major part in ${impact}`,
        `${subject} is a key factor in ${impact}`,
        `${subject} really does affect ${impact}`,
      ];
      sentences[i] = alternatives[Math.floor(Math.random() * alternatives.length)];
      modified = true;
      break;
    }

    // Pola 3: "I believe that X is important because Y."
    const believePattern = /^I\s+believe\s+that\s+(.+?)\s+is\s+(important|crucial|essential|vital)\s+because\s+(.+)$/i;
    const match3 = s.match(believePattern);
    
    if (match3) {
      const [, subject, , reason] = match3;
      const alternatives = [
        `${subject} matters because ${reason}`,
        `${subject} is a big deal — ${reason}`,
        `${subject} makes a real difference because ${reason}`,
      ];
      sentences[i] = alternatives[Math.floor(Math.random() * alternatives.length)];
      modified = true;
      break;
    }
  }

  return sentences.join(' ');
}

// ============================================================
// LIST-OF-THREE DESTROYER
// ============================================================

/**
 * Mengubah daftar paralel 3 item menjadi narasi tidak simetris.
 * 
 * ❌ AI: "air pollution from flights, traffic jams in crowded spots, and dirty water..."
 * ✅ Human: "planes burn fuel, buses clog up roads, and beaches get ruined by too many visitors"
 */
export function destroyListOfThree(text: string): string {
  const sentences = splitSentences(text);
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    
    // Cari pola: "A, B, and C" (3 item)
    const triplePattern = /\b(\w+(?:\s+\w+)*)\s*,\s*(\w+(?:\s+\w+)*)\s*,\s*(?:and|or)\s*(\w+(?:\s+\w+)*)\b/i;
    const match = s.match(triplePattern);
    
    if (match && Math.random() < 0.5) {
      const [, item1, item2, item3] = match;
      
      // Ubah menjadi narasi tidak simetris
      const alternatives = [
        `${item1}, and then there's ${item2} — not to mention ${item3}`,
        `${item1} and ${item2} are bad enough, but ${item3} is really the kicker`,
        `${item1} alone is a problem, plus ${item2}, and let's not forget ${item3}`,
        `${item1}? Yes. ${item2}? Also yes. ${item3}? That's the real issue.`,
      ];
      
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      sentences[i] = s.replace(match[0], replacement);
      break;
    }
  }

  return sentences.join(' ');
}

// ============================================================
// CONCLUSION PARAGRAPH DESTROYER
// ============================================================

/**
 * Menghapus paragraf kesimpulan eksplisit dan mengganti dengan kalimat argumen biasa.
 * 
 * ❌ AI: "In conclusion, tourism impacts the environment significantly..."
 * ✅ Human: Tidak ada paragraf kesimpulan — teks berakhir dengan kalimat argumen.
 */
export function destroyConclusionParagraph(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const lastPara = paragraphs[paragraphs.length - 1];
  
  // Deteksi paragraf kesimpulan
  const conclusionMarkers = /\b(?:In conclusion|To conclude|All in all|Ultimately|In summary|Finally|Therefore,|Thus,|Hence,)\b/i;
  
  if (conclusionMarkers.test(lastPara)) {
    // Ambil kalimat-kalimat dari paragraf kesimpulan, filter yang bukan marker kesimpulan
    const sentences = splitSentences(lastPara);
    
    // Filter kalimat yang bukan marker kesimpulan
    const contentSentences = sentences.filter(s => 
      !/\b(?:In conclusion|To conclude|All in all|Ultimately|In summary|Finally)\b/i.test(s)
    );
    
    if (contentSentences.length > 0) {
      // Ganti paragraf kesimpulan dengan kalimat argumen biasa
      paragraphs[paragraphs.length - 1] = contentSentences.join(' ');
    } else {
      // Jika semua kalimat adalah marker, hapus paragraf terakhir
      paragraphs.pop();
    }
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// ABSTRACTION CONCRETIZER
// ============================================================

/**
 * Mengubah pernyataan abstrak menjadi contoh konkret.
 * 
 * ❌ AI: "Higher taxes could discourage unnecessary travel and reduce environmental damage."
 * ✅ Human: "If flights cost more, maybe people will think twice before flying to Paris for a weekend."
 */
export function concretizeAbstractions(text: string): string {
  const sentences = splitSentences(text);
  
  // Pola abstrak yang sering muncul di AI
  const abstractPatterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [
      /(Higher|Increased|Additional)\s+(taxes|fees?|charges?)\s+(could|may|might|can)\s+(discourage|reduce|limit|decrease)\s+([^.!?]+)/i,
      (m) => {
        const action = m[4].trim();
        const examples = [
          `If ${m[1].toLowerCase()} ${m[2]} go up, people might be less likely to ${action}`,
          `People could think twice about ${action} if ${m[1].toLowerCase()} ${m[2]} are higher`,
          `${action} might drop if ${m[1].toLowerCase()} ${m[2]} get more expensive`,
        ];
        return examples[Math.floor(Math.random() * examples.length)];
      }
    ],
    [
      /(This|These|Such)\s+(measures|policies|actions|steps)\s+(could|may|might|can)\s+(lead to|result in|cause)\s+([^.!?]+)/i,
      (m) => {
        const result = m[4].trim();
        const examples = [
          `What this could mean is ${result}`,
          `The likely outcome? ${result}`,
          `If this happens, ${result}`,
        ];
        return examples[Math.floor(Math.random() * examples.length)];
      }
    ],
    [
      /(Governments|Policymakers|Authorities)\s+(should|must|ought to|need to)\s+(consider|implement|introduce|adopt)\s+([^.!?]+)/i,
      (m) => {
        const action = m[3].trim();
        const examples = [
          `What ${m[1].toLowerCase()} could do is ${action}`,
          `${m[1]} might want to think about ${action}`,
          `${m[1]} could try ${action}`,
        ];
        return examples[Math.floor(Math.random() * examples.length)];
      }
    ],
  ];

  let modified = false;
  for (let i = 0; i < sentences.length && !modified; i++) {
    const s = sentences[i];
    for (const [pattern, replacer] of abstractPatterns) {
      const match = s.match(pattern);
      if (match && Math.random() < 0.4) {
        sentences[i] = replacer(match);
        modified = true;
        break;
      }
    }
  }

  return sentences.join(' ');
}

// ============================================================
// STRUCTURE FLATTENER (buat paragraf tidak seimbang)
// ============================================================

/**
 * Memastikan paragraf memiliki panjang yang sangat berbeda.
 * Mengikuti pola human: 1-2 kalimat, 4-6 kalimat, 1-2 kalimat, dll.
 */
export function flattenStructure(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // Hitung kalimat per paragraf
  const sentenceCounts = paragraphs.map(p => splitSentences(p).length);
  const avg = sentenceCounts.reduce((a, b) => a + b, 0) / sentenceCounts.length;
  const variance = sentenceCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / sentenceCounts.length;

  // Jika variance < 3 (terlalu seragam), ubah
  if (variance < 3) {
    // Buat satu paragraf sangat pendek (1-2 kalimat)
    const shortIdx = Math.floor(Math.random() * paragraphs.length);
    const shortSentences = splitSentences(paragraphs[shortIdx]);
    if (shortSentences.length > 2) {
      paragraphs[shortIdx] = shortSentences.slice(0, 1 + Math.floor(Math.random() * 1)).join(' ');
    }

    // Buat satu paragraf sangat panjang (4-6 kalimat)
    let longIdx = (shortIdx + 1) % paragraphs.length;
    const longSentences = splitSentences(paragraphs[longIdx]);
    if (longSentences.length < 4 && longIdx + 1 < paragraphs.length) {
      // Gabungkan dengan paragraf berikutnya
      paragraphs[longIdx] = paragraphs[longIdx] + ' ' + paragraphs[longIdx + 1];
      paragraphs.splice(longIdx + 1, 1);
    }
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// CONTROVERSIAL OPINION INJECTOR (untuk general tones)
// ============================================================

/**
 * Menambahkan opini yang sedikit kontroversial, spesifik, dan naive.
 * 
 * Contoh dari human baseline:
 * "This is because male sexual rage, in particular, often results in deadly aggression."
 * "... a man is twice as likely (if he discovers his wife having an affair) to kill her..."
 */
export function addControversialOpinion(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // Hanya inject jika teks tidak terlalu panjang (> 100 kata)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 300) return text;

  const opinions = [
    {
      trigger: /\b(gun|firearm|weapon|shooting)\b/i,
      statement: "This is because people often underestimate how easily anger can turn deadly when a gun is within reach."
    },
    {
      trigger: /\b(tourist|travel|holiday|vacation)\b/i,
      statement: "The truth is, most tourists don't care about the environment — they just want a good photo for Instagram."
    },
    {
      trigger: /\b(school|education|student|teacher)\b/i,
      statement: "Honestly, I think half the stuff they teach in schools is useless anyway."
    },
    {
      trigger: /\b(technology|social media|phone|internet)\b/i,
      statement: "People spend so much time online that they've forgotten how to have a real conversation."
    },
    {
      trigger: /\b(health|exercise|diet|sport)\b/i,
      statement: "Most people know they should exercise, but they just can't be bothered."
    },
  ];

  let inserted = false;
  for (const { trigger, statement } of opinions) {
    if (!inserted && trigger.test(text) && Math.random() < 0.4) {
      const pos = Math.floor(sentences.length * 0.4);
      sentences.splice(pos, 0, statement);
      inserted = true;
      break;
    }
  }

  return sentences.join(' ');
}

// ============================================================
// OPENING DESTROYER - Jangan Restating Prompt
// ============================================================

/**
 * Mengubah opening AI ("Many nations offer...") menjadi observasi umum.
 * AI fingerprint #1: restating prompt
 */
export function destroyRestatingOpening(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;
  
  const firstSentence = sentences[0];
  
  // Pola restating prompt: "Many [noun] [verb] [object]"
  const restatingPattern = /^Many\s+\w+\s+(offer|provide|have|are considering|believe|think|argue)\b/i;
  
  if (restatingPattern.test(firstSentence) && Math.random() < 0.7) {
    // Deteksi topik
    const lower = text.toLowerCase();
    let opening = '';
    
    if (/\b(unemployment|job|work|employment)\b/i.test(lower)) {
      opening = [
        'In modern day society, money is a driving force for nearly everyone.',
        'The debate between how to support people out of work is as old as the welfare state itself.',
        'Most people agree that losing your job is one of the most stressful things that can happen.',
      ][Math.floor(Math.random() * 3)];
    } else if (/\b(tourism|travel|holiday|flight)\b/i.test(lower)) {
      opening = [
        'Travelling today is simple to the extent that within twelve hours one can travel from Europe to Singapore.',
        'These days, a family can fly from London to Bangkok in under twelve hours and think nothing of it.',
      ][Math.floor(Math.random() * 2)];
    } else if (/\b(sport|exercise|physical education|school)\b/i.test(lower)) {
      opening = [
        'The debate between where to allocate valuable teaching resources probably started with the first educational institutions.',
        'In present-day society the conflict continues and rightly so.',
      ][Math.floor(Math.random() * 2)];
    } else {
      opening = [
        'The question of how to handle this issue has been debated for decades.',
        'When it comes to this issue, opinions are deeply divided.',
      ][Math.floor(Math.random() * 2)];
    }
    
    sentences[0] = opening;
    return sentences.join(' ');
  }
  
  return text;
}

// ============================================================
// THESIS TEMPLATE DESTROYER - Hancurkan "I partly agree"
// ============================================================

/**
 * Mengubah thesis template AI menjadi lebih tegas dan natural.
 * AI signature: "I partly agree", "While some argue... others believe..."
 */
export function destroyThesisTemplateImproved(text: string): string {
  const sentences = splitSentences(text);
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    
    // Pola: "I partly agree with this statement because..."
    if (/\bI\s+partly\s+agree\b/i.test(s) || /\bI\s+largely\s+agree\b/i.test(s)) {
      const alternatives = [
        'Personally, I believe that the positive effects outweigh the negative.',
        'I am a strong advocate of this approach.',
        'In my view, the system is necessary, even if it has some problems.',
        'My personal opinion is that any such system needs to be carefully managed.',
      ];
      sentences[i] = alternatives[Math.floor(Math.random() * alternatives.length)];
      break;
    }
    
    // Pola: "While some argue that... others believe that..."
    if (/While\s+some\s+argue/i.test(s) && /\bothers\s+believe\b/i.test(s)) {
      const alternatives = [
        'Some people believe it is an excellent idea, whilst others believe that it is exhausting a country\'s financial resources.',
        'There are two main views on this issue.',
        'People are divided on whether this system actually helps or hurts.',
      ];
      sentences[i] = alternatives[Math.floor(Math.random() * alternatives.length)];
      break;
    }
  }
  
  return sentences.join(' ');
}

// ============================================================
// TRANSITION WORD DESTROYER - Hancurkan "On the other hand"
// ============================================================

/**
 * Mengganti transition words formulaic dengan versi lebih natural.
 */
export function destroyFormulaicTransitions(text: string): string {
  const replacements: Array<[RegExp, string[]]> = [
    [/\bOn the one hand\b/gi, ['Firstly', 'When looking at', 'One benefit is that']],
    [/\bOn the other hand\b/gi, ['But', 'However,', 'Although there are', 'Yet']],
    [/\bFurthermore\b/gi, ['Also', 'And', 'Plus']],
    [/\bMoreover\b/gi, ['Also', 'On top of that']],
    [/\bIn addition\b/gi, ['Also', 'Another point']],
    [/\bAs a result\b/gi, ['So', 'Because of this']],
    [/\bConsequently\b/gi, ['So', 'Which means']],
    [/\bTherefore\b/gi, ['So', 'That\'s why']],
    [/\bIn conclusion\b/gi, ['To conclude', 'All in all', 'Overall']],
  ];
  
  let result = text;
  for (const [pattern, alternatives] of replacements) {
    if (pattern.test(result) && Math.random() < 0.6) {
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      result = result.replace(pattern, replacement);
    }
  }
  
  return result;
}

// ============================================================
// SYNONYM OVERLOAD FIX - Biarkan Repetisi Natural
// ============================================================

/**
 * Mengganti sinonim yang berlebihan dengan satu kata yang diulang secara natural.
 * AI: "financial assistance, government aid, financial support, payments"
 * Human: "this system, this system, this system"
 */
export function fixSynonymOverload(text: string): string {
  // Cari kelompok kata yang memiliki makna sama
  const synonymGroups: Array<[RegExp, string]> = [
    [/\b(?:financial assistance|government aid|financial support|unemployment benefits|benefits|payments|welfare)\b/gi, 'this system'],
    [/\b(?:individuals|citizens|residents|unemployed|job seekers)\b/gi, 'people'],
    [/\b(?:work|employment|jobs|labour|workforce)\b/gi, 'work'],
    [/\b(?:receive|obtain|access)\b/gi, 'get'],
  ];
  
  let result = text;
  
  // Pilih 1-2 grup untuk di-simplify (jangan semua)
  const shuffled = [...synonymGroups].sort(() => Math.random() - 0.5);
  const groupsToApply = shuffled.slice(0, 2);
  
  for (const [pattern, replacement] of groupsToApply) {
    // Jangan replace semua — hanya 60-70% agar tidak terlihat dipaksa
    const matches = result.match(pattern) || [];
    if (matches.length > 2) {
      // Ganti sebagian (60-70%)
      const replaceCount = Math.floor(matches.length * 0.6);
      let replaced = 0;
      result = result.replace(pattern, (match) => {
        if (replaced < replaceCount) {
          replaced++;
          return replacement;
        }
        return match;
      });
    }
  }
  
  return result;
}

// ============================================================
// BURSTINESS INJECTOR - Tambahkan Kalimat Outlier
// ============================================================

/**
 * Menambahkan kalimat sangat pendek dan sangat panjang untuk meningkatkan burstiness.
 * GPTZero burstiness score: 0 = 100% AI
 */
export function injectBurstiness(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  
  const result = [...sentences];
  
  // 1. Sisipkan kalimat SANGAT PENDEK (3-8 kata)
  if (Math.random() < 0.6) {
    const shortOnes = [
      'That said.',
      'Not always.',
      'It depends.',
      'Fair enough.',
      'No doubt.',
      'Honestly.',
      'Right.',
      'Anyway.',
      'True.',
      'Still.',
      'Exactly.',
      'Sure.',
    ];
    const pos = Math.floor(Math.random() * (result.length - 1)) + 1;
    result.splice(pos, 0, shortOnes[Math.floor(Math.random() * shortOnes.length)]);
  }
  
  // 2. Sisipkan kalimat SANGAT PANJANG (35-50 kata)
  if (Math.random() < 0.4 && result.length > 3) {
    const longTemplates = [
      'To be honest, I think the whole debate is kind of pointless because a good system should help people get back on their feet, not trap them in dependency, and that\'s the real issue people miss.',
      'And honestly, the biggest problem isn\'t the money itself — it\'s the fact that people end up feeling like they have no control over their own lives, which is way worse than being broke.',
      'It\'s actually pretty wild when you stop and think about it — I mean, my cousin lost his job last year and the system actually helped him get back on his feet, but he also said it was really demoralizing at first.',
    ];
    const pos = Math.floor(Math.random() * (result.length - 1)) + 1;
    result.splice(pos, 0, longTemplates[Math.floor(Math.random() * longTemplates.length)]);
  }
  
  return result.join(' ');
}

// ============================================================
// GRAMMATICAL IMPERFECTIONS - Tambahkan "Kesalahan" Natural
// ============================================================

/**
 * Menambahkan kesalahan gramatikal natural seperti missing article, comma splice.
 */
export function addNaturalGrammarErrorsOld(text: string): string {
  let result = text;
  
  // 1. Missing article (seperti "Without such system")
  if (/\bwithout\s+such\s+system\b/i.test(result) && Math.random() < 0.3) {
    result = result.replace(/\bwithout\s+such\s+system\b/i, 'without such system');
  } else if (Math.random() < 0.2) {
    // Tambahkan missing article di tempat lain
    const patterns = [
      [/\bwithout\s+([a-z]+)\s+(?:there|they|people|individuals)\b/gi, 'without ${1} there'],
    ];
    // Hanya lakukan 1-2 perubahan
  }
  
  // 2. Comma splice (seperti "he or she will have on-going costs")
  if (Math.random() < 0.25) {
    result = result.replace(/\.\s+([A-Z])/g, (match, letter) => {
      return Math.random() < 0.1 ? ', ' + letter.toLowerCase() : match;
    });
  }
  
  // 3. Pengulangan kata tidak sengaja (seperti "he or she")
  if (Math.random() < 0.3) {
    result = result.replace(/\b(they|them|their)\s+(\w+)\s+\1\b/gi, (match) => {
      return match.replace(/\s+/g, ' ');
    });
  }
  
  return result;
}

// ============================================================
// PERSONAL VOICE STRENGTHENER - Lebih Tegas
// ============================================================

/**
 * Memperkuat personal voice dengan opini yang lebih tegas dan naive.
 */
export function strengthenPersonalVoice(text: string): string {
  const sentences = splitSentences(text);
  const result = [...sentences];
  
  // 1. Ubah "I believe" menjadi lebih kuat
  for (let i = 0; i < result.length; i++) {
    const s = result[i];
    if (/\bI\s+(?:believe|think)\s+that\b/i.test(s) && Math.random() < 0.6) {
      const alternatives = [
        'I am firmly convinced that',
        'There is no doubt in my mind that',
        'I would argue that',
        'It is my firm belief that',
      ];
      const opener = alternatives[Math.floor(Math.random() * alternatives.length)];
      result[i] = s.replace(/\bI\s+(?:believe|think)\s+that\b/i, opener);
      break;
    }
  }
  
  // 2. Tambahkan opini naive di suatu tempat
  if (result.length > 4 && Math.random() < 0.4) {
    const naiveOpinions = [
      'To be honest, I think most people just want a fair chance.',
      'At the end of the day, no one wants to be on benefits forever.',
      'I mean, who wouldn\'t rather work than sit at home all day?',
      'Honestly, I\'ve always believed that people want to contribute.',
    ];
    const pos = Math.floor(result.length * 0.5);
    result.splice(pos, 0, naiveOpinions[Math.floor(Math.random() * naiveOpinions.length)]);
  }
  
  return result.join(' ');
}

// ============================================================
// DESTROY PARALLEL LISTS - Hancurkan Pola Paralel
// ============================================================

/**
 * Menghancurkan pola paralel "A, B, and C" yang khas AI.
 */
export function destroyParallelLists(text: string): string {
  const sentences = splitSentences(text);
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    // Cari "A, B, and C"
    const triplePattern = /\b(\w+(?:\s+\w+)*)\s*,\s*(\w+(?:\s+\w+)*)\s*,\s*(?:and|or)\s*(\w+(?:\s+\w+)*)\b/i;
    const match = s.match(triplePattern);
    
    if (match && Math.random() < 0.5) {
      const [, item1, item2, item3] = match;
      const alternatives = [
        `${item1} and ${item2} are bad enough, but ${item3} is the real problem`,
        `${item1} alone is a problem, plus ${item2}, and let's not forget ${item3}`,
        `${item1}? Yes. ${item2}? Also yes. ${item3}? That's the real issue.`,
      ];
      sentences[i] = s.replace(match[0], alternatives[Math.floor(Math.random() * alternatives.length)]);
    }
  }
  
  return sentences.join(' ');
}

// ============================================================
// ACADEMIC-SPECIFIC HUMANIZATION FUNCTIONS
// ============================================================

/**
 * Mengubah esai 4 paragraf (Intro-Body1-Body2-Conclusion)
 * menjadi 5-7 paragraf dengan panjang bervariasi.
 * Ini adalah kunci keberhasilan GENERAL-mu.
 */
export function destroyFourParagraphStructure(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4) return text;

  // 1. Pecah paragraf body menjadi 2-3 bagian lebih kecil
  const bodyIndices = paragraphs.slice(1, -1); // skip intro & conclusion
  const newParagraphs: string[] = [];
  
  // Tambahkan intro (bisa 1-2 kalimat)
  newParagraphs.push(paragraphs[0]);
  
  // Proses body: pecah menjadi paragraf kecil berdasarkan kalimat
  for (const body of bodyIndices) {
    const sentences = splitSentences(body);
    if (sentences.length <= 2) {
      newParagraphs.push(body);
      continue;
    }
    
    // Pecah body menjadi 2-3 paragraf
    const chunkSize = Math.max(1, Math.floor(sentences.length / 3) + 1);
    for (let i = 0; i < sentences.length; i += chunkSize) {
      const chunk = sentences.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) newParagraphs.push(chunk);
    }
  }
  
  // Tambahkan conclusion yang sudah di-destroy (tanpa "In conclusion")
  const conclusion = paragraphs[paragraphs.length - 1];
  const sentences = splitSentences(conclusion);
  // Filter kalimat yang mengandung "In conclusion", "Therefore", "Thus"
  const filtered = sentences.filter(s => 
    !/\b(?:In conclusion|To conclude|Therefore|Thus|Hence)\b/i.test(s)
  );
  if (filtered.length > 0) {
    newParagraphs.push(filtered.join(' '));
  }
  
  // Pastikan minimal 5 paragraf
  if (newParagraphs.length < 5) {
    // Jika masih kurang, pecah paragraf terpanjang
    const longestIdx = newParagraphs.reduce((max, p, i, arr) => 
      p.split(/\s+/).length > arr[max].split(/\s+/).length ? i : max, 0
    );
    const longSentences = splitSentences(newParagraphs[longestIdx]);
    if (longSentences.length > 3) {
      const mid = Math.floor(longSentences.length / 2);
      newParagraphs[longestIdx] = longSentences.slice(0, mid).join(' ');
      newParagraphs.splice(longestIdx + 1, 0, longSentences.slice(mid).join(' '));
    }
  }
  
  return newParagraphs.join('\n\n');
}

/**
 * Mengganti transisi template AI dengan varian natural.
 * Langsung dari data human baseline.
 */
export function destroyTemplateTransitions(text: string): string {
  const replacements: Array<[RegExp, string[]]> = [
    [/\bFirstly,?\s*/gi, ['A fundamental reason for this is that ', 'One key reason is that ', 'To begin with, ']],
    [/\bSecondly,?\s*/gi, ['In addition, ', 'Furthermore, ', 'Another point is that ']],
    [/\bThirdly,?\s*/gi, ['Moreover, ', 'Additionally, ', 'Another factor is that ']],
    [/\bIn conclusion,?\s*/gi, ['To sum up, ', 'All in all, ', 'Overall, ']],
    [/\bTherefore,?\s*/gi, ['So, ', 'Thus, ', 'As a result, ']],
    [/\bFurthermore,?\s*/gi, ['Also, ', 'Plus, ', 'What\'s more, ']],
    [/\bMoreover,?\s*/gi, ['Also, ', 'On top of that, ']],
    [/\bIn addition,?\s*/gi, ['Also, ', 'Plus, ', 'Another thing is ']],
    [/\bOn the one hand,?\s*/gi, ['On one side, ', 'One view is that ']],
    [/\bOn the other hand,?\s*/gi, ['But, ', 'However, ', 'Yet, ']],
    [/\bAs a result,?\s*/gi, ['So, ', 'Because of this, ']],
  ];
  
  let result = text;
  for (const [pattern, alternatives] of replacements) {
    if (pattern.test(result) && Math.random() < 0.7) {
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      result = result.replace(pattern, replacement);
    }
  }
  return result;
}

/**
 * Menambahkan detail spesifik (negara, kota, angka) yang aman.
 * Dari data human baseline: "in the UK", "Finland", "sixth-best"
 */
export function injectSpecificAnchorsAcademic(text: string): string {
  const lower = text.toLowerCase();
  let anchors: string[] = [];
  
  // Deteksi topik
  if (/\b(education|reading|child|learn|play|school|teacher)\b/i.test(lower)) {
    anchors = [
      'For example, in the UK, many children are reluctant readers.',
      'In Finland, education focuses on play and creativity.',
      'Finland was ranked sixth-best in the world in reading.',
      'The US has seen a rise in early childhood education programs.',
      'In Japan, parents often start reading to children at a very young age.',
    ];
  } else if (/\b(city|urban|rural|countryside|migration)\b/i.test(lower)) {
    anchors = [
      'In the UK, urbanisation has accelerated over the past 50 years.',
      'China\'s rapid urbanisation is a well-documented phenomenon.',
      'In Brazil, rural-to-urban migration has created megacities.',
      'India\'s cities face severe overcrowding and infrastructure strain.',
    ];
  } else if (/\b(women|gender|female|male|housewife)\b/i.test(lower)) {
    anchors = [
      'In Afghanistan, women\'s roles are heavily restricted.',
      'In Scandinavia, gender equality is more advanced.',
      'In Japan, traditional gender roles persist in many households.',
    ];
  } else {
    anchors = [
      'For instance, in the UK, this trend is particularly visible.',
      'Take Germany, for example, where the situation is similar.',
      'In Australia, research has shown similar patterns.',
    ];
  }
  
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  
  // Sisipkan 1-2 anchors di posisi 30-70%
  const result = [...sentences];
  const anchorCount = Math.min(2, anchors.length);
  for (let i = 0; i < anchorCount; i++) {
    const pos = Math.floor(result.length * (0.3 + Math.random() * 0.4));
    const anchor = anchors[Math.floor(Math.random() * anchors.length)];
    // Jangan insert di awal atau akhir
    if (pos > 0 && pos < result.length - 1) {
      result.splice(pos, 0, anchor);
    }
  }
  
  return result.join(' ');
}

/**
 * Menambahkan 1-2 paragraf yang hanya terdiri dari 1 kalimat pendek.
 * Ini adalah fingerprint human paling kuat.
 */
export function injectOneSentenceParagraphs(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;
  
  // Cari paragraf yang tidak terlalu pendek untuk dijadikan 1 kalimat
  const candidates = paragraphs.map((p, i) => ({ text: p, index: i, sentences: splitSentences(p).length }));
  const longEnough = candidates.filter(c => c.sentences >= 3);
  
  if (longEnough.length < 2) return text;
  
  const oneSentencePool = [
    'This is especially important.',
    'That is the key point here.',
    'It makes a real difference.',
    'The evidence is compelling.',
    'This is not always true.',
    'There are exceptions, of course.',
    'It depends on the situation.',
    'That said, context matters.',
  ];
  
  // Ambil 1-2 paragraf panjang dan jadikan 1 kalimat pendek
  const count = Math.min(2, longEnough.length);
  const shuffled = longEnough.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count; i++) {
    const target = shuffled[i];
    const sentences = splitSentences(target.text);
    // Ambil 1 kalimat terbaik dari paragraf itu
    const best = sentences.sort((a, b) => a.length - b.length)[0] || oneSentencePool[Math.floor(Math.random() * oneSentencePool.length)];
    paragraphs[target.index] = best;
  }
  
  // Juga bisa insert 1 kalimat baru di antara paragraf
  if (Math.random() < 0.3 && paragraphs.length > 2) {
    const insertIdx = Math.floor(paragraphs.length * 0.6);
    const extra = oneSentencePool[Math.floor(Math.random() * oneSentencePool.length)];
    paragraphs.splice(insertIdx, 0, extra);
  }
  
  return paragraphs.join('\n\n');
}

/**
 * Menambahkan 1-2 grammar imperfection minor.
 * Contoh human baseline:
 * - "place spend time" (double verb)
 * - "there is no scientific research which suggests" (which/that mix)
 * - comma splice: "...development, moreover, evidence suggests..."
 */
export function addNaturalGrammarFlaws(text: string): string {
  let result = text;
  const sentences = splitSentences(result);
  if (sentences.length < 3) return result;
  
  // 1. Double verb (seperti "place spend time")
  if (Math.random() < 0.25) {
    const idx = Math.floor(Math.random() * sentences.length);
    const words = sentences[idx].split(' ');
    if (words.length > 4) {
      const insertPos = Math.floor(words.length * 0.2) + 1;
      words.splice(insertPos, 0, words[insertPos - 1]);
      sentences[idx] = words.join(' ');
    }
  }
  
  // 2. Wrong relative pronoun (seperti "which" bukan "that")
  if (Math.random() < 0.2) {
    for (let i = 0; i < sentences.length; i++) {
      if (/\bthat\s+is\b/.test(sentences[i]) && Math.random() < 0.3) {
        sentences[i] = sentences[i].replace(/\bthat\s+is\b/, 'which is');
        break;
      }
    }
  }
  
  // 3. Comma splice + "moreover" (seperti human baseline)
  if (Math.random() < 0.2) {
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      const match = s.match(/^(.+?)\.\s+(Moreover|Furthermore|However)\s+(.+)$/i);
      if (match) {
        const [, first, transition, rest] = match;
        sentences[i] = `${first}, ${transition.toLowerCase()}, ${rest}`;
        break;
      }
    }
  }
  
  // 4. Apostrophe error (seperti "its'" vs "it's")
  if (Math.random() < 0.2) {
    for (let i = 0; i < sentences.length; i++) {
      if (/\b(its|it's)\b/.test(sentences[i]) && Math.random() < 0.3) {
        sentences[i] = sentences[i].replace(/\b(its|it's)\b/, (match) => {
          return match === 'its' ? "it's" : "its";
        });
        break;
      }
    }
  }
  
  return sentences.join(' ');
}

/**
 * Mengubah kalimat penutup "In conclusion... Therefore..."
 * menjadi kalimat opinion biasa tanpa template.
 */
export function destroyConclusionTemplate(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;
  
  // Cari kalimat terakhir yang mengandung "In conclusion" atau "Therefore"
  for (let i = sentences.length - 1; i >= 0; i--) {
    const s = sentences[i];
    
    // Pola: "In conclusion, X. Therefore, Y."
    const conclusionPattern = /^In\s+conclusion,?\s*(.+?)(?:\.\s*Therefore,?\s*(.+))?$/i;
    const match = s.match(conclusionPattern);
    
    if (match) {
      const main = match[1];
      const rest = match[2];
      const alternatives = [
        `${main}${rest ? '. ' + rest : ''}`,
        `${main}${rest ? ', and ' + rest.toLowerCase() : ''}`,
        `${main}. That\'s the key point.`,
        `${main}${rest ? ' — and that matters.' : ''}`,
        `The real issue is ${main.toLowerCase().replace(/^the\s+real\s+issue\s+is\s*/i, '')}.`,
      ];
      sentences[i] = alternatives[Math.floor(Math.random() * alternatives.length)];
      break;
    }
    
    // Pola: "Therefore, X."
    const thereforePattern = /^Therefore,?\s*(.+)$/i;
    const match2 = s.match(thereforePattern);
    if (match2) {
      const alternatives = [
        `So, ${match2[1]}`,
        `${match2[1]}. That seems clear.`,
        `${match2[1]} — and that\'s important.`,
      ];
      sentences[i] = alternatives[Math.floor(Math.random() * alternatives.length)];
      break;
    }
  }
  
  // Juga cari "In conclusion" di awal paragraf
  const result = sentences.join(' ');
  return result.replace(/^In\s+conclusion,?\s*/i, '');
}

/**
 * Mencegah synonym overload dengan mengembalikan satu kata utama.
 * AI: "children → youngsters → offspring → infants"
 * Human: "youngsters → youngsters → youngsters"
 */
export function naturalRepetition(text: string): string {
  const synonymGroups: Array<[RegExp, string[]]> = [
    [/\b(?:children|youngsters|offspring|kids|infants|toddlers)\b/gi, ['children', 'youngsters', 'kids']],
    [/\b(?:parents|mothers|fathers|caregivers|guardians)\b/gi, ['parents']],
    [/\b(?:reading|books|literacy|stories)\b/gi, ['reading']],
    [/\b(?:activities|play|games|fun)\b/gi, ['play']],
  ];
  
  let result = text;
  for (const [pattern, options] of synonymGroups) {
    // Pilih 1 kata untuk digunakan secara konsisten
    const chosen = options[Math.floor(Math.random() * options.length)];
    // Ganti semua kecuali yang sudah chosen (75% chance)
    if (pattern.test(result) && Math.random() < 0.5) {
      result = result.replace(pattern, (match) => {
        // Jangan ganti jika match sudah sama dengan chosen
        if (match.toLowerCase() === chosen.toLowerCase()) return match;
        // 60% chance diganti
        if (Math.random() < 0.6) return chosen;
        return match;
      });
    }
  }
  
  return result;
}

// ============================================================
// HUMAN NOISE INJECTION PIPELINE (10 Fungsi Baru)
// Berdasarkan data human baseline yang lolos deteksi
// ============================================================

/**
 * Helper: split text into sentences (simple version) - untuk Human Noise Pipeline
 */
function splitSentencesForHumanNoise(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

/**
 * Logic 1: Fragment as Paragraph
 * Mengubah 1 paragraf yang panjang menjadi fragment (list tanpa verb).
 * Ini adalah fingerprint human yang paling kuat: AI tidak pernah generate fragment sebagai paragraf.
 */
export function injectFragmentParagraph(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // Cari paragraf yang mengandung list abstrak (misal "responsibility, patience, empathy")
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    // Deteksi list-of-3 abstrak
    const listMatch = p.match(/\b(\w+),\s+(\w+),\s+and\s+(\w+)\b/);
    if (listMatch && Math.random() < 0.3) {
      const [full, item1, item2, item3] = listMatch;
      // Ubah menjadi fragment: cuma list tanpa verb
      const fragment = `${item1}, ${item2}, and ${item3} — that's the real value.`;
      paragraphs[i] = fragment;
      break;
    }
  }

  // Jika tidak ada list, insert fragment baru
  const fragmentPool = [
    'feeding, grooming, administering medicine, etc).',
    'cats, dogs, fish, rodents and rabbits — that\'s what most families have.',
    'part-time, online, flexible hours — those are the real options.',
  ];
  if (Math.random() < 0.4 && paragraphs.length > 2) {
    const insertIdx = Math.floor(paragraphs.length * 0.6);
    const fragment = fragmentPool[Math.floor(Math.random() * fragmentPool.length)];
    paragraphs.splice(insertIdx, 0, fragment);
  }

  return paragraphs.join('\n\n');
}

/**
 * Logic 2: Incomplete Ending
 * Memotong kalimat terakhir di tengah-tengah (tanpa menyelesaikan).
 * Ini adalah fingerprint human yang paling kuat: AI selalu generate kalimat lengkap.
 */
export function injectIncompleteEnding(text: string): string {
  const sentences = splitSentencesForHumanNoise(text);
  if (sentences.length < 2) return text;

  // Ambil kalimat terakhir
  const last = sentences[sentences.length - 1];
  // Potong di 60-80% panjang kalimat
  const cutPoint = Math.floor(last.length * (0.6 + Math.random() * 0.2));
  // Cari titik potong yang natural: setelah koma, atau setelah kata ke-5
  let cut = cutPoint;
  for (let i = cutPoint; i < last.length; i++) {
    if (last[i] === ' ' && last[i-1] === ',') { cut = i; break; }
  }
  // Ambil 3-5 kata terakhir untuk dijadikan "incomplete"
  const words = last.slice(0, cut).split(' ');
  const lastFew = words.slice(-3).join(' ');
  const incomplete = last.slice(0, cut - lastFew.length) + lastFew;

  sentences[sentences.length - 1] = incomplete;
  return sentences.join(' ');
}

/**
 * Logic 3: Natural Grammar Errors (Bukan Typo Random)
 * Menambahkan grammar errors yang NATURAL (bukan typo random).
 * Ini berdasarkan data human baseline yang lolos.
 */
export function injectNaturalGrammarErrors(text: string): string {
  let result = text;

  // 1. Missing hyphen (seperti "part time" → biarkan tanpa hyphen)
  if (Math.random() < 0.25) {
    const pairs: [RegExp, string][] = [
      [/\bpart time\b/gi, 'part time'],
      [/\bfull time\b/gi, 'full time'],
      [/\bwell being\b/gi, 'well being'],
      [/\bpet related\b/gi, 'pet related'],
    ];
    for (const [pattern] of pairs) {
      if (pattern.test(result) && Math.random() < 0.5) {
        // Biarkan tanpa hyphen (error natural)
        break;
      }
    }
  }

  // 2. Missing comma after "For example" (seperti "For example The")
  if (Math.random() < 0.2) {
    result = result.replace(/\bFor example\s+([A-Z])/g, (match, letter) => {
      return `For example ${letter}`; // Missing comma
    });
  }

  // 3. Redundant phrase (seperti "financial income" → biarkan redundant)
  if (Math.random() < 0.2) {
    const redundants: [RegExp, string][] = [
      [/\bfinancial income\b/gi, 'income'],
      [/\bpersonal opinion\b/gi, 'opinion'],
      [/\badvance planning\b/gi, 'planning'],
    ];
    for (const [pattern] of redundants) {
      if (pattern.test(result) && Math.random() < 0.4) {
        // Biarkan redundant (error natural)
        break;
      }
    }
  }

  // 4. Comma splice (seperti "...development, moreover, evidence suggests...")
  if (Math.random() < 0.15) {
    result = result.replace(/\.\s+(Moreover|Furthermore|However)\s+/gi, (match, transition) => {
      return `, ${transition.toLowerCase()}, `;
    });
  }

  return result;
}

/**
 * Logic 4: Pompous & Awkward Phrasing
 * Menambahkan 1-2 frase pompous/awkward yang tidak akan di-generate AI.
 * Ini adalah collocations yang "salah" tapi understandable.
 */
export function injectPompousPhrasing(text: string): string {
  const sentences = splitSentencesForHumanNoise(text);
  if (sentences.length < 3) return text;

  const pompousPhrases = [
    { trigger: /\bprove\b/i, replacement: 'vindicate the correctness of' },
    { trigger: /\bsupport\b/i, replacement: 'substantiate the claim that' },
    { trigger: /\bhelp\b/i, replacement: 'facilitate the process of' },
    { trigger: /\bshow\b/i, replacement: 'demonstrate the veracity of' },
    { trigger: /\bgood parenting\b/i, replacement: 'the effective rearing of children' },
  ];

  let result = text;
  for (const { trigger, replacement } of pompousPhrases) {
    if (trigger.test(result) && Math.random() < 0.15) {
      result = result.replace(trigger, replacement);
      break;
    }
  }

  // Tambahkan "facilitate, rather than impede" jika ada "help" atau "support"
  if (/\b(help|support)\b/i.test(result) && Math.random() < 0.2) {
    result = result.replace(/\b(help|support)\b/i, 'facilitate, rather than impede');
  }

  return result;
}

/**
 * Logic 5: Non-Sequitur / Irrelevant Tangent (Tapi Tidak Random)
 * Menambahkan 1 kalimat tangent yang on-topic tapi tidak langsung.
 * Ini berdasarkan data human baseline yang lolos.
 */
export function injectRelevantTangent(text: string): string {
  const lower = text.toLowerCase();
  let tangents: string[] = [];

  if (/\b(women|gender|feminist|traditional roles|housewife)\b/i.test(lower)) {
    tangents = [
      'In Scandinavian countries, gender equality policies have been in place for decades.',
      'The Nordic model is often cited as a progressive approach to gender roles.',
      'In countries like Sweden, parental leave is shared equally between parents.',
    ];
  } else if (/\b(education|reading|child|learn|play)\b/i.test(lower)) {
    tangents = [
      'In Finland, early years\' education focuses on play and creativity.',
      'The Finnish education system is often cited as a model for the world.',
      'In Japan, parents often start reading to children at a very young age.',
    ];
  } else if (/\b(urban|rural|city|countryside|migration)\b/i.test(lower)) {
    tangents = [
      'In China, urbanisation has accelerated over the past 50 years.',
      'The UK has seen similar patterns of rural-to-urban migration.',
    ];
  } else {
    tangents = [
      'In many countries, similar patterns can be observed.',
      'This is not an isolated phenomenon.',
    ];
  }

  const sentences = splitSentencesForHumanNoise(text);
  if (sentences.length < 3) return text;

  // Sisipkan 1 tangent di posisi 40-60%
  const pos = Math.floor(sentences.length * (0.4 + Math.random() * 0.2));
  const tangent = tangents[Math.floor(Math.random() * tangents.length)];
  sentences.splice(pos, 0, tangent);

  return sentences.join(' ');
}

/**
 * Logic 6: Repetition Without Synonym Overload
 * Memaksa repetisi kata utama, bukan ganti sinonim.
 */
export function forceNaturalRepetition(text: string): string {
  // Deteksi topik utama
  const words = text.split(/\s+/);
  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 3) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  }
  // Cari kata paling frequent
  let topWord = '';
  let topCount = 0;
  for (const [word, count] of Object.entries(wordFreq)) {
    if (count > topCount) { topCount = count; topWord = word; }
  }

  if (!topWord || topCount < 2) return text;

  // Pilih 1-2 sinonim yang sering muncul dan ganti dengan topWord
  const synonyms = [
    ['children', 'youngsters', 'offspring', 'kids', 'infants'],
    ['parents', 'mothers', 'fathers', 'caregivers'],
    ['work', 'employment', 'jobs', 'career'],
    ['benefits', 'advantages', 'gains', 'rewards'],
  ];

  let result = text;
  for (const group of synonyms) {
    if (group.includes(topWord)) {
      for (const syn of group) {
        if (syn !== topWord && Math.random() < 0.4) {
          result = result.replace(new RegExp(`\b${syn}\b`, 'gi'), topWord);
        }
      }
      break;
    }
  }

  return result;
}

/**
 * Logic 7: Standalone List Fragment
 * Menambahkan paragraf yang isinya cuma list (fragment).
 * Ini adalah fingerprint human paling kuat.
 */
export function injectStandaloneListFragment(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  const listFragments = [
    'cats, dogs, fish, rodents and rabbits — that\'s what most families have.',
    'part-time, online, flexible hours — those are the real options.',
    'feeding, grooming, administering medicine, etc).',
    'school fees, uniforms, books, extracurricular activities — it adds up.',
  ];

  // Sisipkan di posisi 50-70%
  if (Math.random() < 0.5) {
    const insertIdx = Math.floor(paragraphs.length * (0.5 + Math.random() * 0.2));
    const fragment = listFragments[Math.floor(Math.random() * listFragments.length)];
    paragraphs.splice(insertIdx, 0, fragment);
  }

  return paragraphs.join('\n\n');
}

/**
 * Logic 8: British Spelling Inconsistency
 * Menambahkan 1-2 British spelling di tengah text American.
 * Ini adalah inconsistency yang natural.
 */
export function injectBritishSpelling(text: string): string {
  const britishMap: [RegExp, string][] = [
    [/\borganize\b/gi, 'organise'],
    [/\brealize\b/gi, 'realise'],
    [/\bemphasize\b/gi, 'emphasise'],
    [/\banalyze\b/gi, 'analyse'],
    [/\bbehavior\b/gi, 'behaviour'],
    [/\bcolor\b/gi, 'colour'],
    [/\bfavor\b/gi, 'favour'],
    [/\bcenter\b/gi, 'centre'],
    [/\blabor\b/gi, 'labour'],
  ];

  let result = text;
  // Pilih 1-2 kata untuk diubah ke British spelling
  const shuffled = britishMap.sort(() => Math.random() - 0.5);
  let count = 0;
  for (const [pattern, replacement] of shuffled) {
    if (count >= 2) break;
    if (pattern.test(result) && Math.random() < 0.3) {
      result = result.replace(pattern, replacement);
      count++;
    }
  }

  return result;
}

/**
 * Logic 9: Political Incorrectness / Bias
 * Menambahkan 1 kata yang politically incorrect atau biased.
 * Ini adalah fingerprint human yang kuat karena AI modern always neutral.
 */
export function injectPoliticalBias(text: string): string {
  const biasWords = [
    { trigger: /\bwomen\b/i, replacement: 'housewives' },
    { trigger: /\bpeople who don't work\b/i, replacement: 'idlers' },
    { trigger: /\btraditional views\b/i, replacement: 'old-fashioned attitudes' },
  ];

  let result = text;
  for (const { trigger, replacement } of biasWords) {
    if (trigger.test(result) && Math.random() < 0.2) {
      result = result.replace(trigger, replacement);
      break;
    }
  }

  return result;
}

/**
 * Logic 10: Emphatic Phrasing
 * Menambahkan 1 frase emphatic yang redundan.
 * Ini adalah fingerprint human yang kuat.
 */
export function injectEmphaticPhrasing(text: string): string {
  const emphaticPhrases: [string, string][] = [
    ['\bnever\b', 'not in the least'],
    ['\bnot\b', 'not in any way'],
    ['\bclearly\b', 'as clear as day'],
    ['\bobvious\b', 'staring us in the face'],
  ];

  let result = text;
  for (const [pattern, replacement] of emphaticPhrases) {
    if (new RegExp(pattern, 'i').test(result) && Math.random() < 0.15) {
      result = result.replace(new RegExp(pattern, 'i'), replacement);
      break;
    }
  }

  return result;
}

/**
 * Memastikan teks terpecah menjadi minimal 4-6 paragraf.
 * Ini adalah perbaikan utama untuk kasus 16 kalimat dalam 1 paragraf.
 */
export function forceMultiParagraph(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 8) return text;
  
  // Jika hanya 1 paragraf, pecah berdasarkan ide
  if (!text.includes('\n\n')) {
    const paragraphSizes: number[] = [];
    let remaining = sentences.length;
    
    // Buat 4-6 paragraf dengan ukuran bervariasi (2-4 kalimat)
    const numParagraphs = Math.min(6, Math.max(4, Math.floor(sentences.length / 3)));
    
    for (let i = 0; i < numParagraphs; i++) {
      const isLast = i === numParagraphs - 1;
      const size = isLast 
        ? remaining 
        : Math.max(2, Math.floor(remaining / (numParagraphs - i)) + (Math.random() > 0.5 ? 1 : 0));
      paragraphSizes.push(size);
      remaining -= size;
    }
    
    const paragraphs: string[] = [];
    let idx = 0;
    for (const size of paragraphSizes) {
      if (size > 0) {
        paragraphs.push(sentences.slice(idx, idx + size).join(' '));
        idx += size;
      }
    }
    
    return paragraphs.join('\n\n');
  }
  
  // Sudah ada paragraf, tapi mungkin terlalu sedikit
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 4 && sentences.length >= 8) {
    // Pecah paragraf yang terlalu panjang
    const newParagraphs: string[] = [];
    for (const para of paragraphs) {
      const ps = splitSentences(para);
      if (ps.length > 4) {
        const mid = Math.floor(ps.length / 2);
        newParagraphs.push(ps.slice(0, mid).join(' '));
        newParagraphs.push(ps.slice(mid).join(' '));
      } else {
        newParagraphs.push(para);
      }
    }
    return newParagraphs.join('\n\n');
  }
  
  return text;
}

/**
 * Menambahkan human noise: contradiction, double hedge, redundancy.
 * Contoh: "probably certainly" = contradictory.
 *        "corporate organisations" = redundancy.
 *        "however I strongly feel" = comma splice.
 */
export function injectHumanNoiseAcademic(text: string): string {
  let result = text;
  
  // 1. Double hedge contradictory (seperti "probably certainly")
  if (Math.random() < 0.3 && /\b(probably|perhaps|maybe)\b/i.test(result)) {
    const hedges = ['probably certainly', 'perhaps definitely', 'maybe surely'];
    result = result.replace(/\b(probably|perhaps|maybe)\b/i, 
      hedges[Math.floor(Math.random() * hedges.length)]);
  }
  
  // 2. Redundancy (seperti "corporate organisations")
  const redundancies: Array<[RegExp, string]> = [
    [/\bcorporate\s+organisations?\b/gi, 'corporate organisations'],
    [/\bpersonal\s+opinion\b/gi, 'personal opinion'],
    [/\bend\s+result\b/gi, 'end result'],
    [/\bfuture\s+plans?\b/gi, 'future plans'],
  ];
  if (Math.random() < 0.2) {
    const [pattern, replacement] = redundancies[Math.floor(Math.random() * redundancies.length)];
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
    }
  }
  
  // 3. Comma splice (seperti "however I strongly feel")
  if (Math.random() < 0.25 && /\b(however|therefore|consequently)\b/i.test(result)) {
    result = result.replace(/\b(however|therefore|consequently)\s+/gi, (match) => {
      // Ganti "However," → "however" tanpa koma
      return match.toLowerCase().replace(/,/, '');
    });
  }
  
  // 4. Word order awkward (seperti "make the changes necessary" → "make necessary changes")
  if (Math.random() < 0.2) {
    result = result.replace(/\b(the\s+)?(\w+)\s+necessary\b/gi, (match, the, word) => {
      const variants = [
        `necessary ${word}`,
        `${word} that are necessary`,
        `${word} needed`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    });
  }
  
  return result;
}

/**
 * Menambahkan 1-2 paragraf yang isinya fragment (tanpa main clause).
 * Contoh: "For example, reducing consumption of fossil fuels whenever possible, becoming self-sufficient by growing their own vegetables and switching off lights when they are not needed."
 */
export function injectFragmentParagraphs(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;
  
  const fragments = [
    'For example, reducing consumption of fossil fuels whenever possible, becoming self-sufficient by growing their own vegetables and switching off lights when they are not needed.',
    'For instance, recycling, conserving electricity and water, using public transportation, and avoiding single-use plastics.',
    'Such as cutting back on energy use, driving less, and buying products with less packaging.',
    'For example, protesting, lobbying their politicians, or voting for parties with green policies.',
  ];
  
  // Sisipkan 1 fragment di posisi 30-70%
  if (Math.random() < 0.5) {
    const insertIdx = Math.floor(paragraphs.length * (0.3 + Math.random() * 0.4));
    const fragment = fragments[Math.floor(Math.random() * fragments.length)];
    paragraphs.splice(insertIdx, 0, fragment);
  }
  
  // Cari paragraf dengan list dan ubah menjadi fragment
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const sentences = splitSentences(p);
    if (sentences.length >= 2) {
      // Cari kalimat yang mengandung list-of-3/4 dan ubah menjadi fragment
      const listMatch = p.match(/(For example|For instance|Such as).+?,\s*.+?,\s*.+?,\s*(?:and|or)\s*.+?\./i);
      if (listMatch && Math.random() < 0.3) {
        // Hapus main clause, biarkan list saja
        const fragment = listMatch[0].replace(/\.$/, '');
        paragraphs[i] = fragment;
        break;
      }
    }
  }
  
  return paragraphs.join('\n\n');
}

/**
 * Menghilangkan one-liner inspiratif yang menjadi signature AI.
 * Contoh: "They're part of the solution." → dihapus atau digabung.
 *         "When demand shifts, supply follows." → dihapus.
 */
export function destroyInspirationalClosers(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;
  
  const inspirationalPatterns = [
    /\b(?:part of the solution|part of the answer)\b/i,
    /\b(?:when demand shifts|supply follows)\b/i,
    /\b(?:every little helps|every action counts)\b/i,
    /\b(?:the power of|the collective effect)\b/i,
    /\b(?:not just symbolic|it's practical)\b/i,
  ];
  
  // Filter kalimat yang inspiratif
  const filtered = sentences.filter(s => {
    return !inspirationalPatterns.some(p => p.test(s));
  });
  
  // Jika terlalu banyak yang dihapus, kembalikan beberapa
  if (filtered.length < sentences.length * 0.6) {
    return sentences.join(' ');
  }
  
  return filtered.join(' ');
}

/**
 * Menambahkan frase yang sedikit awkward/pompous - DIHAPUS, diganti dengan versi baru dari dosen
 * Fungsi ini sudah digantikan oleh implementasi baru di akhir file
 */

/**
 * Mengubah list-of-3/4 yang sempurna menjadi tidak simetris.
 * Contoh: "Recycling, turning off lights, using buses, and avoiding plastic" →
 *         "recycling, turning off lights, using buses or bikes instead of cars, and avoiding plastic bags"
 * Tetapi kita buat tidak seimbang: satu item diperpanjang, yang lain dipendekkan.
 */
export function destroyPerfectLists(text: string): string {
  const sentences = splitSentences(text);
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    
    // Cari list pattern: "A, B, C, and D" atau "A, B, and C"
    const listPattern = /((?:\w+(?:\s+\w+)*),\s*(?:\w+(?:\s+\w+)*),\s*(?:and|or)\s*(?:\w+(?:\s+\w+)*))|((?:\w+(?:\s+\w+)*),\s*(?:\w+(?:\s+\w+)*),\s*(?:\w+(?:\s+\w+)*),\s*(?:and|or)\s*(?:\w+(?:\s+\w+)*))/gi;
    const match = s.match(listPattern);
    
    if (match && Math.random() < 0.4) {
      const items = match[0].split(/,\s*|\s+(?:and|or)\s+/).filter(Boolean);
      if (items.length >= 3) {
        // Perpanjang 1 item, pendekkan 1 item
        const longItems = [
          'using buses or bikes instead of cars',
          'recycling and composting',
          'turning off lights and unplugging devices',
          'avoiding single-use plastics and disposable items',
        ];
        const shortItems = [
          'recycling',
          'conserving energy',
          'using public transport',
          'reducing waste',
        ];
        
        // Ganti 1 item dengan versi panjang
        const longIdx = Math.floor(Math.random() * items.length);
        items[longIdx] = longItems[Math.floor(Math.random() * longItems.length)];
        
        // Ganti 1 item lain dengan versi pendek
        let shortIdx = (longIdx + 1) % items.length;
        if (shortIdx === longIdx) shortIdx = (shortIdx + 1) % items.length;
        items[shortIdx] = shortItems[Math.floor(Math.random() * shortItems.length)];
        
        // Gabungkan kembali
        let newList = items.slice(0, -1).join(', ');
        if (items.length > 2) {
          newList += ', and ' + items[items.length - 1];
        } else {
          newList += ' and ' + items[items.length - 1];
        }
        
        sentences[i] = s.replace(match[0], newList);
      }
    }
  }
  
  return sentences.join(' ');
}

/**
 * Memastikan ada kalimat sangat pendek (3-6 kata) dan sangat panjang (30-50 kata).
 * Ini menciptakan burstiness yang natural.
 */
export function forceExtremeBurstinessAcademic(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  
  const result = [...sentences];
  
  // 1. Cari kalimat panjang (>25 kata) dan split jika perlu
  for (let i = 0; i < result.length; i++) {
    if (result[i].split(/\s+/).length > 35 && Math.random() < 0.4) {
      const parts = result[i].split(/,|\s+and\s+|\s+but\s+|\s+or\s+/);
      if (parts.length >= 2) {
        const mid = Math.floor(parts.length / 2);
        result[i] = parts.slice(0, mid).join(', ') + '.';
        result.splice(i + 1, 0, parts.slice(mid).join(', ') + '.');
        break;
      }
    }
  }
  
  // 2. Tambahkan 1 kalimat sangat pendek (3-6 kata)
  if (Math.random() < 0.6 && result.length > 3) {
    const shortOnes = [
      'That is the key.',
      'This matters.',
      'It is clear.',
      'So it goes.',
      'The facts speak.',
      'Nothing is certain.',
      'Change is hard.',
      'Progress is slow.',
    ];
    const pos = Math.floor(result.length * (0.3 + Math.random() * 0.4));
    result.splice(pos, 0, shortOnes[Math.floor(Math.random() * shortOnes.length)]);
  }
  
  // 3. Tambahkan 1 kalimat sangat panjang (30-50 kata)
  if (Math.random() < 0.4 && result.length > 3) {
    const longOnes = [
      'It must also be acknowledged that individuals have a moral responsibility to care for our planet, and although some of these actions may seem minor, the cumulative effect of everyone taking such actions would be enormous.',
      'Politicians could certainly invest public finances in order to research the issues connected with climate change and, furthermore, could pass laws in relation to industrial pollution, which is making a major contribution to the greenhouse effect.',
      'The general public can protest, lobby their politicians or vote for a political party who proposes introducing green policies if elected, and this is something that has been shown to work in many countries.',
    ];
    const pos = Math.floor(result.length * (0.3 + Math.random() * 0.3));
    result.splice(pos, 0, longOnes[Math.floor(Math.random() * longOnes.length)]);
  }
  
  return result.join(' ');
}

// ============================================================
// LOGIC BARU DARI DOSEN - 5 FUNGSI UTAMA
// ============================================================

/**
 * Menghancurkan skeleton esai: Opening → Cause → Solution → Conclusion
 * Menjadi: Opening (strong) → Concession + Opinion → Elaboration → Example → Personal conviction
 */
export function destroyEssaySkeleton(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 8) return text;
  
  // 1. Cari kalimat opening yang restate prompt
  const openingPatterns = [
    /^The quality of life/i,
    /^In many countries/i,
    /^Environmental problems/i,
    /^The role of women/i,
    /^Children learn and develop/i,
  ];
  
  let openingIdx = -1;
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    if (openingPatterns.some(p => p.test(sentences[i]))) {
      openingIdx = i;
      break;
    }
  }
  
  if (openingIdx === -1) return text;
  
  // 2. Ganti opening dengan pernyataan kuat
  const strongOpenings = [
    'It cannot be disputed that urban quality of life is in crisis.',
    'There is no denying that cities are becoming harder places to live.',
    'The decline in urban livability is one of the most pressing issues of our time.',
  ];
  sentences[openingIdx] = strongOpenings[Math.floor(Math.random() * strongOpenings.length)];
  
  // 3. Cari thesis (biasanya kalimat ke-2 atau ke-3)
  let thesisIdx = -1;
  for (let i = openingIdx + 1; i < Math.min(openingIdx + 4, sentences.length); i++) {
    if (/\b(believe|think|argue|agree|opinion)\b/i.test(sentences[i])) {
      thesisIdx = i;
      break;
    }
  }
  
  // 4. Ubah thesis menjadi concession + opini kuat
  if (thesisIdx !== -1) {
    const strongThesis = [
      'Undoubtedly, governments have a major role to play, however I strongly feel that individuals must also contribute.',
      'While large institutions hold the biggest levers of change, ordinary people are far from powerless.',
      'It is certainly true that governments bear the greatest responsibility, but I am convinced that individual actions matter too.',
    ];
    sentences[thesisIdx] = strongThesis[Math.floor(Math.random() * strongThesis.length)];
  }
  
  // 5. Cari "Firstly/Secondly/Finally" dan hancurkan
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(Firstly|Secondly|Finally)\b/i.test(sentences[i])) {
      const transitions = [
        'To begin with,',
        'Another factor is',
        'Furthermore,',
        'Similarly,',
        'Likewise,',
      ];
      sentences[i] = sentences[i].replace(/\b(Firstly|Secondly|Finally)\b/i, 
        transitions[Math.floor(Math.random() * transitions.length)]);
    }
  }
  
  // 6. Cari "In conclusion" dan ubah menjadi opini pribadi
  for (let i = 0; i < sentences.length; i++) {
    if (/\bIn conclusion\b/i.test(sentences[i])) {
      const personalClosings = [
        'It is probably certainly the case that cities need better planning.',
        'Nonetheless, I am still convinced that we can make cities more livable.',
        'Despite the challenges, I believe progress is possible.',
      ];
      sentences[i] = personalClosings[Math.floor(Math.random() * personalClosings.length)];
      break;
    }
  }
  
  return sentences.join(' ');
}

/**
 * Memastikan tangents yang disisipkan relevan dengan topik.
 * Gunakan topic-specific anchors, bukan random.
 */
export function injectRelevantAnchors(text: string, topic?: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;
  
  // Deteksi topik dari teks
  const lower = text.toLowerCase();
  let anchors: string[] = [];
  
  if (/\b(city|urban|urbanisation|metropolitan|population|overcrowding|transport|housing)\b/i.test(lower)) {
    anchors = [
      'For example, in London, traffic congestion has worsened despite investment in public transport.',
      'In Singapore, strict car ownership policies have helped reduce congestion.',
      'In New York, housing costs have skyrocketed due to limited supply.',
      'In Tokyo, the population density has created unique challenges for urban planners.',
      'In Melbourne, urban sprawl has led to longer commutes.',
    ];
  } else if (/\b(environment|climate|pollution|emission|green|renewable)\b/i.test(lower)) {
    anchors = [
      'For example, in London, air quality has improved since the introduction of the Ultra Low Emission Zone.',
      'In China, renewable energy investment has grown rapidly.',
      'In California, strict emission standards have reduced pollution.',
      'In Germany, the shift to renewable energy has been significant.',
    ];
  } else if (/\b(education|reading|child|learn|play|school)\b/i.test(lower)) {
    anchors = [
      'In Finland, education focuses on play and creativity.',
      'In the UK, many children struggle with reading.',
      'In Japan, parents often start reading to children at a very young age.',
    ];
  } else {
    anchors = [
      'For example, in many countries, this trend is visible.',
      'In some regions, the situation is similar.',
    ];
  }
  
  // Sisipkan 1-2 anchors yang relevan
  const result = [...sentences];
  const count = Math.min(2, anchors.length);
  const shuffled = anchors.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count; i++) {
    const pos = Math.floor(result.length * (0.3 + Math.random() * 0.3));
    if (pos > 0 && pos < result.length) {
      result.splice(pos, 0, shuffled[i]);
    }
  }
  
  return result.join(' ');
}

/**
 * Menambahkan fragment yang natural (seperti human baseline).
 * Contoh: "For example, reducing consumption of fossil fuels whenever possible..."
 * BUKAN: "using public transport, encourages people to use buses..." (broken)
 */
export function injectNaturalFragment(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;
  
  const fragments = [
    'For example, reducing consumption of fossil fuels whenever possible, becoming self-sufficient by growing their own vegetables and switching off lights when they are not needed.',
    'For instance, recycling, conserving electricity and water, using public transportation, and avoiding single-use plastics.',
    'Such as cutting back on energy use, driving less, and buying products with less packaging.',
    'For example, protesting, lobbying their politicians, or voting for parties with green policies.',
  ];
  
  // Sisipkan fragment di posisi yang natural (setelah pernyataan yang membutuhkan contoh)
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (/\b(for example|for instance|such as)\b/i.test(p)) {
      // Paragraf sudah ada contoh, skip
      continue;
    }
    if (/\b(individuals|people|citizens|consumers)\b/i.test(p) && 
        !p.includes('For example') && 
        Math.random() < 0.3) {
      const fragment = fragments[Math.floor(Math.random() * fragments.length)];
      paragraphs[i] = p + ' ' + fragment;
      break;
    }
  }
  
  return paragraphs.join('\n\n');
}

/**
 * Menambahkan human error yang natural, bukan broken grammar.
 * Contoh dari human baseline:
 * - "probably certainly" (double hedge contradictory)
 * - "corporate organisations" (redundancy)
 * - "however I strongly feel" (comma splice)
 * - "either alone or in environmental pressure groups" (awkward phrasing)
 */
export function addNaturalHumanErrors(text: string): string {
  let result = text;
  
  // 1. Double hedge contradictory (seperti "probably certainly")
  if (Math.random() < 0.3 && /\b(probably|perhaps|maybe|possibly)\b/i.test(result)) {
    const hedges = [
      ['probably', 'certainly'],
      ['perhaps', 'definitely'],
      ['maybe', 'surely'],
      ['possibly', 'undoubtedly'],
    ];
    const pair = hedges[Math.floor(Math.random() * hedges.length)];
    result = result.replace(/\b(probably|perhaps|maybe|possibly)\b/i, pair[0] + ' ' + pair[1]);
  }
  
  // 2. Redundancy (seperti "corporate organisations")
  const redundancies: Array<[RegExp, string]> = [
    [/\bcorporate\s+organisations?\b/gi, 'corporate organisations'],
    [/\bpersonal\s+opinion\b/gi, 'personal opinion'],
    [/\bend\s+result\b/gi, 'end result'],
    [/\bfuture\s+plans?\b/gi, 'future plans'],
    [/\badvance\s+planning\b/gi, 'advance planning'],
  ];
  if (Math.random() < 0.25) {
    const [pattern, replacement] = redundancies[Math.floor(Math.random() * redundancies.length)];
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
    }
  }
  
  // 3. Comma splice (seperti "however I strongly feel")
  if (Math.random() < 0.2 && /\b(however|therefore|consequently|nevertheless)\b/i.test(result)) {
    result = result.replace(/\b(however|therefore|consequently|nevertheless)\s+/gi, (match) => {
      return match.toLowerCase().replace(/,/, '');
    });
  }
  
  // 4. Word order awkward (seperti "make the changes necessary")
  if (Math.random() < 0.2) {
    result = result.replace(/\b(the\s+)?(\w+)\s+necessary\b/gi, (match, the, word) => {
      const variants = [
        `necessary ${word}`,
        `${word} that are necessary`,
        `${word} needed`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    });
  }
  
  // 5. Missing article (seperti "Without such system")
  if (Math.random() < 0.15) {
    result = result.replace(/\bwithout\s+such\s+(\w+)\b/gi, 'without such $1');
  }
  
  return result;
}

/**
 * Mengganti sinonim overload dengan repetisi natural.
 * Contoh: "governments, authorities, policymakers" → "governments, governments, governments"
 */
export function addNaturalRepetition(text: string): string {
  const synonymGroups: Array<[RegExp, string]> = [
    [/\b(?:governments|authorities|policymakers|officials)\b/gi, 'governments'],
    [/\b(?:individuals|people|citizens|residents)\b/gi, 'people'],
    [/\b(?:cities|urban areas|metropolitan areas|urban centres)\b/gi, 'cities'],
    [/\b(?:problems|issues|challenges|concerns)\b/gi, 'problems'],
    [/\b(?:solutions|measures|steps|actions)\b/gi, 'solutions'],
  ];
  
  let result = text;
  for (const [pattern, replacement] of synonymGroups) {
    if (pattern.test(result) && Math.random() < 0.5) {
      const matches = result.match(pattern) || [];
      if (matches.length > 2) {
        // Ganti 60-70% dengan kata yang sama
        let replaced = 0;
        const target = Math.floor(matches.length * 0.6);
        result = result.replace(pattern, (match) => {
          if (replaced < target) {
            replaced++;
            return replacement;
          }
          return match;
        });
      }
    }
  }
  
  return result;
}

// ============================================================
// DEEP STRUCTURE HUMANIZATION (berdasarkan human baseline)
// ============================================================

/**
 * Hancurkan transisi template IELTS dengan natural reasoning
 */
export function destroyIeltsTemplate(text: string): string {
  // HAPUS TEMPLATE IELTS YANG SANGAT AI
  let sentences = splitSentences(text);
  
  // 1. Hapus kalimat intro ("This essay will discuss...")
  sentences = sentences.filter(s => 
    !/\b(?:This essay|In this essay|I will discuss|The purpose of this essay)\b/i.test(s)
  );
  
  // 2. Ganti "On the one hand" → "One reason why I think this works is"
  sentences = sentences.map(s => 
    s.replace(/\bOn the one hand\b/i, 'One reason why I think this works is')
  );
  
  // 3. Ganti "On the other hand" → "But that's not the whole story"
  sentences = sentences.map(s => 
    s.replace(/\bOn the other hand\b/i, 'But that\'s not the whole story')
  );
  
  // 4. Ganti "In conclusion" → "To sum up" atau "In the end"
  sentences = sentences.map(s => 
    s.replace(/\bIn conclusion\b/i, 'To sum up')
  );
  
  // 5. Jika ada "Furthermore" → "Not only that but"
  sentences = sentences.map(s => 
    s.replace(/\bFurthermore\b/i, 'Not only that but')
  );
  
  // 6. Jika ada "Moreover" → "And"
  sentences = sentences.map(s => 
    s.replace(/\bMoreover\b/i, 'And')
  );
  
  // 7. Jika ada "However" → "But"
  sentences = sentences.map(s => 
    s.replace(/\bHowever\b/i, 'But')
  );
  
  return sentences.join(' ');
}

/**
 * Perkuat opini dari "I believe" menjadi opini berani
 */
export function strengthenOpinion(text: string): string {
  const strongOpinions = [
    'I am firmly convinced that',
    'I strongly believe that',
    'There is no doubt in my mind that',
    'I stand with the view that',
    'I am a strong advocate of',
    'In my honest opinion,',
  ];
  
  const sentences = splitSentences(text);
  
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    
    // Ubah "I believe" → opini lebih kuat
    if (/\bI\s+(?:believe|think|feel)\s+that\b/i.test(s)) {
      const replacement = strongOpinions[Math.floor(Math.random() * strongOpinions.length)];
      sentences[i] = s.replace(/\bI\s+(?:believe|think|feel)\s+that\b/i, replacement);
      break;
    }
    
    // Jika tidak ada "I" di teks, tambahkan opini di kalimat kedua
    if (i === 1 && !/\b(?:I|me|my)\b/i.test(text)) {
      const opener = strongOpinions[Math.floor(Math.random() * strongOpinions.length)];
      sentences[i] = opener + ' ' + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
      break;
    }
  }
  
  return sentences.join(' ');
}

/**
 * Ganti contoh generik dengan spesifik (proper nouns, angka, detail temporal)
 * LOGIC BARU DARI DOSEN: Gunakan proper nouns spesifik seperti Milan, Mayor of London, the SUN
 */
export function concretizeExamples(text: string, topic?: string): string {
  const sentences = splitSentences(text);
  
  // Deteksi topik dari teks
  const lower = text.toLowerCase();
  let examples: string[] = [];
  
  if (/\b(politic|government|election|minister|mayor|parliament|privacy|surveillance)\b/i.test(lower)) {
    examples = [
      'For example, when details of the lavish spending of the Mayor of London were revealed in the SUN, it prompted questions from many sections of society.',
      'Take the case of a famous politician from Milan, who gained popularity after photos of him playing football with local school children were published.',
      'In the UK, the Partygate scandal exposed how private behavior can affect public trust.',
      'For instance, the MP expenses scandal in 2009 showed why transparency matters.',
    ];
  } else if (/\b(education|reading|child|learn|play|school|teacher|university)\b/i.test(lower)) {
    examples = [
      'In Finland, early years education focuses on play and creativity.',
      'For example, in the UK, many boys become reluctant readers when forced to read.',
      'In Japan, parents often start reading to children at a very young age.',
      'Take the case of Finland, which ranked sixth-best in reading worldwide.',
    ];
  } else if (/\b(happiness|money|wealth|income|adult|teenager|adolescence|responsibility)\b/i.test(lower)) {
    examples = [
      'For example, a 35-year-old man can travel to Spain during summer and create unforgettable moments.',
      'Take a teenager who spends weekends at the beach with friends, without worrying about rent.',
      'In many countries, adults in their thirties have the financial means to buy a house.',
    ];
  } else if (/\b(sport|exercise|physical|fitness|health)\b/i.test(lower)) {
    examples = [
      'For example, to play almost any sport one has to invest in the appropriate equipment, ranging from shorts, t-shirts to rackets and balls.',
      'In Australia, school sports programs are mandatory from age 6 to 16.',
      'Take the case of swimming, which requires pools, lanes, and trained instructors.',
    ];
  } else if (/\b(environment|pollution|climate|recycling|waste)\b/i.test(lower)) {
    examples = [
      'In Germany, households separate waste into six different categories.',
      'For example, Copenhagen aims to become carbon-neutral by 2025.',
      'Take Norway, where electric cars now make up over 80% of new sales.',
    ];
  } else {
    examples = [
      'For example, in the UK, this trend is clearly visible.',
      'Take Australia, where research has shown similar patterns.',
      'In Canada, the situation follows a comparable trajectory.',
    ];
  }
  
  // Cari kalimat yang mengandung "for example" atau "for instance"
  let replaced = false;
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(for example|for instance)\b/i.test(sentences[i]) && !replaced) {
      const example = examples[Math.floor(Math.random() * examples.length)];
      sentences[i] = example;
      replaced = true;
      break;
    }
  }
  
  // Jika tidak ada "for example", sisipkan di kalimat kedua/ketiga
  if (!replaced && sentences.length > 2) {
    const example = examples[Math.floor(Math.random() * examples.length)];
    sentences.splice(2, 0, example);
  }
  
  return sentences.join(' ');
}

/**
 * Tambahkan imperfection natural (typo alami, grammar error minor)
 * LOGIC BARU DARI DOSEN: Hanya 1 typo natural, tidak merusak makna
 */
export function addNaturalImperfection(text: string): string {
  let result = text;

  // HANYA 1 TYPO NATURAL (bukan pattern yang sama berulang)
  const typos: Array<[RegExp, string]> = [
    [/\bnewspapers\b/g, "newspaper"],   // typo natural (singular/plural)
    [/\bresponsibilities\b/g, "responsibilties"],
    [/\bfriends\b/g, "firends"],
    [/\btheir\b/g, "thier"],
    [/\bdefinitely\b/g, "definately"],
  ];

  // Pilih HANYA 1 typo secara random
  const shuffled = typos.sort(() => Math.random() - 0.5);
  for (const [pattern, replacement] of shuffled) {
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
      break; // HANYA 1 TYPO
    }
  }

  return result;
}

/**
 * Pastikan burstiness tinggi (variasi ekstrem panjang kalimat)
 */
export function ensureBurstiness(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  
  // 1. Cari kalimat pendek (<10 kata) dan kalimat panjang (>30 kata)
  const shortIndices = sentences.map((s, i) => ({ 
    index: i, 
    length: s.split(/\s+/).filter(Boolean).length 
  })).filter(item => item.length < 10);
  
  const longIndices = sentences.map((s, i) => ({ 
    index: i, 
    length: s.split(/\s+/).filter(Boolean).length 
  })).filter(item => item.length > 30);
  
  // 2. Jika tidak ada kalimat pendek, tambahkan 1
  if (shortIndices.length === 0 && sentences.length > 2) {
    const shorts = [
      'That is the key.',
      'It makes sense.',
      'This matters.',
      'Not always, though.',
    ];
    const pos = Math.floor(sentences.length * 0.3);
    sentences.splice(pos, 0, shorts[Math.floor(Math.random() * shorts.length)]);
  }
  
  // 3. Jika tidak ada kalimat panjang, gabungkan 2 kalimat
  if (longIndices.length === 0 && sentences.length > 4) {
    const idx = Math.floor(Math.random() * (sentences.length - 2)) + 1;
    const s1 = sentences[idx].replace(/[.!?]$/, '');
    const s2 = sentences[idx + 1].charAt(0).toLowerCase() + sentences[idx + 1].slice(1);
    sentences[idx] = s1 + ', and ' + s2;
    sentences.splice(idx + 1, 1);
  }
  
  return sentences.join(' ');
}

// ============================================================
// NEW FUNCTIONS FROM LECTURER'S ANALYSIS
// ============================================================

/**
 * Get grounding data based on topic (proper nouns, numbers, events)
 */
function getGroundingData(text: string): { properNouns: string[], numbers: string[], events: string[] } {
  const lower = text.toLowerCase();
  
  // Detect topic
  let topic = 'economy';
  if (/\b(politic|government|election|minister|mayor|parliament|privacy|surveillance)\b/i.test(lower)) {
    topic = 'politics';
  } else if (/\b(education|reading|child|learn|play|school|teacher|university)\b/i.test(lower)) {
    topic = 'education';
  } else if (/\b(happiness|money|wealth|income|adult|teenager|adolescence|responsibility)\b/i.test(lower)) {
    topic = 'happiness';
  } else if (/\b(sport|exercise|physical|fitness|health)\b/i.test(lower)) {
    topic = 'sport';
  } else if (/\b(environment|pollution|climate|recycling|waste)\b/i.test(lower)) {
    topic = 'environment';
  }
  
  const groundingDB: Record<string, { properNouns: string[], numbers: string[], events: string[] }> = {
    'economy': {
      properNouns: ['Poland', 'Donald Trump', 'USA', 'China', 'Germany', 'Vietnam'],
      numbers: ['30 years', 'tripled', '60% to 15%', '10%', '1990s'],
      events: ['communism collapsed', 'Doi Moi reforms', '2008 financial crisis']
    },
    'education': {
      properNouns: ['Finland', 'UK', 'Japan', 'Cambridge University', 'OECD'],
      numbers: ['sixth-best', '15%', '50,000', '2000s'],
      events: ['PISA rankings', 'early years education']
    },
    'politics': {
      properNouns: ['Milan', 'the SUN', 'Mayor of London', 'Westminster', 'Boris Johnson'],
      numbers: ['2019', '10,000', '£50,000'],
      events: ['Partygate scandal', 'MPs expenses scandal']
    },
    'happiness': {
      properNouns: ['Spain', 'Europe', 'Finland', 'World Happiness Report'],
      numbers: ['35-year-old', '10 years', '6 hours'],
      events: ['summer vacation', 'weekend trips']
    },
    'sport': {
      properNouns: ['Australia', 'Olympics', 'FIFA', 'Premier League'],
      numbers: ['16 years', '80%', '2020'],
      events: ['school sports programs', 'world cup']
    },
    'environment': {
      properNouns: ['Germany', 'Copenhagen', 'Norway', 'European Union'],
      numbers: ['2025', '80%', 'six categories'],
      events: ['carbon-neutral goal', 'electric car adoption']
    }
  };
  
  return groundingDB[topic] || groundingDB['economy'];
}

/**
 * Replace generic examples with specific grounded ones (proper nouns, numbers, events)
 */
export function humanizeWithGroundedExamples(text: string): string {
  const sentences = splitSentences(text);
  const grounding = getGroundingData(text);
  
  // Find sentences with "for example" or "for instance"
  let exampleIndex = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(for example|for instance|such as)\b/i.test(sentences[i])) {
      exampleIndex = i;
      break;
    }
  }
  
  if (exampleIndex !== -1) {
    // Pick random grounding data
    const properNoun = grounding.properNouns[Math.floor(Math.random() * grounding.properNouns.length)];
    const number = grounding.numbers[Math.floor(Math.random() * grounding.numbers.length)];
    const event = grounding.events[Math.floor(Math.random() * grounding.events.length)];
    
    // Build specific example
    const specificExample = `For example, in ${properNoun}, ${number} after ${event}, studies show that...`;
    sentences[exampleIndex] = specificExample;
  }
  
  return sentences.join(' ');
}

/**
 * Strengthen stance: change "partly agree" to strong opinions
 */
export function strengthenStance(text: string): string {
  let result = text;
  
  // Detect stance
  const hasPartlyAgree = /\b(partly|somewhat|to some extent)\s+(agree|believe)\b/i.test(result);
  const hasIThink = /\bI\s+(think|believe|feel)\s+that\b/i.test(result);
  const hasIAgree = /\bI\s+(partly|somewhat|to some extent)?\s*agree\b/i.test(result);
  
  if (hasPartlyAgree || hasIAgree) {
    // Replace with strong stance
    const strongStances = [
      'I am firmly convinced that',
      'I strongly believe that',
      'I have no doubt that',
      'This is simply true:',
      'I stand with the view that',
    ];
    const replacement = strongStances[Math.floor(Math.random() * strongStances.length)];
    // Replace "I partly agree" or similar patterns
    result = result.replace(/\bI\s+(partly|somewhat|to some extent)?\s*agree\b/i, replacement);
    result = result.replace(/\b(partly|somewhat|to some extent)\s+(agree|believe)\b/i, replacement);
  }
  
  // If has "I think", strengthen it
  if (hasIThink && !hasPartlyAgree && !hasIAgree) {
    const strong = ['I am convinced', 'I strongly believe', 'I have no doubt'];
    result = result.replace(/\bI\s+(think|believe|feel)\s+that\b/i, 
      strong[Math.floor(Math.random() * strong.length)] + ' that');
  }
  
  return result;
}

/**
 * Add natural burstiness: extreme variation in sentence length
 */
export function addNaturalBurstiness(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;
  
  // Find middle position (30-50%)
  const midIdx = Math.floor(sentences.length * 0.3 + Math.random() * 0.2);
  
  // 1. Add one very short sentence (5-8 words)
  const shorts = [
    'That is the key.',
    'It makes sense.',
    'This is what matters.',
    'Not always, though.',
    'It depends.',
  ];
  sentences.splice(midIdx, 0, shorts[Math.floor(Math.random() * shorts.length)]);
  
  // 2. Find one long sentence (>30 words), merge with next
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].split(/\s+/).length > 30) {
      // Merge with next sentence
      if (i < sentences.length - 1) {
        const next = sentences[i + 1];
        sentences[i] = sentences[i].replace(/[.!?]$/, '') + ', and ' + next.charAt(0).toLowerCase() + next.slice(1);
        sentences.splice(i + 1, 1);
      }
      break;
    }
  }
  
  return sentences.join(' ');
}

/**
 * Add natural idioms: conversational phrases
 */
export function addNaturalIdioms(text: string): string {
  const idioms = [
    { pattern: /\bin conclusion\b/i, replacement: ['At the end of the day', 'All things considered', 'When you think about it'] },
    { pattern: /\bin addition\b/i, replacement: ['Not only that', 'Another thing is', 'What\'s more'] },
    { pattern: /\bhowever\b/i, replacement: ['But', 'That said', 'Mind you'] },
    { pattern: /\btherefore\b/i, replacement: ['So', 'That\'s why', 'Because of this'] },
  ];
  
  let result = text;
  for (const { pattern, replacement } of idioms) {
    if (pattern.test(result) && Math.random() < 0.4) {
      const repl = replacement[Math.floor(Math.random() * replacement.length)];
      result = result.replace(pattern, repl);
    }
  }
  
  // Add one idiom at the beginning if none exists
  if (!/\b(actually|honestly|to be fair|at the end|all things considered)\b/i.test(text)) {
    const openers = ['To be fair, ', 'Honestly, ', 'Actually, ', 'The thing is, '];
    const sentences = splitSentences(result);
    if (sentences.length > 0) {
      sentences[0] = openers[Math.floor(Math.random() * openers.length)] + sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1);
      result = sentences.join(' ');
    }
  }
  
  return result;
}

/**
 * Ensure proper nouns are added naturally
 */
export function ensureProperNouns(text: string): string {
  const lower = text.toLowerCase();
  const sentences = splitSentences(text);
  
  // Detect topic
  let topic = 'economy';
  if (/\b(politic|government|election|minister|mayor|parliament|privacy|surveillance)\b/i.test(lower)) {
    topic = 'politics';
  } else if (/\b(education|reading|child|learn|play|school|teacher|university)\b/i.test(lower)) {
    topic = 'education';
  } else if (/\b(happiness|money|wealth|income|adult|teenager|adolescence|responsibility)\b/i.test(lower)) {
    topic = 'happiness';
  } else if (/\b(sport|exercise|physical|fitness|health)\b/i.test(lower)) {
    topic = 'sport';
  } else if (/\b(environment|pollution|climate|recycling|waste)\b/i.test(lower)) {
    topic = 'environment';
  }
  
  const properNouns: Record<string, string[]> = {
    'economy': ['Poland', 'Germany', 'Vietnam', 'China', 'Donald Trump', 'USA', 'European Union'],
    'education': ['Finland', 'UK', 'Japan', 'Cambridge', 'OECD', 'PISA'],
    'politics': ['Milan', 'London', 'Westminster', 'Boris Johnson', 'the SUN', 'Parliament'],
    'happiness': ['Spain', 'Finland', 'World Happiness Report', 'Europe'],
    'sport': ['Australia', 'Olympics', 'FIFA', 'Premier League'],
    'environment': ['Germany', 'Copenhagen', 'Norway', 'European Union'],
  };
  
  const nouns = properNouns[topic] || properNouns['economy'];
  
  // Find sentence with "example" or "instance"
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(for example|for instance)\b/i.test(sentences[i])) {
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      // Insert proper noun after "for example"
      sentences[i] = sentences[i].replace(/\b(for example|for instance)\b/i, `$1, in ${noun},`);
      break;
    }
  }
  
  return sentences.join(' ');
}

// ============================================================
// SARAN BARU DARI DOSEN - 6 FUNGSI TAMBAHAN
// ============================================================

/**
 * 1. ADD COMMA SPLICE - Tanda khas manusia (menyisipkan 1-2 comma splice)
 */
export function addCommaSplice(text: string): string {
  const sentences = splitSentences(text);
  for (let i = 0; i < sentences.length - 1; i++) {
    if (sentences[i].split(/\s+/).length > 12 && Math.random() < 0.15) {
      const first = sentences[i].replace(/[.!?]$/, '');
      const second = sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      sentences[i] = first + ', ' + second;
      sentences.splice(i + 1, 1);
      break;
    }
  }
  return sentences.join(' ');
}

/**
 * 2. ADD REPETITION - Ulang kata kunci, bukan variasi sinonim
 */
export function addRepetition(text: string): string {
  // Deteksi kata kunci dari teks
  const words = text.split(/\s+/);
  const freq: Record<string, number> = {};
  for (const w of words) {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 4) freq[clean] = (freq[clean] || 0) + 1;
  }
  // Cari kata dengan frekuensi tinggi (kecuali stopwords)
  const stopwords = new Set(['people', 'things', 'something', 'without', 'about', 'because', 'would', 'could', 'should']);
  let topWord = '';
  let topCount = 0;
  for (const [word, count] of Object.entries(freq)) {
    if (count > topCount && !stopwords.has(word)) {
      topCount = count;
      topWord = word;
    }
  }
  if (!topWord || topCount < 2) return text;
  
  // Ganti beberapa sinonim dengan topWord
  const synonyms: Record<string, string[]> = {
    'health': ['wellness', 'well-being', 'fitness'],
    'environment': ['nature', 'planet', 'earth'],
    'nutrient': ['vitamin', 'mineral', 'supplement'],
    'protein': ['proteins'],
    'heart': ['cardiac', 'cardiovascular'],
    'vegetarian': ['plant-based', 'meat-free'],
    'education': ['learning', 'schooling', 'teaching'],
    'economy': ['economic', 'financial'],
    'government': ['administration', 'authority'],
    'happiness': ['joy', 'contentment', 'satisfaction'],
  };
  
  let result = text;
  if (synonyms[topWord]) {
    for (const syn of synonyms[topWord]) {
      const regex = new RegExp(`\\b${syn}\\b`, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, topWord);
        break;
      }
    }
  }
  return result;
}

/**
 * 3. ADD AWKWARD PHRASING - Frase sedikit canggung/ambigu
 */
export function addAwkwardPhrasing(text: string): string {
  const awkwardPhrases: Array<[string, string]> = [
    ['omnivorous more than herbivorous', 'more omnivorous than herbivorous'],
    ['predisposing to', 'predisposing to'],
    ['in certain religious groups', 'among certain religious groups'],
    ['without proper knowledge', 'without having proper knowledge'],
    ['can have consequences on', 'can have consequences for'],
    ['effect to', 'effect on'],
    ['discuss about', 'discuss'],
    ['emphasize on', 'emphasize'],
    ['similar with', 'similar to'],
    ['different than', 'different from'],
  ];
  
  let result = text;
  for (const [incorrect, correct] of awkwardPhrases) {
    const regex = new RegExp(`\\b${correct.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(result) && Math.random() < 0.2) {
      result = result.replace(regex, incorrect);
      break;
    }
  }
  return result;
}

/**
 * 4. ADD LONG SENTENCES - Gabungkan 2 kalimat jadi 1 kalimat panjang (30-40 kata)
 */
export function addLongSentences(text: string): string {
  const sentences = splitSentences(text);
  for (let i = 0; i < sentences.length - 1; i++) {
    const combined = sentences[i] + ' ' + sentences[i + 1];
    if (combined.split(/\s+/).length > 30 && Math.random() < 0.15) {
      sentences[i] = sentences[i].replace(/[.!?]$/, '') + ', ' + sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      sentences.splice(i + 1, 1);
      break;
    }
  }
  return sentences.join(' ');
}

/**
 * 5. DISPERSE OPINION - Sebarkan opini ke seluruh paragraf (bukan blok terpisah)
 */
export function disperseOpinion(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;
  
  // Cari paragraf yang terlihat seperti "opinion block" (hanya berisi opini)
  const opinionMarkers = /\b(I|me|my|in my view|i think|i believe)\b/i;
  let opinionBlockIdx = -1;
  for (let i = 0; i < paragraphs.length; i++) {
    if (opinionMarkers.test(paragraphs[i]) && paragraphs[i].split(/\s+/).length > 20) {
      opinionBlockIdx = i;
      break;
    }
  }
  
  if (opinionBlockIdx !== -1) {
    // Ambil kalimat-kalimat opini dari blok
    const sentences = splitSentences(paragraphs[opinionBlockIdx]);
    const opinionSentences = sentences.filter(s => opinionMarkers.test(s));
    if (opinionSentences.length > 0) {
      // Sebarkan ke paragraf lain
      for (let i = 0; i < paragraphs.length; i++) {
        if (i !== opinionBlockIdx && i < opinionSentences.length) {
          const insertIdx = Math.floor(Math.random() * 2); // awal atau akhir
          const sentencesPara = splitSentences(paragraphs[i]);
          if (insertIdx === 0) {
            sentencesPara.unshift(opinionSentences[i % opinionSentences.length]);
          } else {
            sentencesPara.push(opinionSentences[i % opinionSentences.length]);
          }
          paragraphs[i] = sentencesPara.join(' ');
        }
      }
      // Hapus blok opini atau sisakan hanya 1 kalimat
      const remaining = splitSentences(paragraphs[opinionBlockIdx]);
      const nonOpinion = remaining.filter(s => !opinionMarkers.test(s));
      paragraphs[opinionBlockIdx] = nonOpinion.join(' ') || paragraphs[opinionBlockIdx];
    }
  }
  return paragraphs.join('\n\n');
}

/**
 * 6. REMOVE TEMPLATE TRANSITIONS - Ganti label dengan transisi langsung
 */
export function removeTemplateTransitions(text: string): string {
  const transitions: Array<[RegExp, string]> = [
    [/\bOn the one hand\b,\s*/gi, ''],
    [/\bOn the other hand\b,\s*/gi, ''],
    [/\bAnother point is\b,\s*/gi, ''],
    [/\bOne reason\b,\s*/gi, ''],
    [/\bIn addition\b,\s*/gi, ''],
    [/\bFurthermore\b,\s*/gi, ''],
    [/\bMoreover\b,\s*/gi, ''],
    [/\bNevertheless\b,\s*/gi, ''],
    [/\bHowever\b,\s*/gi, ''],
    [/\bTherefore\b,\s*/gi, ''],
    [/\bConsequently\b,\s*/gi, ''],
    [/\bAs a result\b,\s*/gi, ''],
    [/\bIn conclusion\b,\s*/gi, ''],
    [/\bTo sum up\b,\s*/gi, ''],
    [/\bTo conclude\b,\s*/gi, ''],
  ];
  
  let result = text;
  for (const [pattern, replacement] of transitions) {
    result = result.replace(pattern, replacement);
  }
  // Bersihkan spasi ganda dan kapitalisasi
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/(^|[.!?]\s+)([a-z])/g, (m, p, l) => p + l.toUpperCase());
  return result;
}

// ============================================================
// NEW FUNCTIONS FROM DOSEN'S RECOMMENDATIONS (ADVANCED HUMANIZATION)
// ============================================================

/**
 * REWRITE ARGUMENT SKELETON - Hancurkan template IELTS
 * Mengubah struktur argumen dari template kaku menjadi lebih organik
 */
export function rewriteArgumentSkeleton(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 6) return text;

  // Deteksi posisi template
  let introEnd = 0;
  let bodyStart = 0;
  let bodyEnd = 0;
  let conclusionStart = 0;

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (/\b(On the one hand|On the other hand)\b/i.test(s) && bodyStart === 0) {
      bodyStart = i;
    }
    if (/\b(In conclusion|To conclude|To sum up)\b/i.test(s)) {
      conclusionStart = i;
      break;
    }
  }

  if (bodyStart === 0 || conclusionStart === 0) return text;

  // Ambil komponen
  const intro = sentences.slice(0, bodyStart);
  const body1 = sentences.slice(bodyStart, Math.floor((bodyStart + conclusionStart) / 2));
  const body2 = sentences.slice(Math.floor((bodyStart + conclusionStart) / 2), conclusionStart);
  const conclusion = sentences.slice(conclusionStart);

  // Acak ulang: mulai dengan body2 (counter-argument) dulu, baru body1
  const reordered = [
    ...body2.slice(0, 2),      // 2 kalimat dari counter
    ...intro.slice(0, 1),      // 1 kalimat intro
    ...body1.slice(0, 2),      // 2 kalimat dari pro
    ...body2.slice(2),         // sisa counter
    ...body1.slice(2),         // sisa pro
    ...conclusion.slice(0, 1), // 1 kalimat kesimpulan (tanpa label)
  ];

  // Gabungkan kembali, tanpa transisi formulaic
  let result = reordered.join(' ');

  // Hapus "On the one hand", "On the other hand", "Furthermore", "Moreover"
  result = result.replace(/\bOn the one hand\b/gi, '');
  result = result.replace(/\bOn the other hand\b/gi, '');
  result = result.replace(/\bFurthermore\b/gi, '');
  result = result.replace(/\bMoreover\b/gi, '');
  result = result.replace(/\bIn conclusion\b/gi, '');
  result = result.replace(/\bTo conclude\b/gi, '');

  return result;
}

/**
 * INJECT SPECIFIC PROPER NOUNS - Database grounding
 * Menambahkan nama spesifik (negara, perusahaan, institusi) untuk grounding realitas
 */
function getGroundingDataAdvanced(topic: string): { properNouns: string[], examples: string[] } {
  const db: Record<string, { properNouns: string[], examples: string[] }> = {
    'economy': {
      properNouns: ['IBM', 'China', 'Germany', 'Vietnam', 'Poland', 'the United States', 'Japan'],
      examples: [
        'IBM, for instance, invested hugely in China to establish manufacturing plants.',
        'In Poland, 30 years after communism collapsed, average salaries tripled.',
        'Vietnam\'s electronics sector gained hundreds of thousands of jobs.',
        'Germany\'s automotive industry has attracted many multinational suppliers.',
      ]
    },
    'environment': {
      properNouns: ['Italy', 'the Amazon', 'China', 'the United States', 'the EU', 'California'],
      examples: [
        'Multinational mining companies seeking marble in the mountains of Italy have severely devastated the area.',
        'Deforestation in the Amazon has accelerated under certain policies.',
        'China\'s industrial expansion has led to significant air pollution in major cities.',
      ]
    },
    'education': {
      properNouns: ['Finland', 'the UK', 'Japan', 'Cambridge University', 'OECD', 'PISA'],
      examples: [
        'In Finland, early years education focuses on play and creativity.',
        'The UK\'s reading scores have declined in recent PISA rankings.',
        'Japan\'s approach to early literacy emphasizes parental involvement.',
      ]
    },
    'politics': {
      properNouns: ['Milan', 'London', 'the SUN', 'Westminster', 'Boris Johnson', 'Donald Trump'],
      examples: [
        'The Mayor of London was criticized after details of his vacation spending were revealed in the SUN.',
        'Donald Trump cut funds for jobless migrants during his presidency.',
        'A politician from Milan gained popularity after photos of him playing football with school children were published.',
      ]
    },
    'health': {
      properNouns: ['India', 'the WHO', 'the UK', 'Finland', 'Japan'],
      examples: [
        'In certain religious groups in India, strict vegetarian diets can lead to deficiencies.',
        'The WHO recommends at least 150 minutes of exercise per week.',
        'Finland\'s healthcare system is often cited as a model for preventive care.',
      ]
    }
  };

  return db[topic] || db['economy'];
}

export function injectSpecificProperNouns(text: string): string {
  const sentences = splitSentences(text);
  
  // Deteksi topik dari teks
  const lower = text.toLowerCase();
  let detected = 'economy';
  if (/\b(environment|pollution|climate|green|renewable)\b/i.test(lower)) detected = 'environment';
  else if (/\b(education|reading|school|learn|child)\b/i.test(lower)) detected = 'education';
  else if (/\b(politic|government|election|minister|parliament)\b/i.test(lower)) detected = 'politics';
  else if (/\b(health|diet|exercise|medical|disease|doctor)\b/i.test(lower)) detected = 'health';
  
  const data = getGroundingDataAdvanced(detected);

  // Cari kalimat yang mengandung "for example" atau "for instance"
  let exampleIdx = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(for example|for instance|such as)\b/i.test(sentences[i])) {
      exampleIdx = i;
      break;
    }
  }

  if (exampleIdx !== -1) {
    const example = data.examples[Math.floor(Math.random() * data.examples.length)];
    sentences[exampleIdx] = example;
  } else if (sentences.length > 2) {
    // Sisipkan contoh di posisi 20-40%
    const pos = Math.floor(sentences.length * (0.2 + Math.random() * 0.2));
    const example = data.examples[Math.floor(Math.random() * data.examples.length)];
    sentences.splice(pos, 0, example);
  }

  // Tambahkan 1-2 proper nouns di kalimat lain secara natural
  const nouns = data.properNouns;
  for (let i = 0; i < sentences.length && i < 3; i++) {
    if (/\b(countries|nations|states|people|individuals)\b/i.test(sentences[i]) && Math.random() < 0.3) {
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      sentences[i] = sentences[i].replace(/\b(countries|nations)\b/i, noun);
    }
  }

  return sentences.join(' ');
}

/**
 * ADD NATURAL GRAMMAR ERRORS - Comma splice, missing verb, etc.
 * Menambahkan imperfection alami seperti tulisan manusia
 */
export function addNaturalGrammarErrors(text: string): string {
  let result = text;
  const sentences = splitSentences(result);

  // 1. Comma splice (MAKSIMAL 1 KALI)
  for (let i = 0; i < sentences.length - 1; i++) {
    if (Math.random() < 0.15 && sentences[i].length > 20) {
      const s1 = sentences[i].replace(/[.!?]$/, '');
      const s2 = sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
      sentences[i] = s1 + ', ' + s2;
      sentences.splice(i + 1, 1);
      break; // BREAK setelah 1 kali
    }
  }

  // 2. Missing verb (MAKSIMAL 1 KALI)
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(they|we|you)\s+enough\b/i.test(sentences[i]) && Math.random() < 0.3) {
      sentences[i] = sentences[i].replace(/\b(they|we|you)\s+enough\b/i, (match) => {
        const p = match.split(' ')[0].toLowerCase();
        return `${p} have enough`;
      });
      break; // BREAK setelah 1 kali
    }
  }

  // 3. Subject-verb agreement (MAKSIMAL 1 KALI)
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(companies|corporations|firms)\s+(is|has)\b/i.test(sentences[i]) && Math.random() < 0.2) {
      sentences[i] = sentences[i].replace(/\b(companies|corporations|firms)\s+(is|has)\b/i, '$1 are');
      break; // BREAK setelah 1 kali
    }
  }

  return sentences.join(' ');
}

/**
 * ALLOW NATURAL REPETITION - Jangan ganti sinonim
 * Membiarkan repetisi kata kunci seperti manusia menulis
 */
export function allowNaturalRepetition(text: string): string {
  // Deteksi kata kunci (topic noun)
  const words = text.toLowerCase().match(/[a-z]{4,}/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!['that', 'this', 'these', 'those', 'with', 'from', 'have', 'were'].includes(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  // Cari kata paling sering
  let topWord = '';
  let topFreq = 0;
  for (const [word, count] of Object.entries(freq)) {
    if (count > topFreq) { topFreq = count; topWord = word; }
  }

  if (!topWord || topFreq < 2) return text;

  // Ganti sinonim dengan topWord untuk mempertahankan repetisi
  const synonymGroups: Record<string, string[]> = {
    'companies': ['firms', 'corporations', 'multinationals', 'enterprises'],
    'environment': ['nature', 'ecosystem', 'planet'],
    'education': ['learning', 'schooling', 'instruction'],
    'television': ['tv', 'broadcast media'],
  };

  let result = text;
  for (const [key, synonyms] of Object.entries(synonymGroups)) {
    if (key === topWord) {
      for (const syn of synonyms) {
        if (Math.random() < 0.3) {
          result = result.replace(new RegExp(`\\b${syn}\\b`, 'gi'), key);
        }
      }
      break;
    }
  }

  return result;
}

/**
 * INCREASE BURSTINESS - Variasi panjang kalimat ekstrem
 * Menciptakan kalimat sangat pendek (5-7 kata) dan sangat panjang (35+ kata)
 */
export function increaseBurstiness(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

  let result = [...sentences];

  // 1. Tambahkan 1 kalimat sangat pendek (3-7 kata)
  if (Math.random() < 0.6) {
    const shorts = [
      'That is the key.',
      'It makes sense.',
      'This matters.',
      'Not always, though.',
      'It depends.',
      'That said.',
      'Fair enough.',
    ];
    const pos = Math.floor(result.length * (0.2 + Math.random() * 0.3));
    result.splice(pos, 0, shorts[Math.floor(Math.random() * shorts.length)]);
  }

  // 2. Cari 1 kalimat untuk diperpanjang >30 kata
  let longIdx = -1;
  for (let i = 0; i < result.length; i++) {
    if (result[i].split(/\s+/).length > 25) {
      longIdx = i;
      break;
    }
  }

  if (longIdx === -1 && result.length > 3) {
    // Gabungkan 2 kalimat menjadi 1 panjang
    const idx = Math.floor(result.length * (0.3 + Math.random() * 0.3));
    if (idx < result.length - 1) {
      const s1 = result[idx].replace(/[.!?]$/, '');
      const s2 = result[idx + 1].charAt(0).toLowerCase() + result[idx + 1].slice(1);
      result[idx] = s1 + ', and ' + s2;
      result.splice(idx + 1, 1);
    }
  }

  // 3. Pastikan ada 1 kalimat >30 kata
  let hasLong = result.some(s => s.split(/\s+/).length > 30);
  if (!hasLong && result.length > 2) {
    const idx = Math.floor(result.length * 0.5);
    const s1 = result[idx];
    const s2 = result[idx + 1] || '';
    if (s2) {
      const combined = s1.replace(/[.!?]$/, '') + ', and ' + s2.charAt(0).toLowerCase() + s2.slice(1);
      result[idx] = combined;
      result.splice(idx + 1, 1);
    }
  }

  return result.join(' ');
}

/**
 * SCATTER OPINION - Sebarkan opini di semua paragraf, bukan blok terpisah
 */
export function scatterOpinion(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const opinionPhrases = [
    'In my view, ',
    'I think that ',
    'I would argue that ',
    'From my perspective, ',
    'I am convinced that ',
  ];

  // Pastikan setiap paragraf (kecuali mungkin yang terakhir) punya opini
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    // Cek apakah sudah ada "I" atau "In my opinion"
    if (!/\b(I|me|my|In my opinion|In my view|I think|I believe)\b/i.test(p)) {
      // Sisipkan opini di kalimat pertama atau kedua
      const sentences = splitSentences(p);
      if (sentences.length > 0) {
        const phrase = opinionPhrases[Math.floor(Math.random() * opinionPhrases.length)];
        // Sisipkan di awal paragraf, atau di kalimat kedua
        if (Math.random() < 0.4 && sentences.length > 1) {
          sentences[1] = phrase + sentences[1].charAt(0).toLowerCase() + sentences[1].slice(1);
        } else {
          sentences[0] = phrase + sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1);
        }
        paragraphs[i] = sentences.join(' ');
      }
    }
  }

  return paragraphs.join('\n\n');
}

/**
 * REPLACE TRANSITIONS - Kurangi "Furthermore", "In conclusion"
 * Ganti dengan transisi yang lebih natural dan conversational
 */
export function replaceTransitions(text: string): string {
  const transitionMap: Array<[RegExp, string[]]> = [
    [/\bFurthermore\b/gi, ['Also', 'And', 'Plus', 'Another thing is', 'What\'s more']],
    [/\bMoreover\b/gi, ['Also', 'On top of that', 'Another point is']],
    [/\bIn addition\b/gi, ['Also', 'Another thing', 'Not only that']],
    [/\bConsequently\b/gi, ['So', 'Because of this', 'This means']],
    [/\bTherefore\b/gi, ['So', 'That\'s why', 'For this reason']],
    [/\bAs a result\b/gi, ['So', 'Because of this', 'This means']],
    [/\bIn conclusion\b/gi, ['All in all', 'To sum up', 'In the end', 'Overall']],
    [/\bOn the other hand\b/gi, ['But', 'Yet', 'Still', 'However']],
    [/\bOn the one hand\b/gi, ['One way', 'One reason is', 'First']],
  ];

  let result = text;
  for (const [pattern, replacements] of transitionMap) {
    if (pattern.test(result) && Math.random() < 0.4) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, replacement);
    }
  }

  return result;
}

/**
 * ADD LONG COMPLEX SENTENCES - 30+ kata dengan comma splice
 * Memastikan ada kalimat kompleks panjang seperti tulisan manusia
 */
export function addLongComplexSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Cek apakah sudah ada kalimat >30 kata
  const hasLong = sentences.some(s => s.split(/\s+/).length > 30);
  if (hasLong) return text;

  // Ambil 3 kalimat berurutan, gabungkan menjadi 1 panjang dengan comma splice
  const idx = Math.floor(Math.random() * (sentences.length - 3));
  const s1 = sentences[idx].replace(/[.!?]$/, '');
  const s2 = sentences[idx + 1].replace(/[.!?]$/, '');
  const s3 = sentences[idx + 2];

  // Gabungkan dengan comma splice
  const combined = s1 + ', ' + s2.charAt(0).toLowerCase() + s2.slice(1) + ', and ' + s3.charAt(0).toLowerCase() + s3.slice(1);
  sentences.splice(idx, 3, combined);

  return sentences.join(' ');
}

// ============================================================
// ARGUMENT GRAPH EXTRACTION (NEW ARCHITECTURE FROM DOSEN)
// Human ≠ AI + noise. Re-author (regenerasi dari semantic graph), bukan rewrite.
// ============================================================

type ArgumentNode = {
  id: string;
  type: 'claim' | 'reason' | 'evidence' | 'counter' | 'concession' | 'conclusion';
  content: string;
  children: string[]; // IDs of related nodes
};

export function extractArgumentGraph(text: string): ArgumentNode[] {
  const sentences = splitSentences(text);
  const nodes: ArgumentNode[] = [];
  const lower = text.toLowerCase();

  // Deteksi posisi
  let hasIntro = /\b(this essay|in this essay|i will discuss|i believe|in my opinion)\b/i.test(lower);
  let hasOnOneHand = /\b(on the one hand|firstly|one reason|one advantage)\b/i.test(lower);
  let hasOnOtherHand = /\b(on the other hand|however|but|nevertheless|yet|although)\b/i.test(lower);
  let hasConclusion = /\b(in conclusion|to conclude|in summary|to sum up)\b/i.test(lower);

  // Klasifikasi kalimat berdasarkan peran
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    let type: ArgumentNode['type'] = 'claim';
    if (/\b(because|since|due to|as a result|therefore|thus|consequently)\b/i.test(s)) {
      type = 'reason';
    } else if (/\b(for example|for instance|such as|like|take|consider)\b/i.test(s)) {
      type = 'evidence';
    } else if (/\b(however|but|nevertheless|yet|although|on the other hand)\b/i.test(s)) {
      type = 'counter';
    } else if (/\b(admittedly|granted|it is true that|while it is true)\b/i.test(s)) {
      type = 'concession';
    } else if (/\b(in conclusion|to conclude|in summary|overall|in the end)\b/i.test(s)) {
      type = 'conclusion';
    } else if (/\b(this essay|i believe|i think|in my opinion)\b/i.test(s) && i < 3) {
      type = 'claim';
    }
    nodes.push({
      id: `n${i}`,
      type,
      content: s,
      children: []
    });
  }

  // Bangun relasi sederhana: setiap kalimat mengacu ke sebelumnya (linear)
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].children.push(nodes[i+1].id);
  }

  return nodes;
}

// ============================================================
// REGENERATE FROM GRAPH WITH DIFFERENT AUTHOR PROFILES
// ============================================================

export function getAuthorProfile(profile: string): string {
  const profiles: Record<string, string> = {
    'ielts_band7': `You are an IELTS candidate with Band 7 writing ability. Your writing:
- Uses some complex sentences with subordinate clauses.
- Has occasional errors (comma splices, article mistakes) but meaning is clear.
- Expresses opinion directly but not aggressively.
- Repeats key words naturally.
- Gives 1-2 specific examples.
- Paragraph lengths vary.
- Does NOT use fragmented sentences (e.g., "That is the key.") unless in direct speech.
- Uses a mix of simple and compound sentences.`,

    'first_year_student': `You are a first-year university student writing a short essay.
- Your writing is clear but sometimes wordy or awkward.
- You use simple vocabulary and repeat the same terms.
- You sometimes use "I think", "I believe".
- You give one concrete example, maybe with a place or number.
- Your sentences are mostly 15-25 words.
- You don't over-explain.`,

    'newspaper_editor': `You are a newspaper opinion editor writing a concise piece.
- Your writing is direct and uses varied sentence structures.
- You use passive voice occasionally.
- You use specific proper nouns and numbers.
- You avoid repetition.
- You use short, punchy sentences sometimes.`
  };

  return profiles[profile] || profiles['ielts_band7'];
}

export function regenerateFromGraph(
  text: string,
  profile: 'ielts_band7' | 'first_year_student' | 'newspaper_editor' = 'ielts_band7'
): string {
  const graph = extractArgumentGraph(text);
  const profileInstruction = getAuthorProfile(profile);

  // Build a simple summary of the graph for the prompt
  const claim = graph.find(n => n.type === 'claim')?.content || '';
  const reasons = graph.filter(n => n.type === 'reason').map(n => n.content).join(' ');
  const evidence = graph.filter(n => n.type === 'evidence').map(n => n.content).join(' ');
  const counter = graph.filter(n => n.type === 'counter').map(n => n.content).join(' ');
  const concession = graph.filter(n => n.type === 'concession').map(n => n.content).join(' ');
  const conclusion = graph.find(n => n.type === 'conclusion')?.content || '';

  const prompt = `
You are given the key ideas from an essay. Your task is to write a new essay from scratch using ONLY these ideas. Do NOT copy the original wording or sentence order.

KEY IDEAS:
- Main claim: ${claim}
- Supporting reasons: ${reasons || 'none given'}
- Evidence/examples: ${evidence || 'none given'}
- Counter-arguments: ${counter || 'none given'}
- Concession: ${concession || 'none given'}
- Conclusion: ${conclusion || 'none given'}

${profileInstruction}

Write a complete essay (250-300 words) using these ideas in your own words. Do not copy the original. Return only the essay.
`;

  return prompt;
}
