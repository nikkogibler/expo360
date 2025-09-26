# Updated Supabase Functions for Email-based Admin System

Run these updated functions in your Supabase SQL Editor to handle both UUID and email-based user identification:

```sql
-- Updated credit deduction function to handle email-based users
CREATE OR REPLACE FUNCTION deduct_admin_credit(
  user_uuid TEXT, -- Changed from UUID to TEXT to handle emails
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
  
  -- If no credit record exists, return failure
  IF credit_record_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;
  
  -- If no credits available, return failure
  IF current_remaining <= 0 THEN
    RETURN QUERY SELECT FALSE, current_remaining;
    RETURN;
  END IF;
  
  -- Deduct credit atomically
  UPDATE admin_credits 
  SET used_credits = used_credits + 1, 
      last_updated = NOW(),
      updated_by = CASE 
        WHEN user_uuid ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN user_uuid::UUID 
        ELSE NULL 
      END -- Only set updated_by if it's a valid UUID
  WHERE id = credit_record_id;
  
  -- Log the credit usage (handle both UUID and email users)
  INSERT INTO admin_credit_usage (
    user_id, 
    credits_used, 
    operation_type, 
    image_details
  ) VALUES (
    CASE 
      WHEN user_uuid ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
      THEN user_uuid::UUID 
      ELSE NULL 
    END,
    1, 
    'image_standardization',
    operation_details || jsonb_build_object('user_identifier', user_uuid)
  );
  
  -- Return success with updated remaining credits
  RETURN QUERY SELECT TRUE, (current_remaining - 1);
END;
$$ LANGUAGE plpgsql;

-- Updated refund function
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

-- Test the functions work correctly
SELECT deduct_admin_credit('ventas01@kusam.com.mx', '{"test": true}'::jsonb);
```

## Also update the user_id column in admin_credit_usage to be nullable:

```sql
-- Make user_id nullable to accommodate email-based users
ALTER TABLE admin_credit_usage 
ALTER COLUMN user_id DROP NOT NULL;

-- Add an index on the user identifier in image_details for email-based lookups
CREATE INDEX IF NOT EXISTS idx_admin_credit_usage_user_identifier 
ON admin_credit_usage USING GIN ((image_details->>'user_identifier'));
```