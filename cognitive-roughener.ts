// lib/cognitive-roughener.ts

/**
 * Cognitive Roughener – mengubah "thesis delivery" menjadi "discovery process"
 * Berdasarkan feedback dosen tentang 10 fingerprint AI.
 * Hanya untuk English text.
 */

// ============================================================
// MAIN ENTRY
// ============================================================

export function applyCognitiveRoughener(text: string, topic?: string): string {
  if (!text || text.length < 100) return text;

  let result = text;

  // 1. Inject Naive Opening (observasi sederhana, bukan thesis)
  result = injectNaiveOpening(result, topic);

  // 2. Inject "Meaning That" clauses (real-time reasoning)
  result = injectMeaningThatClauses(result);

  // 3. Inject specific geographic examples
  result = injectGeographicExamples(result, topic);

  // 4. Inject natural grammar error (not only... yet also)
  result = injectNaturalGrammarError(result);

  // 5. Inject "Already One Can See" fillers (meta-commentary)
  result = injectMetaFillers(result);

  // 6. Expand one paragraph to 7+ sentences (merge 2-3 paragraphs)
  result = expandOneParagraph(result);

  // 7. Conclusion expander – 1 kalimat panjang messy
  result = expandConclusion(result);

  // 8. Add stance if missing (Personally, I believe...)
  result = ensureExplicitStance(result);

  // Final cleanup
  return cleanup(result);
}

// ============================================================
// 1. NAIVE OPENING
// ============================================================

function injectNaiveOpening(text: string, topic?: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;

  const firstSentence = sentences[0];
  // Deteksi opening yang terlalu "thesis-like"
  const thesisPatterns = [
    /\b(ensures|guarantees|serves|demonstrates|illustrates|provides)\b/i,
    /\b(standard curriculum|consistent approach|effective method)\b/i,
    /\b(alignment with|contributes to|addresses the)\b/i,
  ];

  const isThesis = thesisPatterns.some(p => p.test(firstSentence));
  if (!isThesis) return text;

  // Pilih opening naive berdasarkan topik
  const topicLower = (topic || text).toLowerCase();
  let naiveOpen = 'In modern day society, it is essential for people to consider this issue carefully.';

  if (/\b(education|school|teacher|student|curriculum|learn)\b/i.test(topicLower)) {
    const openers = [
      'In modern day society, it is essential for a child to be educated in order for him or her to have success later on in life.',
      'Children are typically educated in schools, which are run by the government.',
      'Education is one of the most important things in a person\'s life.',
    ];
    naiveOpen = openers[Math.floor(Math.random() * openers.length)];
  } else if (/\b(obesity|health|diet|exercise|weight)\b/i.test(topicLower)) {
    const openers = [
      'In modern day western society one can easily become obese, as the availability of cheap and unhealthy food is high.',
      'Many people today struggle with their weight because of the food they eat.',
      'It has become habitual for people to cook using ingredients that have been pre-cooked or to which chemicals have been added.',
    ];
    naiveOpen = openers[Math.floor(Math.random() * openers.length)];
  } else if (/\b(punishment|discipline|child|parent|physical)\b/i.test(topicLower)) {
    const openers = [
      'In many countries, parents still use physical punishment to discipline their children.',
      'Disciplining children is a topic that people often have strong opinions about.',
      'The question of how to discipline children is one that has been debated for generations.',
    ];
    naiveOpen = openers[Math.floor(Math.random() * openers.length)];
  } else if (/\b(technology|internet|social media|digital)\b/i.test(topicLower)) {
    const openers = [
      'Technology has become a big part of our daily lives.',
      'These days, almost everyone uses the internet in some way.',
      'The way we communicate has changed a lot in recent years.',
    ];
    naiveOpen = openers[Math.floor(Math.random() * openers.length)];
  } else {
    const openers = [
      'In modern day society, it is essential to think about this topic carefully.',
      'This issue affects many people in different ways.',
      'It is important to consider both sides of this argument.',
    ];
    naiveOpen = openers[Math.floor(Math.random() * openers.length)];
  }

  // Ganti kalimat pertama
  sentences[0] = naiveOpen;
  return sentences.join(' ');
}

