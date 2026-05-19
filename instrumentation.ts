export async function register() {
  // Acceso seguro mediante firma de índice para cumplir con configuraciones estrictas de TS
  if (process.env["NEXT_RUNTIME"] === "nodejs") {
    // 1. Captura de Excepciones Fatales
    process.on("uncaughtException", (error) => {
      const timestamp = new Date().toLocaleTimeString("es-AR");
      console.error(`[🚨 NEO CRITICAL SERVIDOR - ${timestamp}]:`, error);

      // Aquí procesarás telemetría o alertas críticas en el futuro
    });

    // 2. Captura de Promesas Rechazadas No Manejadas
    process.on("unhandledRejection", (reason) => {
      const timestamp = new Date().toLocaleTimeString("es-AR");
      console.error(`[⚠️ NEO UNHANDLED REJECTION - ${timestamp}]:`, reason);
    });
  }
}
