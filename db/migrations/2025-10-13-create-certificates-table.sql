-- Migration: create certificates table (idempotent)
BEGIN;

-- ensure uuid generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- create table if missing
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userid text NOT NULL,
  course_name text NOT NULL,
  duration text,
  description text,
  start_date date,
  end_date date,
  institution text,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_mime text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- add columns if missing (safe for existing tables)
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS userid text NOT NULL;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS course_name text NOT NULL;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS institution text;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS file_name text NOT NULL;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS storage_path text NOT NULL;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS file_mime text;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS certificates_userid_idx ON public.certificates (userid);

COMMIT;
