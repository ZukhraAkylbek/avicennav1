ALTER TABLE public.diagnostics_items
  ADD COLUMN IF NOT EXISTS hero_note text,
  ADD COLUMN IF NOT EXISTS advantages text,
  ADD COLUMN IF NOT EXISTS kinds text,
  ADD COLUMN IF NOT EXISTS offer_title text,
  ADD COLUMN IF NOT EXISTS offer_text text,
  ADD COLUMN IF NOT EXISTS schedule text,
  ADD COLUMN IF NOT EXISTS faq text,
  ADD COLUMN IF NOT EXISTS seo_heading text,
  ADD COLUMN IF NOT EXISTS seo_text text;