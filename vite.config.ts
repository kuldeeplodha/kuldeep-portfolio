/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Set VITE_BASE_PATH to your GitHub Pages repo name, e.g. /kuldeep-portfolio/
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Denominator = all app source, minus the e2e-only view shells and
      // non-logic boot/type files. HomePage/AdminPage are exercised by
      // Playwright, not this unit floor (per ADR-005 Amendment-1 + Kelly's
      // research); excluding them keeps the floor reflective of
      // unit-testable code.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**', // the test suites themselves
        'src/main.tsx', // React bootstrap
        'src/types/**', // type-only declarations
        'src/**/*.d.ts',
        'src/pages/HomePage.tsx', // e2e-only composed view shell (0% unit)
        'src/pages/AdminPage.tsx', // e2e-only admin view shell
      ],
      // Phase A floors of record — ADR-005 Amendment-1, confirmed by god
      // (statements/lines 58, functions 45, branches 50). Floors are
      // up-only: Phase B ratchets them higher after targeted suites, never
      // down without an ADR note. The per-file validationRegistry branch
      // floor (PRD-V1.4 AC-1.3) is already satisfied (>=90%) by the suites
      // expanded in this card and is locked in here.
      thresholds: {
        statements: 58,
        lines: 58,
        functions: 45,
        branches: 50,
        'src/lib/config/validationRegistry.ts': {
          branches: 90,
        },
      },
    },
  },
})
