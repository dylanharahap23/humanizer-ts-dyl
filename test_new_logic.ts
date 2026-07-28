import { destroyIeltsTemplate, strengthenOpinion, concretizeExamples, addNaturalImperfection } from './humanizer';

const testText = `On the one hand, politicians should have privacy. For example, they need time with family. On the other hand, public accountability matters. I partly agree that both sides have merit. In conclusion, we must balance privacy and transparency.`;

console.log('=== ORIGINAL TEXT ===');
console.log(testText);
console.log('\n');

let result = testText;

// Test strengthenOpinion FIRST (before destroyIeltsTemplate according to new logic)
result = strengthenOpinion(result);
console.log('=== AFTER strengthenOpinion ===');
console.log(result);
console.log('\n');

// Test concretizeExamples
result = concretizeExamples(result);
console.log('=== AFTER concretizeExamples ===');
console.log(result);
console.log('\n');

// Test addNaturalImperfection
result = addNaturalImperfection(result);
console.log('=== AFTER addNaturalImperfection ===');
console.log(result);
console.log('\n');

// Note: destroyIeltsTemplate is now OPTIONAL per dosen's new logic
// "Template IELTS BUKAN masalah - biarkan tetap ada"
