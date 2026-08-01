// lib/humanize-postprocess.ts

/**
 * Advanced post-processing based on lecturer's feedback:
 * - Remove policy paragraphs (if not present in source)
 * - Downgrade precise terminology to messy descriptions
 * - Inject subtle grammar errors (word form, collocation, article)
 * - Make "I" sentences vulnerable/hesitant, not evaluative
 * - Messify conclusion: 2 redundant sentences + naive claim
 */

// ============================================================
// MAIN ENTRY
// ============================================================

export function applyHumanizePostProcess(text: string): string {
  if (!text || text.length < 100) return text;

  let result = text;

  // 1. Hapus paragraf kebijakan (jika ada)
  result = prunePolicyParagraphs(result);

  // 2. Downgrade collocations (terminologi → deskripsi messy)
  result = downgradeCollocations(result);

  // 3. Inject subtle grammar errors (1–2)
  result = injectSubtleErrors(result);

  // 4. Humanize "I" sentences (vulnerable/hesitant)
  result = humanizePersonalI(result);

  // 5. Messify conclusion (2 kalimat + naive claim)
  result = messifyConclusion(result);

  // Final cleanup
  return cleanup(result);
}

// ============================================================
// 1. POLICY PRUNING
// ============================================================

function prunePolicyParagraphs(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const policyKeywords = [
    'governments',
    'public health',
    'policies',
    'policy',
    'infrastructure',
    'educational campaigns',
    'systemic changes',
    'limit junk food marketing',
    'walking and cycling infrastructure',
    'public health organizations',
    'health organizations',
    'government agencies',
    'regulations',
    'legislation',
    'tax on',
    'subsidies',
    'planning authorities',
  ];

  const filtered = paragraphs.filter(para => {
    const lower = para.toLowerCase();
    // Hitung kata policy
    let policyCount = 0;
    let totalWords = lower.split(/\s+/).length;
    for (const kw of policyKeywords) {
      if (lower.includes(kw)) policyCount++;
    }
    // Jika > 30% kata adalah policy, hapus paragraf
    const ratio = policyCount / (totalWords || 1);
    return ratio < 0.25;
  });

  return filtered.join('\n\n');
}

// ============================================================
// 2. COLLOCATION DOWNGRADE (terminologi → messy)
// ============================================================

function downgradeCollocations(text: string): string {
  const downgradeMap: Array<[RegExp, string]> = [
    // Obesity / diet topics
    [/\bprocessed foods\b/gi, 'food that has been pre-made'],
    [/\bprocessed food\b/gi, 'food that has been pre-made'],
    [/\blifestyle changes\b/gi, 'change the way they live'],
    [/\bpermanent lifestyle changes\b/gi, 'change the way they live for good'],
    [/\bshort-term fixes\b/gi, 'quick fixes that do not last'],
    [/\bobesity-related health issues\b/gi, 'health problems from being too heavy'],
    [/\bstruggling with obesity\b/gi, 'dealing with being overweight'],
    [/\bweight-loss options\b/gi, 'ways to lose weight'],
    [/\bstrict diets\b/gi, 'very strict eating plans'],
    [/\bprofessional guidance\b/gi, 'help from experts'],
    [/\bpermanent changes\b/gi, 'lasting changes'],
    [/\bhealthy habits\b/gi, 'good daily routines'],
    [/\bpublic policies\b/gi, 'what governments do'],
    [/\bbalanced nutrition\b/gi, 'eating a mix of foods'],
    [/\bphysical activity\b/gi, 'moving your body'],
    [/\bregular physical activity\b/gi, 'moving your body regularly'],

    // Physical punishment / discipline
    [/\bpsychological and behavioural harms\b/gi, 'harm to the mind and behaviour'],
    [/\bpsychological harm\b/gi, 'harm to the mind'],
    [/\bbehavioural harms\b/gi, 'problems with behaviour'],
    [/\bnon-violent approaches\b/gi, 'approaches that do not use force'],
    [/\bconsistent, non-violent approaches\b/gi, 'steady, peaceful ways'],
    [/\bmutual understanding\b/gi, 'understanding each other'],
    [/\bsubstantial evidence\b/gi, 'a lot of research'],
    [/\bharmful long-term consequences\b/gi, 'bad effects later in life'],
    [/\baggressive behaviour\b/gi, 'acting aggressively'],
    [/\bpositive discipline\b/gi, 'disciplining in a positive way'],
    [/\bsetting clear boundaries\b/gi, 'setting clear limits'],
    [/\breinforcing good behaviour\b/gi, 'encouraging good actions'],
    [/\bmoral reasoning\b/gi, 'thinking about right and wrong'],
    [/\bobedience rooted in fear\b/gi, 'obeying because of fear'],

    // Generic
    [/\bstrategic importance\b/gi, 'being important for a strategy'],
    [/\bsustainable development\b/gi, 'long-term growth'],
    [/\bglobal stability\b/gi, 'peace in the world'],
    [/\bhumanitarian crises\b/gi, 'human problems'],
    [/\bobstacles to global stability\b/gi, 'difficulties for world peace'],
    [/\bskilled workforce\b/gi, 'people with good jobs'],
    [/\bboost productivity\b/gi, 'help economies grow'],
    [/\bself-sufficient\b/gi, 'able to stand on their own'],
  ];

  let result = text;
  // Terapkan 60-70% dari mapping, maksimal 5 perubahan
  const shuffled = downgradeMap.sort(() => Math.random() - 0.5);
  let changes = 0;
  const maxChanges = Math.min(5, Math.floor(downgradeMap.length * 0.6));
  for (const [pattern, replacement] of shuffled) {
    if (changes >= maxChanges) break;
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
      changes++;
    }
  }
  return result;
}

