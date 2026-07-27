import { 
  destroyRestatingOpening, 
  destroyThesisTemplateImproved, 
  destroyFormulaicTransitions, 
  fixSynonymOverload, 
  injectBurstiness, 
  addNaturalGrammarErrors, 
  strengthenPersonalVoice, 
  destroyParallelLists 
} from './humanizer';

// Test case: AI-generated essay about unemployment benefits
const aiEssay = `Many nations offer unemployment benefits to support citizens who have lost their jobs. While some argue that this system is essential for social stability, others believe that it creates dependency. I partly agree with this statement because financial assistance helps people survive, but excessive payments may discourage work.

On the one hand, government aid provides crucial support during difficult times. Individuals receive financial support to cover basic needs such as food, rent, and utilities. Furthermore, these payments help maintain economic stability in communities.

On the other hand, critics argue that welfare creates a culture of dependency. People may become reliant on benefits instead of seeking employment. Moreover, long-term recipients often lose motivation to rejoin the workforce.

In conclusion, unemployment benefits are necessary but should be carefully managed to balance support and incentive.`;

console.log('=== ORIGINAL AI ESSAY ===');
console.log(aiEssay);
console.log('\n\n');

let result = aiEssay;

result = destroyRestatingOpening(result);
console.log('=== After destroyRestatingOpening ===');
console.log(result);
console.log('\n\n');

result = destroyThesisTemplateImproved(result);
console.log('=== After destroyThesisTemplateImproved ===');
console.log(result);
console.log('\n\n');

result = destroyFormulaicTransitions(result);
console.log('=== After destroyFormulaicTransitions ===');
console.log(result);
console.log('\n\n');

result = fixSynonymOverload(result);
console.log('=== After fixSynonymOverload ===');
console.log(result);
console.log('\n\n');

result = injectBurstiness(result);
console.log('=== After injectBurstiness ===');
console.log(result);
console.log('\n\n');

result = addNaturalGrammarErrors(result);
console.log('=== After addNaturalGrammarErrors ===');
console.log(result);
console.log('\n\n');

result = strengthenPersonalVoice(result);
console.log('=== After strengthenPersonalVoice ===');
console.log(result);
console.log('\n\n');

result = destroyParallelLists(result);
console.log('=== After destroyParallelLists ===');
console.log(result);
console.log('\n\n');

console.log('=== FINAL RESULT ===');
console.log(result);
