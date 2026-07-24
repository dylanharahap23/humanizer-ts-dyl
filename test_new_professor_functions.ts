import { forceInformationLoss, createObsessionLoop, destroyEditorialVoice, finalHumanize } from './humanizer';

const testText = 'Artificial intelligence is transforming many industries. There are several reasons why this is happening. First, AI can process data much faster than humans. This allows companies to make decisions quickly and efficiently. Second, machine learning algorithms can identify patterns that humans might miss. For example, in healthcare, AI can detect diseases earlier than traditional methods. Third, automation reduces costs significantly. Businesses can save money by using AI for repetitive tasks. Furthermore, AI systems work 24/7 without fatigue. This means continuous operation without breaks or errors. In conclusion, artificial intelligence offers multiple benefits that explain its rapid adoption across various sectors.';

console.log('=== ORIGINAL TEXT ===');
console.log(testText);
console.log('\n\n========================================');
console.log('TEST 1: forceInformationLoss');
console.log('========================================');
console.log('Purpose: Menghapus 15-35% kalimat (lupa)');
console.log('Result:');
console.log(forceInformationLoss(testText));

console.log('\n\n========================================');
console.log('TEST 2: createObsessionLoop');
console.log('========================================');
console.log('Purpose: Pilih 1-2 ide dan kembangkan berlebihan (obsesi)');
console.log('Result:');
console.log(createObsessionLoop(testText));

console.log('\n\n========================================');
console.log('TEST 3: destroyEditorialVoice');
console.log('========================================');
console.log('Purpose: Hancurkan suara editor dengan interjeksi, emosi, lupa');
console.log('Result:');
console.log(destroyEditorialVoice(testText));

console.log('\n\n========================================');
console.log('TEST 4: finalHumanize dengan 3 fungsi baru');
console.log('========================================');
console.log('Tone: english-general');
console.log('Result:');
console.log(finalHumanize(testText, 'english-general', false));

console.log('\n\n========================================');
console.log('TEST 5: finalHumanize dengan tone casual');
console.log('========================================');
console.log('Tone: casual');
console.log('Result:');
console.log(finalHumanize(testText, 'casual', false));

console.log('\n\n========================================');
console.log('TEST 6: finalHumanize dengan tone english-expository');
console.log('========================================');
console.log('Tone: english-expository');
console.log('Result:');
console.log(finalHumanize(testText, 'english-expository', false));

console.log('\n\n========================================');
console.log('TEST 7: finalHumanize dengan tone english-academic (TIDAK pakai 3 fungsi baru)');
console.log('========================================');
console.log('Tone: english-academic - seharusnya TIDAK menerapkan forceInformationLoss, createObsessionLoop, destroyEditorialVoice');
console.log('Result:');
console.log(finalHumanize(testText, 'english-academic', false));

console.log('\n\n========================================');
console.log('TEST 8: finalHumanize dengan skipHeavyProcessing=true');
console.log('========================================');
console.log('Tone: english-general, skipHeavyProcessing=true - seharusnya TIDAK menerapkan 3 fungsi baru');
console.log('Result:');
console.log(finalHumanize(testText, 'english-general', true));
