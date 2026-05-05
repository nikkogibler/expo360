'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import {
  CheckCircle2,
  Columns3,
  Download,
  Eye,
  ImagePlus,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  PackagePlus,
  Phone,
  Save,
  Table2,
  Trash2,
  X,
} from 'lucide-react';

import { getFirebaseClientAuth } from '@/lib/firebase/client';
import type { ClientBundle, Lead, LeadStatus, Product } from '@/lib/expo360/types';

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

type LayoutTemplate = 'coleccion' | 'galeria' | 'catalogo' | 'terminal';

interface TemplateDef {
  id: LayoutTemplate;
  name: string;
  description: string;
  thumb: React.ReactNode;
}

const TEMPLATE_DEFS: TemplateDef[] = [
  {
    id: 'coleccion',
    name: 'Colección',
    description: 'Panel flotante sobre foto de fondo',
    thumb: (
      <svg viewBox="0 0 80 50" className="w-full" aria-hidden>
        <rect width="80" height="50" rx="4" fill="#2a2520" />
        <rect x="4" y="6" width="72" height="39" rx="1" fill="#f8f4ee" />
        <line x1="31" y1="6" x2="31" y2="33" stroke="#e0d8cc" strokeWidth="0.5" />
        <line x1="4" y1="33" x2="76" y2="33" stroke="#e0d8cc" strokeWidth="0.5" />
        <rect x="7" y="12" width="20" height="4" rx="0.5" fill="#1a1a1a" opacity=".8" />
        <rect x="7" y="18" width="14" height="2" rx="0.5" fill="#999" opacity=".5" />
        <rect x="7" y="22" width="10" height="1.5" rx="0.5" fill="#bbb" opacity=".4" />
        <rect x="7" y="27" width="9" height="2.5" rx="1.25" fill="#e8e2d8" />
        <rect x="18" y="27" width="9" height="2.5" rx="1.25" fill="#e8e2d8" />
        <rect x="31" y="6" width="45" height="27" fill="#ccc" opacity=".6" />
        <rect x="63" y="8" width="10" height="2.5" rx="1.25" fill="white" opacity=".85" />
        <rect x="4" y="33.5" width="17" height="11" fill="#f4f0e8" />
        <line x1="21" y1="33.5" x2="21" y2="44.5" stroke="#e0d8cc" strokeWidth="0.5" />
        <rect x="21.5" y="33.5" width="17" height="11" fill="#f4f0e8" />
        <line x1="39" y1="33.5" x2="39" y2="44.5" stroke="#e0d8cc" strokeWidth="0.5" />
        <rect x="39.5" y="33.5" width="17" height="11" fill="#f4f0e8" />
        <line x1="57" y1="33.5" x2="57" y2="44.5" stroke="#e0d8cc" strokeWidth="0.5" />
        <rect x="57.5" y="33.5" width="18.5" height="11" fill="#f4f0e8" />
      </svg>
    ),
  },
  {
    id: 'galeria',
    name: 'Galería',
    description: 'Fondo oscuro, formulario blanco, grid de imágenes',
    thumb: (
      <svg viewBox="0 0 80 50" className="w-full" aria-hidden>
        <rect width="80" height="50" rx="4" fill="#0d0d0d" />
        <line x1="0" y1="8" x2="80" y2="8" stroke="white" strokeWidth="0.3" opacity=".2" />
        <rect x="3" y="2.5" width="14" height="3" rx="1" fill="white" opacity=".35" />
        <rect width="26" height="42" x="0" y="8" fill="white" />
        <rect x="3" y="12" width="20" height="2" rx="0.5" fill="#ccc" />
        <rect x="3" y="17" width="20" height="5" rx="0.5" fill="#f0f0f0" />
        <rect x="3" y="25" width="20" height="5" rx="0.5" fill="#f0f0f0" />
        <rect x="3" y="33" width="20" height="5" rx="1" fill="#222" opacity=".75" />
        <line x1="26" y1="8" x2="26" y2="50" stroke="white" strokeWidth="0.3" opacity=".15" />
        <rect x="29" y="22" width="28" height="5" rx="0.5" fill="white" opacity=".65" />
        <rect x="29" y="30" width="20" height="2.5" rx="0.5" fill="white" opacity=".2" />
        <rect x="29" y="35" width="14" height="1.5" rx="0.5" fill="white" opacity=".12" />
        <line x1="0" y1="42" x2="80" y2="42" stroke="white" strokeWidth="0.3" opacity=".12" />
        <rect x="0" y="42" width="20" height="8" fill="#181818" />
        <rect x="0.3" y="42.3" width="19.4" height="7.4" fill="#181818" stroke="white" strokeWidth="0.15" opacity=".1" />
        <rect x="20" y="42" width="20" height="8" fill="#181818" />
        <rect x="40" y="42" width="20" height="8" fill="#181818" />
        <rect x="60" y="42" width="20" height="8" fill="#181818" />
        <line x1="20" y1="42" x2="20" y2="50" stroke="white" strokeWidth="0.3" opacity=".12" />
        <line x1="40" y1="42" x2="40" y2="50" stroke="white" strokeWidth="0.3" opacity=".12" />
        <line x1="60" y1="42" x2="60" y2="50" stroke="white" strokeWidth="0.3" opacity=".12" />
      </svg>
    ),
  },
  {
    id: 'catalogo',
    name: 'Catálogo',
    description: 'Marco negro, título enorme, grid de celdas',
    thumb: (
      <svg viewBox="0 0 80 50" className="w-full" aria-hidden>
        <rect width="80" height="50" rx="4" fill="white" />
        <rect x="2" y="2" width="76" height="46" rx="2" fill="none" stroke="black" strokeWidth="2" />
        <rect x="3" y="3" width="75" height="7" fill="#1a1a1a" opacity=".05" />
        <rect x="6" y="5" width="18" height="3" rx="1" fill="#1a1a1a" opacity=".7" />
        <rect x="5" y="14" width="44" height="6" rx="0.5" fill="#1a1a1a" />
        <rect x="5" y="22" width="28" height="2.5" rx="0.5" fill="#1a1a1a" opacity=".25" />
        <line x1="2" y1="28" x2="78" y2="28" stroke="black" strokeWidth="1" />
        <rect x="2" y="28" width="15" height="5" fill="black" />
        <line x1="17" y1="28" x2="17" y2="33" stroke="black" strokeWidth="0.5" />
        <line x1="31.5" y1="28" x2="31.5" y2="33" stroke="black" strokeWidth="0.5" />
        <line x1="2" y1="33" x2="78" y2="33" stroke="black" strokeWidth="1" />
        <rect x="2" y="33" width="18" height="8" fill="#f0f0f0" />
        <rect x="21" y="33" width="18" height="8" fill="#f0f0f0" />
        <rect x="40" y="33" width="18" height="8" fill="#f0f0f0" />
        <rect x="59" y="33" width="19" height="8" fill="#f0f0f0" />
        <line x1="20" y1="33" x2="20" y2="41" stroke="black" strokeWidth="0.5" />
        <line x1="39" y1="33" x2="39" y2="41" stroke="black" strokeWidth="0.5" />
        <line x1="58" y1="33" x2="58" y2="41" stroke="black" strokeWidth="0.5" />
        <line x1="2" y1="41" x2="78" y2="41" stroke="black" strokeWidth="0.3" />
        <rect x="2" y="41" width="18" height="7" fill="#f0f0f0" />
        <rect x="21" y="41" width="18" height="7" fill="#f0f0f0" />
        <rect x="40" y="41" width="18" height="7" fill="#f0f0f0" />
        <rect x="59" y="41" width="19" height="7" fill="#f0f0f0" />
      </svg>
    ),
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Panel de registro + hero y productos',
    thumb: (
      <svg viewBox="0 0 80 50" className="w-full" aria-hidden>
        <rect width="80" height="50" rx="4" fill="white" />
        <line x1="0" y1="8" x2="80" y2="8" stroke="#e0e0e0" strokeWidth="0.6" />
        <rect x="3" y="3" width="14" height="3" rx="1" fill="#1a1a1a" opacity=".8" />
        <rect x="55" y="3.5" width="8" height="2" rx="1" fill="#999" opacity=".4" />
        <rect x="65" y="3.5" width="12" height="2" rx="1" fill="#1a1a1a" opacity=".5" />
        <line x1="28" y1="8" x2="28" y2="50" stroke="#e8e8e8" strokeWidth="0.6" />
        <rect x="3" y="12" width="7" height="1.5" rx="0.75" fill="#bbb" opacity=".6" />
        <rect x="3" y="16" width="20" height="3" rx="0.5" fill="#1a1a1a" opacity=".75" />
        <rect x="3" y="21" width="14" height="1.5" rx="0.75" fill="#bbb" opacity=".4" />
        <line x1="3" y1="25" x2="25" y2="25" stroke="#e0e0e0" strokeWidth="0.5" />
        <rect x="3" y="28" width="22" height="3.5" rx="0.5" fill="#f0f0f0" />
        <rect x="3" y="33.5" width="22" height="3.5" rx="0.5" fill="#f0f0f0" />
        <rect x="3" y="39" width="22" height="5" rx="0.5" fill="#1a1a1a" opacity=".7" />
        <rect x="28" y="8" width="52" height="20" fill="#e0e0e0" />
        <line x1="28" y1="28" x2="80" y2="28" stroke="#e8e8e8" strokeWidth="0.6" />
        <rect x="30" y="30" width="11" height="9" fill="#f5f5f5" />
        <rect x="43" y="30" width="11" height="9" fill="#f5f5f5" />
        <rect x="56" y="30" width="11" height="9" fill="#f5f5f5" />
        <rect x="30" y="41" width="11" height="7" fill="#f5f5f5" />
        <rect x="43" y="41" width="11" height="7" fill="#f5f5f5" />
        <rect x="56" y="41" width="11" height="7" fill="#f5f5f5" />
      </svg>
    ),
  },
];

