import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error('OpenRouter API key not found');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Make request to OpenRouter with GPT-5 Mini (with fallbacks)
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Kusam AI Product Description Editor'
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        models: ['openai/gpt-5-mini', 'openai/gpt-4.1-mini', 'openai/gpt-4o-mini'], // Fallback chain
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that rephrases product descriptions to be concise and compelling. You must respond with ONLY the rephrased text, nothing else. No quotes, no explanations, just the rephrased description.'
          },
          {
            role: 'user',
            content: `Rephrase the following product description to be exactly 100 characters or less while keeping the most important information and maintaining a natural, appealing tone in Spanish. Do not use quotes or any extra formatting, just return the rephrased text:

"${description}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.text();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: `OpenRouter API error: ${openrouterResponse.status}` },
        { status: openrouterResponse.status }
      );
    }

    const data = await openrouterResponse.json();
    console.log('OpenRouter API response:', JSON.stringify(data, null, 2));

    const rephrasedText = data.choices?.[0]?.message?.content?.trim();

    if (!rephrasedText) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Ensure the rephrased text doesn't exceed 100 characters
    const finalText = rephrasedText.length > 100 
      ? rephrasedText.substring(0, 100).trim() 
      : rephrasedText;

    return NextResponse.json({ 
      rephrased: finalText,
      original_length: description.length,
      new_length: finalText.length
    });

  } catch (error) {
    console.error('Error rephrasing description:', error);
    return NextResponse.json(
      { error: 'Failed to rephrase description' },
      { status: 500 }
    );
  }
}
