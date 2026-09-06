import { test, expect } from '@playwright/test'

// V2-P2 (docs/design/portfolio-v2-design-spec.md §2.2): hero restructure with
// real per-role-mode content, and the role switcher demoted below the hero.
//
// V2.1 P1 (docs/design/portfolio-v2.1-audit.md — software-primary
// repositioning): the hero's <h1> is now the persistent, role-independent
// identity (name), with the fully-attested "Senior Software Developer /
// Backend Engineer / Technical Lead" title as a fixed subheading. The
// per-role eyebrow/headline/CTAs are unchanged data-wise (still driven by
// role.hero.*) but render as secondary content below that fixed identity,
// so these assertions check that content by text rather than via `h1`.
test.describe('Hero (V2-P2 / V2.1 P1)', () => {
  test('shows the persistent software-primary identity regardless of role', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Kuldeep Lodha')
    await expect(
      page.getByText('Senior Software Developer · Backend Engineer · Technical Lead'),
    ).toBeVisible()
  })

  test('shows real per-role hero content and swaps on role change', async ({ page }) => {
    await page.goto('/')

    // Default (system/fullJourney) role.
    await expect(page.getByText('SOFTWARE → DATA → ML → AI')).toBeVisible()
    await expect(page.getByText("journey into intelligent systems")).toBeVisible()
    await expect(page.getByRole('link', { name: 'Explore My Journey', exact: true })).toBeVisible()

    // Switch to AI/ML role — eyebrow, headline, and CTAs all swap.
    await page.getByRole('tab', { name: 'AI / ML' }).click()
    await expect(page.getByText('MACHINE LEARNING • AI • NLP')).toBeVisible()
    await expect(page.getByText(/intelligent systems from data/i)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Explore AI Work', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View Research', exact: true })).toHaveAttribute('href', '#research')

    // The persistent identity from the top of the hero never changes.
    await expect(page.locator('h1')).toContainText('Kuldeep Lodha')
  })

  test('shows focus keyword chips for the active role', async ({ page }) => {
    await page.goto('/')
    const focusList = page.getByRole('list', { name: /focus areas/i })
    await expect(focusList).toBeVisible()
    await expect(focusList.getByText('Backend Systems')).toBeVisible()
  })

  test('role switcher is demoted below the hero message, not the primary identity toggle', async ({
    page,
  }) => {
    await page.goto('/')

    const label = page.getByText('Explore another perspective')
    await expect(label).toBeVisible()

    // The switcher tabs still work from their demoted position.
    const heroHeading = page.locator('#hero-heading')
    const switcherBox = await page.getByRole('tablist', { name: 'Professional perspective' }).boundingBox()
    const headingBox = await heroHeading.boundingBox()
    expect(switcherBox?.y).toBeGreaterThan((headingBox?.y ?? 0) + (headingBox?.height ?? 0))
  })

  test('career journey shows the real evolution steps', async ({ page }) => {
    await page.goto('/')
    const journey = page.getByRole('group', { name: /career evolution/i })
    await expect(journey).toBeVisible()
    await expect(journey.getByText('Starting with Software')).toBeVisible()
    await expect(journey.getByText('Engineering Leadership')).toBeVisible()
  })
})
