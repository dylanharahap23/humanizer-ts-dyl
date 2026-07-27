import { injectObsessionAcrossText, injectTopicAnchors } from './humanizer';

// Test dengan 5+ sentences dan "because"
const text2 = "Students struggle because the curriculum is outdated. Many graduates cannot find jobs because companies require experience. The system needs reform. Universities must adapt. Employers should help.";

console.log("=== TEST dengan 5+ sentences ===");
const result = injectObsessionAcrossText(text2, text2);
console.log("Result:", result);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result));
console.log();

console.log("=== TEST injectTopicAnchors dengan 3+ sentences ===");
const result2 = injectTopicAnchors(text2, text2);
console.log("Result:", result2);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result2));
