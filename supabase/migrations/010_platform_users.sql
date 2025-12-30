-- EPIC 5: Platform Console
-- Migration: Platform users table for SaaS owners/admins

-- Ensure platform schema exists
CREATE SCHEMA IF NOT EXISTS platform;

-- Platform users table (separate from app.users)
CREATE TABLE IF NOT EXISTS platform.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('PLATFORM_OWNER', 'PLATFORM_ADMIN')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_users_firebase_uid ON platform.users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_platform_users_role ON platform.users(role);
CREATE INDEX IF NOT EXISTS idx_platform_users_active ON platform.users(active) WHERE active = true;

-- RLS: Deny all access by default (only service role can access)
ALTER TABLE platform.users ENABLE ROW LEVEL SECURITY;

-- Deny all policies (service role bypasses RLS)
CREATE POLICY "Deny all access to platform.users"
  ON platform.users
  FOR ALL
  USING (false);

