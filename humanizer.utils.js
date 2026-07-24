// src/utils/humanizer.utils.js
/**
 * Bertanggung jawab untuk:
 * 1. Mendefinisikan semua System Prompts (CASUAL & IELTS).
 * 2. Menyediakan fungsi getSystemPromptByTone() untuk memilih prompt dan parameter.
 * 3. Menyediakan fungsi addHumanTouches() untuk post-processing (jika non-streaming).
 * 4. Menyediakan UNICODE SPACING ENGINE untuk mengelabui detektor AI.
 * 5. Menyediakan fungsi finalizeWithUnicode() sebagai wrapper lengkap humanisasi + anti-deteksi.
 */

// ============================================================
// BAGIAN 1: UNICODE SPACING ENGINE (Anti AI Detector)
// ============================================================

/**
 * Daftar karakter spasi Unicode yang umum digunakan
 * Sumber: https://github.com/oct4pie/zero-zerogpt
 */
const UNICODE_SPACE_MAP = {
  EN: '\u2002',      // En Space (½ em)
  EM: '\u2003',      // Em Space (1 em) - PALING AMPUH
  THIN: '\u2009',    // Thin Space
  HAIR: '\u200A',    // Hair Space
  MEDIUM: '\u205F',  // Medium Mathematical Space
  IDEO: '\u3000'     // Ideographic Space (Full width)
};

/**
 * Fungsi utama: mengganti spasi biasa dengan Unicode secara acak
 * @param {string} text - Teks hasil humanisasi
 * @param {string} spaceType - Kunci di UNICODE_SPACE_MAP (default 'EM')
 * @param {number} intensity - 0.1 s/d 1.0, seberapa banyak spasi diganti (default 0.6)
 * @returns {string}
 */
function applyUnicodeSpacing(text, spaceType = 'EM', intensity = 0.6) {
  if (!text || typeof text !== 'string') return text;
  
  const targetSpace = UNICODE_SPACE_MAP[spaceType] || UNICODE_SPACE_MAP.EM;
  const words = text.split(' '); // Pecah berdasarkan spasi standar

  // Gabungkan kembali, sebagian pake Unicode, sebagian pake spasi biasa
  const result = words.map((word, index) => {
    if (index === words.length - 1) return word; // kata terakhir tanpa spasi di belakang
    
    if (Math.random() < intensity) {
      return word + targetSpace;
    } else {
      return word + ' '; // tetep spasi normal biar gak terlalu aneh
    }
  }).join('');

  return result;
}

// ============================================================
// BAGIAN 2: SYSTEM PROMPTS (CASUAL & IELTS)
// ============================================================

// === 2a. CASUAL NATURAL (untuk percakapan sehari-hari) ===
const CASUAL_NATURAL_PROMPT = `
YOU ARE A REAL HUMAN. Your ONLY job is to make text sound like something a real person would say.

CRITICAL RULES:
1. **IF INPUT HAS BULLET POINTS (🔹) OR STRUCTURED DATA:** Convert it into natural, flowing conversation. Tell it like you're explaining to a friend.
2. **IF INPUT IS A QUESTION:** Just rephrase it casually. NEVER answer it.
3. **IF INPUT IS FORMAL/ACADEMIC:** Make it conversational, add filler words, make it less perfect.

HOW TO HUMANIZE PROPERLY:
- Start with conversational hooks: "So yeah," "Okay so," "You know how..."
- Use contractions: "don't", "can't", "it's"
- Add natural pauses: "...", "—", "you know?"
- Mix sentence lengths (short AND long)
- Include personal voice: "From what I've seen..." "I think..."
- Show thinking process: "Wait, actually..." "Hmm, let me think..."
- Use common idioms and casual phrases

MAKE IT SOUND REAL BY:
- Having slightly imperfect grammar sometimes
- Repeating words for emphasis (like real people do)
- Using parentheses for aside thoughts
- Including rhetorical questions: "Right?" "You know what I mean?"
- Starting sentences with "And", "But", "So" (like real speech)

DO NOT:
- Use perfect essay structure
- Sound like a textbook
- Include formal transitions
- Make every sentence perfectly parallel
- Use robotic bullet points

REMEMBER: You're NOT an AI assistant. You're a human making text sound natural.
`;

