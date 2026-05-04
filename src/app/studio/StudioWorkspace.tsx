'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  });
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);

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

  const refreshLeads = useCallback(async () => {
    setIsRefreshingLeads(true);

    try {
      const response = await fetch('/api/studio/leads');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'No se pudieron actualizar los prospectos.');
      }

      setBundle((current) => ({
        ...current,
        leads: result.leads,
        leadCount: result.leads.length,
      }));
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'No se pudieron actualizar los prospectos.'
      );
    } finally {
      setIsRefreshingLeads(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refreshLeads, 5000);

    return () => window.clearInterval(interval);
  }, [refreshLeads]);

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

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#111827]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d8d1c2] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#155e75]">
              Estudio
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{bundle.client.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4b5563]">
              Administra la página del evento, productos, vista previa y
              prospectos capturados desde un solo lugar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#d8d1c2] bg-white px-3 py-2 text-xs text-[#4b5563]">
              {userEmail}
            </span>
            <Link
              href={previewHref}
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d1c2] bg-white px-3 text-sm font-medium transition hover:border-[#155e75]"
            >
              <Eye className="h-4 w-4" />
              Vista previa
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#111827] px-3 text-sm font-medium text-white transition hover:bg-[#155e75]"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <StatusTile label="Marca" complete={Boolean(bundle.client.logoUrl || brandForm.logoUrl)} />
          <StatusTile label="Productos" complete={bundle.products.length > 0} />
          <StatusTile label="Vista previa" complete />
          <StatusTile label="Publicada" complete={isPublished} locked={!isPublished} />
        </section>

        {message ? (
          <div className="rounded-md border border-[#b7d7c7] bg-[#eef8f1] px-3 py-2 text-sm text-[#166534]">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
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
                        className="h-10 min-w-0 flex-1 rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#155e75] focus:ring-2 focus:ring-[#155e75]/15"
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
                        className="h-10 min-w-0 flex-1 rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#155e75] focus:ring-2 focus:ring-[#155e75]/15"
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
                        className="h-10 min-w-0 flex-1 rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none transition focus:border-[#155e75] focus:ring-2 focus:ring-[#155e75]/15"
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
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#155e75] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PackagePlus className="h-4 w-4" />
                    {isCreatingProduct ? 'Agregando...' : 'Agregar producto'}
                  </button>
                </div>
              </form>

              <div className="mt-6 grid gap-4">
                {bundle.products.length === 0 ? (
                  <p className="rounded-md bg-[#f4f1ea] p-4 text-sm text-[#6b7280]">
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
                <div className={`rounded-md border px-3 py-3 text-sm ${isPublished ? 'border-[#b7d7c7] bg-[#eef8f1] text-[#166534]' : 'border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]'}`}>
                  {isPublished
                    ? 'La página del evento ya está visible para visitantes.'
                    : 'La página está bloqueada hasta que Interzekt la publique desde el panel maestro.'}
                </div>
                <div className="space-y-2 text-sm">
                  <Link href={previewHref} target="_blank" className="flex items-center justify-between rounded-md border border-[#d8d1c2] px-3 py-2 font-medium transition hover:border-[#155e75]">
                    Vista previa autenticada
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link href={publicHref} target="_blank" className="flex items-center justify-between rounded-md border border-[#d8d1c2] px-3 py-2 font-medium transition hover:border-[#155e75]">
                    URL pública
                    {isPublished ? <CheckCircle2 className="h-4 w-4 text-[#166534]" /> : <Lock className="h-4 w-4 text-[#9a3412]" />}
                  </Link>
                </div>
              </div>
            </Panel>
          </aside>
        </section>
      </div>
    </main>
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
    <section className="rounded-lg border border-[#d8d1c2] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#155e75]">
            Prospectos
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Seguimiento de prospectos</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Visualiza, clasifica y exporta los contactos capturados desde la página del evento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-[#d8d1c2] bg-[#f8f5ef] p-1">
            <button
              type="button"
              onClick={() => onViewChange('tabla')}
              className={`inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-medium transition ${
                leadView === 'tabla' ? 'bg-white shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              <Table2 className="h-4 w-4" />
              Tabla
            </button>
            <button
              type="button"
              onClick={() => onViewChange('kanban')}
              className={`inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-medium transition ${
                leadView === 'kanban' ? 'bg-white shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              <Columns3 className="h-4 w-4" />
              Kanban
            </button>
          </div>
          <a
            href="/api/studio/leads/export"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d8d1c2] px-3 text-sm font-medium transition hover:border-[#155e75]"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </a>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-3 text-sm font-semibold text-white transition hover:bg-[#155e75] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {leadStages.map((stage) => (
          <div key={stage.value} className="rounded-md bg-[#f8f5ef] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
              {stage.label}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {leadsByStage[stage.value]?.length || 0}
            </p>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-[#d8d1c2] bg-[#f8f5ef] p-8 text-center">
          <p className="font-semibold">Todavía no hay prospectos.</p>
          <p className="mt-2 text-sm text-[#6b7280]">
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
    <div className="mt-5 overflow-hidden rounded-lg border border-[#e7e0d2]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f8f5ef] text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
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
          <tbody className="divide-y divide-[#ece6da]">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="cursor-pointer bg-white transition hover:bg-[#faf7f0]"
                onClick={() => onSelectLead(lead)}
              >
                <td className="whitespace-nowrap px-3 py-3 text-[#6b7280]">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-3 py-3 font-medium">{lead.fullName}</td>
                <td className="px-3 py-3 text-[#4b5563]">{lead.email}</td>
                <td className="px-3 py-3 text-[#4b5563]">{lead.phone || '-'}</td>
                <td className="px-3 py-3 text-[#4b5563]">{lead.company || '-'}</td>
                <td className="px-3 py-3 text-[#4b5563]">
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
          className={`min-h-64 rounded-lg border border-[#e7e0d2] bg-[#f8f5ef] p-3 ${
            draggedLeadId ? 'ring-2 ring-[#155e75]/20' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{stage.label}</h3>
            <span className="rounded bg-white px-2 py-1 text-xs text-[#6b7280]">
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
                className="cursor-grab rounded-lg border border-[#d8d1c2] bg-white p-3 shadow-sm transition hover:border-[#155e75]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="mt-1 text-xs text-[#6b7280]">{formatDate(lead.createdAt)}</p>
                  </div>
                  {updatingLeadId === lead.id ? (
                    <span className="text-xs text-[#155e75]">Guardando...</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-[#4b5563]">{lead.email}</p>
                {lead.phone ? (
                  <p className="mt-1 text-sm text-[#4b5563]">{lead.phone}</p>
                ) : null}
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#6b7280]">
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
    <div className="fixed inset-0 z-50 bg-black/30">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#e7e0d2] p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#155e75]">
              Detalle del prospecto
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{lead.fullName}</h2>
            <p className="mt-1 text-sm text-[#6b7280]">{formatDate(lead.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d8d1c2] transition hover:border-[#155e75]"
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
            <label className="text-sm font-medium text-[#374151]">Etapa</label>
            <div className="mt-2 max-w-xs">
              <LeadStatusSelect
                value={lead.status}
                disabled={isSaving}
                onChange={(status) => void onUpdateLead(lead.id, { status })}
              />
            </div>
          </div>

          <section className="rounded-lg border border-[#e7e0d2] p-4">
            <h3 className="font-semibold">Productos de interés</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {productNamesForLead(lead, productsById).length > 0 ? (
                productNamesForLead(lead, productsById).map((productName) => (
                  <span key={productName} className="rounded-md bg-[#f8f5ef] px-2 py-1 text-sm">
                    {productName}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">Sin productos seleccionados.</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[#e7e0d2] p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#155e75]" />
              <h3 className="font-semibold">Mensaje</h3>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
              {lead.message || 'Sin mensaje.'}
            </p>
          </section>

          <label className="block">
            <span className="text-sm font-medium text-[#374151]">Notas internas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              className="mt-2 w-full resize-y rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#155e75] focus:ring-2 focus:ring-[#155e75]/15"
              placeholder="Agrega notas de seguimiento para tu equipo."
            />
          </label>
        </div>

        <div className="border-t border-[#e7e0d2] p-5">
          <button
            type="button"
            onClick={() => void onUpdateLead(lead.id, { notes })}
            disabled={isSaving}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#155e75] disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="rounded-lg border border-[#e7e0d2] p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
        {icon}
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-medium">{value}</p>
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
      className="h-9 w-full rounded-md border border-[#d1d5db] bg-white px-2 text-sm outline-none transition focus:border-[#155e75] focus:ring-2 focus:ring-[#155e75]/15 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="grid gap-3 rounded-lg border border-[#e7e0d2] p-3 md:grid-cols-[96px_1fr]">
      <div className="aspect-square overflow-hidden rounded-md bg-[#f4f1ea]">
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
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d1c2] px-3 text-sm font-medium transition hover:border-[#155e75]"
          >
            {form.isActive ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {form.isActive ? 'Visible' : 'Oculto'}
          </button>
          <button
            type="button"
            onClick={saveProduct}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#111827] px-3 text-sm font-semibold text-white transition hover:bg-[#155e75] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
          <button
            type="button"
            onClick={removeProduct}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#f3f4f6] px-3 text-sm font-semibold text-[#991b1b] transition hover:bg-[#fee2e2] disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
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
    <div className="rounded-lg border border-[#d8d1c2] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#6b7280]">{label}</p>
        {locked ? (
          <Lock className="h-4 w-4 text-[#9a3412]" />
        ) : complete ? (
          <CheckCircle2 className="h-4 w-4 text-[#166534]" />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-[#d1d5db]" />
        )}
      </div>
      <p className="mt-2 text-sm font-semibold">{complete ? 'Listo' : 'Pendiente'}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#d8d1c2] bg-white p-5 shadow-sm">
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
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <span className="mt-2 flex h-10 overflow-hidden rounded-md border border-[#d1d5db] bg-white">
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
          className="min-w-0 flex-1 px-3 text-sm outline-none"
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
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#155e75] focus:ring-2 focus:ring-[#155e75]/15"
      />
    </label>
  );
}

function SaveButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#155e75] disabled:cursor-not-allowed disabled:opacity-60"
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
