import { 
  destroyEssaySkeleton, 
  injectRelevantAnchors, 
  injectNaturalFragment,
  addNaturalHumanErrors,
  addNaturalRepetition 
} from './humanizer';

const testEssay = `The quality of life in cities is a major concern for many people. In my opinion, I believe that governments should take action to improve urban living conditions. Firstly, traffic congestion is a significant problem that affects daily commutes. Secondly, air pollution from vehicles causes health issues for residents. In conclusion, I think that both governments and individuals need to work together to solve these problems.`;

console.log('=== TEST 1: destroyEssaySkeleton ===');
console.log('INPUT:', testEssay);
console.log('\nOUTPUT:', destroyEssaySkeleton(testEssay));

console.log('\n\n=== TEST 2: injectRelevantAnchors (urban topic) ===');
const urbanText = 'Traffic congestion in cities has become worse over the years. Urban planning needs to address population density and transport issues.';
console.log('INPUT:', urbanText);
console.log('\nOUTPUT:', injectRelevantAnchors(urbanText));

console.log('\n\n=== TEST 3: injectRelevantAnchors (environment topic) ===');
const envText = 'Climate change is affecting our environment. Pollution and emissions need to be reduced through green policies.';
console.log('INPUT:', envText);
console.log('\nOUTPUT:', injectRelevantAnchors(envText));

console.log('\n\n=== TEST 4: injectNaturalFragment ===');
const multiParaText = `Individuals can make a difference in their daily lives. People should consider their impact on the environment.

Governments have a responsibility to create policies that encourage sustainable practices. Corporate organisations need to comply with regulations.

Citizens must also take action at the local level. Communities can organize initiatives to reduce waste.`;
console.log('INPUT:', multiParaText);
console.log('\nOUTPUT:', injectNaturalFragment(multiParaText));

console.log('\n\n=== TEST 5: addNaturalHumanErrors ===');
const cleanText = 'It is probably true that governments should act. However, I strongly feel that individuals must make the changes necessary. Without such system, progress will be slow.';
console.log('INPUT:', cleanText);
console.log('\nOUTPUT:', addNaturalHumanErrors(cleanText));

console.log('\n\n=== TEST 6: addNaturalRepetition ===');
const synonymText = 'Governments must act. Authorities have the power to implement policies. Policymakers should consider the needs of citizens. Individuals and people can also contribute. Residents in cities face many problems and challenges that require solutions and measures.';
console.log('INPUT:', synonymText);
console.log('\nOUTPUT:', addNaturalRepetition(synonymText));

console.log('\n\n=== ALL TESTS COMPLETED ===');
