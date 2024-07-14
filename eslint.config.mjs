// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
).map((c) => {
  c.files = ["src/**/*.ts", "eslint.config.*js"];
  c.ignores = ["src/*.d.ts"];
  return c;
});

export default config;
