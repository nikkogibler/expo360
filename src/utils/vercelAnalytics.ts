// Vercel Analytics API integration via Next.js API routes
// This calls our internal API routes which proxy to Vercel's API

interface AnalyticsQuery {
  since?: string;
  until?: string;
  environment?: 'production' | 'preview';
}

// Get visitors by country
export async function getVisitorsByCountry(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production'
  });

  const response = await fetch(`/api/analytics/countries?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch visitors by country: ${response.statusText}`);
  }

  return response.json();
}

// Get visitors by referrer
export async function getVisitorsByReferrer(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production'
  });

  const response = await fetch(`/api/analytics/referrers?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch visitors by referrer: ${response.statusText}`);
  }

  return response.json();
}

// Get visitors by browser
export async function getVisitorsByBrowser(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production'
  });

  const response = await fetch(`/api/analytics/browsers?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch visitors by browser: ${response.statusText}`);
  }

  return response.json();
}

// Get visitors by device
export async function getVisitorsByDevice(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production'
  });

  const response = await fetch(`/api/analytics/devices?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch visitors by device: ${response.statusText}`);
  }

  return response.json();
}

// Transform data for Nivo charts
export const transformForNivoBar = (data: any[], valueKey: string, labelKey: string) => {
  return data.map(item => ({
    [labelKey]: item[labelKey] || item.name || item.country || item.browser || item.device,
    [valueKey]: item[valueKey] || item.visits || item.pageViews || item.count
  }));
};

export const transformForNivoPie = (data: any[], valueKey: string, labelKey: string) => {
  return data.map(item => ({
    id: item[labelKey] || item.name || item.country || item.browser || item.device,
    value: item[valueKey] || item.visits || item.pageViews || item.count,
    label: item[labelKey] || item.name || item.country || item.browser || item.device
  }));
};