-- 20260625: Política RLS pública para promos
-- Permite SELECT anónimo en promos (necesario para el menú público)
-- Sigue el mismo patrón que productos_select_publico y categorias_select_publico

DROP POLICY IF EXISTS "promos_select_publico" ON public.promos;
CREATE POLICY "promos_select_publico" ON public.promos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = promos.negocio_id
    )
  );

COMMIT;
