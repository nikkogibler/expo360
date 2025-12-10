import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://expo360.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/main/admin/',
          '/_next/',
          '/private/',
        ],
      },
      // Specific rules for AI crawlers (GEO optimization)
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/stripe-benefits',
          '/porque-expo360',
          '/preguntas-frecuentes',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/stripe-benefits',
          '/porque-expo360',
          '/preguntas-frecuentes',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: [
          '/',
          '/stripe-benefits',
          '/porque-expo360',
          '/preguntas-frecuentes',
        ],
      },
      {
        userAgent: 'Anthropic-AI',
        allow: [
          '/',
          '/stripe-benefits',
          '/porque-expo360',
          '/preguntas-frecuentes',
        ],
      },
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/',
          '/stripe-benefits',
          '/porque-expo360',
          '/preguntas-frecuentes',
        ],
      },
      {
        userAgent: 'Bytespider',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
