import { NextRequest, NextResponse } from 'next/server';
import { findActualImageUrl, fixAllImageUrls } from '../../../utils/imageUrlFixer';

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check - ensure request comes from admin context
    const referer = request.headers.get('referer');
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, url } = body;

    if (action === 'fix-single' && url) {
      // Fix a single URL
      const correctedUrl = await findActualImageUrl(url);
      return NextResponse.json({
        success: true,
        originalUrl: url,
        correctedUrl,
        wasChanged: correctedUrl !== url
      });
    } else if (action === 'fix-all') {
      // Fix all URLs in the database
      const result = await fixAllImageUrls();
      return NextResponse.json({
        success: true,
        ...result,
        message: `Fixed ${result.fixed} URLs with ${result.errors} errors`
      });
    } else {
      return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in fix-image-urls:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check how many URLs need fixing
export async function GET() {
  try {
    const { supabase } = await import('../../../../lib/supabaseClient');
    
    // Count total prompts with images
    const { count: totalWithImages } = await supabase
      .from('image_prompts')
      .select('*', { count: 'exact', head: true })
      .not('output_image', 'is', null);

    // Count potentially problematic URLs
    const { count: problematicUrls } = await supabase
      .from('image_prompts')
      .select('*', { count: 'exact', head: true })
      .not('output_image', 'is', null)
      .ilike('output_image', '%expo360-furniture%');

    return NextResponse.json({
      totalWithImages: totalWithImages || 0,
      problematicUrls: problematicUrls || 0,
      needsFix: (problematicUrls || 0) > 0
    });

  } catch (error) {
    console.error('Error checking URL status:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}