import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isUsingMock } from '../../../../lib/supabaseMock';

export async function DELETE(request: NextRequest) {
  try {
    // Basic authentication check - ensure request comes from admin context
    const referer = request.headers.get('referer');
    if (!referer || !referer.includes('/admin/')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { promptId } = await request.json();

    // Validate input
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    console.log(`Deleting prompt ${promptId}`);

    // If using mock, return success immediately
    if (isUsingMock()) {
      console.log('[MOCK] Simulating prompt deletion');
      return NextResponse.json({ success: true, promptId, message: `Deleted prompt ${promptId}` }, { status: 200 });
    }

    // Delete the prompt from the database using service role client
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('image_prompts')
      .delete()
      .eq('prompt_id', promptId)
      .select('prompt_id');

    console.log('Delete result:', { data, error, promptId });

    if (error) {
      console.error('Error deleting prompt:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    console.log(`Successfully deleted prompt ${promptId}`);

    return NextResponse.json({
      success: true,
      promptId,
      message: `Deleted prompt ${promptId}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error in delete-prompt:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}