interface StudioWorkspaceProps {
  initialBundle: ClientBundle;
  userEmail: string;
}

type ProductForm = {
  sku: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  detailsText: string;
};

const emptyProductForm: ProductForm = {
  sku: '',
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  detailsText: '',
};

const leadStages: Array<{ value: LeadStatus; label: string }> = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'cotizado', label: 'Cotizado' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
];

export default function StudioWorkspace({
  initialBundle,
  userEmail,
}: StudioWorkspaceProps) {
  const router = useRouter();
  const [bundle, setBundle] = useState(initialBundle);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [uploading, setUploading] = useState('');
  const [leadView, setLeadView] = useState<'tabla' | 'kanban'>('tabla');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: initialBundle.client.name,
    logoUrl: initialBundle.client.logoUrl || '',
    contactName: initialBundle.client.contact.name || '',
    contactEmail: initialBundle.client.contact.email || '',
    contactPhone: initialBundle.client.contact.phone || '',
    website: initialBundle.client.contact.website || '',
    location: initialBundle.client.contact.location || '',
    primaryColor: initialBundle.client.theme.primaryColor,
    accentColor: initialBundle.client.theme.accentColor,
    backgroundColor: initialBundle.client.theme.backgroundColor,
    textColor: initialBundle.client.theme.textColor,
    crmProvider: initialBundle.client.integrations.crmProvider || '',
    crmNotes: initialBundle.client.integrations.crmNotes || '',
  });
  const [eventForm, setEventForm] = useState({
    title: initialBundle.eventPage.title,
    subtitle: initialBundle.eventPage.subtitle || '',
    location: initialBundle.eventPage.location || '',
    eventDate: initialBundle.eventPage.eventDate || '',
    intro: initialBundle.eventPage.intro || '',
    ctaLabel: initialBundle.eventPage.ctaLabel,
    heroImageUrl: initialBundle.eventPage.settings.heroImageUrl || '',
    leadFormTitle: initialBundle.eventPage.settings.leadFormTitle || '',
    layoutTemplate: (initialBundle.eventPage.settings.layoutTemplate ?? 'coleccion') as 'coleccion' | 'galeria' | 'catalogo' | 'terminal',
  });
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [previewTemplateId, setPreviewTemplateId] = useState<LayoutTemplate | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const previewHref = `/c/${bundle.eventPage.slug}?preview=1`;
  const publicHref = `/c/${bundle.eventPage.slug}`;
  const isPublished = bundle.eventPage.status === 'published';
  const productNamesById = useMemo(
    () =>
      bundle.products.reduce((products, product) => {
        products[product.id] = product.name;
        return products;
      }, {} as Record<string, string>),
    [bundle.products]
  );
  const selectedLead = useMemo(
    () => bundle.leads.find((lead) => lead.id === selectedLeadId) || null,
    [bundle.leads, selectedLeadId]
  );

  const fetchLeads = useCallback(async (showLoading: boolean) => {
    if (showLoading) setIsRefreshingLeads(true);

    try {
      const response = await fetch('/api/studio/leads');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'No se pudieron actualizar los prospectos.');
      }

      setBundle((current) => {
        const incoming: string = JSON.stringify(result.leads);
        const existing: string = JSON.stringify(current.leads);
        if (incoming === existing) return current;
        return { ...current, leads: result.leads, leadCount: result.leads.length };
      });
    } catch (refreshError) {
      if (showLoading) {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : 'No se pudieron actualizar los prospectos.'
        );
      }
    } finally {
      if (showLoading) setIsRefreshingLeads(false);
    }
  }, []);

  const refreshLeads = useCallback(() => fetchLeads(true), [fetchLeads]);

  useEffect(() => {
    const interval = window.setInterval(() => { void fetchLeads(false); }, 5000);

    return () => window.clearInterval(interval);
  }, [fetchLeads]);

  async function updateLead(
    leadId: string,
    input: { status?: LeadStatus; notes?: string }
  ) {
    setUpdatingLeadId(leadId);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/studio/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'No se pudo actualizar el prospecto.');
      }

      setBundle((current) => ({
        ...current,
        leads: current.leads.map((lead) =>
          lead.id === leadId ? result.lead : lead
        ),
      }));
      setMessage('Prospecto actualizado.');
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudo actualizar el prospecto.'
      );
    } finally {
      setUpdatingLeadId(null);
    }
  }

  async function patchJson(url: string, body: unknown) {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'No se pudo guardar.');
    if (result.bundle) setBundle(result.bundle);
    return result;
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

  async function uploadAsset(file: File, kind: 'logos' | 'products' | 'event-pages') {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('kind', kind);
    setUploading(kind);
    setError('');

    try {
      const response = await fetch('/api/studio/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      return result.url as string;
    } finally {
      setUploading('');
    }
  }

  async function saveBranding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingBrand(true);
    setError('');
    setMessage('');

    try {
      await patchJson('/api/studio/branding', {
        name: brandForm.name,
        logoUrl: brandForm.logoUrl,
        theme: {
          primaryColor: brandForm.primaryColor,
          accentColor: brandForm.accentColor,
          backgroundColor: brandForm.backgroundColor,
          textColor: brandForm.textColor,
        },
        contact: {
          name: brandForm.contactName,
          email: brandForm.contactEmail,
          phone: brandForm.contactPhone,
          website: brandForm.website,
          location: brandForm.location,
        },
        integrations: {
          crmProvider: brandForm.crmProvider,
          crmNotes: brandForm.crmNotes,
          stripeAccountMode: bundle.client.integrations.stripeAccountMode || 'not_configured',
        },
      });
      setMessage('Identidad de marca guardada.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la identidad de marca.');
    } finally {
      setIsSavingBrand(false);
    }
  }

  async function saveEventPage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingEvent(true);
    setError('');
    setMessage('');

    try {
      await patchJson('/api/studio/event-page', {
        title: eventForm.title,
        subtitle: eventForm.subtitle,
        location: eventForm.location,
        eventDate: eventForm.eventDate,
        intro: eventForm.intro,
        ctaLabel: eventForm.ctaLabel,
        settings: {
          ...bundle.eventPage.settings,
          heroImageUrl: eventForm.heroImageUrl,
          leadFormTitle: eventForm.leadFormTitle,
          layoutTemplate: eventForm.layoutTemplate,
        },
      });
      setMessage('Página del evento guardada.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la página del evento.');
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingProduct(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/studio/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: productForm.sku,
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          currency: 'MXN',
          imageUrls: productForm.imageUrl ? [productForm.imageUrl] : [],
          details: parseDetails(productForm.detailsText),
          isActive: true,
        }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'No se pudo agregar el producto.');
      setBundle(result.bundle);
      setProductForm(emptyProductForm);
      setMessage('Producto agregado.');
    } catch (productError) {
      setError(productError instanceof Error ? productError.message : 'No se pudo agregar el producto.');
    } finally {
      setIsCreatingProduct(false);
    }
  }

  async function handleSelectTemplate(templateId: LayoutTemplate) {
    setIsSavingTemplate(true);
    setError('');
    setMessage('');

    try {
      await patchJson('/api/studio/event-page', {
        title: eventForm.title,
        subtitle: eventForm.subtitle,
        location: eventForm.location,
        eventDate: eventForm.eventDate,
        intro: eventForm.intro,
        ctaLabel: eventForm.ctaLabel,
        settings: {
          ...bundle.eventPage.settings,
          heroImageUrl: eventForm.heroImageUrl,
          leadFormTitle: eventForm.leadFormTitle,
          layoutTemplate: templateId,
        },
      });
      setEventForm((current) => ({ ...current, layoutTemplate: templateId }));
      setPreviewTemplateId(null);
      setMessage(`Plantilla "${TEMPLATE_DEFS.find((t) => t.id === templateId)?.name ?? templateId}" aplicada.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la plantilla.');
    } finally {
      setIsSavingTemplate(false);
    }
  }

  return (
    <div className="relative min-h-dvh bg-[#08071a] text-white" style={{ zoom: 1.1 }}>
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[900px] w-[900px] rounded-full bg-purple-700/20 blur-[160px]" />
        <div className="absolute -right-48 top-1/3 h-[700px] w-[700px] rounded-full bg-indigo-600/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/8 blur-[90px]" />
      </div>
      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8"
      >
        {/* Header */}
        <motion.header
          variants={fadeUp}
          className="flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/studio" className="overflow-hidden rounded-lg">
              <img
                src="/expo360_logo.png"
                alt="Logo"
                className="h-16 w-auto scale-[1.35] object-contain drop-shadow-[0_2px_16px_rgba(139,92,246,0.5)]"
              />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-300/70">
                Estudio
              </p>
              <h1 className="mt-1 text-3xl font-semibold">{bundle.client.name}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/40">
                Administra la página del evento, productos, vista previa y prospectos.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/40 backdrop-blur-sm">
              {userEmail}
            </span>
            <Link
              href={previewHref}
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 text-sm font-medium backdrop-blur-sm transition hover:border-purple-400/30 hover:text-purple-200 active:scale-[0.98]"
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} />
              Vista previa
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3.5 text-sm font-medium text-white/70 backdrop-blur-sm transition hover:border-red-400/30 hover:bg-red-500/8 hover:text-red-300 active:scale-[0.98]"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Salir
            </button>
          </div>
        </motion.header>

        <motion.section variants={fadeUp} className="grid gap-3 md:grid-cols-4">
          <StatusTile label="Marca" complete={Boolean(bundle.client.logoUrl || brandForm.logoUrl)} />
          <StatusTile label="Productos" complete={bundle.products.length > 0} />
          <StatusTile label="Vista previa" complete />
          <StatusTile label="Publicada" complete={isPublished} locked={!isPublished} />
        </motion.section>

        {message ? (
          <motion.div
            variants={fadeUp}
            className="rounded-xl border border-purple-400/20 bg-purple-500/8 px-3 py-2 text-sm text-purple-200/80"
          >
            {message}
          </motion.div>
        ) : null}

        {error ? (
          <motion.div
            variants={fadeUp}
            className="rounded-xl border border-red-400/20 bg-red-500/8 px-3 py-2 text-sm text-red-300/80"
          >
            {error}
          </motion.div>
        ) : null}

        {/* ── Step 1: Template Picker ── */}
        <motion.section variants={fadeUp} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-300/70">Paso 1</p>
              <h2 className="mt-1 text-2xl font-semibold">Elige tu plantilla</h2>
              <p className="mt-1 text-sm text-white/40">Esta es la base visual de tu página de evento. Haz clic para ver una vista previa.</p>
            </div>
            <p className="text-sm text-white/30">
              Activa:{' '}
              <span className="font-semibold text-purple-300">
                {TEMPLATE_DEFS.find((t) => t.id === eventForm.layoutTemplate)?.name ?? eventForm.layoutTemplate}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEMPLATE_DEFS.map((tpl) => {
              const isActive = eventForm.layoutTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setPreviewTemplateId(tpl.id)}
                  className={`group relative rounded-2xl border p-2 text-left transition ${
                    isActive
                      ? 'border-purple-400/60 bg-purple-500/10 shadow-[0_0_0_1px_rgba(167,139,250,0.3)]'
                      : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6'
                  }`}
                >
                  <div className="overflow-hidden rounded-lg">{tpl.thumb}</div>
                  <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-purple-300' : 'text-white/70'}`}>{tpl.name}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-white/35">{tpl.description}</p>
                  {isActive && (
                    <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] text-white">✓</span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Ver vista previa
                  </span>
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.div variants={fadeUp}>
          <LeadWorkspace
            leads={bundle.leads}
            productsById={productNamesById}
            selectedLead={selectedLead}
            leadView={leadView}
            isRefreshing={isRefreshingLeads}
            updatingLeadId={updatingLeadId}
            draggedLeadId={draggedLeadId}
            onRefresh={refreshLeads}
            onViewChange={setLeadView}
            onSelectLead={(lead) => setSelectedLeadId(lead.id)}
            onCloseLead={() => setSelectedLeadId(null)}
            onUpdateLead={updateLead}
            onDragLead={setDraggedLeadId}
            onDropLead={(status) => {
              if (!draggedLeadId) return;
              void updateLead(draggedLeadId, { status });
              setDraggedLeadId(null);
            }}
          />
        </motion.div>

        <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <Panel title="Identidad de marca">
              <form onSubmit={saveBranding} className="grid gap-4 md:grid-cols-2">
                <Input label="Nombre de la empresa" value={brandForm.name} onChange={(value) => setBrandForm((current) => ({ ...current, name: value }))} />
                <Input label="Nombre de contacto" value={brandForm.contactName} onChange={(value) => setBrandForm((current) => ({ ...current, contactName: value }))} />
                <Input label="Correo de contacto" type="email" value={brandForm.contactEmail} onChange={(value) => setBrandForm((current) => ({ ...current, contactEmail: value }))} />
                <Input label="Teléfono de contacto" value={brandForm.contactPhone} onChange={(value) => setBrandForm((current) => ({ ...current, contactPhone: value }))} />
                <Input label="Sitio web" value={brandForm.website} onChange={(value) => setBrandForm((current) => ({ ...current, website: value }))} />
                <Input label="Ubicación" value={brandForm.location} onChange={(value) => setBrandForm((current) => ({ ...current, location: value }))} />
                <ColorInput label="Color principal" value={brandForm.primaryColor} onChange={(value) => setBrandForm((current) => ({ ...current, primaryColor: value }))} />
                <ColorInput label="Color de acento" value={brandForm.accentColor} onChange={(value) => setBrandForm((current) => ({ ...current, accentColor: value }))} />
                <ColorInput label="Fondo de la página" value={brandForm.backgroundColor} onChange={(value) => setBrandForm((current) => ({ ...current, backgroundColor: value }))} />
                <ColorInput label="Color de texto" value={brandForm.textColor} onChange={(value) => setBrandForm((current) => ({ ...current, textColor: value }))} />
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="text-sm font-medium text-[#374151]">Logo</span>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={brandForm.logoUrl}
                        onChange={(event) => setBrandForm((current) => ({ ...current, logoUrl: event.target.value }))}
                        placeholder="Sube o pega la URL del logo"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-white/7 bg-white/6 px-3 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/12"
                      />
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d8d1c2] px-3 text-sm font-medium transition hover:border-[#155e75]">
                        <ImagePlus className="h-4 w-4" />
                        {uploading === 'logos' ? 'Subiendo...' : 'Subir'}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await uploadAsset(file, 'logos');
                              setBrandForm((current) => ({ ...current, logoUrl: url }));
                            } catch (uploadError) {
                              setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir el archivo.');
                            }
                          }}
                        />
                      </label>
                    </div>
                  </label>
                </div>
                <TextArea label="Notas de CRM" value={brandForm.crmNotes} onChange={(value) => setBrandForm((current) => ({ ...current, crmNotes: value }))} />
                <Input label="CRM previsto" value={brandForm.crmProvider} onChange={(value) => setBrandForm((current) => ({ ...current, crmProvider: value }))} />
                <div className="md:col-span-2">
                  <SaveButton saving={isSavingBrand} label="Guardar identidad" />
                </div>
              </form>
            </Panel>

            <Panel title="Página del evento">
              <form onSubmit={saveEventPage} className="grid gap-4 md:grid-cols-2">
                <Input label="Título" value={eventForm.title} onChange={(value) => setEventForm((current) => ({ ...current, title: value }))} />
                <Input label="Subtítulo" value={eventForm.subtitle} onChange={(value) => setEventForm((current) => ({ ...current, subtitle: value }))} />
                <Input label="Ubicación" value={eventForm.location} onChange={(value) => setEventForm((current) => ({ ...current, location: value }))} />
                <Input label="Fecha del evento" value={eventForm.eventDate} onChange={(value) => setEventForm((current) => ({ ...current, eventDate: value }))} />
                <Input label="Texto del botón" value={eventForm.ctaLabel} onChange={(value) => setEventForm((current) => ({ ...current, ctaLabel: value }))} />
                <Input label="Título del formulario" value={eventForm.leadFormTitle} onChange={(value) => setEventForm((current) => ({ ...current, leadFormTitle: value }))} />
                <div className="md:col-span-2">
                  <TextArea label="Texto introductorio" value={eventForm.intro} onChange={(value) => setEventForm((current) => ({ ...current, intro: value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="text-sm font-medium text-[#374151]">Imagen principal</span>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={eventForm.heroImageUrl}
                        onChange={(event) => setEventForm((current) => ({ ...current, heroImageUrl: event.target.value }))}
                        placeholder="Sube o pega la URL de la imagen"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-white/7 bg-white/6 px-3 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/12"
                      />
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d8d1c2] px-3 text-sm font-medium transition hover:border-[#155e75]">
                        <ImagePlus className="h-4 w-4" />
                        {uploading === 'event-pages' ? 'Subiendo...' : 'Subir'}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await uploadAsset(file, 'event-pages');
                              setEventForm((current) => ({ ...current, heroImageUrl: url }));
                            } catch (uploadError) {
                              setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir el archivo.');
                            }
                          }}
                        />
                      </label>
                    </div>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-medium text-white/70">Plantilla de diseño</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {TEMPLATE_DEFS.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setEventForm((current) => ({ ...current, layoutTemplate: tpl.id }))}
                        className={`group relative rounded-2xl border p-2 text-left transition ${
                          eventForm.layoutTemplate === tpl.id
                            ? 'border-purple-400/60 bg-purple-500/10 shadow-[0_0_0_1px_rgba(167,139,250,0.3)]'
                            : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
                        }`}
                      >
                        <div className="overflow-hidden rounded-lg">{tpl.thumb}</div>
                        <p className={`mt-2 text-xs font-semibold ${
                          eventForm.layoutTemplate === tpl.id ? 'text-purple-300' : 'text-white/70'
                        }`}>{tpl.name}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-white/35">{tpl.description}</p>
                        {eventForm.layoutTemplate === tpl.id && (
                          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] text-white">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <SaveButton saving={isSavingEvent} label="Guardar página del evento" />
                </div>
              </form>
            </Panel>

            <Panel title="Productos">
              <form onSubmit={createProduct} className="grid gap-4 md:grid-cols-2">
                <Input label="SKU" value={productForm.sku} onChange={(value) => setProductForm((current) => ({ ...current, sku: value }))} />
                <Input label="Nombre del producto" value={productForm.name} onChange={(value) => setProductForm((current) => ({ ...current, name: value }))} required />
                <Input label="Precio" value={productForm.price} onChange={(value) => setProductForm((current) => ({ ...current, price: value }))} placeholder="$0 MXN" />
                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-[#374151]">Imagen del producto</span>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={productForm.imageUrl}
                        onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))}
                        placeholder="Sube o pega la URL"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-white/7 bg-white/6 px-3 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/12"
                      />
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-[#d8d1c2] px-3 transition hover:border-[#155e75]" aria-label="Upload product image">
                        <ImagePlus className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await uploadAsset(file, 'products');
                              setProductForm((current) => ({ ...current, imageUrl: url }));
                            } catch (uploadError) {
                              setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir el archivo.');
                            }
                          }}
                        />
                      </label>
                    </div>
                  </label>
                </div>
                <TextArea label="Descripción" value={productForm.description} onChange={(value) => setProductForm((current) => ({ ...current, description: value }))} />
                <TextArea label="Detalles" value={productForm.detailsText} onChange={(value) => setProductForm((current) => ({ ...current, detailsText: value }))} placeholder="Material: Encino&#10;Tiempo de entrega: 4 semanas" />
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isCreatingProduct}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.5)] transition hover:bg-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PackagePlus className="h-4 w-4" strokeWidth={1.5} />
                    {isCreatingProduct ? 'Agregando...' : 'Agregar producto'}
                  </button>
                </div>
              </form>

              <div className="mt-6 grid gap-4">
                {bundle.products.length === 0 ? (
                  <p className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm text-white/40">
                    Agrega algunos productos destacados para que la página del evento se sienta lista.
                  </p>
                ) : (
                  bundle.products.map((product) => (
                    <ProductEditor
                      key={product.id}
                      product={product}
                      onBundle={setBundle}
                      onError={setError}
                    />
                  ))
                )}
              </div>
            </Panel>
          </div>

          <aside className="space-y-6">
            <Panel title="Publicación">
              <div className="space-y-4">
                <div className={`rounded-xl border px-3 py-3 text-sm ${isPublished ? 'border-purple-400/20 bg-purple-500/8 text-purple-200/80' : 'border-orange-400/20 bg-orange-500/8 text-orange-300/80'}`}>
                  {isPublished
                    ? 'La página del evento ya está visible para visitantes.'
                    : 'La página está bloqueada hasta que Interzekt la publique desde el panel maestro.'}
                </div>
                <div className="space-y-2 text-sm">
                  <Link href={previewHref} target="_blank" className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2 font-medium backdrop-blur-sm transition hover:border-purple-400/30 hover:text-purple-200">
                    Vista previa autenticada
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                  <Link href={publicHref} target="_blank" className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2 font-medium backdrop-blur-sm transition hover:border-purple-400/30 hover:text-purple-200">
                    URL pública
                    {isPublished ? <CheckCircle2 className="h-4 w-4 text-purple-300" strokeWidth={1.5} /> : <Lock className="h-4 w-4 text-red-400/70" strokeWidth={1.5} />}
                  </Link>
                </div>
              </div>
            </Panel>
          </aside>
        </motion.section>
      </motion.div>

      {previewTemplateId ? (
        <TemplatePreviewModal
          template={TEMPLATE_DEFS.find((t) => t.id === previewTemplateId)!}
          isActive={eventForm.layoutTemplate === previewTemplateId}
          isSaving={isSavingTemplate}
          onSelect={() => void handleSelectTemplate(previewTemplateId)}
          onClose={() => setPreviewTemplateId(null)}
        />
      ) : null}
    </div>
  );
}

