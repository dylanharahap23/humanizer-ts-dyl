import { 
  randomizeIdeaOrder, 
  stripConnectiveWords, 
  injectCognitiveUncertainty,
  finalHumanize 
} from "./humanizer";

// Test text with typical AI structure
const aiText = `Language learning is a complex process that requires dedication. First, exposure to the language is crucial. Sarah learned Spanish by living in Mexico for two years. Another reason is that consistent practice matters. Alex practiced every day for six months and saw great results. Finally, motivation plays a key role. In conclusion, anyone can learn a language with the right approach.`;

console.log("=== ORIGINAL AI TEXT ===");
console.log(aiText);
console.log("\n");

// Test FIX 2: Structural Randomizer
console.log("=== AFTER randomizeIdeaOrder (FIX 2) ===");
let result = randomizeIdeaOrder(aiText);
console.log(result);
console.log("\n");

// Test FIX 3: Remove Connective Words
console.log("=== AFTER stripConnectiveWords (FIX 3) ===");
result = stripConnectiveWords(aiText);
console.log(result);
console.log("\n");

// Test FIX 5: Inject Cognitive Uncertainty
console.log("=== AFTER injectCognitiveUncertainty (FIX 5) ===");
result = injectCognitiveUncertainty(aiText);
console.log(result);
console.log("\n");

// Test combined effect via finalHumanize
console.log("=== COMBINED: finalHumanize with english-expository ===");
result = finalHumanize(aiText, "english-expository");
console.log(result);
console.log("\n");

// Test with casual tone
console.log("=== COMBINED: finalHumanize with casual ===");
result = finalHumanize(aiText, "casual");
console.log(result);
console.log("\n");

// Test with english-general
console.log("=== COMBINED: finalHumanize with english-general ===");
result = finalHumanize(aiText, "english-general");
console.log(result);
console.log("\n");
