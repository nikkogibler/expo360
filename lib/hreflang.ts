/**
 * Hreflang utility for multi-regional SEO
 * Supports Mexico (es-MX) and international versions
 */

export interface HrefLangConfig {
  pathname: string;
  baseUrl: string;
}

/**
 * Generate hreflang link tags for international SEO
 * Returns array of hreflang entries for Mexico and international audience
 * 
 * @param pathname - Current page pathname (e.g., '/about', '/contact')
 * @param baseUrl - Base URL of your site (e.g., 'https://expo360.vercel.app')
 * @returns Array of hreflang link objects for Head component
 * 
 * Structure:
 * - es-MX: Mexico-specific version
 * - en: International English version (fallback for rest of world)
 * - x-default: Default/fallback for all other regions
 */
export function generateHrefLangLinks(pathname: string, baseUrl: string): HrefLangLink[] {
  // Normalize pathname
  const cleanPath = pathname === '/' ? '' : pathname;
  
  return [
    {
      rel: 'alternate',
      hrefLang: 'es-MX',
      href: `${baseUrl}${cleanPath || '/'}`,
    },
    {
      rel: 'alternate',
      hrefLang: 'en',
      href: `${baseUrl}/en${cleanPath || '/'}`,
    },
    {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: `${baseUrl}${cleanPath || '/'}`,
    },
  ];
}

/**
 * Check if a pathname is the root or homepage
 */
export function isRootPath(pathname: string): boolean {
  return pathname === '/' || pathname === '';
}

/**
 * Get language from pathname
 * Returns 'es-MX' or 'en' or null if not detected
 */
export function getLanguageFromPathname(pathname: string): string | null {
  if (pathname.startsWith('/en/') || pathname === '/en') {
    return 'en';
  }
  if (pathname === '/' || !pathname.startsWith('/en')) {
    return 'es-MX';
  }
  return null;
}

/**
 * Convert a pathname from one language to another
 */
export function convertPathnameLang(pathname: string, targetLang: 'es-MX' | 'en'): string {
  // Remove language prefix if exists
  let cleanPath = pathname;
  if (pathname.startsWith('/en/')) {
    cleanPath = pathname.slice(3);
  } else if (pathname === '/en') {
    cleanPath = '/';
  }
  
  // Add target language prefix if not es-MX (es-MX is the default)
  if (targetLang === 'en') {
    return `/en${cleanPath}`;
  }
  return cleanPath;
}

/**
 * Type for hreflang link element
 */
export interface HrefLangLink {
  rel: 'alternate';
  hrefLang: string;
  href: string;
}

/**
 * Map hreflang links to Next.js Link metadata format
 */
export function hrefLangToMetadata(links: HrefLangLink[]): Array<{ 
  rel: string; 
  hrefLang: string; 
  href: string;
}> {
  return links.map(link => ({
    rel: link.rel,
    hrefLang: link.hrefLang,
    href: link.href,
  }));
}
