# Admin User Management - Standard Operating Procedure (SOP)

## Overview
This document provides step-by-step instructions for adding, managing, and configuring admin users in the Kusam admin system. This includes email-based authentication, profile integration with Supabase auth, and credit system access.

## System Architecture
- **Email-based Access Control**: Admin access controlled by `adminList.ts`
- **Cookie Authentication**: User sessions managed via browser cookies
- **Supabase Profiles**: User profiles linked to authenticated user UUIDs
- **Shared Credit Pool**: All admins share the same credit system
- **Real-time Tracking**: Individual user actions tracked in database

---

## 1. Adding New Admin Users

### Prerequisites
- Access to codebase (`/src/config/adminList.ts`)
- Admin email address to be added
- Deployment access to apply changes

### Step 1: Update Admin List Configuration

**File Location**: `/src/config/adminList.ts`

```typescript
// BEFORE: Single admin user
export const adminList = [
  'ventas01@kusam.com.mx',
];

// AFTER: Multiple admin users
export const adminList = [
  'ventas01@kusam.com.mx',        // Existing admin
  'gabrielc@kusam.com.mx',        // New admin
  'manager@kusam.com.mx',         // Future admin (example)
];
```

**Important Notes**:
- Use exact email addresses (case-sensitive)
- Each email must be on a separate line
- Maintain comma separation
- No trailing comma after the last entry

### Step 2: Deploy Configuration Changes

```bash
# Build and deploy the updated configuration
npm run build
npm run deploy  # or your deployment command
```

### Step 3: Verify Access

1. **Test new admin login**:
   - Navigate to `/admin/signin`
   - Sign in with new admin email
   - Should be redirected to `/admin` dashboard

2. **Test existing admin access** (regression test):
   - Verify existing admins still have access
   - Ensure no authentication issues

---

## 2. Profile Integration with Supabase Auth

### Database Setup

If you've added profile integration, ensure these tables exist:

```sql
-- User profiles table (connected to Supabase auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Profile Management Functions

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Adding Profile Data for Admin Users

```sql
-- Insert profiles for existing admin users
INSERT INTO profiles (id, email, full_name, department) VALUES
  ('admin-uuid-1', 'ventas01@kusam.com.mx', 'Sales Representative', 'Sales'),
  ('admin-uuid-2', 'gabrielc@kusam.com.mx', 'Gabriel Cruz', 'Management')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  updated_at = NOW();
```

---

## 3. Credit System Integration

### Understanding Credit Sharing

**All admin users share the same credit pool**:
- Total credits are shared across the entire admin team
- Individual usage is tracked per user email
- Real-time updates across all admin sessions

### Credit Usage Tracking

Admin users are tracked in the credit system using their email addresses:

```sql
-- View credit usage by admin user
SELECT 
  image_details->>'user_identifier' as admin_email,
  COUNT(*) as images_processed,
  SUM(credits_used) as total_credits_used,
  MAX(timestamp) as last_activity
FROM admin_credit_usage
GROUP BY image_details->>'user_identifier'
ORDER BY total_credits_used DESC;
```

### Credit Management Queries

```sql
-- Check current credit status
SELECT 
  total_credits, 
  used_credits, 
  remaining_credits,
  last_updated
FROM admin_credits;

-- Reset credits (use carefully!)
UPDATE admin_credits 
SET used_credits = 0, 
    last_updated = NOW()
WHERE id = (SELECT id FROM admin_credits ORDER BY id DESC LIMIT 1);

-- Add more credits for team
UPDATE admin_credits 
SET total_credits = total_credits + 50,
    last_updated = NOW()
WHERE id = (SELECT id FROM admin_credits ORDER BY id DESC LIMIT 1);
```

---

## 4. Authentication Flow

### How Admin Authentication Works

1. **User Access**: Admin navigates to `/admin`
2. **Cookie Check**: System checks for `user_email` cookie
3. **List Validation**: Email is validated against `adminList.ts`
4. **Access Decision**: 
   - ✅ If email in list → Access granted to admin dashboard
   - ❌ If email not in list → Redirect to `/admin/signin`

### Cookie Management

```javascript
// Set admin cookie (example from signin process)
document.cookie = `user_email=${email}; path=/; max-age=86400`; // 24 hours

// Read admin cookie
const userEmail = document.cookie
  .split('; ')
  .find(row => row.startsWith('user_email='))
  ?.split('=')[1];

// Clear admin cookie (logout)
document.cookie = 'user_email=; path=/; max-age=0';
```

---

## 5. User Management Operations

### Adding a New Admin User

**Complete Checklist**:
- [ ] Add email to `adminList.ts`
- [ ] Deploy configuration changes
- [ ] Create user profile in Supabase (if using profiles)
- [ ] Test login access
- [ ] Verify credit system functionality
- [ ] Test ImageStandardizer access
- [ ] Document user addition in admin logs

### Removing an Admin User

**Complete Checklist**:
- [ ] Remove email from `adminList.ts`
- [ ] Deploy configuration changes
- [ ] Archive user's credit usage data (optional)
- [ ] Clear user's browser cookies/sessions
- [ ] Update user profile status (if applicable)
- [ ] Document user removal in admin logs

### User Profile Updates

```sql
-- Update admin user profile
UPDATE profiles 
SET 
  full_name = 'Updated Name',
  department = 'New Department',
  updated_at = NOW()
WHERE email = 'admin@kusam.com.mx';

