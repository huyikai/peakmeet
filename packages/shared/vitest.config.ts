import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/calc/**/*.ts', 'src/timer/**/*.ts'],
      exclude: [
        'src/calc/index.ts',
        'src/calc/types.ts',
        'src/timer/index.ts',
        'src/timer/types.ts',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
