import {
  dropInformationLoss,
  transformReasoningGraph,
  injectRealFragments,
  injectObsessionAcrossText,
  injectClusteredHedging,
  forceConversationalRegister,
  injectTopicAnchors,
  injectCognitiveUncertaintyFinal,
} from "./humanizer";

const sampleText = `
Artificial intelligence is transforming the workplace because it automates repetitive tasks. 
As a result, many workers are concerned about job displacement. 
Companies should invest in retraining programs to help employees adapt. 
Furthermore, AI can enhance productivity by handling data analysis more efficiently. 
Therefore, the future of work will require new skills. 
In conclusion, businesses must balance automation with human oversight.
For example, customer service chatbots handle routine inquiries while humans manage complex issues.
`;

console.log("=== ORIGINAL TEXT ===");
console.log(sampleText);
console.log("\n");

let result = sampleText;

// Test 1: Drop Information Loss
console.log("=== 1. DROP INFORMATION LOSS ===");
result = dropInformationLoss(result);
console.log(result);
console.log("\n");

// Test 2: Transform Reasoning Graph
console.log("=== 2. TRANSFORM REASONING GRAPH ===");
result = transformReasoningGraph(result);
console.log(result);
console.log("\n");

// Test 3: Inject Real Fragments
console.log("=== 3. INJECT REAL FRAGMENTS ===");
result = injectRealFragments(result);
console.log(result);
console.log("\n");

// Test 4: Inject Obsession Loop
console.log("=== 4. INJECT OBSESSION LOOP ===");
result = injectObsessionAcrossText(result);
console.log(result);
console.log("\n");

// Test 5: Inject Clustered Hedging
console.log("=== 5. INJECT CLUSTERED HEDGING ===");
result = injectClusteredHedging(result);
console.log(result);
console.log("\n");

// Test 6: Force Conversational Register
console.log("=== 6. FORCE CONVERSATIONAL REGISTER ===");
result = forceConversationalRegister(result);
console.log(result);
console.log("\n");

// Test 7: Inject Topic Anchors
console.log("=== 7. INJECT TOPIC ANCHORS ===");
result = injectTopicAnchors(result);
console.log(result);
console.log("\n");

// Test 8: Inject Cognitive Uncertainty
console.log("=== 8. INJECT COGNITIVE UNCERTAINTY ===");
result = injectCognitiveUncertaintyFinal(result);
console.log(result);
console.log("\n");

console.log("=== ALL TESTS COMPLETED SUCCESSFULLY ===");
