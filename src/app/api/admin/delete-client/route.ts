import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseMock';

export async function POST(request: NextRequest) {
  try {
    const providedAdminKey = request.headers.get('x-admin-key') || '';
    const serverAdminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY || '';
    if (!serverAdminKey || providedAdminKey !== serverAdminKey) {
      return NextResponse.json({ error: { code: 'unauthorized', message: 'Missing or invalid admin key' } }, { status: 401 });
    }

    const { slug } = await request.json();
    if (!slug) return NextResponse.json({ error: { code: 'invalid_input', message: 'Missing slug' } }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();

    // Delete DB row
    const { error: delErr } = await supabaseAdmin.from('clients').delete().eq('slug', slug);
    if (delErr) {
      console.error('Error deleting client row:', delErr);
      return NextResponse.json({ error: { code: 'db_error', message: delErr.message } }, { status: 500 });
    }

    // Optionally: delete storage prefix
    try {
      const bucket = 'expo360-clients-assets';
      // list objects under prefix and remove
      const { data: listData, error: listErr } = await supabaseAdmin.storage.from(bucket).list(`clients/${slug}`, { limit: 1000 });
      if (!listErr && Array.isArray(listData) && listData.length) {
        const paths = listData.map((i: any) => `clients/${slug}/${i.name}`);
        await supabaseAdmin.storage.from(bucket).remove(paths);
      }
    } catch (e) {
      console.warn('Storage cleanup failed', e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in delete-client:', err);
    return NextResponse.json({ error: { code: 'server_error', message: err instanceof Error ? err.message : String(err) } }, { status: 500 });
  }
}
