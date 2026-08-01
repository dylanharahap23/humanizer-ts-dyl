// lib/structural-sanitizer.ts

/**
 * STRUCTURAL SANITIZER - Final layer untuk menghancurkan AI fingerprint
 * Berdasarkan analisis dosen:
 * 1. Paragrafing: 1 blok → 4 paragraf
 * 2. Artifact removal: hapus kalimat mengambang
 * 3. Natural error: subtle (missing comma), bukan double word
 * 4. Conclusion: 2 kalimat dengan "I believe"
 * 5. Vocabulary: Band 8+ → Band 5-6
 */

// ============================================================
// MAIN ENTRY
// ============================================================

export function applyStructuralSanitizer(text: string, sourceText?: string): string {
  if (!text || text.length < 100) return text;

  let result = text;

  // 1. Hapus artifact-artifact (histori, such measures, random contoh)
  result = removeArtifacts(result);

  // 2. Turunkan vocabulary ke Band 5-6 (hilangkan high-register)
  result = downgradeVocabulary(result);

  // 3. Fix conclusion: 2 kalimat, "I believe", practical
  result = fixConclusion(result);

  // 4. Inject subtle errors (bukan double word)
  result = injectSubtleNaturalErrors(result);

  // 5. Force paragraph segmentation (INI PALING PENTING)
  result = enforceParagraphSegmentation(result);

  // 6. Deduplicate conclusion (jika ada)
  result = deduplicateConclusion(result);

  // 7. COHERENCE ENFORCER (baru) - menjaga kekacauan tetap koheren
  result = applyCoherenceEnforcer(result, sourceText);

  // 8. Final cleanup
  return cleanup(result);
}

// ============================================================
// 1. ARTIFACT REMOVER
// ============================================================

function removeArtifacts(text: string): string {
  let result = text;

  // Pola artifact yang harus dihapus (seluruh kalimat)
  const artifactPatterns = [
    /To understand why this matters,? it is worth looking at the historical context\./gi,
    /This raises the question of whether such measures are truly effective\./gi,
    /This raises the question of whether such support actually reaches those in need\./gi,
    /It is worth noting that this is not always the case\./gi,
    /, meaning that this has significant implications\./gi, // fragment artifact
    /, meaning that this is an important consideration\./gi,
    /Already one can see that problems arise when the local government decides upon the core knowledge taught to students\./gi,
  ];

  for (const pattern of artifactPatterns) {
    result = result.replace(pattern, '');
  }

  // Hapus "This raises the question..." generic tanpa antecedent
  result = result.replace(/This raises the question[^.!?]*[.!?]/gi, (match) => {
    // Cek apakah ada kata tanya di dalamnya? Jika tidak ada, hapus
    if (!/\?/.test(match)) return '';
    return match;
  });

  // Hapus kalimat yang mengandung "Finland" tapi tidak ada follow-up
  const sentences = splitSentences(result);
  const filtered = sentences.filter((s, i) => {
    if (/\bFinland\b/.test(s)) {
      // Cek kalimat berikutnya, apakah menjelaskan Finland?
      const next = sentences[i + 1] || '';
      if (!/\b(education|play|creativity|ranked|system)\b/i.test(next)) {
        return false; // Hapus kalimat Finland
      }
    }
    // Hapus kalimat yang hanya berisi "such measures" tanpa antecedent jelas
    if (/\bsuch measures\b/.test(s) && !/benefit|policy|regulation|change|approach/.test(s)) {
      return false;
    }
    return true;
  });

  return filtered.join(' ');
}

// ============================================================
// 2. VOCABULARY DOWNGRADE (Band 8+ → Band 5-6)
// ============================================================

