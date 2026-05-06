import type { Config } from "tailwindcss";

const config: Config = {
  // Soporte para modo oscuro mediante una clase en el body/html
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CORREGIDO: Mapeo plano directo apuntando a la variable CSS exacta del Layout público
        // Incluye un fallback naranja (#ff8000) por si el operador no definió color aún
        custom: "var(--custom-brand-color, #ff8000)",

        // Definimos los colores que usamos en LoginForm y RegisterForm
        primary: {
          DEFAULT: "#ff8000", // Tu naranja principal original
          hover: "#e67300",
        },
        bg: {
          darker: "#0a0a0a", // Fondo oscuro para dark mode
        },
        text: {
          primary: "#1a1a1a",
          secondary: "#4a4a4a",
          muted: "#888888",
        },
        border: {
          DEFAULT: "#e5e7eb",
          dark: "#262626",
        },
        error: {
          DEFAULT: "#ef4444",
        },
      },
      borderRadius: {
        // Aquí "oficializamos" los bordes redondeados de NEO
        neo: "2rem",
        super: "2.5rem",
      },
      animation: {
        // Animaciones que usamos en los mensajes de éxito/error
        in: "fadeIn 0.5s ease-out",
        zoom: "zoomIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
