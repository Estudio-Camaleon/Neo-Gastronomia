-- ============================================================
-- NEO REPLICA IDENTITY FULL
-- ============================================================
-- REPLICA IDENTITY FULL asegura que los eventos Realtime
-- contengan TODAS las columnas de la fila, no solo la PK.
-- Sin esto, payload.new en postgres_changes solo trae `id`.
-- ============================================================

ALTER TABLE public.pedidos REPLICA IDENTITY FULL;
ALTER TABLE public.pedido_items REPLICA IDENTITY FULL;
