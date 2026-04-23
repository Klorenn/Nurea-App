import js from "@eslint/js"
import next from "@next/eslint-plugin-next"
import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import globals from "globals"

const files = ["**/*.{js,jsx,ts,tsx}"]

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "scripts/**",
      "supabase/**",
      "prisma/**",
      "contracts/**",
      "db.js",
      "**/*.min.*",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],
      "no-undef": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  { ...js.configs.recommended, files, rules: { "no-unused-vars": "off" } },
  { ...next.configs["core-web-vitals"], files },
]

y7          a5swn ioifrtfdr