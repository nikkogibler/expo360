/**
 * Centralized SEO Metadata Configuration
 * This file allows non-developers to update page titles, descriptions,
 * and other SEO settings without modifying code or redeploying.
 * 
 * Place this in: src/config/seo-metadata.ts
 * 
 * Last Updated: 2025-12-10
 * Cache Invalidation: Run 'npm run revalidate-seo' or wait for ISR (60 seconds)
 */

export interface PageMetadata {
  title: string;
  description: string;
  pathname: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  ogImage?: string;
}

/**
 * SEO Configuration for all pages
 * Update this object to change page metadata without code deployment
 */
export const seoMetadata: Record<string, PageMetadata> = {
  // Homepage
  home: {
    title: 'Expo360 - Solución Integral para Ferias y Exposiciones Comerciales',
    description:
      'Expo360 es la plataforma especializada para capturar leads, vender y gestionar clientes en tiempo real durante ferias y exposiciones. Aumenta tu ROI con tecnología móvil.',
    pathname: '/',
    changeFrequency: 'weekly',
    priority: 1.0,
  },

  // Why Expo360
  'porque-expo360': {
    title: 'Por Qué Expo360 | Solución para Ferias Comerciales',
    description:
      'Descubre cómo Expo360 revoluciona la captación de leads en ferias y exposiciones comerciales. Aumenta ventas, automatiza procesos y gestiona clientes de forma inteligente.',
    pathname: '/porque-expo360',
    changeFrequency: 'monthly',
    priority: 0.9,
  },

  // Stripe Benefits
  'stripe-benefits': {
    title: 'Integración Stripe | Pagos en Ferias Comerciales - Expo360',
    description:
      'Procesa pagos al instante en ferias con nuestra integración Stripe. Cierra ventas directamente desde tu stand sin complicaciones.',
    pathname: '/stripe-benefits',
    changeFrequency: 'monthly',
    priority: 0.85,
  },

  // FAQ
  'preguntas-frecuentes': {
    title: 'Preguntas Frecuentes | Expo360',
    description:
      'Respuestas a las preguntas más comunes sobre Expo360. Aprende cómo funcionan nuestras características, precios, integraciones y más.',
    pathname: '/preguntas-frecuentes',
    changeFrequency: 'monthly',
    priority: 0.8,
  },

  // Landing Page (if different from home)
  landing: {
    title: 'Expo360 - Captura de Leads en Tiempo Real para Ferias',
    description:
      'Solución completa para ferias: captura datos, genera cotizaciones y cierra ventas instantáneamente. Sin papel, sin errores.',
    pathname: '/landing',
    changeFrequency: 'weekly',
    priority: 0.8,
  },

  // Onboarding
  onboarding: {
    title: 'Configuración Rápida | Expo360 - Comienza en Minutos',
    description:
      'Onboarding guiado paso a paso. Configura tu cuenta Expo360 en menos de 5 minutos y comienza a capturar leads.',
    pathname: '/onboarding',
    changeFrequency: 'monthly',
    priority: 0.75,
  },

  // Sign In
  signin: {
    title: 'Iniciar Sesión | Expo360',
    description: 'Accede a tu cuenta Expo360 para gestionar tus ferias, leads y ventas.',
    pathname: '/signin',
    changeFrequency: 'yearly',
    priority: 0.5,
  },

  // Expo360 Dashboard
  'expo360': {
    title: 'Dashboard | Expo360 - Panel de Control',
    description:
      'Gestiona tus ferias, visualiza analytics en tiempo real, y administra tus prospectos desde un solo lugar.',
    pathname: '/expo360',
    changeFrequency: 'weekly',
    priority: 0.7,
  },
};

/**
 * Get metadata for a specific page
 * @param key - The page key from seoMetadata (e.g., 'home', 'porque-expo360')
 * @returns PageMetadata object or undefined if not found
 */
export function getPageMetadata(key: string): PageMetadata | undefined {
  return seoMetadata[key];
}

/**
 * Get all metadata entries (useful for sitemap generation)
 */
export function getAllMetadata(): PageMetadata[] {
  return Object.values(seoMetadata);
}

/**
 * Update metadata for a page (can be called from API routes)
 * This allows external systems (CMS, admin panel) to update SEO content
 * @param key - Page key
 * @param updates - Partial metadata to update
 */
export function updatePageMetadata(
  key: string,
  updates: Partial<PageMetadata>
): void {
  if (seoMetadata[key]) {
    seoMetadata[key] = {
      ...seoMetadata[key],
      ...updates,
    };
  }
}

/**
 * Usage Instructions:
 *
 * 1. UPDATE METADATA WITHOUT REDEPLOY:
 *    - Edit this file (seo-metadata.ts)
 *    - Change title, description, priority, etc.
 *    - ISR will automatically regenerate within 60 seconds
 *
 * 2. TO FORCE IMMEDIATE CACHE INVALIDATION:
 *    - Call: npm run revalidate-seo
 *    - Or manually trigger revalidation via API route (see api/revalidate-seo.ts)
 *
 * 3. IN YOUR PAGE COMPONENTS:
 *    - Import: import { getPageMetadata } from '@/config/seo-metadata'
 *    - Use in generateMetadata():
 *      export async function generateMetadata() {
 *        const meta = getPageMetadata('page-key');
 *        return { title: meta.title, description: meta.description, ... }
 *      }
 *
 * 4. SYNC WITH SITEMAP:
 *    - sitemap.ts automatically reads this file
 *    - Updates here = sitemap updates automatically (ISR)
 *
 * BENEFIT: Marketing can update SEO content without developers or redeployment!
 */
