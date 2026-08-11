-- ============ MENTOR CHAT ============
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_user_created_idx ON public.chat_messages (user_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_messages_select_own ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY chat_messages_insert_own ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_messages_delete_own ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RESUMES ============
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  content_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX resumes_user_created_idx ON public.resumes (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY resumes_select_own ON public.resumes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY resumes_insert_own ON public.resumes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY resumes_update_own ON public.resumes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY resumes_delete_own ON public.resumes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER resumes_set_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE,
  ats_score integer NOT NULL DEFAULT 0 CHECK (ats_score BETWEEN 0 AND 100),
  resume_score integer NOT NULL DEFAULT 0 CHECK (resume_score BETWEEN 0 AND 100),
  career_match integer NOT NULL DEFAULT 0 CHECK (career_match BETWEEN 0 AND 100),
  summary text,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
  detected_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  role_matches jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX resume_analyses_user_created_idx ON public.resume_analyses (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY resume_analyses_select_own ON public.resume_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY resume_analyses_insert_own ON public.resume_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY resume_analyses_delete_own ON public.resume_analyses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ ROADMAP ============
CREATE TABLE public.roadmap_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  timeframe text,
  description text,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  project text,
  courses jsonb NOT NULL DEFAULT '[]'::jsonb,
  position integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX roadmap_stages_user_position_idx ON public.roadmap_stages (user_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_stages TO authenticated;
GRANT ALL ON public.roadmap_stages TO service_role;
ALTER TABLE public.roadmap_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY roadmap_stages_select_own ON public.roadmap_stages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY roadmap_stages_insert_own ON public.roadmap_stages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY roadmap_stages_update_own ON public.roadmap_stages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY roadmap_stages_delete_own ON public.roadmap_stages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER roadmap_stages_set_updated_at BEFORE UPDATE ON public.roadmap_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.roadmap_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX roadmap_milestones_user_position_idx ON public.roadmap_milestones (user_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_milestones TO authenticated;
GRANT ALL ON public.roadmap_milestones TO service_role;
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY roadmap_milestones_select_own ON public.roadmap_milestones FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY roadmap_milestones_insert_own ON public.roadmap_milestones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY roadmap_milestones_update_own ON public.roadmap_milestones FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY roadmap_milestones_delete_own ON public.roadmap_milestones FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER roadmap_milestones_set_updated_at BEFORE UPDATE ON public.roadmap_milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ APPLICATIONS ============
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  role_title text NOT NULL,
  location text,
  status text NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied','Under Review','Interview Scheduled','Offer','Rejected')),
  job_url text,
  notes text,
  applied_at date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX applications_user_created_idx ON public.applications (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY applications_select_own ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY applications_insert_own ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY applications_update_own ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY applications_delete_own ON public.applications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER applications_set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PROFILE AUTO-CREATION ============
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON public.profiles (user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NULLIF(split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1), ''),
    NULLIF(split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PRIVATE RESUME FILE ACCESS ============
CREATE POLICY "Users can read own resume files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own resume files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own resume files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resume files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);