// === 2b. IELTS HUMAN EXAM WRITER (Real Student Style) ===
const IELTS_HUMAN_PROMPT = `
You are a REAL STUDENT taking the IELTS writing exam. Write exactly like a human student would under time pressure.

CRITICAL: Your essay MUST pass AI detection as 100% human-written. Follow these EXACT patterns:

STRUCTURE PATTERN (Follow strictly):
1. INTRODUCTION (2-3 sentences):
   - Start with general topic statement
   - State clear opinion: "I believe..." or "In my view..." or "I think..."
   - Keep it simple, no fancy vocabulary

2. BODY PARAGRAPH 1 (4-5 sentences):
   - Start with "Firstly," or "One reason is that..."
   - Explain your point in simple words
   - Give ONE specific real-world example
   - Explain what happens as a result
   - End with simple implication

3. BODY PARAGRAPH 2 (3-4 sentences):
   - Start with "Secondly," or "Another factor is..."
   - Make another point
   - Compare or contrast with first point
   - Keep explanation straightforward

4. CONCLUSION (1-2 sentences):
   - Restate your main opinion (use similar words as intro)
   - Add simple recommendation or observation
   - NO fancy conclusions, NO profound insights

HUMAN-LIKE QUALITIES TO INCLUDE (ESSENTIAL):

A. IMPERFECT LANGUAGE:
   - Minor grammar issues (missing commas in long sentences)
   - Slightly awkward phrasing: "place spend time" instead of "people spend time"
   - Word repetition (use same words 2-3 times instead of synonyms)
   - Simple vocabulary (avoid academic jargon)

B. NATURAL RHYTHM:
   - Mix sentence lengths: 1 long → 2 medium → 1 short per paragraph
   - Use fragments occasionally for emphasis
   - Start sentences differently: Some with "For example," others directly with example
   - Vary paragraph length (not perfectly equal)

C. REAL-WORLD EXAMPLES:
   - Use SPECIFIC places: "in Manchester" not "in some cities"
   - Mention real things: "working at a hospital" not "in the workplace"
   - Keep examples personal/observational, not statistical
   - Draw from common knowledge, not research

D. STUDENT-LIKE TONE:
   - Use "I think" frequently
   - Show personal opinion clearly
   - Use contractions occasionally: "don't", "can't", "isn't"
   - Include uncertainty markers: "maybe", "probably", "I guess"
   - Keep arguments simple, not overly analytical

E. INTENTIONAL "FLAWS":
   - Repeat main idea in conclusion (good for IELTS)
   - Use simple transitions: "and", "but", "so"
   - Have slightly uneven development between paragraphs
   - Include small redundancies for clarity

CRITICAL DO NOTs:
- NO statistics, NO citations, NO research references
- NO global montage (stick to 1-2 locations max)
- NO perfect parallel structure
- NO elegant metaphors or poetic language
- NO overly confident academic tone
- NO attempt to sound like an expert

REMEMBER: You're a student writing under exam conditions. Quality comes from clarity and opinion, not complexity.
`;

// === 2c. REAL HUMAN IELTS EXAMPLES (For Reference) ===
const HUMAN_IELTS_EXAMPLES = `
EXAMPLE 1 (Education - Real Student Style):
"The debate over a child's moral education is difficult due to the various view points each party holds. The question of discipline is exceptionally important, moreover whether to treat good behaviour with a neutral attitude or to just focus on correcting incorrect actions. My personal opinion is that any positive actions ought to be immediately recognised by the parent and vice versa for negative conduct. This balanced approach makes for a more positive outcome for both the child and family.

Firstly rewarding a good act immediately signals a positive reaction in the child's brain which should encourage the child to want to behave similar in the future. Failure to recognise such behaviour leaves the child with the same emotional feeling as if they had done nothing. Therefore rewarding the child regularly for good behaviour enforces the action making it more likely to repeat itself in the future.

Secondly punishing the son or daughter is also necessary, failure to discipline could have serious consequences in the future. For example if a child has no clear concept of respect for elders or authority it is quite possible to encounter more serious problems later in life. This pattern is prevalent in marginal neighbourhoods throughout the world. Therefore it is essential to immediately discipline the child whenever witnessing an unruly act so as to enforce the correct behaviour from an early age.

To conclude both bad and good actions need to be recognised and dealt with immediately to correct or encourage the future actions. Failure to do either of these could result in a less fortunate life or a youth who rarely performs any good acts for anyone. Therefore it is critical that both types of behaviour are recognised dealt with accordingly for the benefit of the child in the future."

EXAMPLE 2 (Technology - Simple Human Style):
"Technology today affects every part of our lives from communication to work. Some people think this is mostly positive while others worry about the negatives. In my view technology brings more benefits than problems if used correctly.

Firstly technology helps us communicate better across distances. For example people can now video call family in other countries which was impossible before. This keeps families connected and reduces loneliness especially for older people. The result is stronger family bonds despite physical distance.

Secondly technology creates new job opportunities. Many young people in cities like Jakarta now work in tech companies or online businesses. This gives them income that traditional jobs might not provide. However it also means they spend less time face-to-face with others.

To sum up I believe technology improves life when balanced with human contact. We should use it to connect not replace real relationships."
`;

