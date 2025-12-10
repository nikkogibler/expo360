/**
 * Multi-Client GA4 Management System
 * 
 * Future feature: Allow clients to add their own GA4 measurement IDs
 * for their landing pages and store locations.
 * 
 * This file documents the architecture and provides the foundation.
 * Implementation will be added when feature is enabled.
 */

// ============================================================
// PHASE 1: CURRENT (Single Analytics ID)
// ============================================================

// Current setup: One GA4 property for Expo360
export const EXPO360_GA4_ID = 'G-E8NCY2YTP3';

// ============================================================
// PHASE 2: FUTURE (Client Custom IDs)
// ============================================================

/**
 * Client GA4 Configuration
 * 
 * Future database structure (Supabase):
 * 
 * Table: client_analytics
 * Columns:
 *   - id (uuid, primary key)
 *   - client_id (uuid, foreign key to clients)
 *   - property_name (string) - e.g., "Main Landing Page"
 *   - ga4_measurement_id (string) - e.g., "G-XXXXXXXXXX"
 *   - property_type (enum) - 'landing_page' | 'store_location' | 'custom'
 *   - enabled (boolean)
 *   - created_at (timestamp)
 *   - updated_at (timestamp)
 * 
 * Example data:
 * {
 *   client_id: "123e4567-e89b-12d3-a456-426614174000",
 *   property_name: "Mexico City Showroom",
 *   ga4_measurement_id: "G-ABC123XYZ",
 *   property_type: "store_location",
 *   enabled: true
 * }
 */

/**
 * Get all active GA4 IDs for a client
 * 
 * Future implementation:
 * 
 * export async function getClientGA4IDs(clientId: string): Promise<string[]> {
 *   const supabase = createClient();
 *   
 *   const { data, error } = await supabase
 *     .from('client_analytics')
 *     .select('ga4_measurement_id')
 *     .eq('client_id', clientId)
 *     .eq('enabled', true);
 *   
 *   if (error) throw error;
 *   return data.map(item => item.ga4_measurement_id);
 * }
 */

/**
 * Get client analytics configuration
 * 
 * Future implementation:
 * 
 * export async function getClientAnalyticsConfig(clientId: string) {
 *   const supabase = createClient();
 *   
 *   const { data, error } = await supabase
 *     .from('client_analytics')
 *     .select('*')
 *     .eq('client_id', clientId)
 *     .eq('enabled', true);
 *   
 *   if (error) throw error;
 *   return data;
 * }
 */

/**
 * Validate GA4 Measurement ID Format
 * 
 * GA4 IDs must match pattern: G-XXXXXXXXXX (G- followed by 10 alphanumeric chars)
 */
export function isValidGA4MeasurementId(id: string): boolean {
  const ga4Pattern = /^G-[A-Z0-9]{10}$/;
  return ga4Pattern.test(id);
}

/**
 * Track event to multiple GA4 properties
 * 
 * Future implementation for client custom tracking:
 * 
 * export function trackEventToMultipleProperties(
 *   eventName: string,
 *   measurementIds: string[],
 *   parameters?: Record<string, unknown>
 * ) {
 *   if (typeof window === 'undefined') return;
 *   
 *   measurementIds.forEach(id => {
 *     window.gtag('event', eventName, {
 *       ...parameters,
 *       send_to: id,
 *     });
 *   });
 * }
 */

// ============================================================
// IMPLEMENTATION ROADMAP
// ============================================================

/**
 * PHASE 1: FOUNDATION (Current - Dec 2025)
 * ✅ Single GA4 property setup for Expo360
 * ✅ Flexible architecture supporting multiple IDs
 * ✅ Validation functions in place
 * ✅ Database schema documented
 * 
 * PHASE 2: CLIENT ONBOARDING (Q1 2026 - Future)
 * [ ] Create client_analytics table in Supabase
 * [ ] Build admin panel for clients to add GA4 IDs
 * [ ] Implement getClientGA4IDs() function
 * [ ] Add client authentication checks
 * [ ] Update GoogleAnalytics component to load client IDs
 * [ ] Test with beta clients
 * 
 * PHASE 3: MULTI-PROPERTY TRACKING (Q2 2026 - Future)
 * [ ] Update trackEvent() to support multiple properties
 * [ ] Update trackPageView() for client properties
 * [ ] Add property-specific event parameters
 * [ ] Create analytics dashboard filtering by property
 * [ ] Add usage limits/quotas per client
 * 
 * PHASE 4: ADVANCED FEATURES (Q3+ 2026 - Future)
 * [ ] Real-time property status monitoring
 * [ ] Property performance insights
 * [ ] Custom event mapping for clients
 * [ ] Data export/integration options
 * [ ] Support for multiple platforms (web, mobile, etc.)
 */

