import { finalHumanize } from './humanizer';

// Test dengan essay IELTS yang lebih lengkap
const testEssay = `On the one hand, many people believe that reading is essential for children's development. For example, adventure novels and stories can expand their imagination and vocabulary. Furthermore, reading helps improve concentration and academic performance.

On the other hand, some argue that outdoor play is equally important. For instance, playing outdoor games teaches teamwork and physical fitness. Moreover, children need to develop social skills through interaction with peers.

I partly agree with both viewpoints. In my opinion, a balanced approach is necessary. In conclusion, the best way to raise well-rounded children is to balance reading and play so they can reach their full potential.`;

console.log('=== ORIGINAL ESSAY ===');
console.log(testEssay);
console.log('\n');

console.log('=== AFTER FULL PIPELINE (finalHumanize) ===');
const result = finalHumanize(testEssay, 'casual', false);
console.log(result);
console.log('\n');

// Cek apakah template IELTS masih ada
const hasIeltsTemplate = /On the one hand|On the other hand|In conclusion|Furthermore|Moreover|I partly agree/i.test(result);
console.log('Has IELTS template patterns:', hasIeltsTemplate);

// Cek apakah ada contoh spesifik
const hasSpecificExample = /UK|Finland|reluctant readers|ranked/i.test(result);
console.log('Has specific examples:', hasSpecificExample);

// Cek apakah ada kalimat pendek ekstrem
const sentences = result.split(/[.!?]\s+/);
const shortSentences = sentences.filter(s => s.split(/\s+/).length <= 6);
console.log('Short sentences (<=6 words):', shortSentences.length);
console.log('Short sentences content:', shortSentences);
