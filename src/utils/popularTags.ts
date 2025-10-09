// Predefined popular tags based on actual usage data
export const POPULAR_TAGS = [
  { tag: 'furniture', count: 23 },
  { tag: 'perspective', count: 12 },
  { tag: 'full frontal view', count: 12 },
  { tag: 'couch', count: 8 },
  { tag: 'side view', count: 7 },
  { tag: 'sitting', count: 7 },
  { tag: 'beautiful view', count: 7 },
  { tag: 'interior', count: 6 },
  { tag: 'elegant', count: 6 },
  { tag: 'woman', count: 6 },
  { tag: 'vast palace land', count: 6 },
  { tag: 'relaxed', count: 6 },
  { tag: 'car', count: 5 },
  { tag: 'angled view', count: 5 },
  { tag: 'sunset', count: 5 },
  { tag: 'empty', count: 5 },
  { tag: 'no content', count: 5 },
  { tag: 'majestic view', count: 5 },
  { tag: 'peaceful', count: 4 },
  { tag: 'sophisticated', count: 3 },
  { tag: 'woman sitting', count: 3 },
  { tag: 'serene', count: 3 },
  { tag: 'majestic', count: 3 },
  { tag: 'serene atmosphere', count: 3 },
  { tag: 'golden hour', count: 3 },
  { tag: 'golden hour lighting', count: 3 },
  { tag: 'low angle', count: 3 },
  { tag: 'below', count: 2 },
  { tag: 'scenic view', count: 2 },
  { tag: 'urban', count: 2 },
  { tag: 'luxury', count: 2 },
  { tag: 'modern design', count: 2 },
  { tag: 'stylish', count: 2 },
  { tag: 'high-end', count: 2 },
  { tag: 'winter', count: 2 },
  { tag: 'photorealistic', count: 2 },
  { tag: 'fantasy art', count: 2 },
  { tag: 'primeval forest', count: 2 },
  { tag: 'mist-shrouded', count: 2 },
  { tag: 'tangled roots', count: 2 },
  { tag: 'crumbling stone altars', count: 2 },
  { tag: 'fallen columns', count: 2 },
  { tag: 'gigantic ancient trees', count: 2 },
  { tag: 'gnarled branches', count: 2 },
  { tag: 'cathedral-like canopy', count: 2 },
  { tag: 'dappled sunlight', count: 2 },
  { tag: 'magical', count: 2 },
  { tag: 'vibrant natural colors', count: 2 },
  { tag: 'ultra-detailed foliage', count: 2 },
  { tag: 'atmospheric', count: 2 },
  { tag: 'soft focus', count: 2 },
  { tag: 'painterly lighting', count: 2 },
  { tag: 'beautiful elderly woman', count: 2 },
  { tag: 'mid 60s', count: 2 },
  { tag: 'one-piece bathing suit', count: 2 },
  { tag: 'comfortable', count: 2 },
  { tag: 'mujer', count: 2 },
  { tag: 'sala', count: 2 },
  { tag: 'casa de playa', count: 2 },
  { tag: 'palace interior', count: 2 },
  { tag: 'woman sitting on couch', count: 2 },
  { tag: 'cityscape', count: 2 },
  { tag: 'regal', count: 2 },
  { tag: 'sun-drenched', count: 2 },
  { tag: 'soft directional light', count: 2 },
  { tag: 'spanish royal style', count: 2 },
  { tag: 'golden soft light', count: 2 },
  { tag: 'heavy silk curtains', count: 2 },
  { tag: 'opulent period room', count: 2 },
  { tag: 'intricate tapestries', count: 2 },
  { tag: 'polished marble floor', count: 2 },
  { tag: 'noble figure', count: 2 },
  { tag: 'regal posture', count: 2 },
  { tag: 'panoramic view', count: 2 },
  { tag: 'intimate atmosphere', count: 2 },
  { tag: 'quiet contemplation', count: 2 },
  { tag: 'minimalist design', count: 2 },
  { tag: 'modern', count: 2 },
  { tag: 'textured fabric', count: 2 },
  { tag: 'sophisticated relaxation', count: 2 },
  { tag: 'chaise lounges', count: 2 }
];

// Categorized tags for better organization
export const TAG_CATEGORIES = {
  'Furniture & Objects': [
    'furniture', 'couch', 'chaise lounges'
  ],
  'Photography & Views': [
    'perspective', 'full frontal view', 'side view', 'angled view', 'low angle',
    'beautiful view', 'majestic view', 'scenic view', 'panoramic view'
  ],
  'People & Poses': [
    'woman', 'sitting', 'woman sitting', 'woman sitting on couch',
    'beautiful elderly woman', 'mid 60s', 'noble figure', 'regal posture'
  ],
  'Lighting & Atmosphere': [
    'sunset', 'golden hour', 'golden hour lighting', 'dappled sunlight',
    'soft directional light', 'golden soft light', 'painterly lighting',
    'sun-drenched', 'atmospheric'
  ],
  'Mood & Style': [
    'elegant', 'relaxed', 'peaceful', 'sophisticated', 'serene',
    'serene atmosphere', 'majestic', 'luxury', 'stylish', 'high-end',
    'comfortable', 'regal', 'intimate atmosphere', 'quiet contemplation',
    'sophisticated relaxation'
  ],
  'Spaces & Environments': [
    'interior', 'urban', 'palace interior', 'sala', 'casa de playa',
    'spanish royal style', 'opulent period room', 'primeval forest',
    'vast palace land', 'cityscape'
  ],
  'Design & Aesthetics': [
    'modern design', 'minimalist design', 'modern', 'photorealistic',
    'fantasy art', 'magical', 'vibrant natural colors', 'textured fabric'
  ],
  'Details & Elements': [
    'empty', 'no content', 'mist-shrouded', 'tangled roots',
    'crumbling stone altars', 'fallen columns', 'gigantic ancient trees',
    'gnarled branches', 'cathedral-like canopy', 'ultra-detailed foliage',
    'soft focus', 'heavy silk curtains', 'intricate tapestries',
    'polished marble floor'
  ],
  'Miscellaneous': [
    'car', 'below', 'winter', 'one-piece bathing suit', 'mujer'
  ]
};

// Get top tags by category for dropdown organization
export function getTopTagsByCategory(limit: number = 5): { [category: string]: Array<{ tag: string; count: number }> } {
  const result: { [category: string]: Array<{ tag: string; count: number }> } = {};
  
  Object.entries(TAG_CATEGORIES).forEach(([category, tags]) => {
    result[category] = POPULAR_TAGS
      .filter(({ tag }) => tags.includes(tag))
      .slice(0, limit);
  });
  
  return result;
}

// Get all popular tags sorted by count
export function getTopTags(limit: number = 20): Array<{ tag: string; count: number }> {
  return POPULAR_TAGS.slice(0, limit);
}

// Search tags by query
export function searchTags(query: string, limit: number = 10): Array<{ tag: string; count: number }> {
  if (!query.trim()) return getTopTags(limit);
  
  const lowerQuery = query.toLowerCase();
  return POPULAR_TAGS
    .filter(({ tag }) => tag.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}