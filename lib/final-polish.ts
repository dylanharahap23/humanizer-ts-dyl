// lib/final-polish.ts

/**
 * FINAL POLISH LAYER – 8 fix terakhir untuk mencapai 100% human
 * Harus dipanggil PALING AKHIR setelah semua layer lain.
 */

export function applyFinalPolish(text: string, topic?: string): string {
  if (!text || text.length < 100) return text;

  let result = text;

  // 1. Topic Integrity Enforcer – conclusion wajib mereferensi topik
  result = enforceTopicIntegrity(result, topic || extractTopic(result));

  // 2. Sentence Merger – gabungkan kalimat pendek jadi panjang berantakan
  result = mergeShortSentences(result);

  // 3. List Breaker – hancurkan list paralel sempurna
  result = breakPerfectLists(result);

  // 4. Policy Paragraph Pruner – hapus rekomendasi pemerintah
  result = prunePolicyParagraphs(result);

  // 5. Meta-Commentary Hard Prune – hapus filler template
  result = pruneMetaCommentary(result);

  // 6. Vocabulary Downgrade (ekstra) – perkuat downgrade
  result = extraVocabularyDowngrade(result);

  // 7. Conclusion One-Sentence Messifier
  result = messifyConclusion(result);

  // 8. Thematic Redundancy – ulang thesis di awal P2
  result = injectThematicRedundancy(result);

  return cleanup(result);
}

// ============================================================
// 1. TOPIC INTEGRITY ENFORCER
// ============================================================

function enforceTopicIntegrity(text: string, topic: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Keyword topik
  const topicKeywords = getTopicKeywords(topic);

  // Cek kalimat terakhir (conclusion)
  const lastIdx = sentences.length - 1;
  const last = sentences[lastIdx];

  // Jika conclusion tidak mengandung keyword topik, ganti
  const hasTopic = topicKeywords.some(kw => last.toLowerCase().includes(kw));
  if (!hasTopic) {
    // Replace dengan conclusion yang sesuai topik
    const newConclusion = generateTopicConclusion(topic, last);
    sentences[lastIdx] = newConclusion;
  }

  // Juga cek kalimat terakhir kedua (jika ada)
  if (sentences.length > 2) {
    const secondLast = sentences[lastIdx - 1];
    if (!topicKeywords.some(kw => secondLast.toLowerCase().includes(kw))) {
      // Sisipkan kalimat topic sebelum conclusion
      const filler = generateTopicFiller(topic);
      sentences.splice(lastIdx, 0, filler);
    }
  }

  return sentences.join(' ');
}

function getTopicKeywords(topic: string): string[] {
  const map: Record<string, string[]> = {
    population: ['population', 'growth', 'country', 'people', 'world', 'economy'],
    education: ['education', 'school', 'student', 'learn', 'teach', 'curriculum'],
    obesity: ['obesity', 'weight', 'health', 'diet', 'food', 'exercise'],
    punishment: ['punishment', 'discipline', 'child', 'parent', 'physical'],
    technology: ['technology', 'internet', 'digital', 'social media', 'phone'],
    environment: ['environment', 'pollution', 'climate', 'green', 'planet'],
    finance: ['finance', 'money', 'saving', 'budget', 'debt', 'financial'],
    general: ['issue', 'problem', 'solution', 'approach', 'situation']
  };
  return map[topic] || map.general;
}

function generateTopicConclusion(topic: string, original: string): string {
  const map: Record<string, string[]> = {
    population: [
      'In conclusion, it is my belief that while certain areas of the world are in need of larger work forces to develop their economies, the continuously increasing population could potentially lead to crisis within countries that already struggle to provide for their inhabitants.',
      'To sum up, I think that population growth brings both opportunities and challenges, but the risks of overpopulation in poorer countries are more serious than the benefits of a larger workforce in richer ones.'
    ],
    education: [
      'In conclusion, I believe that training school students in financial matters would be very useful. Adding new content to the syllabus would require a significant amount of money, but the entire community would benefit from students being better prepared for adult life.'
    ],
    obesity: [
      'In conclusion, today\'s unhealthy lifestyles as well as the poor quality food consumed by people on a regular basis must be addressed before thinking about diets or exercise regimes. If people can combine exercise with wholesome eating habits, they will be happier and healthier.'
    ]
  };
  const conclusions = map[topic] || map.population;
  return conclusions[Math.floor(Math.random() * conclusions.length)];
}

function generateTopicFiller(topic: string): string {
  const map: Record<string, string[]> = {
    population: [
      'This growth is not the same everywhere, and in some places it is happening much faster than others.',
      'The question of population growth is one that affects every country differently.'
    ],
    education: [
      'This topic is difficult, though, as there are many different views on what schools should teach.',
      'Many people have strong opinions about what should be taught in schools.'
    ]
  };
  const fillers = map[topic] || map.population;
  return fillers[Math.floor(Math.random() * fillers.length)];
}

