ALTER TABLE IF EXISTS app.memberships ENABLE ROW LEVEL SECURITY;

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

