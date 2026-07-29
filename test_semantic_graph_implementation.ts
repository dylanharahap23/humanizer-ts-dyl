/**
 * Test untuk Semantic Graph Implementation (Dosen's Solution)
 * 
 * Menguji:
 * 1. extractSemanticGraph - ekstraksi konsep dari teks
 * 2. buildGraphRegenerationPrompt - pembuatan prompt dari graph
 * 3. regenerateFromGraph - pipeline lengkap
 */

import {
  extractSemanticGraph,
  extractSemanticGraphHeuristic,
  buildGraphRegenerationPrompt,
  regenerateFromGraph,
  getAuthorProfile
} from './humanizer';

const SAMPLE_ESSAY = `
The debate about whether athletes should be allowed to use performance-enhancing drugs is highly controversial. In my opinion, doping should be strictly prohibited in all sports because it undermines fair competition and poses serious health risks.

Firstly, allowing drugs in sport would create an uneven playing field. Athletes who choose to compete naturally would be at a significant disadvantage compared to those who use performance-enhancing substances. For example, in the Tour de France cycling race, Lance Armstrong was stripped of his seven titles after admitting to using banned substances. This shows how doping can destroy the integrity of competition.

Secondly, performance-enhancing drugs pose serious health risks to athletes. Steroids can cause liver damage, heart problems, and psychological issues. Many athletes have suffered long-term consequences from drug use. The case of East German swimmers in the 1970s and 1980s demonstrated the devastating health effects of state-sponsored doping programs.

However, some argue that allowing controlled use of certain substances could level the playing field. They suggest that all athletes would have access to the same enhancements. But this argument ignores the fundamental purpose of sport, which is to celebrate natural human achievement.

In conclusion, banning performance-enhancing drugs is essential for maintaining fair competition and protecting athlete health. Sports organizations must continue to invest in testing and enforcement to preserve the integrity of athletic competition.
`;

async function testExtractSemanticGraph() {
  console.log('=== TEST 1: extractSemanticGraph ===\n');
  
  try {
    const graph = await extractSemanticGraph(SAMPLE_ESSAY);
    
    console.log('Nodes extracted:', graph.nodes.length);
    console.log('Relations extracted:', graph.relations.length);
    console.log('\nSample nodes:');
    graph.nodes.slice(0, 5).forEach(node => {
      console.log(`  - ${node.id}: [${node.type}] ${node.label}`);
      if (node.detail) {
        console.log(`    Detail: ${node.detail.substring(0, 80)}...`);
      }
    });
    
    console.log('\nRelations:');
    graph.relations.slice(0, 5).forEach(rel => {
      console.log(`  - ${rel.from} → ${rel.to} (${rel.type})`);
    });
    
    return graph.nodes.length > 0;
  } catch (error) {
    console.error('Error in extractSemanticGraph:', error);
    return false;
  }
}

function testExtractSemanticGraphHeuristic() {
  console.log('\n=== TEST 2: extractSemanticGraphHeuristic ===\n');
  
  try {
    const graph = extractSemanticGraphHeuristic(SAMPLE_ESSAY);
    
    console.log('Nodes extracted (heuristic):', graph.nodes.length);
    console.log('Relations extracted (heuristic):', graph.relations.length);
    console.log('\nSample nodes:');
    graph.nodes.slice(0, 5).forEach(node => {
      console.log(`  - ${node.id}: [${node.type}] ${node.label}`);
      if (node.detail) {
        console.log(`    Detail: ${node.detail.substring(0, 80)}...`);
      }
    });
    
    return graph.nodes.length > 0;
  } catch (error) {
    console.error('Error in extractSemanticGraphHeuristic:', error);
    return false;
  }
}

