-- EPIC 4: Stripe Monetization & Entitlements
-- Migration: Stripe billing core tables

-- Ensure platform schema exists (should already exist from 001_initial_schema.sql)
CREATE SCHEMA IF NOT EXISTS platform;

-- 1. Plans table
CREATE TABLE IF NOT EXISTS platform.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL, -- starter|growth|pro
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Plan limits table
CREATE TABLE IF NOT EXISTS platform.plan_limits (
  plan_id UUID NOT NULL REFERENCES platform.plans(id) ON DELETE CASCADE,
  limit_key TEXT NOT NULL, -- max_drivers, etc.
  limit_value JSONB NOT NULL,
  PRIMARY KEY(plan_id, limit_key)
);

-- 3. Addons table
CREATE TABLE IF NOT EXISTS platform.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL, -- realtime_tracking|extra_drivers|audit_retention_365
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Organization addons table
CREATE TABLE IF NOT EXISTS platform.org_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES platform.addons(id) ON DELETE CASCADE,
  stripe_subscription_item_id TEXT NULL,
  quantity INT DEFAULT 1,
  status TEXT NOT NULL, -- active|canceled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, addon_id)
);

-- 5. Subscriptions table
CREATE TABLE IF NOT EXISTS platform.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES platform.plans(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL, -- active|trialing|past_due|canceled|incomplete
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  grace_period_until TIMESTAMPTZ NULL, -- fecha límite del grace period (7 días desde payment_failed)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active subscription per org (allow history)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_subscription_per_org
ON platform.subscriptions(organization_id)
WHERE status IN ('active','trialing','past_due');

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON platform.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON platform.subscriptions(status);

-- 6. Entitlements table (cache)
CREATE TABLE IF NOT EXISTS platform.entitlements (
  organization_id UUID PRIMARY KEY REFERENCES app.organizations(id) ON DELETE CASCADE,
  plan_code TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'grace_period')),
  limits JSONB NOT NULL, -- resultado final: plan + addons
  addons JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Stripe events table (idempotency)
CREATE TABLE IF NOT EXISTS platform.stripe_events (
  id TEXT PRIMARY KEY, -- Stripe event.id
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  payload JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON platform.stripe_events(type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON platform.stripe_events(processed_at) WHERE processed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_addons_org_id ON platform.org_addons(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_addons_status ON platform.org_addons(status) WHERE status = 'active';