function downgradeVocabulary(text: string): string {
  const vocabMap: Array<[RegExp, string]> = [
    // Topik financial
    [/\bfraud and investment scams\b/gi, 'being cheated or losing money'],
    [/\bsignificant financial choices\b/gi, 'important money decisions'],
    [/\bpractical financial knowledge\b/gi, 'how to handle money'],
    [/\bcritical thinking\b/gi, 'thinking for themselves'],
    [/\bunmanageable debt\b/gi, 'money problems they cannot fix'],
    [/\bretirement planning\b/gi, 'saving for when they are older'],
    [/\bcompound interest\b/gi, 'how interest works'],
    [/\bfinancial risk evaluation\b/gi, 'checking if something is risky'],
    [/\bbroader economic stability\b/gi, 'helping the economy'],
    [/\bfinancial survival\b/gi, 'being able to manage their money'],
    [/\bexposed to\b/gi, 'face'],
    [/\bsetbacks\b/gi, 'problems'],
    [/\bequip students with\b/gi, 'give students'],
    [/\bimpart skills\b/gi, 'teach skills'],
    [/\bapplicable\b/gi, 'useful'],
    [/\bsignificant shift\b/gi, 'big change'],
    [/\bpotential subject\b/gi, 'possible subject'],
    [/\bsyllabus\b/gi, 'curriculum'],
    [/\bideology\b/gi, 'way of thinking'],

    // Topik general
    [/\bstrategic importance\b/gi, 'being important'],
    [/\bsustainable development\b/gi, 'long-term growth'],
    [/\bglobal stability\b/gi, 'peace in the world'],
    [/\bhumanitarian crises\b/gi, 'human problems'],
    [/\bobstacles to\b/gi, 'difficulties for'],
    [/\bskilled workforce\b/gi, 'people with good jobs'],
    [/\bboost productivity\b/gi, 'help economies grow'],
    [/\bself-sufficient\b/gi, 'able to stand on their own'],
    [/\bnecessitate\b/gi, 'require'],
    [/\bfacilitate\b/gi, 'help'],
    [/\butilize\b/gi, 'use'],
  ];

  let result = text;
  let changes = 0;
  const maxChanges = 8; // Maksimal 8 perubahan agar tidak terlihat dipaksa
  for (const [pattern, replacement] of vocabMap) {
    if (changes >= maxChanges) break;
    if (pattern.test(result) && Math.random() < 0.6) {
      result = result.replace(pattern, replacement);
      changes++;
    }
  }
  return result;
}

// ============================================================
// 3. FIX CONCLUSION (2 kalimat, "I believe", practical)
// ============================================================

function fixConclusion(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Cari kalimat terakhir (conclusion)
  const lastIdx = sentences.length - 1;
  const last = sentences[lastIdx];

  // Jika hanya 1 kalimat di conclusion, dan tidak ada "I believe"
  if (!/\b(I believe|In conclusion)\b/i.test(last) && last.split(/\s+/).length < 25) {
    // Ubah jadi 2 kalimat
    const naiveClaim = [
      'I believe that teaching young people about money would be very useful.',
      'I believe that students would benefit from learning practical skills.',
      'I believe that schools should prepare students for real life.',
    ];
    const practicalConsequence = [
      ' Adding this to the curriculum would cost money, but the community would benefit in the long run.',
      ' It might take time and resources, but the payoff for society would be significant.',
      ' There would be challenges, but the overall benefit is worth it.',
    ];

    const claim = naiveClaim[Math.floor(Math.random() * naiveClaim.length)];
    const consequence = practicalConsequence[Math.floor(Math.random() * practicalConsequence.length)];

    // Ganti kalimat terakhir
    sentences[lastIdx] = 'In conclusion, ' + claim.charAt(0).toLowerCase() + claim.slice(1) + consequence;
    return sentences.join(' ');
  }

  // Jika sudah ada "In conclusion" tapi 1 kalimat, tambahkan kalimat ke-2
  if (/\bIn conclusion\b/i.test(last) && !last.includes('. ') && last.split(/\s+/).length < 30) {
    const extraSentence = [
      ' It is not a simple change, but it would make a real difference.',
      ' This would require effort, but the benefits for students are clear.',
      ' The costs are high, but the rewards for society are even higher.',
    ];
    sentences[lastIdx] = last.replace(/[.!?]+$/, '') + '.' + extraSentence[Math.floor(Math.random() * extraSentence.length)];
    return sentences.join(' ');
  }

  return text;
}

// ============================================================
// 4. INJECT SUBTLE NATURAL ERRORS (BUKAN DOUBLE WORD)
// ============================================================