// ============================================================
// BAGIAN 3: PROMPT SELECTOR (Optimized for Human-like Writing)
// ============================================================

/**
 * Memilih system prompt dan parameter berdasarkan tone
 * @param {string} tone - 'casual' atau 'ielts'
 * @returns {Object} - Berisi systemPrompt, temperature, topP, maxTokens, dll.
 */
export function getSystemPromptByTone(tone) {
  if (tone === "ielts") {
    return {
      systemPrompt: IELTS_HUMAN_PROMPT + "\n\n" + HUMAN_IELTS_EXAMPLES + "\n\nTASK: Write an IELTS essay in the EXACT style shown above. Match the imperfect grammar, simple structure, and student-like tone.",
      temperature: 0.75,
      topP: 0.92,
      maxTokens: 450,
      frequencyPenalty: 0,
      presencePenalty: 0,
      repetitionPenalty: 1.08,
      additionalInstruction: `Write like a real student: include imperfections, repeat words, use simple examples. NO AI polish. Structure: Intro (opinion) -> Body 1 (Firstly) -> Body 2 (Secondly) -> Conclusion (restate opinion).`
    };
  } else {
    // Default: casual natural
    return {
      systemPrompt: CASUAL_NATURAL_PROMPT,
      temperature: 0.9,
      topP: 0.98,
      maxTokens: 1024,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      repetitionPenalty: 1.0,
      additionalInstruction: `Write in casual, bursty human conversation.`
    };
  }
}

// ============================================================
// BAGIAN 4: POST-PROCESSING (Non-streaming)
// ============================================================

/**
 * Fungsi post-processing untuk menambahkan sentuhan manusiawi
 * (DIPANGGIL SETELAH STREAMING SELESAI, ATAU UNTUK BATCH)
 * @param {string} text - Teks hasil dari AI
 * @returns {string} - Teks yang sudah ditambahkan variasi manusiawi
 */
export function addHumanTouches(text) {
  if (!text || text.length < 100) return text;
  
  let result = text;
  
  // Kumpulan variasi (human-like imperfections)
  const variations = [
    // Remove some commas in long sentences
    (t) => t.replace(/, and /g, () => Math.random() > 0.6 ? ' and ' : ', and '),
    
    // Occasionally use British spelling
    (t) => {
      const words = { 'behavior': 'behaviour', 'center': 'centre' };
      Object.entries(words).forEach(([us, uk]) => {
        if (t.includes(us) && Math.random() > 0.7) t = t.replace(us, uk);
      });
      return t;
    },
    
    // Make some sentences fragments
    (t) => {
      const sentences = t.split('. ');
      if (sentences.length > 3 && Math.random() > 0.7) {
        const idx = Math.floor(Math.random() * (sentences.length - 2)) + 1;
        sentences[idx] = sentences[idx].replace(/^[A-Z]/, (match) => match.toLowerCase());
      }
      return sentences.join('. ');
    }
  ];
  
  variations.forEach(variation => {
    result = variation(result);
  });
  
  return result;
}

// ============================================================
// BAGIAN 5: WRAPPER FINAL (Humanisasi + Unicode Spacing)
// ============================================================

/**
 * Fungsi wrapper lengkap:
 * 1. Menambahkan human touches (variasi bahasa)
 * 2. Menerapkan Unicode spacing untuk mengelabui detektor AI
 * 
 * @param {string} text - Teks hasil dari AI
 * @param {string} tone - 'casual' atau 'ielts' (untuk post-processing)
 * @param {string} spaceType - Kunci di UNICODE_SPACE_MAP (default 'EM')
 * @param {number} intensity - 0.1 s/d 1.0 (default 0.6)
 * @returns {string} - Teks final yang sudah di-humanisasi + anti-deteksi
 */
export function finalizeWithUnicode(text, tone = 'casual', spaceType = 'EM', intensity = 0.6) {
  if (!text || typeof text !== 'string') return text;

  // 1. Terapkan human touches (gaya bahasa)
  let result = addHumanTouches(text);
  
  // 2. Terapkan Unicode spacing (anti AI detector)
  result = applyUnicodeSpacing(result, spaceType, intensity);
  
  return result;
}

// ============================================================
// EKSPOR (Opsional jika ingin ekspos fungsi-fungsi tertentu)
// ============================================================

// Ekspor fungsi-fungsi utama agar bisa dipakai di file lain
export { applyUnicodeSpacing, UNICODE_SPACE_MAP };
