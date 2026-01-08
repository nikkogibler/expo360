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
          
          // Set campaign params directly using 'set' command - Primary Method
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
            cookie_domain: 'expo360.vercel.app', // Hardcoded for stability
            cookie_flags: 'max-age=7200;secure;samesite=none'
          };

          // Also add to config object as Backup Method
          if (utmSource) configObj.campaign_source = utmSource;
          if (utmMedium) configObj.campaign_medium = utmMedium;
          if (utmCampaign) configObj.campaign_name = utmCampaign;
          
          console.log('GA4: Sending config to', '${GA_MEASUREMENT_ID}' ,'with cookie_domain:', configObj.cookie_domain);
          
          gtag('config', '${GA_MEASUREMENT_ID}', configObj);
        `}
      </Script>
    </>
  );
}