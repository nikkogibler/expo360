# Credit System Database Initialization

## Run this SQL in your Supabase SQL Editor to initialize the credit system:

```sql
-- Initialize the shared credit pool with 100 credits
-- This should only be run once when setting up the system
INSERT INTO admin_credits (total_credits, used_credits)
VALUES (100, 0)
ON CONFLICT DO NOTHING;

-- Verify the initialization
SELECT 
  total_credits, 
  used_credits, 
  remaining_credits, 
  created_at 
FROM admin_credits;
```

## Expected Result:
You should see one row with:
- total_credits: 100
- used_credits: 0  
- remaining_credits: 100
- created_at: [timestamp]

## If you need to reset the credits later:
```sql
-- Reset credits back to 100 (use carefully!)
UPDATE admin_credits 
SET used_credits = 0, 
    last_updated = NOW()
WHERE id = (SELECT id FROM admin_credits ORDER BY created_at DESC LIMIT 1);
```

## To add more credits (when implementing Stripe):
```sql
-- Add 50 more credits (example)
UPDATE admin_credits 
SET total_credits = total_credits + 50,
    last_updated = NOW()
WHERE id = (SELECT id FROM admin_credits ORDER BY created_at DESC LIMIT 1);
```