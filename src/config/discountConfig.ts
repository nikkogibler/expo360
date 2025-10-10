// Discount Configuration System
// Maps landing sources to their respective discount percentages

export interface DiscountConfig {
  [landingSource: string]: number;
}

export const DISCOUNT_CONFIG: DiscountConfig = {
  // Original Expo gets 15% discount
  'Expo Mueble Internacional': 0.15,
  
  // Special events
  'Evento Especial': 0.05,              // 5% discount for special events
  
  // Store locations get no discount by default
  'Tienda Saltillo': 0.0,
  'Tienda Vasconcelos': 0.0,
  
  // International trade shows - can be configured per event
  'Salone del Mobile Milan': 0.0,        // Can be updated for specific promotions
  'Casual Market Atlanta': 0.0,         // Can be updated for specific promotions
  'CIFF Copenhagen': 0.0,               // Can be updated for specific promotions
  'Movelsul Brazil': 0.0,               // Can be updated for specific promotions
  'Spoga+Gafa Cologne': 0.0,            // Can be updated for specific promotions
};

// Default discount for unknown or legacy landing sources
export const DEFAULT_DISCOUNT = 0.15; // Keep existing behavior for legacy customers

/**
 * Get discount percentage for a given landing source
 * @param landingSource - The landing source from customer record
 * @returns Discount percentage (0.15 = 15%)
 */
export function getDiscountForLandingSource(landingSource: string | null | undefined): number {
  if (!landingSource) {
    return DEFAULT_DISCOUNT; // Legacy customers without landing_source get expo discount
  }
  
  return DISCOUNT_CONFIG[landingSource] ?? DEFAULT_DISCOUNT;
}

/**
 * Check if customer qualifies for any discount
 * @param landingSource - The landing source from customer record
 * @returns Boolean indicating if discount should be applied
 */
export function hasDiscount(landingSource: string | null | undefined): boolean {
  return getDiscountForLandingSource(landingSource) > 0;
}

/**
 * Get discount display name for UI
 * @param landingSource - The landing source from customer record
 * @returns Human-readable discount name
 */
export function getDiscountDisplayName(landingSource: string | null | undefined): string {
  if (!landingSource || landingSource === 'Expo Mueble Internacional') {
    return 'Descuento Expo 15%';
  }
  
  const discountPercent = Math.round(getDiscountForLandingSource(landingSource) * 100);
  return `Descuento ${landingSource} ${discountPercent}%`;
}