'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import {
  Building2,
  CheckCircle2,
  Eye,
  ExternalLink,
  Globe,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  UserPlus,
  Users,
  LayoutGrid,
  Layers,
} from 'lucide-react';

import { getFirebaseClientAuth } from '@/lib/firebase/client';
import type { ClientSummary } from '@/lib/expo360/types';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 90, damping: 20 },
  },
};

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
          ? 'Página de evento publicada.'
          : 'Página regresada a borrador.'
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
    <div className="relative min-h-dvh bg-[#08071a] text-white" style={{ zoom: 1.1 }}>
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -left-32 -top-32 h-[680px] w-[680px] rounded-full bg-purple-700/20 blur-[160px]" />
        <div className="absolute -bottom-24 right-0 h-[560px] w-[560px] rounded-full bg-indigo-600/15 blur-[130px]" />
        <div className="absolute left-[45%] top-[35%] h-80 w-80 rounded-full bg-violet-500/8 blur-[90px]" />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative mx-auto w-full max-w-7xl px-5 py-6 lg:px-8"
      >
        {/* Header */}
        <motion.header
          variants={fadeUp}
          className="mb-8 flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/" className="shrink-0 overflow-hidden">
              <img
                src="/expo360_logo.png"
                alt="Platform"
                className="h-16 w-auto scale-[1.35] object-contain drop-shadow-[0_2px_16px_rgba(139,92,246,0.5)]"
              />
            </Link>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-300/55">
                Acceso privado
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Master Console
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/40 backdrop-blur-sm">
              {adminEmail}
            </span>
            <button
              type="button"
              onClick={refreshClients}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:border-purple-400/30 hover:bg-white/8 hover:text-white active:scale-[0.98]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:border-red-400/30 hover:bg-red-500/8 hover:text-red-300 active:scale-[0.98]"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Salir
            </button>
          </div>
        </motion.header>

        {/* Stats */}
        <motion.section variants={fadeUp} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Building2} label="Clientes SMB" value={clients.length} />
          <Metric icon={Globe} label="Páginas publicadas" value={stats.published} accent />
          <Metric icon={Layers} label="Productos cargados" value={stats.products} />
          <Metric icon={Users} label="Leads capturados" value={stats.leads} />
        </motion.section>

        {/* Main grid */}
        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          {/* Create form */}
          <motion.form
            variants={fadeUp}
            onSubmit={createClient}
            className="h-fit rounded-2xl border border-white/8 bg-white/4 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/11">
                <UserPlus className="h-4 w-4 text-purple-300/70" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Nuevo cliente</h2>
                <p className="text-xs text-white/35">Un admin, una página de evento.</p>
              </div>
            </div>

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-200/80"
              >
                {error}
              </motion.div>
            ) : null}

            {createdPassword ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-purple-400/20 bg-purple-500/8 px-4 py-3 text-sm text-purple-200/80"
              >
                Contraseña temporal:{' '}
                <span className="font-mono text-purple-100">{createdPassword}</span>
              </motion.div>
            ) : null}

            <div className="mt-5 space-y-4">
              <GlassInput
                label="Nombre del cliente"
                value={form.name}
                onChange={(value) => setForm((c) => ({ ...c, name: value }))}
                required
              />
              <GlassInput
                label="Email del admin SMB"
                type="email"
                value={form.adminEmail}
                onChange={(value) => setForm((c) => ({ ...c, adminEmail: value }))}
                required
              />
              <GlassInput
                label="Nombre del admin"
                value={form.adminName}
                onChange={(value) => setForm((c) => ({ ...c, adminName: value }))}
              />
              <GlassInput
                label="Slug público"
                value={form.slug}
                onChange={(value) => setForm((c) => ({ ...c, slug: value }))}
                placeholder="opcional"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.5)] transition-all hover:bg-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" strokeWidth={2} />
              {isCreating ? 'Creando...' : 'Crear workspace'}
            </button>
          </motion.form>

          {/* Client list */}
          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="h-4 w-4 text-purple-300/60" strokeWidth={1.5} />
                <h2 className="text-base font-semibold text-white">Clientes SMB</h2>
              </div>
              {notice ? (
                <motion.p
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-purple-300/70"
                  aria-live="polite"
                >
                  {notice}
                </motion.p>
              ) : null}
            </div>

            <div className="divide-y divide-white/6">
              {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/4">
                    <Building2 className="h-5 w-5 text-white/25" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-white/30">
                    Sin clientes todavía. Crea el primer workspace.
                  </p>
                </div>
              ) : (
                clients.map((summary, i) => {
                  const isPublished = summary.eventPage.status === 'published';
                  const isPublishing = publishingClientId === summary.client.id;
                  const previewHref = `/c/${summary.eventPage.slug}?preview=1`;
                  const publicHref = `/c/${summary.eventPage.slug}`;

                  return (
                    <motion.article
                      key={summary.client.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring', stiffness: 90, damping: 20 }}
                      className="px-6 py-5 transition-colors hover:bg-white/3"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">{summary.client.name}</h3>
                            <StatusBadge published={isPublished} />
                          </div>
                          <p className="mt-1.5 text-xs text-white/35">
                            {summary.adminEmail || 'Sin email'} · /c/{summary.eventPage.slug}
                          </p>
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            <span className="rounded-lg border border-white/7 bg-white/4 px-2.5 py-1 text-[11px] text-white/40">
                              {summary.productCount} productos
                            </span>
                            <span className="rounded-lg border border-white/7 bg-white/4 px-2.5 py-1 text-[11px] text-white/40">
                              {summary.leadCount} leads
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={previewHref}
                            target="_blank"
                            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 text-xs font-medium text-white/60 transition-all hover:border-white/15 hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Preview
                          </Link>
                          <Link
                            href={publicHref}
                            target="_blank"
                            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 text-xs font-medium text-white/60 transition-all hover:border-white/15 hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Público
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPublished(summary.client.id, !isPublished)}
                            disabled={isPublishing}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${
                              isPublished
                                ? 'border border-white/8 bg-white/4 text-white/60 hover:border-red-400/25 hover:bg-red-500/8 hover:text-red-300'
                                : 'bg-purple-600 text-white shadow-[0_2px_16px_-4px_rgba(124,58,237,0.5)] hover:bg-purple-500'
                            }`}
                          >
                            {isPublishing ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                            ) : isPublished ? (
                              <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            )}
                            {isPublishing
                              ? isPublished ? 'Bajando...' : 'Publicando...'
                              : isPublished ? 'Despublicar' : 'Publicar'}
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })
              )}
            </div>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-2xl border p-5 backdrop-blur-xl transition-all hover:border-purple-400/25 ${
        accent
          ? 'border-purple-400/20 bg-purple-500/8 shadow-[inset_0_1px_0_rgba(139,92,246,0.12)]'
          : 'border-white/8 bg-white/4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/40">{label}</p>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${accent ? 'border-purple-400/20 bg-purple-500/15' : 'border-white/7 bg-white/4'}`}>
          <Icon className={`h-3.5 w-3.5 ${accent ? 'text-purple-300/70' : 'text-white/35'}`} strokeWidth={1.5} />
        </div>
      </div>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${accent ? 'text-purple-200' : 'text-white'}`}>
        {value}
      </p>
    </motion.div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium ${
        published
          ? 'border border-purple-400/20 bg-purple-500/11 text-purple-200/80'
          : 'border border-white/8 bg-white/4 text-white/35'
      }`}
    >
      {published ? (
        <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
      ) : (
        <Lock className="h-3 w-3" strokeWidth={1.5} />
      )}
      {published ? 'Publicado' : 'Borrador'}
    </span>
  );
}

function GlassInput({
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
      <span className="block text-[0.78rem] font-medium text-white/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 h-10 w-full rounded-xl border border-white/7 bg-white/6 px-3 text-sm text-white outline-none transition-all placeholder:text-white/18 focus:border-purple-400/40 focus:bg-white/9 focus:ring-2 focus:ring-purple-400/12"
      />
    </label>
  );
}

