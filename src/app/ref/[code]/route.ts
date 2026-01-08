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

  // Generate tracked URL using the same origin as the request
  const origin = request.nextUrl.origin;
  const utmParams = new URLSearchParams({
    utm_source: code,
    utm_medium: 'referral',
    utm_campaign: 'partner_commissions',
  });

  // Redirect to tracked URL
  return NextResponse.redirect(new URL(`/expo360?${utmParams.toString()}`, origin));
}
