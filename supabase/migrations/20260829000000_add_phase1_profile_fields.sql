-- Phase 1 "Know Me" — additive columns for the profiles table.
-- No existing columns are altered; no tables are dropped or recreated.
-- RLS remains enabled; existing policies continue to apply.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_status   TEXT,
  ADD COLUMN IF NOT EXISTS academic_year    TEXT,
  ADD COLUMN IF NOT EXISTS experience       TEXT,
  ADD COLUMN IF NOT EXISTS project_count    TEXT,
  ADD COLUMN IF NOT EXISTS learning_history TEXT,
  ADD COLUMN IF NOT EXISTS certifications   TEXT,
  ADD COLUMN IF NOT EXISTS career_clarity   TEXT,
  ADD COLUMN IF NOT EXISTS biggest_problem  TEXT,
  ADD COLUMN IF NOT EXISTS education_prep   TEXT,
  ADD COLUMN IF NOT EXISTS education_prep_note TEXT,
  ADD COLUMN IF NOT EXISTS weekly_hours     TEXT;
