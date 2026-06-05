-- ============================================================
-- NEO BRANDING ENHANCEMENTS
-- ============================================================
-- Agrega campos de personalización visual avanzada a negocios:
--   - logo_posicion   : control de object-position del logo
--   - banner_posicion : control de object-position del banner
--   - mostrar_nombre  : toggle para ocultar nombre en menú público
-- ============================================================

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS logo_posicion TEXT NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS banner_posicion TEXT NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS mostrar_nombre BOOLEAN NOT NULL DEFAULT true;
