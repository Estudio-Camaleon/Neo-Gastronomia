// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapeo dinámico al branding del cliente
        custom: "var(--color-custom)",

        // Sincronización con globals.css (Paleta Verde NEO)
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          light: "var(--color-primary-light)",
          soft: "var(--color-primary-soft)",
        },
        bg: {
          main: "var(--color-bg-main)",
          alt: "var(--color-bg-alt)",
          dark: "var(--color-bg-dark)",
          darker: "var(--color-bg-darker)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          dark: "var(--color-surface-dark)",
          muted: "var(--color-surface-muted)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          dark: "var(--color-border-dark)",
          strong: "var(--color-border-strong)",
        },
      },
      borderRadius: {
        neo: "var(--radius-neo)",
        super: "var(--radius-super)",
      },
    },
  },
  plugins: [],
};

export default config;