function LeadWorkspace({
  leads,
  productsById,
  selectedLead,
  leadView,
  isRefreshing,
  updatingLeadId,
  draggedLeadId,
  onRefresh,
  onViewChange,
  onSelectLead,
  onCloseLead,
  onUpdateLead,
  onDragLead,
  onDropLead,
}: {
  leads: Lead[];
  productsById: Record<string, string>;
  selectedLead: Lead | null;
  leadView: 'tabla' | 'kanban';
  isRefreshing: boolean;
  updatingLeadId: string | null;
  draggedLeadId: string | null;
  onRefresh: () => void;
  onViewChange: (view: 'tabla' | 'kanban') => void;
  onSelectLead: (lead: Lead) => void;
  onCloseLead: () => void;
  onUpdateLead: (
    leadId: string,
    input: { status?: LeadStatus; notes?: string }
  ) => Promise<void>;
  onDragLead: (leadId: string | null) => void;
  onDropLead: (status: LeadStatus) => void;
}) {
  const leadsByStage = useMemo(
    () =>
      leadStages.reduce((groups, stage) => {
        groups[stage.value] = leads.filter((lead) => lead.status === stage.value);
        return groups;
      }, {} as Record<LeadStatus, Lead[]>),
    [leads]
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-300/70">
            Prospectos
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Seguimiento de prospectos</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Visualiza, clasifica y exporta los contactos capturados desde la página del evento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-white/8 bg-white/4 p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => onViewChange('tabla')}
              className={`inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
                leadView === 'tabla' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'
              }`}
            >
              <Table2 className="h-4 w-4" strokeWidth={1.5} />
              Tabla
            </button>
            <button
              type="button"
              onClick={() => onViewChange('kanban')}
              className={`inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
                leadView === 'kanban' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'
              }`}
            >
              <Columns3 className="h-4 w-4" strokeWidth={1.5} />
              Kanban
            </button>
          </div>
          <Link
            href="/api/studio/leads/export"
            prefetch={false}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 text-sm font-medium backdrop-blur-sm transition hover:border-purple-400/30 hover:text-purple-200 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Exportar CSV
          </Link>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.5)] transition hover:bg-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {leadStages.map((stage) => (
          <div key={stage.value} className="rounded-xl border border-white/8 bg-white/4 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              {stage.label}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {leadsByStage[stage.value]?.length || 0}
            </p>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-white/8 bg-white/4 p-8 text-center">
          <p className="font-semibold">Todavía no hay prospectos.</p>
          <p className="mt-2 text-sm text-white/40">
            Cuando alguien envíe el formulario público, aparecerá aquí automáticamente.
          </p>
        </div>
      ) : leadView === 'tabla' ? (
        <LeadTable
          leads={leads}
          productsById={productsById}
          updatingLeadId={updatingLeadId}
          onSelectLead={onSelectLead}
          onUpdateLead={onUpdateLead}
        />
      ) : (
        <LeadKanban
          leadsByStage={leadsByStage}
          productsById={productsById}
          draggedLeadId={draggedLeadId}
          updatingLeadId={updatingLeadId}
          onSelectLead={onSelectLead}
          onUpdateLead={onUpdateLead}
          onDragLead={onDragLead}
          onDropLead={onDropLead}
        />
      )}

      {selectedLead ? (
        <LeadDetailDrawer
          lead={selectedLead}
          productsById={productsById}
          updatingLeadId={updatingLeadId}
          onClose={onCloseLead}
          onUpdateLead={onUpdateLead}
        />
      ) : null}
    </section>
  );
}

