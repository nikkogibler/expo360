#!/usr/bin/env node

/**
 * Hreflang Quick Reference for Pages
 * 
 * Copy and paste the metadata configuration into your page.tsx files
 * Replace the pathname and titles with your actual page information
 */

// ============================================================
// HOMEPAGE / LANDING PAGE
// ============================================================
// File: src/app/page.tsx or src/app/landing/page.tsx

const HOMEPAGE_METADATA = `
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expo360 - Solución Integral para Ferias y Exposiciones Comerciales',
  description: 'Expo360 es la plataforma especializada para capturar leads, vender y gestionar clientes en tiempo real durante ferias y exposiciones.',
  metadataBase: new URL('https://expo360.vercel.app'),
  alternates: {
    languages: {
      'es-MX': 'https://expo360.vercel.app/',
      'en': 'https://expo360.vercel.app/en/',
      'x-default': 'https://expo360.vercel.app/',
    },
    canonical: 'https://expo360.vercel.app/',
  },
  openGraph: {
    title: 'Expo360 - Solución Integral para Ferias y Exposiciones Comerciales',
    description: 'Plataforma especializada para capturar leads, vender y gestionar clientes en tiempo real.',
    url: 'https://expo360.vercel.app/',
    locale: 'es_MX',
    type: 'website',
  },
};
`;

// ============================================================
// PORQUE EXPO360 PAGE
// ============================================================
// File: src/app/porque-expo360/page.tsx

const PORQUE_METADATA = `
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Por Qué Expo360 | Solución para Ferias Comerciales',
  description: 'Descubre cómo Expo360 revoluciona la captación de leads en ferias y exposiciones comerciales.',
  metadataBase: new URL('https://expo360.vercel.app'),
  alternates: {
    languages: {
      'es-MX': 'https://expo360.vercel.app/porque-expo360',
      'en': 'https://expo360.vercel.app/en/porque-expo360',
      'x-default': 'https://expo360.vercel.app/porque-expo360',
    },
    canonical: 'https://expo360.vercel.app/porque-expo360',
  },
  openGraph: {
    title: 'Por Qué Expo360 | Solución para Ferias Comerciales',
    description: 'Descubre cómo Expo360 revoluciona la captación de leads en ferias y exposiciones.',
    url: 'https://expo360.vercel.app/porque-expo360',
    locale: 'es_MX',
    type: 'website',
  },
};
`;

// ============================================================
// ONBOARDING PAGE
// ============================================================
// File: src/app/onboarding/page.tsx

const ONBOARDING_METADATA = `
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onboarding | Expo360 - Configuración Rápida',
  description: 'Comienza con Expo360 en minutos. Configuración guiada de tu cuenta y primeros pasos.',
  metadataBase: new URL('https://expo360.vercel.app'),
  alternates: {
    languages: {
      'es-MX': 'https://expo360.vercel.app/onboarding',
      'en': 'https://expo360.vercel.app/en/onboarding',
      'x-default': 'https://expo360.vercel.app/onboarding',
    },
    canonical: 'https://expo360.vercel.app/onboarding',
  },
  openGraph: {
    title: 'Onboarding | Expo360',
    description: 'Comienza con Expo360 en minutos.',
    url: 'https://expo360.vercel.app/onboarding',
    locale: 'es_MX',
    type: 'website',
  },
};
`;

// ============================================================
// GENERIC TEMPLATE
// ============================================================
// Use this as a template for other pages
// Replace [PATHNAME], [TITLE], and [DESCRIPTION]

const GENERIC_TEMPLATE = `
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[PAGE_TITLE]',
  description: '[PAGE_DESCRIPTION]',
  metadataBase: new URL('https://expo360.vercel.app'),
  alternates: {
    languages: {
      'es-MX': 'https://expo360.vercel.app[PATHNAME]',
      'en': 'https://expo360.vercel.app/en[PATHNAME]',
      'x-default': 'https://expo360.vercel.app[PATHNAME]',
    },
    canonical: 'https://expo360.vercel.app[PATHNAME]',
  },
  openGraph: {
    title: '[PAGE_TITLE]',
    description: '[PAGE_DESCRIPTION]',
    url: 'https://expo360.vercel.app[PATHNAME]',
    locale: 'es_MX',
    type: 'website',
  },
};
`;

