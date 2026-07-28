import { 
  finalHumanize, 
  strengthenStance, 
  injectSpecificProperNouns, 
  addNaturalGrammarErrors, 
  allowNaturalRepetition 
} from './humanizer';

const testText = `On the one hand, television has many benefits for children. For example, educational programs can help them learn new vocabulary. On the other hand, too much screen time is harmful. I partly agree that parents should limit viewing. In conclusion, moderation is key to ensuring children benefit from television without negative effects.`;

console.log('=== ORIGINAL TEXT ===');
console.log(testText);
console.log('\n');

console.log('=== AFTER finalHumanize (SIMPLE PIPELINE) ===');
const result = finalHumanize(testText, 'casual', false);
console.log(result);
console.log('\n');

// Cek apakah ada proper nouns
const hasProperNouns = /\b(IBM|China|Italy|Finland|Japan|Germany|Poland|Vietnam|Amazon|WHO|UK|India|California|EU|London|Milan|SUN|Westminster|Boris Johnson|Donald Trump|Cambridge University|OECD|PISA)\b/i.test(result);
console.log('Has proper nouns:', hasProperNouns);

// Cek apakah ada comma splice
const hasCommaSplice = /,\s+[a-z]/.test(result);
console.log('Has comma splice:', hasCommaSplice);

// Cek repetisi kata kunci
const words = result.toLowerCase().match(/[a-z]{4,}/g) || [];
const freq: Record<string, number> = {};
for (const w of words) {
  if (!['that', 'this', 'these', 'those', 'with', 'from', 'have', 'were'].includes(w)) {
    freq[w] = (freq[w] || 0) + 1;
  }
}
const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log('Top repeated words:', topWords);
