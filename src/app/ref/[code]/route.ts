/**
 * Referral Short Link Redirect
 * Converts short URLs like /ref/humberto to tracked Expo360 links
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTrackingUrl, getPartnerByCode } from '@/config/referralPartners';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validate partner exists
  const partner = getPartnerByCode(code);
  if (!partner) {
    // Redirect to main Expo360 page if partner code not found
    return NextResponse.redirect(new URL('/expo360', request.url));
  }

  // Generate tracked URL
  const trackedUrl = generateTrackingUrl(code);

  // TODO: Optional - Log click in Supabase for detailed analytics
  // await logReferralClick(code);

  // Redirect to tracked URL
  return NextResponse.redirect(trackedUrl);
}
