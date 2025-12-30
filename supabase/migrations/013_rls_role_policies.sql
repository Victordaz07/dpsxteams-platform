-- 003_rls_role_policies.sql
-- EPIC 2: RLS Role Policies
-- Idempotent migration (safe to re-run)

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS app.memberships ENABLE ROW LEVEL SECURITY;

-- =========================
-- Memberships UPDATE policy
-- =========================

-- Users can update their own membership status
DROP POLICY IF EXISTS "Users can update own membership status" ON app.memberships;

CREATE POLICY "Users can update own membership status"
  ON app.memberships
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id
      FROM app.users
      WHERE firebase_uid = auth.jwt() ->> 'firebase_uid'
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id
      FROM app.users
      WHERE firebase_uid = auth.jwt() ->> 'firebase_uid'
    )
  );

-- Note:
-- More granular policies for INSERT/UPDATE/DELETE
-- based on specific roles (ADMIN, DRIVER, OWNER)
-- will be introduced in future EPICs
