import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  // Configuration for packages (with TypeScript project references)
  {
    files: ["packages/**/*.{js,ts}"],
    // @ts-expect-error: `extends` expects an array, but `tseslint.configs.recommended` is a single object
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        project: ["./packages/*/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/explicit-function-return-type": "error", // Packages should have explicit return types
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Configuration for root level files (no TypeScript project needed)
  {
    files: ["*.{js,mjs,cjs,ts,mts}"],
    // @ts-expect-error: `extends` expects an array, but `tseslint.configs.recommended` is a single object
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
      // No parserOptions.project for root files to avoid the error
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-var": "error",
      // Disable rules that require type information for root files
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },

  // JSON files
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },

  // Markdown files
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },

  // Prettier integration (must be last)
  eslintConfigPrettier,

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/*.d.ts",
      "apps/**", // Apps handle their own linting
      "*.json",
      "*.yaml",
      "*.yml",
      ".pnpm*",
      ".husky/*",
      ".gitignore",
      ".prettier*",
      "ai-agent/**",
    ],
  },
]);
