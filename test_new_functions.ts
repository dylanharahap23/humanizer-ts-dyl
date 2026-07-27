import {
  deAISignatureWords,
  injectNaturalImperfections,
  addContractions,
  strengthenPersonalOpinion,
  injectOutlierSentences,
  injectExtremeParagraphVariation,
} from "./humanizer";

const testText = `One of the most important factors in gaining weight is consuming more calories than you burn. Another reason is that metabolism varies between individuals. Finally, consistency in eating patterns plays a significant role. People should focus on nutrient-dense foods and maintain regular meal schedules. It is recommended to consult with a healthcare provider for personalized advice.

I partly agree with this approach because it covers the basics. However, there are other considerations. The underlying causes of weight gain are complex. Socioeconomic factors also play a role. We cannot ignore that financial hardship affects food choices.

In conclusion, a comprehensive education about nutrition is essential. Stringent legal frameworks might help regulate food advertising. Communities should foster greater social cohesion around healthy eating.`;

console.log("=== ORIGINAL TEXT ===");
console.log(testText);
console.log("\n\n=== AFTER deAISignatureWords ===");
let result = deAISignatureWords(testText);
console.log(result);

console.log("\n\n=== AFTER injectNaturalImperfections ===");
result = injectNaturalImperfections(result);
console.log(result);

console.log("\n\n=== AFTER addContractions ===");
result = addContractions(result);
console.log(result);

console.log("\n\n=== AFTER strengthenPersonalOpinion ===");
result = strengthenPersonalOpinion(result);
console.log(result);

console.log("\n\n=== AFTER injectOutlierSentences ===");
result = injectOutlierSentences(result);
console.log(result);

console.log("\n\n=== AFTER injectExtremeParagraphVariation ===");
result = injectExtremeParagraphVariation(result);
console.log(result);

console.log("\n\n=== ALL FUNCTIONS COMBINED (like in route.ts) ===");
let combined = testText;
combined = deAISignatureWords(combined);
combined = injectNaturalImperfections(combined);
combined = addContractions(combined);
combined = strengthenPersonalOpinion(combined);
combined = injectOutlierSentences(combined);
combined = injectExtremeParagraphVariation(combined);
console.log(combined);