// ============================================================
// HOW TO USE THIS REFERENCE
// ============================================================

const USAGE_GUIDE = `
STEPS TO ADD HREFLANG TO A PAGE:

1. Copy the appropriate metadata above (or use the generic template)

2. Paste into your page.tsx file at the TOP, after imports:
   
   'use client';  // Keep if already there
   
   import type { Metadata } from 'next';
   
   export const metadata: Metadata = {
     // Paste metadata here
   };
   
   export default function YourPage() {
     // Your component code
   }

3. Replace the following placeholders:
   - [PATHNAME]: The URL path (e.g., '/contact', '/about')
   - [PAGE_TITLE]: Your page's SEO title
   - [PAGE_DESCRIPTION]: Your page's meta description (160 chars max)

4. Test:
   npm run build
   
5. Verify in Google Search Console:
   - Coverage → Index Status
   - Enhancements → Hreflang
   - Should show no errors

PAGES TO UPDATE (Priority Order):
1. src/app/page.tsx (homepage) - DONE ✓
2. src/app/porque-expo360/page.tsx - DONE ✓
3. src/app/landing/page.tsx
4. src/app/onboarding/page.tsx
5. Any other public pages
6. Contact page (if exists)
7. Blog posts (if any)

PATHNAME RULES:
- Homepage: / (es-MX) and /en/ (English)
- Other pages: /page-name (es-MX) and /en/page-name (English)
- Always include trailing slash for consistency

HREFLANG BASICS:
- es-MX: Spanish for Mexico (your primary market)
- en: English for international audience
- x-default: Fallback for unspecified regions

VERIFICATION CHECKLIST:
☐ Metadata export added to page.tsx
☐ 'use client' is before metadata export (if present)
☐ Pathname matches your actual route
☐ Title and description are unique and descriptive
☐ Build completes without errors
☐ Google Search Console shows hreflang in enhancements
`;

console.log(USAGE_GUIDE);
console.log('\n\n=== HOMEPAGE METADATA ===\n', HOMEPAGE_METADATA);
console.log('\n\n=== PORQUE EXPO360 METADATA ===\n', PORQUE_METADATA);
console.log('\n\n=== ONBOARDING METADATA ===\n', ONBOARDING_METADATA);
console.log('\n\n=== GENERIC TEMPLATE ===\n', GENERIC_TEMPLATE);

// ============================================================
// QUICK CHECKLIST FOR ALL PAGES
// ============================================================

const PAGE_CHECKLIST = `
HREFLANG IMPLEMENTATION CHECKLIST

Page: _________________________ 
Route: _________________________

Metadata Setup:
☐ import type { Metadata } from 'next';
☐ export const metadata: Metadata = { ... };
☐ Alternates.languages configured
☐ es-MX and en versions defined
☐ x-default set to es-MX

URLs:
☐ es-MX path: https://expo360.vercel.app[ROUTE]
☐ en path: https://expo360.vercel.app/en[ROUTE]
☐ Both URLs are valid and indexable
☐ No redirects between language versions

Content:
☐ Spanish version is complete in Spanish
☐ English version (if exists) is complete in English
☐ Content is unique, not auto-translated
☐ Both versions provide equal value

OpenGraph:
☐ og:title matches page title
☐ og:description matches meta description
☐ og:url matches canonical URL
☐ og:locale set to es_MX

Testing:
☐ npm run build succeeds
☐ Page renders correctly
☐ Hreflang tags visible in HTML
☐ No console errors

Google Search Console:
☐ Both es-MX and en URLs crawlable
☐ Enhancements → Hreflang shows no errors
☐ Coverage shows all versions indexed
☐ Regional targeting is correct
`;

console.log('\n\n=== PAGE CHECKLIST ===\n', PAGE_CHECKLIST);
