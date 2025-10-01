# Admin Activity Tracking System - Standard Operating Procedure (SOP)

## Overview
This document provides comprehensive guidelines for implementing, managing, and maintaining the Admin Activity Tracking System that monitors authenticated admin user behavior, feature usage, and system performance within the Kusam admin interface.

## System Purpose
- **Workflow Optimization**: Identify bottlenecks and improve admin efficiency
- **Feature Usage Analysis**: Understand which tools are most/least valuable
- **Security Monitoring**: Detect unusual or suspicious admin activity
- **Training Insights**: Identify areas where admins need additional support
- **Performance Metrics**: Track system usage patterns and peak times

---

## 1. System Architecture

### Database Schema
```sql
-- Page visits and timing analytics
CREATE TABLE admin_page_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exited_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  referrer TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature usage and interaction events
CREATE TABLE admin_feature_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggregated daily usage summaries
CREATE TABLE admin_usage_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  feature_name TEXT NOT NULL,
  total_time_minutes INTEGER DEFAULT 0,
  action_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,4) DEFAULT 1.0,
  efficiency_score DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, user_id, feature_name)
);

-- User session tracking
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT UNIQUE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_duration_minutes INTEGER,
  page_count INTEGER DEFAULT 0,
  action_count INTEGER DEFAULT 0
);
```

### Event Collection Framework
- **React Hook**: `useAdminAnalytics()` for automatic tracking
- **Event Types**: Page views, feature usage, user interactions
- **Batch Processing**: Queue events and send in batches to reduce server load
- **Offline Support**: Store events locally if connection is lost

---

## 2. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Objectives**: Basic page tracking and database setup

**Tasks**:
- [ ] Create analytics database tables
- [ ] Build `useAdminAnalytics` React hook
- [ ] Implement page visit tracking
- [ ] Create basic analytics dashboard view
- [ ] Set up data retention policies

**Success Criteria**:
- Page visits are accurately recorded
- Session duration tracking works
- Basic analytics dashboard displays data
- No performance impact on admin interface

### Phase 2: Feature Tracking (Week 3-4)
**Objectives**: Track specific admin feature usage

**Features to Track**:
- **ImageStandardizer**: Images processed, settings used, processing time
- **Product Management**: Products created/edited/deleted, time spent
- **User Management**: User operations and administrative actions
- **Catalog Operations**: Category management, bulk operations
- **Configuration Changes**: Settings modifications, discount updates

**Event Examples**:
```javascript
// ImageStandardizer usage
trackFeatureEvent('image_standardizer', 'process_image', {
  image_count: 5,
  processing_time_ms: 2340,
  output_format: 'webp',
  compression_level: 85
});

// Product creation
trackFeatureEvent('product_management', 'create_product', {
  product_id: 'uuid',
  category: 'furniture',
  time_spent_seconds: 120,
  images_uploaded: 3
});
```

### Phase 3: Analytics Dashboard (Week 5-6)
**Objectives**: Build comprehensive insights interface

**Dashboard Sections**:
- **Real-time Activity**: Current active admins and their actions
- **Usage Overview**: Daily/weekly/monthly summaries
- **Feature Performance**: Most/least used features
- **Efficiency Metrics**: Task completion rates and times
- **Error Tracking**: Failed operations and common issues

### Phase 4: Advanced Analytics (Week 7-8)
**Objectives**: Predictive insights and optimization

**Advanced Features**:
- **Usage Predictions**: Forecast peak times and resource needs
- **Workflow Analysis**: Identify optimal admin workflows
- **Anomaly Detection**: Alert for unusual activity patterns
- **Performance Optimization**: Suggest UI/UX improvements

---

## 3. Tracked Metrics

### Page Analytics
| Metric | Description | Use Case |
|--------|-------------|----------|
| **Page Views** | Total visits per page | Identify most used sections |
| **Time on Page** | Average duration per page | Find workflow bottlenecks |
| **Bounce Rate** | Single-page sessions | Detect confusing interfaces |
| **Navigation Flow** | Common page sequences | Optimize admin workflows |

