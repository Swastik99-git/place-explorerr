/*
# Find Your Place — Full Schema

## Summary
Creates the complete schema for the Find Your Place application:
a social platform where users share and discover locations.

## New Tables

### 1. `profiles`
Stores public user profile data linked to Supabase auth.users.
- `id` (uuid, PK) — matches auth.users.id
- `name` (text, not null) — display name
- `email` (text, not null, unique)
- `image_url` (text) — URL to profile avatar stored in Supabase Storage
- `created_at` (timestamptz) — account creation time

### 2. `places`
Stores place entries created by users.
- `id` (uuid, PK)
- `title` (text, not null) — place name
- `description` (text, not null) — place description
- `image_url` (text, not null) — place photo URL from Supabase Storage
- `lat` (float8) — latitude coordinate
- `lng` (float8) — longitude coordinate
- `creator_id` (uuid, FK → profiles.id) — owner
- `created_at` (timestamptz)

## Security
- RLS enabled on both tables
- `profiles`: authenticated users can read all profiles (public discovery);
  each user can only insert/update/delete their own profile
- `places`: all authenticated users can read all places;
  each user can only insert/update/delete their own places

## Storage
- Two buckets: `avatars` (profile images) and `place-images` (place photos)
  — NOTE: storage buckets are created via the app code, not SQL
*/

-- ============================================================
-- PROFILES
-- ============================================================

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

-- ============================================================
-- PLACES
-- ============================================================

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

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS places_creator_id_idx ON places(creator_id);
CREATE INDEX IF NOT EXISTS places_created_at_idx ON places(created_at DESC);
