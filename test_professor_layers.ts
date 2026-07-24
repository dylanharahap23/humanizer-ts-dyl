import { 
  injectIdleSentences, 
  createUnevenFocus, 
  zoomInOut, 
  forceInformationLoss, 
  organicMistakes,
  finalHumanize 
} from './humanizer';

const sampleText = `Artificial intelligence is transforming many industries. Machine learning algorithms can now process vast amounts of data quickly. This has led to significant improvements in healthcare diagnostics. Doctors can use AI to detect diseases earlier than ever before. In finance, AI helps detect fraudulent transactions. Banks save millions of dollars each year through these systems. Transportation is also being revolutionized by AI. Self-driving cars are becoming more common on our roads. However, there are concerns about job displacement. Many workers worry that AI will take their jobs. Education is another area where AI is making an impact. Students can use AI tutors to learn at their own pace. The future of AI looks promising but also uncertain.`;

console.log("=== ORIGINAL TEXT ===");
console.log(sampleText);
console.log("\n");

console.log("=== TEST 1: injectIdleSentences (Layer 7, 13) ===");
let result = injectIdleSentences(sampleText);
console.log(result);
console.log("\n");

console.log("=== TEST 2: createUnevenFocus (Layer 8, 15) ===");
result = createUnevenFocus(sampleText);
console.log(result);
console.log("\n");

console.log("=== TEST 3: zoomInOut (Layer 12) ===");
result = zoomInOut(sampleText);
console.log(result);
console.log("\n");

console.log("=== TEST 4: forceInformationLoss (Layer 16) ===");
result = forceInformationLoss(sampleText);
console.log(result);
console.log("\n");

console.log("=== TEST 5: organicMistakes (Layer 10, 14) ===");
result = organicMistakes(sampleText);
console.log(result);
console.log("\n");

console.log("=== TEST 6: finalHumanize with english-general ===");
result = finalHumanize(sampleText, "english-general", false);
console.log(result);
console.log("\n");

console.log("=== ALL TESTS COMPLETED ===");