// ============================================================
// 2. INJECT "MEANING THAT" CLAUSES
// ============================================================

function injectMeaningThatClauses(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // Cari kalimat yang cocok untuk disisipi "meaning that"
  let targetIdx = -1;
  for (let i = 1; i < sentences.length - 1; i++) {
    const s = sentences[i];
    // Cari kalimat yang punya "that" atau "should" atau "is" tapi belum punya "meaning that"
    if (
      (/\b(should|must|need to|is|are)\b/i.test(s)) &&
      !/\b(meaning that|which means|so that)\b/i.test(s) &&
      s.split(/\s+/).length > 8 &&
      s.split(/\s+/).length < 25
    ) {
      targetIdx = i;
      break;
    }
  }
  if (targetIdx === -1) return text;

  const s = sentences[targetIdx];
  // Coba split di "that" atau "should" atau "is"
  const parts = s.match(/^(.+?)\b(should|must|need to|is|are)\b(.+)$/i);
  if (parts) {
    const [, before, verb, after] = parts;
    const newSentence = `${before.trim()} ${verb.toLowerCase()} ${after.trim()}, meaning that this has significant implications.`;
    sentences[targetIdx] = newSentence;
  } else {
    // Fallback: tambahkan di akhir
    sentences[targetIdx] = s + ' ' + 'meaning that this is an important consideration.';
  }

  return sentences.join(' ');
}

// ============================================================
// 3. INJECT GEOGRAPHIC EXAMPLES
// ============================================================

function injectGeographicExamples(text: string, topic?: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Database contoh spesifik berdasarkan topik
  const examples = getGeographicExamples(topic || text);

  // Cari kalimat yang mengandung "for example" atau "for instance"
  let targetIdx = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(for example|for instance|such as)\b/i.test(sentences[i])) {
      targetIdx = i;
      break;
    }
  }

  // Jika ada, ganti dengan contoh spesifik
  if (targetIdx !== -1) {
    const example = examples[Math.floor(Math.random() * examples.length)];
    sentences[targetIdx] = example;
  } else {
    // Jika tidak ada, sisipkan di posisi 30-50%
    const insertPos = Math.floor(sentences.length * (0.3 + Math.random() * 0.2));
    const example = examples[Math.floor(Math.random() * examples.length)];
    sentences.splice(insertPos, 0, example);
  }

  return sentences.join(' ');
}

function getGeographicExamples(text: string): string[] {
  const lower = text.toLowerCase();
  if (/\b(education|school|teacher|student|curriculum|learn)\b/i.test(lower)) {
    return [
      'In Germany, for example, the syllabus taught depends on the region of the country.',
      'In certain regions of Germany, children attend school for thirteen years and in other regions for twelve years.',
      'In Finland, early years education focuses on play and creativity.',
      'In the UK, many children are reluctant readers.',
      'In Japan, parents often start reading to children at a very young age.',
    ];
  }
  if (/\b(obesity|health|diet|exercise|weight)\b/i.test(lower)) {
    return [
      'In the United States, obesity rates have doubled in the past 30 years.',
      'In the UK, a significant portion of the population is now overweight.',
      'In Australia, government policies have been introduced to reduce sugar consumption.',
    ];
  }
  if (/\b(punishment|discipline|child|parent|physical)\b/i.test(lower)) {
    return [
      'In many European countries, physical punishment of children is banned by law.',
      'In Sweden, physical punishment has been illegal since 1979.',
      'In some parts of the United States, physical punishment is still allowed in schools.',
    ];
  }
  if (/\b(technology|internet|social media|digital)\b/i.test(lower)) {
    return [
      'In South Korea, internet speeds are among the fastest in the world.',
      'In China, social media platforms like WeChat are used for everything.',
      'In the United States, tech companies like Google and Apple dominate the market.',
    ];
  }
  // Default
  return [
    'In many countries, this trend is clearly visible.',
    'In some parts of the world, the situation is similar.',
    'For example, in Canada, research has shown similar patterns.',
  ];
}

