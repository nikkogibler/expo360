'use client';

import { GA_MEASUREMENT_ID } from '../utils/googleAnalytics';

export default function GoogleAnalytics() {
  // This component renders the exact Google tag script provided by Google
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-75WMS9GCTE"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-75WMS9GCTE');
          `,
        }}
      />
    </>
  );
}