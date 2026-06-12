// Run this script from repository root: node scripts/run-submit-test.ts
// It loads runtime via ts-node transpilation if available. This script is best run
// using `tsx` in dev: `npx tsx scripts/run-submit-test.ts`.
import path from "path";
import { fileURLToPath } from "url";

// Resolve project root and import the compiled module path used in Node runtime
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Import dynamically from the source compiled by tsx/netx loader when running with tsx.
// Wrap in an async IIFE to avoid top-level await issues
(async function run() {
  // Import the server action module dynamically
  const submitModule = await import("../src/features/admin/orders/actions");
  const submitOrderPublicAction: typeof submitModule.submitOrderPublicAction = (submitModule as any).submitOrderPublicAction;

  
  const payload = {
    negocio_id: "00000000-0000-0000-0000-000000000000",
    cliente_nombre: "Test Cliente",
    cliente_whatsapp: "+5491123456789",
    es_delivery: false,
    direccion_entrega: "",
    metodo_pago: "efectivo",
    notas: "Prueba local",
    items: [
      { producto_id: "00000000-0000-0000-0000-000000000000", cantidad: 1 },
    ],
  } as any;

  try {
    const res = await submitOrderPublicAction(payload);
    console.log("RPC returned:", res);
  } catch (err: any) {
    console.error("Submit failed:", err?.message ?? String(err));
    if (err?.stack) console.error(err.stack);
    // If it's a structured error, print JSON
    try {
      console.error("Full error:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch {}
    process.exit(1);
  }
})();
