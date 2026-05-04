import type { CSSProperties } from 'react';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { getClientBundleBySlug } from '@/lib/expo360/repositories';

import LeadCaptureForm from './LeadCaptureForm';

export const dynamic = 'force-dynamic';

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const bundle = await getClientBundleBySlug(slug, { includeDraft: true });

  if (!bundle) {
    return <UnavailablePage />;
  }

  const user = preview === '1' ? await getCurrentUserContext() : null;
  const canPreview =
    user?.role === 'interzekt_admin' ||
    (user?.role === 'smb_admin' && user.clientId === bundle.client.id);
  const isPublic = bundle.eventPage.status === 'published';

  if (!isPublic && !canPreview) {
    return <UnavailablePage clientName={bundle.client.name} />;
  }

  const theme = bundle.client.theme;
  const products = bundle.products.filter((product) => product.isActive);
  const pageStyle = {
    '--brand-primary': theme.primaryColor,
    '--brand-accent': theme.accentColor,
    '--brand-bg': theme.backgroundColor,
    '--brand-text': theme.textColor,
  } as CSSProperties;

  return (
    <main
      style={pageStyle}
      className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)]"
    >
      {canPreview && !isPublic ? (
        <div className="bg-[#111827] px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-white">
          Vista previa autenticada · aún no está publicada
        </div>
      ) : null}

      <section className="relative overflow-hidden">
        {bundle.eventPage.settings.heroImageUrl ? (
          <img
            src={bundle.eventPage.settings.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        ) : null}
        <div className="relative mx-auto grid min-h-[72vh] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            {bundle.client.logoUrl ? (
              <img
                src={bundle.client.logoUrl}
                alt={bundle.client.name}
                className="mb-8 max-h-20 max-w-56 object-contain"
              />
            ) : (
              <p className="mb-8 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                {bundle.client.name}
              </p>
            )}
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              {bundle.eventPage.title}
            </h1>
            {bundle.eventPage.subtitle ? (
              <p className="mt-5 max-w-2xl text-xl leading-8 opacity-80">
                {bundle.eventPage.subtitle}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {bundle.eventPage.location ? (
                <span className="rounded-md border border-current/20 bg-white/40 px-3 py-2">
                  {bundle.eventPage.location}
                </span>
              ) : null}
              {bundle.eventPage.eventDate ? (
                <span className="rounded-md border border-current/20 bg-white/40 px-3 py-2">
                  {bundle.eventPage.eventDate}
                </span>
              ) : null}
            </div>
          </div>

          <LeadCaptureForm
            slug={bundle.eventPage.slug}
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
            }))}
            title={bundle.eventPage.settings.leadFormTitle || 'Solicitar información'}
            buttonLabel={bundle.eventPage.ctaLabel || 'Solicitar información'}
          />
        </div>
      </section>

      <section className="border-y border-black/10 bg-white/50">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <p className="max-w-3xl text-lg leading-8">
            {bundle.eventPage.intro ||
              'Explora los productos destacados y solicita más información al equipo del evento.'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
              Productos destacados
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Catálogo del evento</h2>
          </div>
          <p className="text-sm opacity-70">{products.length} productos</p>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 rounded-lg border border-black/10 bg-white/60 p-6 text-sm opacity-70">
            Los productos de este evento se están preparando.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] bg-black/5">
                  {product.imageUrls[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.price ? (
                      <span className="shrink-0 text-sm font-semibold text-[var(--brand-primary)]">
                        {product.price}
                      </span>
                    ) : null}
                  </div>
                  {product.description ? (
                    <p className="mt-3 text-sm leading-6 opacity-70">
                      {product.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function UnavailablePage({ clientName }: { clientName?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-5 text-[#111827]">
      <section className="max-w-md rounded-lg border border-[#d8d1c2] bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Esta página del evento aún no está disponible.</h1>
        <p className="mt-3 text-sm leading-6 text-[#6b7280]">
          {clientName
            ? `${clientName} todavía está preparando esta página del evento.`
            : 'La página puede seguir en borrador o el enlace pudo haber cambiado.'}
        </p>
      </section>
    </main>
  );
}
