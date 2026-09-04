-- DIAGNOSTIC INTAKE (additive migration — no existing tables altered)
CREATE TABLE public.diagnostic_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_year text,
  what_built text,
  languages_frameworks text NOT NULL DEFAULT '',
  practical_experience text,
  deployment_experience text,
  primary_career_goal text NOT NULL DEFAULT '',
  biggest_blocker text NOT NULL DEFAULT '',
  weekly_hours integer,
  learn_next_skill text,
  why_not_learned text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostic_intakes TO authenticated;
GRANT ALL ON public.diagnostic_intakes TO service_role;

ALTER TABLE public.diagnostic_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own diagnostic intakes"
ON public.diagnostic_intakes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX diagnostic_intakes_user_created_idx
  ON public.diagnostic_intakes (user_id, created_at DESC);

CREATE TRIGGER diagnostic_intakes_set_updated_at
BEFORE UPDATE ON public.diagnostic_intakes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