### Feature Usage
| Feature | Tracked Actions | Key Metrics |
|---------|----------------|-------------|
| **ImageStandardizer** | Process, settings, errors | Images/hour, success rate |
| **Product Management** | CRUD operations, time spent | Products/hour, completion rate |
| **User Management** | Admin actions, permissions | Actions/session, error rate |
| **Catalog Management** | Category ops, bulk actions | Operations/hour, efficiency |
| **Configuration** | Settings changes, updates | Changes/day, rollback rate |

### Performance Indicators
- **Task Completion Rate**: % of started tasks that finish successfully
- **Error Rate**: Failed operations per total operations
- **Efficiency Score**: Time per task compared to baseline
- **User Satisfaction**: Based on usage patterns and feedback

---

## 4. Privacy and Compliance

### Data Collection Policy
**What We Track**:
- ✅ Page visits and navigation patterns
- ✅ Feature usage and interaction times
- ✅ System performance and error rates
- ✅ Workflow efficiency metrics

**What We DON'T Track**:
- ❌ Personal conversations or content
- ❌ Detailed customer data access
- ❌ Password or authentication details
- ❌ Personal files or documents

### GDPR Compliance
- **Transparency**: Clear notification of tracking to admin users
- **Consent**: Opt-in tracking with explanation of benefits
- **Access Rights**: Admins can view their own analytics data
- **Deletion Rights**: Option to request data removal
- **Data Minimization**: Only collect necessary workflow data

### Data Retention
- **Raw Events**: 90 days (detailed tracking)
- **Aggregated Data**: 2 years (trends and insights)
- **Error Logs**: 1 year (debugging and improvements)
- **User Summaries**: Indefinite (performance reviews)

---

## 5. Security Measures

### Access Control
- **Analytics Dashboard**: Admin-only access with role verification
- **Data Export**: Restricted to senior administrators
- **API Access**: Authenticated endpoints with rate limiting
- **Audit Trail**: Log who accesses analytics data

### Data Protection
- **Encryption**: All analytics data encrypted at rest
- **Network Security**: HTTPS-only API communication
- **Input Validation**: Sanitize all tracked event data
- **SQL Injection Prevention**: Use parameterized queries

### Monitoring
- **Unusual Patterns**: Alert for suspicious admin activity
- **Data Anomalies**: Flag unexpected data patterns
- **System Health**: Monitor tracking system performance
- **Privacy Violations**: Automated checks for policy compliance

---

## 6. Dashboard Operations

### Daily Monitoring
**Morning Check (9 AM)**:
1. Review overnight admin activity
2. Check for system errors or anomalies
3. Verify tracking system health
4. Update daily summary reports

**Tasks**:
- [ ] Confirm all tracking systems operational
- [ ] Review error rate from previous 24 hours
- [ ] Check for unusual activity patterns
- [ ] Generate daily usage summary

### Weekly Analysis
**Every Monday**:
1. Generate weekly usage reports
2. Analyze feature performance trends
3. Identify optimization opportunities
4. Plan admin training if needed

**Report Contents**:
- Most/least used admin features
- Average task completion times
- User efficiency trends
- System performance metrics
- Recommendations for improvements

### Monthly Reviews
**First Monday of Month**:
1. Comprehensive usage analysis
2. ROI assessment of tracking system
3. Plan system improvements
4. Update tracking policies if needed

---

## 7. Alert Configuration

### Real-time Alerts
```javascript
// High-priority alerts
alerts: {
  // Security concerns
  'unusual_activity': {
    trigger: 'activity_spike > 300% of normal',
    recipients: ['security@kusam.com'],
    severity: 'high'
  },
  
  // System performance
  'tracking_system_down': {
    trigger: 'no_events_received > 15_minutes',
    recipients: ['dev@kusam.com'],
    severity: 'critical'
  },
  
  // Usage patterns
  'feature_error_spike': {
    trigger: 'error_rate > 25% in feature',
    recipients: ['admin@kusam.com'],
    severity: 'medium'
  }
}
```

