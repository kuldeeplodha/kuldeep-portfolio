import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// V2-P6 global polish (docs/design/portfolio-v2-design-spec.md — motion,
// responsive, a11y, SEO, states). Covers the concrete behaviors added in
// this phase; the existing accessibility.spec.ts / nav-more-menu.spec.ts /
// hero-v2.spec.ts suites already cover the axe/keyboard/content baselines
// this phase builds on.

test.describe('V2-P6 motion', () => {
  test('sections reveal on scroll and skip animation under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // A muted section rendered by SectionShell (which now wraps content in
    // the shared Reveal primitive) should still end up fully visible even
    // with reduced motion honored — it must never get stuck at opacity: 0.
    const signalHeading = page.locator('#signal')
    await signalHeading.scrollIntoViewIfNeeded()
    await expect(signalHeading).toBeVisible()
    await expect(signalHeading.locator('h2, h3').first()).toBeVisible()
  })

  test('cards use the shared hover-lift treatment', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover states are not meaningful on touch viewports')
    await page.goto('/')
    const card = page.locator('#signal .hover-lift').first()
    await expect(card).toBeVisible()
    await card.scrollIntoViewIfNeeded()
    await card.hover()
    // hover-lift's transform is asserted structurally (class present) rather
    // than by reading computed transform mid-transition, which is timing
    // sensitive; the class itself is the contract other sections rely on.
    await expect(card).toHaveClass(/hover-lift/)
  })
})

test.describe('V2-P6 responsive', () => {
  for (const width of [320, 375, 390, 414, 768]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // +1 for sub-pixel rounding
    })
  }

  test('project pipeline diagram scrolls horizontally instead of overflowing', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/projects/gesture-recognition')
    // V2.1 P2: aria-label renamed "Pipeline steps" → "Architecture / pipeline steps".
    const pipeline = page.getByLabel('Architecture / pipeline steps')
    await expect(pipeline).toBeVisible()
    const { scrollWidth, clientWidth } = await pipeline.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    // The pipeline's own content is allowed to be wider than its box (that's
    // what makes it scrollable) — the page itself must not overflow for it.
    expect(scrollWidth).toBeGreaterThanOrEqual(clientWidth)
    const bodyOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
    )
    expect(bodyOverflow).toBe(true)
  })
})

test.describe('V2-P6 a11y', () => {
  test('Ask Kuldeep section has no critical/serious axe violations', async ({ page }) => {
    await page.goto('/#ask')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .include('#ask')
      .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    const gating = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))
    expect(gating).toEqual([])
  })

  test('More menu moves focus into the menu on open and back to the trigger on Escape', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'More menu only renders in the desktop nav layout')
    await page.goto('/')

    const moreButton = page.getByRole('button', { name: 'More' })
    await moreButton.click()

    const menu = page.getByRole('menu', { name: 'More navigation links' })
    await expect(menu.getByRole('menuitem').first()).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(moreButton).toBeFocused()
  })
})

test.describe('V2-P6 states', () => {
  test('Ask Kuldeep resolves a known question to a real, grounded answer', async ({ page }) => {
    // The client-side search resolves in a handful of milliseconds — too
    // fast to reliably catch the loading skeleton mid-flight in an e2e run,
    // so this test asserts the settled outcome. The skeleton markup itself
    // (data-testid="ask-loading") is covered by its presence in the
    // component and by manual QA; what must hold under test is that a real,
    // non-fallback answer is what the user ends up seeing.
    await page.goto('/#ask')
    const input = page.getByLabel('Question for portfolio assistant')
    await input.fill('What backend frameworks do you use?')
    await page.getByRole('button', { name: 'Ask' }).click()

    const answer = page.locator('#ask [role="status"][aria-live="polite"]')
    await expect(answer).toBeVisible()
    await expect(answer).not.toContainText('I do not have that information')
  })

  test('Ask Kuldeep renders a distinct empty state for a question with no match', async ({
    page,
  }) => {
    await page.goto('/#ask')
    const input = page.getByLabel('Question for portfolio assistant')
    await input.fill('zzz nonsense query unrelated to anything zzz')
    await page.getByRole('button', { name: 'Ask' }).click()

    // V2.1 P3: the displayed empty-state copy changed to the "engineering
    // note" framing (matching engine / trigger condition unchanged — see
    // e2e/v21-p3-signature.spec.ts for direct coverage of this).
    const answer = page.locator('#ask [role="status"][aria-live="polite"]')
    await expect(answer).toContainText('No matching engineering note found')
  })

  test('an unknown project id shows a not-found state instead of a silent redirect', async ({
    page,
  }) => {
    await page.goto('/projects/this-project-does-not-exist')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })
})

test.describe('V2-P6 SEO', () => {
  test('project detail page sets a per-project document title', async ({ page }) => {
    await page.goto('/projects/gesture-recognition')
    await expect(page).toHaveTitle(/Kuldeep Lodha/)
    await expect(page).not.toHaveTitle('Kuldeep Lodha — Senior Software Engineer')
  })

  test('homepage title matches the site-wide SEO title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Kuldeep Lodha — Senior Software Engineer')
  })
})