// ============================================================
// 3. INJECT SUBTLE GRAMMAR ERRORS (1–2)
// ============================================================

function injectSubtleErrors(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Pilih 1-2 kalimat untuk di-error-i
  const numErrors = Math.min(2, Math.floor(sentences.length * 0.15) + 1);
  const indices = new Set<number>();
  while (indices.size < numErrors && indices.size < sentences.length - 1) {
    indices.add(Math.floor(Math.random() * (sentences.length - 1)) + 1);
  }

  const result = [...sentences];
  const errorTypes = [
    // 1. Wrong word form (adjective → adverb)
    (s: string) => s.replace(/\b(unhealthy|healthy)\s+habits\b/gi, (match, word) => {
      return word === 'unhealthy' ? 'unhealthily habits' : 'healthily habits';
    }),
    // 2. Wrong collocation (carry out sport)
    (s: string) => s.replace(/\bdo\s+sport(s)?\b/gi, 'carry out sport$1'),
    (s: string) => s.replace(/\bplay\s+sport(s)?\b/gi, 'carry out sport$1'),
    // 3. Awkward negation placement (so as to not)
    (s: string) => s.replace(/\bso as not to\b/gi, 'so as to not'),
    // 4. Missing article (fall back into unhealthily habits → fall back into unhealthily habits)
    // tidak perlu, karena sudah ada "unhealthily habits" yang salah
    // 5. A/an confusion (an not okay)
    (s: string) => {
      if (/\bnot okay\b/i.test(s) && !/\ban not okay\b/i.test(s)) {
        return s.replace(/\bnot okay\b/i, 'an not okay');
      }
      return s;
    },
    // 6. Double word (like "believe believe") - tapi ini sudah ada di micro-surprise, bisa skip
  ];

  for (const idx of indices) {
    const s = result[idx];
    // Pilih satu error type secara acak
    const errorFn = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const newS = errorFn(s);
    if (newS !== s) {
      result[idx] = newS;
    }
  }

  return result.join(' ');
}

// ============================================================
// 4. HUMANIZE PERSONAL "I" (vulnerable/hesitant)
// ============================================================

