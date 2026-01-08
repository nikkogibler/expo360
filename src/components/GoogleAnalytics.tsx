'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;

    // Track page views whenever route changes
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
    });

    // If UTM parameters are present, ensure they are set for the session
    const utmSource = searchParams.get('utm_source');
    if (utmSource) {
      window.gtag('set', {
        'campaign': {
          'source': utmSource,
          'medium': searchParams.get('utm_medium') || 'referral',
          'name': searchParams.get('utm_campaign') || 'organic',
        }
      });
    }
  }, [pathname, searchParams]);

  if (!GA_ID) {
    console.warn('GA_ID not found in environment variables');
    return null;
  }

  return (
    <>
      {/* Load Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      {/* Initialize Google Analytics */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: false,
          });
        `}
      </Script>
    </>
  );
}
