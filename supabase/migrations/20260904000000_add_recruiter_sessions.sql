-- Recruiter audit sessions are persisted per authenticated user.
CREATE TABLE IF NOT EXISTS public.recruiter_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id text NOT NULL,
  company_name text NOT NULL,
  target_role text NOT NULL,
  overall_score integer NOT NULL DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
  hire_chance integer NOT NULL DEFAULT 0 CHECK (hire_chance BETWEEN 0 AND 100),
  reject_chance integer NOT NULL DEFAULT 0 CHECK (reject_chance BETWEEN 0 AND 100),
  verdict_tier text NOT NULL DEFAULT '',
  audit_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  chat_messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruiter_sessions TO authenticated;
GRANT ALL ON public.recruiter_sessions TO service_role;

ALTER TABLE public.recruiter_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recruiter_sessions_select_own ON public.recruiter_sessions;
CREATE POLICY recruiter_sessions_select_own
  ON public.recruiter_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS recruiter_sessions_insert_own ON public.recruiter_sessions;
CREATE POLICY recruiter_sessions_insert_own
  ON public.recruiter_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS recruiter_sessions_update_own ON public.recruiter_sessions;
CREATE POLICY recruiter_sessions_update_own
  ON public.recruiter_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS recruiter_sessions_delete_own ON public.recruiter_sessions;
CREATE POLICY recruiter_sessions_delete_own
  ON public.recruiter_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS recruiter_sessions_user_created_idx
  ON public.recruiter_sessions (user_id, created_at DESC);

DROP TRIGGER IF EXISTS recruiter_sessions_set_updated_at ON public.recruiter_sessions;
CREATE TRIGGER recruiter_sessions_set_updated_at
  BEFORE UPDATE ON public.recruiter_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
