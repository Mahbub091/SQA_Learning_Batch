import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import playwright from 'eslint-plugin-playwright';

export default [
  // TypeScript source files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2020,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  // Playwright test files
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs.recommended.rules,
      'playwright/expect-expect': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
