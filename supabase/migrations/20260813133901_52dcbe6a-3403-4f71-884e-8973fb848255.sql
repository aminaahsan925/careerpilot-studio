ALTER TABLE public.weekly_goals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started';