-- Agregar columna deletion_reason a negocios para registrar motivo de baja

ALTER TABLE negocios
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
