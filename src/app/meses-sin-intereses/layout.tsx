import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meses Sin Intereses en México | Pagos a Plazos | Expo360 + Stripe",
  description: "Ofrece meses sin intereses en tu showroom virtual. 3, 6, 9, 12, 18 o 24 meses con las principales tarjetas de crédito mexicanas. Aumenta tu ticket promedio hasta 40%.",
  keywords: [
    "meses sin intereses",
    "MSI México",
    "pagos a plazos",
    "financiamiento ecommerce",
    "Stripe meses sin intereses",
    "tarjetas crédito México",
    "comprar a meses",
    "pago diferido",
    "cuotas sin intereses",
    "financiar compras México"
  ],
  openGraph: {
    type: 'article',
    locale: 'es_MX',
    url: 'https://expo360.vercel.app/meses-sin-intereses',
    siteName: 'Expo360 by Interzekt',
    title: 'Meses Sin Intereses | Aumenta Ventas con Pagos a Plazos',
    description: 'Permite a tus clientes pagar en 3, 6, 9, 12, 18 o 24 meses sin intereses. Aumenta conversiones y ticket promedio.',
    images: [
      {
        url: '/payments/msi-hero.png',
        width: 1200,
        height: 630,
        alt: 'Meses sin intereses en Expo360',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meses Sin Intereses | Expo360',
    description: 'Ofrece pagos a 3, 6, 9, 12, 18 o 24 meses sin intereses en tu showroom virtual.',
    images: ['/payments/msi-hero.png'],
  },
  alternates: {
    canonical: 'https://expo360.vercel.app/meses-sin-intereses',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': 'https://expo360.vercel.app/meses-sin-intereses/#article',
      headline: 'Cómo Ofrecer Meses Sin Intereses en Tu Showroom Virtual',
      description: 'Guía completa para activar pagos a meses sin intereses usando Expo360 y Stripe en México.',
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
      mainEntityOfPage: 'https://expo360.vercel.app/meses-sin-intereses',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cómo funcionan los meses sin intereses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El cliente paga con su tarjeta de crédito y el banco divide el total en pagos mensuales iguales sin cobrar intereses. Tú recibes el monto completo menos una pequeña comisión.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta ofrecer meses sin intereses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'La comisión varía según el plazo: aproximadamente 4-5% para 3 meses, 7-9% para 6 meses, y hasta 15-18% para 12+ meses. El costo exacto depende de tu acuerdo con Stripe.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Qué tarjetas aceptan meses sin intereses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'La mayoría de tarjetas de crédito mexicanas de bancos como BBVA, Banorte, Santander, Citibanamex, HSBC, Scotiabank, American Express y más.',
          },
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'Cómo Ofrecer Meses Sin Intereses',
      description: 'Pasos para habilitar pagos a meses sin intereses en tu showroom virtual',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Activa MSI en Stripe',
          text: 'Habilita la opción de meses sin intereses en tu dashboard de Stripe México',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Configura los plazos',
          text: 'Elige qué plazos ofrecer: 3, 6, 9, 12, 18 o 24 meses',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Define monto mínimo',
          text: 'Establece el monto mínimo de compra para MSI (típicamente $1,000 - $3,000 MXN)',
        },
      ],
    },
  ],
};

export default function MesesSinInteresesLayout({
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
