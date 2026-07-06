CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);



CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  lat float8 NOT NULL DEFAULT 20.2961,
  lng float8 NOT NULL DEFAULT 85.8245,
  creator_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE places ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "places_select_all" ON places;
CREATE POLICY "places_select_all" ON places FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "places_insert_own" ON places;
CREATE POLICY "places_insert_own" ON places FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "places_update_own" ON places;
CREATE POLICY "places_update_own" ON places FOR UPDATE
  TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "places_delete_own" ON places;
CREATE POLICY "places_delete_own" ON places FOR DELETE
  TO authenticated USING (auth.uid() = creator_id);



CREATE INDEX IF NOT EXISTS places_creator_id_idx ON places(creator_id);
CREATE INDEX IF NOT EXISTS places_created_at_idx ON places(created_at DESC);
