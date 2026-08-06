import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json-summary'],
    },
    exclude: ['**/.expo/**', '**/android/**', '**/dist/**', '**/ios/**', '**/node_modules/**'],
    include: ['**/*.test.{ts,tsx}'],
    passWithNoTests: false,
    sequence: {
      concurrent: false,
    },
  },
});
