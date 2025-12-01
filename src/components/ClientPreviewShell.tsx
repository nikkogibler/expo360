"use client";

import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import MainLeadForm from './MainLeadForm';
import { ClientProvider } from '@/context/ClientContext';

type Props = {
  client: any;
  logoUrl?: string | null;
};

export default function ClientPreviewShell({ client, logoUrl }: Props) {
  const [tab, setTab] = useState<'admin' | 'landing'>('admin');

  const primary = (client?.theme?.primaryColor as string) || '#0ea5e9';

  return (
    <ClientProvider client={client} logoUrl={logoUrl || null}>
      <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={`${client.name} logo`} className="h-12 object-contain" />
          ) : (
            <div className="w-28 h-12 bg-gray-200 flex items-center justify-center rounded">Logo</div>
          )}
          <div>
            <h1 style={{ color: primary }} className="text-2xl font-bold">{client.name}</h1>
            <p className="text-sm text-gray-600">{client.description}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTab('admin')}
              className={`px-3 py-1 rounded ${tab === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              Admin Dashboard
            </button>
            <button
              onClick={() => setTab('landing')}
              className={`px-3 py-1 rounded ${tab === 'landing' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              Expo Landing
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {tab === 'admin' ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Admin Dashboard (Preview)</h2>
            <div className="border rounded overflow-hidden">
              <AdminDashboard client={client} logoUrl={logoUrl || undefined} />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Expo Landing (Preview)</h2>
            <div className="border rounded p-6 bg-white">
              <MainLeadForm variant="expo360" client={client} logoUrl={logoUrl || undefined} />
            </div>
          </div>
        )}
      </main>
      </div>
    </ClientProvider>
  );
}
