/**
 * Middleware de Monitoreo Global - NEO Engine.
 * Ataja cualquier excepción no controlada en Server Components, API Routes o Server Actions.
 */
/**
 * Middleware de Monitoreo Global - NEO Engine.
 * Captura excepciones y rechazos de promesas no controlados en el hilo del Servidor de forma nativa.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Escuchamos errores fatales no controlados
    process.on("uncaughtException", (error) => {
      const timestamp = new Date().toLocaleTimeString("es-AR");
      console.log(
        "\n===============================================================================",
      );
      console.log(
        `🚨 [NEO ERROR RADAR] -> Excepción Crítica atajada a las ${timestamp}`,
      );
      console.log(`❌ ERROR: ${error.message}`);
      console.log(
        "===============================================================================",
      );
      console.log("📋 TRAZA DEL ERROR:");
      console.log(error.stack || "No stack trace disponible");
      console.log(
        "===============================================================================\n",
      );
    });

    // Escuchamos promesas rotas / fallos asíncronos (Ej: Errores de conexión de Supabase)
    process.on("unhandledRejection", (reason) => {
      const timestamp = new Date().toLocaleTimeString("es-AR");
      const errorDetails =
        reason instanceof Error ? reason.stack : String(reason);

      console.log(
        "\n===============================================================================",
      );
      console.log(
        `🚨 [NEO ERROR RADAR] -> Promesa Fallida (Asíncrona) a las ${timestamp}`,
      );
      console.log(
        "===============================================================================",
      );
      console.log("📋 DETALLES TÉCNICOS:");
      console.log(errorDetails);
      console.log(
        "===============================================================================\n",
      );
    });

    console.log(
      "📡 Radar de instrumentación nativo NEO inicializado correctamente.",
    );
  }
}
