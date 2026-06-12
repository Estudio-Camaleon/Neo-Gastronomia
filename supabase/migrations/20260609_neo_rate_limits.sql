-- 20260609: Rate limiter table para auth actions (reemplaza Map en memoria)
-- Persiste en DB para funcionar correctamente en serverless (multi-instance)

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,         -- e.g. "login:203.0.113.42"
  count INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits (key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits (expires_at);

-- Cleanup expired entries periodically
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE expires_at < now();
END;
$$;
