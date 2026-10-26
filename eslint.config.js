import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "public/vendor/", "public/alpine/", "node_modules/", "test-results/", "playwright-report/", "content/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.worker, __IMAGE_ID__: "readonly" },
    },
    rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] },
  },
  { files: ["scripts/**", "vite.config.js", "eslint.config.js", "playwright.config.js", "tests/**"], languageOptions: { globals: { ...globals.node } } },
  { files: ["public/sw.js"], languageOptions: { sourceType: "script", globals: { ...globals.serviceworker } } },
];
