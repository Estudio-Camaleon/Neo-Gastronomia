-- Add delivery configuration columns to negocios table
-- tipo_envio: 'fijo' = fixed cost, 'gratuito' = free, 'no_disponible' = pickup only
ALTER TABLE negocios
ADD COLUMN tipo_envio text NOT NULL DEFAULT 'fijo',
ADD COLUMN costo_envio numeric NOT NULL DEFAULT 0,
ADD COLUMN pedido_minimo numeric NOT NULL DEFAULT 0,
ADD COLUMN moneda_simbolo text NOT NULL DEFAULT '$';
