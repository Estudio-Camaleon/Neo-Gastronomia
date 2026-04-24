import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--theme-primary)",
        surface: "var(--theme-surface)",
        background: "var(--theme-background)",
        border: "var(--theme-border)",
        text: "var(--theme-text)",
        "text-muted": "var(--theme-text-muted)",
      },
    },
  },
  plugins: [],
};

export default config;