-- ============================================================
-- NEO PROMOS — COLUMNA aplicar_a
-- ============================================================
-- Permite que ofertas (% y descuento fijo) se apliquen solo a
-- productos o categorías específicas.
-- 
-- Formato JSONB:
--   { "productos": ["uuid1", "uuid2"], "categorias": ["uuid3"] }
--   NULL = aplica a todos los productos (comportamiento anterior)
-- ============================================================

ALTER TABLE public.promos
  ADD COLUMN IF NOT EXISTS aplicar_a jsonb DEFAULT NULL;
