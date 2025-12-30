-- EPIC 5: Platform Console
-- Migration: Add monthly_price_cents to platform.plans for MRR calculation

ALTER TABLE platform.plans 
ADD COLUMN IF NOT EXISTS monthly_price_cents INTEGER;

-- Add comment for clarity
COMMENT ON COLUMN platform.plans.monthly_price_cents IS 'Monthly price in cents for MRR calculation. NULL means pricing not set yet.';

