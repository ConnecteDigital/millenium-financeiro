-- Migration v4: Add guarantee options and other improvements
-- Run this SQL in your Supabase SQL editor

-- 1. Add 60 and 90 day guarantee columns to service_orders
ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS has_guarantee_60 boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_guarantee_90 boolean DEFAULT false;

-- Summary:
-- service_orders: + has_guarantee_60, has_guarantee_90