// ============================================================
// COMPONENT ARCHITECTURE (Future Reference)
// ============================================================

/**
 * Current GoogleAnalytics Component:
 * src/components/GoogleAnalytics.tsx
 * 
 * Future evolution:
 * 
 * export default function GoogleAnalytics() {
 *   const customerId = useCustomerId(); // Get from context/auth
 *   const [ga4IDs, setGA4IDs] = useState<string[]>([]);
 *   
 *   useEffect(() => {
 *     // Fetch client's custom GA4 IDs from Supabase
 *     const ids = await getClientGA4IDs(customerId);
 *     
 *     // Combine Expo360 ID + client IDs
 *     setGA4IDs([EXPO360_GA4_ID, ...ids]);
 *   }, [customerId]);
 *   
 *   // Load gtag with all IDs
 *   return (
 *     <>
 *       <Script src="https://www.googletagmanager.com/gtag/js?id=G-E8NCY2YTP3" />
 *       <Script>
 *         {`
 *           gtag('config', 'G-E8NCY2YTP3'); // Expo360
 *           ${ga4IDs.map(id => `gtag('config', '${id}');`).join('\n')}
 *         `}
 *       </Script>
 *     </>
 *   );
 * }
 */

// ============================================================
// SECURITY & VALIDATION
// ============================================================

/**
 * Security Considerations for Client GA4 IDs:
 * 
 * 1. VALIDATION
 *    - Verify ID format matches GA4 pattern (G-XXXXXXXXXX)
 *    - Check ID is owned by the client's GA4 account
 *    - Prevent duplicate IDs across clients
 * 
 * 2. AUTHORIZATION
 *    - Only authenticated clients can add/edit their IDs
 *    - RLS (Row-Level Security) on client_analytics table
 *    - Each client sees only their own IDs
 * 
 * 3. RATE LIMITING
 *    - Limit number of GA4 IDs per client (e.g., 5-10)
 *    - Throttle ID additions (e.g., max 1 per day)
 *    - Monitor for suspicious patterns
 * 
 * 4. TRACKING
 *    - Log all GA4 ID additions/removals for audit trail
 *    - Track enable/disable events
 *    - Monitor for disabledIDs left over 30 days
 */

// ============================================================
// DATABASE MIGRATION (When ready)
// ============================================================

/**
 * Supabase SQL to create client_analytics table:
 * 
 * CREATE TABLE client_analytics (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
 *   property_name VARCHAR(255) NOT NULL,
 *   ga4_measurement_id VARCHAR(20) NOT NULL,
 *   property_type VARCHAR(50) NOT NULL CHECK (
 *     property_type IN ('landing_page', 'store_location', 'custom')
 *   ),
 *   enabled BOOLEAN DEFAULT true,
 *   created_at TIMESTAMP DEFAULT now(),
 *   updated_at TIMESTAMP DEFAULT now(),
 *   
 *   UNIQUE(client_id, ga4_measurement_id),
 *   CHECK (ga4_measurement_id ~ '^G-[A-Z0-9]{10}$')
 * );
 * 
 * CREATE INDEX idx_client_analytics_client_id 
 *   ON client_analytics(client_id);
 * 
 * CREATE INDEX idx_client_analytics_enabled 
 *   ON client_analytics(enabled);
 * 
 * -- RLS Policy
 * ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Clients see only their analytics"
 *   ON client_analytics
 *   FOR SELECT
 *   USING (
 *     client_id = auth.uid() OR
 *     auth.role() = 'admin'
 *   );
 */

export default {
  currentSetup: 'Single Expo360 GA4 property (G-E8NCY2YTP3)',
  futureFeature: 'Client custom GA4 IDs for landing pages and store locations',
  phase: 'Phase 1: Foundation',
  nextPhase: 'Phase 2: Client Onboarding (Q1 2026)',
  documentation: 'See comments in this file for implementation details',
};
