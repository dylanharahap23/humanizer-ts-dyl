import { applyTargetedHumanImprint, finalHumanize } from './humanizer';

// Test case 1: Encyclopedia-style text (like the failing weight gain example)
const encyclopediaText = `One of the most important factors in gaining weight is consuming more calories than you burn. Another reason is that metabolism varies between individuals. Finally, consistency in eating patterns plays a significant role. People should focus on nutrient-dense foods and maintain regular meal schedules. It is recommended to consult with a healthcare provider for personalized advice.`;

console.log("=== ORIGINAL TEXT ===");
console.log(encyclopediaText);
console.log("\n=== AFTER APPLY TARGETED HUMAN IMPRINT ===");
const result = applyTargetedHumanImprint(encyclopediaText, encyclopediaText);
console.log(result);

console.log("\n\n=== TEST WITH FINAL HUMANIZE (english-expository) ===");
const expositoryResult = finalHumanize(encyclopediaText, "english-expository");
console.log(expositoryResult);

console.log("\n\n=== TEST WITH FINAL HUMANIZE (english-discursive) ===");
const discursiveResult = finalHumanize(encyclopediaText, "english-discursive");
console.log(discursiveResult);
