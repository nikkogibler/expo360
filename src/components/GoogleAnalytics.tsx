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
          
          // Parse UTM params from URL
          var urlParams = new URLSearchParams(window.location.search);
          var utmSource = urlParams.get('utm_source');
          var utmMedium = urlParams.get('utm_medium');
          var utmCampaign = urlParams.get('utm_campaign');
          
          // Debug logs
          if (utmSource) console.log('GA4: Captured utm_source:', utmSource);
          
          // Set campaign params directly using 'set' command
          var campaignData = {};
          if (utmSource) campaignData.source = utmSource;
          if (utmMedium) campaignData.medium = utmMedium;
          if (utmCampaign) campaignData.name = utmCampaign;
          
          if (Object.keys(campaignData).length > 0) {
            gtag('set', 'campaign', campaignData);
            console.log('GA4: Set campaign context:', campaignData);
          }
          
          // Build config object
          var configObj = {
            page_location: window.location.href,
            page_path: window.location.pathname + window.location.search,
            cookie_domain: window.location.hostname,
            cookie_flags: 'SameSite=None;Secure'
          };
          
          console.log('GA4: Sending config with location:', configObj.page_location);
          
          gtag('config', '${GA_MEASUREMENT_ID}', configObj);
        `}
      </Script>
    </>
  );
}