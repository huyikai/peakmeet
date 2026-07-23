import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-cjs/**',
      '**/.astro/**',
      'coverage/**',
      'packages/miniprogram/utils/shared/**',
      'packages/miniprogram/**/*.js',
      'packages/cloudfunctions/hello/**/*.js',
      'specs/**',
      '.specify/**',
      '.cursor/**',
      '*.png',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['packages/miniprogram/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        wx: 'readonly',
        App: 'readonly',
        Page: 'readonly',
        Component: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
        console: 'readonly',
      },
    },
  },
  eslintConfigPrettier,
);
