-- ============================================================
-- NEO PROMOS CHECK CONSTRAINT
-- ============================================================
-- Actualiza el CHECK constraint de tipo_descuento para incluir
-- el valor 'combo' (creado manualmente después de las
-- migraciones iniciales solo con 'porcentaje' y 'monto_fijo').
-- ============================================================

ALTER TABLE public.promos DROP CONSTRAINT IF EXISTS promos_tipo_descuento_check;
ALTER TABLE public.promos ADD CONSTRAINT promos_tipo_descuento_check
  CHECK (tipo_descuento IN ('porcentaje', 'monto_fijo', 'combo'));
