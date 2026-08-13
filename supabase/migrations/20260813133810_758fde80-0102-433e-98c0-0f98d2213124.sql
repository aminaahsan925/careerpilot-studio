ALTER TABLE public.roadmap_stages
  ADD COLUMN IF NOT EXISTS why text,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS evidence_created text;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS interview_at date,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS outcome_recorded_at timestamp with time zone;