'use client';

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '../utils/googleAnalytics';

export default function GoogleAnalytics() {
  // This component renders the exact Google tag script provided by Google
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-75WMS9GCTE"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-75WMS9GCTE');
        `}
      </Script>
    </>
  );
}