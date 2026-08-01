// lib/micro-surprise.ts

/**
 * Apply micro-level transformations to reduce token predictability.
 * Only for English text.
 */
export function applyMicroSurprise(text: string): string {
  if (!text || text.length < 100) return text;

  let result = text;

  // 1. Collocation substitution (prioritas utama)
  result = substituteCollocations(result);

  // 2. Redundancy pairing (double synonyms, hesitation)
  result = injectRedundancy(result);

  // 3. Controlled imperfection (1–2 minor errors)
  result = injectControlledImperfection(result);

  // 4. Meta-structural commentary (1 sentence)
  result = injectMetaCommentary(result);

  // 5. Naive generalization allowance (1 simplistic claim)
  result = allowNaiveGeneralization(result);

  // 6. Conversational hedging (replace definitive phrases)
  result = applyConversationalHedging(result);

  // Final cleanup: spacing and capitalization
  return cleanup(result);
}

// --------------------------------------------------------------
// 1. COLLOCATION SUBSTITUTION
// --------------------------------------------------------------
function substituteCollocations(text: string): string {
  // Mapping: AI-predictable phrase → less predictable alternative
  const collocMap: Array<[RegExp | string, string]> = [
    // Pairs
    [/\bwidening gap\b/gi, 'growing divide'],
    [/\bwealthy and developing nations\b/gi, 'prosperous and poorer countries'],
    [/\blow-income countries\b/gi, 'poorer parts of the world'],
    [/\bhumanitarian crises\b/gi, 'human problems'],
    [/\bobstacles to global stability\b/gi, 'difficulties for world peace'],
    [/\bskilled workforce\b/gi, 'people with good jobs'],
    [/\bbe productive\b/gi, 'get more done'],
    [/\bboost productivity\b/gi, 'help economies grow'],
    [/\bself-sufficient\b/gi, 'able to stand on their own'],
    [/\bemerging fields\b/gi, 'new areas'],
    [/\bstrategic deterrence\b/gi, 'preventing war'],
    [/\bsustainable development\b/gi, 'long-term growth'],
    [/\bunacceptable\b/gi, 'not okay'],
    // Single-word substitutions (optional)
    [/\bnecessitate\b/gi, 'require'],
    [/\bfacilitate\b/gi, 'help'],
    [/\butilize\b/gi, 'use'],
  ];

  let result = text;
  // Apply only 60-70% of replacements randomly to avoid being mechanical
  const shuffled = collocMap.sort(() => Math.random() - 0.5);
  const maxChanges = Math.max(3, Math.floor(collocMap.length * 0.6));
  let changes = 0;
  for (const [pattern, replacement] of shuffled) {
    if (changes >= maxChanges) break;
    if (pattern instanceof RegExp) {
      if (pattern.test(result)) {
        result = result.replace(pattern, replacement);
        changes++;
      }
    } else {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, replacement);
        changes++;
      }
    }
  }
  return result;
}

// --------------------------------------------------------------
// 2. REDUNDANCY INJECTION (double synonyms, hesitation)
// --------------------------------------------------------------
function injectRedundancy(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Find a sentence that doesn't already have redundancy
  let targetIdx = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (!/\b(obligated and expected|personally believe|I, personally|really and truly)\b/i.test(sentences[i])) {
      targetIdx = i;
      break;
    }
  }
  if (targetIdx === -1) return text;

  const s = sentences[targetIdx];
  const patterns: Array<[RegExp, string]> = [
    [/\b(I believe|I think)\b/i, 'I, personally, believe'],
    [/\b(should|must)\s+contribute\b/i, 'are obligated and expected to contribute'],
    [/\b(need|must)\s+help\b/i, 'really and truly need to help'],
  ];
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(s)) {
      sentences[targetIdx] = s.replace(pattern, replacement);
      break;
    }
  }
  return sentences.join(' ');
}

