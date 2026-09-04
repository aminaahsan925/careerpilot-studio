-- Brutal Roadmap v2 — persistence for the AI-generated execution plan.
-- Five tables: learning paths (the plan containers), daily work (one row per
-- day of a path), MCQ tests (gate questions per path), MCQ attempts (a user's
-- graded attempt on a day's test) and notifications (streak / nudge events).
-- Everything is owned by a single auth user, cascades on delete, and is
-- protected by user-scoped RLS. Server functions use the service_role grant.

-- ============================================================================
-- 1. roadmap_learning_paths
-- ============================================================================

CREATE TABLE public.roadmap_learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert')),
  category text NOT NULL,
  market_justification text NOT NULL,
  outdated_warning text,
  must_know text[] NOT NULL DEFAULT '{}',
  curated_resources jsonb NOT NULL DEFAULT '[]',
  position int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, title, level)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_learning_paths TO authenticated;
GRANT ALL ON public.roadmap_learning_paths TO service_role;

ALTER TABLE public.roadmap_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own learning paths"
  ON public.roadmap_learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning paths"
  ON public.roadmap_learning_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths"
  ON public.roadmap_learning_paths FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning paths"
  ON public.roadmap_learning_paths FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX roadmap_learning_paths_user_id_idx
  ON public.roadmap_learning_paths (user_id);

-- ============================================================================
-- 2. roadmap_daily_work
-- ============================================================================

CREATE TABLE public.roadmap_daily_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  learning_path_id uuid NOT NULL REFERENCES public.roadmap_learning_paths(id) ON DELETE CASCADE,
  day_number int NOT NULL,
  date_assigned date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  explanation text NOT NULL,
  what_is_this text NOT NULL,
  why_companies_care text NOT NULL,
  how_to_learn text NOT NULL,
  hands_on_task text NOT NULL,
  curated_links jsonb NOT NULL DEFAULT '[]',
  estimated_minutes int NOT NULL DEFAULT 60,
  problem_solving_exercise text,
  completed boolean NOT NULL DEFAULT false,
  mcq_passed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_daily_work TO authenticated;
GRANT ALL ON public.roadmap_daily_work TO service_role;

ALTER TABLE public.roadmap_daily_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own daily work"
  ON public.roadmap_daily_work FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily work"
  ON public.roadmap_daily_work FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily work"
  ON public.roadmap_daily_work FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily work"
  ON public.roadmap_daily_work FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX roadmap_daily_work_user_id_idx
  ON public.roadmap_daily_work (user_id);

-- learning_path_id as the leading column covers per-path lookups while
-- day_number keeps the "days of a path in order" query efficient.
CREATE INDEX roadmap_daily_work_path_day_idx
  ON public.roadmap_daily_work (learning_path_id, day_number);

-- ============================================================================
-- 3. roadmap_mcq_tests
-- No direct user_id column — ownership resolves through the learning path.
-- ============================================================================

CREATE TABLE public.roadmap_mcq_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid NOT NULL REFERENCES public.roadmap_learning_paths(id) ON DELETE CASCADE,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  company_relevance text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  position int NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_mcq_tests TO authenticated;
GRANT ALL ON public.roadmap_mcq_tests TO service_role;

ALTER TABLE public.roadmap_mcq_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own MCQ tests"
  ON public.roadmap_mcq_tests FOR SELECT
  USING (learning_path_id IN (SELECT id FROM public.roadmap_learning_paths WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own MCQ tests"
  ON public.roadmap_mcq_tests FOR INSERT
  WITH CHECK (learning_path_id IN (SELECT id FROM public.roadmap_learning_paths WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own MCQ tests"
  ON public.roadmap_mcq_tests FOR UPDATE
  USING (learning_path_id IN (SELECT id FROM public.roadmap_learning_paths WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own MCQ tests"
  ON public.roadmap_mcq_tests FOR DELETE
  USING (learning_path_id IN (SELECT id FROM public.roadmap_learning_paths WHERE user_id = auth.uid()));

-- learning_path_id leading column covers per-path lookups; position keeps the
-- "questions of a path in order" query efficient.
CREATE INDEX roadmap_mcq_tests_learning_path_idx
  ON public.roadmap_mcq_tests (learning_path_id, position);

-- ============================================================================
-- 4. roadmap_mcq_attempts
-- ============================================================================

CREATE TABLE public.roadmap_mcq_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  daily_work_id uuid NOT NULL REFERENCES public.roadmap_daily_work(id) ON DELETE CASCADE,
  questions jsonb NOT NULL,
  score int NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  attempts int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_mcq_attempts TO authenticated;
GRANT ALL ON public.roadmap_mcq_attempts TO service_role;

ALTER TABLE public.roadmap_mcq_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own MCQ attempts"
  ON public.roadmap_mcq_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MCQ attempts"
  ON public.roadmap_mcq_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MCQ attempts"
  ON public.roadmap_mcq_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MCQ attempts"
  ON public.roadmap_mcq_attempts FOR DELETE
  USING (auth.uid() = user_id);

-- Attempts reach a learning path through daily_work (this table has no
-- learning_path_id column), so daily_work_id is the join index that matters.
CREATE INDEX roadmap_mcq_attempts_user_id_idx
  ON public.roadmap_mcq_attempts (user_id);

CREATE INDEX roadmap_mcq_attempts_daily_work_idx
  ON public.roadmap_mcq_attempts (daily_work_id);

-- ============================================================================
-- 5. roadmap_notifications
-- ============================================================================

CREATE TABLE public.roadmap_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  daily_work_id uuid REFERENCES public.roadmap_daily_work(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('daily_work', 'streak_warning', 'mcq_ready', 'level_up', 'market_alert')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_notifications TO authenticated;
GRANT ALL ON public.roadmap_notifications TO service_role;

ALTER TABLE public.roadmap_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON public.roadmap_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.roadmap_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.roadmap_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.roadmap_notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX roadmap_notifications_user_id_idx
  ON public.roadmap_notifications (user_id);

CREATE INDEX roadmap_notifications_daily_work_idx
  ON public.roadmap_notifications (daily_work_id);
