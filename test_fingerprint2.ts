import { isHumanFingerprintEligible } from './humanizer';

// Test 1: IELTS essay with template markers (longer)
const ieltsEssay = `Firstly, there are several important reasons why exercise is beneficial for overall health. Secondly, regular physical activity improves cardiovascular function and strengthens muscles. Thirdly, it helps mental wellbeing by reducing stress and anxiety levels. In conclusion, everyone should make an effort to exercise regularly for a healthier lifestyle.`;

console.log('=== TEST 1: IELTS Essay (longer) ===');
console.log('Word count:', ieltsEssay.split(/\s+/).filter(Boolean).length);
console.log('isHumanFingerprintEligible (english-general):', isHumanFingerprintEligible(ieltsEssay, 'english-general'));
console.log('isHumanFingerprintEligible (english-academic):', isHumanFingerprintEligible(ieltsEssay, 'english-academic'));
console.log('isHumanFingerprintEligible (english-sensitive):', isHumanFingerprintEligible(ieltsEssay, 'english-sensitive'));

// Test 2: On the one hand essay (longer)
const balancedEssay = `On the one hand, technology brings many benefits to modern society including improved communication and efficiency. On the other hand, it creates problems such as privacy concerns and social isolation. In conclusion, we must find a balance between embracing innovation and protecting human values.`;
console.log('\n=== TEST 2: Balanced Essay (longer) ===');
console.log('Word count:', balancedEssay.split(/\s+/).filter(Boolean).length);
console.log('isHumanFingerprintEligible (english-general):', isHumanFingerprintEligible(balancedEssay, 'english-general'));

// Test 3: Firstly + Secondly only
const twoMarkerEssay = `Firstly, the economic implications are significant for developing nations. Secondly, environmental concerns must be addressed through policy changes. The evidence suggests multiple approaches are needed.`;
console.log('\n=== TEST 3: Two Marker Essay ===');
console.log('Word count:', twoMarkerEssay.split(/\s+/).filter(Boolean).length);
console.log('isHumanFingerprintEligible (english-general):', isHumanFingerprintEligible(twoMarkerEssay, 'english-general'));

console.log('\n=== ALL TESTS COMPLETE ===');
