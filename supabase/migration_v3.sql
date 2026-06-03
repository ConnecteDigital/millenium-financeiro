-- Migration v3: Multiple improvements
-- Run this SQL in your Supabase SQL editor

-- 1. Add scheduled_date to calls (data específica do serviço agendado)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS scheduled_date date;

-- 2. Add own service costs to service_orders (custos próprios)
ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS own_material_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS own_fuel_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS own_other_cost numeric DEFAULT 0;

-- 3. Add google_site to expenses (Saldo Google - qual site)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS google_site text;

-- 4. Auxiliaries table (auxiliares/ajudantes com percentual)
CREATE TABLE IF NOT EXISTS auxiliaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  percentage numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE auxiliaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "All authenticated can manage auxiliaries"
  ON auxiliaries FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 5. Add auxiliary link to service_orders
ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS auxiliary_id uuid REFERENCES auxiliaries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS auxiliary_value numeric DEFAULT 0;

-- 6. Index for performance on calls.status (nao_aprovou já funciona como text)
-- The status column is text, so nao_aprovou works without schema change.

-- 7. Index for OS number search performance
CREATE INDEX IF NOT EXISTS idx_service_orders_os_number ON service_orders(os_number);
CREATE INDEX IF NOT EXISTS idx_calls_scheduled_date ON calls(scheduled_date);

-- Summary of changes:
-- calls: + scheduled_date date
-- service_orders: + own_material_cost, own_fuel_cost, own_other_cost, auxiliary_id, auxiliary_value
-- expenses: + google_site text
-- new table: auxiliaries (id, name, percentage, created_at)
