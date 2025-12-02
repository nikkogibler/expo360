import React from 'react';
import { getSupabaseAdmin, getSupabaseClient, isUsingMockAdmin, isUsingMockClient } from '../../../../lib/supabaseMock';
import ClientPreviewShell from '@/components/ClientPreviewShell';

const BUCKET = 'expo360-clients-assets';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // If no Supabase anon/client keys are configured, fall back to a lightweight mock client.
  if (isUsingMockClient()) {
    // Provide a lightweight mock client so the client-side preview shell
    // (Admin Dashboard + Expo Landing) can still render and be interacted with
    // when Supabase isn't configured for local development.
    const mockClient = {
      id: `mock-${slug}`,
      slug,
      name: slug,
      description: 'This is a mock preview because Supabase is not configured.',
      logo_path: null,
      theme: { primaryColor: '#0ea5e9' },
      created_at: new Date().toISOString(),
    } as any;

    return (
      <div className="p-0">
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-2xl font-semibold">Preview — {slug} (mock)</h1>
            <p className="text-sm text-yellow-700">This is a mock preview because Supabase is not configured locally. Interactive Admin UI is still available.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ClientPreviewShell client={mockClient} logoUrl={null} />
        </div>
      </div>
    );
  }

  // If admin/service-role is missing but anonymous keys are present, use the
  // anon client to fetch the public client row and use public storage URLs
  // when possible. If admin is available, use it to produce signed URLs.
  if (isUsingMockAdmin()) {
    const supabaseClient = getSupabaseClient();
    const { data: client, error } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single();

    if (error || !client) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold">Client not found</h1>
          <p className="mt-2 text-gray-600">No client found for slug: {slug}</p>
        </div>
      );
    }

    let logoUrl: string | null = null;
    if (client.logo_path) {
      try {
        const publicObj = await supabaseClient.storage.from(BUCKET).getPublicUrl(client.logo_path);
        logoUrl = publicObj?.data?.publicUrl || null;
      } catch {
        logoUrl = null;
      }
    }

    return <ClientPreviewShell client={client} logoUrl={logoUrl} />;
  }

  // Full admin available path
  const supabaseAdmin = getSupabaseAdmin();
  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .single();

  if (error || !client) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Client not found</h1>
        <p className="mt-2 text-gray-600">No client found for slug: {slug}</p>
      </div>
    );
  }

  let logoUrl: string | null = null;
  if (client.logo_path) {
    const { data: signedData, error: signedErr } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(client.logo_path, 60 * 60);
    if (!signedErr) logoUrl = (signedData as any)?.signedUrl || null;
  }

  return <ClientPreviewShell client={client} logoUrl={logoUrl} />;
}
