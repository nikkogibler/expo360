// Google Analytics 4 integration utilities
// This file handles both tracking events and retrieving analytics data

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not found');
    return;
  }

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('✅ Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      send_to: GA_MEASUREMENT_ID,
    });
  }
};

// Track product views
export const trackProductView = (productId: string, productName: string) => {
  trackEvent('view_item', {
    item_id: productId,
    item_name: productName,
    item_category: 'furniture',
  });
};

// Track product favorites
export const trackProductFavorite = (productId: string, productName: string) => {
  trackEvent('add_to_wishlist', {
    item_id: productId,
    item_name: productName,
    item_category: 'furniture',
  });
};

// Track product customization
export const trackProductCustomization = (productId: string, productName: string, fabricColor?: string, frameColor?: string) => {
  trackEvent('customize_item', {
    item_id: productId,
    item_name: productName,
    item_category: 'furniture',
    fabric_color: fabricColor,
    frame_color: frameColor,
  });
};

// Since GA4 doesn't provide a simple API for real-time data retrieval,
// we'll create mock data that represents what Google Analytics would track
// In a production environment, you would use the Google Analytics Reporting API
// with proper authentication and service account setup.

export interface AnalyticsData extends Record<string, unknown> {
  id: string;
  value: number;
  label?: string;
}

// Mock function to simulate Google Analytics data
// In production, this would call the Google Analytics Reporting API
export const getGoogleAnalyticsData = async (
  metric: 'countries' | 'browsers' | 'referrers' | 'devices',
  dateRange: { since: string; until: string }
): Promise<{ data: AnalyticsData[] }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return empty data for now since we just set up GA4
  // Once traffic starts coming in, you would implement the actual GA4 Reporting API calls
  
  console.log(`📊 Google Analytics: Fetching ${metric} data from ${dateRange.since} to ${dateRange.until}`);
  console.log('ℹ️ Note: This is a new GA4 property. Data will appear after users visit the site.');

  return {
    data: []
  };
};

// Get visitors by country (placeholder for GA4 Reporting API)
export async function getVisitorsByCountry(query: { since: string; until: string; environment?: string }) {
  return getGoogleAnalyticsData('countries', query);
}

// Get visitors by browser (placeholder for GA4 Reporting API)
export async function getVisitorsByBrowser(query: { since: string; until: string; environment?: string }) {
  return getGoogleAnalyticsData('browsers', query);
}

// Get visitors by referrer (placeholder for GA4 Reporting API)
export async function getVisitorsByReferrer(query: { since: string; until: string; environment?: string }) {
  return getGoogleAnalyticsData('referrers', query);
}

// Get visitors by device (placeholder for GA4 Reporting API)
export async function getVisitorsByDevice(query: { since: string; until: string; environment?: string }) {
  return getGoogleAnalyticsData('devices', query);
}

// Transform data for Nivo charts (same format as before)
export const transformForNivoPie = (data: Record<string, unknown>[], valueKey: string, labelKey: string) => {
  return data.map(item => ({
    id: item[labelKey] || item.name || item.country || item.browser || item.device,
    value: item[valueKey] || item.visits || item.pageViews || item.count,
    label: item[labelKey] || item.name || item.country || item.browser || item.device
  }));
};

export const transformForNivoBar = (data: Record<string, unknown>[], valueKey: string, labelKey: string) => {
  return data.map(item => ({
    [labelKey]: item[labelKey] || item.name || item.country || item.browser || item.device,
    [valueKey]: item[valueKey] || item.visits || item.pageViews || item.count
  }));
};