import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagos con OXXO en México | Expo360 + Stripe",
  description: "Acepta pagos en efectivo con OXXO en tu showroom virtual. Más de 19,000 tiendas en México. Integración automática con Stripe y Expo360. Sin complicaciones técnicas.",
  keywords: [
    "pagos OXXO",
    "OXXO Pay",
    "pagar en OXXO",
    "pagos en efectivo México",
    "cobrar con OXXO",
    "OXXO ecommerce",
    "tienda virtual OXXO",
    "Stripe OXXO México",
    "vender sin tarjeta",
    "pagos cash México"
  ],
  openGraph: {
    type: 'article',
    locale: 'es_MX',
    url: 'https://expo360.vercel.app/pagos-oxxo',
    siteName: 'Expo360 by Interzekt',
    title: 'Pagos con OXXO | Acepta Efectivo en Tu Showroom Virtual',
    description: 'Permite que tus clientes paguen en efectivo en más de 19,000 tiendas OXXO. Integración automática con Expo360.',
    images: [
      {
        url: '/payments/oxxo-hero.png',
        width: 1200,
        height: 630,
        alt: 'Pagos con OXXO en Expo360',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pagos con OXXO | Expo360',
    description: 'Acepta pagos en efectivo en +19,000 tiendas OXXO con tu showroom virtual.',
    images: ['/payments/oxxo-hero.png'],
  },
  alternates: {
    canonical: 'https://expo360.vercel.app/pagos-oxxo',
  },
};

// JSON-LD for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': 'https://expo360.vercel.app/pagos-oxxo/#article',
      headline: 'Cómo Aceptar Pagos con OXXO en Tu Showroom Virtual',
      description: 'Guía completa para aceptar pagos en efectivo con OXXO usando Expo360 y Stripe en México.',
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
      mainEntityOfPage: 'https://expo360.vercel.app/pagos-oxxo',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cómo funciona el pago con OXXO?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El cliente recibe un voucher con código de barras único. Tiene 24-72 horas para pagar en cualquier OXXO. Una vez pagado, recibes confirmación automática y el pedido se procesa.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta aceptar pagos con OXXO?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Stripe cobra aproximadamente 3% + $10 MXN por transacción con OXXO. No hay costos mensuales adicionales.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto tiempo tiene el cliente para pagar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Por defecto, los vouchers de OXXO tienen una vigencia de 72 horas (3 días) para realizar el pago.',
          },
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'Cómo Aceptar Pagos con OXXO',
      description: 'Pasos para habilitar pagos en efectivo con OXXO en tu showroom virtual',
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
          name: 'Habilita OXXO',
          text: 'Activa OXXO como método de pago en tu dashboard de Stripe',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Recibe pagos',
          text: 'Tus clientes pueden seleccionar OXXO al checkout y pagar en cualquier tienda',
        },
      ],
    },
  ],
};

export default function PagosOxxoLayout({
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
