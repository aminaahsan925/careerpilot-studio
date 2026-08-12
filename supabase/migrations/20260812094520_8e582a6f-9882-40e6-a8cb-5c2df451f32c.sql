-- TARGET JOBS
CREATE TABLE public.target_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  company text,
  source_url text,
  description text NOT NULL,
  parsed jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.target_jobs TO authenticated;
GRANT ALL ON public.target_jobs TO service_role;
ALTER TABLE public.target_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own target_jobs" ON public.target_jobs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX target_jobs_user_idx ON public.target_jobs (user_id, created_at DESC);

-- SKILL EVIDENCE
CREATE TABLE public.skill_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  skill_name text NOT NULL,
  source text NOT NULL DEFAULT 'claim',
  detail text,
  strength integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT skill_evidence_source_check CHECK (source IN ('claim','resume','project','github','certification','course')),
  CONSTRAINT skill_evidence_strength_check CHECK (strength BETWEEN 0 AND 3)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_evidence TO authenticated;
GRANT ALL ON public.skill_evidence TO service_role;
ALTER TABLE public.skill_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skill_evidence" ON public.skill_evidence FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX skill_evidence_user_idx ON public.skill_evidence (user_id);

-- SKILL GAPS
CREATE TABLE public.skill_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_job_id uuid REFERENCES public.target_jobs ON DELETE CASCADE,
  skill text NOT NULL,
  status text NOT NULL DEFAULT 'missing',
  priority text NOT NULL DEFAULT 'medium',
  evidence text,
  required_level text,
  why_it_matters text,
  action text,
  proof_task text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT skill_gaps_status_check CHECK (status IN ('matched','partial','missing','no_evidence')),
  CONSTRAINT skill_gaps_priority_check CHECK (priority IN ('high','medium','low'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_gaps TO authenticated;
GRANT ALL ON public.skill_gaps TO service_role;
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skill_gaps" ON public.skill_gaps FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX skill_gaps_user_idx ON public.skill_gaps (user_id, position);

-- READINESS SNAPSHOTS
CREATE TABLE public.readiness_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_job_id uuid REFERENCES public.target_jobs ON DELETE SET NULL,
  target_role text,
  overall integer NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  blockers jsonb NOT NULL DEFAULT '[]'::jsonb,
  stage text,
  next_action text,
  method_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT readiness_overall_check CHECK (overall BETWEEN 0 AND 100)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readiness_snapshots TO authenticated;
GRANT ALL ON public.readiness_snapshots TO service_role;
ALTER TABLE public.readiness_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own readiness_snapshots" ON public.readiness_snapshots FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX readiness_user_idx ON public.readiness_snapshots (user_id, created_at DESC);

-- WEEKLY GOALS
CREATE TABLE public.weekly_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  week_start date NOT NULL DEFAULT (date_trunc('week', now())::date),
  title text NOT NULL,
  detail text,
  linked_skill text,
  evidence_created text,
  completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_goals TO authenticated;
GRANT ALL ON public.weekly_goals TO service_role;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weekly_goals" ON public.weekly_goals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX weekly_goals_user_idx ON public.weekly_goals (user_id, week_start DESC, position);

-- CAREER RECOMMENDATIONS (discovery path)
CREATE TABLE public.career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL,
  why_fit text,
  required_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  already_have jsonb NOT NULL DEFAULT '[]'::jsonb,
  need_to_build jsonb NOT NULL DEFAULT '[]'::jsonb,
  example_titles jsonb NOT NULL DEFAULT '[]'::jsonb,
  fit_note text,
  selected boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_recommendations TO authenticated;
GRANT ALL ON public.career_recommendations TO service_role;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own career_recommendations" ON public.career_recommendations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX career_recs_user_idx ON public.career_recommendations (user_id, position);

-- updated_at triggers
CREATE TRIGGER target_jobs_updated_at BEFORE UPDATE ON public.target_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER skill_evidence_updated_at BEFORE UPDATE ON public.skill_evidence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER skill_gaps_updated_at BEFORE UPDATE ON public.skill_gaps
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER weekly_goals_updated_at BEFORE UPDATE ON public.weekly_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();