// ============================================================
// 2. SENTENCE MERGER
// ============================================================

function mergeShortSentences(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 4) return text;

  // Cari 2-3 kalimat pendek berurutan (<15 kata)
  const result: string[] = [];
  let i = 0;
  while (i < sentences.length) {
    const current = sentences[i];
    const wordCount = current.split(/\s+/).length;

    // Jika kalimat pendek dan ada kalimat berikutnya, coba gabung
    if (wordCount < 15 && i < sentences.length - 1 && Math.random() < 0.3) {
      const next = sentences[i + 1];
      const combined = current.replace(/[.!?]$/, '') + ', and ' + next.charAt(0).toLowerCase() + next.slice(1);
      result.push(combined);
      i += 2;
    } else {
      result.push(current);
      i++;
    }
  }

  return result.join(' ');
}

// ============================================================
// 3. LIST BREAKER
// ============================================================

function breakPerfectLists(text: string): string {
  let result = text;

  // Pola list: "A, B, C, and D" atau "A, B, and C"
  const listPatterns = [
    /\b(\w+(?:\s+\w+)?)\s*,\s*(\w+(?:\s+\w+)?)\s*,\s*and\s*(\w+(?:\s+\w+)?)\b/gi,
    /\b(\w+(?:\s+\w+)?)\s*,\s*(\w+(?:\s+\w+)?)\s*,\s*(\w+(?:\s+\w+)?)\s*,\s*and\s*(\w+(?:\s+\w+)?)\b/gi,
  ];

  for (const pattern of listPatterns) {
    result = result.replace(pattern, (match) => {
      // Pecah menjadi 2 kalimat
      const items = match.split(/,\s*|\s+and\s+/).filter(Boolean);
      if (items.length >= 3) {
        const first = items.slice(0, Math.ceil(items.length / 2)).join(', ');
        const second = items.slice(Math.ceil(items.length / 2)).join(', ');
        return first + '. ' + second.charAt(0).toUpperCase() + second.slice(1) + '.';
      }
      return match;
    });
  }

  // Juga hancurkan list yang masih tersisa dengan mengubah format
  result = result.replace(/\b(\w+),\s*(\w+),\s*(\w+),\s*and\s*(\w+)\b/gi, (match, ...args) => {
    // Ubah jadi 2 kalimat: item1 and item2, and then item3 and item4
    const items = args.slice(0, -1); // -1 karena match terakhir adalah full match
    if (items.length >= 4) {
      return items.slice(0, 2).join(' and ') + ', and then ' + items.slice(2).join(' and ');
    }
    return match;
  });

  return result;
}

// ============================================================
// 4. POLICY PARAGRAPH PRUNER
// ============================================================

function prunePolicyParagraphs(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const policyMarkers = [
    'governments can',
    'governments should',
    'policymakers must',
    'public health organizations',
    'educational campaigns',
    'systemic changes',
    'limit junk food marketing',
    'walking and cycling infrastructure',
    'regulations',
    'legislation',
    'tax on',
    'subsidies'
  ];

  const filtered = paragraphs.filter(para => {
    const lower = para.toLowerCase();
    let markerCount = 0;
    for (const marker of policyMarkers) {
      if (lower.includes(marker)) markerCount++;
    }
    // Jika ada >2 marker policy, hapus paragraf
    return markerCount < 2;
  });

  return filtered.join('\n\n');
}

// ============================================================
// 5. META-COMMENTARY HARD PRUNE
// ============================================================

function pruneMetaCommentary(text: string): string {
  const sentences = splitSentences(text);

  const metaPatterns = [
    /^One way to look at it is/i,
    /^This raises the question/i,
    /^It is worth noting that/i,
    /^To understand why this matters/i,
    /^It is hard to deny that/i,
    /^Already one can see that/i,
  ];

  const filtered = sentences.filter(s => {
    return !metaPatterns.some(p => p.test(s.trim()));
  });

  return filtered.join(' ');
}

// ============================================================
// 6. EXTRA VOCABULARY DOWNGRADE
// ============================================================

