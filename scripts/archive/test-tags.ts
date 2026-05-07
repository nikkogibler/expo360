import { assignTagsToPrompt, getAllCategories } from './src/utils/promptTags';

// Test prompts to demonstrate the tagging system
const testPrompts = [
  "Sofá moderno de cuero negro en sala de estar minimalista con plantas verdes",
  "Mesa de comedor de madera de roble con sillas tapizadas en tela beige",
  "Dormitorio acogedor con cama de hierro forjado y textiles suaves en colores neutros",
  "Sillón vintage de terciopelo azul junto a lámpara de bronce y libros antiguos",
  "Cocina contemporánea con muebles blancos, encimera de mármol y iluminación natural",
  "Escritorio de vidrio con estructura metálica en oficina moderna con vista al jardín"
];

console.log('=== FURNITURE PROMPT TAGGING SYSTEM DEMO ===\n');

console.log('Available Tag Categories:');
const categories = getAllCategories();
Object.entries(categories).forEach(([key, category]) => {
  console.log(`${category.name}: ${category.tags.length} tags`);
});

console.log('\n=== SAMPLE PROMPT ANALYSIS ===\n');

testPrompts.forEach((prompt, index) => {
  const tags = assignTagsToPrompt(prompt);
  console.log(`${index + 1}. "${prompt}"`);
  console.log(`   Tags (${tags.length}): ${tags.join(', ')}`);
  console.log('');
});

console.log('=== CATEGORY BREAKDOWN ===\n');

// Analyze which categories are most common
const categoryStats: { [key: string]: number } = {};
testPrompts.forEach(prompt => {
  const tags = assignTagsToPrompt(prompt);
  tags.forEach(tag => {
    Object.entries(categories).forEach(([categoryKey, category]) => {
      if (category.tags.includes(tag)) {
        categoryStats[categoryKey] = (categoryStats[categoryKey] || 0) + 1;
      }
    });
  });
});

Object.entries(categoryStats)
  .sort(([,a], [,b]) => b - a)
  .forEach(([category, count]) => {
    console.log(`${categories[category].name}: ${count} matches`);
  });

export {};