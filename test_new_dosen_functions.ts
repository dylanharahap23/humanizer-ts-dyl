import { 
  destroyIeltsTemplate, 
  strengthenOpinion, 
  concretizeExamples, 
  addNaturalImperfection, 
  ensureBurstiness,
  finalHumanize 
} from './humanizer';

console.log("=== TESTING NEW DOSEN FUNCTIONS ===\n");

// Test text: IELTS-style essay about teenage vs adulthood happiness
const testText = `Many people believe that their happiest years were during their teenage years. Others, however, think that happiness comes during adult life despite the responsibilities. In this essay, I will discuss both views and give my opinion.

On the one hand, teenagers have more free time and fewer responsibilities. They can spend time with friends and enjoy leisure activities without worrying about bills or work. For example, students can hang out after school and participate in various hobbies.

On the other hand, adults have financial independence and can afford to travel and enjoy luxuries. They have the freedom to make their own decisions and pursue their dreams. For instance, a professional can take a vacation to Europe or buy a new car.

In conclusion, while both stages of life have their merits, I believe that adulthood offers more substantial happiness due to financial stability and personal growth.`;

console.log("=== ORIGINAL TEXT ===");
console.log(testText);
console.log("\n");

console.log("=== TEST 1: destroyIeltsTemplate ===");
let result = destroyIeltsTemplate(testText);
console.log(result);
console.log("\n");

console.log("=== TEST 2: strengthenOpinion ===");
result = strengthenOpinion(result);
console.log(result);
console.log("\n");

console.log("=== TEST 3: concretizeExamples ===");
result = concretizeExamples(result);
console.log(result);
console.log("\n");

console.log("=== TEST 4: addNaturalImperfection ===");
result = addNaturalImperfection(result);
console.log(result);
console.log("\n");

console.log("=== TEST 5: ensureBurstiness ===");
result = ensureBurstiness(result);
console.log(result);
console.log("\n");

console.log("=== TEST 6: finalHumanize (full pipeline) ===");
result = finalHumanize(testText, 'ielts', false);
console.log(result);
console.log("\n");

console.log("=== ALL TESTS COMPLETED ===");
