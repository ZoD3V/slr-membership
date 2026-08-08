import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Scoped deliberately: this repo verifies with type-check/lint/build plus
// Playwright E2E. Vitest exists only for the pure stage-derivation maths in
// src/lib/prizes.ts, which encodes PRD rules that are easy to get subtly wrong.
export default defineConfig({
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') }
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts']
    }
});
