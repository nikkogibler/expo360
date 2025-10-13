// src/utils/nameParser.ts

/**
 * Parses a full name into first and last name components
 * Uses Strategy 3: Best guess + user correction
 * 
 * Examples:
 * - "Juan Pérez" → { firstName: "Juan", lastName: "Pérez" }
 * - "María García López" → { firstName: "María", lastName: "García López" }
 * - "José Luis Rodríguez" → { firstName: "José", lastName: "Luis Rodríguez" } (user can correct)
 * - "Visitante Anónimo" → { firstName: "", lastName: "", isAnonymous: true }
 */

export interface ParsedName {
  firstName: string;
  lastName: string;
  isAnonymous: boolean;
}

export function parseFullName(fullName: string | null | undefined): ParsedName {
  // Handle null/undefined/empty
  if (!fullName || fullName.trim() === '') {
    return { firstName: '', lastName: '', isAnonymous: true };
  }

  const trimmed = fullName.trim();
  
  // Check for anonymous visitors
  const lowerName = trimmed.toLowerCase();
  if (lowerName.includes('visitante') || 
      lowerName.includes('anónimo') || 
      lowerName.includes('anonimo') ||
      trimmed.endsWith('@temp.com')) {
    return { firstName: '', lastName: '', isAnonymous: true };
  }
  
  // Split name by whitespace
  const parts = trimmed.split(/\s+/);
  
  // Single word (just first name)
  if (parts.length === 1) {
    return { 
      firstName: parts[0], 
      lastName: '', 
      isAnonymous: false 
    };
  }
  
  // Two words (standard case)
  if (parts.length === 2) {
    return { 
      firstName: parts[0], 
      lastName: parts[1], 
      isAnonymous: false 
    };
  }
  
  // Three or more words
  // Strategy: First word = first name, rest = last name
  // User can correct if it's a compound first name like "José Luis"
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
    isAnonymous: false
  };
}

/**
 * Helper to check if customer info is complete for checkout
 */
export interface Customer {
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  customer_type?: string | null;
  landing_source?: string | null;
  shipping_street?: string | null;
  shipping_colonia?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  billing_same_as_shipping?: boolean | null;
  billing_street?: string | null;
  billing_colonia?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_postal_code?: string | null;
  checkout_info_complete?: boolean | null;
}

export function isCustomerInfoComplete(customer: Customer | null): boolean {
  if (!customer) return false;
  
  // Check basic contact info
  const hasBasicInfo = 
    customer.name && 
    !customer.name.startsWith('Visitante Anónimo') &&
    customer.email && 
    !customer.email.endsWith('@temp.com') &&
    customer.whatsapp &&
    customer.customer_type;
  
  // Check shipping address
  const hasShippingAddress = 
    customer.shipping_street &&
    customer.shipping_colonia &&
    customer.shipping_city &&
    customer.shipping_state &&
    customer.shipping_postal_code;
  
  // Check billing (if different from shipping)
  const hasBillingAddress = 
    customer.billing_same_as_shipping === true ||
    (customer.billing_street &&
     customer.billing_colonia &&
     customer.billing_city &&
     customer.billing_state &&
     customer.billing_postal_code);
  
  return !!(hasBasicInfo && hasShippingAddress && hasBillingAddress);
}
