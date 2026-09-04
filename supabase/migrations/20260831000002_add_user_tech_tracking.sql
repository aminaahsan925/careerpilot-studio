-- User technology learning tracking — records which technologies a student
-- wants to learn, is learning, has built a project with, or completed.

CREATE TABLE public.user_tech_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  technology_name text NOT NULL,
  status text NOT NULL DEFAULT 'want_to_learn'
    CHECK (status IN ('want_to_learn', 'learning', 'built_project', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, technology_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_tech_tracking TO authenticated;
GRANT ALL ON public.user_tech_tracking TO service_role;
ALTER TABLE public.user_tech_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own user_tech_tracking"
  ON public.user_tech_tracking FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX tech_tracking_user_idx
  ON public.user_tech_tracking (user_id);
