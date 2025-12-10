import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/metadata';
import PorqueExpo360Page from './PorqueExpo360Client';

/**
 * Dynamic Metadata Generation
 * Pulls from centralized seo-metadata.ts config
 * ISR revalidate: 60 seconds
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('porque-expo360');
}

export default function Page() {
  return <PorqueExpo360Page />;
}
