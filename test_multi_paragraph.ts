import { 
  randomizeIdeaOrder, 
  stripConnectiveWords, 
  injectCognitiveUncertainty,
  finalHumanize 
} from "./humanizer";

// Test text with multiple paragraphs (typical AI structure)
const aiTextMulti = `Language learning is a complex process that requires dedication and time.

First, exposure to the language is crucial for developing fluency. Sarah learned Spanish by living in Mexico for two years and became fluent quickly.

Another reason is that consistent practice matters more than intensity. Alex practiced every day for six months and saw great results compared to intensive weekend sessions.

Furthermore, motivation plays a key role in long-term success. Students who have clear goals tend to persist longer.

In conclusion, anyone can learn a language with the right approach and dedication.`;

console.log("=== ORIGINAL MULTI-PARAGRAPH AI TEXT ===");
console.log(aiTextMulti);
console.log("\n");

// Test FIX 2: Structural Randomizer
console.log("=== AFTER randomizeIdeaOrder (FIX 2) ===");
let result = randomizeIdeaOrder(aiTextMulti);
console.log(result);
console.log("\n");

// Test combined effect via finalHumanize
console.log("=== COMBINED: finalHumanize with english-expository ===");
result = finalHumanize(aiTextMulti, "english-expository");
console.log(result);
console.log("\n");
