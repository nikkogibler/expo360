# Credit-Based Image Processing System - Standard Operating Procedure (SOP)

## Overview
This document provides comprehensive guidelines for implementing, managing, and maintaining the Credit-Based Image Processing System that controls access to the ImageStandardizer feature through a shared credit pool across the entire admin team.

## System Purpose
- **Cost Control**: Manage AI image processing expenses through prepaid credits
- **Usage Tracking**: Monitor image processing usage across all admin users
- **Revenue Generation**: Monetize AI-powered image standardization services
- **Resource Management**: Prevent unlimited usage of expensive AI processing
- **Future Monetization**: Foundation for Stripe-based credit purchasing system

---

## 1. System Architecture

### Database Schema
```sql
-- Global credit pool shared across entire admin team
CREATE TABLE admin_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_credits INTEGER DEFAULT 100,
  used_credits INTEGER DEFAULT 0,
  remaining_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual credit usage tracking for analytics
CREATE TABLE admin_credit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  credits_used INTEGER DEFAULT 1,
  operation_type TEXT DEFAULT 'image_standardization',
  image_details JSONB, -- filename, size, format, processing settings
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Future credit purchases (Stripe integration preparation)
CREATE TABLE admin_credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id TEXT UNIQUE,
  credits_purchased INTEGER,
  amount_paid DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  purchased_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'completed' -- 'pending', 'completed', 'failed', 'refunded'
);

-- Credit alerts and notifications
CREATE TABLE admin_credit_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL, -- 'low_credits', 'no_credits', 'usage_spike'
  threshold_value INTEGER,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE
);
```

