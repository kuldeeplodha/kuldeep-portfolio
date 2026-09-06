import { test, expect } from '@playwright/test'

// V2.1 P2 (docs/design/portfolio-v2.1-spec.md §19-40): experience timeline
// grouping, Selected Engineering Work case-study cards + one featured
// project, the project detail page's case-study section order, and the
// Engineering Stack / SkillsSection / MetricsSection consolidation.
test.describe('V2.1 P2 sections', () => {
  test('Experience groups real bullets under Engineering/Leadership/Systems headings', async ({
    page,
  }) => {
    await page.goto('/')
    const experience = page.locator('#experience')
    // Current role (Vidai) is expanded by default and shows all three groups.
    await expect(experience.getByRole('heading', { name: 'Engineering', level: 4 })).toBeVisible()
    await expect(experience.getByRole('heading', { name: 'Systems', level: 4 })).toBeVisible()
    await expect(experience.getByRole('heading', { name: 'Leadership', level: 4 })).toBeVisible()
    await expect(experience.getByText('EMR', { exact: true }).first()).toBeVisible()
  })

  test('Selected Engineering Work shows a featured project card and updated CTA copy', async ({
    page,
  }) => {
    await page.goto('/')
    const work = page.locator('#projects')
    await expect(
      work.getByRole('heading', { name: 'Selected Engineering Work', level: 2 }),
    ).toBeVisible()
    await expect(work.getByText('Featured')).toBeVisible()
    await expect(work.getByText('Explore case study').first()).toBeVisible()
  })

  test('project detail page follows the case-study section order with Architecture', async ({
    page,
  }) => {
    await page.goto('/projects/gesture-recognition')
    await page.waitForLoadState('networkidle')
    const headings = await page.locator('h2').allTextContents()
    // Order matters: Context/Architecture before Outcome, Technology last —
    // spec §31. "The Problem" isn't present for this project (no `problem`
    // field would be omitted; gesture-recognition does have one).
    expect(headings.indexOf('Architecture')).toBeGreaterThan(headings.indexOf('Context'))
    expect(headings.indexOf('Technology')).toBe(headings.length - 1)
  })

  test('Engineering Stack is the sole skills display — no percentage bars, attested tech only', async ({
    page,
  }) => {
    await page.goto('/')
    const stack = page.locator('#stack')
    await expect(stack.getByRole('heading', { name: 'Engineering Stack' })).toBeVisible()
    await expect(stack.getByText('%')).toHaveCount(0)
    // Kelly's content-check: these are spec-illustrative examples, not real —
    // must never appear.
    for (const notAttested of ['FastAPI', 'Redis', 'Twilio', 'Payment systems']) {
      await expect(page.getByText(notAttested, { exact: true })).toHaveCount(0)
    }
  })
})
