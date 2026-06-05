-- Add logo_scale column for zoom control
ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS logo_scale numeric DEFAULT 1.0 NOT NULL;