### Atomic Credit Management Function
```sql
-- Secure credit deduction with race condition prevention
CREATE OR REPLACE FUNCTION deduct_admin_credit(
  user_uuid UUID,
  operation_details JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE(success BOOLEAN, remaining_credits INTEGER) AS $$
DECLARE
  current_remaining INTEGER;
  credit_record_id UUID;
BEGIN
  -- Lock the admin_credits table to prevent race conditions
  SELECT id, remaining_credits INTO credit_record_id, current_remaining
  FROM admin_credits 
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;
  
  -- If no credits available, return failure
  IF current_remaining <= 0 THEN
    RETURN QUERY SELECT FALSE, current_remaining;
    RETURN;
  END IF;
  
  -- Deduct credit atomically
  UPDATE admin_credits 
  SET used_credits = used_credits + 1, 
      last_updated = NOW(),
      updated_by = user_uuid
  WHERE id = credit_record_id;
  
  -- Log the credit usage
  INSERT INTO admin_credit_usage (
    user_id, 
    credits_used, 
    operation_type, 
    image_details
  ) VALUES (
    user_uuid, 
    1, 
    'image_standardization',
    operation_details
  );
  
  -- Return success with updated remaining credits
  RETURN QUERY SELECT TRUE, (current_remaining - 1);
END;
$$ LANGUAGE plpgsql;

-- Credit refund function (for failed operations)
CREATE OR REPLACE FUNCTION refund_admin_credit(
  usage_record_id UUID,
  reason TEXT DEFAULT 'processing_failed'
)
RETURNS BOOLEAN AS $$
DECLARE
  credits_to_refund INTEGER;
BEGIN
  -- Get the credit amount from the usage record
  SELECT credits_used INTO credits_to_refund
  FROM admin_credit_usage
  WHERE id = usage_record_id;
  
  IF credits_to_refund IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Refund the credits
  UPDATE admin_credits
  SET used_credits = used_credits - credits_to_refund,
      last_updated = NOW()
  WHERE id = (SELECT id FROM admin_credits ORDER BY created_at DESC LIMIT 1);
  
  -- Mark the usage record as refunded
  UPDATE admin_credit_usage
  SET success = FALSE,
      error_details = reason
  WHERE id = usage_record_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### Real-time Credit Triggers
```sql
-- Trigger for low credit alerts
CREATE OR REPLACE FUNCTION check_credit_thresholds()
RETURNS TRIGGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  remaining := NEW.remaining_credits;
  
  -- Alert thresholds: 20, 10, 5, 1, 0
  IF remaining IN (20, 10, 5, 1) OR remaining = 0 THEN
    INSERT INTO admin_credit_alerts (alert_type, threshold_value)
    VALUES (
      CASE 
        WHEN remaining = 0 THEN 'no_credits'
        ELSE 'low_credits'
      END,
      remaining
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credit_threshold_check
  AFTER UPDATE ON admin_credits
  FOR EACH ROW
  EXECUTE FUNCTION check_credit_thresholds();
```

---

## 2. Implementation Phases

### Phase 1: Database Foundation (Day 1-2)
**Objectives**: Set up credit management infrastructure

**Database Tasks**:
- [ ] Create admin_credits table with initial 100 credits
- [ ] Create admin_credit_usage tracking table
- [ ] Implement atomic credit deduction function
- [ ] Set up real-time triggers for credit alerts
- [ ] Create database indexes for performance

**Initialization Script**:
```sql
-- Initialize with 100 credits for the admin team
INSERT INTO admin_credits (total_credits, used_credits)
VALUES (100, 0);

-- Performance indexes
CREATE INDEX idx_admin_credit_usage_user_timestamp ON admin_credit_usage(user_id, timestamp);
CREATE INDEX idx_admin_credit_usage_timestamp ON admin_credit_usage(timestamp DESC);
CREATE INDEX idx_admin_credits_updated ON admin_credits(last_updated DESC);
```

### Phase 2: Credit Service Layer (Day 3-4)
**Objectives**: Build TypeScript service for credit management

**Service Functions**:
```typescript
// /src/services/creditService.ts
export class CreditService {
  // Check current credit balance
  static async getCurrentCredits(): Promise<number>
  
  // Attempt to deduct credit before processing
  static async deductCredit(userId: string, imageDetails?: any): Promise<{
    success: boolean;
    remainingCredits: number;
    usageRecordId?: string;
  }>
  
  // Refund credit if processing fails
  static async refundCredit(usageRecordId: string, reason: string): Promise<boolean>
  
  // Get credit usage history
  static async getCreditUsage(timeframe: 'day' | 'week' | 'month'): Promise<UsageRecord[]>
  
  // Real-time credit subscription
  static subscribeToCredits(callback: (credits: number) => void): () => void
}
```

**Error Handling**:
- Network failures during credit deduction
- Race condition prevention
- Processing failures requiring refunds
- Real-time synchronization issues

### Phase 3: UI Components (Day 5-6)
**Objectives**: Create user-facing credit display and controls

**Credit Display Component**:
```tsx
// /src/components/admin/CreditDisplay.tsx
interface CreditDisplayProps {
  remaining: number;
  total: number;
  size: 'compact' | 'full';
  showUsage?: boolean;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({
  remaining,
  total,
  size,
  showUsage = false
}) => {
  const percentage = (remaining / total) * 100;
  const colorClass = getColorClass(percentage);
  
  return (
    <div className={`credit-display ${size} ${colorClass}`}>
      <div className="credit-icon">
        {remaining > 0 ? '⚡' : '🔒'}
      </div>
      <div className="credit-count">
        {remaining}/{total}
      </div>
      <div className="credit-label">credits</div>
      {showUsage && <CreditUsageBar percentage={percentage} />}
    </div>
  );
};
```

**Credit States & Colors**:
- **Healthy (>20)**: `text-green-600 bg-green-50`
- **Warning (5-20)**: `text-yellow-600 bg-yellow-50`
- **Critical (1-4)**: `text-red-600 bg-red-50`
- **Depleted (0)**: `text-gray-600 bg-gray-50`

### Phase 4: ImageStandardizer Integration (Day 7-8)
**Objectives**: Integrate credit system into existing image processing workflow

**Integration Points**:
- Modal header credit display
- Pre-processing credit validation
- Post-processing credit deduction
- Error handling and refunds

**Modified Processing Flow**:
```typescript
// Updated ImageStandardizer workflow
const processImages = async (images: File[], settings: ProcessingSettings) => {
  // 1. Pre-flight credit check
  const creditCheck = await CreditService.deductCredit(userId, {
    imageCount: images.length,
    settings: settings
  });
  
  if (!creditCheck.success) {
    showUpgradeModal();
    return;
  }
  
  try {
    // 2. Process images
    const results = await processImagesWithAI(images, settings);
    
    // 3. Success - credits already deducted
    return results;
    
  } catch (error) {
    // 4. Failure - refund the credit
    await CreditService.refundCredit(
      creditCheck.usageRecordId!,
      error.message
    );
    throw error;
  }
};
```

---

## 3. Credit Management Operations

### Daily Operations
**Morning Checklist (9 AM)**:
- [ ] Check current credit balance
- [ ] Review overnight credit usage
- [ ] Check for any failed processing (refunds)
- [ ] Monitor system health and synchronization

**Credit Monitoring Dashboard**:
```typescript
// Daily metrics to track
interface DailyMetrics {
  startingCredits: number;
  creditsUsed: number;
  remainingCredits: number;
  successfulOperations: number;
  failedOperations: number;
  refundsProcessed: number;
  activeUsers: number;
  peakUsageTime: string;
}
```

### Weekly Operations
**Monday Review**:
- [ ] Generate weekly usage report
- [ ] Analyze usage patterns by admin user
- [ ] Check credit efficiency (successful vs failed operations)
- [ ] Plan credit top-up if needed

**Weekly Report Contents**:
- Credit usage trends
- Most active admin users
- Processing success rates
- Peak usage times
- Recommendations for optimization

### Credit Threshold Alerts
**Automated Alerts**:
- **20 Credits Remaining**: Warning email to admin team
- **10 Credits Remaining**: Urgent email with top-up recommendations
- **5 Credits Remaining**: Daily reminder emails
- **1 Credit Remaining**: Immediate notification
- **0 Credits Remaining**: System locks ImageStandardizer, sends upgrade notification

---

## 4. User Experience Guidelines

### Credit Display Integration
**ImageStandardizer Modal Header**:
```tsx
<div className="modal-header flex items-center justify-between">
  <div className="title-section">
    <h2>Image Standardizer</h2>
    <p className="subtitle">AI-powered image optimization</p>
  </div>
  
  <CreditDisplay 
    remaining={remainingCredits}
    total={100}
    size="compact"
    showUsage={true}
  />
</div>
```

**Processing Button States**:
```tsx
<button 
  className={`process-button ${remainingCredits === 0 ? 'disabled' : ''}`}
  disabled={remainingCredits === 0}
  onClick={handleProcess}
>
  {remainingCredits === 0 
    ? 'No Credits Available' 
    : `Process Images (${selectedImages.length} credits)`
  }
</button>
```

### Credit Depletion Handling
**No Credits Modal**:
```tsx
<Modal title="Credits Exhausted" type="warning">
  <div className="credit-exhausted-content">
    <div className="icon">⚡❌</div>
    <h3>No processing credits remaining</h3>
    <p>Your admin team has used all 100 image processing credits.</p>
    
    <div className="usage-summary">
      <h4>Recent Usage:</h4>
      <ul>
        <li>Images processed today: {todayUsage}</li>
        <li>Most active user: {topUser}</li>
        <li>Success rate: {successRate}%</li>
      </ul>
    </div>
    
    <div className="actions">
      <button onClick={openUpgradePage} className="primary">
        Purchase More Credits
      </button>
      <button onClick={closeModal} className="secondary">
        Continue Without Processing
      </button>
    </div>
  </div>
</Modal>
```

---

## 5. Credit Analytics and Reporting

### Usage Tracking Metrics
**Key Performance Indicators**:
- **Credit Burn Rate**: Credits used per day/week
- **Processing Efficiency**: Successful vs failed operations
- **User Distribution**: Credit usage by admin user
- **Peak Times**: When processing is most active
- **Cost Per Image**: Effective cost analysis

### Custom Analytics Queries
```sql
-- Daily credit usage summary
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as operations,
  SUM(credits_used) as total_credits,
  COUNT(*) FILTER (WHERE success = true) as successful_ops,
  ROUND(AVG(processing_time_ms)) as avg_processing_time
FROM admin_credit_usage
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- User credit distribution
SELECT 
  u.email,
  COUNT(*) as total_operations,
  SUM(acu.credits_used) as credits_consumed,
  ROUND(AVG(acu.processing_time_ms)) as avg_processing_time,
  COUNT(*) FILTER (WHERE acu.success = true) as successful_ops
FROM admin_credit_usage acu
JOIN auth.users u ON acu.user_id = u.id
WHERE acu.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email
ORDER BY credits_consumed DESC;

-- Credit efficiency analysis
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE success = true) as successful,
  ROUND((COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)) * 100, 2) as success_rate,
  SUM(credits_used) FILTER (WHERE success = false) as wasted_credits
