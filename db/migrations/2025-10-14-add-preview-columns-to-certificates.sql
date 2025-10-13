BEGIN;

ALTER TABLE IF EXISTS public.certificates
  ADD COLUMN IF NOT EXISTS preview_path text;

ALTER TABLE IF EXISTS public.certificates
  ADD COLUMN IF NOT EXISTS preview_mime text;

COMMIT;
