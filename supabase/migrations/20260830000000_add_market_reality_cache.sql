-- Market Reality cache — stores AI-generated market reports per user+role
-- so we don't re-run two Groq LLM calls on every page visit.
-- Cache is invalidated when the user changes their target role or industry,
-- or when the cached data expires (default: 7 days).

CREATE TABLE public.market_reality_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_role text NOT NULL,
  target_industry text,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_reality_cache TO authenticated;
GRANT ALL ON public.market_reality_cache TO service_role;
ALTER TABLE public.market_reality_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own market_reality_cache"
  ON public.market_reality_cache FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX market_cache_user_role_idx
  ON public.market_reality_cache (user_id, target_role, expires_at DESC);