FROM admin_credit_usage
WHERE timestamp >= NOW() - INTERVAL '14 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Automated Reports
**Daily Credit Summary Email**:
```typescript
interface DailyCreditReport {
  date: string;
  startingCredits: number;
  creditsUsed: number;
  remainingCredits: number;
  operationsPerformed: number;
  successRate: number;
  topUser: string;
  peakHour: string;
  projectedDepletionDate?: string;
}
```

**Weekly Trend Analysis**:
- Usage pattern identification
- Efficiency improvements
- User training recommendations
- Credit top-up projections

---

## 6. Security and Data Protection

### Credit System Security
**Preventing Credit Manipulation**:
- All credit operations server-side only
- Database row-level security policies
- Audit trail for all credit changes
- API rate limiting for credit checks

**Access Control**:
```sql
-- Row Level Security for credit operations
CREATE POLICY "Admin users can view credits" ON admin_credits
  FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Only system can modify credits" ON admin_credits
  FOR UPDATE USING (auth.uid() = updated_by);

-- Credit usage visibility
CREATE POLICY "Users can see own usage" ON admin_credit_usage
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');
```

**Audit Trail**:
- Every credit deduction logged with user ID
- Processing details stored for verification
- Failed operations tracked for refund processing
- Administrative actions logged

### Data Privacy
**Information Collected**:
- ✅ Credit usage timestamps and counts
- ✅ Image processing metadata (size, format)
- ✅ Processing success/failure rates
- ✅ User efficiency metrics

