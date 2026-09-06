/**
 * visual.spec.ts — WS-2 Visual Regression (T-QA-8)
 *
 * Baselines are generated ONLY inside the official Playwright Docker image.
 * CI is the sole source of truth for baseline PNGs (ADR-005 §Q1).
 *
 * Local runs: view-diff only — NEVER run `--update-snapshots` outside Docker.
 * Baseline generation: `npm run test:e2e:update-visual` (Docker-only, see README).
 *
 * Determinism strategy:
 *  - Role themes driven by `?role=` URL param; fresh page load mounts
 *    already in the target theme with NO 450ms role-transition animation.
 *  - `reducedMotion: 'reduce'` on both visual projects (playwright.config.ts)
 *    triggers MotionConfig `reducedMotion="user"` → stills all framer-motion.
 *  - `animations: 'disabled'` in toHaveScreenshot → kills CSS transitions + waits fonts.
 *  - `await page.evaluate(() => document.fonts.ready)` before each snapshot.
 *  - `maxDiffPixelRatio: 0.01` (ADR-005 AC-2.3).
 *  - `locale`, `timezoneId`, `deviceScaleFactor` pinned per project (see config).
 */

import { test, expect } from '@playwright/test'

/** Snapshot options applied to every screenshot. */
const SNAP_OPTS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.01,
}

/**
 * Wait for fonts to finish loading. Must be called before every snapshot to
 * avoid font-swap flicker (supplements `animations: 'disabled'` auto-wait).
 */
async function waitForFonts(page: import('@playwright/test').Page) {
  await page.evaluate(() => document.fonts.ready)
}

/**
 * Navigate to a URL and wait for the page to be fully settled:
 *  1. networkidle (assets loaded)
 *  2. fonts ready
 */
async function gotoAndSettle(page: import('@playwright/test').Page, url: string) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  await waitForFonts(page)
}

// ─── Homepage — role theme variants ──────────────────────────────────────────
// Cover ≥1 dark-family role (software, ai) and ≥1 light-family role (data),
// plus the default system role. Each direct URL load skips the role-transition
// animation, giving a clean, deterministic theme render.

test('homepage — system role (default)', async ({ page }) => {
  await gotoAndSettle(page, '/')
  await expect(page).toHaveScreenshot('homepage-system.png', SNAP_OPTS)
})

test('homepage — software role (dark)', async ({ page }) => {
  await gotoAndSettle(page, '/?role=software')
  await expect(page).toHaveScreenshot('homepage-software.png', SNAP_OPTS)
})

test('homepage — ai role (dark)', async ({ page }) => {
  await gotoAndSettle(page, '/?role=ai')
  await expect(page).toHaveScreenshot('homepage-ai.png', SNAP_OPTS)
})

test('homepage — data role (light)', async ({ page }) => {
  await gotoAndSettle(page, '/?role=data')
  await expect(page).toHaveScreenshot('homepage-data.png', SNAP_OPTS)
})

// ─── Project case-study page ──────────────────────────────────────────────────

test('project detail — software role (dark)', async ({ page }) => {
  await gotoAndSettle(page, '/projects/gesture-recognition?role=software')
  await expect(page).toHaveScreenshot('project-detail-software.png', SNAP_OPTS)
})

test('project detail — data role (light)', async ({ page }) => {
  await gotoAndSettle(page, '/projects/gesture-recognition?role=data')
  await expect(page).toHaveScreenshot('project-detail-data.png', SNAP_OPTS)
})

// ─── Admin login gate ─────────────────────────────────────────────────────────

test('admin login page', async ({ page }) => {
  await gotoAndSettle(page, '/admin')
  await expect(page).toHaveScreenshot('admin-login.png', SNAP_OPTS)
})

// ─── Admin configuration panel ────────────────────────────────────────────────

test('admin configuration panel', async ({ page }) => {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'fake-jwt', expiresIn: 86400 }) }),
  )
  await page.goto('/admin')
  await page.getByLabel('Admin password').fill('test-admin-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('h1')).toContainText('Configuration Panel')
  await page.waitForLoadState('networkidle')
  await waitForFonts(page)
  await expect(page).toHaveScreenshot('admin-config-panel.png', SNAP_OPTS)
})
