import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1) Core JS recommended rules
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },

  // 2) Browser & Node globals
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 3) React + Next.js flat config
  {
    ...pluginReact.configs.flat.recommended,
    // You could add "extends" here if you had more shareable configs
  },

  // 4) Override just the react-in-jsx-scope rule
  {
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
]);
