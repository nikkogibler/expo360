import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎯 [describe-image API] Request received');
  try {
    const body = await request.json();
    const { imageBase64, contextInfo, generationPrompt } = body;

    console.log('[describe-image API] Image data received, length:', imageBase64?.length || 0);
    console.log('[describe-image API] Context info received:', contextInfo);
    console.log('[describe-image API] Generation prompt received:', generationPrompt ? 'Yes' : 'No');

    if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
      console.error('[describe-image API] ❌ Invalid image data format');
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error('[describe-image API] ❌ OpenRouter API key not found');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Build detailed context string
    let contextDescription = '\n\n=== IMAGE GENERATION CONTEXT ===';
    contextDescription += `\nBase furniture: ${contextInfo?.fabric || 'unknown'} fabric`;
    contextDescription += `\nFrame/structure: ${contextInfo?.structure || 'unknown'} wood/material`;
    
    if (contextInfo?.referenceImages && contextInfo.referenceImages.length > 0) {
      const refDescriptions = contextInfo.referenceImages
        .filter((ref: {type?: string; label?: string}) => ref.type && ref.label)
        .map((ref: {type: string; label: string}) => {
          const type = ref.type === 'fabric' ? 'Applied fabric' : 
                      ref.type === 'structure' ? 'Applied structure' :
                      ref.type === 'people' ? 'Person/model' :
                      ref.type === 'place' ? 'Background scene' : 
                      'Style reference';
          return `${type}: ${ref.label}`;
        });
      
      if (refDescriptions.length > 0) {
        contextDescription += `\n` + refDescriptions.join('\n');
      }
    }

    // Include the full generation prompt if available
    if (generationPrompt) {
      contextDescription += `\n\n=== FULL AI GENERATION PROMPT USED ===\n${generationPrompt}`;
    }

    // Very specific prompt focusing on actual visible elements
    const prompt = `You are looking at an AI-generated furniture visualization image.${contextDescription}

=== YOUR TASK ===

Create a descriptive filename based on:
1. WHAT YOU SEE in the generated image
2. The context provided above (fabrics, structures, references)
3. The generation prompt instructions

Include in the filename:
- Type of furniture (sofa, chair, table, bed, etc.)
- Fabric patterns/textures visible (psychedelic, floral, geometric, solid, etc.)
- Any people or models in the scene
- Background elements (mountains, beach, city, interior, etc.)
- Wood type or frame material if visible
- Key colors and materials

RULES:
- Use underscores to separate words
- Be specific and descriptive (6-10 words)
- Include elements from the context provided above
- Start with furniture type
- NO generic words like "image", "photo", "furniture" alone
- NO file extensions

Good examples:
"brown_leather_sofa_geometric_cushions_mountain_backdrop"
"white_oak_dining_chair_woman_model_beach_scene"
"gray_sectional_psychedelic_fabric_desert_landscape"
"wooden_table_marble_texture_modern_interior"

RESPOND WITH ONLY THE FILENAME (no extension). Be descriptive of what's actually in the image.`;

    console.log('[describe-image API] 🤖 Generating image description...');

    // Try models in priority order: gpt-5-nano → gpt-4.1-mini → gemini-2.5-flash-image
    const models = [
      'openai/gpt-5-nano',
      'openai/gpt-4.1-mini', 
      'google/gemini-2.5-flash-image'
    ];

    let response: Response | null = null;
    let lastError: string | null = null;

    for (const model of models) {
      try {
        console.log(`[describe-image API] 🔄 Trying model: ${model}`);
        
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Expo360 AI Image Namer'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert at analyzing furniture images and creating descriptive, specific filenames. Focus on what you actually see in the image.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: imageBase64 } }
                ]
              }
            ],
            max_tokens: 150, // Allow space for detailed descriptive names
            temperature: 0.7 // Creative but focused
          })
        });

        if (response.ok) {
          console.log(`[describe-image API] ✅ Successfully used model: ${model}`);
          break; // Success! Exit loop
        } else {
          lastError = `${model} failed with status ${response.status}`;
          console.warn(`[describe-image API] ❌ ${lastError}`);
          response = null; // Reset for next attempt
        }
      } catch (error) {
        lastError = `${model} threw error: ${error}`;
        console.warn(`[describe-image API] ❌ ${lastError}`);
        response = null;
      }
    }

    // If all models failed, return fallback
    if (!response || !response.ok) {
      console.error('[describe-image API] ❌ All models failed. Last error:', lastError);
      return NextResponse.json({ 
        error: 'Failed to generate description',
        description: 'furniture' // Fallback
      }, { status: 200 }); // Return 200 so frontend can use fallback
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || 'furniture';
    
    console.log('[describe-image API] ✅ Generated description:', description);

    return NextResponse.json({ description });

  } catch (error) {
    console.error('[describe-image API] ❌ Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      description: 'furniture' // Fallback
    }, { status: 200 });
  }
}