function injectSubtleNaturalErrors(text: string): string {
  let result = text;

  // Tipe explicit: pattern → (match: string, ...captures: string[]) => string
  const subtleErrors: Array<[RegExp, (match: string, ...args: string[]) => string]> = [
    // 1. Missing comma after "Also" di awal kalimat
    [
      /\bAlso,?\s+([A-Z])/g,
      (match: string, letter: string): string => {
        if (Math.random() < 0.5) return 'Also ' + letter;
        return match;
      }
    ],
    // 2. Odd preposition: "teach subjects" → "teach in subjects"
    [
      /\bteach\s+([a-z]+)\s+subjects\b/gi,
      (match: string, subject: string): string => {
        return 'teach in ' + subject + ' subjects';
      }
    ],
    // 3. Use "youths" instead of "young people" (only 30% chance)
    [
      /\byoung people\b/gi,
      (match: string): string => {
        return Math.random() < 0.3 ? 'the youths' : 'young people';
      }
    ],
    // 4. Awkward collocation: "communicate skills" → "communicate actual skills"
    [
      /\bcommunicate\s+([a-z]+)\s+skills\b/gi,
      (match: string, skillType: string): string => {
        return 'communicate actual ' + skillType + ' skills';
      }
    ],
    // 5. Odd article: "ideology of education" → "ideology of the education"
    [
      /\bideology of education\b/gi,
      (): string => {
        return 'ideology of the education';
      }
    ],
    // 6. Missing "the" before "community"
    [
      /\bcommunity would benefit\b/gi,
      (match: string): string => {
        return Math.random() < 0.3 ? 'the community would benefit' : 'community would benefit';
      }
    ],
  ];

  // Terapkan hanya 30% chance per error
  for (const [pattern, replacer] of subtleErrors) {
    if (Math.random() < 0.3) {
      result = result.replace(pattern, replacer);
    }
  }

  return result;
}

// ============================================================
// 5. ENFORCE PARAGRAPH SEGMENTATION (PALING PENTING)
// ============================================================

