import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create service role client for API operations (has RLS bypass permissions)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check - ensure request comes from admin context
    const referer = request.headers.get('referer');
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { promptId, imageUrl } = await request.json();

    // Validate input
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Valid image URL is required' }, { status: 400 });
    }

    console.log(`Updating image for prompt ${promptId} to: ${imageUrl}`);
    console.log('promptId type and value:', typeof promptId, promptId);

    // First, let's check if the prompt exists
    const { data: existingPrompt, error: selectError } = await supabaseAdmin
      .from('image_prompts')
      .select('prompt_id, output_image')
      .eq('prompt_id', promptId)
      .single();

    console.log('Existing prompt check:', { existingPrompt, selectError, promptId });

    if (selectError || !existingPrompt) {
      console.error('Prompt not found in database:', { promptId, selectError });
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Update the prompt in the database using service role client
    const { data, error } = await supabaseAdmin
      .from('image_prompts')
      .update({ output_image: imageUrl })
      .eq('prompt_id', promptId)
      .select('prompt_id, output_image');

    console.log('Update result:', { data, error, promptId });

    if (error) {
      console.error('Error updating prompt image:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    console.log(`Successfully updated prompt ${promptId} with image: ${imageUrl}`);

    return NextResponse.json({
      success: true,
      promptId,
      imageUrl,
      message: `Updated image for prompt ${promptId}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error in update-prompt-image:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}