function extraVocabularyDowngrade(text: string): string {
  const map: Array<[RegExp, string]> = [
    [/\bentrepreneurship\b/gi, 'starting new businesses'],
    [/\bstimulates consumer demand\b/gi, 'more people buying things'],
    [/\bindustrial expansion\b/gi, 'factories and companies growing'],
    [/\btechnological innovation\b/gi, 'new technology'],
    [/\bdeforestation\b/gi, 'cutting down forests'],
    [/\bbiodiversity loss\b/gi, 'animals and plants dying out'],
    [/\bgreenhouse gas emissions\b/gi, 'more pollution'],
    [/\bresource management\b/gi, 'using what we have carefully'],
    [/\bsustainable development\b/gi, 'long-term growth'],
    [/\bglobal stability\b/gi, 'peace in the world'],
    [/\bhumanitarian crises\b/gi, 'human problems'],
    [/\bskilled workforce\b/gi, 'people with good jobs'],
    [/\bboost productivity\b/gi, 'help economies grow'],
    [/\bself-sufficient\b/gi, 'able to stand on their own'],
    [/\bnecessitate\b/gi, 'require'],
    [/\bfacilitate\b/gi, 'help'],
    [/\butilize\b/gi, 'use'],
    [/\bsubstantial\b/gi, 'big'],
    [/\bsignificant\b/gi, 'important'],
    [/\bresponsible\b/gi, 'careful'],
    [/\bexacerbated\b/gi, 'made worse'],
    [/\bsubstandard\b/gi, 'poor'],
    [/\bunsustainable\b/gi, 'not sustainable'],
    [/\bshortages\b/gi, 'not enough'],
  ];

  let result = text;
  let changes = 0;
  const maxChanges = 6;
  for (const [pattern, replacement] of map) {
    if (changes >= maxChanges) break;
    if (pattern.test(result) && Math.random() < 0.6) {
      result = result.replace(pattern, replacement);
      changes++;
    }
  }
  return result;
}

// ============================================================
// 7. CONCLUSION ONE-SENTENCE MESSIFIER
// ============================================================

function messifyConclusion(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  const lastIdx = paragraphs.length - 1;
  const lastPara = paragraphs[lastIdx];
  const sentences = splitSentences(lastPara);

  // Jika conclusion terdiri dari 2+ kalimat pendek, gabung jadi 1
  if (sentences.length >= 2 && sentences.every(s => s.split(/\s+/).length < 20)) {
    const combined = sentences.join(' ');
    // Tambahkan "In conclusion, it is my belief that" di awal jika belum ada
    let newConclusion = combined;
    if (!/\b(In conclusion|To sum up)\b/i.test(combined)) {
      newConclusion = 'In conclusion, it is my belief that ' + combined.charAt(0).toLowerCase() + combined.slice(1);
    }
    // Pastikan ada hedge
    if (!/\b(could|might|may|potentially)\b/i.test(newConclusion)) {
      newConclusion = newConclusion.replace(/\b(is|are|will|must)\b/i, (match) => {
        const hedges: Record<string, string> = { 'is': 'could be', 'are': 'could be', 'will': 'might', 'must': 'may need to' };
        return hedges[match.toLowerCase()] || match;
      });
    }
    paragraphs[lastIdx] = newConclusion;
  } else if (sentences.length === 1) {
    // Jika sudah 1 kalimat, tapi pendek, perpanjang
    const s = sentences[0];
    if (s.split(/\s+/).length < 20) {
      const extensions = [
        ' This is a view that I hold after considering both sides of the argument.',
        ' There are of course difficulties, but on balance this seems to be the most reasonable position.'
      ];
      paragraphs[lastIdx] = s.replace(/[.!?]+$/, '') + '.' + extensions[Math.floor(Math.random() * extensions.length)];
    }
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// 8. THEMATIC REDUNDANCY
// ============================================================

function injectThematicRedundancy(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  if (paragraphs.length < 2) return text;

  // Ambil thesis dari paragraf 1 (kalimat pertama atau kedua)
  const firstPara = paragraphs[0];
  const sentences = splitSentences(firstPara);
  let thesis = '';
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const s = sentences[i];
    // Cari kalimat yang mengandung topik utama (population, education, dll)
    if (/\b(population|education|obesity|growth|school|health)\b/i.test(s) && s.split(/\s+/).length > 8) {
      thesis = s.replace(/[.!?]+$/, '');
      break;
    }
  }
  if (!thesis) thesis = sentences[0]?.replace(/[.!?]+$/, '') || '';

  // Sisipkan variasi thesis di awal paragraf 2
  if (paragraphs.length > 1 && thesis.length > 10) {
    const secondPara = paragraphs[1];
    const variations = [
      `This ${thesis.toLowerCase()} is not the same everywhere, and in some places it is happening much faster than others.`,
      `The question of ${thesis.toLowerCase().replace(/^the question of /i, '')} is one that affects every country differently.`,
      `It is important to remember that ${thesis.toLowerCase()} is not a simple issue.`,
    ];
    const redundancy = variations[Math.floor(Math.random() * variations.length)];
    paragraphs[1] = redundancy + ' ' + secondPara;
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// HELPERS
// ============================================================

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

function extractTopic(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(population|growth|birth|death|overpopulation)\b/i.test(lower)) return 'population';
  if (/\b(education|school|teacher|student|curriculum|learn|finance|money)\b/i.test(lower)) return 'education';
  if (/\b(obesity|health|diet|exercise|weight|food)\b/i.test(lower)) return 'obesity';
  if (/\b(punishment|discipline|child|parent|physical)\b/i.test(lower)) return 'punishment';
  return 'general';
}

function cleanup(text: string): string {
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/([.!?])\1+/g, '$1')
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, p, l) => p + l.toUpperCase())
    .trim();
}
