import { MetadataRoute } from 'next'
import { getAllMetadata } from '@/config/seo-metadata'

/**
 * Next.js ISR (Incremental Static Regeneration) Configuration
 * - revalidate: 60 - Regenerates every 60 seconds
 * - New pages discovered and indexed within minutes, not days
 * - Updates to src/config/seo-metadata.ts automatically trigger rebuild
 * 
 * This allows sitemap to stay fresh with new pages/metadata
 */
export const revalidate = 60; // 60 seconds - update frequently for new pages

/**
 * Dynamic Sitemap with Hreflang Support
 * Automatically includes all pages from seo-metadata.ts config
 * Updates to metadata automatically appear in sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://expo360.vercel.app'
  const currentDate = new Date().toISOString()

  // Get all metadata from centralized config
  const allMetadata = getAllMetadata()

  // Generate sitemap entries with hreflang alternates
  const sitemapEntries: MetadataRoute.Sitemap = allMetadata.map((meta) => ({
    url: `${baseUrl}${meta.pathname === '/' ? '' : meta.pathname}`,
    lastModified: currentDate,
    changeFrequency: meta.changeFrequency,
    priority: meta.priority,
    alternates: {
      languages: {
        'es-MX': `${baseUrl}${meta.pathname === '/' ? '' : meta.pathname}`,
        'en': `${baseUrl}/en${meta.pathname === '/' ? '' : meta.pathname}`,
      },
    },
  }))

  return sitemapEntries
}
