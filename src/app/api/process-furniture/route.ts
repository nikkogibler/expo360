import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, modifications } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('Processing furniture image request...');
    console.log('Image received:', image.substring(0, 50) + '...');
    console.log('Modifications requested:', modifications);

    // Validate that image is base64 encoded
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format. Expected base64 data URL.' }, { status: 400 });
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error('OpenRouter API key not found');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Make request to OpenRouter with Google Gemini 2.5 Flash Image Preview
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Kusam AI Furniture Editor'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a professional furniture photographer and image standardization expert. Take this product image and apply the following standardization steps:

**Angle**: Rotate the furniture to a 45-degree front-right (three-quarter) angle (if not already shown)

**Aspect Ratio**: Convert to a vertical 9:16 portrait format

**Framing**: Ensure the entire furniture is fully visible in-frame (no cropping), centered with clean padding around the edges

**Background**: Apply a pure white studio background, seamless with no shadows, floors, or texture

**Cushions**: Change all cushion fabric to canvas color (#F5F5DC or close neutral beige)

**Lighting**: Use soft, diffused lighting with minimal shadows to emphasize form and texture

**Cleanliness**: Remove visual noise, props, logos, or reflections. Ensure a polished and consistent presentation across images

**Proportions**: Keep true-to-life scale and realistic materials without distortion

Additional modifications requested: ${modifications}

Please generate a standardized product image following these exact specifications. Return the processed image as your response.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${openrouterResponse.status} ${errorData}`);
    }

    const data = await openrouterResponse.json();
    console.log('OpenRouter API response:', JSON.stringify(data, null, 2));

    // Extract the response content
    let editedImageUrl = null;
    let description = '';
    let hasGeneratedImage = false;

    // First, check if the response has an 'id' field containing base64 data
    // Based on user feedback: rawResponse comes as {"id": "gen-1xxxxxxx...base64data"}
    if (data.id && typeof data.id === 'string' && data.id.length > 100) {
      console.log('Found id field with potential base64 data, length:', data.id.length);
      
      // Check if the id field contains base64-like data
      if (data.id.startsWith('gen-1') || /^[A-Za-z0-9+/=]+$/.test(data.id.slice(-100))) {
        // Extract the base64 part (everything after 'gen-1' if it starts with that)
        let base64Data = data.id;
        if (data.id.startsWith('gen-1')) {
          base64Data = data.id.slice(5); // Remove 'gen-1' prefix
        }
        
        editedImageUrl = `data:image/png;base64,${base64Data}`;
        hasGeneratedImage = true;
        console.log('Successfully extracted base64 from id field');
      }
    }
    
    // Fallback: Look for base64 patterns in the entire response if id field didn't work
    if (!hasGeneratedImage) {
      const rawResponseString = JSON.stringify(data);
      console.log('Raw response string length:', rawResponseString.length);
      
      // Look for base64 patterns in the entire response
      const base64Patterns = [
        /data:image\/[^;]+;base64,([A-Za-z0-9+/=]{100,})/g,
        /"id":\s*"([A-Za-z0-9+/=]{100,})"/g,  // Specifically look for id field
        /"image":\s*"([A-Za-z0-9+/=]{100,})"/g,
        /"base64":\s*"([A-Za-z0-9+/=]{100,})"/g,
        /([A-Za-z0-9+/=]{500,})/g  // Long base64 strings without prefix
      ];
      
      for (const pattern of base64Patterns) {
        const matches = [...rawResponseString.matchAll(pattern)];
        if (matches.length > 0) {
          console.log(`Found ${matches.length} matches with pattern:`, pattern);
          for (const match of matches) {
            const base64Data = match[1] || match[0];
            if (base64Data && base64Data.length > 500) { // Only consider substantial base64 strings
              console.log('Found substantial base64 data, length:', base64Data.length);
              
              // If it already has data URL prefix, use as-is
              if (base64Data.startsWith('data:image/')) {
                editedImageUrl = base64Data;
              } else {
                // Add data URL prefix for base64 data
                editedImageUrl = `data:image/png;base64,${base64Data}`;
              }
              hasGeneratedImage = true;
              break;
            }
          }
          if (hasGeneratedImage) break;
        }
      }
    }

    // Fallback to original parsing logic if no base64 found
    if (!hasGeneratedImage && data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      
      // Check if the response contains an image
      if (choice.message && choice.message.content) {
        if (Array.isArray(choice.message.content)) {
          // Handle array format response
          for (const item of choice.message.content) {
            if (item.type === 'image' && item.image) {
              // Handle base64 image
              editedImageUrl = `data:image/png;base64,${item.image}`;
              hasGeneratedImage = true;
            } else if (item.base64) {
              // Handle direct base64 format (Google Gemini 2.5 Flash Image Preview format)
              editedImageUrl = `data:image/png;base64,${item.base64}`;
              hasGeneratedImage = true;
            } else if (item.type === 'image_url' && item.image_url) {
              // Handle image URL format
              editedImageUrl = item.image_url.url;
              hasGeneratedImage = true;
            } else if (item.type === 'text') {
              description += item.text;
            }
          }
        } else if (typeof choice.message.content === 'string') {
          // Handle string format response - might contain base64 or URL
          const content = choice.message.content;
          
          // Check if it contains base64 image data
          const base64ImageMatch = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
          if (base64ImageMatch) {
            editedImageUrl = base64ImageMatch[0];
            hasGeneratedImage = true;
          } else {
            description = content;
          }
        }
      }
      
      // Also check for images in the choice directly (alternative format)
      if (choice.image) {
        editedImageUrl = `data:image/png;base64,${choice.image}`;
        hasGeneratedImage = true;
      }
    }

    // Also check the top-level data for images (some APIs return images here)
    if (!hasGeneratedImage && data.images && data.images.length > 0) {
      editedImageUrl = `data:image/png;base64,${data.images[0]}`;
      hasGeneratedImage = true;
    }

    console.log('Extracted data:', {
      hasGeneratedImage,
      editedImageUrl: editedImageUrl ? `${editedImageUrl.substring(0, 50)}...` : null,
      description: description.substring(0, 200),
      editedImageUrlLength: editedImageUrl ? editedImageUrl.length : 0
    });

    // Check token usage for debugging
    if (data.usage) {
      console.log(`Has Generated Image: ${hasGeneratedImage}, Success: ${!!editedImageUrl}, Image tokens in completion: ${data.usage.completion_tokens_details?.image_tokens || 0}, Total tokens: ${data.usage.total_tokens}`);
    }

    if (hasGeneratedImage && editedImageUrl) {
      return NextResponse.json({
        success: true,
        editedImageUrl,
        description,
        hasGeneratedImage: true,
        rawResponse: JSON.stringify(data, null, 2) // For debugging
      });
    } else {
      // If no image was generated, return a response explaining why
      return NextResponse.json({
        success: false,
        error: 'No image was generated by the AI model',
        description: description || 'The AI model was unable to generate a modified image.',
        hasGeneratedImage: false,
        rawResponse: JSON.stringify(data, null, 2) // For debugging
      });
    }

  } catch (error) {
    console.error('Error processing furniture image:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}