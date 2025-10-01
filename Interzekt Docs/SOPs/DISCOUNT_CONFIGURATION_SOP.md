# Discount Configuration System - Standard Operating Procedure (SOP)

## Overview
This document provides step-by-step instructions for managing the discount configuration system that controls promotional offers based on customer landing sources.

## System Architecture
- **Configuration File**: `/src/config/discountConfig.ts`
- **Database Field**: `customer.landing_source` (stores variant like "Expo Mueble Internacional")
- **Affected Pages**: Quote page (`/kusam/quote`) and Payment page (`/kusam/payment`)

## Landing Source Variants
| Variant Name | Landing Page | Default Discount |
|--------------|--------------|------------------|
| `Expo Mueble Internacional` | `/kusam` | 15% |
| `Tienda Saltillo` | `/saltillo` | 0% |
| `Tienda Vasconcelos` | `/vasconcelos` | 0% |

---

## 1. Updating Discount Percentages

### Purpose
Modify discount rates for existing landing sources or promotional periods.

### Steps
1. **Navigate to configuration file**
   ```bash
   cd /src/config/
   open discountConfig.ts
   ```

2. **Locate the DISCOUNT_CONFIG object**
   ```typescript
   export const DISCOUNT_CONFIG: DiscountConfig = {
     'Expo Mueble Internacional': 0.15,  // 15%
     'Tienda Saltillo': 0.0,            // 0%
     'Tienda Vasconcelos': 0.0,         // 0%
   };
   ```

3. **Update the desired percentage**
   - Use decimal format: `0.15` = 15%, `0.10` = 10%, `0.05` = 5%
   - Set to `0.0` to remove discount entirely

4. **Save and deploy changes**
   ```bash
   npm run build
   npm run deploy  # or your deployment command
   ```

### Example: Holiday Promotion
To apply 10% discount to store locations during holidays:
```typescript
export const DISCOUNT_CONFIG: DiscountConfig = {
  'Expo Mueble Internacional': 0.15,
  'Tienda Saltillo': 0.10,        // Changed from 0.0
  'Tienda Vasconcelos': 0.10,     // Changed from 0.0
};
```

---

## 2. Adding New Landing Sources

### Purpose
Create discounts for new store locations, trade shows, or promotional campaigns.

### Steps
1. **Add new entry to DISCOUNT_CONFIG**
   ```typescript
   export const DISCOUNT_CONFIG: DiscountConfig = {
     // Existing entries...
     'Tienda Guadalajara': 0.05,        // New store location
     'Black Friday Campaign': 0.20,     // Limited-time promotion
     'EXPO MUEBLE GUADALAJARA': 0.12,   // Trade show specific
   };
   ```

2. **Update KusamLeadForm variants** (if needed)
   - Navigate to `/src/components/KusamLeadForm.tsx`
   - Add new variant to `VARIANT_TO_LANDING_SOURCE` mapping
   - Create corresponding landing page route

3. **Test the new configuration**
   - Create test customer with new landing_source
   - Verify discount applies correctly on quote and payment pages

### Naming Conventions
- **Store Locations**: `Tienda [City Name]`
- **Trade Shows**: `[Event Name] [Year]` or just `[Event Name]`
- **Campaigns**: `[Campaign Name] [Period]`
- **International**: Use English names for consistency

---

## 3. Trade Show Promotions

### Purpose
Activate temporary discounts for international trade show periods.

### Pre-configured Trade Shows
```typescript
'Salone del Mobile Milan': 0.0,
'Casual Market Atlanta': 0.0,
'CIFF Copenhagen': 0.0,
'Movelsul Brazil': 0.0,
'Spoga+Gafa Cologne': 0.0,
```

### Activation Process
1. **Before trade show**: Update relevant entry
   ```typescript
   'Salone del Mobile Milan': 0.12,  // Activate 12% discount
   ```

2. **During trade show**: Monitor usage and adjust if needed

3. **After trade show**: Reset to 0.0
   ```typescript
   'Salone del Mobile Milan': 0.0,   // Deactivate discount
   ```

### Trade Show Calendar Integration
- Set calendar reminders 1 week before major trade shows
- Plan discount percentages based on expected volume and margins
- Coordinate with marketing team for promotional materials