### Weekly Digest Alerts
- **Feature Adoption**: New features with low adoption rates
- **Performance Degradation**: Features taking longer than usual
- **User Efficiency**: Admins needing additional training
- **System Optimization**: Areas for UI/UX improvements

---

## 8. Data Export and Reporting

### Standard Reports
**Daily Dashboard**:
- Active admin count
- Top 5 most used features
- Average session duration
- Error rate summary

**Weekly Summary**:
- Feature usage trends
- User efficiency metrics
- System performance analysis
- Recommendations for optimization

**Monthly Analysis**:
- ROI of admin tools
- Training effectiveness
- System upgrade needs
- Feature development priorities

### Custom Queries
```sql
-- Admin efficiency over time
SELECT 
  user_id,
  date,
  AVG(efficiency_score) as avg_efficiency,
  SUM(action_count) as total_actions
FROM admin_usage_summary 
WHERE date >= NOW() - INTERVAL '30 days'
GROUP BY user_id, date
ORDER BY date DESC;

-- Most popular feature combinations
SELECT 
  feature_name,
  COUNT(*) as usage_count,
  AVG(duration_seconds) as avg_duration
FROM admin_feature_events
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY feature_name
ORDER BY usage_count DESC;
```

---

## 9. System Maintenance

### Database Maintenance
**Daily**:
- [ ] Archive events older than retention period
- [ ] Update aggregated summary tables
- [ ] Clean up incomplete sessions
- [ ] Optimize query performance

**Weekly**:
- [ ] Run database performance analysis
- [ ] Check index efficiency
- [ ] Update usage statistics
- [ ] Backup analytics data

**Monthly**:
- [ ] Review data retention policies
- [ ] Archive old aggregated data
- [ ] Update system performance baselines
- [ ] Plan capacity upgrades if needed

### Code Maintenance
- **Hook Updates**: Keep `useAdminAnalytics` hook current with React versions
- **Event Schema**: Maintain backward compatibility for event structures
- **Dashboard Updates**: Add new visualizations as needs evolve
- **Performance**: Monitor and optimize tracking overhead

---

## 10. Training and Adoption

### Admin User Training
**Initial Training Session** (30 minutes):
- Explain tracking benefits for workflow improvement
- Demonstrate how to view personal analytics
- Review privacy policy and data usage
- Show how tracking helps identify training needs

**Ongoing Education**:
- Monthly "Analytics Insights" emails
- Quarterly training on new features
- Best practices sharing based on data
- Recognition for efficiency improvements

### Admin Manager Training
**Analytics Dashboard Training** (60 minutes):
- Navigate comprehensive analytics interface
- Generate and interpret reports
- Set up custom alerts and monitoring
- Use data for team optimization

**Data-Driven Management**:
- Weekly team performance reviews
- Identify training opportunities
- Plan feature development priorities
- Measure ROI of admin tools

---

## 11. Success Metrics

### System Performance
- **Tracking Accuracy**: >99% event capture rate
- **Performance Impact**: <50ms additional page load time
- **Uptime**: >99.9% tracking system availability
- **Data Quality**: <1% malformed or missing events

### Business Impact
- **Admin Efficiency**: 15% improvement in task completion time
- **Error Reduction**: 25% fewer failed operations
- **Training Effectiveness**: 30% faster onboarding for new admins
- **Feature Adoption**: 80% adoption rate for new admin features

### User Satisfaction
- **Admin Feedback**: >4.0/5.0 rating for tracking transparency
- **Privacy Comfort**: >90% comfortable with data collection
- **Insight Value**: >75% find analytics personally useful
- **System Trust**: >95% trust in data security measures

---

## 12. Troubleshooting Guide

### Common Issues

#### Events Not Being Tracked
**Symptoms**: Missing analytics data, gaps in tracking
**Diagnostic Steps**:
1. Check browser console for JavaScript errors
2. Verify network connectivity to analytics endpoint
3. Confirm user authentication is valid
4. Check event queue for backed-up events

**Solutions**:
- Clear browser cache and cookies
- Restart admin session
- Check server-side tracking endpoint health
- Review database connection status

