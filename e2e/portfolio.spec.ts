import { test, expect } from '@playwright/test'

test.describe('Portfolio', () => {
  test('homepage loads with hero and role switcher', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Software Engineer' })).toBeVisible()
  })

  test('role switching updates URL without reload', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'AI / ML' }).click()
    await expect(page).toHaveURL(/role=ai/)
    // V2.1 P1: the hero's <h1> is now the persistent identity (name), not
    // the per-role headline — see e2e/hero-v2.spec.ts for the full
    // software-primary-identity + per-role-content coverage.
    await expect(page.getByText(/intelligent systems/i)).toBeVisible()
  })

  test('navigation anchors work', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      await page.getByRole('button', { name: 'Toggle menu' }).click()
    }
    // V2-P1 nav restructure: "Projects" is labeled "Work" now (same #projects anchor).
    await page.getByRole('link', { name: 'Work', exact: true }).click()
    await expect(page.locator('#projects')).toBeInViewport()
  })

  test('project case study page loads', async ({ page }) => {
    await page.route('**/api/case-studies/gesture-recognition', async (route) => route.fulfill({
        json: { id: '1', slug: 'gesture-recognition', title: 'Gesture Recognition', category: 'ML', context: 'ctx', architecture: 'arch', outcome: 'out', technologies: ['Tech'], media_urls: [], relevant_roles: [] }
    }))
    await page.goto('/projects/gesture-recognition')
    await expect(page.locator('h1')).toContainText('Gesture Recognition')
    await expect(page.getByRole('heading', { name: 'Architecture' })).toBeVisible()
  })

  test('Ask Kuldeep returns grounded answer', async ({ page }) => {
    await page.goto('/#ask')
    // V2-P4: suggested questions are now the real content.askKuldeep.suggestedQuestions.
    await page.getByRole('button', { name: /What did you research during your MS/i }).click()
    await expect(page.getByRole('status')).toContainText(/NLP/i)
  })

  test('admin panel requires login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Connect to the content backend' })).toBeVisible()
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'fake-jwt', expiresIn: 86400 }) }),
    )
    await page.getByLabel('Admin password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('h1')).toContainText('Configuration Panel')
  })

  // CMS-UNIFY-CONFIG-EDITOR: the legacy localStorage Configuration Panel
  // (per-tab Add/Move/Duplicate/Delete entity controls, tested here
  // previously) is retired -- every section is now edited through the
  // single DB-backed Site Content editor. Replaced with a test of the
  // actual acceptance criteria: editing a section and saving a draft is a
  // real network PUT (the whole point of this retirement -- the old
  // "Save Draft" silently wrote to localStorage only, PR #78).
  test('Site Content editor Save Draft is a real network PUT, not a localStorage no-op', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'fake-jwt', expiresIn: 86400 }) }),
    )
    await page.route('**/api/admin/content/contact', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ section_key: 'contact', data: { title: 'Original title' }, status: 'published', published_at: 'now', updated_at: 'now' }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ section_key: 'contact', data: JSON.parse(route.request().postData() ?? '{}').data, status: 'draft', published_at: null, updated_at: 'now' }),
      })
    })

    await page.goto('/admin')
    await page.getByLabel('Admin password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('h1')).toContainText('Configuration Panel')

    // Site Content is already the default landing tab, but it sits behind
    // its OWN inner CmsAuthGate (the outer gate above only unlocks the page
    // shell) -- the unmocked /api/auth/verify call fails, so it re-shows
    // its sign-in form; same pattern as v22-p2-admin-cms.spec.ts's tests.
    await page.getByLabel('Admin password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // 'Contact' is a key inside SiteContentAdminPanel's own sidebar.
    await page.locator('nav[aria-label="Site content sections"]').getByRole('button', { name: 'Contact' }).click()

    const titleInput = page.getByRole('textbox').first()
    await titleInput.fill('Updated title')

    const putRequest = page.waitForRequest(
      (req) => req.url().includes('/api/admin/content/contact') && req.method() === 'PUT',
    )
    await page.getByRole('button', { name: 'Save draft' }).click()
    const req = await putRequest
    expect(JSON.parse(req.postData() ?? '{}').status).toBe('draft')
    await expect(page.getByText('Saved.')).toBeVisible()
  })

  test('unknown route renders not-found fallback', async ({ page }) => {
    await page.goto('/some-unknown-path')
    await expect(page.locator('h1')).toContainText(/page not found/i)
    const home = page.getByRole('link', { name: /back to home/i })
    await expect(home).toBeVisible()
    await home.click()
    await expect(page).toHaveURL(/\/$/)
  })
})