function LeadTable({
  leads,
  productsById,
  updatingLeadId,
  onSelectLead,
  onUpdateLead,
}: {
  leads: Lead[];
  productsById: Record<string, string>;
  updatingLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (
    leadId: string,
    input: { status?: LeadStatus; notes?: string }
  ) => Promise<void>;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-white/8">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/4 text-xs font-semibold uppercase tracking-[0.08em] text-white/40">
            <tr>
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Nombre</th>
              <th className="px-3 py-3">Correo</th>
              <th className="px-3 py-3">Teléfono</th>
              <th className="px-3 py-3">Empresa</th>
              <th className="px-3 py-3">Productos de interés</th>
              <th className="px-3 py-3">Etapa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="cursor-pointer transition hover:bg-white/4"
                onClick={() => onSelectLead(lead)}
              >
                <td className="whitespace-nowrap px-3 py-3 text-white/40">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-3 py-3 font-medium">{lead.fullName}</td>
                <td className="px-3 py-3 text-white/50">{lead.email}</td>
                <td className="px-3 py-3 text-white/50">{lead.phone || '-'}</td>
                <td className="px-3 py-3 text-white/50">{lead.company || '-'}</td>
                <td className="px-3 py-3 text-white/50">
                  {productNamesForLead(lead, productsById).join(', ') || '-'}
                </td>
                <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                  <LeadStatusSelect
                    value={lead.status}
                    disabled={updatingLeadId === lead.id}
                    onChange={(status) => void onUpdateLead(lead.id, { status })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadKanban({
  leadsByStage,
  productsById,
  draggedLeadId,
  updatingLeadId,
  onSelectLead,
  onUpdateLead,
  onDragLead,
  onDropLead,
}: {
  leadsByStage: Record<LeadStatus, Lead[]>;
  productsById: Record<string, string>;
  draggedLeadId: string | null;
  updatingLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (
    leadId: string,
    input: { status?: LeadStatus; notes?: string }
  ) => Promise<void>;
  onDragLead: (leadId: string | null) => void;
  onDropLead: (status: LeadStatus) => void;
}) {
  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-5">
      {leadStages.map((stage) => (
        <div
          key={stage.value}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => onDropLead(stage.value)}
          className={`min-h-64 rounded-xl border border-white/8 bg-white/4 p-3 ${
            draggedLeadId ? 'ring-2 ring-purple-400/20' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{stage.label}</h3>
            <span className="rounded-lg border border-white/8 bg-white/4 px-2 py-1 text-xs text-white/40">
              {leadsByStage[stage.value]?.length || 0}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {(leadsByStage[stage.value] || []).map((lead) => (
              <article
                key={lead.id}
                draggable
                onDragStart={() => onDragLead(lead.id)}
                onDragEnd={() => onDragLead(null)}
                onClick={() => onSelectLead(lead)}
                className="cursor-grab rounded-xl border border-white/8 bg-white/4 p-3 shadow-sm transition hover:border-purple-400/30 hover:bg-white/6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="mt-1 text-xs text-white/40">{formatDate(lead.createdAt)}</p>
                  </div>
                  {updatingLeadId === lead.id ? (
                    <span className="text-xs text-purple-300/70">Guardando...</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-white/50">{lead.email}</p>
                {lead.phone ? (
                  <p className="mt-1 text-sm text-white/50">{lead.phone}</p>
                ) : null}
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">
                  {productNamesForLead(lead, productsById).join(', ') || 'Sin productos seleccionados'}
                </p>
                <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                  <LeadStatusSelect
                    value={lead.status}
                    disabled={updatingLeadId === lead.id}
                    onChange={(status) => void onUpdateLead(lead.id, { status })}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadDetailDrawer({
  lead,
  productsById,
  updatingLeadId,
  onClose,
  onUpdateLead,
}: {
  lead: Lead;
  productsById: Record<string, string>;
  updatingLeadId: string | null;
  onClose: () => void;
  onUpdateLead: (
    leadId: string,
    input: { status?: LeadStatus; notes?: string }
  ) => Promise<void>;
}) {
  const [notes, setNotes] = useState(lead.notes || '');

  useEffect(() => {
    setNotes(lead.notes || '');
  }, [lead.id, lead.notes]);

  const isSaving = updatingLeadId === lead.id;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col border-l border-white/8 bg-[#08071a]/95 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/8 p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-300/70">
              Detalle del prospecto
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{lead.fullName}</h2>
            <p className="mt-1 text-sm text-white/40">{formatDate(lead.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/60 transition hover:border-red-400/30 hover:text-red-300 active:scale-[0.98]"
            aria-label="Cerrar detalle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <LeadInfo icon={<Mail className="h-4 w-4" />} label="Correo" value={lead.email} />
            <LeadInfo icon={<Phone className="h-4 w-4" />} label="Teléfono" value={lead.phone || '-'} />
            <LeadInfo label="Empresa" value={lead.company || '-'} />
            <LeadInfo label="Página origen" value={`/c/${lead.sourceSlug}`} />
          </div>

          <div>
            <label className="text-sm font-medium text-white/50">Etapa</label>
            <div className="mt-2 max-w-xs">
              <LeadStatusSelect
                value={lead.status}
                disabled={isSaving}
                onChange={(status) => void onUpdateLead(lead.id, { status })}
              />
            </div>
          </div>

          <section className="rounded-xl border border-white/8 bg-white/4 p-4">
            <h3 className="font-semibold">Productos de interés</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {productNamesForLead(lead, productsById).length > 0 ? (
                productNamesForLead(lead, productsById).map((productName) => (
                  <span key={productName} className="rounded-lg border border-white/8 bg-white/4 px-2 py-1 text-sm text-white/70">
                    {productName}
                  </span>
                ))
              ) : (
                <p className="text-sm text-white/40">Sin productos seleccionados.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-300/70" strokeWidth={1.5} />
              <h3 className="font-semibold">Mensaje</h3>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/50">
              {lead.message || 'Sin mensaje.'}
            </p>
          </section>

          <label className="block">
            <span className="text-sm font-medium text-white/50">Notas internas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              className="mt-2 w-full resize-y rounded-xl border border-white/7 bg-white/6 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/12"
              placeholder="Agrega notas de seguimiento para tu equipo."
            />
          </label>
        </div>

        <div className="border-t border-white/8 p-5">
          <button
            type="button"
            onClick={() => void onUpdateLead(lead.id, { notes })}
            disabled={isSaving}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.5)] transition hover:bg-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar notas'}
          </button>
        </div>
      </aside>
    </div>
  );
}

function LeadInfo({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
        {icon}
        {label}
      </div>
      <p className="mt-2 wrap-break-word text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function LeadStatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as LeadStatus)}
      className="h-9 w-full rounded-xl border border-white/7 bg-white/6 px-2 text-sm text-white outline-none transition focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/12 disabled:cursor-not-allowed disabled:opacity-60 [&>option]:bg-[#0f0e2a] [&>option]:text-white"
    >
      {leadStages.map((stage) => (
        <option key={stage.value} value={stage.value}>
          {stage.label}
        </option>
      ))}
    </select>
  );
}

function productNamesForLead(lead: Lead, productsById: Record<string, string>) {
  return lead.selectedProductIds
    .map((productId) => productsById[productId] || productId)
    .filter(Boolean);
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function ProductEditor({
  product,
  onBundle,
  onError,
}: {
  product: Product;
  onBundle: (bundle: ClientBundle) => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState({
    sku: product.sku || '',
    name: product.name,
    description: product.description || '',
    price: product.price || '',
    imageUrl: product.imageUrls[0] || '',
    isActive: product.isActive,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function saveProduct() {
    setIsSaving(true);
    onError('');
    try {
      const response = await fetch(`/api/studio/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          description: form.description,
          price: form.price,
          imageUrls: form.imageUrl ? [form.imageUrl] : [],
          isActive: form.isActive,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el producto.');
      onBundle(result.bundle);
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeProduct() {
    setIsSaving(true);
    onError('');
    try {
      const response = await fetch(`/api/studio/products/${product.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo eliminar el producto.');
      onBundle(result.bundle);
    } catch (deleteError) {
      onError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el producto.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-white/8 bg-white/4 p-3 md:grid-cols-[96px_1fr]">
      <div className="aspect-square overflow-hidden rounded-xl border border-white/8 bg-white/4">
        {form.imageUrl ? (
          <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="SKU" value={form.sku} onChange={(value) => setForm((current) => ({ ...current, sku: value }))} />
        <Input label="Nombre" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
        <Input label="Precio" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} />
        <Input label="URL de imagen" value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))} />
        <div className="md:col-span-2">
          <TextArea label="Descripción" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, isActive: !current.isActive }))}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 text-sm font-medium backdrop-blur-sm transition hover:border-purple-400/30 hover:text-purple-200 active:scale-[0.98]"
          >
            {form.isActive ? <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> : <Lock className="h-4 w-4" strokeWidth={1.5} />}
            {form.isActive ? 'Visible' : 'Oculto'}
          </button>
          <button
            type="button"
            onClick={saveProduct}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-purple-600 px-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.5)] transition hover:bg-purple-500 active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            Guardar
          </button>
          <button
            type="button"
            onClick={removeProduct}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/8 px-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 active:scale-[0.98] disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusTile({
  label,
  complete,
  locked,
}: {
  label: string;
  complete: boolean;
  locked?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/40">{label}</p>
        {locked ? (
          <Lock className="h-4 w-4 text-red-400/70" strokeWidth={1.5} />
        ) : complete ? (
          <CheckCircle2 className="h-4 w-4 text-purple-300" strokeWidth={1.5} />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        )}
      </div>
      <p className="mt-2 text-sm font-semibold">{complete ? 'Listo' : 'Pendiente'}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
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
      <span className="text-sm font-medium text-white/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-10 w-full rounded-xl border border-white/7 bg-white/6 px-3 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/12"
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white/50">{label}</span>
      <span className="mt-2 flex h-10 overflow-hidden rounded-xl border border-white/7 bg-white/6">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 border-0 bg-transparent p-1"
          aria-label={label}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none"
        />
      </span>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white/50">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y rounded-xl border border-white/7 bg-white/6 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/12"
      />
    </label>
  );
}

function SaveButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.5)] transition hover:bg-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save className="h-4 w-4" />
      {saving ? 'Guardando...' : label}
    </button>
  );
}

function parseDetails(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((details, line) => {
      const [key, ...rest] = line.split(':');
      if (key && rest.length > 0) {
        details[key.trim()] = rest.join(':').trim();
      }
      return details;
    }, {} as Record<string, string>);
}

function TemplatePreviewModal({
  template,
  isActive,
  isSaving,
  onSelect,
  onClose,
}: {
  template: TemplateDef;
  isActive: boolean;
  isSaving: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b1e] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-300/70">Vista previa</p>
            <h3 className="mt-0.5 text-xl font-semibold">{template.name}</h3>
            <p className="mt-0.5 text-sm text-white/40">{template.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/50 transition hover:bg-white/8 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Preview area */}
        <div className="px-5 pt-5">
          {/* Browser chrome mock */}
          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-1.5 border-b border-white/8 bg-white/4 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 flex-1 rounded bg-white/8 px-2 py-0.5 text-[10px] text-white/25">expo360.io/c/tu-evento</span>
            </div>
            <div className="p-3">
              {template.thumb}
            </div>
            <div className="border-t border-white/8 bg-white/3 px-4 py-3 text-center text-xs text-white/30">
              Vista previa detallada próximamente
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 text-sm font-medium text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSelect}
            disabled={isSaving || isActive}
            className={`inline-flex h-9 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? 'border border-purple-400/40 bg-purple-500/15 text-purple-300'
                : 'bg-purple-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.5)] hover:bg-purple-500 active:scale-[0.98]'
            }`}
          >
            {isActive ? '✓ Plantilla activa' : isSaving ? 'Aplicando...' : 'Elegir esta plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
}
