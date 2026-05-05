import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { getClientBundleBySlug } from '@/lib/expo360/repositories';

import {
  CatalogoTemplate,
  ColeccionTemplate,
  GaleriaTemplate,
  TerminalTemplate,
} from './EventPageTemplates';

export const dynamic = 'force-dynamic';

const SITE_BASE_URL = 'https://expo360.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getClientBundleBySlug(slug, { includeDraft: true });

  if (!bundle) {
    return {
      title: 'Página no disponible',
      description: 'Esta página del evento no está disponible.',
      icons: {
        icon: '/favicon.png',
      },
    };
  }

  const brandName = bundle.client.name.trim();
  const eventTitle = bundle.eventPage.title.trim();
  const title =
    eventTitle && eventTitle.toLowerCase() !== brandName.toLowerCase()
      ? `${brandName} | ${eventTitle}`
      : brandName;
  const description =
    bundle.eventPage.subtitle?.trim() ||
    bundle.eventPage.intro?.trim() ||
    `${brandName} presenta su experiencia de evento en Expo360.`;
  const iconUrl = bundle.client.logoUrl || '/favicon.png';
  const previewImageUrl = bundle.eventPage.settings.heroImageUrl || iconUrl;
  const canonicalPath = `/c/${slug}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_BASE_URL),
    alternates: {
      canonical: canonicalPath,
    },
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: brandName,
      type: 'website',
      images: previewImageUrl
        ? [
            {
              url: previewImageUrl,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: previewImageUrl ? [previewImageUrl] : undefined,
    },
  };
}

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
    backgroundColor: 'var(--brand-bg)',
    color: 'var(--brand-text)',
  } as CSSProperties;

  const templateId = bundle.eventPage.settings.layoutTemplate ?? 'coleccion';
  const templateProps = { client: bundle.client, eventPage: bundle.eventPage, products };

  return (
    <main
      style={pageStyle}
      className="min-h-screen"
    >
      {canPreview && !isPublic ? (
        <div className="bg-[#111827] px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-white">
          Vista previa autenticada · aún no está publicada
        </div>
      ) : null}

      {templateId === 'galeria' ? (
        <GaleriaTemplate {...templateProps} />
      ) : templateId === 'catalogo' ? (
        <CatalogoTemplate {...templateProps} />
      ) : templateId === 'terminal' ? (
        <TerminalTemplate {...templateProps} />
      ) : (
        <ColeccionTemplate {...templateProps} />
      )}
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
