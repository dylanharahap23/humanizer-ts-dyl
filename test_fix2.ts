import { injectObsessionAcrossText, injectTopicAnchors } from './humanizer';

// Test dengan kalimat yang mengandung "because" untuk trigger obsession
const sourceWithBecause = "Students struggle because the curriculum is outdated. Many graduates cannot find jobs because companies require experience.";

console.log("=== TEST: injectObsessionAcrossText (dengan because, tanpa first person) ===");
const result1 = injectObsessionAcrossText(sourceWithBecause, sourceWithBecause);
console.log("Source:", sourceWithBecause);
console.log("Result:", result1);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result1));
console.log();

console.log("=== TEST: injectTopicAnchors (topik job, tanpa first person) ===");
const result2 = injectTopicAnchors(sourceWithBecause, sourceWithBecause);
console.log("Source:", sourceWithBecause);
console.log("Result:", result2);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result2));
