import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎯 [enhance-prompt API] Request received');
  try {
    const body = await request.json();
    console.log('[enhance-prompt API] Full body received:', JSON.stringify(body));
    const { prompt } = body;

    console.log('[enhance-prompt API] Extracted prompt:', prompt);
    console.log('[enhance-prompt API] Prompt type:', typeof prompt);
    console.log('[enhance-prompt API] Prompt length:', prompt?.length);

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.error('[enhance-prompt API] ❌ Validation failed - prompt is empty or invalid');
      return NextResponse.json({ 
        error: 'No prompt provided',
        debug: {
          promptExists: !!prompt,
          promptType: typeof prompt,
          promptLength: prompt?.length,
          bodyKeys: Object.keys(body)
        }
      }, { status: 400 });
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error('[enhance-prompt API] ❌ OpenRouter API key not found');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    const systemPrompt = `You are an expert AI prompt engineer specialized in image generation prompts for furniture and product photography. Your job is to take a user's basic prompt and enhance it to be more detailed, specific, and effective for generating high-quality furniture visualization images.

CRITICAL CONTEXT:
- The user has ALREADY UPLOADED a main product image (furniture piece)
- This furniture piece is the HERO of the scene and MUST remain the focal point
- The user's prompt is about additional context/modifications AROUND the main furniture
- Your enhanced prompt should complement the furniture, not overshadow it

ENHANCEMENT GUIDELINES:
1. **Keep the main furniture as the focal point** - it should be prominent and well-lit
2. Keep the core intent of the original prompt (scene, people, atmosphere)
3. Add specific details about lighting that highlights the furniture
4. Include professional photography terms that emphasize product visibility
5. Make the furniture stand out against the background/context
6. Keep it concise but descriptive (2-4 sentences max)
7. Ensure the furniture remains the central subject
8. Maintain the language of the original prompt (Spanish or English)

IMPORTANT:
- Do NOT add explanations or meta-commentary
- Do NOT use phrases like "Enhanced prompt:" or "Here's the improved version:"
- Return ONLY the enhanced prompt text itself
- Always emphasize that the uploaded furniture piece should be prominently featured
- The scene/people/background should COMPLEMENT the furniture, not compete with it
- If the original is in Spanish, respond in Spanish
- If the original is in English, respond in English`;

    const userPrompt = `Enhance this furniture visualization prompt:

"${prompt}"

Make it more detailed and effective for image generation. Return only the enhanced prompt text.`;

    console.log('[enhance-prompt API] 🤖 Calling Maestro model...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
        'X-Title': 'Kusam Prompt Enhancer'
      },
      body: JSON.stringify({
        model: '@preset/maestro-by-interzekt-grok4-edition',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8, // Creative but controlled
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[enhance-prompt API] ❌ OpenRouter error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to enhance prompt',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('[enhance-prompt API] Full API response:', JSON.stringify(data, null, 2));
    console.log('[enhance-prompt API] Choices array:', data.choices);
    console.log('[enhance-prompt API] First choice:', data.choices?.[0]);
    console.log('[enhance-prompt API] Message:', data.choices?.[0]?.message);
    console.log('[enhance-prompt API] Content:', data.choices?.[0]?.message?.content);
    console.log('[enhance-prompt API] Reasoning:', data.choices?.[0]?.message?.reasoning);
    
    // Try to get content from either 'content' or 'reasoning' field (reasoning models use 'reasoning')
    let enhancedPrompt = data.choices?.[0]?.message?.content?.trim() || 
                        data.choices?.[0]?.message?.reasoning?.trim();

    if (!enhancedPrompt) {
      console.error('[enhance-prompt API] ❌ No enhanced prompt returned');
      console.error('[enhance-prompt API] Response structure:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0],
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content
      });
      return NextResponse.json({ 
        error: 'No enhanced prompt generated',
        originalPrompt: prompt,
        debug: data
      }, { status: 500 });
    }

    console.log('[enhance-prompt API] ✅ Enhanced prompt:', enhancedPrompt);
    console.log('[enhance-prompt API] Token usage:', data.usage);

    return NextResponse.json({ 
      enhancedPrompt,
      originalPrompt: prompt,
      usage: data.usage
    });

  } catch (error) {
    console.error('[enhance-prompt API] ❌ Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
