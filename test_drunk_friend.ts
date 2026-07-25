// Test script untuk verify DRUNK_FRIEND_PROMPT implementation
import { DRUNK_FRIEND_PROMPT } from './humanizer';

console.log("=== DRUNK FRIEND PROMPT TEST ===\n");
console.log("Prompt exists:", !!DRUNK_FRIEND_PROMPT);
console.log("Prompt length:", DRUNK_FRIEND_PROMPT?.length);
console.log("\nPrompt content:");
console.log(DRUNK_FRIEND_PROMPT);

// Verify key elements
const hasRules = DRUNK_FRIEND_PROMPT.includes("Start in the middle of a thought");
const hasSelfCorrection = DRUNK_FRIEND_PROMPT.includes("Use the wrong word sometimes and correct yourself");
const hasUncertainty = DRUNK_FRIEND_PROMPT.includes("Say \"I don't know\"");
const hasNoTransitions = DRUNK_FRIEND_PROMPT.includes("Do NOT use transition words");
const hasExample = DRUNK_FRIEND_PROMPT.includes("EXAMPLE of the style");

console.log("\n=== VERIFICATION ===");
console.log("✓ Has 'start in middle' rule:", hasRules);
console.log("✓ Has self-correction rule:", hasSelfCorrection);
console.log("✓ Has uncertainty rule:", hasUncertainty);
console.log("✓ Has no-transitions rule:", hasNoTransitions);
console.log("✓ Has example:", hasExample);
console.log("\nAll checks passed:", hasRules && hasSelfCorrection && hasUncertainty && hasNoTransitions && hasExample);
