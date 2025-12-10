/**
 * Helper function to generate page-specific metadata with hreflang tags
 * Now integrated with centralized SEO metadata configuration
 * 
 * Use this in your page.tsx files with generateMetadata() API
 */

import type { Metadata } from 'next';
import { generateHrefLangLinks } from '@/lib/hreflang';
import { getPageMetadata, PageMetadata } from '@/config/seo-metadata';

const SITE_BASE_URL = 'https://expo360.vercel.app';

/**
 * Generate page-specific metadata with hreflang alternates
 * Pulls from centralized seo-metadata.ts config (updates without redeploy!)
 * 
 * @param metadataKey - Key from seo-metadata.ts (e.g., 'home', 'porque-expo360')
 * @param overrides - Optional overrides for specific pages
 * @returns Metadata object with hreflang configuration
 * 
 * @example
 * // In page.tsx with generateMetadata:
 * export async function generateMetadata() {
 *   return buildPageMetadata('porque-expo360');
 * }
 */
export function buildPageMetadata(
  metadataKey: string,
  overrides?: Partial<PageMetadata>
): Metadata {
  // Get base metadata from config
  let pageMetadata = getPageMetadata(metadataKey);
  
  if (!pageMetadata) {
    console.warn(`Metadata not found for key: ${metadataKey}`);
    // Fallback to empty but valid metadata
    pageMetadata = {
      title: 'Expo360',
      description: 'Expo360 - Solución para Ferias Comerciales',
      pathname: '/',
      changeFrequency: 'monthly',
      priority: 0.5,
    };
  }

  // Apply any overrides
  if (overrides) {
    pageMetadata = { ...pageMetadata, ...overrides };
  }

  const { title, description, pathname, ogImage } = pageMetadata;
  const hrefLangLinks = generateHrefLangLinks(pathname, SITE_BASE_URL);

  return {
    title,
    description,
    metadataBase: new URL(SITE_BASE_URL),
    alternates: {
      languages: {
        'es-MX': `${SITE_BASE_URL}${pathname === '/' ? '' : pathname}`,
        'en': `${SITE_BASE_URL}/en${pathname === '/' ? '' : pathname}`,
        'x-default': `${SITE_BASE_URL}${pathname === '/' ? '' : pathname}`,
      },
      canonical: `${SITE_BASE_URL}${pathname === '/' ? '' : pathname}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_BASE_URL}${pathname === '/' ? '' : pathname}`,
      locale: 'es_MX',
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
  };
}

/**
 * Simpler helper for basic page metadata with alternates
 */
export function getPageHrefLangs(pathname: string) {
  return generateHrefLangLinks(pathname, SITE_BASE_URL);
}

/**
 * Get canonical URL for a page
 */
export function getCanonicalUrl(pathname: string): string {
  return `${SITE_BASE_URL}${pathname === '/' ? '' : pathname}`;
}

/**
 * Get alternate URL for different language/region
 */
export function getAlternateUrl(pathname: string, language: 'es-MX' | 'en'): string {
  if (language === 'en') {
    return `${SITE_BASE_URL}/en${pathname === '/' ? '' : pathname}`;
  }
  return `${SITE_BASE_URL}${pathname === '/' ? '' : pathname}`;
}
