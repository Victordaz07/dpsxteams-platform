-- 004_audit_logs.sql
-- EPIC: Audit Logs (app schema)
-- Idempotent migration: safe to run multiple times
-- Backward compatible: if table already exists, it will add missing columns

CREATE SCHEMA IF NOT EXISTS app;

-- Create base table if it doesn't exist (fresh install)
CREATE TABLE IF NOT EXISTS app.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES app.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ Patch existing remote table (if it was created earlier without these columns)
ALTER TABLE app.audit_logs
  ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE app.audit_logs
  ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE app.audit_logs
  ADD COLUMN IF NOT EXISTS action TEXT;

ALTER TABLE app.audit_logs
  ADD COLUMN IF NOT EXISTS resource TEXT;

ALTER TABLE app.audit_logs
  ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE app.audit_logs
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes (safe)
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON app.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON app.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON app.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON app.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON app.audit_logs(resource);

-- RLS
ALTER TABLE app.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own organization audit logs" ON app.audit_logs;

CREATE POLICY "Users see own organization audit logs"
  ON app.audit_logs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT m.organization_id
      FROM app.memberships m
      JOIN app.users u ON u.id = m.user_id
      WHERE u.firebase_uid = auth.jwt() ->> 'firebase_uid'
        AND m.status = 'active'
    )
  );