function testBuildGraphRegenerationPrompt() {
  console.log('\n=== TEST 3: buildGraphRegenerationPrompt ===\n');
  
  const nodes = [
    { id: 'n0', type: 'claim' as const, label: 'doping should be prohibited', detail: 'undermines fair competition and health risks' },
    { id: 'n1', type: 'evidence' as const, label: 'Lance Armstrong', detail: 'stripped of seven Tour de France titles' },
    { id: 'n2', type: 'cause' as const, label: 'health risks from steroids', detail: 'liver damage, heart problems' },
    { id: 'n3', type: 'counter' as const, label: 'controlled use argument', detail: 'some argue it could level playing field' },
    { id: 'n4', type: 'evidence' as const, label: 'East German swimmers', detail: '1970s-1980s state-sponsored doping' }
  ];
  
  const relations = [
    { from: 'n0', to: 'n1', type: 'exemplifies' as const },
    { from: 'n0', to: 'n2', type: 'supports' as const },
    { from: 'n3', to: 'n0', type: 'contradicts' as const },
    { from: 'n2', to: 'n4', type: 'exemplifies' as const }
  ];
  
  const prompt = buildGraphRegenerationPrompt(nodes, relations);
  
  console.log('Generated prompt length:', prompt.length, 'characters');
  console.log('\nPrompt preview (first 500 chars):');
  console.log(prompt.substring(0, 500));
  
  // Check for critical rules
  const hasCriticalRules = prompt.includes('CRITICAL RULES');
  const hasNoTemplateWarning = prompt.includes('DO NOT follow a rigid structure');
  const hasStartAnywhere = prompt.includes('Start ANYWHERE');
  const hasProperNameInstruction = prompt.includes('proper name, year, or organization');
  
  console.log('\nPrompt validation:');
  console.log('  ✓ Has CRITICAL RULES:', hasCriticalRules);
  console.log('  ✓ Warns against template:', hasNoTemplateWarning);
  console.log('  ✓ Allows starting anywhere:', hasStartAnywhere);
  console.log('  ✓ Requests proper names:', hasProperNameInstruction);
  
  return hasCriticalRules && hasNoTemplateWarning && hasStartAnywhere;
}

async function testRegenerateFromGraph() {
  console.log('\n=== TEST 4: regenerateFromGraph (full pipeline) ===\n');
  
  try {
    // Test dengan profile berbeda
    const profiles: Array<'ielts_band7' | 'first_year_student' | 'newspaper_editor'> = [
      'ielts_band7',
      'first_year_student',
      'newspaper_editor'
    ];
    
    for (const profile of profiles) {
      console.log(`Testing with profile: ${profile}`);
      const prompt = await regenerateFromGraph(SAMPLE_ESSAY, profile);
      
      console.log(`  Prompt length: ${prompt.length} chars`);
      console.log(`  Contains profile instruction: ${prompt.includes(profile.replace('_', ' '))}`);
      
      // Cek bahwa prompt tidak menggunakan template lama
      const usesOldTemplate = prompt.includes('Main claim:') || prompt.includes('Supporting reasons:');
      console.log(`  Uses OLD template (bad): ${usesOldTemplate}`);
      
      // Cek bahwa prompt menggunakan format baru
      const usesNewFormat = prompt.includes('Ideas (nodes):') && prompt.includes('Relationships:');
      console.log(`  Uses NEW format (good): ${usesNewFormat}`);
      
      console.log('');
    }
    
    return true;
  } catch (error) {
    console.error('Error in regenerateFromGraph:', error);
    return false;
  }
}

function testGetAuthorProfile() {
  console.log('=== TEST 5: getAuthorProfile ===\n');
  
  const profiles = ['ielts_band7', 'first_year_student', 'newspaper_editor'];
  
  profiles.forEach(profile => {
    const instruction = getAuthorProfile(profile);
    console.log(`Profile: ${profile}`);
    console.log(`  Length: ${instruction.length} chars`);
    console.log(`  Contains "You are": ${instruction.includes('You are')}`);
    console.log('');
  });
  
  return true;
}

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  SEMANTIC GRAPH IMPLEMENTATION TEST (DOSEN SOLUTION)    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const results = {
    test1: await testExtractSemanticGraph(),
    test2: testExtractSemanticGraphHeuristic(),
    test3: testBuildGraphRegenerationPrompt(),
    test4: await testRegenerateFromGraph(),
    test5: testGetAuthorProfile()
  };
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  TEST SUMMARY                                           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  Object.entries(results).forEach(([name, passed]) => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}: ${name}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\nOverall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}\n`);
  
  return allPassed;
}

// Run tests
runAllTests().catch(console.error);
