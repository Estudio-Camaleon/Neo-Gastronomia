-- Migration: Add social media links and floating food shapes to negocios
-- Date: 2026-06-23

-- 1. New social media columns for bars/restaurants
ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS twitter_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tripadvisor_url text DEFAULT '';

-- 2. Floating food shapes selection (array of icon names)
ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS floating_shapes jsonb DEFAULT '[]'::jsonb;

-- 3. Update RLS policies to include new columns (same as existing ones)
-- The existing RLS policies apply to "ALL COLUMNS" for authenticated users
-- so no policy changes needed for the new columns.
