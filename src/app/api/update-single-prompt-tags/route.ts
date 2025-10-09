import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check - ensure request comes from admin context
    const referer = request.headers.get('referer');
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { promptId, tags } = await request.json();

    // Validate input
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }

    // Validate and clean tags
    const cleanTags = tags
      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim());

    console.log(`Updating tags for prompt ${promptId}:`, cleanTags);

    // Update the prompt in the database
    const { data, error } = await supabase
      .from('image_prompts')
      .update({ tags: cleanTags })
      .eq('prompt_id', promptId)
      .select('prompt_id, tags');

    if (error) {
      console.error('Error updating prompt tags:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    console.log(`Successfully updated prompt ${promptId} with ${cleanTags.length} tags`);

    return NextResponse.json({
      success: true,
      promptId,
      tags: cleanTags,
      message: `Updated ${cleanTags.length} tags for prompt ${promptId}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error in update-single-prompt-tags:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to retrieve tags for a specific prompt
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('image_prompts')
      .select('prompt_id, tags, prompt_text')
      .eq('prompt_id', promptId)
      .single();

    if (error) {
      console.error('Error fetching prompt tags:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({
      promptId: data.prompt_id,
      tags: data.tags || [],
      promptText: data.prompt_text
    }, { status: 200 });

  } catch (error) {
    console.error('Error in get prompt tags:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}