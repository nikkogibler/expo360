import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/utils/supabaseServiceRole';

// Helper function for retrying API calls with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API call attempt ${attempt}/${maxRetries}...`);
      const response = await fetch(url, options);
      
      // If it's a 503/502 (Cloudflare transient error), retry
      if ((response.status === 503 || response.status === 502) && attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // 1s, 2s, 4s (capped at 10s)
        console.log(`⚠️ Attempt ${attempt} failed with ${response.status}, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Success or non-retryable error - return response
      console.log(`✓ API call completed with status ${response.status}`);
      return response;
      
    } catch (error) {
      // Network error - retry if we have attempts left
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⚠️ Attempt ${attempt} failed with network error, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

interface ReferenceImageData {
  contextType: 'fabric' | 'structure' | 'person' | 'place' | 'style' | 'custom';
  contextLabel: string;
  customDescription?: string;
  order: number;
}

interface ImageContent {
  type: string;
  image_url: {
    url: string;
  };
}

interface ContentItem {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

export async function POST(request: NextRequest) {
  try {
  const body = await request.json();
  const { content, modifications, referenceImages = [], userId, tela, estructura, fileName } = body;

    // Validate content array
    if (!Array.isArray(content) || content.length < 1) {
      return NextResponse.json({ error: 'No images provided or content array malformed' }, { status: 400 });
    }

    // Extract images from content array
    // First is main product, rest are references
    const userImageObj = content[0];
    const userImage = userImageObj?.image_url?.url;

    if (!userImage) {
      return NextResponse.json({ error: 'Image data missing in content array' }, { status: 400 });
    }

    console.log('Processing furniture image request...');
    console.log('User image received:', userImage.substring(0, 50) + '...');
    console.log('Reference images count:', content.length - 1);
    console.log('Modifications requested:', modifications);

    // Validate that main image is base64 encoded
    if (!userImage.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format. Expected base64 data URL.' }, { status: 400 });
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error('OpenRouter API key not found');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Build prompt with reference image context
    let promptText = `IMPORTANT: The output must be a vertical, tall, 9:16 portrait image.

NOTE: The uploaded image may be of any kind of product, not just furniture. Apply the following steps to any product image provided.

You are a professional furniture photographer and image standardization expert. Take this product image and apply the following standardization steps:

**Angle**: Rotate the furniture to a 45-degree front-right (three-quarter) angle (if not already shown)

**Aspect Ratio**: Convert to a vertical 9:16 portrait format

**Framing**: Ensure the entire furniture is fully visible in-frame (no cropping), centered with clean padding around the edges

**Background**: Apply a pure white studio background, seamless with no shadows, floors, or texture

**Lighting**: Use soft, diffused lighting with minimal shadows to emphasize form and texture

**Cleanliness**: Remove visual noise, props, logos, or reflections. Ensure a polished and consistent presentation across images

**Proportions**: Keep true-to-life scale and realistic materials without distortion`;

    // Check if fabric or structure references are provided
    const hasFabricReference = referenceImages?.some((ref: ReferenceImageData) => ref.contextType === 'fabric');
    const hasStructureReference = referenceImages?.some((ref: ReferenceImageData) => ref.contextType === 'structure');

    // Add default cushion/structure instructions only if NO references provided
    if (!hasFabricReference) {
      promptText += `\n\n**Cushions**: Change all cushion fabric to canvas color (#F5F5DC or close neutral beige)`;
    }
    if (!hasStructureReference) {
      promptText += `\n\n**Frame/Structure**: Keep original wood/metal finish or standardize to natural wood tone`;
    }

    // Add reference images context if provided
    if (referenceImages && referenceImages.length > 0) {
      promptText += `\n\n**REFERENCE IMAGES PROVIDED (PRIORITY INSTRUCTIONS):**\n`;
      promptText += `- Image 1: Main product to standardize\n`;
      
      (referenceImages as ReferenceImageData[]).forEach((ref, index) => {
        const imageNum = index + 2;
        promptText += `- Image ${imageNum}: ${ref.contextLabel}`;
        
        switch(ref.contextType) {
          case 'fabric':
            promptText += ` - **IMPORTANT: Apply this exact fabric color and texture to ALL cushions, pillows, and upholstered surfaces on the furniture. Match the color precisely.**\n`;
            break;
          case 'structure':
            promptText += ` - **IMPORTANT: Apply this exact finish, color, and material texture to the frame, legs, and structural elements of the furniture. Match the finish precisely.**\n`;
            break;
          case 'person':
            promptText += ` - Reference for scale, lifestyle context\n`;
            break;
          case 'place':
            promptText += ` - Reference for background/environment setting\n`;
            break;
          case 'style':
            promptText += ` - Reference for overall aesthetic/mood\n`;
            break;
          case 'custom':
            promptText += ` - ${ref.customDescription || 'Additional reference context'}\n`;
            break;
          default:
            promptText += ` - Additional reference\n`;
        }
      });
    }

    promptText += `\nAdditional modifications requested: ${modifications}

Please generate a standardized product image following these exact specifications. Return the processed image as your response.

Again, ensure the output is a vertical, tall, 9:16 portrait image matching the aspect ratio of the blank reference image.`;

    // Build content array with all images
    const contentArray: ContentItem[] = [
      { type: 'text', text: promptText },
      { type: 'image_url', image_url: { url: userImage } },
      // Add reference images
      ...content.slice(1).map((img: ImageContent) => ({
        type: 'image_url',
        image_url: { url: img.image_url.url }
      }))
    ];

    console.log('Content array length:', contentArray.length);
    console.log('Total images being sent:', contentArray.filter((c) => c.type === 'image_url').length);
    
    // Log content array structure (without full base64 to avoid spam)
    console.log('Content array structure:', contentArray.map((item, i) => ({
      index: i,
      type: item.type,
      hasText: !!item.text,
      hasImageUrl: !!item.image_url,
      imageUrlLength: item.image_url?.url ? item.image_url.url.substring(0, 50) + '...' : 'none'
    })));
    
    // Calculate approximate payload size
    const payloadSize = JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [{ role: 'user', content: contentArray }],
      max_tokens: 4096,
      temperature: 0.7
    }).length;
    console.log('Approximate payload size:', (payloadSize / 1024 / 1024).toFixed(2), 'MB');
    
    if (payloadSize > 20 * 1024 * 1024) {
      console.warn('⚠️ WARNING: Payload exceeds 20MB, may be rejected by API');
    }

    // Make request to OpenRouter with Google Gemini 2.5 Flash Image (with retry logic)
    const openrouterResponse = await fetchWithRetry(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'Kusam AI Furniture Editor'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [
            {
              role: 'user',
              content: contentArray
            }
          ],
          max_tokens: 4096,
          temperature: 0.7
        })
      },
      3 // Max 3 attempts
    );

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.text();
      console.error('OpenRouter API error status:', openrouterResponse.status);
      console.error('OpenRouter API error response:', errorData.substring(0, 500)); // Log first 500 chars
      
      // Check if it's a Cloudflare error (service unavailable)
      if (errorData.includes('Cloudflare') || openrouterResponse.status === 503) {
        console.error('Cloudflare/503 error detected');
        throw new Error('El servicio de procesamiento de imágenes está temporalmente no disponible. Por favor, intenta de nuevo en unos minutos.');
      }
      
      // Check if payload might be too large
      if (openrouterResponse.status === 413 || openrouterResponse.status === 400) {
        console.error('Payload too large or bad request detected');
        // Try to parse error for more details
        try {
          const errorJson = JSON.parse(errorData);
          console.error('Error details:', errorJson);
          if (errorJson.error && errorJson.error.message) {
            throw new Error(`Error: ${errorJson.error.message}`);
          }
        } catch {
          // Not JSON, use generic message
        }
        throw new Error('La solicitud es demasiado grande. Intenta reducir el número de imágenes de referencia o el tamaño de las imágenes.');
      }
      
      throw new Error(`Error del servicio AI: ${openrouterResponse.status}. Intenta de nuevo más tarde.`);
    }

    const data = await openrouterResponse.json();
    console.log('OpenRouter API response:', JSON.stringify(data, null, 2));

    // Extract the response content
    let editedImageUrl = null;
    let description = '';
    let hasGeneratedImage = false;

    // NEW: Check for image generation response format (message.images)
    if (data.choices && data.choices.length > 0) {
      const message = data.choices[0].message;
      
      // Check for generated images in the new format
      if (message.images && message.images.length > 0) {
        console.log('Found generated images in message.images array, count:', message.images.length);
        const firstImage = message.images[0];
        if (firstImage.image_url && firstImage.image_url.url) {
          editedImageUrl = firstImage.image_url.url;
          hasGeneratedImage = true;
          console.log('Successfully extracted image from message.images format');
        }
      }
      
      // Extract text description if available
      if (message.content && typeof message.content === 'string') {
        description = message.content;
      }
    }

    // OLD FALLBACK: Check if the response has an 'id' field containing base64 data
    // Based on user feedback: rawResponse comes as {"id": "gen-1xxxxxxx...base64data"}
    if (!hasGeneratedImage && data.id && typeof data.id === 'string' && data.id.length > 100) {
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

    // --- LOG PROMPT USAGE TO image_prompts TABLE ---
    let userName = null;
    if (userId) {
      // Use the service role client to fetch user name from profiles table (by id)
      const { data: profile } = await supabaseService
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .maybeSingle();
      if (profile && profile.name) {
        userName = profile.name;
      } else {
        userName = null; // fallback to null if not found
      }
      console.log('[Prompt Logging] Looked up userName for userId', userId, ':', userName);
    }

    // Extract token usage if available
    let tokensUsed = null;
    if (data.usage && typeof data.usage.total_tokens !== 'undefined') {
      tokensUsed = data.usage.total_tokens;
    }

    // Get public URL for the generated image in Supabase Storage using the provided fileName
    let publicImageUrl = null;
    if (fileName) {
      try {
        const publicUrlObj = supabaseService.storage.from('product-images').getPublicUrl(fileName);
        publicImageUrl = publicUrlObj.data?.publicUrl || null;
      } catch (e) {
        console.error('Error getting public image URL:', e);
      }
    }

    const { error: promptLogError, data: promptLogData } = await supabaseService
      .from('image_prompts')
      .insert({
        prompt_text: modifications,
        tokens_used: tokensUsed,
        output_image: publicImageUrl,
        user: userName, // This is now the display name, not the UUID
        tela: tela || null,
        estructura: estructura || null,
        created_at: new Date().toISOString()
      });
    if (promptLogError) {
      console.error('[Prompt Logging] Failed to insert prompt log:', promptLogError);
    } else {
      console.log('[Prompt Logging] Successfully inserted prompt log:', promptLogData);
    }

    if (hasGeneratedImage && editedImageUrl) {
      return NextResponse.json({
        success: true,
        editedImageUrl,
        description,
        hasGeneratedImage: true,
        promptText, // Include the full prompt for AI naming
        rawResponse: JSON.stringify(data, null, 2) // For debugging
      });
    } else {
      // If no image was generated, return a response explaining why
      return NextResponse.json({
        success: false,
        error: 'No image was generated by the AI model',
        description: description || 'The AI model was unable to generate a modified image.',
        hasGeneratedImage: false,
        promptText, // Include prompt even on failure
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