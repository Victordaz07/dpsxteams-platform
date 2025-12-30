-- EPIC 5: Platform Console
-- Migration: Platform audit logs table

-- Ensure platform schema exists
CREATE SCHEMA IF NOT EXISTS platform;

-- Audit logs table
CREATE TABLE IF NOT EXISTS platform.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES platform.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON platform.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON platform.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON platform.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON platform.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON platform.audit_logs(user_id);

-- RLS: Deny all access by default (only service role can access)
ALTER TABLE platform.audit_logs ENABLE ROW LEVEL SECURITY;

-- Deny all policies (service role bypasses RLS)
CREATE POLICY "Deny all access to audit_logs"
  ON platform.audit_logs
  FOR ALL
  USING (false);

