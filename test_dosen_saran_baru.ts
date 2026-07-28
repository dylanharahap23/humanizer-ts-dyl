import {
  addCommaSplice,
  addRepetition,
  addAwkwardPhrasing,
  addLongSentences,
  disperseOpinion,
  removeTemplateTransitions,
  finalHumanize
} from './humanizer';

console.log('=== TEST SARAN BARU DARI DOSEN ===\n');

// Test 1: removeTemplateTransitions
console.log('1. TEST REMOVE TEMPLATE TRANSITIONS');
const textWithTransitions = `On the one hand, economic growth is important. On the other hand, we must consider the environment. In addition, healthcare should be prioritized. Furthermore, education is crucial. In conclusion, we need balanced approach.`;
console.log('Input:', textWithTransitions);
console.log('Output:', removeTemplateTransitions(textWithTransitions));
console.log();

// Test 2: addCommaSplice
console.log('2. TEST ADD COMMA SPLICE');
const textForCommaSplice = `Economic development requires significant investment in infrastructure. The government must allocate sufficient budget for this purpose. Healthcare systems also need improvement to serve the population better.`;
console.log('Input:', textForCommaSplice);
console.log('Output:', addCommaSplice(textForCommaSplice));
console.log();

// Test 3: addRepetition
console.log('3. TEST ADD REPETITION');
const textForRepetition = `Health is essential for well-being. Good wellness leads to better quality of life. Without proper fitness, people struggle with daily activities. Health care systems must prioritize wellness programs.`;
console.log('Input:', textForRepetition);
console.log('Output:', addRepetition(textForRepetition));
console.log();

// Test 4: addAwkwardPhrasing
console.log('4. TEST ADD AWKWARD PHRASING');
const textForAwkward = `This can have consequences for the economy. We need to discuss this issue. The results are similar to previous studies.`;
console.log('Input:', textForAwkward);
console.log('Output:', addAwkwardPhrasing(textForAwkward));
console.log();

// Test 5: addLongSentences
console.log('5. TEST ADD LONG SENTENCES');
const textForLong = `The government has implemented various policies to stimulate economic growth. These policies include tax reductions and infrastructure investments. The results have been mixed so far. Some sectors show improvement while others struggle.`;
console.log('Input:', textForLong);
console.log('Output:', addLongSentences(textForLong));
console.log();

// Test 6: disperseOpinion
console.log('6. TEST DISPERSE OPINION');
const textForDisperse = `First paragraph discusses economic factors. Growth is important for development.\n\nI believe that healthcare is more important than economic growth. In my view, we should prioritize public health. I think money cannot buy happiness.\n\nThird paragraph talks about education system. Schools need better funding.`;
console.log('Input:', textForDisperse);
console.log('Output:', disperseOpinion(textForDisperse));
console.log();

// Test 7: Full pipeline dengan finalHumanize
console.log('7. TEST FULL PIPELINE - FINALHUMANIZE');
const fullText = `On the one hand, I partly agree that economic growth is essential because it provides financial resources for national development. For example, many developing countries have improved their infrastructure through economic expansion.\n\nOn the other hand, there are other factors that contribute to national success. Healthcare systems, education quality, and environmental protection are equally important. In addition, social welfare programs help reduce inequality.\n\nIn conclusion, while economic growth is important, it should not be the only priority for governments. A balanced approach considering all aspects of development is necessary.`;

console.log('Input:', fullText);
console.log('\n--- OUTPUT SETELAH HUMANIZE ---\n');
console.log(finalHumanize(fullText, 'ielts', false));
