import { buildArchitecturePrompt, getTopicExamples, getEnglishHumanizerConfig, finalHumanize } from './humanizer';

console.log('=== TEST: ARSITEKTUR DOSEN INTEGRATION ===\n');

// Test 1: getTopicExamples
console.log('1. Testing getTopicExamples():');
const economyText = "Economic growth is important for creating jobs and raising living standards.";
const educationText = "Education systems should focus on developing critical thinking skills in students.";
const housingText = "Housing prices have increased significantly in major cities around the world.";

console.log('Economy topic:', getTopicExamples(economyText));
console.log('Education topic:', getTopicExamples(educationText));
console.log('Housing topic:', getTopicExamples(housingText));
console.log('');

// Test 2: buildArchitecturePrompt
console.log('2. Testing buildArchitecturePrompt():');
const architecturePrompt = buildArchitecturePrompt(economyText);
console.log('Prompt length:', architecturePrompt.length, 'characters');
console.log('Contains sentence length variation rule:', architecturePrompt.includes('SENTENCE LENGTH VARIATION'));
console.log('Contains syntactic diversity rule:', architecturePrompt.includes('SYNTACTIC DIVERSITY'));
console.log('Contains hedging rule:', architecturePrompt.includes('HEDGING & UNCERTAINTY'));
console.log('Contains paragraph structure rule:', architecturePrompt.includes('PARAGRAPH STRUCTURE VARIATION'));
console.log('');

// Test 3: getEnglishHumanizerConfig for Academic
console.log('3. Testing getEnglishHumanizerConfig() for Academic:');
const academicConfig = getEnglishHumanizerConfig(economyText, 'Academic');
console.log('System prompt uses buildArchitecturePrompt:', academicConfig.systemPrompt.includes('CRITICAL ARCHITECTURE RULES'));
console.log('Temperature:', academicConfig.temperature, '(expected: 1.1)');
console.log('Frequency penalty:', academicConfig.frequencyPenalty, '(expected: 0.3)');
console.log('Presence penalty:', academicConfig.presencePenalty, '(expected: 0.2)');
console.log('Max tokens:', academicConfig.maxTokens, '(expected: 1600)');
console.log('');

// Test 4: finalHumanize - hanya cleanup
console.log('4. Testing finalHumanize() - hanya cleanup:');
const messyText = "This is a test.   it has extra spaces.  and inconsistent capitalization.";
const cleanedText = finalHumanize(messyText, 'ielts', false);
console.log('Input:', messyText);
console.log('Output:', cleanedText);
console.log('Has proper spacing:', !cleanedText.includes('  '));
console.log('Has proper capitalization:', cleanedText.includes('It has'));
console.log('');

console.log('=== ALL TESTS COMPLETE ===');