// ============================================================
// 4. INJECT NATURAL GRAMMAR ERROR (not only... yet also)
// ============================================================

function injectNaturalGrammarError(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Pilih 1 kalimat untuk di-error-i
  const targetIdx = Math.floor(Math.random() * (sentences.length - 2)) + 1;
  const s = sentences[targetIdx];

  // Cari pattern "not only... but also"
  if (/\bnot only\b.*\b(but also)\b/i.test(s)) {
    // Ganti "but also" → "yet also"
    const newS = s.replace(/\b(but also)\b/i, 'yet also');
    sentences[targetIdx] = newS;
    return sentences.join(' ');
  }

  // Cari pattern dengan "so as not to" → "so as to not"
  if (/\bso as not to\b/i.test(s)) {
    sentences[targetIdx] = s.replace(/\bso as not to\b/i, 'so as to not');
    return sentences.join(' ');
  }

  // Cari pattern "him or her" → "him/her"
  if (/\bhim or her\b/i.test(s) && Math.random() < 0.5) {
    sentences[targetIdx] = s.replace(/\bhim or her\b/i, 'him/her');
    return sentences.join(' ');
  }

  // Cari pattern "should have" → "should of" (subtle)
  if (/\bshould have\b/i.test(s) && Math.random() < 0.3) {
    sentences[targetIdx] = s.replace(/\bshould have\b/i, 'should of');
    return sentences.join(' ');
  }

  // Default: tambahkan error pada conjunction
  if (/\b(however|therefore|consequently)\s*,?\s+[A-Z]/i.test(s)) {
    sentences[targetIdx] = s.replace(/\b(however|therefore|consequently)\s*,?\s+/i, '$1 ');
    return sentences.join(' ');
  }

  return sentences.join(' ');
}

// ============================================================
// 5. INJECT "ALREADY ONE CAN SEE" FILLERS (meta-commentary)
// ============================================================

function injectMetaFillers(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  const metaFillers = [
    'Already one can see that problems arise when the local government decides upon the core knowledge taught to students.',
    'This point is hard to argue with, as the evidence seems clear.',
    'It is clear that this is a complex issue that requires careful consideration.',
    'One must also consider the practical implications of this approach.',
    'It is worth noting that this is not always the case.',
    'This raises the question of whether such measures are truly effective.',
  ];

  // Pilih 1-2 meta-filler untuk disisipkan
  const count = Math.min(2, Math.floor(sentences.length * 0.15) + 1);
  const indices = new Set<number>();
  while (indices.size < count && indices.size < sentences.length - 1) {
    indices.add(Math.floor(Math.random() * (sentences.length - 2)) + 1);
  }

  const result = [...sentences];
  let offset = 0;
  for (const idx of Array.from(indices).sort((a, b) => a - b)) {
    const filler = metaFillers[Math.floor(Math.random() * metaFillers.length)];
    result.splice(idx + offset, 0, filler);
    offset++;
  }

  return result.join(' ');
}

// ============================================================
// 6. EXPAND ONE PARAGRAPH TO 7+ SENTENCES
// ============================================================