**Information NOT Collected**:
- ❌ Actual image content or data
- ❌ Personal information from processed images
- ❌ Detailed image analysis results
- ❌ Customer or product-specific data

---

## 7. Future Stripe Integration Preparation

### Database Schema Extensions
```sql
-- Stripe integration tables (for future implementation)
CREATE TABLE stripe_credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_name TEXT NOT NULL,
  credits_included INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_price_id TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample credit packages
INSERT INTO stripe_credit_packages (package_name, credits_included, price_cents, stripe_price_id) VALUES
('Starter Pack', 50, 999, 'price_starter_50_credits'),
('Professional Pack', 200, 2999, 'price_pro_200_credits'),
('Enterprise Pack', 1000, 9999, 'price_enterprise_1000_credits');
```

### Credit Top-up Functions
```typescript
// Future Stripe integration functions
export class StripeCreditsService {
  // Create Stripe checkout session for credit purchase
  static async createCreditCheckoutSession(
    packageId: string,
    adminUserId: string
  ): Promise<{ sessionUrl: string }>
  
  // Process successful payment and add credits
  static async processCreditPurchase(
    stripeSessionId: string
  ): Promise<{ success: boolean; creditsAdded: number }>
  
  // Handle refunds and credit adjustments
  static async processRefund(
    purchaseId: string
  ): Promise<{ success: boolean; creditsRemoved: number }>
}
```

### Upgrade Modal Design
```tsx
<Modal title="Upgrade Credits" size="large">
  <div className="upgrade-options">
    <h3>Choose a credit package:</h3>
    
    {creditPackages.map(package => (
      <div key={package.id} className="credit-package">
        <div className="package-header">
          <h4>{package.name}</h4>
          <div className="price">${package.price / 100}</div>
        </div>
        <div className="package-details">
          <div className="credits">{package.credits} credits</div>
          <div className="value">${(package.price / package.credits / 100).toFixed(3)} per credit</div>
        </div>
        <button 
          onClick={() => purchaseCredits(package.id)}
          className="purchase-btn"
        >
          Purchase Now
        </button>
      </div>
    ))}
  </div>
</Modal>
```

---

## 8. Testing Procedures

### Pre-Deployment Testing
**Database Testing**:
- [ ] Test atomic credit deduction under concurrent load
- [ ] Verify race condition prevention
- [ ] Test credit refund functionality
- [ ] Validate real-time synchronization

**UI Testing**:
- [ ] Credit display updates in real-time
- [ ] Processing disabled when credits exhausted
- [ ] Error handling for network failures
- [ ] Modal states and user messaging

**Integration Testing**:
- [ ] Full ImageStandardizer workflow with credits
- [ ] Failed processing credit refunds
- [ ] Multi-user concurrent processing
- [ ] Credit threshold alert triggers

### Load Testing
**Concurrent Usage Simulation**:
```typescript
// Test multiple admins processing simultaneously
const concurrentTest = async () => {
  const promises = Array.from({length: 10}, (_, i) => 
    processImages([mockImage], defaultSettings, `user_${i}`)
  );
  
  const results = await Promise.allSettled(promises);
  
  // Verify only valid number of credits deducted
  // Ensure no race conditions occurred
  // Confirm proper error handling
};
```

### Post-Deployment Monitoring
**Key Metrics to Watch**:
- Credit deduction accuracy (should equal processing attempts)
- Real-time sync performance across admin sessions
- Error rates and refund processing
- User experience and modal responsiveness

---

## 9. Troubleshooting Guide

### Common Issues

#### Credits Not Deducting
**Symptoms**: Processing works but credit count doesn't decrease
**Diagnostic Steps**:
1. Check database connectivity
2. Verify credit deduction function execution
3. Review server-side logs for errors
4. Test atomic transaction functionality

