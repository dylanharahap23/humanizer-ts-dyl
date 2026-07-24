import { 
  reduceCoverage, 
  breakClosedLoop, 
  destroyTaxonomy, 
  deTransition, 
  injectBiasedEgo, 
  injectAttentionTunnel, 
  introduceInefficiency,
  finalHumanize 
} from "./humanizer";

// Test text that looks like AI output (comprehensive, structured, neutral)
const aiText = `Artificial intelligence is transforming many industries. There are several reasons why this is happening.

First, AI can process data much faster than humans. This allows companies to make decisions quickly and efficiently.

Second, machine learning algorithms can identify patterns that humans might miss. For example, in healthcare, AI can detect diseases earlier than traditional methods.

Third, automation reduces costs significantly. Businesses can save money by using AI for repetitive tasks.

Furthermore, AI systems work 24/7 without fatigue. This means continuous operation without breaks or errors.

In conclusion, artificial intelligence offers multiple benefits that explain its rapid adoption across various sectors.`;

console.log("=== ORIGINAL TEXT ===");
console.log(aiText);
console.log("\n");

console.log("=== TEST 1: reduceCoverage ===");
console.log(reduceCoverage(aiText));
console.log("\n");

console.log("=== TEST 2: breakClosedLoop ===");
console.log(breakClosedLoop(aiText));
console.log("\n");

console.log("=== TEST 3: destroyTaxonomy ===");
console.log(destroyTaxonomy(aiText));
console.log("\n");

console.log("=== TEST 4: deTransition ===");
console.log(deTransition(aiText));
console.log("\n");

console.log("=== TEST 5: injectBiasedEgo ===");
console.log(injectBiasedEgo(aiText));
console.log("\n");

console.log("=== TEST 6: injectAttentionTunnel ===");
console.log(injectAttentionTunnel(aiText));
console.log("\n");

console.log("=== TEST 7: introduceInefficiency ===");
console.log(introduceInefficiency(aiText));
console.log("\n");

console.log("=== TEST 8: finalHumanize with english-general ===");
console.log(finalHumanize(aiText, "english-general", false));
console.log("\n");
