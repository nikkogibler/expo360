import { NextRequest, NextResponse } from 'next/server';
import { googleAnalyticsService } from '../../../../lib/googleAnalyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const until = searchParams.get('until') || new Date().toISOString();

    console.log('📊 Fetching countries data from Google Analytics...');

    const result = await googleAnalyticsService.getVisitorsByCountry({
      since,
      until,
      limit: 10
    });

    // Always return success, even with mock data
    console.log('✅ Countries data fetched successfully:', result.data.length, 'results');

    return NextResponse.json({
      data: result.data,
      totalResults: result.totalResults
    });

  } catch (error) {
    console.error('❌ API Route Error:', error);
    // Return empty data instead of error
    return NextResponse.json({
      data: [],
      totalResults: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}