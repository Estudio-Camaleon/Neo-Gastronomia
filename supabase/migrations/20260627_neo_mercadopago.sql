-- Mercado Pago billing - suscripciones y planes
-- Agrega columnas MP a negocios (convive con stripe_* ya existentes)

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_status TEXT;

CREATE INDEX IF NOT EXISTS idx_negocios_mp_subscription ON public.negocios (mp_subscription_id);
CREATE INDEX IF NOT EXISTS idx_negocios_mp_customer ON public.negocios (mp_customer_id);
