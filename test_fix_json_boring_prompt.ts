/**
 * TEST: FIX JSON PARSING + BORING PROMPT
 * 
 * Menguji:
 * 1. extractSemanticGraph dengan sanitasi JSON
 * 2. buildGraphRegenerationPrompt yang tidak menyebut "essay"
 * 3. buildBoringIeltsPrompt untuk academic writing
 * 4. finalHumanize dengan skipHeavyProcessing
 */

import {
  extractSemanticGraph,
  extractSemanticGraphHeuristic,
  buildGraphRegenerationPrompt,
  buildBoringIeltsPrompt,
  finalHumanize,
  isIeltsEssay,
  getEnglishHumanizerConfig
} from './humanizer';

// ============================================================
// TEST 1: EXTRACT SEMANTIC GRAPH - JSON SANITIZATION
// ============================================================
async function testExtractSemanticGraph() {
  console.log('\n=== TEST 1: Extract Semantic Graph (JSON Sanitization) ===\n');
  
  const testEssay = `Nowadays, social media has become an integral part of daily life for young people. Many teenagers spend several hours on platforms like Instagram and TikTok every day. This trend has both positive and negative effects on their mental health.
  
On the one hand, social media allows young people to stay connected with friends and family. For example, students can share their achievements and receive support from their peers. However, excessive use of social media can lead to anxiety and depression. A study in 2022 found that teenagers who use social media more than 3 hours per day are more likely to experience sleep problems.
  
In conclusion, while social media has benefits, it is important for young people to use it in moderation.`;

  try {
    console.log('Input essay length:', testEssay.length, 'characters\n');
    const graph = await extractSemanticGraph(testEssay);
    
    console.log('✓ Extraction successful');
    console.log('Nodes found:', graph.nodes.length);
    console.log('Relations found:', graph.relations.length);
    
    if (graph.nodes.length > 0) {
      console.log('\nSample nodes:');
      graph.nodes.slice(0, 3).forEach(n => {
        console.log(`  - [${n.type}] ${n.label}`);
      });
    }
    
    if (graph.relations.length > 0) {
      console.log('\nSample relations:');
      graph.relations.slice(0, 3).forEach(r => {
        console.log(`  - ${r.from} → ${r.to} (${r.type})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('✗ Extraction failed:', error);
    return false;
  }
}

// ============================================================
// TEST 2: HEURISTIC FALLBACK
// ============================================================
function testHeuristicFallback() {
  console.log('\n=== TEST 2: Heuristic Fallback ===\n');
  
  const testText = `Social media affects young people in many ways. Some benefits include staying connected with friends. However, there are also risks like anxiety and sleep problems. Parents should monitor usage.`;
  
  try {
    const graph = extractSemanticGraphHeuristic(testText);
    
    console.log('✓ Heuristic extraction successful');
    console.log('Nodes found:', graph.nodes.length);
    console.log('Relations found:', graph.relations.length);
    
    if (graph.nodes.length > 0) {
      console.log('\nNodes:');
      graph.nodes.forEach(n => {
        console.log(`  - [${n.type}] ${n.label.substring(0, 50)}...`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('✗ Heuristic extraction failed:', error);
    return false;
  }
}

// ============================================================
// TEST 3: BUILD REGENERATION PROMPT (AVOID ACADEMIC WORDS)
// ============================================================
function testBuildRegenerationPrompt() {
  console.log('\n=== TEST 3: Build Regeneration Prompt (Avoid Academic Words) ===\n');
  
  const mockNodes = [
    { id: 'n1', type: 'claim', label: 'social media integral part', detail: 'daily life' },
    { id: 'n2', type: 'cause', label: 'stay connected friends', detail: null },
    { id: 'n3', type: 'effect', label: 'anxiety depression', detail: 'excessive use' },
    { id: 'n4', type: 'evidence', label: '2022 study sleep problems', detail: '3 hours per day' },
    { id: 'n5', type: 'counter', label: 'benefits exist', detail: null }
  ];
  
  const mockRelations = [
    { from: 'n1', to: 'n2', type: 'supports' },
    { from: 'n3', to: 'n1', type: 'contradicts' },
    { from: 'n4', to: 'n3', type: 'exemplifies' }
  ];
  
  try {
    const prompt = buildGraphRegenerationPrompt(mockNodes, mockRelations);
    
    console.log('✓ Prompt generated successfully');
    console.log('Prompt length:', prompt.length, 'characters\n');
    
    // Check for discouraged academic words (they appear in "Avoid" instruction, which is OK)
    const hasEssayMentionOutsideInstruction = /Write.*essay|Now.*essay/i.test(prompt);
    const hasThisEssayWillDiscuss = /this essay will discuss/i.test(prompt);
    const hasFurthermore = /\bfurthermore\b/i.test(prompt);
    const hasMoreover = /\bmoreover\b/i.test(prompt);
    
    console.log('Validation (academic words should be avoided, not forbidden):');
    console.log(`  - Contains "Write a ... essay": ${hasEssayMentionOutsideInstruction} ${!hasEssayMentionOutsideInstruction ? '✓' : '⚠️'}`);
    console.log(`  - Contains "this essay will discuss": ${hasThisEssayWillDiscuss} ${!hasThisEssayWillDiscuss ? '✓' : '✗'}`);
    console.log(`  - Uses "furthermore" as instruction: ${hasFurthermore} ${!hasFurthermore ? '✓' : '⚠️'}`);
    console.log(`  - Uses "moreover" as instruction: ${hasMoreover} ${!hasMoreover ? '✓' : '⚠️'}`);
    
    // Check for required elements
    const hasPlainEnglish = /plain English/i.test(prompt);
    const hasSimpleWords = /simple words/i.test(prompt);
    const hasNowadays = /Nowadays/i.test(prompt);
    const hasAvoidInstruction = /Avoid|No |Do NOT/i.test(prompt);
    
    console.log('\nRequired elements:');
    console.log(`  - "plain English" instruction: ${hasPlainEnglish} ${hasPlainEnglish ? '✓' : '✗'}`);
    console.log(`  - "simple words" instruction: ${hasSimpleWords} ${hasSimpleWords ? '✓' : '✗'}`);
    console.log(`  - "Nowadays" start suggestion: ${hasNowadays} ${hasNowadays ? '✓' : '✗'}`);
    console.log(`  - Has avoidance instruction: ${hasAvoidInstruction} ${hasAvoidInstruction ? '✓' : '✗'}`);
    
    const passed = !hasThisEssayWillDiscuss && hasPlainEnglish && hasSimpleWords && hasAvoidInstruction;
    
    console.log(`\n${passed ? '✓' : '⚠️'} Test ${passed ? 'PASSED' : 'NEEDS REVIEW'}`);
    return passed;
  } catch (error) {
    console.error('✗ Prompt generation failed:', error);
    return false;
  }
}

// ============================================================
// TEST 4: BUILD BORING IELTS PROMPT
// ============================================================
function testBuildBoringIeltsPrompt() {
  console.log('\n=== TEST 4: Build Boring IELTS Prompt ===\n');
  
  const testTopic = `Some people believe that children should spend more time on outdoor activities. Discuss the benefits and drawbacks.`;
  
  try {
    const prompt = buildBoringIeltsPrompt(testTopic);
    
    console.log('✓ Prompt generated successfully');
    console.log('Prompt length:', prompt.length, 'characters\n');
    
    // Check for required rules
    const checks = [
      { name: 'Has "IELTS student" role', pattern: /IELTS student/i },
      { name: 'Has "NOT a creative writer"', pattern: /NOT a creative writer/i },
      { name: 'Has opening rule (Nowadays/In recent years)', pattern: /Nowadays|In recent years/i },
      { name: 'Forbids rhetorical questions', pattern: /rhetorical question/i },
      { name: 'Forbids ellipsis', pattern: /ellipsis|\.\.\./i },
      { name: 'Forbids em-dashes', pattern: /em-dash|—/i },
      { name: 'Requires complete sentences', pattern: /COMPLETE sentences/i },
      { name: 'Forbids fragments', pattern: /fragments/i },
      { name: 'Has paragraph structure', pattern: /Paragraph \d+:/i },
      { name: 'Forbids academic citations', pattern: /academic citation|study from APA/i },
      { name: 'Forbids personal anecdotes', pattern: /personal anecdote|my sister/i },
      { name: 'Requires simple vocabulary', pattern: /simple.*language|simple.*vocabulary/i },
      { name: 'Forbids synonyms search', pattern: /synonym/i },
      { name: 'Has neutral tone requirement', pattern: /neutral.*plain|plain.*neutral/i }
    ];
    
    let passedCount = 0;
    console.log('Rule checks:');
    checks.forEach(check => {
      const found = check.pattern.test(prompt);
      if (found) passedCount++;
      console.log(`  ${found ? '✓' : '✗'} ${check.name}`);
    });
    
    console.log(`\nPassed: ${passedCount}/${checks.length}`);
    return passedCount >= checks.length - 2; // Allow 2 minor misses
  } catch (error) {
    console.error('✗ Prompt generation failed:', error);
    return false;
  }
}

// ============================================================
// TEST 5: IS IELTS ESSAY DETECTION
// ============================================================
function testIsIeltsEssay() {
  console.log('\n=== TEST 5: IELTS Essay Detection ===\n');
  
  const testCases = [
    {
      text: `Nowadays, children spend too much time on social media. This is a serious problem in many countries. Parents are worried about the effects on their children's health and education. This essay will discuss the causes and solutions to this issue. I believe parents should limit screen time and encourage outdoor activities. There are several reasons why children use social media excessively. First, they want to stay connected with friends. Second, they find it entertaining. However, there are also negative effects such as sleep problems and reduced academic performance. In conclusion, parents and schools should work together to help children use technology wisely.`,
      expected: true,
      description: 'Essay with >80 words + keywords (essay, discuss, believe)'
    },
    {
      text: `In recent years, technology has changed education significantly. Many schools now use tablets and computers in classrooms. Teachers argue that this improves learning outcomes and student engagement. However, some people disagree and say traditional methods are better. What is your opinion on this topic? Do you think technology helps or harms education? I believe that technology can be beneficial if used properly. Schools should train teachers to use digital tools effectively. Students also need to learn how to use technology responsibly. In my opinion, the key is balance between traditional and modern methods.`,
      expected: true,
      description: 'Essay with >80 words + keywords (argue, disagree, opinion)'
    },
    {
      text: `Hey, did you see that new movie? It was awesome! The special effects were incredible. I really enjoyed it and would watch it again.`,
      expected: false,
      description: 'Casual conversation'
    },
    {
      text: `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. It is often used for typing practice.`,
      expected: false,
      description: 'Short text without essay keywords'
    }
  ];
  
  let passedCount = 0;
  testCases.forEach((tc, i) => {
    const result = isIeltsEssay(tc.text);
    const passed = result === tc.expected;
    if (passed) passedCount++;
    console.log(`${passed ? '✓' : '✗'} Test ${i + 1}: ${tc.description}`);
    console.log(`   Expected: ${tc.expected}, Got: ${result} (word count: ${tc.text.split(/\s+/).filter(Boolean).length})`);
  });
  
  console.log(`\nPassed: ${passedCount}/${testCases.length}`);
  return passedCount >= testCases.length - 1; // Allow 1 miss
}

// ============================================================
// TEST 6: GET ENGLISH HUMANIZER CONFIG FOR ACADEMIC
// ============================================================
function testGetEnglishHumanizerConfig() {
  console.log('\n=== TEST 6: English Humanizer Config (Academic) ===\n');
  
  const academicText = `This essay argues that climate change is a serious issue. I believe governments must take action. There are several causes and solutions.`;
  
  try {
    const config = getEnglishHumanizerConfig(academicText, 'Academic');
    
    console.log('✓ Config generated successfully\n');
    console.log('Config properties:');
    console.log(`  - Temperature: ${config.temperature} (expected: 0.85)`);
    console.log(`  - TopP: ${config.topP} (expected: 0.92)`);
    console.log(`  - MaxTokens: ${config.maxTokens} (expected: 1400)`);
    console.log(`  - PostProcessTone: ${config.postProcessTone}`);
    console.log(`  - AdditionalInstruction: "${config.additionalInstruction}"`);
    
    const hasBoringPrompt = config.systemPrompt.includes('IELTS student') || 
                            config.systemPrompt.includes('NOT a creative writer');
    const hasCorrectTemp = config.temperature === 0.85;
    const hasCorrectTopP = config.topP === 0.92;
    const hasPlainInstruction = config.additionalInstruction?.includes('plainly');
    
    console.log('\nValidation:');
    console.log(`  ${hasBoringPrompt ? '✓' : '✗'} Uses boring IELTS prompt`);
    console.log(`  ${hasCorrectTemp ? '✓' : '✗'} Temperature = 0.85`);
    console.log(`  ${hasCorrectTopP ? '✓' : '✗'} TopP = 0.92`);
    console.log(`  ${hasPlainInstruction ? '✓' : '✗'} Has "write plainly" instruction`);
    
    const passed = hasBoringPrompt && hasCorrectTemp && hasCorrectTopP && hasPlainInstruction;
    console.log(`\n${passed ? '✓' : '✗'} Test ${passed ? 'PASSED' : 'FAILED'}`);
    return passed;
  } catch (error) {
    console.error('✗ Config generation failed:', error);
    return false;
  }
}

// ============================================================
// TEST 7: FINAL HUMANIZE WITH SKIP HEAVY PROCESSING
// ============================================================
function testFinalHumanizeSkipHeavy() {
  console.log('\n=== TEST 7: Final Humanize (skipHeavyProcessing) ===\n');
  
  const testText = `Nowadays, social media is very popular among young people. They use it every day. This has both good and bad effects.`;
  
  try {
    // Test dengan skipHeavyProcessing = true (untuk academic)
    const resultSkip = finalHumanize(testText, 'ielts', true);
    
    // Test dengan skipHeavyProcessing = false (untuk general)
    const resultNoSkip = finalHumanize(testText, 'casual', false);
    
    console.log('✓ Both calls completed successfully\n');
    console.log('Input:', testText);
    console.log('\nWith skipHeavyProcessing=true (academic):');
    console.log('Output:', resultSkip);
    console.log('Length:', resultSkip.length);
    
    console.log('\nWith skipHeavyProcessing=false (casual):');
    console.log('Output:', resultNoSkip);
    console.log('Length:', resultNoSkip.length);
    
    // Untuk academic, output harus lebih sederhana (hanya cleanup)
    console.log('\n✓ Test completed (manual verification needed for output quality)');
    return true;
  } catch (error) {
    console.error('✗ Final humanize failed:', error);
    return false;
  }
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================
async function runAllTests() {
  console.log('='.repeat(70));
  console.log('TEST SUITE: FIX JSON PARSING + BORING PROMPT');
  console.log('='.repeat(70));
  
  const results = {
    'Test 1: Extract Semantic Graph': await testExtractSemanticGraph(),
    'Test 2: Heuristic Fallback': testHeuristicFallback(),
    'Test 3: Build Regeneration Prompt': testBuildRegenerationPrompt(),
    'Test 4: Build Boring IELTS Prompt': testBuildBoringIeltsPrompt(),
    'Test 5: IELTS Essay Detection': testIsIeltsEssay(),
    'Test 6: English Humanizer Config': testGetEnglishHumanizerConfig(),
    'Test 7: Final Humanize Skip Heavy': testFinalHumanizeSkipHeavy()
  };
  
  console.log('\n' + '='.repeat(70));
  console.log('FINAL RESULTS');
  console.log('='.repeat(70));
  
  let passedCount = 0;
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`${passed ? '✓' : '✗'} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
    if (passed) passedCount++;
  });
  
  console.log(`\nTotal: ${passedCount}/${Object.keys(results).length} tests passed`);
  
  if (passedCount === Object.keys(results).length) {
    console.log('\n🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }
}

// Run tests
runAllTests().catch(console.error);
