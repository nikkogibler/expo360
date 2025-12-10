import type { Metadata } from "next";

// Comprehensive SEO + GEO (Generative Engine Optimization) Metadata
export const metadata: Metadata = {
  title: "Stripe + Expo360 | Integración de Pagos para Showrooms Virtuales en México",
  description: "Integra Stripe con Expo360 para aceptar más de 100 métodos de pago incluyendo OXXO, SPEI, tarjetas de crédito/débito, Apple Pay, Google Pay y PayPal. Aumenta conversiones y maximiza ventas de tu showroom virtual en México.",
  
  // Keywords for traditional SEO
  keywords: [
    "Stripe México",
    "pagos en línea México",
    "OXXO pagos",
    "SPEI transferencias",
    "showroom virtual",
    "Expo360",
    "métodos de pago México",
    "Apple Pay México",
    "Google Pay México",
    "meses sin intereses",
    "e-commerce México",
    "pasarela de pagos",
    "tienda virtual 3D",
    "configurador de productos",
    "pagos internacionales"
  ],

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // OpenGraph for social sharing and AI discovery
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://expo360.vercel.app/stripe-benefits',
    siteName: 'Expo360 by Interzekt',
    title: 'Stripe + Expo360 | Más de 100 Métodos de Pago para Tu Showroom Virtual',
    description: 'Acepta pagos con OXXO, SPEI, tarjetas, Apple Pay, Google Pay y más. La integración perfecta de Stripe con showrooms virtuales 3D en México.',
    images: [
      {
        url: '/stripe_hero.png',
        width: 1200,
        height: 630,
        alt: 'Stripe integrado con Expo360 - Métodos de pago para México',
        type: 'image/png',
      },
      {
        url: '/expo360_logo.png',
        width: 400,
        height: 400,
        alt: 'Expo360 Logo',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@interzekt',
    creator: '@interzekt',
    title: 'Stripe + Expo360 | Pagos para Showrooms Virtuales',
    description: 'Más de 100 métodos de pago incluyendo OXXO, SPEI, Apple Pay y meses sin intereses para tu showroom virtual en México.',
    images: ['/stripe_hero.png'],
  },

  // Canonical URL
  alternates: {
    canonical: 'https://expo360.vercel.app/stripe-benefits',
    languages: {
      'es-MX': 'https://expo360.vercel.app/stripe-benefits',
      'es': 'https://expo360.vercel.app/stripe-benefits',
    },
  },

  // Additional metadata for AI crawlers
  other: {
    'article:publisher': 'https://interzekt.com',
    'article:author': 'Interzekt',
    'geo.region': 'MX-NLE',
    'geo.placename': 'San Pedro Garza García, Nuevo León',
    'ICBM': '25.6573,-100.4020',
    'DC.title': 'Stripe + Expo360 - Integración de Pagos',
    'DC.creator': 'Interzekt',
    'DC.subject': 'Pagos en línea, E-commerce, Showroom Virtual',
    'DC.description': 'Integración de Stripe con Expo360 para procesamiento de pagos en México',
    'DC.language': 'es-MX',
  },

  // App verification
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
  },

  // Category for content classification
  category: 'technology',
};

