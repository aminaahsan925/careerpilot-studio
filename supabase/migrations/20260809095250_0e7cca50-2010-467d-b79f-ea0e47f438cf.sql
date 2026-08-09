-- shared updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  education_level TEXT,
  degree TEXT,
  university TEXT,
  graduation_year INTEGER,
  "current_role" TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CAREER GOALS
CREATE TABLE public.career_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  target_industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_goals TO authenticated;
GRANT ALL ON public.career_goals TO service_role;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_goals_select_own" ON public.career_goals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "career_goals_insert_own" ON public.career_goals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "career_goals_update_own" ON public.career_goals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "career_goals_delete_own" ON public.career_goals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER career_goals_set_updated_at BEFORE UPDATE ON public.career_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SKILLS CATALOGUE
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select_all" ON public.skills
  FOR SELECT USING (true);
CREATE POLICY "skills_insert_authenticated" ON public.skills
  FOR INSERT TO authenticated WITH CHECK (true);

-- USER SKILLS
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency INTEGER NOT NULL DEFAULT 50 CHECK (proficiency >= 0 AND proficiency <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT ALL ON public.user_skills TO service_role;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_skills_select_own" ON public.user_skills
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_skills_insert_own" ON public.user_skills
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_skills_update_own" ON public.user_skills
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_skills_delete_own" ON public.user_skills
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER user_skills_set_updated_at BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX user_skills_user_id_idx ON public.user_skills(user_id);

-- Seed the shared skill catalogue
INSERT INTO public.skills (name, category) VALUES
  ('Python', 'Programming'),
  ('JavaScript', 'Programming'),
  ('TypeScript', 'Programming'),
  ('React', 'Frontend'),
  ('Next.js', 'Frontend'),
  ('Node.js', 'Backend'),
  ('SQL', 'Data'),
  ('Git', 'Tools'),
  ('C++', 'Programming'),
  ('Java', 'Programming'),
  ('Excel', 'Data'),
  ('Power BI', 'Data'),
  ('Machine Learning', 'AI'),
  ('Communication', 'Soft Skills'),
  ('Problem Solving', 'Soft Skills');
