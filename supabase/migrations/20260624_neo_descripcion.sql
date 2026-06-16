-- 2026-06-24: Add descripcion column (business description / tagline)
-- Already exists on remote; this migration ensures local parity

ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT '';