#### Slow Dashboard Performance
**Symptoms**: Analytics dashboard loads slowly
**Diagnostic Steps**:
1. Check database query performance
2. Verify index optimization
3. Monitor server resource usage
4. Review data volume in analytics tables

**Solutions**:
- Optimize slow-running queries
- Add database indexes for common queries
- Implement query result caching
- Archive old data more aggressively

#### Inaccurate Time Tracking
**Symptoms**: Session durations seem incorrect
**Diagnostic Steps**:
1. Check client-side timer accuracy
2. Verify timezone handling
3. Review session timeout settings
4. Confirm page visibility API usage

**Solutions**:
- Calibrate client-side timers
- Standardize timezone handling
- Adjust session timeout parameters
- Implement proper page focus tracking

---

## 13. Emergency Procedures

### Privacy Breach Response
1. **Immediate**: Disable tracking system
2. **Assessment**: Determine scope of data exposure
3. **Notification**: Alert affected admin users within 24 hours
4. **Resolution**: Fix security vulnerability
5. **Recovery**: Restore tracking with enhanced security
6. **Review**: Update security procedures

### System Outage Response
1. **Detection**: Automated monitoring alerts of outage
2. **Triage**: Assess impact on admin workflow
3. **Communication**: Notify admin users of temporary tracking loss
4. **Resolution**: Restore tracking system functionality
5. **Recovery**: Backfill missed data where possible
6. **Post-mortem**: Review and prevent future outages

---

## 14. Contact Information

### Technical Support
- **Primary Developer**: [Developer Name] - dev@kusam.com
- **Database Administrator**: [DBA Name] - dba@kusam.com
- **Security Officer**: [Security Name] - security@kusam.com
- **DevOps Engineer**: [DevOps Name] - devops@kusam.com

### Business Stakeholders
- **Admin Manager**: [Manager Name] - admin@kusam.com
- **Training Coordinator**: [Trainer Name] - training@kusam.com
- **Privacy Officer**: [Privacy Name] - privacy@kusam.com
- **Product Manager**: [PM Name] - product@kusam.com

### Emergency Contacts
- **After-hours Technical**: [Emergency Phone]
- **Security Incidents**: [Security Hotline]
- **Privacy Concerns**: [Privacy Hotline]

---

## Document History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Sept 2025 | Initial SOP creation | GitHub Copilot |
| 1.1 | [Future] | Post-implementation updates | [Team Member] |

---

## Appendix: Code Templates

### Analytics Hook Implementation
```typescript
// useAdminAnalytics.ts
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useAdminAnalytics = () => {
  const trackPageView = useCallback((path: string, title?: string) => {
    // Implementation for page tracking
  }, []);
  
  const trackFeatureEvent = useCallback((
    feature: string, 
    action: string, 
    metadata?: Record<string, any>
  ) => {
    // Implementation for feature tracking
  }, []);
  
  return { trackPageView, trackFeatureEvent };
};
```

### Event Schema Examples
```typescript
// Page Analytics Event
interface PageAnalyticsEvent {
  user_id: string;
  session_id: string;
  page_path: string;
  page_title?: string;
  entered_at: Date;
  exited_at?: Date;
  duration_seconds?: number;
  referrer?: string;
  device_info: {
    user_agent: string;
    screen_resolution: string;
    viewport_size: string;
  };
}

// Feature Event
interface FeatureEvent {
  user_id: string;
  session_id: string;
  feature_name: string;
  action: string;
  metadata: Record<string, any>;
  success: boolean;
  error_details?: string;
  timestamp: Date;
}
```

### Database Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_admin_page_analytics_user_date ON admin_page_analytics(user_id, DATE(created_at));
CREATE INDEX idx_admin_feature_events_feature_timestamp ON admin_feature_events(feature_name, timestamp);
CREATE INDEX idx_admin_usage_summary_date_user ON admin_usage_summary(date, user_id);
CREATE INDEX idx_admin_sessions_user_started ON admin_sessions(user_id, started_at);
```