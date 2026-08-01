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

export function applyStructuralSanitizer(text: string): string {
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

  // Final cleanup
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
