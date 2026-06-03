-- Migration v6: Partner split and multiple billing systems
-- Run this SQL in your Supabase SQL editor

-- 1. Add partner revenue split fields to service_orders
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS partner_name text;
ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS my_revenue_pct numeric DEFAULT 100;
