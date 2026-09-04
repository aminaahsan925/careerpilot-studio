-- Tech Trends cache — stores AI-analysed technology intelligence globally
-- (shared across all users) so we don't re-run Tavily + Groq on every visit.
-- Keyed by topic (e.g. "emerging AI technologies") with a 7-day TTL.

CREATE TABLE public.tech_trends_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL UNIQUE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tech_trends_cache TO authenticated;
GRANT ALL ON public.tech_trends_cache TO service_role;
ALTER TABLE public.tech_trends_cache ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read global trend data
CREATE POLICY "authenticated read tech_trends"
  ON public.tech_trends_cache FOR SELECT TO authenticated
  USING (true);

-- Only service_role can write (server functions use service_role for writes)
CREATE POLICY "service_role write tech_trends"
  ON public.tech_trends_cache FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX tech_trends_topic_idx
  ON public.tech_trends_cache (topic, expires_at DESC);
