import { NextRequest, NextResponse } from 'next/server';

const VERCEL_API_BASE = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.NEXT_PUBLIC_VERCEL_TEAM_ID;
const VERCEL_PROJECT_ID = process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const until = searchParams.get('until') || new Date().toISOString();
    const environment = searchParams.get('environment') || 'production';

    const params = new URLSearchParams({
      projectId: VERCEL_PROJECT_ID || '',
      since,
      until,
      environment,
      ...(VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID })
    });

    const response = await fetch(`${VERCEL_API_BASE}/v1/analytics/top-devices?${params}`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Vercel API Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch visitors by device: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}