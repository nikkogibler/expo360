"use client";

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Facebook, Instagram, Linkedin, Music2, Youtube } from 'lucide-react';

import type {
  EventPage,
  Product,
  SmbClient,
  TerminalDrawerSectionId,
  TerminalDrawerSections,
} from '@/lib/expo360/types';

import LeadCaptureForm from './LeadCaptureForm';

export interface TemplateProps {
  client: SmbClient;
  eventPage: EventPage;
  products: Product[];
}

const catalogSocials = [
  { label: 'Facebook', Icon: Facebook },
  { label: 'TikTok', Icon: Music2 },
  { label: 'YouTube', Icon: Youtube },
  { label: 'Instagram', Icon: Instagram },
  { label: 'LinkedIn', Icon: Linkedin },
] as const;

const defaultTerminalDrawerSections: Record<TerminalDrawerSectionId, boolean> = {
  about: true,
  mission: true,
  products: true,
  contact: true,
};

function resolveTerminalDrawerSections(value?: TerminalDrawerSections) {
  return {
    ...defaultTerminalDrawerSections,
    ...(value || {}),
  };
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'manual' | 'name-asc' | 'price-asc' | 'price-desc'>('manual');

  const featuredProduct = useMemo(() => {
    return products.find((product) => product.id === eventPage.settings.featuredProductId);
  }, [eventPage.settings.featuredProductId, products]);

  const collectionHeroImageUrl =
    featuredProduct?.imageUrls[0] ||
    eventPage.settings.heroImageUrl ||
    products[0]?.imageUrls[0];

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const bySearch = normalizedSearch
      ? products.filter((product) => {
          const detailText = Object.values(product.details || {}).join(' ').toLowerCase();
          return [product.name, product.description || '', detailText]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch);
        })
      : products;

    const sorted = [...bySearch];

    if (sortBy === 'name-asc') {
      sorted.sort((left, right) => left.name.localeCompare(right.name, 'es'));
    } else if (sortBy === 'price-asc') {
      sorted.sort((left, right) => getNumericPrice(left.price) - getNumericPrice(right.price));
    } else if (sortBy === 'price-desc') {
      sorted.sort((left, right) => getNumericPrice(right.price) - getNumericPrice(left.price));
    } else {
      sorted.sort((left, right) => left.sortOrder - right.sortOrder);
    }

    return sorted;
  }, [products, search, sortBy]);

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
      <div className="relative flex min-h-screen flex-col items-center gap-5 px-4 py-12 sm:px-6 lg:px-8">

        {/* Floating cream panel */}
        <div className="w-full max-w-5xl overflow-hidden bg-[#f8f4ee] shadow-[0_24px_96px_rgba(0,0,0,0.5)]">

          {/* Top section: title cell | feature image */}
          <div className="grid sm:grid-cols-[5fr_7fr]">

            {/* Title cell */}
            <div className="flex flex-col justify-between border-b border-[#e0d8cc] p-6 sm:border-b-0 sm:border-r sm:p-8 lg:p-10">
              <div className="flex flex-col items-center text-center">
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="mb-8 max-h-52 w-full max-w-[640px] object-contain sm:max-h-60 sm:max-w-[720px] lg:max-h-80 lg:max-w-[840px]"
                  />
                ) : (
                  <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#999]">
                    {client.name}
                  </p>
                )}
                {eventPage.subtitle ? (
                  <p className="text-[11px] font-medium uppercase leading-5 tracking-[0.12em] text-[#888]">
                    {eventPage.subtitle}
                  </p>
                ) : null}
                {eventPage.intro ? (
                  <p className="mt-4 max-w-sm text-[13px] leading-6 text-[#666]">
                    {eventPage.intro}
                  </p>
                ) : null}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
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
              {collectionHeroImageUrl ? (
                <img
                  src={collectionHeroImageUrl}
                  alt={featuredProduct?.name || eventPage.title}
                  className="h-full w-full object-cover"
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e0d8cc] bg-[#f4f0e8] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b7f70]">Colección completa</p>
              <p className="mt-1 text-sm text-[#5e564d]">Explora todos los productos disponibles y ordénalos a tu manera.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#1a1a1a] px-5 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]"
            >
              {formConfig.buttonLabel}
            </button>
          </div>
        </div>

        <div className="w-full max-w-5xl overflow-hidden bg-[#f8f4ee] shadow-[0_16px_60px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-3 border-b border-[#e0d8cc] px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b7f70]">Productos</p>
              <p className="mt-1 text-sm text-[#5e564d]">Mostrando {filteredProducts.length} de {products.length} productos cargados.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto"
                className="h-10 min-w-0 rounded-full border border-[#d9d0c4] bg-white px-4 text-sm text-[#1a1a1a] outline-none transition focus:border-[#8b7f70] focus:ring-2 focus:ring-black/5"
              />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'manual' | 'name-asc' | 'price-asc' | 'price-desc')}
                className="h-10 rounded-full border border-[#d9d0c4] bg-white px-4 text-sm text-[#1a1a1a] outline-none transition focus:border-[#8b7f70] focus:ring-2 focus:ring-black/5"
              >
                <option value="manual">Ordenar · destacado primero</option>
                <option value="name-asc">Nombre A-Z</option>
                <option value="price-asc">Precio menor a mayor</option>
                <option value="price-desc">Precio mayor a menor</option>
              </select>
            </div>
          </div>

          <div className="grid gap-px bg-[#e0d8cc] sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group bg-[#f4f0e8] p-4"
                onClick={() => setExpandedProductId((current) => (current === product.id ? null : product.id))}
              >
                <div className="aspect-4/3 overflow-hidden bg-[#ede8df]">
                  {product.imageUrls[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase leading-tight tracking-wide text-[#2b2926]">
                      {product.name}
                    </p>
                    <p className="mt-1 hidden text-[11px] uppercase tracking-[0.12em] text-[#8b7f70] md:block">
                      Pasa el cursor para ver descripción
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#8b7f70] md:hidden">
                      Toca para ver descripción
                    </p>
                  </div>
                  {product.price ? (
                    <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a7268]">
                      {product.price}
                    </p>
                  ) : null}
                </div>

                {product.description ? (
                  <div
                    className={[
                      'overflow-hidden transition-all duration-300 ease-out',
                      expandedProductId === product.id ? 'mt-3 max-h-40 opacity-100' : 'max-h-0 opacity-0',
                      'md:mt-0 md:max-h-0 md:opacity-0 md:group-hover:mt-3 md:group-hover:max-h-40 md:group-hover:opacity-100',
                    ].join(' ')}
                  >
                    <div className="border-t border-[#ddd4c7] pt-3">
                      <p className="text-sm leading-6 text-[#6a6258]">{product.description}</p>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#6a6258] sm:px-6">
              No encontramos productos con ese filtro.
            </div>
          ) : null}
        </div>

        {isFormOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}>
            <div
              className="w-full max-w-2xl overflow-hidden rounded-3xl bg-[#f8f4ee] shadow-[0_24px_96px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#e0d8cc] px-6 py-4 sm:px-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                    {formConfig.title}
                  </p>
                  <p className="mt-1 text-sm text-[#6a6258]">Selecciona los productos que te interesan y te contactamos.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9d0c4] text-[#6a6258] transition hover:bg-white/80 hover:text-[#1a1a1a]"
                  aria-label="Cerrar formulario"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-8">
                <LeadCaptureForm {...formConfig} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getNumericPrice(price?: string) {
  if (!price) return Number.POSITIVE_INFINITY;

  const normalized = price.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const value = Number.parseFloat(normalized);

  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

// ─── Template: Galería ────────────────────────────────────────────────────────
// Magazine-quiet, warm cream. Massive top breathing room, sparse left label,
// right-column intro + form card, frameless product grid below. Zero decoration.
// Mobile: sections stack — label, then intro/form, then products.

export function GaleriaTemplate({ client, eventPage, products }: TemplateProps) {
  const formConfig = buildFormProps(eventPage, products);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [flippedProductId, setFlippedProductId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">

      <section className="relative isolate overflow-hidden border-b border-white/[0.07]">
        {eventPage.settings.heroImageUrl ? (
          <img
            src={eventPage.settings.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/55 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_24%)]" />

        <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:min-h-[680px] lg:px-16 lg:py-28">
          <div className="max-w-4xl lg:pr-112">
            <div className="max-w-4xl">
              <h1 className="text-5xl font-light leading-[0.94] tracking-[-0.04em] text-white sm:text-7xl xl:text-[6.5rem]">
                {eventPage.title}
              </h1>
              {eventPage.subtitle ? (
                <p className="mt-5 max-w-3xl text-lg font-light leading-8 text-white/72 sm:text-2xl sm:leading-10">
                  {eventPage.subtitle}
                </p>
              ) : null}
            </div>

            <div className="mt-10 max-w-xl">
              {eventPage.intro ? (
                <p className="text-sm leading-7 text-white/52 sm:text-[15px]">
                  {eventPage.intro}
                </p>
              ) : null}
              {eventPage.location || eventPage.eventDate ? (
                <div className="mt-6 flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.18em] text-white/38">
                  {eventPage.location ? <span>{eventPage.location}</span> : null}
                  {eventPage.eventDate ? <span>{eventPage.eventDate}</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-10 w-full max-w-sm rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-md lg:absolute lg:bottom-12 lg:right-16 lg:mt-0">
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={client.name}
                className="mb-4 block h-auto w-full max-w-none object-contain object-left drop-shadow-[0_12px_24px_rgba(0,0,0,0.24)]"
              />
            ) : null}
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              {formConfig.title}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Agenda una conversación o pide información sin interrumpir la experiencia visual de la galería.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-white/90 active:scale-[0.98]"
            >
              {formConfig.buttonLabel}
            </button>
          </div>
        </div>
      </section>

      {/* Product grid — gap-px on dark bg creates hairline dividers */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-px bg-white/[0.07] sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <button
              key={product.id}
              type="button"
              onClick={() =>
                setFlippedProductId((current) => (current === product.id ? null : product.id))
              }
              className="group bg-[#0d0d0d] text-left"
            >
              <div className="perspective-distant">
                <div
                  className="relative aspect-square transform-3d transition-transform duration-500"
                  style={{
                    transform:
                      flippedProductId === product.id ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden bg-[#181818] backface-hidden">
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
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-10">
                      <p className="text-[12px] font-medium leading-tight text-white/92">{product.name}</p>
                      {product.price ? (
                        <p className="mt-0.5 text-[11px] text-white/45">{product.price}</p>
                      ) : null}
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                        Haz clic para ver descripción
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex h-full flex-col justify-between bg-[#111] p-4 text-white backface-hidden transform-[rotateY(180deg)]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                        {product.name}
                      </p>
                      {product.price ? (
                        <p className="mt-2 text-sm font-medium text-white/75">{product.price}</p>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      {product.description || 'Sin descripción disponible por ahora.'}
                    </p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/28">
                      Haz clic para regresar
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-4xl bg-white text-[#111] shadow-[0_24px_96px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ece7dd] px-6 py-4 sm:px-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b7468]">
                  {formConfig.title}
                </p>
                <p className="mt-1 text-sm text-[#5f574c]">Completa el formulario y te contactamos con contexto sobre los productos que te interesan.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9d0c4] text-[#6a6258] transition hover:bg-[#f8f4ee] hover:text-[#111]"
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-8">
              <LeadCaptureForm {...formConfig} />
            </div>
          </div>
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
    <div className="min-h-screen bg-white p-2 sm:p-3 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Black border frame */}
      <div className="flex h-full flex-col border-2 border-black">

        {/* Brand header bar */}
        <div className="flex shrink-0 items-center justify-between border-b-2 border-black px-4 py-3 sm:px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/50">
            {client.name}
          </span>
          <div className="flex items-center gap-1.5">
            {catalogSocials.map(({ label, Icon }) => (
              <span
                key={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition hover:bg-black/6 hover:text-black"
                aria-label={label}
                title={label}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
              </span>
            ))}
          </div>
        </div>

        {/* Giant event title */}
        <div className="relative shrink-0 border-b-2 border-black px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-4">
          <div>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-black sm:text-7xl lg:text-[6rem]">
              {eventPage.title}
            </h1>
            {eventPage.subtitle ? (
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-black/50">
                {eventPage.subtitle}
              </p>
            ) : null}
          </div>
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
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

          {/* Product grid — scrollable on desktop */}
          <div className="min-h-0 flex-1 overflow-y-auto border-b-2 border-black lg:border-b-0 lg:border-r-2">
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
          <div className="w-full shrink-0 border-t-2 border-black bg-[#fafafa] lg:min-h-0 lg:w-80 lg:overflow-y-auto lg:border-t-0">
            <div className="space-y-5 p-5 lg:p-6">
              {eventPage.intro ? (
                <p className="text-[13px] leading-6 text-black/55">{eventPage.intro}</p>
              ) : null}
              <LeadCaptureForm {...formConfig} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template: Terminal ───────────────────────────────────────────────────────
// Pure white. Two-column split: left = scrollable content (hero + product grid),
// right = dedicated 380px action panel (event digest + full-width form).
// Form gets real estate — not crammed into a sidebar with all the copy.
// Mobile: action panel (form) first, content below.

export function TerminalTemplate({ client, eventPage, products }: TemplateProps) {
  const formConfig = buildFormProps(eventPage, products);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerSectionId, setActiveDrawerSectionId] = useState<TerminalDrawerSectionId>('about');

  const terminalDrawerSectionFlags = useMemo(
    () => resolveTerminalDrawerSections(eventPage.settings.terminalDrawerSections),
    [eventPage.settings.terminalDrawerSections]
  );

  const terminalDrawerSections = useMemo(() => {
    const sections: Array<{
      id: TerminalDrawerSectionId;
      label: string;
      eyebrow: string;
      content: React.ReactNode;
    }> = [];
    const brandContext = client.integrations.brandCopyGuide?.brandContext?.trim();
    const clientProfile = client.integrations.brandCopyGuide?.clientProfile?.trim();

    if (terminalDrawerSectionFlags.about) {
      sections.push({
        id: 'about',
        label: 'Acerca de nosotros',
        eyebrow: '01',
        content:
          brandContext ||
          eventPage.intro ||
          `${client.name} presenta una experiencia de producto pensada para conversar con más contexto, menos fricción y una narrativa más clara alrededor de la marca.`,
      });
    }

    if (terminalDrawerSectionFlags.mission) {
      sections.push({
        id: 'mission',
        label: 'Nuestra misión',
        eyebrow: '02',
        content:
          clientProfile
            ? `Buscamos acercar esta propuesta a ${clientProfile.toLowerCase()} mediante una experiencia directa, elegante y útil desde el primer clic hasta el seguimiento comercial.`
            : 'Nuestra misión es convertir exploración en conversación: una experiencia simple para descubrir, entender y luego pedir información sin romper el ritmo visual de la página.',
      });
    }

    if (terminalDrawerSectionFlags.products) {
      sections.push({
        id: 'products',
        label: 'Nuestras líneas',
        eyebrow: '03',
        content:
          products.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-black/55">
                Explora una selección curada de {products.length} productos listos para consulta.
              </p>
              <div className="flex flex-wrap gap-2">
                {products.slice(0, 8).map((product) => (
                  <span
                    key={product.id}
                    className="rounded-full border border-black/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-black/45"
                  >
                    {product.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            'Pronto podremos mostrar aquí distintas líneas, familias o categorías de producto según la configuración de Studio.'
          ),
      });
    }

    if (terminalDrawerSectionFlags.contact) {
      sections.push({
        id: 'contact',
        label: 'Contacto',
        eyebrow: '04',
        content: (
          <div className="space-y-3 text-sm leading-6 text-black/55">
            {eventPage.location ? <p>Ubicación: {eventPage.location}</p> : null}
            {eventPage.eventDate ? <p>Fecha: {eventPage.eventDate}</p> : null}
            {client.contact.website ? <p>Sitio: {client.contact.website}</p> : null}
            {client.contact.email ? <p>Correo: {client.contact.email}</p> : null}
            {client.contact.phone ? <p>Teléfono: {client.contact.phone}</p> : null}
            {!eventPage.location && !eventPage.eventDate && !client.contact.website && !client.contact.email && !client.contact.phone ? (
              <p>Activa esta sección cuando quieras mostrar datos de contacto, ubicación, fechas o información de seguimiento desde Studio.</p>
            ) : null}
          </div>
        ),
      });
    }

    return sections;
  }, [
    client.contact.email,
    client.contact.phone,
    client.contact.website,
    client.integrations.brandCopyGuide?.brandContext,
    client.integrations.brandCopyGuide?.clientProfile,
    client.name,
    eventPage.eventDate,
    eventPage.intro,
    eventPage.location,
    products,
    terminalDrawerSectionFlags.about,
    terminalDrawerSectionFlags.contact,
    terminalDrawerSectionFlags.mission,
    terminalDrawerSectionFlags.products,
  ]);

  const activeDrawerSection =
    terminalDrawerSections.find((section) => section.id === activeDrawerSectionId) ||
    terminalDrawerSections[0] ||
    null;

  const drawerPanel = activeDrawerSection ? (
    <div className="flex h-full flex-col bg-white">
      <div className="relative border-b border-black/10 px-5 py-4">
        <div className="min-w-0">
          <div className="pr-12">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">Navegación</p>
          </div>
          {client.logoUrl ? (
            <div className="mt-1 flex h-44 w-full items-center justify-center overflow-hidden">
              <img
                src={client.logoUrl}
                alt={client.name}
                className="h-full w-full max-w-none object-contain object-center"
                style={{ transform: 'translateX(-6px) scale(2.565)', transformOrigin: 'center center' }}
              />
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-black">{client.name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          className="absolute right-5 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/50 transition hover:bg-black hover:text-white"
          aria-label="Cerrar drawer"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.7} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-px border-b border-black/10 bg-black/10">
        {terminalDrawerSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveDrawerSectionId(section.id)}
            className={`bg-white px-4 py-3 text-left transition ${
              activeDrawerSection.id === section.id ? 'text-black' : 'text-black/45 hover:text-black'
            }`}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/30">{section.eyebrow}</p>
            <p className="mt-1 text-[12px] font-medium leading-5">{section.label}</p>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">{activeDrawerSection.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-black">{activeDrawerSection.label}</h2>
        <div className="mt-4 text-sm leading-6 text-black/55">{activeDrawerSection.content}</div>
      </div>
    </div>
  ) : null;

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
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden items-center gap-6 text-[10px] uppercase tracking-[0.16em] text-black/40 sm:flex">
            {eventPage.location ? <span>{eventPage.location}</span> : null}
            {eventPage.eventDate ? <span>{eventPage.eventDate}</span> : null}
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-black bg-black px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
          >
            {formConfig.buttonLabel}
          </button>
        </div>
      </header>

      {/* Two-column body */}
      <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-49px)]">
        {terminalDrawerSections.length > 0 ? (
          <div className="border-b border-black/10 px-5 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsDrawerOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 transition hover:border-black hover:text-black"
            >
              {isDrawerOpen ? 'Cerrar secciones' : 'Explorar secciones'}
              <ChevronRight className={`h-4 w-4 transition ${isDrawerOpen ? 'rotate-90' : ''}`} strokeWidth={1.7} />
            </button>
            {isDrawerOpen ? <div className="mt-4 overflow-hidden rounded-3xl border border-black/10">{drawerPanel}</div> : null}
          </div>
        ) : null}

        {/* ② Content — hero + products */}
        <div className="relative flex-1 flex flex-col">
          {terminalDrawerSections.length > 0 ? (
            <div className="absolute left-0 top-0 z-20 hidden h-full items-start lg:flex">
              <button
                type="button"
                onClick={() => setIsDrawerOpen((current) => !current)}
                className="mt-8 inline-flex h-32 w-11 flex-col items-center justify-center gap-3 rounded-r-2xl border border-l-0 border-black/10 bg-white text-black/55 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:text-black"
                aria-label="Abrir drawer de secciones"
              >
                <ChevronRight className={`h-4 w-4 transition ${isDrawerOpen ? 'rotate-180' : ''}`} strokeWidth={1.7} />
                <span className="rotate-180 text-[10px] font-semibold uppercase tracking-[0.18em] [writing-mode:vertical-rl]">
                  Explorar
                </span>
              </button>
              <div
                className={`mt-8 overflow-hidden border-y border-r border-black/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.08)] transition-[width,opacity] duration-300 ${
                  isDrawerOpen ? 'w-[340px] opacity-100' : 'w-0 opacity-0'
                }`}
              >
                {isDrawerOpen ? <div className="h-[calc(100vh-113px)] w-[340px]">{drawerPanel}</div> : null}
              </div>
            </div>
          ) : null}

          <div className="flex flex-1 flex-col lg:pl-12">

          {/* Hero image */}
          <div className="relative border-b border-black/10">
            <p className="absolute left-4 top-3 z-10 text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
              ② {eventPage.title}
            </p>
            {eventPage.settings.heroImageUrl ? (
              <img
                src={eventPage.settings.heroImageUrl}
                alt={eventPage.title}
                className="h-64 w-full object-cover sm:h-80 lg:h-96"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-[#f5f5f5] sm:h-64">
                <p className="text-[10px] uppercase tracking-widest text-black/20">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Product grid */}
          <div className="p-6 sm:p-8">
            <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
              ③ Productos ({products.length})
            </p>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
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
                    <div className="mt-2">
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
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_96px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4 sm:px-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                  {formConfig.title}
                </p>
                <p className="mt-1 text-sm text-black/55">Déjanos tus datos y te contactamos con seguimiento puntual sobre los productos que te interesan.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/55 transition hover:bg-black hover:text-white"
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-8">
              <LeadCaptureForm {...formConfig} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
