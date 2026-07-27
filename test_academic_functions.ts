import {
  destroyFourParagraphStructure,
  destroyTemplateTransitions,
  injectSpecificAnchorsAcademic,
  injectOneSentenceParagraphs,
  addNaturalGrammarFlaws,
  destroyConclusionTemplate,
  naturalRepetition,
  splitSentences,
} from './humanizer';

// Test essay dengan 4 paragraf standar (AI-style)
const academicEssay = `Children learn and develop in many different ways. Some children prefer structured activities, while others learn better through play. This essay will discuss the importance of balancing both approaches.

Firstly, structured learning provides clear goals and measurable outcomes. Children who engage in formal education tend to perform better on standardized tests. Furthermore, they develop discipline and time management skills early.

Secondly, play-based learning fosters creativity and social skills. When children play, they learn to negotiate, share, and solve problems independently. Moreover, research shows that play reduces stress and improves mental health.

In conclusion, both approaches have merit. Therefore, parents and educators should find a balance that suits each child's individual needs.`;

console.log('=== ORIGINAL ACADEMIC ESSAY (4 PARAGRAPHS) ===\n');
console.log(academicEssay);
console.log('\n\n=== After destroyFourParagraphStructure ===\n');
let result = destroyFourParagraphStructure(academicEssay);
console.log(result);
console.log('\n\n=== After destroyTemplateTransitions ===\n');
result = destroyTemplateTransitions(result);
console.log(result);
console.log('\n\n=== After destroyConclusionTemplate ===\n');
result = destroyConclusionTemplate(result);
console.log(result);
console.log('\n\n=== After injectOneSentenceParagraphs ===\n');
result = injectOneSentenceParagraphs(result);
console.log(result);
console.log('\n\n=== After injectSpecificAnchorsAcademic ===\n');
result = injectSpecificAnchorsAcademic(result);
console.log(result);
console.log('\n\n=== After addNaturalGrammarFlaws ===\n');
result = addNaturalGrammarFlaws(result);
console.log(result);
console.log('\n\n=== After naturalRepetition ===\n');
result = naturalRepetition(result);
console.log(result);

// Count paragraphs
const paragraphs = result.split(/\n\s*\n/).filter(p => p.trim());
console.log(`\n\n=== FINAL PARAGRAPH COUNT: ${paragraphs.length} ===`);
