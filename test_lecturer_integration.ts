import { finalHumanize } from './humanizer';

// Test text (AI-generated essay about economic growth)
const aiText = `I partly agree that economic growth is essential because it provides the financial resources needed for national development. However, I believe that focusing solely on economic indicators like GDP can lead to neglect of other vital areas such as healthcare, education, and environmental protection.

For example, many rapidly developing countries have experienced significant pollution and resource depletion in their pursuit of economic growth. This suggests that while economic expansion is important, it must be balanced with sustainable practices.

In conclusion, economic growth is valuable but should not be the only measure of a nation's success.`;

console.log('=== ORIGINAL AI TEXT ===');
console.log(aiText);
console.log('\n=== HUMANIZED TEXT ===');
const humanized = finalHumanize(aiText, 'ielts', false);
console.log(humanized);
