import { strengthenOpinion, concretizeExamples, addNaturalImperfection } from './humanizer';

// Test dengan teks yang mengandung "I believe" atau "I think"
const testText1 = `I believe that politicians should respect privacy. For example, they need time with family. However, public accountability also matters.`;

console.log('=== TEST 1: Opinion Strengthening ===');
console.log('Original:', testText1);
let result1 = strengthenOpinion(testText1);
console.log('After strengthenOpinion:', result1);
console.log('\n');

// Test dengan topik education
const testText2 = `Education is important for children. For example, reading helps them learn. Schools should provide books.`;

console.log('=== TEST 2: Education Examples ===');
console.log('Original:', testText2);
let result2 = concretizeExamples(testText2);
console.log('After concretizeExamples:', result2);
console.log('\n');

// Test dengan typo
const testText3 = `Many people have responsibilities in their daily lives. Friends support each other through difficult times.`;

console.log('=== TEST 3: Natural Imperfection ===');
console.log('Original:', testText3);
let result3 = addNaturalImperfection(testText3);
console.log('After addNaturalImperfection:', result3);
console.log('\n');

// Test full pipeline dengan politik
const testText4 = `I think that politicians deserve privacy. For instance, they need family time. But transparency is also crucial. I believe we must find balance.`;

console.log('=== TEST 4: Full Pipeline (Politics) ===');
console.log('Original:', testText4);
let result4 = strengthenOpinion(testText4);
console.log('After strengthenOpinion:', result4);
result4 = concretizeExamples(result4);
console.log('After concretizeExamples:', result4);
result4 = addNaturalImperfection(result4);
console.log('After addNaturalImperfection:', result4);
