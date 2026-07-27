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
  _sourceText: string,
  tone: string
): string {
  const isControlledRegister =
    tone === "english-academic" || tone === "english-sensitive" || tone === "ielts";

  return `
SOURCE-GROUNDED RECOMPOSITION:
Treat the user's text as a set of claims, qualifications, examples, and relationships - not as a sentence template.

Before drafting, silently map every source claim. Then rebuild the explanation from those claim units. Do not preserve the source's sentence order, sentence count, paragraph boundaries, or one-claim-per-sentence rhythm.

Non-negotiable accuracy:
- Keep every name, number, date, quotation, citation, condition, comparison, and degree of certainty that appears in the source.
- Do not add a person, personal experience, opinion, anecdote, statistic, location, quotation, recommendation, or outside fact.
- Do not drop a substantive source claim merely to make the prose shorter.

Composition:
- Start with a concrete cause, effect, condition, or consequence already present in the source. Do not default to a generic topic announcement such as "Many people... because..." when a source-supported detail can lead instead.
- Combine related claim units in some places and separate overloaded claim units in others. Avoid mirroring source sentence boundaries.
- Let paragraph sizes follow the logic of the explanation. A paragraph may be short when one claim stands alone and longer when several source details genuinely belong together.
- Use ordinary English and a register appropriate for the source. Prefer direct, familiar words over corporate or academic abstractions when the meaning remains identical. Do not force slang, fillers, direct address, rhetorical questions, fragments, deliberate mistakes, or a personal narrator.
- End on the source's final substantive qualification rather than a new summary or moral.
${isControlledRegister ? "\n- Keep the formal register required by the source." : ""}

Return only the rewritten English text.
`;
}
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
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
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

export function finalHumanize(
  text: string,
  tone: HumanizerPostProcessTone = "casual",
  _skipHeavyProcessing = false
): string {
  if (
    tone === "indonesian-general" ||
    tone === "indonesian-academic" ||
    tone === "indonesian-professional"
  ) {
    return finalIndonesianHumanize(text, tone);
  }

  if (!text || text.length < 40) return text.trim();

  // English post-processing is deliberately surface-only. The model may vary
  // syntax and wording, but this stage never invents people, numbers, examples,
  // professions, opinions, or personal experience.
  return addHumanTouches(text, tone);
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
    .map((sentence) => sentence.replaceAll(abbreviationDot, ".").trim())
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
  if (sentences.length < 6) return text;

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

  const fragments = ['Well.', 'No.', 'Yeah.', 'Right.', 'Hmm.', 'Okay.', 'Sure.', 'Anyway.', 'So.', 'But.', 'And.'];

  // Sisipkan 2-3 fragments di posisi berbeda (tidak semua sekaligus)
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

export function injectObsessionAcrossText(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 5) return text;

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

  const variations = [
    `It always comes back to ${topic}, doesn't it?`,
    `I keep thinking about ${topic}.`,
    `Honestly, ${topic} is the real issue here.`,
    `You can't really talk about this without mentioning ${topic}.`,
    `That's why ${topic} matters so much.`,
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

export function injectTopicAnchors(text: string): string {
  const lower = text.toLowerCase();
  let anchors: string[] = [];

  // Deteksi topik dan pilih anchors yang sesuai
  if (/\b(ai|artificial intelligence|chatgpt|openai|llm|model|machine learning)\b/i.test(lower)) {
    anchors = [
      'I mean, just look at how much ChatGPT has improved in two years.',
      'My colleague uses AI to write code and it saves him hours every week.',
      'You can see it in how many companies are now integrating AI into their products.',
      'I remember when GPT-3 came out and everyone was blown away.',
    ];
  } else if (/\b(inflation|cost of living|price|expensive|rent|grocery)\b/i.test(lower)) {
    anchors = [
      'my grocery bill has gone up by nearly 30%',
      'the rent for my apartment increased by $200',
      'I remember when a plate of nasi goreng cost 15,000 rupiah',
      'my friend in Jakarta says his electricity bill doubled',
    ];
  } else if (/\b(job|career|employment|graduate|application|hire)\b/i.test(lower)) {
    anchors = [
      'I applied to 50 companies and only heard back from 3',
      'my cousin graduated last year and still hasn\'t found a job',
      'the company I work for just laid off 10% of the staff',
      'my friend got rejected from 5 interviews before landing a role',
    ];
  } else {
    anchors = [
      'I know someone who went through exactly this.',
      'It reminds me of a situation a friend of mine faced.',
      'You can see it in everyday life if you pay attention.',
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
  if (sentences.length < 6) return text;

  // Hapus 15-25% kalimat yang bukan pembuka/penutup
  const lossRatio = 0.15 + Math.random() * 0.1;
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
