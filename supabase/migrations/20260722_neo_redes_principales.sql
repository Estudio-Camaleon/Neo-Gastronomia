-- Migration: Add redes_principales column to negocios for header social links
-- Date: 2026-07-22

-- 1. New column to store which social networks appear in the public menu header (max 3)
ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS redes_principales jsonb DEFAULT '[]'::jsonb;

-- 2. Existing RLS policies already cover ALL COLUMNS for authenticated users,
--    so no policy changes needed.
