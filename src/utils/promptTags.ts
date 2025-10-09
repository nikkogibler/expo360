// Comprehensive tag system for furniture prompt analysis
// Based on common furniture, interior design, and photography terms

export const PROMPT_TAG_CATEGORIES = {
  // Furniture Types
  furniture: {
    name: 'Muebles',
    tags: [
      'sofá', 'silla', 'mesa', 'cama', 'escritorio', 'cómoda', 'armario', 'estantería',
      'sillón', 'butaca', 'taburete', 'banco', 'mesa de centro', 'mesa de comedor',
      'mesa de noche', 'tocador', 'aparador', 'vitrina', 'librero', 'cajonera',
      'biombo', 'perchero', 'zapatero', 'baúl', 'diván', 'otomana', 'mecedora'
    ]
  },

  // Colors
  colors: {
    name: 'Colores',
    tags: [
      'blanco', 'negro', 'gris', 'marrón', 'beige', 'crema', 'marfil', 'café',
      'azul', 'verde', 'rojo', 'amarillo', 'naranja', 'rosa', 'violeta', 'púrpura',
      'dorado', 'plateado', 'bronce', 'cobre', 'natural', 'neutro', 'claro', 'oscuro',
      'mate', 'brillante', 'satinado', 'metálico'
    ]
  },

  // Materials
  materials: {
    name: 'Materiales',
    tags: [
      'madera', 'metal', 'vidrio', 'cristal', 'cuero', 'piel', 'tela', 'terciopelo',
      'lino', 'algodón', 'seda', 'lana', 'mimbre', 'ratán', 'bambú', 'mármol',
      'granito', 'piedra', 'cerámica', 'plástico', 'acrílico', 'formica',
      'melamina', 'hierro', 'acero', 'aluminio', 'bronce', 'latón', 'cobre',
      'roble', 'pino', 'nogal', 'caoba', 'cedro', 'haya', 'fresno'
    ]
  },

  // Styles
  styles: {
    name: 'Estilos',
    tags: [
      'moderno', 'contemporáneo', 'clásico', 'tradicional', 'rústico', 'vintage',
      'retro', 'industrial', 'minimalista', 'escandinavo', 'bohemio', 'shabby chic',
      'art deco', 'mid-century', 'colonial', 'provenzal', 'mediterráneo',
      'nórdico', 'japonés', 'zen', 'tropical', 'ecléctico', 'luxe', 'elegante',
      'sofisticado', 'casual', 'formal'
    ]
  },

  // Rooms
  rooms: {
    name: 'Espacios',
    tags: [
      'sala', 'comedor', 'dormitorio', 'cocina', 'baño', 'estudio', 'oficina',
      'biblioteca', 'recibidor', 'pasillo', 'terraza', 'balcón', 'jardín',
      'sala de estar', 'living', 'cuarto de huéspedes', 'habitación infantil',
      'vestidor', 'lavandería', 'sótano', 'ático', 'loft', 'penthouse'
    ]
  },

  // Lighting
  lighting: {
    name: 'Iluminación',
    tags: [
      'natural', 'artificial', 'suave', 'dramática', 'cálida', 'fría', 'difusa',
      'directa', 'indirecta', 'lateral', 'cenital', 'ambiental', 'puntual',
      'dorada', 'blanca', 'luz día', 'atardecer', 'mañana', 'noche',
      'sombras', 'contraluz', 'iluminado', 'tenue', 'brillante'
    ]
  },

  // Decorative Elements
  decoration: {
    name: 'Decoración',
    tags: [
      'plantas', 'flores', 'cuadros', 'espejos', 'cojines', 'mantas', 'alfombras',
      'cortinas', 'jarrones', 'lámparas', 'velas', 'libros', 'esculturas',
      'fotografías', 'arte', 'adornos', 'textiles', 'tapices', 'relojes',
      'candelabros', 'floreros', 'macetas', 'cestas', 'bandejas'
    ]
  },

  // Photography Terms
  photography: {
    name: 'Fotografía',
    tags: [
      'primer plano', 'plano general', 'ángulo alto', 'ángulo bajo', 'frontal',
      'lateral', 'diagonal', 'perspectiva', 'profundidad', 'bokeh', 'enfoque',
      'desenfoque', 'textura', 'detalle', 'composición', 'encuadre', 'simetría',
      'asimetría', 'líneas', 'formas', 'volumen', 'contraste'
    ]
  },

  // Atmosphere/Mood
  atmosphere: {
    name: 'Ambiente',
    tags: [
      'acogedor', 'íntimo', 'relajante', 'energético', 'sereno', 'vibrante',
      'elegante', 'casual', 'formal', 'romántico', 'moderno', 'tradicional',
      'lujoso', 'sencillo', 'minimalista', 'recargado', 'fresco', 'cálido',
      'frío', 'luminoso', 'oscuro', 'espacioso', 'compacto'
    ]
  },

  // Quality/Condition
  quality: {
    name: 'Calidad',
    tags: [
      'nuevo', 'usado', 'restaurado', 'vintage', 'antique', 'artesanal',
      'industrial', 'hecho a mano', 'personalizado', 'único', 'exclusivo',
      'limitado', 'premium', 'básico', 'económico', 'lujo', 'alta calidad',
      'resistente', 'duradero', 'delicado'
    ]
  }
};

// Helper function to get all tags as a flat array
export function getAllTags(): string[] {
  return Object.values(PROMPT_TAG_CATEGORIES)
    .flatMap(category => category.tags);
}

// Helper function to get tags by category
export function getTagsByCategory(categoryKey: string): string[] {
  return PROMPT_TAG_CATEGORIES[categoryKey as keyof typeof PROMPT_TAG_CATEGORIES]?.tags || [];
}

// Helper function to assign tags to a prompt text
export function assignTagsToPrompt(promptText: string): string[] {
  if (!promptText) return [];
  
  const lowerPrompt = promptText.toLowerCase();
  const assignedTags: string[] = [];
  
  // Check each tag against the prompt text
  Object.values(PROMPT_TAG_CATEGORIES).forEach(category => {
    category.tags.forEach(tag => {
      if (lowerPrompt.includes(tag.toLowerCase())) {
        assignedTags.push(tag);
      }
    });
  });
  
  // Remove duplicates and return
  return [...new Set(assignedTags)];
}

// Helper function to get category for a specific tag
export function getCategoryForTag(tag: string): string | null {
  for (const [categoryKey, category] of Object.entries(PROMPT_TAG_CATEGORIES)) {
    if (category.tags.includes(tag)) {
      return categoryKey;
    }
  }
  return null;
}

// Helper function to get all categories
export function getAllCategories(): { [key: string]: { name: string; tags: string[] } } {
  return PROMPT_TAG_CATEGORIES;
}