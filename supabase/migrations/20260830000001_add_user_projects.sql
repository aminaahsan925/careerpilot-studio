-- User projects: structured evidence capture so the platform works for
-- students who haven't uploaded a CV yet. Each project records what the
-- student built, which technologies they used, and an optional link.
-- Technologies are synced to skill_evidence (source = 'project') so that
-- readiness, diagnosis and gap analysis can use them as real evidence.

CREATE TABLE IF NOT EXISTS public.user_projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  project_url text,
  project_type text NOT NULL DEFAULT 'personal',
  completed   boolean NOT NULL DEFAULT false,
  position    int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can only see / manage their own projects.
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_projects'
      AND policyname = 'user_projects_select_own'
  ) THEN
    CREATE POLICY user_projects_select_own ON public.user_projects
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_projects'
      AND policyname = 'user_projects_insert_own'
  ) THEN
    CREATE POLICY user_projects_insert_own ON public.user_projects
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_projects'
      AND policyname = 'user_projects_update_own'
  ) THEN
    CREATE POLICY user_projects_update_own ON public.user_projects
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_projects'
      AND policyname = 'user_projects_delete_own'
  ) THEN
    CREATE POLICY user_projects_delete_own ON public.user_projects
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_projects TO authenticated;

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id
  ON public.user_projects (user_id, position);
