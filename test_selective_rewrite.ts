// Test script to verify selective rewrite logic
import { 
  isComprehensiveNeutralExplanation,
  SELECTIVE_REWRITE_PROMPT,
  injectHumanSpecifics 
} from './humanizer';

console.log("=== Testing Selective Rewrite Logic ===\n");

// Test 1: Comprehensive neutral text detection (WITHOUT first person)
const comprehensiveText = `Artificial intelligence has transformed many aspects of modern life. There are various factors contributing to its rapid adoption.

One reason for AI's growth is the availability of large datasets. Another factor is the advancement in computing power. Furthermore, machine learning algorithms have become more sophisticated.

In conclusion, AI will continue to shape our future in significant ways. Overall, the technology offers comprehensive benefits across multiple sectors.`;

console.log("Test 1: Detecting comprehensive neutral text");
console.log("Input text length:", comprehensiveText.length);
console.log("Has list markers:", /\b(?:one (?:reason|factor|aspect)|another (?:reason|factor)|finally|in addition|furthermore|\d+\.\s)/i.test(comprehensiveText));
console.log("Has conclusion:", /\b(?:in conclusion|to sum up|ultimately|in summary|overall,|in the end|despite these|although)\b/i.test(comprehensiveText));
console.log("Has first person:", /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(comprehensiveText));
console.log("Is comprehensive neutral:", isComprehensiveNeutralExplanation(comprehensiveText));
console.log("Expected: true\n");

// Test 2: Personal text (should NOT be detected as comprehensive neutral)
const personalText = `I think AI is pretty cool, but honestly, it's not perfect. You might wonder why I say that. Well, let me explain my perspective.

From my experience, the hype around AI is overblown. Sure, it can do amazing things, but there are serious limitations we need to talk about.`;

console.log("Test 2: Personal text (should NOT trigger)");
console.log("Has first person:", /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(personalText));
console.log("Is comprehensive neutral:", isComprehensiveNeutralExplanation(personalText));
console.log("Expected: false\n");

// Test 3: Selective rewrite prompt exists
console.log("Test 3: Selective rewrite prompt");
console.log("Prompt length:", SELECTIVE_REWRITE_PROMPT.length);
console.log("Contains 'selectively':", SELECTIVE_REWRITE_PROMPT.includes('selectively'));
console.log("Contains 'discarding':", SELECTIVE_REWRITE_PROMPT.includes('discarding'));
console.log("Contains 'rhetorical question':", SELECTIVE_REWRITE_PROMPT.includes('rhetorical question'));
console.log("Contains 'specific number':", SELECTIVE_REWRITE_PROMPT.includes('specific number') || SELECTIVE_REWRITE_PROMPT.includes('number, year, or name'));
console.log();

// Test 4: Inject human specifics
const sourceWithSpecifics = `According to Dr. John Smith from Harvard University, approximately 32 million people were affected by the disease in 1981. The research team led by Professor Mary Johnson confirmed these findings.`;

const plainText = `The disease affected many people. Research confirmed the findings. This matters for public health.`;

console.log("Test 4: Inject human specifics");
console.log("Source text:", sourceWithSpecifics.substring(0, 80) + "...");
console.log("Plain text before:", plainText);
const enhanced = injectHumanSpecifics(plainText, sourceWithSpecifics);
console.log("Enhanced text after:", enhanced);
console.log("Has numbers:", /\d{2,}/.test(enhanced));
console.log("Has question mark:", /\?/.test(enhanced));
console.log("Has researcher name:", enhanced.includes("Smith") || enhanced.includes("Johnson"));
console.log();

console.log("=== All tests completed ===");
