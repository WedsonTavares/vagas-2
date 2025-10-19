-- Migration: create certificates table for Supabase
-- Date: 2025-10-19

BEGIN;

-- Extensions commonly used (pgcrypto for gen_random_uuid and pg_trgm for trigram index)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table: certificates
-- Create a minimal table if it doesn't exist first (keeps migration safe)
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add or ensure columns exist using the exact names/types you provided
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS userid TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS course_name TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS file_mime TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS preview_path TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS preview_mime TEXT;
-- keep deleted_at for soft deletes if desired
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Indexes
-- Indexes adjusted to the current column names
CREATE INDEX IF NOT EXISTS idx_certificates_userid ON certificates (userid);
-- Trigram index for fast LIKE / ILIKE searches on course_name
CREATE INDEX IF NOT EXISTS idx_certificates_course_name_trgm ON certificates USING gin (course_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_certificates_dates ON certificates (start_date, end_date);

-- Optional: add foreign key to auth.users if the auth schema exists (Supabase)
-- NOTE: original migrations attempted to add a FK to auth.users referencing a UUID user_id.
-- The current schema uses 'userid' (text). If you want a foreign key to auth.users, consider
-- migrating 'userid' values to UUIDs and renaming the column to user_id (UUID), then add FK.
-- For safety we do not add a foreign key here because the column is a free-text 'userid'.

COMMIT;

-- Notes:
-- - Use 'DELETE' to drop rows or set 'deleted_at' for soft deletes.
-- - If you prefer a different table name (e.g. certificates vs courses), rename accordingly.
-- - This migration enables trigram indexes for better search; adjust if not needed.
