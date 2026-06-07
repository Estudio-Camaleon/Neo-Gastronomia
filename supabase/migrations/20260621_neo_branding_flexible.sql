-- 2026-06-21: Flexible branding — logo shape/fit, banner height
-- Allows non-circular logos and configurable banner sizing

ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS logo_fit TEXT NOT NULL DEFAULT 'contain',
  ADD COLUMN IF NOT EXISTS logo_shape TEXT NOT NULL DEFAULT 'circle',
  ADD COLUMN IF NOT EXISTS banner_height TEXT NOT NULL DEFAULT 'normal';
