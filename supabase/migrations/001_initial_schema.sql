-- EPIC 2: Supabase + Multi-Tenant Core + RLS
-- Migration: Initial schema creation

-- Create schemas
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS platform;

-- Users table (internal SaaS profile, NOT auth)
CREATE TABLE IF NOT EXISTS app.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS app.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships table (user ↔ org, many-to-many)
CREATE TABLE IF NOT EXISTS app.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id),
  CONSTRAINT valid_role CHECK (role IN ('OPS','DISPATCH','HR','SAFETY','FINANCE','DRIVER'))
);

-- Critical indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON app.users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON app.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON app.memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_status ON app.memberships(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON app.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON app.organizations(status);

-- Enable RLS
ALTER TABLE app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.memberships ENABLE ROW LEVEL SECURITY;
