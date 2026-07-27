/**
 * Test integrasi final untuk saran dosen
 * Menguji semua 6 fungsi baru + integrasi route.ts
 */

import {
  deAISignatureWords,
  injectNaturalImperfections,
  addContractions,
  strengthenPersonalOpinion,
  injectOutlierSentences,
  injectExtremeParagraphVariation,
  destroyAcademicTemplate,
  injectAcademicAnchorsImproved,
  injectCognitiveNoiseForAcademic,
  breakParallelism,
  injectPersonalStance,
  deformalizeVocabulary,
  injectHumanIdioms,
  injectRedundancy,
  injectExtremeLengthVariation,
  injectBoldOpinion,
  finalHumanize,
} from "./humanizer";

const aiText = `One of the most significant factors influencing childhood behaviour is positive reinforcement. Furthermore, consistent discipline plays a crucial role. On one hand, some experts argue that strict boundaries are necessary. On the other hand, others believe that flexibility is more beneficial. In conclusion, a balanced approach is essential for fostering psychological well-being and intrinsic motivation in children.`;

console.log("=== ORIGINAL AI TEXT ===");
console.log(aiText);
console.log("\n");

// Simulasi alur route.ts untuk general tones
let currentText = aiText;

console.log("=== STEP 1: deformalizeVocabulary ===");
currentText = deformalizeVocabulary(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 2: destroyAcademicTemplate ===");
currentText = destroyAcademicTemplate(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 3: injectHumanIdioms ===");
currentText = injectHumanIdioms(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 4: injectRedundancy ===");
currentText = injectRedundancy(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 5: deAISignatureWords ===");
currentText = deAISignatureWords(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 6: injectNaturalImperfections ===");
currentText = injectNaturalImperfections(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 7: addContractions ===");
currentText = addContractions(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 8: strengthenPersonalOpinion ===");
currentText = strengthenPersonalOpinion(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 9: injectExtremeLengthVariation ===");
currentText = injectExtremeLengthVariation(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 10: injectBoldOpinion ===");
currentText = injectBoldOpinion(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 11: injectOutlierSentences ===");
currentText = injectOutlierSentences(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 12: injectExtremeParagraphVariation ===");
currentText = injectExtremeParagraphVariation(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 13: injectAcademicAnchorsImproved ===");
currentText = injectAcademicAnchorsImproved(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 14: injectCognitiveNoiseForAcademic ===");
currentText = injectCognitiveNoiseForAcademic(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 15: breakParallelism ===");
currentText = breakParallelism(currentText);
console.log(currentText);
console.log("\n");

console.log("=== STEP 16: injectPersonalStance ===");
currentText = injectPersonalStance(currentText);
console.log(currentText);
console.log("\n");

console.log("=== FINAL: finalHumanize dengan skipHeavyProcessing=true (general tones) ===");
const finalText = finalHumanize(currentText, "english-general", true);
console.log(finalText);
console.log("\n");

// Cek fitur-fitur yang diharapkan
console.log("=== CHECKLIST FITUR YANG DIHARAPKAN ===");
const checks = [
  { name: "Kontraksi (don't, can't, it's)", test: /\b(don't|can't|won't|it's|isn't|aren't)\b/i.test(finalText) },
  { name: "AI signature words diganti", test: !/\b(significantly|fostering|intrinsic motivation|psychological well-being)\b/i.test(finalText) },
  { name: "Opini kuat (I strongly believe, dll)", test: /\b(I strongly believe|I am firmly convinced|There is no doubt)\b/i.test(finalText) },
  { name: "Kalimat outlier pendek", test: /\b(That said|Not always|It depends|Honestly|No doubt)\b/i.test(finalText) },
  { name: "Paragraf tidak seimbang", test: finalText.split(/\n\s*\n/).length >= 2 },
  { name: "Typo/redundansi", test: /\b(decreased and diminished|reduced and limited|Westeren|hygeine)\b/i.test(finalText) || /thier|definately|seperate|occured|begining|goverment/.test(finalText) },
];

for (const check of checks) {
  console.log(`${check.test ? "✅" : "❌"} ${check.name}`);
}
