'use client';

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '../utils/googleAnalytics';

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Parse UTM params and set them before config
          var params = new URLSearchParams(window.location.search);
          var source = params.get('utm_source');
          var medium = params.get('utm_medium');
          var campaign = params.get('utm_campaign');
          
          if (source || medium || campaign) {
            gtag('set', 'campaign', {
              source: source || '(direct)',
              medium: medium || '(none)',
              name: campaign || '(not set)'
            });
          }
          
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_location: window.location.href
          });
        `}
      </Script>
    </>
  );
}