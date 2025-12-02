import React from 'react';
import { getSupabaseAdmin } from '@/lib/supabaseMock';

export default async function Page() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: clients, error } = await supabaseAdmin.from('clients').select('id,slug,name,description,logo_path,created_at').order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8">Error loading clients: {String(error.message)}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <div className="space-y-4">
        {clients && clients.length ? clients.map((c: any) => (
          <div key={c.id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.name} <span className="text-sm text-gray-500">({c.slug})</span></div>
              <div className="text-sm text-gray-600">{c.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-100 text-blue-700 rounded">Preview</a>
              <button
                onClick={async () => {
                  if (!confirm(`Delete client ${c.slug}? This removes DB row and storage.`)) return;
                  const adminKey = (process.env.NEXT_PUBLIC_ADMIN_API_KEY as string) || '';
                  const res = await fetch('/api/admin/delete-client', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ slug: c.slug }) });
                  const json = await res.json();
                  if (!res.ok) alert('Delete failed: ' + (json?.error?.message || json?.error || 'unknown'));
                  else location.reload();
                }}
                className="px-3 py-1 bg-red-100 text-red-700 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        )) : (
          <div className="text-gray-600">No clients yet.</div>
        )}
      </div>
    </div>
  );
}
