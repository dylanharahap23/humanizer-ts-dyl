import { isHumanFingerprintEligible, HUMAN_FINGERPRINT_REWRITE_PROMPT } from './humanizer';

// Test 1: IELTS essay with template markers
const ieltsEssay = `Firstly, there are several reasons why exercise is important. Secondly, it improves physical health. Thirdly, it helps mental wellbeing. In conclusion, everyone should exercise regularly.`;

console.log('=== TEST 1: IELTS Essay ===');
console.log('Input:', ieltsEssay);
console.log('isHumanFingerprintEligible (english-general):', isHumanFingerprintEligible(ieltsEssay, 'english-general'));
console.log('isHumanFingerprintEligible (english-academic):', isHumanFingerprintEligible(ieltsEssay, 'english-academic'));
console.log('isHumanFingerprintEligible (english-sensitive):', isHumanFingerprintEligible(ieltsEssay, 'english-sensitive'));

// Test 2: Short text (should not be eligible)
const shortText = `Exercise is good for you.`;
console.log('\n=== TEST 2: Short Text ===');
console.log('Input:', shortText);
console.log('isHumanFingerprintEligible (english-general):', isHumanFingerprintEligible(shortText, 'english-general'));

// Test 3: Non-template essay
const naturalEssay = `I think exercise matters because it keeps us healthy. When I go running, I feel better mentally too. Not everyone enjoys it, but finding something active helps.`;
console.log('\n=== TEST 3: Natural Essay ===');
console.log('Input:', naturalEssay.slice(0, 100) + '...');
console.log('isHumanFingerprintEligible (english-general):', isHumanFingerprintEligible(naturalEssay, 'english-general'));

// Test 4: On the one hand essay
const balancedEssay = `On the one hand, technology brings many benefits. On the other hand, it creates problems. In conclusion, we must find balance.`;
console.log('\n=== TEST 4: Balanced Essay ===');
console.log('Input:', balancedEssay);
console.log('isHumanFingerprintEligible (english-general):', isHumanFingerprintEligible(balancedEssay, 'english-general'));

// Test 5: Check prompt template
console.log('\n=== TEST 5: HUMAN_FINGERPRINT_REWRITE_PROMPT ===');
console.log('Prompt contains {sourceText}:', HUMAN_FINGERPRINT_REWRITE_PROMPT.includes('{sourceText}'));
console.log('Prompt length:', HUMAN_FINGERPRINT_REWRITE_PROMPT.length);

console.log('\n=== ALL TESTS COMPLETE ===');
