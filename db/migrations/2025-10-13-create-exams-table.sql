-- Migration: Create exams table for 'Provas e Simulados'
-- Execute this in Supabase SQL editor or via your migration tool

CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY,
  userId text NOT NULL,
  materia text NOT NULL,
  examDate timestamptz NOT NULL,
  examTime text,
  location text,
  notes text,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exams_userid ON public.exams (userId);
CREATE INDEX IF NOT EXISTS idx_exams_examdate ON public.exams (examDate);
