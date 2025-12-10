import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagos con SPEI en México | Transferencias Bancarias Instantáneas | Expo360",
  description: "Acepta transferencias bancarias SPEI en tu showroom virtual. Pagos instantáneos, comisiones bajas, ideal para ventas B2B. Integración automática con Stripe y Expo360.",
  keywords: [
    "pagos SPEI",
    "transferencia SPEI",
    "SPEI ecommerce",
    "cobrar con SPEI",
    "transferencias bancarias México",
    "pagos B2B México",
    "Stripe SPEI",
    "pagos instantáneos México",
    "CLABE interbancaria",
    "transferencia interbancaria"
  ],
  openGraph: {
    type: 'article',
    locale: 'es_MX',
    url: 'https://expo360.vercel.app/pagos-spei',
    siteName: 'Expo360 by Interzekt',
    title: 'Pagos con SPEI | Transferencias Bancarias Instantáneas',
    description: 'Acepta transferencias SPEI en tu showroom virtual. Pagos confirmados en segundos con comisiones más bajas.',
    images: [
      {
        url: '/payments/spei-hero.png',
        width: 1200,
        height: 630,
        alt: 'Pagos con SPEI en Expo360',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pagos con SPEI | Expo360',
    description: 'Transferencias bancarias instantáneas para tu showroom virtual.',
    images: ['/payments/spei-hero.png'],
  },
  alternates: {
    canonical: 'https://expo360.vercel.app/pagos-spei',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': 'https://expo360.vercel.app/pagos-spei/#article',
      headline: 'Cómo Aceptar Pagos con SPEI en Tu Showroom Virtual',
      description: 'Guía completa para aceptar transferencias bancarias SPEI usando Expo360 y Stripe en México.',
      author: {
        '@type': 'Organization',
        name: 'Expo360 by Interzekt',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Expo360 by Interzekt',
        logo: {
          '@type': 'ImageObject',
          url: 'https://expo360.vercel.app/expo360_logo.png',
        },
      },
      datePublished: '2024-12-01',
      dateModified: '2024-12-10',
      mainEntityOfPage: 'https://expo360.vercel.app/pagos-spei',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Qué es SPEI y cómo funciona?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SPEI (Sistema de Pagos Electrónicos Interbancarios) es el sistema de transferencias bancarias instantáneas de Banco de México. Permite enviar dinero entre cualquier banco mexicano en segundos, las 24 horas del día.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta aceptar pagos con SPEI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Stripe cobra aproximadamente 1% por transacción con SPEI, significativamente menos que tarjetas de crédito. Es ideal para ventas de alto valor.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto tarda en confirmarse un pago SPEI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los pagos SPEI se confirman en segundos, generalmente menos de 30 segundos. Es el método de pago más rápido disponible en México.',
          },
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'Cómo Aceptar Pagos con SPEI',
      description: 'Pasos para habilitar transferencias bancarias SPEI en tu showroom virtual',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Registra tu cuenta',
          text: 'Crea tu cuenta en Expo360 y conecta con Stripe México',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Habilita SPEI',
          text: 'SPEI se activa automáticamente con tu cuenta de Stripe México',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Recibe pagos',
          text: 'Tus clientes seleccionan SPEI y reciben una CLABE única para transferir',
        },
      ],
    },
  ],
};

export default function PagosSpeiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
