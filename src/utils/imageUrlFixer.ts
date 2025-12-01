import { supabase } from '../../lib/supabaseClient';

// Extract base filename without timestamp and extension
function extractBaseFilename(url: string): string | null {
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Remove timestamp and extension to get base pattern
    // Example: expo360-furniture---1759983238841.png -> expo360-furniture---
    const match = filename.match(/^(expo360-furniture[^0-9]*)(\d+)\.(.+)$/);
    if (match) {
      return match[1]; // Returns "kusam-furniture---" or similar pattern
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting base filename:', error);
    return null;
  }
}

// Find the actual image URL in the bucket that matches the pattern
export async function findActualImageUrl(storedUrl: string): Promise<string | null> {
  try {
    if (!storedUrl || !storedUrl.includes('expo360-furniture')) {
      return storedUrl; // Return as-is if not a problematic URL
    }

    const basePattern = extractBaseFilename(storedUrl);
    if (!basePattern) {
      return storedUrl; // Return as-is if we can't extract pattern
    }

    // List all files in the product-images bucket
    const { data: files, error } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

    if (error || !files) {
      console.error('Error listing bucket files:', error);
      return storedUrl;
    }

    // Find files that match the base pattern
    const matchingFiles = files.filter((file: { name: string }) => 
      file.name.startsWith(basePattern) && 
      file.name.match(/\d+\.(png|jpg|jpeg|webp)$/i)
    );

    if (matchingFiles.length === 0) {
      console.warn('No matching files found for pattern:', basePattern);
      return storedUrl;
    }

    // Get the most recent matching file
    const latestFile = matchingFiles[0]; // Already sorted by created_at desc
    
    // Generate the correct public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(latestFile.name);

    const correctedUrl = publicUrlData.publicUrl;
    console.log('URL correction:', { original: storedUrl, corrected: correctedUrl });
    
    return correctedUrl;

  } catch (error) {
    console.error('Error finding actual image URL:', error);
    return storedUrl; // Return original on error
  }
}

// Batch fix all problematic URLs in the database
export async function fixAllImageUrls(): Promise<{ fixed: number; errors: number }> {
  try {
    console.log('Starting bulk image URL fix...');
    
    // Get all prompts with potentially problematic URLs
    const { data: prompts, error: fetchError } = await supabase
      .from('image_prompts')
      .select('prompt_id, output_image')
      .not('output_image', 'is', null)
      .ilike('output_image', '%expo360-furniture%');

    if (fetchError) {
      console.error('Error fetching prompts for URL fix:', fetchError);
      return { fixed: 0, errors: 1 };
    }

    console.log(`Found ${prompts.length} prompts with potentially problematic URLs`);

    let fixed = 0;
    let errors = 0;

    for (const prompt of prompts) {
      try {
        const correctedUrl = await findActualImageUrl(prompt.output_image);
        
        // Only update if the URL actually changed
        if (correctedUrl !== prompt.output_image) {
          const { error: updateError } = await supabase
            .from('image_prompts')
            .update({ output_image: correctedUrl })
            .eq('prompt_id', prompt.prompt_id);

          if (updateError) {
            console.error(`Error updating prompt ${prompt.prompt_id}:`, updateError);
            errors++;
          } else {
            console.log(`Fixed URL for prompt ${prompt.prompt_id}`);
            fixed++;
          }
        }
      } catch (error) {
        console.error(`Error processing prompt ${prompt.prompt_id}:`, error);
        errors++;
      }
    }

    console.log(`URL fix completed. Fixed: ${fixed}, Errors: ${errors}`);
    return { fixed, errors };

  } catch (error) {
    console.error('Error in bulk URL fix:', error);
    return { fixed: 0, errors: 1 };
  }
}