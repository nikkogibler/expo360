// Vercel Analytics API integration
// You'll need to get your team ID and create an API token from Vercel dashboard

const VERCEL_API_BASE = 'https://api.vercel.com';

// You'll need to set these in your environment variables
const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.NEXT_PUBLIC_VERCEL_TEAM_ID;
const VERCEL_PROJECT_ID = process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID;

interface AnalyticsQuery {
  since?: string;
  until?: string;
  environment?: 'production' | 'preview';
}

// Get page views data
export async function getPageViews(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID || '',
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production',
    ...VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }
  });

  const response = await fetch(`${VERCEL_API_BASE}/v1/analytics/page-views?${params}`, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page views: ${response.statusText}`);
  }

  return response.json();
}

// Get top pages data
export async function getTopPages(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID || '',
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production',
    ...VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }
  });

  const response = await fetch(`${VERCEL_API_BASE}/v1/analytics/top-pages?${params}`, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch top pages: ${response.statusText}`);
  }

  return response.json();
}

// Get visitors by country
export async function getVisitorsByCountry(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID || '',
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production',
    ...VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }
  });

  const response = await fetch(`${VERCEL_API_BASE}/v1/analytics/top-countries?${params}`, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch visitors by country: ${response.statusText}`);
  }

  return response.json();
}

// Get visitors by referrer
export async function getVisitorsByReferrer(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID || '',
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production',
    ...VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }
  });

  const response = await fetch(`${VERCEL_API_BASE}/v1/analytics/top-referrers?${params}`, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch visitors by referrer: ${response.statusText}`);
  }

  return response.json();
}

// Get visitors by browser
export async function getVisitorsByBrowser(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID || '',
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production',
    ...VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }
  });

  const response = await fetch(`${VERCEL_API_BASE}/v1/analytics/top-browsers?${params}`, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch visitors by browser: ${response.statusText}`);
  }

  return response.json();
}

// Get visitors by device
export async function getVisitorsByDevice(query: AnalyticsQuery = {}) {
  const params = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID || '',
    since: query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    until: query.until || new Date().toISOString(),
    environment: query.environment || 'production',
    ...VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }
  });

  const response = await fetch(`${VERCEL_API_BASE}/v1/analytics/top-devices?${params}`, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

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