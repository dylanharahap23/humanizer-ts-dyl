// ============================================================
// GPTZERO HARNESS - Test Pipeline Baru vs Lama
// ============================================================

import { finalHumanize, buildFewShotPrompt, removeRepeatedPhrases } from './humanizer';

const testSamples = [
  {
    name: "marriage",
    text: `Many people consider 24 years old to be a good age for a woman to get married. This is because by this age, most women have completed their education and have some work experience. They are also emotionally mature enough to handle the responsibilities of marriage. However, the ideal age for marriage varies from person to person and depends on individual circumstances.`
  },
  {
    name: "exercise",
    text: `Regular exercise is essential for maintaining good health. Cardiovascular exercises like running and swimming improve heart health. Strength training helps build muscle mass and increases metabolism. Flexibility exercises such as yoga improve range of motion and prevent injuries. A balanced exercise routine should include all three types.`
  },
  {
    name: "technology",
    text: `Artificial intelligence is transforming various industries. Machine learning algorithms can analyze large datasets quickly. Natural language processing enables computers to understand human language. Computer vision allows machines to interpret visual information. These technologies are being integrated into everyday applications.`
  },
  {
    name: "education",
    text: `Online learning has become increasingly popular in recent years. It offers flexibility for students who cannot attend traditional classes. Video lectures and interactive quizzes enhance the learning experience. However, online learning requires self-discipline and motivation. The quality of online courses varies significantly across platforms.`
  },
];

// Simulasi skor GPTZero (karena tidak ada API key real)
// Dalam implementasi nyata, ganti dengan panggilan API actual
function simulateGPTZeroScore(text: string): number {
  // Heuristik sederhana: teks yang lebih pendek dan kurang terstruktur = lebih human
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = text.split(/\s+/).length / sentences.length;
  const hasImperfections = /[Ii] don't|Anyway|Hmm|not sure|maybe/i.test(text);
  const hasRepeatedPhrases = /(I don't think so).*\1/.test(text);
  
  let score = 50; // Base score
  
  // Kurangi score jika kalimat terlalu seragam
  if (avgSentenceLength > 15 && avgSentenceLength < 25) score -= 10;
  
  // Kurangi score jika ada imperfections
  if (hasImperfections) score -= 20;
  
  // Tambah score jika ada repeated phrases (AI template)
  if (hasRepeatedPhrases) score += 30;
  
  // Variasi acak untuk simulasi
  score += Math.floor(Math.random() * 20 - 10);
  
  return Math.max(0, Math.min(100, score));
}

async function testPipeline() {
  console.log('='.repeat(80));
  console.log('GPTZERO HARNESS TEST - Memory Simulation + Few-Shot Approach');
  console.log('='.repeat(80));
  console.log();
  
  for (const sample of testSamples) {
    console.log(`📝 Sample: ${sample.name}`);
    console.log('-'.repeat(80));
    
    // 1. Proses dengan pipeline SEKARANG (dengan memory simulation + removeRepeatedPhrases)
    const currentOutput = finalHumanize(sample.text, 'english-general');
    
    // 2. Proses dengan pipeline TANPA post-processing regex (skipHeavyProcessing)
    const rawOutput = finalHumanize(sample.text, 'english-general', true);
    
    // 3. Test buildFewShotPrompt
    const fewShotConfig = buildFewShotPrompt(sample.text, 'english-general');
    
    // 4. Hitung skor simulasi
    const currentScore = simulateGPTZeroScore(currentOutput);
    const rawScore = simulateGPTZeroScore(rawOutput);
    
    console.log(`\n📊 RESULTS:`);
    console.log(`   Current Pipeline Score: ${currentScore}/100 (lower = more human)`);
    console.log(`   Raw Pipeline Score:     ${rawScore}/100 (lower = more human)`);
    console.log(`   Difference:             ${rawScore - currentScore > 0 ? '+' : ''}${rawScore - currentScore}`);
    
    console.log(`\n📝 OUTPUT SAMPLE (Current Pipeline):`);
    console.log(`   "${currentOutput.slice(0, 200)}..."`);
    
    console.log(`\n🔍 CHECKS:`);
    console.log(`   - Has idle sentences: ${/Anyway|Hmm|not sure/i.test(currentOutput) ? '✅' : '❌'}`);
    console.log(`   - Has external anchor: ${/(I read|My doctor|A friend|There was a study)/i.test(currentOutput) ? '✅' : '❌'}`);
    console.log(`   - Has hanging ending: ${/(I forgot|Anyway, that's|I'll stop|Not sure if)/i.test(currentOutput) ? '✅' : '❌'}`);
    console.log(`   - No repeated phrases: ${!/(I don't think so).*\1/.test(currentOutput) ? '✅' : '❌'}`);
    
    console.log(`\n📋 FEW-SHOT PROMPT PREVIEW:`);
    console.log(`   System prompt length: ${fewShotConfig.systemPrompt.length} chars`);
    console.log(`   Temperature: ${fewShotConfig.temperature}`);
    console.log(`   TopP: ${fewShotConfig.topP}`);
    
    console.log('\n' + '='.repeat(80));
    console.log();
  }
  
  console.log('✅ Harness test completed!');
  console.log();
  console.log('📌 NEXT STEPS:');
  console.log('   1. Replace simulateGPTZeroScore() with actual GPTZero API calls');
  console.log('   2. Add more test samples (5-10 total recommended)');
  console.log('   3. Run multiple iterations to get average scores');
  console.log('   4. Compare results before deploying to production');
}

// Jalankan test
testPipeline().catch(console.error);