**Solutions**:
- Restart Supabase connection pool
- Re-run database migration scripts
- Check for function permission issues
- Verify user authentication context

#### Credit Display Out of Sync
**Symptoms**: Different credit counts across admin sessions
**Diagnostic Steps**:
1. Check real-time subscription status
2. Verify WebSocket connections
3. Test manual credit refresh
4. Review browser console for errors

**Solutions**:
- Refresh browser sessions
- Restart real-time subscriptions
- Clear browser cache and cookies
- Check network connectivity

#### Processing Blocked Despite Available Credits
**Symptoms**: Button disabled even with credits remaining
**Diagnostic Steps**:
1. Check client-side credit state
2. Verify server-side credit count
3. Test credit checking API endpoint
4. Review component state management

**Solutions**:
- Force credit refresh from server
- Clear component state and reinitialize
- Check for caching issues
- Verify API response format

### Emergency Procedures

#### Credit System Failure
1. **Immediate**: Disable ImageStandardizer to prevent unlimited usage
2. **Assessment**: Determine extent of credit tracking failure
3. **Communication**: Notify admin team of temporary system maintenance
4. **Resolution**: Restore credit tracking from backup/logs
5. **Recovery**: Re-enable processing with verified credit counts
6. **Review**: Analyze failure cause and prevent recurrence

#### Accidental Credit Depletion
1. **Immediate**: Verify actual vs recorded usage
2. **Investigation**: Review credit usage logs for anomalies
3. **Resolution**: Add emergency credits if legitimate usage exceeded
4. **Communication**: Explain situation to admin team
5. **Prevention**: Implement better usage monitoring and alerts

---

## 10. Contact Information

### Technical Support
- **Primary Developer**: [Developer Name] - dev@kusam.com
- **Database Administrator**: [DBA Name] - dba@kusam.com  
- **DevOps Engineer**: [DevOps Name] - devops@kusam.com
- **UI/UX Designer**: [Designer Name] - design@kusam.com

### Business Stakeholders
- **Admin Manager**: [Manager Name] - admin@kusam.com
- **Finance Manager**: [Finance Name] - finance@kusam.com
- **Product Manager**: [PM Name] - product@kusam.com

### Emergency Contacts
- **After-hours Technical**: [Emergency Phone]
- **Critical System Issues**: [Emergency Email]
- **Credit System Failures**: [Priority Contact]

---

## Document History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Sept 2025 | Initial SOP creation | GitHub Copilot |

---

## Appendix: Implementation Checklist

### Phase 1: Database Setup
- [ ] Create admin_credits table
- [ ] Create admin_credit_usage table  
- [ ] Create admin_credit_purchases table (future)
- [ ] Create admin_credit_alerts table
- [ ] Implement deduct_admin_credit function
- [ ] Implement refund_admin_credit function
- [ ] Set up credit threshold triggers
- [ ] Create performance indexes
- [ ] Initialize with 100 credits
- [ ] Test atomic operations under load

### Phase 2: Service Layer
- [ ] Build CreditService class
- [ ] Implement getCurrentCredits method
- [ ] Implement deductCredit method
- [ ] Implement refundCredit method
- [ ] Implement getCreditUsage method
- [ ] Set up real-time subscriptions
- [ ] Add error handling and retry logic
- [ ] Write comprehensive unit tests
- [ ] Document API interfaces
- [ ] Performance optimization

### Phase 3: UI Components
- [ ] Create CreditDisplay component
- [ ] Design credit color coding system
- [ ] Build credit usage visualization
- [ ] Create no-credits modal
- [ ] Implement real-time credit updates
- [ ] Add loading states and error handling
- [ ] Responsive design testing
- [ ] Accessibility compliance
- [ ] Browser compatibility testing
- [ ] User experience validation

### Phase 4: ImageStandardizer Integration
- [ ] Add credit check before processing
- [ ] Integrate CreditDisplay in modal header
- [ ] Implement processing button states
- [ ] Add credit deduction after successful processing
- [ ] Implement credit refund on failure
- [ ] Update error messaging
- [ ] Test complete workflow
- [ ] Performance impact assessment
- [ ] User acceptance testing
- [ ] Documentation updates

### Phase 5: Monitoring and Analytics
- [ ] Set up credit usage analytics
- [ ] Create admin dashboard widgets
- [ ] Implement automated alerts
- [ ] Build usage reporting system
- [ ] Set up daily/weekly email reports
- [ ] Create custom query interfaces
- [ ] Monitor system performance
- [ ] Track user satisfaction metrics
- [ ] Document operational procedures
- [ ] Train admin team on new system