function enforceParagraphSegmentation(text: string): string {
  // Cek apakah sudah ada paragraf (ada \n\n)
  const existingParagraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (existingParagraphs.length >= 3 && existingParagraphs.length <= 5) {
    // Sudah baik, tapi kita pastikan ukurannya asimetris
    return text;
  }

  // Jika 1 blok, pecah
  const sentences = splitSentences(text);
  if (sentences.length < 6) return text;

  // Cari posisi split yang natural berdasarkan marker
  let introEnd = 0;
  let bodyEnd = 0;
  let conclusionStart = sentences.length;

  // Cari "I believe", "Personally", "In my view" → intro
  for (let i = 0; i < Math.min(4, sentences.length); i++) {
    if (/\b(Personally|I believe|In my view|I think)\b/i.test(sentences[i])) {
      introEnd = i + 1;
      break;
    }
  }
  if (introEnd === 0) introEnd = Math.min(2, Math.ceil(sentences.length * 0.2));

  // Cari "In conclusion", "To sum up" → conclusion start
  for (let i = sentences.length - 1; i >= Math.max(0, sentences.length - 4); i--) {
    if (/\b(In conclusion|To sum up|To conclude|Overall)\b/i.test(sentences[i])) {
      conclusionStart = i;
      break;
    }
  }
  if (conclusionStart === sentences.length) conclusionStart = Math.max(introEnd + 2, sentences.length - 2);

  // Body = antara intro dan conclusion
  const bodySentences = sentences.slice(introEnd, conclusionStart);

  // Bagi body menjadi 2 paragraf: body1 (2/3) dan body2 (1/3) + counter/example
  const bodySplit = Math.max(2, Math.floor(bodySentences.length * 0.6));
  const body1 = bodySentences.slice(0, bodySplit);
  const body2 = bodySentences.slice(bodySplit);

  // Gabungkan dengan asimetri: Intro (2), Body1 (5-7), Body2 (3-5), Conclusion (2)
  // Pastikan total paragraf 3-4
  let finalParagraphs: string[] = [];

  // Intro
  const introText = sentences.slice(0, introEnd).join(' ');
  if (introText.trim()) finalParagraphs.push(introText);

  // Body 1
  if (body1.length > 0) {
    // Gabungkan body1, pastikan panjang
    const body1Text = body1.join(' ');
    if (body1Text.trim()) finalParagraphs.push(body1Text);
  }

  // Body 2 (counter/example)
  if (body2.length > 0) {
    const body2Text = body2.join(' ');
    if (body2Text.trim()) finalParagraphs.push(body2Text);
  } else {
    // Jika body2 kosong, tambahkan filler
    const filler = 'Of course, there are different views on this issue, but the practical aspects cannot be ignored.';
    finalParagraphs.push(filler);
  }

  // Conclusion
  const conclusionText = sentences.slice(conclusionStart).join(' ');
  if (conclusionText.trim()) finalParagraphs.push(conclusionText);

  // Gabungkan
  return finalParagraphs.join('\n\n');
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

// ============================================================
// 6. DEDUPLICATE CONCLUSION (helper baru)
// ============================================================

function deduplicateConclusion(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Cari semua kalimat conclusion
  const conclusionIndices: number[] = [];
  for (let i = 0; i < sentences.length; i++) {
    if (/\b(In conclusion|To sum up|To conclude|Overall|In summary)\b/i.test(sentences[i])) {
      conclusionIndices.push(i);
    }
  }

  // Jika ada lebih dari 1 conclusion, simpan hanya yang terakhir
  if (conclusionIndices.length > 1) {
    const lastConclusionIdx = conclusionIndices[conclusionIndices.length - 1];
    const filtered = sentences.filter((_, i) => {
      // Hapus semua conclusion kecuali yang terakhir
      if (conclusionIndices.includes(i) && i !== lastConclusionIdx) {
        return false;
      }
      return true;
    });
    return filtered.join(' ');
  }

  return text;
}

// ============================================================
// 7. COHERENCE ENFORCER – menjaga kekacauan tetap koheren
// ============================================================

function applyCoherenceEnforcer(text: string, sourceText?: string): string {
  if (!text || text.length < 100) return text;

  let result = text;

  // A. Topic Integrity Lock – setiap kalimat harus punya keyword topik
  result = enforceTopicIntegrity(result, sourceText);

  // B. Natural Error Cap – perbaiki structural errors, biarkan 1 subtle error
  result = capNaturalErrors(result);

  // C. Filler Validator – pastikan filler diikuti konten
  result = validateFillers(result);

  // D. List Restrictor – hanya 1 list observational, hapus policy lists
  result = restrictLists(result);

  // E. Conclusion Topic Checker – conclusion wajib punya keyword topik
  result = validateConclusionTopic(result, sourceText);

  return result;
}

// --------------------------------------------------------------
// A. Topic Integrity Lock
// --------------------------------------------------------------

function enforceTopicIntegrity(text: string, sourceText?: string): string {
  if (!sourceText) return text;

  // Ekstrak keyword topik dari source (kata benda utama)
  const keywords = extractTopicKeywords(sourceText);
  if (keywords.length === 0) return text;

  const sentences = splitSentences(text);
  const filtered = sentences.filter(s => {
    // Pertahankan kalimat yang mengandung minimal 1 keyword
    return keywords.some(kw => s.toLowerCase().includes(kw));
  });

  // Jika terlalu banyak yang hilang (>30%), kembalikan asli
  if (filtered.length < sentences.length * 0.7) {
    return text;
  }

  return filtered.join(' ');
}

// --------------------------------------------------------------
// B. Natural Error Cap – perbaiki structural collapse, biarkan 1 subtle
// --------------------------------------------------------------

function capNaturalErrors(text: string): string {
  let result = text;

  // Pola structural collapse yang harus diperbaiki
  const structuralPatterns: Array<[RegExp, string]> = [
    // "would be response is" → "would be to"
    [/\bwould be response is\b/gi, 'would be to'],
    // "obesity obesity" → "obesity" (repetition typo)
    [/\bobesity\s+obesity\b/gi, 'obesity'],
    // "a important" → "an important"
    [/\ba\s+important\b/gi, 'an important'],
    // "a essential" → "an essential"
    [/\ba\s+essential\b/gi, 'an essential'],
    // double "to to"
    [/\bto\s+to\b/gi, 'to'],
  ];

  for (const [pattern, replacement] of structuralPatterns) {
    result = result.replace(pattern, replacement);
  }

  // Biarkan 1 error subtle (misal "unhealthily habits") – tidak diperbaiki
  // Kita hanya perbaiki yang structural collapse

  return result;
}

// --------------------------------------------------------------
// C. Filler Validator – pastikan filler diikuti konten
// --------------------------------------------------------------

function validateFillers(text: string): string {
  const sentences = splitSentences(text);
  const result: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    // Deteksi filler
    const fillerMatch = s.match(
      /\b(One must also consider|To understand why this matters|It is worth noting|This raises the question)\b/i
    );
    if (fillerMatch) {
      // Cek kalimat berikutnya, jika ada dan tidak terlalu pendek, pertahankan
      const next = sentences[i + 1] || '';
      if (next.split(/\s+/).length < 5) {
        // Filler tidak diikuti konten → hapus kalimat filler
        continue;
      }
    }
    result.push(s);
  }

  return result.join(' ');
}

// --------------------------------------------------------------
// D. List Restrictor – hanya 1 list observational, hapus policy lists
// --------------------------------------------------------------

