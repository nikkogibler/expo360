import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/metadata';
import LandingPage from './LandingPageClient';

/**
 * Dynamic Metadata Generation
 * This pulls metadata from src/config/seo-metadata.ts
 * Updates to SEO content don't require code changes or redeployment!
 * ISR revalidate: 60 seconds
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('home');
}

export default function Page() {
  return <LandingPage />;
}
