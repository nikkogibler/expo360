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

    // Capture UTM parameters
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmTerm = searchParams.get('utm_term');
    const utmContent = searchParams.get('utm_content');
    const utmId = searchParams.get('utm_id');

    // Build event parameters using GA4's standard naming convention
    const eventParams: Record<string, any> = {
      page_path: pathname,
      page_location: window.location.href,
      // Standard GA4 campaign attribution keys (short form)
      source: utmSource || undefined,
      medium: utmMedium || undefined,
      campaign: utmCampaign || undefined,
      term: utmTerm || undefined,
      content: utmContent || undefined,
      campaign_id: utmId || undefined,
    };

    // Remove undefined values to avoid GA4 confusion
    Object.keys(eventParams).forEach(key => eventParams[key] === undefined && delete eventParams[key]);

    // Track page view with campaign parameters
    window.gtag('event', 'page_view', eventParams);
    
    console.log('GA4 page_view sent with params:', eventParams);
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
            page_referrer: document.referrer,
            anonymize_ip: false,
            send_page_view: false,
            cookie_domain: 'expo360.vercel.app',
            cookie_flags: 'SameSite=None;Secure',
            update_via_area: true
          });
        `}
      </Script>
    </>
  );
}
