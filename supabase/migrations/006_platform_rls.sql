-- EPIC 4: Stripe Monetization & Entitlements
-- Migration: Platform schema RLS policies

-- Enable RLS on all platform tables
ALTER TABLE platform.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.org_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.stripe_events ENABLE ROW LEVEL SECURITY;

-- Deny by default: No policies that allow access from anon/client
-- All access to platform.* must go through service role (server-only)

-- Note: We don't create any SELECT/INSERT/UPDATE/DELETE policies here
-- because platform.* schema should ONLY be accessible via service role
-- (SUPABASE_SERVICE_ROLE_KEY) in server routes.

-- This ensures:
-- 1. No client-side access to billing/subscription data
-- 2. All platform.* queries use supabaseService (service role)
-- 3. Platform schema is NOT exposed in Data API

-- If you need to allow PLATFORM_OWNER/PLATFORM_ADMIN roles to read platform data,
-- do it ONLY via server endpoints with proper guards, never via direct RLS policies.

