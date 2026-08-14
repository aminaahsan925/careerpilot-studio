CREATE TABLE public.career_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role text,
  target_job_id uuid REFERENCES public.target_jobs(id) ON DELETE SET NULL,
  target_job_label text,
  stage text,
  readiness_overall integer,
  readiness_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  blockers jsonb NOT NULL DEFAULT '[]'::jsonb,
  priorities jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_best_action jsonb NOT NULL DEFAULT '{}'::jsonb,
  sequence jsonb NOT NULL DEFAULT '[]'::jsonb,
  progress_note text,
  evidence_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_diagnoses TO authenticated;
GRANT ALL ON public.career_diagnoses TO service_role;

ALTER TABLE public.career_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own career diagnoses"
ON public.career_diagnoses FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX career_diagnoses_user_created_idx ON public.career_diagnoses (user_id, created_at DESC);

CREATE TRIGGER career_diagnoses_set_updated_at
BEFORE UPDATE ON public.career_diagnoses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();