import { spawn } from "child_process";

/**
 * Script de arranque personalizado para NEO
 * Limpia el ruido de la terminal, presenta un banner profesional
 * y maneja el cierre seguro de procesos.
 */

console.clear();

const banner = `
\x1b[32m  _  _________ 
 / |/ / __/ __ \\
/    / _// /_/ /
/_/|_/___/\\____/  \x1b[0m \x1b[90mDEVELOPMENT ENGINE v1.0\x1b[0m
`;

console.log(banner);
console.log(
  "\x1b[36m%s\x1b[0m",
  "  → Sincronizando con Supabase y preparando Turbopack...",
);
console.log(
  "\x1b[90m%s\x1b[0m",
  "  -------------------------------------------------------",
);

const child = spawn("next", ["dev", "--turbo"], {
  stdio: "pipe",
  shell: true,
  env: process.env,
});

child.stdout?.on("data", (data: Buffer) => {
  const line = data.toString();

  if (line.includes("Local:")) {
    console.log(
      "\x1b[32m  ✔ Acceso Local:  \x1b[0m",
      "\x1b[4m" + line.split("Local:")[1].trim() + "\x1b[0m",
    );
  }

  if (line.includes("Ready in")) {
    const time = line.match(/Ready in \d+m?s/);
    console.log(
      "\x1b[32m  ✔ Motor listo   \x1b[0m",
      `\x1b[90m(${time ? time[0] : "OK"})\x1b[0m`,
    );
    console.log(
      "\x1b[90m  -------------------------------------------------------\x1b[0m",
    );
  }
});

child.stderr?.on("data", (data: Buffer) => {
  const message = data.toString();

  const isWorkspaceWarning = message.includes(
    "Warning: Next.js inferred your workspace root",
  );
  const isMiddlewareWarning = message.includes(
    'middleware" file convention is deprecated',
  );

  if (!isWorkspaceWarning && !isMiddlewareWarning) {
    process.stderr.write(message);
  }
});

// --- NUEVO: Manejo de cierre seguro ---

// Si el proceso de Next.js se cierra por su cuenta
child.on("close", (code) => {
  if (code !== 0 && code !== null) {
    console.log(
      `\n\x1b[31m  ✖ El motor se detuvo inesperadamente (Código: ${code})\x1b[0m`,
    );
  }
  process.exit(code ?? 0);
});

// Capturamos el Ctrl + C del usuario en la terminal
process.on("SIGINT", () => {
  console.log("\n\x1b[90m  Apagando motor de desarrollo...\x1b[0m");
  child.kill("SIGINT"); // Le pasamos la señal al proceso hijo
});

// Capturamos señales de terminación del sistema
process.on("SIGTERM", () => {
  child.kill("SIGTERM");
});
