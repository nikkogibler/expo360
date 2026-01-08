/**
 * Referral Partners Configuration
 * Define partner codes, commission rates, and tracking details
 */

export interface ReferralPartner {
  code: string; // Short URL code (e.g., "humberto")
  name: string; // Full name
  email: string; // For commission tracking
  commissionRate: number; // Percentage (e.g., 20 for 20%)
  status: 'active' | 'inactive';
}

export const REFERRAL_PARTNERS: ReferralPartner[] = [
  {
    code: 'humberto',
    name: 'Humberto Castilla E',
    email: 'humberto@example.com',
    commissionRate: 20,
    status: 'active',
  },
  // Add more partners here as needed
  // {
  //   code: 'partner2',
  //   name: 'Partner Name',
  //   email: 'partner@example.com',
  //   commissionRate: 20,
  //   status: 'active',
  // },
];

/**
 * Get partner by code
 */
export function getPartnerByCode(code: string): ReferralPartner | undefined {
  return REFERRAL_PARTNERS.find(p => p.code.toLowerCase() === code.toLowerCase() && p.status === 'active');
}

/**
 * Generate UTM-tracked URL for partner
 */
export function generateTrackingUrl(partnerCode: string, baseUrl = 'https://interzekt.com'): string {
  const partner = getPartnerByCode(partnerCode);
  if (!partner) return `${baseUrl}/expo360`;

  const params = new URLSearchParams({
    utm_source: partner.code,
    utm_medium: 'referral',
    utm_campaign: 'partner_commissions',
  });

  return `${baseUrl}/expo360?${params.toString()}`;
}