function restrictLists(text: string): string {
  // Deteksi list pattern: "A, B, C, and D" atau "A, B, and C"
  const listPattern = /\b(\w+(?:\s+\w+)*),\s*(\w+(?:\s+\w+)*),\s*(?:and|or)\s*(\w+(?:\s+\w+)*)\b/i;
  const matches = text.match(new RegExp(listPattern, 'gi')) || [];

  // Hanya boleh 1 list
  if (matches.length <= 1) return text;

  // Pertahankan hanya 1 list yang paling pendek/observational
  // Ambil yang pertama, hapus yang lainnya
  let firstList = matches[0];
  let result = text;

  for (let i = 1; i < matches.length; i++) {
    // Hapus list ke-i (ganti dengan deskripsi sederhana)
    const toRemove = matches[i];
    const replacement = 'several things such as ' + toRemove.split(',').slice(0, 2).join(', ');
    result = result.replace(toRemove, replacement);
  }

  return result;
}

// --------------------------------------------------------------
// E. Conclusion Topic Checker – conclusion wajib punya keyword topik
// --------------------------------------------------------------

function validateConclusionTopic(text: string, sourceText?: string): string {
  if (!sourceText) return text;

  const keywords = extractTopicKeywords(sourceText);
  if (keywords.length === 0) return text;

  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;

  // Cari kalimat conclusion (yang mengandung "In conclusion" atau di akhir)
  let conclusionIdx = -1;
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (/\b(In conclusion|To conclude|To sum up)\b/i.test(sentences[i])) {
      conclusionIdx = i;
      break;
    }
  }

  // Jika tidak ada conclusion, cari kalimat terakhir
  if (conclusionIdx === -1) {
    conclusionIdx = sentences.length - 1;
  }

  const conclusion = sentences[conclusionIdx];
  const hasKeyword = keywords.some(kw => conclusion.toLowerCase().includes(kw));

  // Jika conclusion tidak punya keyword, hapus dan biarkan tanpa conclusion
  if (!hasKeyword) {
    const filtered = sentences.filter((_, i) => i !== conclusionIdx);
    return filtered.join(' ');
  }

  return text;
}

// --------------------------------------------------------------
// Helper: Extract Topic Keywords
// --------------------------------------------------------------

function extractTopicKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  // Prioritaskan kata kunci yang paling spesifik
  const topicMap: Record<string, string[]> = {
    coeducation: ['boys', 'girls', 'gender', 'single-sex', 'mixed', 'coeducational', 'separate', 'together', 'school', 'classroom'],
    obesity: ['obesity', 'overweight', 'diet', 'exercise', 'weight', 'food', 'eat', 'cook', 'meal', 'health', 'lifestyle'],
    population: ['population', 'growth', 'countries', 'economy', 'crisis', 'workforce', 'inhabitants', 'birth'],
    education: ['education', 'school', 'teacher', 'student', 'curriculum', 'learn', 'subject', 'knowledge'],
    finance: ['financial', 'money', 'savings', 'budget', 'debt', 'income', 'spend', 'save', 'invest'],
    punishment: ['punishment', 'discipline', 'physical', 'corporal', 'child', 'parent', 'force', 'spank'],
  };

  // Cari topik yang paling banyak keyword-nya
  let bestTopic = 'general';
  let bestCount = 0;
  for (const [topic, keywords] of Object.entries(topicMap)) {
    const count = keywords.filter(kw => lower.includes(kw)).length;
    if (count > bestCount) {
      bestCount = count;
      bestTopic = topic;
    }
  }

  return topicMap[bestTopic] || [];
}

// ============================================================
// 9. BAND 9 HUMAN PROMPT BUILDER – Academic Voice Natural
// ============================================================

/**
 * Build prompt untuk generate IELTS Band 9 academic essay
 * dengan natural rhythm seperti educated native speaker
 */
