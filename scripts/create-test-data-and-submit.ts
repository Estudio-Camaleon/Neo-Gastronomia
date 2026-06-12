/**
 * Creates a test negocio and product, submits an order via RPC, then cleans up.
 * Run with:
 *   $env:NEXT_PUBLIC_SUPABASE_URL="..."; $env:SUPABASE_SERVICE_ROLE_KEY="..."; npx tsx scripts/create-test-data-and-submit.ts
 */
import { createClient } from "@supabase/supabase-js";

(async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  try {
    // 1) Create negocio
    const slug = `test-${Date.now()}`;
    const negocioInsert = await supabase
      .from("negocios")
      .insert({ nombre: `Test Negocio ${Date.now()}`, slug, color_primary: "#10b981" })
      .select("id, slug")
      .limit(1);

    if (negocioInsert.error) throw negocioInsert.error;
    const negocio = negocioInsert.data?.[0];
    console.log("Created negocio:", negocio);

    // 2) Create product
    const productoInsert = await supabase
      .from("productos")
      .insert({ negocio_id: negocio.id, nombre: "Test Product", precio: 100, disponible: true })
      .select("id")
      .limit(1);
    if (productoInsert.error) throw productoInsert.error;
    const producto = productoInsert.data?.[0];
    console.log("Created producto:", producto);

    // 3) Call RPC submit_order_atomic
    const rpc = await supabase.rpc("submit_order_atomic", {
      p_negocio_id: negocio.id,
      p_cliente_nombre: "Cliente Script",
      p_cliente_whatsapp: "+5491123456789",
      p_es_delivery: false,
      p_direccion_entrega: "",
      p_metodo_pago: "efectivo",
      p_notas: "Pedido de prueba",
      p_items: [{ producto_id: producto.id, cantidad: 1, detalles: null }],
    });

    console.log("RPC response:", JSON.stringify(rpc, null, 2));

    if (rpc.error) {
      throw rpc.error;
    }

    // Try to extract pedido id
    const pedidoData = rpc.data;
    let pedidoId: string | undefined;
    if (Array.isArray(pedidoData)) {
      pedidoId = pedidoData[0]?.id ?? pedidoData[0]?.pedido_id ?? String(pedidoData[0]);
    } else if (pedidoData && typeof pedidoData === "object") {
      pedidoId = (pedidoData as any).id ?? (pedidoData as any).pedido_id ?? String(Object.values(pedidoData)[0]);
    } else if (pedidoData) {
      pedidoId = String(pedidoData);
    }

    console.log("Extracted pedidoId:", pedidoId);

    // 4) Cleanup: delete pedido_items, pedidos, producto, negocio, clientes
    if (pedidoId) {
      const delItems = await supabase.from("pedido_items").delete().eq("pedido_id", pedidoId);
      if (delItems.error) console.warn("Warning deleting pedido_items:", delItems.error.message);
      const delPedido = await supabase.from("pedidos").delete().eq("id", pedidoId);
      if (delPedido.error) console.warn("Warning deleting pedido:", delPedido.error.message);
    }

    // delete product
    const delProd = await supabase.from("productos").delete().eq("id", producto.id);
    if (delProd.error) console.warn("Warning deleting producto:", delProd.error.message);

    // delete clientes created for this negocio (by phone)
    const delClientes = await supabase.from("clientes").delete().eq("telefono", "+5491123456789");
    if (delClientes.error) console.warn("Warning deleting clientes:", delClientes.error.message);

    // delete negocio
    const delNeg = await supabase.from("negocios").delete().eq("id", negocio.id);
    if (delNeg.error) console.warn("Warning deleting negocio:", delNeg.error.message);

    console.log("Cleanup complete.");
  } catch (err: any) {
    console.error("Error during test flow:", err.message ?? err);
    process.exit(2);
  }
})();
