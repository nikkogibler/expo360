import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { assignTagsToPrompt } from '../../../utils/promptTags';

export async function POST() {
  try {
    console.log('Starting to update prompts with tags...');
    
    // Fetch all prompts
    const { data: prompts, error: fetchError } = await supabase
      .from('image_prompts')
      .select('prompt_id, prompt_text')
      .is('tags', null); // Only update prompts that don't have tags yet

    if (fetchError) {
      console.error('Error fetching prompts:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log(`Found ${prompts.length} prompts to update`);

    if (prompts.length === 0) {
      return NextResponse.json({ 
        message: 'No prompts need updating',
        updated: 0 
      });
    }

    let updated = 0;
    let errors = 0;

    // Update prompts in batches
    for (const prompt of prompts) {
      try {
        const tags = assignTagsToPrompt(prompt.prompt_text);
        
        if (tags.length > 0) {
          const { error: updateError } = await supabase
            .from('image_prompts')
            .update({ tags: tags })
            .eq('prompt_id', prompt.prompt_id);

          if (updateError) {
            console.error(`Error updating prompt ${prompt.prompt_id}:`, updateError);
            errors++;
          } else {
            updated++;
            console.log(`Updated prompt ${prompt.prompt_id} with ${tags.length} tags`);
          }
        }
      } catch (error) {
        console.error(`Error processing prompt ${prompt.prompt_id}:`, error);
        errors++;
      }
    }

    console.log(`Update complete. Updated: ${updated}, Errors: ${errors}`);

    return NextResponse.json({
      message: 'Tag update complete',
      total: prompts.length,
      updated,
      errors
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}