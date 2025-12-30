-- EPIC 4: Stripe Monetization & Entitlements
-- Migration: Seed plans and addons
-- NOTE: stripe_product_id and stripe_price_id are placeholders
-- These should be updated with real Stripe IDs from Stripe Dashboard
-- Or use a syncFromStripe script (server-only) to populate them

-- Insert plans
INSERT INTO platform.plans (stripe_product_id, stripe_price_id, code, name, active)
VALUES 
  ('prod_starter_placeholder', 'price_starter_placeholder', 'starter', 'Starter', true),
  ('prod_growth_placeholder', 'price_growth_placeholder', 'growth', 'Growth', true),
  ('prod_pro_placeholder', 'price_pro_placeholder', 'pro', 'Pro', true)
ON CONFLICT (code) DO NOTHING;

-- Insert plan limits (using exact values from constants)
-- Starter: max_drivers = 25
INSERT INTO platform.plan_limits (plan_id, limit_key, limit_value)
SELECT id, 'max_drivers', '{"value": 25}'::jsonb
FROM platform.plans WHERE code = 'starter'
ON CONFLICT (plan_id, limit_key) DO UPDATE SET limit_value = EXCLUDED.limit_value;

-- Growth: max_drivers = 75
INSERT INTO platform.plan_limits (plan_id, limit_key, limit_value)
SELECT id, 'max_drivers', '{"value": 75}'::jsonb
FROM platform.plans WHERE code = 'growth'
ON CONFLICT (plan_id, limit_key) DO UPDATE SET limit_value = EXCLUDED.limit_value;

-- Pro: max_drivers = 200
INSERT INTO platform.plan_limits (plan_id, limit_key, limit_value)
SELECT id, 'max_drivers', '{"value": 200}'::jsonb
FROM platform.plans WHERE code = 'pro'
ON CONFLICT (plan_id, limit_key) DO UPDATE SET limit_value = EXCLUDED.limit_value;

-- Insert addons
INSERT INTO platform.addons (stripe_product_id, stripe_price_id, code, name, active)
VALUES 
  ('prod_realtime_tracking_placeholder', 'price_realtime_tracking_placeholder', 'realtime_tracking', 'Realtime Tracking', true),
  ('prod_extra_drivers_placeholder', 'price_extra_drivers_placeholder', 'extra_drivers', 'Extra Drivers', true),
  ('prod_audit_retention_365_placeholder', 'price_audit_retention_365_placeholder', 'audit_retention_365', 'Audit Retention 365 Days', true)
ON CONFLICT (code) DO NOTHING;

-- Note: After creating products/prices in Stripe Dashboard, update the stripe_product_id and stripe_price_id
-- using a migration or a sync script. Example:
-- UPDATE platform.plans SET stripe_product_id = 'prod_xxxxx', stripe_price_id = 'price_xxxxx' WHERE code = 'starter';

