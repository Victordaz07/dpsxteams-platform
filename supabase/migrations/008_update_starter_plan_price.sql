-- 008_update_starter_plan_price.sql
-- Update starter plan price_id safely (idempotent)

UPDATE platform.plans
SET stripe_price_id = 'price_1SjxoZAIyvL90KuM0LO1uiDa'
WHERE code = 'starter';
