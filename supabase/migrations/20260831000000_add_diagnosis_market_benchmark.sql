-- Ground the career diagnosis in the researched market-truth dataset.
--
-- `market_benchmark` stores the deterministic comparison between the
-- student's recorded evidence and the researched employer expectations for
-- their target role (which non-negotiables they can actually prove, and
-- the dataset version those expectations came from).
--
-- Persisting it keeps a diagnosis reproducible: reading an old diagnosis
-- shows the benchmark as it stood when the diagnosis was made, even after
-- the dataset is re-researched.

ALTER TABLE public.career_diagnoses
  ADD COLUMN IF NOT EXISTS market_benchmark jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.career_diagnoses.market_benchmark IS
  'Deterministic market-truth comparison: role match, must-have coverage, unproven non-negotiables, and the dataset version used.';
