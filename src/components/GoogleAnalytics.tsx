'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { GA_MEASUREMENT_ID } from '../utils/googleAnalytics';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;

    // Track page views on route changes
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      debug_mode: true
    });

    // Explicitly handle UTMs if present during navigation
    const utmSource = searchParams.get('utm_source');
    if (utmSource) {
      window.gtag('event', 'page_view', {
        campaign_source: utmSource,
        campaign_medium: searchParams.get('utm_medium') || 'referral',
        campaign_name: searchParams.get('utm_campaign') || 'partner_commissions',
        debug_mode: true
      });
    }
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Load Global Site Tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      {/* Standard GA4 Initialization Script */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Config with cookie domain fix for vercel.app
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            cookie_domain: window.location.hostname.includes('vercel.app') ? window.location.hostname : 'auto',
            debug_mode: true
          });
        `}
      </Script>
    </>
  );
}