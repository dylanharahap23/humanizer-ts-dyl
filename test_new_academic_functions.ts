import {
  forceMultiParagraph,
  forceExtremeBurstinessAcademic,
  destroyPerfectLists,
  destroyInspirationalClosers,
  injectFragmentParagraphs,
  injectHumanNoiseAcademic,
  addAwkwardPhrasing,
} from './humanizer';

const testText = `Children learn and develop in many different ways. Some children prefer structured activities, while others learn better through play. This essay will discuss the importance of balancing both approaches. Firstly, structured learning provides clear goals and measurable outcomes. Children who engage in formal education tend to perform better on standardized tests. Furthermore, they develop discipline and time management skills early. Secondly, play-based learning fosters creativity and social skills. When children play, they learn to negotiate, share, and solve problems independently. Moreover, research shows that play reduces stress and improves mental health. In conclusion, both approaches have merit. Therefore, parents and educators should find a balance that suits each child's individual needs. They're part of the solution.`;

console.log('=== ORIGINAL TEXT ===\n');
console.log(testText);
console.log('\n\n=== After forceMultiParagraph ===\n');
let result = forceMultiParagraph(testText);
console.log(result);

console.log('\n\n=== After forceExtremeBurstinessAcademic ===\n');
result = forceExtremeBurstinessAcademic(result);
console.log(result);

console.log('\n\n=== After destroyPerfectLists ===\n');
result = destroyPerfectLists(result);
console.log(result);

console.log('\n\n=== After destroyInspirationalClosers ===\n');
result = destroyInspirationalClosers(result);
console.log(result);

console.log('\n\n=== After injectFragmentParagraphs ===\n');
result = injectFragmentParagraphs(result);
console.log(result);

console.log('\n\n=== After injectHumanNoiseAcademic ===\n');
result = injectHumanNoiseAcademic(result);
console.log(result);

console.log('\n\n=== After addAwkwardPhrasing ===\n');
result = addAwkwardPhrasing(result);
console.log(result);
