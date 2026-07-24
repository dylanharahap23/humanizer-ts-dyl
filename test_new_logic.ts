import { 
  isComprehensiveNeutralExplanation, 
  transformToPersonalOpinion, 
  isShortGenericExplanation, 
  injectSafeSpecificsAndOrganicChaos 
} from './humanizer';

// Test 1: Comprehensive neutral explanation (iPhone-style text) - with proper list structure
const iphoneText = "The iPhone 17 Pro Max is expensive for several reasons. First, the custom A-series chip costs a fortune to develop, and the OLED display is top-notch, and Apple pours billions into R&D, and you get years of software updates. Second, the camera system uses professional parts, and the build quality is exceptional, and the ecosystem integration is seamless, and the resale value stays high. It's not just the Apple logo; it's the combination of all these factors.";

console.log('=== TEST 1: iPhone Text Detection ===');
console.log('isComprehensiveNeutralExplanation:', isComprehensiveNeutralExplanation(iphoneText));
console.log('\nTransformed:');
console.log(transformToPersonalOpinion(iphoneText));

// Test 2: Short generic explanation
const shortGeneric = 'Many people often wonder about certain factors. Some researchers typically suggest various approaches. Usually, the results are generally positive.';

console.log('\n\n=== TEST 2: Short Generic Explanation Detection ===');
console.log('isShortGenericExplanation:', isShortGenericExplanation(shortGeneric));
console.log('\nTransformed:');
console.log(injectSafeSpecificsAndOrganicChaos(shortGeneric));
