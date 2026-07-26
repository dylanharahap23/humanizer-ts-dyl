import { ultimateHumanChaos } from './humanizer';

const testText = `Toilet paper is commonly used in Western countries for personal hygiene after using the bathroom. Many people find it convenient and easy to use. However, some argue that bidets are more hygienic and environmentally friendly. The choice between toilet paper and water really depends on cultural preferences and personal habits. Both methods have their advantages and disadvantages. In India, water is traditionally preferred for cleaning. Some hotels in tourist areas provide both options for guests.`;

console.log("=== ORIGINAL TEXT ===");
console.log(testText);
console.log("\n\n=== AFTER ULTIMATE HUMAN CHAOS (6 DIMENSIONS) ===");
const result = ultimateHumanChaos(testText, testText);
console.log(result);