export function buildBand9HumanPrompt(sourceText: string): string {
  return `You are writing an IELTS Band 9 essay. You must sound like an educated native speaker, NOT a casual blogger.

CRITICAL RULES:

1. VOCABULARY (Band 9, not Band 6):
   - ✅ Use: "throughout history", "constant component", "opponents argue", "comparatively", "negligible benefit", "allocation of resources"
   - ❌ NEVER use: "I used to think", "honestly", "I mean", "you're", "can't", "it's about"
   - ✅ Use formal register: "one" instead of "you", "people" instead of "they"

2. STRUCTURE (Academic Essay):
   - Opening: Historical/general statement → Personal position (1 sentence only!)
   - Body 1: Counter-argument with examples
   - Body 2: Your argument with evidence
   - Conclusion: Restate position (1-2 sentences)

3. PERSONAL VOICE (Subtle, not overwhelming):
   - Only 1 "I" sentence in the entire essay (in the conclusion).
   - Example: "It seems to me that..." or "I believe that..."
   - DO NOT put "I" in every paragraph!

4. SENTENCE LENGTH (Burstiness):
   - 30% of sentences: 25-35 words (complex, with clauses)
   - 50% of sentences: 15-25 words (normal)
   - 20% of sentences: 8-14 words (short, punchy)

5. GRAMMAR:
   - 100% correct grammar (NO "can't", "don't", "you're")
   - Use: "cannot", "do not", "it is"

6. FORBIDDEN PHRASES (BANNED):
   - ❌ "I mean", "honestly", "you know", "like"
   - ❌ "several things such as" → use "including" or "for example"
   - ❌ "it is clear that" → use "it is evident that" or "clearly"

7. CONCLUSION:
   - MUST contain "I believe" or "It seems to me"
   - MUST mirror the opening topic
   - Example: Opening = "learning a foreign language has been a constant component" → Conclusion = "It seems to me that learning a foreign language is part of intellectual development"

Original facts:
${sourceText}

Write a Band 9 academic essay following these rules. Return ONLY the essay.`;
}

// ============================================================
// 10. BAND 9 HUMAN VALIDATOR – Academic Voice Natural
// ============================================================

export function validateBand9Human(text: string): string {
  let result = text;

  // 1. Cek "I" count → maksimal 3 per essay
  const iCount = (result.match(/\bI\b/g) || []).length;
  if (iCount > 3) {
    // Ganti "I" yang berlebihan dengan "one" atau "people"
    // Implementasi sederhana: hapus "I think" berlebihan
    result = result.replace(/\bI think\b/g, 'It is thought');
    result = result.replace(/\bI believe\b/g, 'It is believed');
    // Pertahankan 1 "I" di conclusion
  }

  // 2. Cek kontraksi → ganti dengan formal
  result = result.replace(/\bdon't\b/gi, 'do not');
  result = result.replace(/\bcan't\b/gi, 'cannot');
  result = result.replace(/\bwon't\b/gi, 'will not');
  result = result.replace(/\bit's\b/gi, 'it is');
  result = result.replace(/\byou're\b/gi, 'one is');
  result = result.replace(/\bthey're\b/gi, 'they are');
  result = result.replace(/\bwe're\b/gi, 'we are');
  result = result.replace(/\bdoesn't\b/gi, 'does not');
  result = result.replace(/\bdidn't\b/gi, 'did not');
  result = result.replace(/\bhasn't\b/gi, 'has not');
  result = result.replace(/\bhaven't\b/gi, 'have not');
  result = result.replace(/\bwouldn't\b/gi, 'would not');
  result = result.replace(/\bcouldn't\b/gi, 'could not');
  result = result.replace(/\bisn't\b/gi, 'is not');
  result = result.replace(/\baren't\b/gi, 'are not');

  // 3. Cek "honestly" → hapus
  result = result.replace(/\bhonestly\b/gi, '');

  // 4. Cek "I mean" → hapus
  result = result.replace(/\bI mean\b/gi, '');

  // 5. Cek "you know" → hapus
  result = result.replace(/\byou know\b/gi, '');

  // 6. Cek "like" (casual filler) → hapus jika sebagai filler
  result = result.replace(/\b, like\b/gi, ',');

  // 7. Cek burstiness (variasi panjang kalimat)
  const sentences = result.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length >= 3) {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;

    if (variance < 8) {
      // Sisipkan 1 kalimat kompleks (30+ kata) di tengah
      const complexSentence = `When one considers the broader implications of this issue, it becomes evident that the benefits extend far beyond the immediate context and have lasting effects on individuals and society as a whole.`;
      const midIdx = Math.floor(sentences.length / 2);
      sentences.splice(midIdx, 0, complexSentence);
      result = sentences.join(' ');
    }
  }

  // 8. Ganti "several things such as" → "including"
  result = result.replace(/\bseveral things such as\b/gi, 'including');

  // 9. Ganti "it is clear that" → "clearly" atau "it is evident that"
  result = result.replace(/\bit is clear that\b/gi, 'it is evident that');

  return cleanup(result);
}
