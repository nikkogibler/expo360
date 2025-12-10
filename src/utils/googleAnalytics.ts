// Google Analytics 4 integration utilities
// This file handles both tracking events and retrieving analytics data
// Supports multiple measurement IDs for different properties

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Your property measurement ID
export const GA_MEASUREMENT_ID = 'G-E8NCY2YTP3';

// All measurement IDs to track
export const GA_MEASUREMENT_IDS = [GA_MEASUREMENT_ID].filter(Boolean);

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_IDS.length) {
    console.warn('No Google Analytics Measurement IDs found');
    return;
  }

  // Initialize dataLayer once
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());

  // Configure all measurement IDs
  GA_MEASUREMENT_IDS.forEach((id) => {
    window.gtag('config', id, {
      page_title: document.title,
      page_location: window.location.href,
    });
  });

  console.log('✅ Google Analytics initialized with IDs:', GA_MEASUREMENT_IDS);
};

// Track page views across all measurement IDs
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    GA_MEASUREMENT_IDS.forEach((id) => {
      window.gtag('config', id, {
        page_path: url,
        page_title: title,
      });
    });
  }
};

// Track custom events across all measurement IDs
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Track event in all configured measurement IDs
    GA_MEASUREMENT_IDS.forEach((id) => {
      window.gtag('event', eventName, {
        ...parameters,
        send_to: id,
      });
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
// we'll use our Google Analytics service for actual data
// In a production environment, you would use the Google Analytics Reporting API
// with proper authentication and service account setup.

export interface AnalyticsData extends Record<string, unknown> {
  id: string;
  value: number;
  label?: string;
}

// Updated function to use actual Google Analytics Data API
export const getGoogleAnalyticsData = async (
  metric: 'countries' | 'browsers' | 'referrers' | 'devices',
  dateRange: { since: string; until: string }
): Promise<{ data: AnalyticsData[] }> => {
  try {
    // Call our internal API routes that use the Google Analytics Data API
    const response = await fetch(`/api/analytics/${metric}?since=${dateRange.since}&until=${dateRange.until}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${metric} data: ${response.statusText}`);
    }
    
    const result = await response.json();
    return { data: result.data || [] };
  } catch (error) {
    console.error(`Error fetching ${metric} data:`, error);
    return { data: [] };
  }
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