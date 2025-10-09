// Simple JavaScript test of the tagging system
console.log('=== FURNITURE PROMPT TAGGING SYSTEM DEMO ===\n');

// Simplified version of the tag categories for demo
const FURNITURE_TAGS = ['sofá', 'silla', 'mesa', 'cama', 'escritorio', 'sillón'];
const COLOR_TAGS = ['negro', 'blanco', 'marrón', 'beige', 'azul', 'verde', 'rojo'];
const MATERIAL_TAGS = ['cuero', 'madera', 'metal', 'vidrio', 'tela', 'terciopelo'];
const STYLE_TAGS = ['moderno', 'clásico', 'vintage', 'minimalista', 'contemporáneo'];
const ROOM_TAGS = ['sala', 'comedor', 'dormitorio', 'cocina', 'oficina'];

const ALL_TAGS = [...FURNITURE_TAGS, ...COLOR_TAGS, ...MATERIAL_TAGS, ...STYLE_TAGS, ...ROOM_TAGS];

function assignTags(promptText) {
  if (!promptText) return [];
  
  const lowerPrompt = promptText.toLowerCase();
  const assignedTags = [];
  
  ALL_TAGS.forEach(tag => {
    if (lowerPrompt.includes(tag.toLowerCase())) {
      assignedTags.push(tag);
    }
  });
  
  return [...new Set(assignedTags)];
}

// Test prompts
const testPrompts = [
  "Sofá moderno de cuero negro en sala de estar minimalista",
  "Mesa de comedor de madera con sillas tapizadas en tela beige",
  "Dormitorio acogedor con cama y textiles suaves",
  "Sillón vintage de terciopelo azul junto a lámpara",
  "Cocina contemporánea con muebles blancos",
  "Escritorio de vidrio con estructura metálica en oficina moderna"
];

console.log('SAMPLE PROMPT ANALYSIS:\n');

testPrompts.forEach((prompt, index) => {
  const tags = assignTags(prompt);
  console.log(`${index + 1}. "${prompt}"`);
  console.log(`   Tags (${tags.length}): ${tags.join(', ')}`);
  console.log('');
});

console.log('TOTAL AVAILABLE TAGS:', ALL_TAGS.length);
console.log('Categories: Furniture(6), Colors(7), Materials(6), Styles(5), Rooms(5)');