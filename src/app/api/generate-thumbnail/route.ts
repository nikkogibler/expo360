/**
 * API endpoint to generate a thumbnail for an uploaded image
 * Called immediately after image upload to ensure thumbnails exist
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/utils/supabaseServiceRole';
import { generateThumbnail, getThumbnailPath } from '@/utils/thumbnailGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, bucket = 'product-images' } = body;

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    console.log(`[generate-thumbnail API] 📸 Generating thumbnail for: ${fileName}`);
    console.log(`[generate-thumbnail API] 🪣 Bucket: ${bucket}`);

    // Download the original image from Supabase Storage
    const { data: imageData, error: downloadError } = await supabaseService.storage
      .from(bucket)
      .download(fileName);

    if (downloadError || !imageData) {
      console.error(`[generate-thumbnail API] ❌ Failed to download image:`, downloadError);
      return NextResponse.json({ 
        error: 'Failed to download image from storage',
        details: downloadError?.message 
      }, { status: 500 });
    }

    console.log(`[generate-thumbnail API] ✅ Downloaded image, size: ${imageData.size} bytes`);

    // Convert Blob to Buffer
    const arrayBuffer = await imageData.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Generate 200x200 thumbnail
    console.log(`[generate-thumbnail API] 🔧 Generating 200x200 thumbnail...`);
    const thumbnailBuffer = await generateThumbnail(imageBuffer);
    console.log(`[generate-thumbnail API] ✅ Thumbnail generated, size: ${thumbnailBuffer.length} bytes`);

    // Upload thumbnail to thumbnails/ subfolder
    const thumbnailPath = getThumbnailPath(fileName);
    console.log(`[generate-thumbnail API] ☁️ Uploading thumbnail to: ${thumbnailPath}`);

    const { error: uploadError } = await supabaseService.storage
      .from(bucket)
      .upload(thumbnailPath, thumbnailBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error(`[generate-thumbnail API] ❌ Failed to upload thumbnail:`, uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload thumbnail',
        details: uploadError.message 
      }, { status: 500 });
    }

    // Get public URL for the thumbnail
    const { data: { publicUrl } } = supabaseService.storage
      .from(bucket)
      .getPublicUrl(thumbnailPath);

    console.log(`[generate-thumbnail API] ✅ Thumbnail uploaded successfully!`);
    console.log(`[generate-thumbnail API] 🌐 Thumbnail URL: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      thumbnailPath,
      thumbnailUrl: publicUrl
    });

  } catch (error) {
    console.error('[generate-thumbnail API] ❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
