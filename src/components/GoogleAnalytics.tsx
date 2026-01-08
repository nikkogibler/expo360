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

    // Build config with campaign params if present
    const config: Record<string, string> = {
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search,
    };

    if (utmSource) config.campaign_source = utmSource;
    if (utmMedium) config.campaign_medium = utmMedium;
    if (utmCampaign) config.campaign_name = utmCampaign;

    gtag('config', GA_MEASUREMENT_ID, config);
  };

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
      onLoad={handleScriptLoad}
    />
  );
}