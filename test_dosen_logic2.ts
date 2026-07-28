import { 
  destroyEssaySkeleton, 
  injectRelevantAnchors, 
  injectNaturalFragment,
  addNaturalHumanErrors,
  addNaturalRepetition 
} from './humanizer';

// Test dengan essay yang lebih panjang (>= 8 kalimat)
const longEssay = `The quality of life in cities is a major concern for many people. In my opinion, I believe that governments should take action to improve urban living conditions. Firstly, traffic congestion is a significant problem that affects daily commutes. Secondly, air pollution from vehicles causes health issues for residents. Thirdly, housing costs have become unaffordable for many families. Fourthly, public transport systems are often inadequate. In addition, green spaces are disappearing rapidly. In conclusion, I think that both governments and individuals need to work together to solve these problems.`;

console.log('=== TEST 1: destroyEssaySkeleton (long essay >= 8 sentences) ===');
console.log('INPUT:', longEssay);
console.log('\nOUTPUT:', destroyEssaySkeleton(longEssay));

// Test dengan essay pendek (< 8 kalimat) - harusnya return original
const shortEssay = `The quality of life in cities is a concern. I believe governments should act. In conclusion, we must work together.`;

console.log('\n\n=== TEST 2: destroyEssaySkeleton (short essay < 8 sentences) ===');
console.log('INPUT:', shortEssay);
console.log('\nOUTPUT:', destroyEssaySkeleton(shortEssay));

// Test injectRelevantAnchors dengan cukup kalimat
const anchorText = `Traffic congestion in cities has become worse over the years. Urban planning needs to address population density. Transport infrastructure requires investment. Housing costs continue to rise. Metropolitan areas face unique challenges.`;

console.log('\n\n=== TEST 3: injectRelevantAnchors (urban topic, >= 5 sentences) ===');
console.log('INPUT:', anchorText);
console.log('\nOUTPUT:', injectRelevantAnchors(anchorText));

// Test injectNaturalFragment dengan 3+ paragraf
const fragmentText = `Individuals can make a difference in their daily lives. People should consider their impact on the environment.

Governments have a responsibility to create policies that encourage sustainable practices. Citizens must comply with regulations.

Communities can organize initiatives to reduce waste. Local action is important.`;

console.log('\n\n=== TEST 4: injectNaturalFragment (3 paragraphs) ===');
console.log('INPUT:', fragmentText);
console.log('\nOUTPUT:', injectNaturalFragment(fragmentText));

// Test addNaturalRepetition dengan banyak sinonim
const repetitionText = `Governments must act. Authorities have the power to implement policies. Policymakers should consider the needs of citizens. Officials at all levels must respond. Individuals and people can also contribute. Residents in cities face many problems and issues. These challenges and concerns require solutions and measures and actions.`;

console.log('\n\n=== TEST 5: addNaturalRepetition (banyak sinonim) ===');
console.log('INPUT:', repetitionText);
console.log('\nOUTPUT:', addNaturalRepetition(repetitionText));

console.log('\n\n=== ALL TESTS COMPLETED ===');
