-- 2026-06-22: Banner scale + multiple physical addresses
-- Adds zoom control for banner image and JSONB column for multiple addresses

ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS banner_scale numeric DEFAULT 1.0 NOT NULL,
  ADD COLUMN IF NOT EXISTS direcciones jsonb DEFAULT '[]'::jsonb NOT NULL;
