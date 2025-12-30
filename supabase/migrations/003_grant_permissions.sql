-- EPIC 2: Grant Permissions
-- Migration: Grant necessary permissions to app schema

-- Grant usage on schema to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA app TO anon;
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT USAGE ON SCHEMA app TO service_role;

-- Grant all privileges on all tables in app schema to service_role (for bootstrap and admin operations)
-- service_role bypasses RLS, so it needs full access
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;

-- Grant SELECT, INSERT, UPDATE, DELETE privileges to anon and authenticated (RLS will control access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO authenticated;

-- Ensure future tables also get permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

