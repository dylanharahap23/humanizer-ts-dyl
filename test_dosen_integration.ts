import { 
  destroyIeltsTemplate, 
  concretizeExamplesWithData, 
  makeConclusionBold, 
  addNaturalImperfection, 
  enforceExtremeVariation, 
  removeIncoherentSentences,
  finalHumanize
} from './humanizer';

// Test text yang meniru struktur IELTS AI template
const testText = `On the one hand, reading is important for children. For example, LEGO and building blocks can help them learn. On the other hand, outdoor games are also valuable. I partly agree that both approaches have merit. In conclusion, the best way is to balance both approaches so children can reach their full potential.`;

console.log('=== ORIGINAL TEXT ===');
console.log(testText);
console.log('\n');

console.log('=== AFTER destroyIeltsTemplate ===');
let result = destroyIeltsTemplate(testText);
console.log(result);
console.log('\n');

console.log('=== AFTER concretizeExamplesWithData ===');
result = concretizeExamplesWithData(result);
console.log(result);
console.log('\n');

console.log('=== AFTER makeConclusionBold ===');
result = makeConclusionBold(result);
console.log(result);
console.log('\n');

console.log('=== AFTER addNaturalImperfection ===');
result = addNaturalImperfection(result);
console.log(result);
console.log('\n');

console.log('=== AFTER enforceExtremeVariation ===');
result = enforceExtremeVariation(result);
console.log(result);
console.log('\n');

console.log('=== AFTER removeIncoherentSentences ===');
result = removeIncoherentSentences(result);
console.log(result);
console.log('\n');

console.log('=== FULL PIPELINE VIA finalHumanize ===');
const fullResult = finalHumanize(testText, 'casual', false);
console.log(fullResult);
