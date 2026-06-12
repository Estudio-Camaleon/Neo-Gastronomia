import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@ui": path.resolve(__dirname, "./src/components/ui"),
      "@auth": path.resolve(__dirname, "./src/features/auth"),
      "@marketing": path.resolve(__dirname, "./src/features/marketing"),
      "@admin": path.resolve(__dirname, "./src/features/admin"),
      "@public-menu": path.resolve(__dirname, "./src/features/public-menu"),
    },
  },
});
