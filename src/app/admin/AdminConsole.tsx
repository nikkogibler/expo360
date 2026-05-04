'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  Building2,
  CheckCircle2,
  Eye,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

import { getFirebaseClientAuth } from '@/lib/firebase/client';
import type { ClientSummary } from '@/lib/expo360/types';

interface AdminConsoleProps {
  adminEmail: string;
  initialClients: ClientSummary[];
}

export default function AdminConsole({ adminEmail, initialClients }: AdminConsoleProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [publishingClientId, setPublishingClientId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    adminEmail: '',
    adminName: '',
    slug: '',
  });
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const stats = useMemo(() => {
    const published = clients.filter(
      (summary) => summary.eventPage.status === 'published'
    ).length;
    const leads = clients.reduce((total, summary) => total + summary.leadCount, 0);
    const products = clients.reduce(
      (total, summary) => total + summary.productCount,
      0
    );

    return { published, leads, products };
  }, [clients]);

  async function refreshClients() {
    setIsRefreshing(true);
    setNotice('');
    try {
      const response = await fetch('/api/admin/clients');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to refresh clients.');
      setClients(result.clients);
      router.refresh();
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to refresh clients.');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setCreatedPassword(null);
    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to create SMB customer.');
      }

      setForm({ name: '', adminEmail: '', adminName: '', slug: '' });
      setCreatedPassword(result.temporaryPassword || null);
      await refreshClients();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create SMB customer.');
    } finally {
      setIsCreating(false);
    }
  }

  async function setPublished(clientId: string, published: boolean) {
    setError('');
    setNotice('');
    setPublishingClientId(clientId);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update publish state.');
      }

      if (result.bundle) {
        setClients((currentClients) =>
          currentClients.map((summary) =>
            summary.client.id === clientId
              ? {
                  ...summary,
                  client: result.bundle.client,
                  eventPage: result.bundle.eventPage,
                  products: result.bundle.products,
                  leads: result.bundle.leads,
                  leadCount: result.bundle.leadCount,
                  productCount: result.bundle.products.length,
                }
              : summary
          )
        );
      }

      setNotice(
        published
          ? 'Event landing page published.'
          : 'Event landing page returned to draft.'
      );
      router.refresh();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Unable to update publish state.');
    } finally {
      setPublishingClientId(null);
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    try {
      await signOut(getFirebaseClientAuth());
    } catch {
      // The server session is already cleared.
    }
    router.push('/signin');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#111827]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d8d1c2] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#155e75]">
              Interzekt Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Expo360 master console</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4b5563]">
              Create SMB customer workspaces, watch publish readiness, and manually
              activate event landing pages for v1 demos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#d8d1c2] bg-white px-3 py-2 text-xs text-[#4b5563]">
              {adminEmail}
            </span>
            <button
              type="button"
              onClick={refreshClients}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d1c2] bg-white px-3 text-sm font-medium text-[#111827] transition hover:border-[#155e75]"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#111827] px-3 text-sm font-medium text-white transition hover:bg-[#155e75]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <Metric label="SMB customers" value={clients.length} />
          <Metric label="Published pages" value={stats.published} />
          <Metric label="Products loaded" value={stats.products} />
          <Metric label="Leads captured" value={stats.leads} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={createClient}
            className="rounded-lg border border-[#d8d1c2] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#155e75] text-white">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Create SMB customer</h2>
                <p className="text-sm text-[#6b7280]">One admin, one event landing page.</p>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {createdPassword ? (
              <div className="mt-4 rounded-md border border-[#b7d7c7] bg-[#eef8f1] px-3 py-2 text-sm text-[#166534]">
                Temporary SMB password: <span className="font-mono">{createdPassword}</span>
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              <Input
                label="SMB customer name"
                value={form.name}
                onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                required
              />
              <Input
                label="SMB admin email"
                type="email"
                value={form.adminEmail}
                onChange={(value) => setForm((current) => ({ ...current, adminEmail: value }))}
                required
              />
              <Input
                label="SMB admin name"
                value={form.adminName}
                onChange={(value) => setForm((current) => ({ ...current, adminName: value }))}
              />
              <Input
                label="Public slug"
                value={form.slug}
                onChange={(value) => setForm((current) => ({ ...current, slug: value }))}
                placeholder="optional"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#155e75] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create workspace'}
            </button>
          </form>

          <div className="overflow-hidden rounded-lg border border-[#d8d1c2] bg-white shadow-sm">
            <div className="border-b border-[#e7e0d2] px-5 py-4">
              <h2 className="text-lg font-semibold">SMB customers</h2>
              {notice ? (
                <p className="mt-2 rounded-md border border-[#b7d7c7] bg-[#eef8f1] px-3 py-2 text-sm text-[#166534]" aria-live="polite">
                  {notice}
                </p>
              ) : null}
            </div>
            <div className="divide-y divide-[#ece6da]">
              {clients.length === 0 ? (
                <div className="p-8 text-sm text-[#6b7280]">
                  No SMB customers yet. Create the first demo workspace.
                </div>
              ) : (
                clients.map((summary) => {
                  const isPublished = summary.eventPage.status === 'published';
                  const isPublishing = publishingClientId === summary.client.id;
                  const previewHref = `/c/${summary.eventPage.slug}?preview=1`;
                  const publicHref = `/c/${summary.eventPage.slug}`;

                  return (
                    <article key={summary.client.id} className="p-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#155e75]" />
                            <h3 className="text-base font-semibold">{summary.client.name}</h3>
                            <StatusBadge published={isPublished} />
                          </div>
                          <p className="mt-2 text-sm text-[#6b7280]">
                            {summary.adminEmail || 'No admin email'} · /c/{summary.eventPage.slug}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#4b5563]">
                            <span className="rounded-md bg-[#f4f1ea] px-2 py-1">
                              {summary.productCount} products
                            </span>
                            <span className="rounded-md bg-[#f4f1ea] px-2 py-1">
                              {summary.leadCount} leads
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={previewHref}
                            target="_blank"
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d1c2] px-3 text-sm font-medium transition hover:border-[#155e75]"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Link>
                          <Link
                            href={publicHref}
                            target="_blank"
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d1c2] px-3 text-sm font-medium transition hover:border-[#155e75]"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Public
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPublished(summary.client.id, !isPublished)}
                            disabled={isPublishing}
                            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                              isPublished
                                ? 'bg-[#f3f4f6] text-[#111827] hover:bg-[#e5e7eb]'
                                : 'bg-[#155e75] text-white hover:bg-[#0f4a5d]'
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            {isPublishing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : isPublished ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            {isPublishing
                              ? isPublished
                                ? 'Unpublishing...'
                                : 'Publishing...'
                              : isPublished
                                ? 'Unpublish'
                                : 'Publish'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#d8d1c2] bg-white p-4 shadow-sm">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
        published
          ? 'bg-[#eef8f1] text-[#166534]'
          : 'bg-[#fff7ed] text-[#9a3412]'
      }`}
    >
      {published ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#155e75] focus:ring-2 focus:ring-[#155e75]/15"
      />
    </label>
  );
}
