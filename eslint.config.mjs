import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": ts,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      // Le decimos al linter qué variables globales existen
      globals: {
        // Entorno Navegador
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        Audio: "readonly",
        HTMLInputElement: "readonly",
        HTMLFormElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLElement: "readonly",
        Node: "readonly",
        MouseEvent: "readonly",
        URL: "readonly",
        crypto: "readonly",
        confirm: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        // Entorno Node.js (Server Side)
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        module: "readonly",
        __dirname: "readonly",
        // React
        React: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // Cambiamos esto: ahora es error si no se usa, a menos que empiece con _
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          args: "none",
        },
      ],
      "no-undef": "error",
      "no-useless-escape": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
];
