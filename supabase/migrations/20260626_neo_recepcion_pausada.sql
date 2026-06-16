-- 20260626_neo_recepcion_pausada.sql
-- Agrega columna recepcion_pausada a negocios para toggle manual de pausa

ALTER TABLE public.negocios
  ADD COLUMN recepcion_pausada BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.negocios.recepcion_pausada IS 'Indica si la recepción de pedidos está pausada manualmente (panic mode).';