---

## 4. Legacy Customer Handling

### Default Discount Behavior
```typescript
export const DEFAULT_DISCOUNT = 0.15; // For customers without landing_source
```

### When to Modify
- **Reducing legacy benefits**: Lower DEFAULT_DISCOUNT gradually
- **Grandfathering existing customers**: Keep at current level
- **System migration**: May need temporary increase during data migration

### Migration Scenarios
If changing default behavior, consider:
1. **Data backfill**: Update existing customers with proper landing_source
2. **Gradual rollout**: Phase changes over time
3. **Customer communication**: Notify affected customers of changes

---

## 5. Testing Procedures

### Pre-Deployment Testing
1. **Configuration validation**
   ```bash
   npm run build  # Check for TypeScript errors
   ```

2. **Local testing**
   - Test each variant on quote page
   - Verify payment calculations are correct
   - Check discount display text

3. **Database queries**
   ```sql
   -- Check customer landing_source distribution
   SELECT landing_source, COUNT(*) 
   FROM customer 
   GROUP BY landing_source;
   
   -- Verify recent customers have proper landing_source
   SELECT id, landing_source, created_at 
   FROM customer 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### Post-Deployment Verification
1. **Monitor error logs** for discount calculation issues
2. **Check payment processing** - ensure MercadoPago integration works
3. **Verify customer experience** across all landing page variants

---

## 6. Troubleshooting

### Common Issues

#### Discount Not Applying
**Symptoms**: Customer expects discount but doesn't see it
**Solution**:
1. Check customer's `landing_source` in database
2. Verify `DISCOUNT_CONFIG` has entry for that landing_source
3. Check if `hasDiscount()` function returns true

#### Wrong Discount Amount
**Symptoms**: Discount percentage doesn't match configuration
**Solution**:
1. Verify decimal format in config (0.15 not 15)
2. Check for caching issues - clear browser cache
3. Ensure latest deployment is active

#### Legacy Customer Issues
**Symptoms**: Old customers losing discounts
**Solution**:
1. Check `DEFAULT_DISCOUNT` value
2. Consider backfilling `landing_source` for important customers
3. Review customer communication strategy

### Emergency Procedures
If critical discount issue occurs:
1. **Immediate**: Set problematic landing_source to 0.0 to disable
2. **Short-term**: Use DEFAULT_DISCOUNT as fallback
3. **Long-term**: Fix root cause and redeploy

---

## 7. Reporting and Analytics

### Key Metrics to Track
- **Discount utilization rate** by landing source
- **Revenue impact** of promotional periods
- **Customer conversion rates** by discount tier
- **Average order values** across variants

### Monthly Review Process
1. **Export customer data** with landing_source breakdown
2. **Analyze discount effectiveness** - ROI per variant
3. **Plan upcoming promotions** based on trade show calendar
4. **Review and adjust** default discount rates if needed

### Recommended Queries
```sql
-- Monthly discount usage report
SELECT 
  landing_source,
  COUNT(*) as customers,
  AVG(total_order_value) as avg_order,
  SUM(discount_amount) as total_discounts
FROM customer_orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY landing_source;
```

---

## 8. Contact Information

### Technical Support
- **Developer**: [Primary Developer Name]
- **Database Admin**: [DBA Contact]
- **DevOps**: [Deployment Team]

### Business Stakeholders
- **Marketing Director**: [For promotional strategy]
- **Sales Manager**: [For trade show coordination]
- **Finance**: [For discount impact analysis]

---

## Document History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Sept 2025 | Initial SOP creation | GitHub Copilot |

---

## Appendix: Code Reference

### Key Functions
```typescript
// Get discount for landing source
getDiscountForLandingSource(landingSource: string): number

// Check if customer qualifies for discount
hasDiscount(landingSource: string): boolean
```

### Configuration File Structure
```typescript
export const DISCOUNT_CONFIG: DiscountConfig = {
  [landingSource: string]: number  // 0.15 = 15% discount
};
```

### Database Schema
```sql
customer table:
- id (uuid)
- landing_source (text) -- Maps to DISCOUNT_CONFIG keys
- created_at (timestamp)
-- other fields...
```