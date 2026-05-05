import type { EventPage, Product, SmbClient } from '@/lib/expo360/types';

import LeadCaptureForm from './LeadCaptureForm';

export interface TemplateProps {
  client: SmbClient;
  eventPage: EventPage;
  products: Product[];
}

function buildFormProps(eventPage: EventPage, products: Product[]) {
  return {
    slug: eventPage.slug,
    products: products.map((p) => ({ id: p.id, name: p.name })),
    title: eventPage.settings.leadFormTitle || 'Solicitar información',
    buttonLabel: eventPage.ctaLabel || 'Solicitar información',
  };
}

// ─── Template: Colección ──────────────────────────────────────────────────────
// Floating structured editorial panel over a full-bleed lifestyle background.
// Warm cream (#f8f4ee) panel with left title cell | right feature image cell,
// product cells in a bottom strip. Form card anchored below the panel.
// Mobile: cells stack vertically, form card full-width below panel.

export function ColeccionTemplate({ client, eventPage, products }: TemplateProps) {
  const formConfig = buildFormProps(eventPage, products);
  const featuredProduct = products[0];
  const panelProducts = products.slice(1, 5);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#2a2520]">
      {/* Full-bleed background */}
      {eventPage.settings.heroImageUrl ? (
        <img
          src={eventPage.settings.heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-[#3a3028] via-[#2a2520] to-[#1a1510]" />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-black/5 via-black/20 to-black/50" />

      {/* Panel wrapper */}
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-3 px-4 py-12 sm:px-6 lg:px-8">

        {/* Floating cream panel */}
        <div className="w-full max-w-5xl overflow-hidden bg-[#f8f4ee] shadow-[0_24px_96px_rgba(0,0,0,0.5)]">

          {/* Top section: title cell | feature image */}
          <div className="grid sm:grid-cols-[5fr_7fr]">

            {/* Title cell */}
            <div className="flex flex-col justify-between border-b border-[#e0d8cc] p-6 sm:border-b-0 sm:border-r sm:p-8 lg:p-10">
              <div>
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="mb-6 max-h-9 max-w-[140px] object-contain"
                  />
                ) : (
                  <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#999]">
                    {client.name}
                  </p>
                )}
                <h1 className="text-[2.4rem] font-black uppercase leading-none tracking-tighter text-[#1a1a1a] sm:text-5xl lg:text-[3.25rem]">
                  {eventPage.title}
                </h1>
                {eventPage.subtitle ? (
                  <p className="mt-3 text-[11px] font-medium uppercase leading-5 tracking-[0.12em] text-[#888]">
                    {eventPage.subtitle}
                  </p>
                ) : null}
                {eventPage.intro ? (
                  <p className="mt-4 max-w-xs text-[13px] leading-6 text-[#666]">
                    {eventPage.intro}
                  </p>
                ) : null}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {eventPage.location ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d4ccbf] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#666]">
                    ✦ {eventPage.location}
                  </span>
                ) : null}
                {eventPage.eventDate ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d4ccbf] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#666]">
                    ✦ {eventPage.eventDate}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Feature image cell */}
            <div className="relative overflow-hidden bg-[#ede8df]" style={{ minHeight: '320px' }}>
              {featuredProduct?.imageUrls[0] ? (
                <img
                  src={featuredProduct.imageUrls[0]}
                  alt={featuredProduct.name}
                  className="h-full w-full object-cover"
                  style={{ minHeight: '320px' }}
                />
              ) : eventPage.settings.heroImageUrl ? (
                <img
                  src={eventPage.settings.heroImageUrl}
                  alt=""
                  className="h-full w-full object-cover opacity-70"
                  style={{ minHeight: '320px' }}
                />
              ) : (
                <div className="h-full min-h-80 bg-[#e4ddd2]" />
              )}
              {featuredProduct ? (
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white drop-shadow-sm">
                    {featuredProduct.name}
                  </span>
                  {featuredProduct.price ? (
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#1a1a1a]">
                      {featuredProduct.price}
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#1a1a1a]">
                      NUEVO
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Bottom: product cells row */}
          {panelProducts.length > 0 ? (
            <div
              className="grid grid-cols-2 border-t border-[#e0d8cc] sm:grid-cols-4"
              style={{ gap: '1px', background: '#e0d8cc' }}
            >
              {panelProducts.map((product) => (
                <div key={product.id} className="bg-[#f4f0e8] p-3">
                  <div className="aspect-square overflow-hidden bg-[#ede8df]">
                    {product.imageUrls[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-1">
                    <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-[#444]">
                      {product.name}
                    </p>
                    {product.price ? (
                      <p className="shrink-0 text-[11px] text-[#888]">{product.price}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Form card — below the panel */}
        <div className="w-full max-w-5xl overflow-hidden bg-white/95 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <div className="border-b border-[#f0ebe3] px-6 py-4 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
              {formConfig.title}
            </p>
          </div>
          <div className="px-6 py-6 sm:px-8">
            <LeadCaptureForm {...formConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template: Galería ────────────────────────────────────────────────────────
// Magazine-quiet, warm cream. Massive top breathing room, sparse left label,
// right-column intro + form card, frameless product grid below. Zero decoration.
// Mobile: sections stack — label, then intro/form, then products.

export function GaleriaTemplate({ client, eventPage, products }: TemplateProps) {
  const formConfig = buildFormProps(eventPage, products);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4 sm:px-10">
        {client.logoUrl ? (
          <img
            src={client.logoUrl}
            alt={client.name}
            className="max-h-7 max-w-[100px] object-contain brightness-0 invert"
          />
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            {client.name}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/25">
          {eventPage.title}
        </span>
      </header>

      {/* Split: form (DOM-first → top on mobile) + editorial title block */}
      <div className="grid lg:grid-cols-[400px_1fr]">

        {/* Form — white card, left on desktop, top on mobile */}
        <div className="border-b border-white/[0.07] bg-white px-8 py-10 text-[#111] lg:border-b-0 lg:border-r lg:border-r-white/[0.07]">
          <LeadCaptureForm {...formConfig} />
        </div>

        {/* Title block — right on desktop */}
        <div className="flex flex-col justify-end border-b border-white/[0.07] px-8 py-12 sm:px-12 lg:min-h-[380px] lg:px-14">
          {eventPage.subtitle ? (
            <h2 className="text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl xl:text-[3.5rem]">
              {eventPage.subtitle}
            </h2>
          ) : null}
          {eventPage.intro ? (
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/45">
              {eventPage.intro}
            </p>
          ) : null}
          {eventPage.location || eventPage.eventDate ? (
            <div className="mt-8 flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.18em] text-white/30">
              {eventPage.location ? <span>{eventPage.location}</span> : null}
              {eventPage.eventDate ? <span>{eventPage.eventDate}</span> : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Product grid — gap-px on dark bg creates hairline dividers */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-px bg-white/[0.07] sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <div key={product.id} className="group bg-[#0d0d0d]">
              <div className="aspect-square overflow-hidden bg-[#181818]">
                {product.imageUrls[0] ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/20">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-[12px] font-medium leading-tight text-white/85">{product.name}</p>
                {product.price ? (
                  <p className="mt-0.5 text-[11px] text-white/35">{product.price}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="h-16" />
    </div>
  );
}

// ─── Template: Catálogo ───────────────────────────────────────────────────────
// Bold black border-frame catalog. Massive grotesque event title, thin filter
// nav, #f0f0f0 product cells with black 1px dividers, form sidebar on the right.
// Mobile: frame collapses to top+bottom rules, grid 2-col, sidebar stacks below.

export function CatalogoTemplate({ client, eventPage, products }: TemplateProps) {
  const formConfig = buildFormProps(eventPage, products);

  return (
    <div className="min-h-screen bg-white p-2 sm:p-3 lg:p-4">
      {/* Black border frame */}
      <div className="flex min-h-[calc(100vh-16px)] flex-col border-2 border-black sm:min-h-[calc(100vh-24px)] lg:min-h-[calc(100vh-32px)]">

        {/* Brand header bar */}
        <div className="flex shrink-0 items-center justify-between border-b-2 border-black px-4 py-3 sm:px-6">
          {client.logoUrl ? (
            <img
              src={client.logoUrl}
              alt={client.name}
              className="max-h-8 max-w-[140px] object-contain"
            />
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50">
              {client.name}
            </span>
          )}
          {eventPage.location || eventPage.eventDate ? (
            <div className="flex gap-4 text-[10px] uppercase tracking-[0.14em] text-black/40">
              {eventPage.location ? <span>{eventPage.location}</span> : null}
              {eventPage.eventDate ? <span>{eventPage.eventDate}</span> : null}
            </div>
          ) : null}
        </div>

        {/* Giant event title */}
        <div className="shrink-0 border-b-2 border-black px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-black sm:text-7xl lg:text-[6rem]">
            {eventPage.title}
          </h1>
          {eventPage.subtitle ? (
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-black/50">
              {eventPage.subtitle}
            </p>
          ) : null}
        </div>

        {/* Filter tab nav */}
        <div className="flex shrink-0 overflow-x-auto border-b-2 border-black">
          <span className="whitespace-nowrap bg-black px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
            TODO
          </span>
          <span className="whitespace-nowrap border-l border-black px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-black/50">
            PRODUCTOS ({products.length})
          </span>
          <span className="whitespace-nowrap border-l border-black px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-black/50">
            CONTACTO
          </span>
          {eventPage.location ? (
            <span className="whitespace-nowrap border-l border-black px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-black/30">
              {eventPage.location}
            </span>
          ) : null}
        </div>

        {/* Main content: product grid + form sidebar */}
        <div className="flex flex-1 flex-col lg:flex-row">

          {/* Product grid — fills available width */}
          <div className="flex-1 border-b-2 border-black lg:border-b-0 lg:border-r-2">
            {products.length > 0 ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                style={{ gap: '1px', background: '#000' }}
              >
                {products.map((product) => (
                  <div key={product.id} className="bg-white">
                    <div className="aspect-square bg-[#f0f0f0]">
                      {product.imageUrls[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="h-full w-full object-contain p-6"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="border-t border-black/10 px-3 py-2">
                      <p className="text-[12px] font-medium text-black">{product.name}</p>
                      {product.price ? (
                        <p className="text-[11px] text-black/40">{product.price}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-[13px] text-black/35">
                Los productos se están preparando.
              </div>
            )}
          </div>

          {/* Form sidebar */}
          <div className="w-full shrink-0 p-5 lg:w-80 lg:p-6">
            {eventPage.intro ? (
              <p className="mb-5 text-[13px] leading-6 text-black/55">{eventPage.intro}</p>
            ) : null}
            <LeadCaptureForm {...formConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template: Terminal ───────────────────────────────────────────────────────
// Pure white, three-column grid: narrow sidebar (event info + form) | large
// center hero image | product grid. Circled section numbers. Dense type.
// Mobile: sidebar first (form visible immediately), hero, then products.

export function TerminalTemplate({ client, eventPage, products }: TemplateProps) {
  const formConfig = buildFormProps(eventPage, products);

  return (
    <div className="min-h-screen bg-white text-black">

      {/* Header strip */}
      <header className="flex items-center justify-between border-b border-black/10 px-5 py-3 sm:px-6">
        <div>
          {client.logoUrl ? (
            <img
              src={client.logoUrl}
              alt={client.name}
              className="max-h-6 max-w-[110px] object-contain"
            />
          ) : (
            <span className="text-sm font-black uppercase tracking-tight">{client.name}</span>
          )}
        </div>
        <div className="hidden items-center gap-6 text-[10px] uppercase tracking-[0.16em] text-black/40 sm:flex">
          {eventPage.location ? <span>{eventPage.location}</span> : null}
          {eventPage.eventDate ? <span>{eventPage.eventDate}</span> : null}
          <span className="font-semibold text-black">{eventPage.ctaLabel || 'Registrarse'}</span>
        </div>
      </header>

      {/* Three-column body */}
      <div className="grid lg:grid-cols-[220px_1fr_1fr]">

        {/* ① Left sidebar: event info + form */}
        <aside className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r lg:p-6">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
            ① {client.name}
          </p>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-black sm:text-2xl">
            {eventPage.title}
          </h1>
          {eventPage.subtitle ? (
            <p className="mt-2 text-[12px] leading-5 text-black/50">{eventPage.subtitle}</p>
          ) : null}
          {eventPage.intro ? (
            <p className="mt-4 text-[12px] leading-5 text-black/40">{eventPage.intro}</p>
          ) : null}
          <div className="mt-4 space-y-1.5">
            {eventPage.location ? (
              <p className="text-[11px] text-black/35">{eventPage.location}</p>
            ) : null}
            {eventPage.eventDate ? (
              <p className="text-[11px] text-black/35">{eventPage.eventDate}</p>
            ) : null}
          </div>
          <div className="mt-6 border-t border-black/8 pt-6">
            <LeadCaptureForm {...formConfig} />
          </div>
        </aside>

        {/* ② Center: hero image, full column height */}
        <div className="relative min-h-64 border-b border-black/10 lg:border-b-0 lg:border-r">
          <p className="absolute left-4 top-3 z-10 text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
            ② {eventPage.title}
          </p>
          {eventPage.settings.heroImageUrl ? (
            <img
              src={eventPage.settings.heroImageUrl}
              alt={eventPage.title}
              className="h-full w-full object-cover"
              style={{ minHeight: '320px' }}
            />
          ) : (
            <div className="flex h-full min-h-80 items-center justify-center bg-[#f5f5f5]">
              <p className="text-[10px] uppercase tracking-widest text-black/20">Sin imagen</p>
            </div>
          )}
        </div>

        {/* ③ Right: product grid */}
        <div className="p-5 sm:p-6">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
            ③ PRODUCTOS ({products.length})
          </p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div key={product.id}>
                  <div className="aspect-square bg-[#f5f5f5]">
                    {product.imageUrls[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="mt-1.5">
                    <p className="text-[12px] font-medium leading-tight text-black">
                      {product.name}
                    </p>
                    {product.price ? (
                      <p className="mt-0.5 text-[11px] text-black/40">{product.price}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-black/30">Los productos se están preparando.</p>
          )}
        </div>
      </div>
    </div>
  );
}
