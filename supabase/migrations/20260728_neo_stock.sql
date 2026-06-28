-- 1. Agregar columnas de stock a productos
ALTER TABLE public.productos
  ADD COLUMN stock INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN stock_minimo INTEGER NOT NULL DEFAULT 5;

-- 2. Modificar RPC para descontar stock al crear pedido
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
  v_stock INTEGER;
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

    -- Lookup del producto (autoridad: DB) — incluye stock
    SELECT nombre, precio, COALESCE(disponible, true), COALESCE(stock, 0)
    INTO v_producto_nombre, v_producto_precio, v_disponible, v_stock
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

    -- Validar stock si el producto tiene tracking habilitado (stock > 0)
    IF v_stock > 0 AND v_cantidad > v_stock THEN
      RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: %, solicitado: %',
        v_producto_nombre, v_stock, v_cantidad;
    END IF;

    -- Descontar stock (solo si tiene tracking habilitado)
    IF v_stock > 0 THEN
      UPDATE public.productos
      SET stock = stock - v_cantidad
      WHERE id = v_producto_id;
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
