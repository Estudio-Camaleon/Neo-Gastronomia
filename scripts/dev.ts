import { spawn } from "child_process";

/**
 * Script de arranque personalizado para NEO
 * Limpia el ruido de la terminal y presenta un banner profesional.
 */

// Limpiamos la consola al iniciar
console.clear();

// Banner de identidad de NEO / Estudio Camaleon
const banner = `
\x1b[32m   _  _________ 
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

// Iniciamos el proceso de Next.js
const child = spawn("next", ["dev", "--turbo"], {
  stdio: "pipe",
  shell: true,
  env: process.env,
});

// Manejo de la salida estándar (stdout)
child.stdout?.on("data", (data: Buffer) => {
  const line = data.toString();

  // Filtrar y mostrar solo la información relevante para el desarrollador
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

// Manejo de errores y advertencias (stderr)
child.stderr?.on("data", (data: Buffer) => {
  const message = data.toString();

  // Bloqueamos los warnings conocidos del Workspace Root para mantener la limpieza
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

child.on("close", (code) => {
  if (code !== 0) {
    console.log(
      `\n\x1b[32m  ✖ El proceso terminó con el código: ${code}\x1b[0m`,
    );
  }
});
