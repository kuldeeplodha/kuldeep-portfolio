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
      // Floors of record — ADR-007 (2026-09-19) superseded ADR-005
      // Amendment-1's 58/58/45/50 after CMS-UNIFY-CONFIG-EDITOR (PR #80)
      // deleted validationRegistry.ts and its dedicated coverage-farming
      // tests (coverageExpansion.test.ts/validationRegistry.test.ts). That
      // was a deletion artifact, not a behavior regression — see ADR-007
      // for the measured before/after. Floors are up-only FROM THIS NEW
      // BASELINE: never lower again without another ADR note.
      thresholds: {
        statements: 50,
        lines: 50,
        functions: 43,
        branches: 38,
      },
    },
  },
})
