-- Migration v5: Phone field and other service value
-- Run this SQL in your Supabase SQL editor

-- 1. Add contact phone to calls
ALTER TABLE calls ADD COLUMN IF NOT EXISTS contact_phone text;

-- 2. Add other service value to service_orders
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS other_service_value numeric DEFAULT 0;