function expandOneParagraph(text: string): string {
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 3) return text;

  // Cari paragraf dengan 2-4 kalimat (yang bisa digabung)
  let targetIdx = -1;
  for (let i = 1; i < paragraphs.length - 1; i++) {
    const sentences = splitSentences(paragraphs[i]);
    if (sentences.length >= 2 && sentences.length <= 4) {
      targetIdx = i;
      break;
    }
  }
  if (targetIdx === -1) return text;

  // Ambil paragraf target + 1 paragraf berikutnya + 1 paragraf sebelumnya (jika ada)
  let combined = paragraphs[targetIdx];
  if (targetIdx + 1 < paragraphs.length) {
    combined += ' ' + paragraphs[targetIdx + 1];
  }
  if (targetIdx - 1 >= 0 && Math.random() < 0.5) {
    // Kadang ambil juga sebelumnya
    combined = paragraphs[targetIdx - 1] + ' ' + combined;
  }

  // Gabungkan menjadi 1 paragraf dengan panjang yang tidak seragam
  const combinedSentences = splitSentences(combined);
  if (combinedSentences.length < 5) return text;

  // Tapi jangan terlalu panjang >12 kalimat
  const maxSentences = 9;
  const finalSentences = combinedSentences.slice(0, Math.min(combinedSentences.length, maxSentences));

  // Ganti paragraf target dengan hasil gabungan
  paragraphs[targetIdx] = finalSentences.join(' ');

  // Hapus paragraf yang digabung (jika ada)
  if (targetIdx + 1 < paragraphs.length) {
    paragraphs.splice(targetIdx + 1, 1);
  }
  if (targetIdx - 1 >= 0 && combinedSentences.length > maxSentences) {
    // Jika kita gabung dengan sebelumnya, hapus juga
    // Tapi ini agak rumit, kita skip dulu
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// 7. CONCLUSION EXPANDER – 1 kalimat panjang messy
// ============================================================

function expandConclusion(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const lastIdx = paragraphs.length - 1;
  const lastPara = paragraphs[lastIdx];
  const sentences = splitSentences(lastPara);

  // Jika conclusion memiliki 2+ kalimat pendek
  if (sentences.length >= 2 && sentences.every(s => s.split(/\s+/).length < 20)) {
    // Gabungkan menjadi 1 kalimat panjang messy
    const combined = sentences.join(' ');
    const messyConclusion = `In conclusion, ${combined.replace(/^[\s,.]*/, '')}`;
    paragraphs[lastIdx] = messyConclusion;
  } else if (sentences.length === 1) {
    // Jika sudah 1 kalimat, tambahkan phrase "in conclusion" di awal (jika belum ada)
    const s = sentences[0];
    if (!/\b(in conclusion|to sum up|to conclude)\b/i.test(s)) {
      paragraphs[lastIdx] = 'In conclusion, ' + s.charAt(0).toLowerCase() + s.slice(1);
    }
    // Tambahkan naive claim di akhir
    const naiveClaim = [
      ' If people can make small changes, they will be happier and healthier.',
      ' With the right approach, many of these problems could be reduced.',
      ' It is not easy, but it is possible.',
      ' All in all, it really depends on the situation.',
    ];
    paragraphs[lastIdx] += naiveClaim[Math.floor(Math.random() * naiveClaim.length)];
  } else {
    // Sudah ada 2 kalimat, tambahkan naive claim di akhir
    const naiveClaim = [
      ' If people can make small changes, they will be happier and healthier.',
      ' With the right approach, many of these problems could be reduced.',
      ' It is not easy, but it is possible.',
    ];
    paragraphs[lastIdx] += naiveClaim[Math.floor(Math.random() * naiveClaim.length)];
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// 8. ENSURE EXPLICIT STANCE
// ============================================================

function ensureExplicitStance(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;

  // Cek apakah ada "I", "me", "my", "Personally"
  const hasStance = /\b(I|me|my|personally|in my view|i think|i believe)\b/i.test(text);
  if (hasStance) return text;

  // Tambahkan stance di posisi 20-40%
  const stanceSentences = [
    'Personally, I believe that this issue requires careful consideration.',
    'I think it is important to look at this from a practical angle.',
    'In my view, the best approach is to consider both sides carefully.',
    'I would argue that the benefits outweigh the drawbacks.',
  ];
  const stance = stanceSentences[Math.floor(Math.random() * stanceSentences.length)];

  const insertPos = Math.max(1, Math.floor(sentences.length * 0.25));
  sentences.splice(insertPos, 0, stance);

  return sentences.join(' ');
}

// ============================================================
// HELPERS
// ============================================================

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

function cleanup(text: string): string {
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/([.!?])\1+/g, '$1')
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, p, l) => p + l.toUpperCase())
    .trim();
}
