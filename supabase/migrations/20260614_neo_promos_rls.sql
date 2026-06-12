-- ============================================================
-- NEO PROMOS RLS POLICY
-- ============================================================
-- Agrega política RLS a la tabla promos (creada manualmente
-- después de las migraciones iniciales).
-- Usa la helper function usuario_accede_negocio() existente.
-- ============================================================

DROP POLICY IF EXISTS "usuarios_ven_sus_promos" ON public.promos;
CREATE POLICY "usuarios_ven_sus_promos" ON public.promos
  FOR ALL USING (
    usuario_accede_negocio(promos.negocio_id)
  );
