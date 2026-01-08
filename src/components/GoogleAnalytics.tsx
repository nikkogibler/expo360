'use client';

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '../utils/googleAnalytics';

export default function GoogleAnalytics() {
  // Return null if measurement ID is not configured
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  const handleScriptLoad = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());

    // Parse UTM parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    // Disable automatic page view - we'll send it manually with UTM params
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
    });

    // Send page view event with UTM parameters explicitly set
    const eventParams: Record<string, string> = {
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search,
      page_title: document.title,
    };

    // Add campaign parameters if present
    if (utmSource) {
      eventParams.campaign_source = utmSource;
      eventParams.source = utmSource;
    }
    if (utmMedium) {
      eventParams.campaign_medium = utmMedium;
      eventParams.medium = utmMedium;
    }
    if (utmCampaign) {
      eventParams.campaign_name = utmCampaign;
      eventParams.campaign = utmCampaign;
    }

    // Log for debugging
    console.log('📊 GA4 page_view with params:', eventParams);

    gtag('event', 'page_view', eventParams);
  };

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
      onLoad={handleScriptLoad}
    />
  );
}