// --------------------------------------------------------------
// 3. CONTROLLED IMPERFECTION (1–2 minor errors)
// --------------------------------------------------------------
function injectControlledImperfection(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Pick 1-2 sentences to imperfection
  const numErrors = Math.min(2, Math.floor(sentences.length * 0.2) + 1);
  const indices = new Set<number>();
  while (indices.size < numErrors && indices.size < sentences.length - 1) {
    indices.add(Math.floor(Math.random() * (sentences.length - 1)) + 1);
  }

  const result = [...sentences];
  for (const idx of indices) {
    const s = result[idx];
    // Choose one type of imperfection
    const r = Math.random();
    if (r < 0.33 && !s.includes(',')) {
      // Comma splice: replace . with , 
      const parts = s.split('. ');
      if (parts.length > 1) {
        const first = parts[0];
        const rest = parts.slice(1).join('. ');
        result[idx] = first + ', ' + rest.charAt(0).toLowerCase() + rest.slice(1);
      }
    } else if (r < 0.66) {
      // Double word: duplicate a common word
      const words = s.split(' ');
      if (words.length > 5) {
        const pos = Math.floor(words.length * 0.3) + 1;
        if (words[pos] && words[pos].length > 2) {
          words.splice(pos, 0, words[pos]);
          result[idx] = words.join(' ');
        }
      }
    } else {
      // Awkward inversion: move a clause
      const match = s.match(/^(.+?),\s+(because|since|although|while)\s+(.+)$/i);
      if (match) {
        const [, main, conjunction, subordinate] = match;
        result[idx] = `${conjunction.charAt(0).toUpperCase() + conjunction.slice(1)} ${subordinate}, ${main.charAt(0).toLowerCase() + main.slice(1)}`;
      }
    }
  }
  return result.join(' ');
}

// --------------------------------------------------------------
// 4. META-STRUCTURAL COMMENTARY (1 sentence)
// --------------------------------------------------------------
function injectMetaCommentary(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Only inject if not already present
  const hasMeta = sentences.some(s => /(To address|This raises|It is hard to deny|One way to look at it)/i.test(s));
  if (hasMeta) return text;

  const metaSentences = [
    'To understand why this matters, it is worth looking at the historical context.',
    'This raises the question of whether such support actually reaches those in need.',
    'It is hard to deny that this is a complex issue.',
    'One way to look at it is to consider the practical implications.',
  ];
  const meta = metaSentences[Math.floor(Math.random() * metaSentences.length)];
  // Insert after the first sentence (or second)
  const insertPos = Math.min(2, sentences.length - 1);
  sentences.splice(insertPos, 0, meta);
  return sentences.join(' ');
}

// --------------------------------------------------------------
// 5. NAIVE GENERALIZATION ALLOWANCE
// --------------------------------------------------------------
function allowNaiveGeneralization(text: string): string {
  const sentences = splitSentences(text);
  if (sentences.length < 3) return text;

  // Find a sentence with a complex abstraction to simplify
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (
      /\b(global stability|sustainable development|strategic importance|long-term economic)\b/i.test(s)
      && Math.random() < 0.4
    ) {
      // Replace with simpler naive generalization
      const simplified = [
        'Many poor countries are former colonies, so rich countries should help them.',
        'Education is important because it helps people get jobs.',
        'Better healthcare means people live longer and are happier.',
        'If countries work together, the world becomes a safer place.',
      ];
      sentences[i] = simplified[Math.floor(Math.random() * simplified.length)];
      break;
    }
  }
  return sentences.join(' ');
}

// --------------------------------------------------------------
// 6. CONVERSATIONAL HEDGING
// --------------------------------------------------------------
function applyConversationalHedging(text: string): string {
  const hedgingMap: Array<[RegExp, string]> = [
    [/\b(the most effective|the best)\b/gi, 'a better idea would be'],
    [/\b(this ensures\b)/gi, 'this should help'],
    [/\bit is essential\b/gi, 'it is probably necessary'],
    [/\bgovernments must\b/gi, 'governments should really'],
    [/\bthe key lies in\b/gi, 'one way to look at it is'],
    [/\bwill definitely\b/gi, 'will likely'],
    [/\bclearly shows\b/gi, 'seems to show'],
    [/\bwithout doubt\b/gi, 'probably'],
  ];
  let result = text;
  let changes = 0;
  for (const [pattern, replacement] of hedgingMap) {
    if (changes >= 3) break;
    if (pattern.test(result) && Math.random() < 0.5) {
      result = result.replace(pattern, replacement);
      changes++;
    }
  }
  return result;
}

// --------------------------------------------------------------
// Helper: split into sentences
// --------------------------------------------------------------
function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

// --------------------------------------------------------------
// Final cleanup
// --------------------------------------------------------------
function cleanup(text: string): string {
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/([.!?])\1+/g, '$1')
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, p, l) => p + l.toUpperCase())
    .trim();
}