// JSON-LD Structured Data for SEO and GEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization Schema
    {
      '@type': 'Organization',
      '@id': 'https://expo360.vercel.app/#organization',
      name: 'Expo360 by Interzekt',
      url: 'https://expo360.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://expo360.vercel.app/expo360_logo.png',
        width: 400,
        height: 400,
      },
      sameAs: [
        'https://interzekt.com',
        'https://wa.me/528186931122',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+52-818-693-1122',
        contactType: 'sales',
        areaServed: 'MX',
        availableLanguage: ['Spanish', 'English'],
      },
    },
    // WebPage Schema
    {
      '@type': 'WebPage',
      '@id': 'https://expo360.vercel.app/stripe-benefits/#webpage',
      url: 'https://expo360.vercel.app/stripe-benefits',
      name: 'Stripe + Expo360 | Integración de Pagos para Showrooms Virtuales',
      description: 'Integra más de 100 métodos de pago con tu showroom virtual 3D usando Stripe y Expo360.',
      isPartOf: {
        '@id': 'https://expo360.vercel.app/#website',
      },
      about: {
        '@id': 'https://expo360.vercel.app/#organization',
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: 'https://expo360.vercel.app/stripe_hero.png',
      },
      breadcrumb: {
        '@id': 'https://expo360.vercel.app/stripe-benefits/#breadcrumb',
      },
      inLanguage: 'es-MX',
      potentialAction: [
        {
          '@type': 'ReadAction',
          target: ['https://expo360.vercel.app/stripe-benefits'],
        },
      ],
    },
    // BreadcrumbList Schema
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://expo360.vercel.app/stripe-benefits/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: 'https://expo360.vercel.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Integración con Stripe',
          item: 'https://expo360.vercel.app/stripe-benefits',
        },
      ],
    },
    // SoftwareApplication Schema
    {
      '@type': 'SoftwareApplication',
      name: 'Expo360',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'MXN',
        lowPrice: '0',
        highPrice: '2999',
        offerCount: '3',
      },
      featureList: [
        'Showroom virtual 3D interactivo',
        'Integración con Stripe para pagos',
        'Más de 100 métodos de pago',
        'OXXO y SPEI para México',
        'Apple Pay y Google Pay',
        'Meses sin intereses',
        'Pagos internacionales SEPA y ACH',
      ],
      screenshot: 'https://expo360.vercel.app/stripe_hero.png',
    },
    // FAQPage Schema for common questions
    {
      '@type': 'FAQPage',
      '@id': 'https://expo360.vercel.app/stripe-benefits/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Qué métodos de pago acepta Expo360 con Stripe?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Expo360 con Stripe acepta más de 100 métodos de pago incluyendo: tarjetas de crédito y débito (Visa, Mastercard, American Express), OXXO, SPEI, Apple Pay, Google Pay, PayPal, Amazon Pay, transferencias SEPA para Europa y ACH para Estados Unidos.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Puedo ofrecer meses sin intereses con Expo360?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, con la integración de Stripe en Expo360 puedes ofrecer meses sin intereses (3, 6, 9, 12, 18 o 24 meses) en la mayoría de tarjetas de crédito mexicanas.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Es seguro pagar en Expo360?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutamente. Expo360 utiliza Stripe que cuenta con cifrado AES-256 y cumplimiento PCI DSS Nivel 1, el más alto estándar de seguridad para transacciones con tarjetas.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Qué bancos mexicanos son compatibles?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Stripe acepta tarjetas de todos los principales bancos mexicanos incluyendo: BBVA, Banorte, Citibanamex, Santander, Scotiabank, HSBC, Inbursa, Banco Azteca, Nubank, Hey Banco, entre otros.',
          },
        },
      ],
    },
    // Service Schema
    {
      '@type': 'Service',
      name: 'Integración de Stripe con Expo360',
      serviceType: 'Payment Processing Integration',
      provider: {
        '@id': 'https://expo360.vercel.app/#organization',
      },
      description: 'Servicio de integración de procesamiento de pagos con Stripe para showrooms virtuales 3D',
      areaServed: {
        '@type': 'Country',
        name: 'México',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Métodos de Pago Disponibles',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Pagos con OXXO',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Transferencias SPEI',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Apple Pay y Google Pay',
            },
          },
        ],
      },
    },
  ],
};

export default function StripeBenefitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black min-h-screen">
      {/* JSON-LD Structured Data for SEO and AI Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Preload critical LCP image - WebP for modern browsers */}
      <link
        rel="preload"
        href="/stripe_hero.webp"
        as="image"
        type="image/webp"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/expo360_logo.webp"
        as="image"
        type="image/webp"
      />
      {children}
    </div>
  );
}
