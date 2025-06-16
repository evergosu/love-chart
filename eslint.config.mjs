import prettier from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import css from "@eslint/css";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  globalIgnores(["node_modules/*", "dist/*"]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
  prettier,
]);
