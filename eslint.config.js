import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "dev-dist", "node_modules", "test-results", "playwright-report", "scripts/out"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: { ...globals.browser, ...globals.node } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    // growth practices stay independent: a feature may use the shared contract, registry and feel check,
    // and anything outside src/growth, but never another feature's folder (docs/growth/PLAN.md)
    files: ["src/growth/*/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ regex: "^\\.\\./(?!feel/|types$|registry$|\\.\\./)", message: "Growth features don't import each other. Use ../feel, ../types, ../registry, or code outside src/growth." }]
      }]
    }
  }
);
