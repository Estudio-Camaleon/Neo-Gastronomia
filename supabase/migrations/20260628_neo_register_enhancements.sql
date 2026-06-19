-- Agregar columnas phone (celular del titular) y referral_source a negocios

ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS referral_source TEXT;
