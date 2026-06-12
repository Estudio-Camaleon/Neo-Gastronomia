/**
 * Direct RPC caller for submit_order_atomic using @supabase/supabase-js.
 * Run with: npx tsx scripts/run-submit-direct.ts
 * Ensure env vars are set: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const payload = {
    p_negocio_id: process.env['TEST_NEGOCIO_ID'] || "00000000-0000-0000-0000-000000000000",
    p_cliente_nombre: "Script Test",
    p_cliente_whatsapp: "+5491123456789",
    p_es_delivery: false,
    p_direccion_entrega: "",
    p_metodo_pago: "efectivo",
    p_notas: "Prueba RPC directa",
    p_items: [
      { producto_id: process.env['TEST_PRODUCTO_ID'] || "00000000-0000-0000-0000-000000000000", cantidad: 1, detalles: null },
    ],
  } as any;

  try {
    const res = await supabase.rpc("submit_order_atomic", payload);
    console.log("RPC status:", JSON.stringify(res, null, 2));
    if (res.error) process.exit(2);
  } catch (err: any) {
    console.error("RPC call failed:", err.message ?? err);
    process.exit(3);
  }
}

main();
