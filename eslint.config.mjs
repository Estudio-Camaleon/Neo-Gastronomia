import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

// Custom rule: forbid .gif references in code
const noGifRule = {
  meta: {
    type: "problem",
    docs: { description: "Forbid .gif file references" },
    messages: { noGif: "GIF files are not allowed. Use PNG, WebP, or AVIF instead." },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === "string" && /\.gif/i.test(node.value)) {
          context.report({ node, messageId: "noGif" });
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          if (/\.gif/i.test(quasi.value.raw)) {
            context.report({ node: quasi, messageId: "noGif" });
          }
        }
      },
    };
  },
};

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": ts,
      custom: { rules: { "no-gif": noGifRule } },
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      // Registro centralizado de scopes de ejecución en NEO v3.0
      globals: {
        // Entorno Navegador / Web APIs globales
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        Audio: "readonly",
        FormData: "readonly", // <-- FIX DE RAÍZ: Inyectado para Server Actions y Formularios
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

        // Entorno Node.js (Server Side Runtime)
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        module: "readonly",
        __dirname: "readonly",

        // React Global Scope
        React: "readonly",
      },
    },
    rules: {
      "custom/no-gif": "error",
      "@typescript-eslint/no-explicit-any": "error",

      // Control estricto de código muerto con soporte para escapes funcionales
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          args: "none",
        },
      ],

      // Senior Tip: Se apaga para TS porque 'tsc' lo valida de forma nativa y libre de bugs.
      "no-undef": "off",
      "no-useless-escape": "off",
    },
  },
  {
    // Aislamiento de directorios de compilación y empaquetado
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
];
