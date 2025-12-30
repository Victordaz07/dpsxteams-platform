-- 002_rls_policies.sql
-- EPIC 2: RLS Policies
-- Migration: Row Level Security policies
-- Idempotent: safe to run multiple times

-- Ensure RLS is enabled (safe even if already enabled)
ALTER TABLE IF EXISTS app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app.organizations ENABLE ROW LEVEL SECURITY;

-- =========================
-- Users
-- =========================

-- Users: Users can only see their own user record
DROP POLICY IF EXISTS "Users see own user" ON app.users;

CREATE POLICY "Users see own user"
  ON app.users
  FOR SELECT
  USING (firebase_uid = auth.jwt() ->> 'firebase_uid');

-- =========================
-- Memberships
-- =========================

-- Memberships: Users can only see their own memberships
DROP POLICY IF EXISTS "Users see own memberships" ON app.memberships;

CREATE POLICY "Users see own memberships"
  ON app.memberships
  FOR SELECT
  USING (
    user_id IN (
      SELECT id
      FROM app.users
      WHERE firebase_uid = auth.jwt() ->> 'firebase_uid'
    )
  );

-- =========================
-- Organizations
-- =========================

-- Organizations: Users can only see organizations where they have active membership
DROP POLICY IF EXISTS "Users see own organizations" ON app.organizations;

CREATE POLICY "Users see own organizations"
  ON app.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT m.organization_id
      FROM app.memberships m
      JOIN app.users u ON u.id = m.user_id
      WHERE u.firebase_uid = auth.jwt() ->> 'firebase_uid'
        AND m.status = 'active'
    )
  );

-- Note: INSERT/UPDATE/DELETE policies will be refined in EPIC 3 with RBAC
