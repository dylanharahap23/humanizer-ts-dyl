import { injectObsessionAcrossText, injectTopicAnchors } from './humanizer';

// Test tanpa first/second person di sumber
const sourceWithoutPerson = "One of the most important factors in gaining weight is consuming more calories than you burn. Another reason is that metabolism varies between individuals. Finally, consistency in eating patterns plays a significant role.";

// Test dengan first person di sumber
const sourceWithFirstPerson = "I think one of the most important factors is consuming more calories. I believe metabolism varies between us.";

console.log("=== TEST 1: injectObsessionAcrossText (tanpa first/second person) ===");
const result1 = injectObsessionAcrossText(sourceWithoutPerson, sourceWithoutPerson);
console.log("Source:", sourceWithoutPerson);
console.log("Result:", result1);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result1));
console.log();

console.log("=== TEST 2: injectObsessionAcrossText (dengan first person) ===");
const result2 = injectObsessionAcrossText(sourceWithFirstPerson, sourceWithFirstPerson);
console.log("Source:", sourceWithFirstPerson);
console.log("Result:", result2);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result2));
console.log();

console.log("=== TEST 3: injectTopicAnchors (tanpa first/second person, topik job) ===");
const jobSource = "Finding a job requires persistence and preparation. Many graduates struggle with the application process.";
const result3 = injectTopicAnchors(jobSource, jobSource);
console.log("Source:", jobSource);
console.log("Result:", result3);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result3));
console.log();

console.log("=== TEST 4: injectTopicAnchors (dengan first person, topik job) ===");
const jobSourceWithPerson = "I found that finding a job requires persistence. My experience shows many graduates struggle.";
const result4 = injectTopicAnchors(jobSourceWithPerson, jobSourceWithPerson);
console.log("Source:", jobSourceWithPerson);
console.log("Result:", result4);
console.log("Has I/me/my:", /\b(I|me|my)\b/i.test(result4));
