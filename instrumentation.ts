/**
 * Middleware de Monitoreo Global - NEO Engine.
 * Captura excepciones y rechazos de promesas no controlados en el servidor.
 */
export async function register() {
  // Solo ejecutamos en el runtime de Node.js (Servidor)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 1. Captura de Excepciones Fatales
    process.on("uncaughtException", (error) => {
      const timestamp = new Date().toLocaleTimeString("es-AR");
      console.error(
        "\n" +
          "=".repeat(80) +
          `\n🚨 [NEO ERROR RADAR] -> Excepción Crítica: ${timestamp}` +
          `\n❌ ERROR: ${error.message}` +
          "\n" +
          "=".repeat(80) +
          `\n📋 TRAZA:\n${error.stack || "No stack trace disponible"}` +
          "\n" +
          "=".repeat(80) +
          "\n",
      );
    });

    // 2. Captura de Promesas Fallidas (Ej: Supabase Connection Timeout)
    process.on("unhandledRejection", (reason) => {
      const timestamp = new Date().toLocaleTimeString("es-AR");
      const errorDetails =
        reason instanceof Error ? reason.stack : String(reason);

      console.error(
        "\n" +
          "=".repeat(80) +
          `\n🚨 [NEO ERROR RADAR] -> Promesa Fallida: ${timestamp}` +
          "\n" +
          "=".repeat(80) +
          `\n📋 DETALLES TÉCNICOS:\n${errorDetails}` +
          "\n" +
          "=".repeat(80) +
          "\n",
      );
    });

    console.log("📡 Radar de instrumentación nativo NEO inicializado.");
  }
}
