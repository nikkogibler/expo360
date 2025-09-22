import { NextRequest, NextResponse } from 'next/server';

const VERCEL_API_BASE = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.NEXT_PUBLIC_VERCEL_TEAM_ID;
const VERCEL_PROJECT_ID = process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID;

export async function GET(request: NextRequest) {
  try {
    console.log('API Route - Environment check:', {
      hasToken: !!VERCEL_TOKEN,
      hasProjectId: !!VERCEL_PROJECT_ID,
      hasTeamId: !!VERCEL_TEAM_ID,
      tokenStart: VERCEL_TOKEN?.substring(0, 10) + '...',
      projectId: VERCEL_PROJECT_ID,
      teamId: VERCEL_TEAM_ID
    });

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

    const apiUrl = `${VERCEL_API_BASE}/v1/analytics/top-countries?${params}`;
    console.log('Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vercel API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      return NextResponse.json(
        { 
          error: `Failed to fetch visitors by country: ${response.statusText}`,
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Success! Received data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}