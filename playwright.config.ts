import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  // Baseline PNGs are stored here; subdirectories are named by project.
  snapshotDir: 'e2e/__screenshots__',
  projects: [
    // ── Functional e2e (existing) ───────────────────────────────────────────
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testMatch: /(?<!visual)\.spec\.ts$/ },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] }, testMatch: /(?<!visual)\.spec\.ts$/ },

    // ── Visual regression ──────────────────────────────────────────────────
    // Baselines are generated ONLY inside the official Playwright Docker image
    // (mcr.microsoft.com/playwright, pinned to the installed Playwright version).
    // Local mac runs are advisory/diff-only — NEVER commit locally generated baselines.
    // To regenerate: docker run … npm run test:e2e:update-visual (see README).
    {
      name: 'visual-desktop',
      testMatch: /visual\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        // Emulate prefers-reduced-motion: reduce → triggers MotionConfig
        // reducedMotion="user" (PR #10) to still all framer-motion animations.
        reducedMotion: 'reduce',
        // Pin environment for byte-stable baselines.
        deviceScaleFactor: 1,
        locale: 'en-US',
        timezoneId: 'UTC',
      },
    },
    {
      name: 'visual-mobile',
      testMatch: /visual\.spec\.ts$/,
      use: {
        ...devices['Pixel 5'],
        reducedMotion: 'reduce',
        locale: 'en-US',
        timezoneId: 'UTC',
        // Pixel 5 preset already sets deviceScaleFactor: 2.75; leave it as-is
        // so the mobile baseline matches the device's actual DPR.
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    env: {
      PATH: process.env.PATH || '',
      // Pin the preview build's base path so it always matches the
      // baseURL the e2e specs hit (localhost:4173/). Defaults to '/' for
      // local + CI e2e runs; a caller that sets VITE_BASE_PATH (e.g. to
      // /kuldeep-portfolio/) gets a matching build under that prefix. (T-QA-6)
      VITE_BASE_PATH: process.env.VITE_BASE_PATH || '/',
      // sha256('test-admin-password') — the e2e suite logs in with the
      // plaintext form; only the digest reaches the bundle.
      VITE_ADMIN_PASSWORD_HASH:
        'f7a03f48c0e2aa2d5e55ca186c20032ddbf53b7f5f93fce387d65c3f83433e8d',
    },
  },
})
