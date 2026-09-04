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
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
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
