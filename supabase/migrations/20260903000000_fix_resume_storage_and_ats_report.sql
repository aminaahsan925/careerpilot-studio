-- ============================================================================
-- Resume feature repair + ATS report upgrade.
--
-- 1. Creates the "resumes" storage bucket. The original migration
--    (20260811095541) added RLS policies for bucket_id = 'resumes' but never
--    created the bucket itself, so every upload failed with "Bucket not found"
--    before the AI analysis could ever run.
-- 2. Extends resume_analyses so a single analysis can be scored either
--    generally or against a pasted job description for a specific company.
-- 3. Stores the AI-generated ATS-ready CV alongside the analysis.
-- ============================================================================

-- ============ PRIVATE RESUME BUCKET ============
-- Private (public = false): resume files are only reachable through the
-- per-user storage policies already defined in 20260811095541.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880,  -- 5 MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============ JOB-AWARE ATS REPORT ============
ALTER TABLE public.resume_analyses
  -- 'general' = overall CV grade, 'job' = graded against a pasted description.
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS target_company text,
  ADD COLUMN IF NOT EXISTS target_role text,
  ADD COLUMN IF NOT EXISTS job_description text,
  -- One-line recruiter verdict shown above the score.
  ADD COLUMN IF NOT EXISTS verdict text,
  -- Keywords from the job description found / not found in the CV.
  ADD COLUMN IF NOT EXISTS keyword_hits jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS missing_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Deterministic formatting checks: [{ label, status, detail }].
  ADD COLUMN IF NOT EXISTS format_audit jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Before/after line rewrites: [{ section, before, after }].
  ADD COLUMN IF NOT EXISTS section_rewrites jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- AI-generated, ATS-clean CV in markdown.
  ADD COLUMN IF NOT EXISTS generated_cv text,
  ADD COLUMN IF NOT EXISTS generated_cv_at timestamptz;

ALTER TABLE public.resume_analyses
  DROP CONSTRAINT IF EXISTS resume_analyses_scope_check;
ALTER TABLE public.resume_analyses
  ADD CONSTRAINT resume_analyses_scope_check CHECK (scope IN ('general', 'job'));

-- The generated CV is written back onto an existing analysis row, which the
-- original migration had no UPDATE policy for.
DROP POLICY IF EXISTS resume_analyses_update_own ON public.resume_analyses;
CREATE POLICY resume_analyses_update_own ON public.resume_analyses
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