-- View all admin profiles
SELECT 
  p.email,
  p.full_name,
  p.department,
  p.created_at,
  (SELECT COUNT(*) FROM admin_credit_usage 
   WHERE image_details->>'user_identifier' = p.email) as images_processed
FROM profiles p
WHERE p.email = ANY(ARRAY[
  'ventas01@kusam.com.mx',
  'gabrielc@kusam.com.mx'
  -- Add other admin emails here
]);
```

---

## 6. Monitoring and Analytics

### Admin Activity Tracking

```sql
-- Daily admin activity summary
SELECT 
  DATE(timestamp) as date,
  image_details->>'user_identifier' as admin_email,
  COUNT(*) as images_processed,
  SUM(credits_used) as credits_consumed
FROM admin_credit_usage
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp), image_details->>'user_identifier'
ORDER BY date DESC, credits_consumed DESC;

-- Most active admin users
SELECT 
  image_details->>'user_identifier' as admin_email,
  COUNT(*) as total_operations,
  ROUND(AVG(processing_time_ms)) as avg_processing_time_ms,
  MAX(timestamp) as last_activity
FROM admin_credit_usage
GROUP BY image_details->>'user_identifier'
ORDER BY total_operations DESC;
```

### System Health Checks

```sql
-- Verify admin system integrity
SELECT 
  'Admin Credits' as component,
  CASE 
    WHEN remaining_credits > 0 THEN 'Healthy'
    WHEN remaining_credits = 0 THEN 'Depleted'
    ELSE 'Error'
  END as status,
  remaining_credits as value
FROM admin_credits

UNION ALL

SELECT 
  'Active Admins' as component,
  'Info' as status,
  COUNT(DISTINCT image_details->>'user_identifier') as value
FROM admin_credit_usage
WHERE timestamp >= NOW() - INTERVAL '30 days';
```

---

## 7. Troubleshooting

### Common Issues

#### Admin Cannot Access Dashboard
**Symptoms**: User redirected to signin page despite valid credentials

**Diagnostic Steps**:
1. Check if email is in `adminList.ts`
2. Verify cookie is set: `document.cookie` in browser console
3. Check for typos in email address (case-sensitive)
4. Clear browser cache and cookies
5. Verify deployment of latest `adminList.ts`

**Solutions**:
- Add missing email to admin list
- Fix email typo in configuration
- Clear browser data and retry
- Redeploy configuration

#### Credit System Not Working for New Admin
**Symptoms**: Credit display shows 0/100 or errors for new admin

**Diagnostic Steps**:
1. Check browser console for errors
2. Verify user authentication in ImageStandardizer
3. Test database connection
4. Check Supabase RLS policies

**Solutions**:
- Refresh browser and retry
- Check database permissions
- Verify user identification in credit service

#### Profile Integration Issues
**Symptoms**: User name not displaying, profile errors

**Diagnostic Steps**:
1. Check if profile exists in database
2. Verify UUID connection to auth.users
3. Check RLS policies on profiles table
4. Verify trigger functions are working

**Solutions**:
- Manually insert profile data
- Update RLS policies
- Fix UUID references

---

## 8. Security Considerations

### Access Control
- **Email Validation**: Always use exact email matches
- **Cookie Security**: Consider secure, httpOnly cookies for production
- **Session Management**: Implement proper session timeouts
- **Audit Trail**: Maintain logs of admin additions/removals

### Data Protection
- **Profile Data**: Store minimal necessary information
- **Email Privacy**: Don't expose admin emails in client-side code
- **Credit Security**: Ensure atomic operations prevent race conditions
- **Database Security**: Use proper RLS policies

---

## 9. Deployment Checklist

### Pre-Deployment
- [ ] Update `adminList.ts` with new admin emails
- [ ] Test changes locally
- [ ] Verify no syntax errors in configuration
- [ ] Backup current admin list (if needed)

### Deployment
- [ ] Build project: `npm run build`
- [ ] Deploy to production environment
- [ ] Verify deployment successful
- [ ] Test admin access immediately after deployment

### Post-Deployment
- [ ] Test new admin login
- [ ] Verify existing admins still have access
- [ ] Check credit system functionality
- [ ] Monitor for any authentication errors
- [ ] Document changes in admin log

---

## 10. Contact Information

### Technical Support
- **Developer**: [Primary Developer] - dev@kusam.com
- **Database Admin**: [DBA Name] - dba@kusam.com
- **System Admin**: [SysAdmin Name] - admin@kusam.com

### Business Stakeholders
- **Admin Manager**: [Manager Name] - manager@kusam.com
- **IT Security**: [Security Name] - security@kusam.com

---

## Document History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Sept 2025 | Initial admin management SOP | GitHub Copilot |

---

## Appendix: Quick Reference

### Admin List Template
```typescript
// /src/config/adminList.ts
export const adminList = [
  'admin1@kusam.com.mx',
  'admin2@kusam.com.mx',
  'admin3@kusam.com.mx',
];
```

### Profile Creation Template
```sql
INSERT INTO profiles (id, email, full_name, department) VALUES
  ('user-uuid', 'email@kusam.com.mx', 'Full Name', 'Department');
```

### Credit Usage Query Template
```sql
SELECT 
  image_details->>'user_identifier' as admin_email,
  COUNT(*) as images_processed
FROM admin_credit_usage
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY image_details->>'user_identifier';
```