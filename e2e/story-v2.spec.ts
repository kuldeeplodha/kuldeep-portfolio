import { test, expect } from '@playwright/test'

// V2-P3 (docs/design/portfolio-v2-design-spec.md §2.3-2.6): Engineering
// Signal, Selected Work + impact metrics, Experience timeline, and
// How I Engineer — all built from the real content model.
test.describe('Professional story (V2-P3)', () => {
  test('Engineering Signal shows the real value-proposition categories', async ({ page }) => {
    await page.goto('/')
    const signal = page.locator('#signal')
    await expect(signal.getByRole('heading', { name: 'What I Build' })).toBeVisible()
    await expect(signal.getByText('Backend Systems')).toBeVisible()
    await expect(signal.getByText('AI & Machine Learning')).toBeVisible()
  })

  test('How I Engineer shows the 5 numbered philosophy points', async ({ page }) => {
    await page.goto('/')
    const about = page.locator('#about')
    await expect(about.getByRole('heading', { name: 'How I approach engineering' })).toBeVisible()
    await expect(about.getByText('Understand the system')).toBeVisible()
    await expect(about.getByText('Measure the outcome')).toBeVisible()
    // Exactly 5 numbered points (01-05).
    await expect(about.getByText('05')).toBeVisible()
  })

  test('Selected Work shows honestly-categorized project cards and impact metrics', async ({
    page,
  }) => {
    await page.goto('/')
    const work = page.locator('#projects')
    // V2.1 P2: retitled "Selected Work" → "Selected Engineering Work" (spec §27).
    await expect(work.getByRole('heading', { name: 'Selected Engineering Work', level: 2 })).toBeVisible()
    await expect(work.getByText('Machine Learning · Deep Learning')).toBeVisible()

    await expect(work.getByRole('heading', { name: 'Engineering with measurable outcomes.' })).toBeVisible()
    await expect(work.getByText('60%+')).toBeVisible()
  })

  test('Experience timeline shows the real roles with progressive disclosure', async ({ page }) => {
    await page.goto('/')
    const experience = page.locator('#experience')
    await expect(experience.getByRole('heading', { name: 'Senior Software Developer (Lead)' })).toBeVisible()
    await expect(experience.getByText('Vidai Solutions')).toBeVisible()
    await expect(experience.getByText('Current', { exact: true })).toBeVisible()

    // Collapse the first (auto-expanded) entry, then expand Shelter Associates to reveal its impact metrics.
    await experience.getByRole('button', { name: /Collapse Vidai Solutions/ }).click()
    await experience.getByRole('button', { name: /Expand Shelter Associates/ }).click()
    await expect(experience.getByText('Reduction in manual data entry')).toBeVisible()
  })
})
