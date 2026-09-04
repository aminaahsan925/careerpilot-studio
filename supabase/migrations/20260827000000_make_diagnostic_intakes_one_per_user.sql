-- The intake upsert uses user_id as its conflict target.
CREATE UNIQUE INDEX diagnostic_intakes_one_per_user_idx
  ON public.diagnostic_intakes (user_id);