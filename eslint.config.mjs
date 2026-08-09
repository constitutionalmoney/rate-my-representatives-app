import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/.expo/**',
      '**/android/**',
      '**/coverage/**',
      '**/dist/**',
      '**/ios/**',
      '**/node_modules/**',
      '**/src/generated/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='console'][callee.property.name='debug']",
          message: 'Do not commit console.debug calls; use the redacted observability package.',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['apps/web/public/sw.js'],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
);
