-- ============================================================
-- NEO REALTIME & ATOMIC ORDER SUBMISSION
-- ============================================================
-- 1. Habilita realtime para `pedidos` y `pedido_items`
--    (PedidosRadar ya está suscrito al canal — sólo faltaba publicar)
-- 2. Partial unique index en `clientes(negocio_id, telefono)`
--    para que el upsert dentro del RPC sea atómico
-- 3. Función RPC `submit_order_atomic`:
--    - Valida el producto pertenece al negocio (server = autoridad)
--    - Toma `productos.precio` y `productos.nombre` desde la DB
--    - Suma extras desde el JSON de `detalles` para el precio real
--    - UPSERT de cliente por (negocio_id, telefono) en una sola pasada
--    - Setea `cliente_id` en el pedido
--    - Computa y persiste el total server-side
--    - Todo dentro de una transacción implícita de plpgsql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. REALTIME PUBLICATION
-- ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'pedidos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'pedido_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pedido_items;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- 2. UNIQUE INDEX PARCIAL clientes(negocio_id, telefono)
-- ──────────────────────────────────────────────────────────────
-- Partial index: permite múltiples teléfonos NULL por negocio,
-- pero garantiza unicidad cuando el teléfono está presente.
-- Permite usar ON CONFLICT en el RPC de forma atómica.

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_negocio_telefono_unique
  ON public.clientes (negocio_id, telefono)
  WHERE telefono IS NOT NULL;

-- ──────────────────────────────────────────────────────────────
-- 3. RPC: submit_order_atomic
-- ──────────────────────────────────────────────────────────────
-- SECURITY DEFINER: ejecuta con permisos del owner de la función
-- (bypasea RLS). Es seguro porque la función valida todo internamente
-- y solo inserta en el negocio pasado como parámetro.
--
-- Uso desde el cliente:
--   supabase.rpc('submit_order_atomic', {
--     p_negocio_id, p_cliente_nombre, p_cliente_whatsapp,
--     p_es_delivery, p_direccion_entrega, p_metodo_pago,
--     p_notas, p_items
--   })
-- Devuelve: UUID del pedido creado.

CREATE OR REPLACE FUNCTION public.submit_order_atomic(
  p_negocio_id UUID,
  p_cliente_nombre TEXT,
  p_cliente_whatsapp TEXT,
  p_es_delivery BOOLEAN,
  p_direccion_entrega TEXT,
  p_metodo_pago TEXT,
  p_notas TEXT,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pedido_id UUID;
  v_cliente_id UUID;
  v_item JSONB;
  v_producto_id UUID;
  v_producto_nombre TEXT;
  v_producto_precio NUMERIC;
  v_disponible BOOLEAN;
  v_cantidad INT;
  v_detalles TEXT;
  v_extras_total NUMERIC := 0;
  v_precio_unitario NUMERIC;
  v_total NUMERIC := 0;
  v_telefono_norm TEXT;
BEGIN
  v_telefono_norm := NULLIF(TRIM(p_cliente_whatsapp), '');

  -- 1) Validar items no vacío
  IF p_items IS NULL
     OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0
  THEN
    RAISE EXCEPTION 'El pedido debe contener al menos un item';
  END IF;

  -- 2) INSERT pedido con total placeholder 0
  INSERT INTO public.pedidos (
    negocio_id,
    cliente_nombre,
    cliente_whatsapp,
    es_delivery,
    direccion_entrega,
    metodo_pago,
    notas,
    estado,
    total
  ) VALUES (
    p_negocio_id,
    NULLIF(TRIM(p_cliente_nombre), ''),
    v_telefono_norm,
    COALESCE(p_es_delivery, false),
    CASE
      WHEN COALESCE(p_es_delivery, false)
      THEN NULLIF(TRIM(p_direccion_entrega), '')
      ELSE NULL
    END,
    p_metodo_pago,
    NULLIF(TRIM(p_notas), ''),
    'pendiente'::estado_pedido,
    0
  )
  RETURNING id INTO v_pedido_id;

  -- 3) UPSERT cliente por (negocio_id, telefono) y linkearlo al pedido
  IF v_telefono_norm IS NOT NULL THEN
    INSERT INTO public.clientes (negocio_id, nombre, telefono, direccion)
    VALUES (
      p_negocio_id,
      TRIM(p_cliente_nombre),
      v_telefono_norm,
      CASE
        WHEN COALESCE(p_es_delivery, false)
        THEN NULLIF(TRIM(p_direccion_entrega), '')
        ELSE NULL
      END
    )
    ON CONFLICT (negocio_id, telefono) WHERE telefono IS NOT NULL
      DO UPDATE SET
        nombre = EXCLUDED.nombre,
        direccion = COALESCE(EXCLUDED.direccion, clientes.direccion)
    RETURNING id INTO v_cliente_id;

    UPDATE public.pedidos
    SET cliente_id = v_cliente_id
    WHERE id = v_pedido_id;
  END IF;

  -- 4) Procesar items validando contra la DB (server = autoridad)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF NULLIF(v_item->>'producto_id', '') IS NULL THEN
      RAISE EXCEPTION 'Item inválido: producto_id requerido';
    END IF;

    BEGIN
      v_producto_id := (v_item->>'producto_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'producto_id inválido: %', v_item->>'producto_id';
    END;

    v_cantidad := COALESCE((v_item->>'cantidad')::INT, 0);
    IF v_cantidad <= 0 THEN
      RAISE EXCEPTION 'Cantidad inválida para producto %', v_producto_id;
    END IF;

    v_detalles := v_item->>'detalles';

    -- Lookup del producto (autoridad: DB)
    SELECT nombre, precio, COALESCE(disponible, true)
    INTO v_producto_nombre, v_producto_precio, v_disponible
    FROM public.productos
    WHERE id = v_producto_id
      AND negocio_id = p_negocio_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado o no pertenece al negocio: %',
        v_producto_id;
    END IF;

    IF NOT v_disponible THEN
      RAISE EXCEPTION 'Producto no disponible: %', v_producto_nombre;
    END IF;

    -- Sumar extras desde el JSON de `detalles`
    v_extras_total := 0;
    IF v_detalles IS NOT NULL AND LENGTH(TRIM(v_detalles)) > 0 THEN
      BEGIN
        SELECT COALESCE(SUM((e->>'item_precio')::NUMERIC), 0)
        INTO v_extras_total
        FROM jsonb_array_elements(v_detalles::JSONB) AS e;
      EXCEPTION WHEN OTHERS THEN
        v_extras_total := 0;
      END;
    END IF;

    v_precio_unitario := v_producto_precio + v_extras_total;
    v_total := v_total + (v_precio_unitario * v_cantidad);

    INSERT INTO public.pedido_items (
      pedido_id,
      producto_id,
      nombre_producto,
      cantidad,
      precio_unitario,
      detalles
    ) VALUES (
      v_pedido_id,
      v_producto_id,
      v_producto_nombre,
      v_cantidad,
      v_precio_unitario,
      v_detalles
    );
  END LOOP;

  -- 5) Persistir el total computado server-side
  UPDATE public.pedidos
  SET total = v_total
  WHERE id = v_pedido_id;

  RETURN v_pedido_id;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. PERMISOS
-- ──────────────────────────────────────────────────────────────
-- El RPC se invoca con supabaseAdmin (service_role) desde el server
-- action. También dejamos acceso a anon/authenticated por si se
-- quisiera invocar directamente desde el cliente en el futuro.
GRANT EXECUTE ON FUNCTION public.submit_order_atomic
  TO anon, authenticated, service_role;
