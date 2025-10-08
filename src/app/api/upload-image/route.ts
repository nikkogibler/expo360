import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/utils/supabaseServiceRole';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, fileName, bucket = 'product-images', userId } = body;

    if (!imageData || !fileName) {
      return NextResponse.json({ error: 'Missing imageData or fileName' }, { status: 400 });
    }

    console.log('[upload-image] Uploading to bucket:', bucket);
    console.log('[upload-image] Filename:', fileName);
    console.log('[upload-image] UserId:', userId);

    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.match(/data:([^;]+);/)?.[1] || 'image/png';
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload using service role (bypasses RLS)
    const { data, error: uploadError } = await supabaseService.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[upload-image] Upload error:', uploadError);
      return NextResponse.json({ 
        error: uploadError.message,
        details: uploadError 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseService.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('[upload-image] ✅ Upload successful:', publicUrl);

    return NextResponse.json({ 
      success: true,
      publicUrl,
      path: data.path
    });

  } catch (error) {
    console.error('[upload-image] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
