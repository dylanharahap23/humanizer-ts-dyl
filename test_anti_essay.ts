import { antiEssayTransformation } from './humanizer';

// Test 1: Humanizer output (AI-detected style)
const test1 = `So I just found out... you know how people always say... My friend, she cries... happy chemicals... calm chemicals... Like oxytocin. You know? If you are crying so much, then it might be like a sign. I don't know. But yeah, the daily crying thing? Total myth.`;

console.log('=== TEST 1: Humanizer Output (AI-style) ===');
console.log('INPUT:');
console.log(test1);
console.log('\nOUTPUT:');
console.log(antiEssayTransformation(test1));

// Test 2: More explanatory text
const test2 = `Crying is actually good for you because it releases stress hormones. So when you cry, your body is basically detoxing. You know, like a natural reset button. It's kind of amazing how it works.`;

console.log('\n\n=== TEST 2: Explanatory Text ===');
console.log('INPUT:');
console.log(test2);
console.log('\nOUTPUT:');
console.log(antiEssayTransformation(test2));

// Test 3: Expected human-like output (for comparison)
const expectedHuman = `Sadness, fear, anxiety, pain. Sometimes joy or overwhelming happiness.
Crying is probably the body's natural way of healing...
Why do you want to stop crying when you are alone? It's okay.
Feel all your emotions you need to feel right now. Let the tears flow...
I learned this when I was recovering from trauma...
Cry as much as you need to... Then take care of yourself...`;

console.log('\n\n=== EXPECTED HUMAN OUTPUT (for reference) ===');
console.log(expectedHuman);
