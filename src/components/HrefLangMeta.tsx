'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { generateHrefLangLinks } from '@/lib/hreflang';

const SITE_BASE_URL = 'https://expo360.vercel.app';

/**
 * Client-side Hreflang component
 * Injects hreflang tags into the document head for SEO
 * This handles dynamic route updates and client-side navigation
 */
export default function HrefLangMeta() {
  const pathname = usePathname();

  useEffect(() => {
    // Remove existing hreflang tags (except in head metadata)
    const existingLinks = document.querySelectorAll('link[hreflang]');
    existingLinks.forEach(link => {
      if (link.getAttribute('data-hreflang') === 'dynamic') {
        link.remove();
      }
    });

    // Generate hreflang links for current pathname
    const hrefLangLinks = generateHrefLangLinks(pathname, SITE_BASE_URL);

    // Inject new hreflang tags
    hrefLangLinks.forEach(({ rel, hrefLang, href }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.setAttribute('hreflang', hrefLang);
      link.setAttribute('data-hreflang', 'dynamic'); // Mark as dynamically inserted
      document.head.appendChild(link);
    });
  }, [pathname]);

  return null;
}