function humanizePersonalI(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return text;

  // Cari kalimat yang mengandung "I" dan bersifat evaluatif
  const evaluativePatterns = [
    /\bI (see|believe|think|feel|argue) the (?:real|main|key) issue\b/i,
    /\bI (?:strongly|firmly) (?:believe|think)\b/i,
    /\bI would argue that\b/i,
  ];

  let changed = false;
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (!changed && evaluativePatterns.some(p => p.test(s))) {
      // Ganti dengan versi vulnerable/hesitant
      const replacements = [
        s.replace(/\bI (see|believe|think|feel|argue) the (?:real|main|key) issue\b/i, 'Personally, I think the issue might be'),
        s.replace(/\bI (?:strongly|firmly) (?:believe|think)\b/i, 'I guess I would say that'),
        s.replace(/\bI would argue that\b/i, 'I would probably say that'),
      ];
      sentences[i] = replacements[Math.floor(Math.random() * replacements.length)];
      changed = true;
      break;
    }
  }

  // Jika belum ada "I" sama sekali, tambahkan satu kalimat naive di posisi 30-60%
  if (!changed && !/\b(I|me|my)\b/i.test(text) && sentences.length > 3) {
    const pos = Math.floor(sentences.length * (0.3 + Math.random() * 0.3));
    const naiveStance = [
      'Personally, I think it is important to look at this from a practical angle.',
      'I would not do it myself, but I can see why some people might.',
      'I guess it depends on the situation, really.',
    ];
    sentences.splice(pos, 0, naiveStance[Math.floor(Math.random() * naiveStance.length)]);
  }

  return sentences.join(' ');
}

// ============================================================
// 5. MESSIFY CONCLUSION (2 kalimat + naive claim)
// ============================================================

function messifyConclusion(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  // Cari paragraf terakhir yang berisi kesimpulan
  const lastIdx = paragraphs.length - 1;
  const lastPara = paragraphs[lastIdx];
  const lower = lastPara.toLowerCase();

  const conclusionMarkers = [
    'in conclusion',
    'to sum up',
    'to conclude',
    'in summary',
    'overall',
    'ultimately',
    'finally',
  ];

  const isConclusion = conclusionMarkers.some(m => lower.includes(m)) ||
    lastPara.split(/\s+/).length < 20; // pendek, mungkin kesimpulan

  if (!isConclusion) return text;

  // Hapus marker "In conclusion" dll
  let cleaned = lastPara.replace(/\b(in conclusion|to sum up|to conclude|in summary|overall|ultimately|finally)\s*,?\s*/gi, '');

  // Bagi menjadi kalimat
  const sentences = splitSentences(cleaned);
  if (sentences.length < 2) {
    // Buat 2 kalimat dari 1
    const parts = cleaned.split(/,|\s+and\s+|\s+but\s+/);
    if (parts.length >= 2) {
      const first = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
      const second = parts.slice(Math.ceil(parts.length / 2)).join(' ');
      const newConclusion = `${first}. ${second.charAt(0).toUpperCase() + second.slice(1)}`;
      paragraphs[lastIdx] = newConclusion;
    } else {
      // Tambahkan naive claim
      const naiveClaim = [
        'If people can make small changes, they will be happier and healthier.',
        'With the right approach, many of these problems could be reduced.',
        'It is not easy, but it is possible.',
      ];
      paragraphs[lastIdx] = cleaned + ' ' + naiveClaim[Math.floor(Math.random() * naiveClaim.length)];
    }
  } else {
    // Sudah ada 2 kalimat, cukup tambahkan naive claim di akhir
    const naiveClaim = [
      'If people can make small changes, they will be happier and healthier.',
      'With the right approach, many of these problems could be reduced.',
      'It is not easy, but it is possible.',
      'All in all, it really depends on the situation.',
    ];
    const lastSentence = sentences[sentences.length - 1];
    // Hapus tanda baca akhir lalu tambahkan claim
    const newLast = lastSentence.replace(/[.!?]+$/, '') + '. ' + naiveClaim[Math.floor(Math.random() * naiveClaim.length)];
    sentences[sentences.length - 1] = newLast;
    paragraphs[lastIdx] = sentences.join(' ');
  }

  return paragraphs.join('\n\n');
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
