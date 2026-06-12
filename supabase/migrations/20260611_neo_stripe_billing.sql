-- 20260611: Stripe billing - suscripciones y planes
-- Agrega columnas de facturacion a negocios + tabla de webhooks

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_ends_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_negocios_stripe_customer ON public.negocios (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_negocios_plan ON public.negocios (plan_tier);
