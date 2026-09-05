import { test, expect, TestInfo } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { AxeResults, Result } from 'axe-core'
import * as fs from 'fs'
import * as path from 'path'

const A11Y_RESULTS_DIR = 'test-results/a11y'

/**
 * Violations at these impact levels immediately fail CI (hard gate).
 * moderate/minor are serialized to JSON and surface in the step summary as
 * report-only — they do NOT cause an assertion failure.
 */
const HARD_GATE_IMPACTS = new Set<string>(['critical', 'serious'])

/**
 * Serializes the full axe results (violations, passes, incomplete, inapplicable)
 * to test-results/a11y/<page>-<viewport>.json for CI artifact upload and
 * aggregated summary via $GITHUB_STEP_SUMMARY.
 *
 * `incomplete` items (rules axe could not auto-decide, e.g. color-contrast over
 * images) are recorded for manual review but are never gated.
 */
function saveA11yResults(results: AxeResults, pageSlug: string, testInfo: TestInfo): void {
  const viewportSlug = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const filename = `${pageSlug}-${viewportSlug}.json`
  const outputPath = path.join(A11Y_RESULTS_DIR, filename)
  fs.mkdirSync(A11Y_RESULTS_DIR, { recursive: true })
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        page: pageSlug,
        viewport: testInfo.project.name,
        url: results.url,
        timestamp: results.timestamp,
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        inapplicable: results.inapplicable,
      },
      null,
      2,
    ),
  )
}

/**
 * Returns violations that exceed the hard gate threshold (critical or serious).
 * moderate/minor violations are reported via JSON/summary but do NOT gate CI.
 */
function gatingViolations(violations: Result[]): Result[] {
  return violations.filter((v) => HARD_GATE_IMPACTS.has(v.impact ?? ''))
}

test.describe('Accessibility (A11y) Audit', () => {
  test('homepage should not have any automatically detectable accessibility issues', async ({
    page,
  }, testInfo) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    saveA11yResults(accessibilityScanResults, 'homepage', testInfo)

    // Hard gate: critical/serious violations fail CI. moderate/minor are report-only.
    expect(gatingViolations(accessibilityScanResults.violations)).toEqual([])
  })

  test('project detail page should not have any automatically detectable accessibility issues', async ({
    page,
  }, testInfo) => {
    await page.goto('/projects/gesture-recognition')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    saveA11yResults(accessibilityScanResults, 'project-detail', testInfo)

    expect(gatingViolations(accessibilityScanResults.violations)).toEqual([])
  })

  test('admin page login should not have any automatically detectable accessibility issues', async ({
    page,
  }, testInfo) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    saveA11yResults(accessibilityScanResults, 'admin-login', testInfo)

    expect(gatingViolations(accessibilityScanResults.violations)).toEqual([])
  })

  test('admin configuration panel should not have any automatically detectable accessibility issues', async ({
    page,
  }, testInfo) => {
    await page.goto('/admin')
    await page.getByLabel('Password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('h1')).toContainText('Configuration Panel')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    saveA11yResults(accessibilityScanResults, 'admin-config-panel', testInfo)

    expect(gatingViolations(accessibilityScanResults.violations)).toEqual([])
  })

  test('blog list page should not have any automatically detectable accessibility issues', async ({
    page,
  }, testInfo) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    saveA11yResults(accessibilityScanResults, 'blog-list', testInfo)

    expect(gatingViolations(accessibilityScanResults.violations)).toEqual([])
  })

  test('blog detail page should not have any automatically detectable accessibility issues', async ({
    page,
  }, testInfo) => {
    await page.goto('/blog/welcome-to-markdown-blog')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    saveA11yResults(accessibilityScanResults, 'blog-detail', testInfo)

    expect(gatingViolations(accessibilityScanResults.violations)).toEqual([])
  })
})
