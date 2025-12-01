import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isUsingMock } from '../../../../../lib/supabaseMock';

const BUCKET = 'expo360-clients-assets';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  try {
    // Admin auth: require header `x-admin-key` that matches server env `ADMIN_API_KEY`.
    // For local/dev convenience this will also accept NEXT_PUBLIC_ADMIN_API_KEY if set,
    // but in production you SHOULD set only ADMIN_API_KEY in Vercel (server-only).
    const providedAdminKey = request.headers.get('x-admin-key') || '';
    const serverAdminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY || '';
    if (!serverAdminKey || providedAdminKey !== serverAdminKey) {
      return NextResponse.json({ error: { code: 'unauthorized', message: 'Missing or invalid admin key' } }, { status: 401 });
    }

    const form = await request.formData();
    const name = (form.get('name') as string) || '';
    const providedSlug = (form.get('slug') as string) || '';
    const description = (form.get('description') as string) || '';
    const themeRaw = (form.get('theme') as string) || '{}';

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = providedSlug || slugify(name);
    const adminUserId = (form.get('admin_user_id') as string) || null;
    const adminUserEmail = (form.get('admin_user_email') as string) || null;

    // If mock, short-circuit
    if (isUsingMock()) {
      console.log('[MOCK] create-client', { name, slug });
      return NextResponse.json({ success: true, slug, previewUrl: `/c/${slug}` }, { status: 200 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Handle logo upload
    const logoFile = form.get('logo') as File | null;
    let logoPath: string | null = null;
    let logoSignedUrl: string | null = null;

    // File validation
    const MAX_BYTES = 1_000_000; // 1 MB
    const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];

    if (logoFile && (logoFile as any).size > 0) {
      const size = (logoFile as any).size as number;
      const mime = (logoFile as any).type as string;
      if (size > MAX_BYTES) {
        return NextResponse.json({ error: { code: 'file_too_large', message: `Logo exceeds max size of ${MAX_BYTES} bytes` } }, { status: 400 });
      }
      if (!ALLOWED.includes(mime)) {
        return NextResponse.json({ error: { code: 'invalid_mime', message: 'Unsupported logo MIME type' } }, { status: 400 });
      }

      const filename = (logoFile as any).name || `${slug}-logo`;
      const extMatch = filename.match(/\.([a-z0-9]{1,6})$/i);
      const ext = extMatch ? `.${extMatch[1]}` : '.png';
      const path = `clients/${slug}/logo${ext}`;

      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, { upsert: true, contentType: mime });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json({ error: { code: 'upload_failed', message: 'Failed uploading logo', details: uploadError.message } }, { status: 500 });
      }

      // Create a signed URL (works whether bucket is public or private).
      const expires = 60 * 60; // 1 hour
      const { data: signedData, error: signedErr } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, expires);
      if (signedErr) {
        console.error('Signed URL error:', signedErr);
      } else {
        logoSignedUrl = (signedData as any)?.signedUrl || null;
      }

      logoPath = path;
    }

    // Insert client row
    let themeJson = {};
    try {
      themeJson = JSON.parse(themeRaw);
    } catch (e) {
      themeJson = {};
    }

    const { data, error: insertError } = await supabaseAdmin
      .from('clients')
      .insert([{
        slug,
        name,
        description,
        logo_path: logoPath,
        theme: themeJson
      }])
      .select('id,slug')
      .limit(1);

    if (insertError) {
      console.error('Error inserting client:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Attempt basic provisioning for the new client: create a tenant row in
    // the shared `customers` table (used as tenant registry in our multitenant
    // schema) and store the created tenant id inside the client's metadata.
    try {
      // We intentionally DO NOT create rows in the `customers` table here.
      // Clarification: `clients` are Interzekt's clients (tenants). `customers`
      // are end-users of those clients. Provisioning should therefore create
      // per-client variable_types (and other client-scoped tables) referencing
      // the newly-created `clients.id`.
      const placeholderVars = [
        { key: 'var1', label: 'Var 1' },
        { key: 'var2', label: 'Var 2' },
        { key: 'var3', label: 'Var 3' },
        { key: 'var4', label: 'Var 4' }
      ];

      // Detect whether `variable_types` table exists. If it does, insert
      // placeholder rows referencing the newly-created client id. Otherwise
      // store the placeholders in `clients.metadata` so the UI has scaffolding.
      let didInsertVars = false;
      try {
        // light check
        const { data: check, error: checkErr } = await supabaseAdmin.from('variable_types').select('id').limit(1);
        if (!checkErr) {
          // Insert placeholder variable_types for this client
          const { data: vtData, error: vtError } = await supabaseAdmin
            .from('variable_types')
            .insert(placeholderVars.map(v => ({ client_id: (data as any)[0].id, key: v.key, label: v.label })))
            .select('id');
          if (!vtError) didInsertVars = true;
        } else {
          console.warn('Provisioning: variable_types table check error, will fallback to metadata:', checkErr.message || checkErr);
        }
      } catch (vtCheckEx) {
        console.warn('Provisioning: variable_types check threw, falling back to metadata:', vtCheckEx);
      }

      try {
        // Update clients.metadata with placeholders so the admin UI can show them
        const metaPlaceholders = placeholderVars.map(v => ({ ...v, values: [] }));
        await supabaseAdmin
          .from('clients')
          .update({ metadata: { ...((data as any)[0]?.metadata || {}), variable_types: metaPlaceholders, provisioned_variable_rows: didInsertVars } })
          .eq('slug', slug);
      } catch (metaErr) {
        console.warn('Provisioning: failed to update client metadata with placeholder vars', metaErr);
      }
    } catch (provErr) {
      console.warn('Provisioning error (non-fatal):', provErr instanceof Error ? provErr.message : String(provErr));
    }

    // After provisioning, optionally map an admin user to this client so the
    // tenant can self-manage via RLS (user_clients table).
    try {
      const clientId = (data as any)[0]?.id;
      let mapped = false;
      if (clientId && (adminUserId || adminUserEmail)) {
        try {
          let targetUserId = adminUserId;
          if (!targetUserId && adminUserEmail) {
            // Try to resolve auth user by email (service role context)
            const { data: found, error: findErr } = await supabaseAdmin
              .from('auth.users')
              .select('id')
              .eq('email', adminUserEmail)
              .limit(1);
            if (!findErr && (found as any)?.length) {
              targetUserId = (found as any)[0].id;
            }
          }

          if (targetUserId) {
            const { error: mapErr } = await supabaseAdmin.from('user_clients').insert([{ user_id: targetUserId, client_id: clientId }]);
            if (!mapErr) mapped = true;
            else console.warn('Failed to insert user_clients mapping:', mapErr);
          } else {
            console.warn('Admin user not found for mapping (email lookup failed)');
          }
        } catch (mapEx) {
          console.warn('Error mapping admin user to client (non-fatal):', mapEx);
        }
      }

      return NextResponse.json({ success: true, slug, previewUrl: `/c/${slug}`, logoSignedUrl: logoSignedUrl || null, mappedAdmin: mapped }, { status: 200 });
    } catch (finalErr) {
      console.warn('Post-provision mapping error (non-fatal):', finalErr);
      return NextResponse.json({ success: true, slug, previewUrl: `/c/${slug}`, logoSignedUrl: logoSignedUrl || null }, { status: 200 });
    }

  } catch (err) {
    console.error('Error in create-client:', err);
    return NextResponse.json({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
