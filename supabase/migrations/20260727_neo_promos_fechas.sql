ALTER TABLE public.promos
  ADD COLUMN fecha_inicio TIMESTAMPTZ,
  ADD COLUMN fecha_fin TIMESTAMPTZ;

-- Index para consultar promos próximas a vencer
CREATE INDEX IF NOT EXISTS idx_promos_fecha_fin
  ON public.promos (fecha_fin)
  WHERE fecha_fin IS NOT NULL;
