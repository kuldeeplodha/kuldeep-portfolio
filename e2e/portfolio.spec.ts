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

  // CMS-RESTORE-FRIENDLY-PANEL: the legacy per-section multi-tab
  // Configuration Panel (Add/Move/Duplicate/Delete entity controls) is
  // restored as the default /admin experience, but now saves straight to
  // the DB instead of localStorage (the root cause of the old
  // Save-Draft-does-nothing bug, PR #78). This test covers the real
  // acceptance criteria: editing the Profile form and clicking Save
  // Draft issues a genuine network PUT for the changed key -- AND (god's
  // steer, conv-cms-restore) that it does NOT blanket-write every
  // friendly-panel key: the other 9 untouched sections must never
  // receive a PUT, or a currently-published one among them would be
  // silently flipped back to draft and pulled off the live site.
  test('Configuration Panel Save Draft writes only the changed section, never blanket-writing published sections', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'fake-jwt', expiresIn: 86400 }) }),
    )
    const putRequests: { key: string; status: string }[] = []
    // Friendly-panel keys: GET returns 404 (nothing published yet, falls
    // back to bundled defaults, same as every other untouched key) for
    // every key except profile, which this test edits.
    await page.route('**/api/admin/content/**', (route) => {
      const url = route.request().url()
      if (route.request().method() === 'GET') {
        if (url.endsWith('/profile')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              section_key: 'profile',
              data: {
                name: 'Kuldeep Lodha',
                title: 'Senior Software Developer',
                email: 'kuldeep@example.com',
                location: 'Remote',
                summary: 'Senior software developer building reliable, well-tested systems end to end.',
              },
              status: 'published',
              published_at: 'now',
              updated_at: 'now',
            }),
          })
        }
        return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Content not found' }) })
      }
      const key = url.split('/').pop() ?? ''
      const putBody = JSON.parse(route.request().postData() ?? '{}')
      putRequests.push({ key, status: putBody.status })
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ section_key: key, data: putBody.data, status: putBody.status, published_at: null, updated_at: 'now' }),
      })
    })

    await page.goto('/admin')
    await page.getByLabel('Admin password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('h1')).toContainText('Configuration Panel')

    // Profile is the default landing tab and is NOT behind the CMS tabs'
    // inner CmsAuthGate (only blogPosts/caseStudies/siteContent are) --
    // the outer login above is enough to reach the friendly form directly.
    const nameInput = page.getByLabel('Full name')
    // Wait for the async DB-load merge to settle before editing, so the
    // fill below isn't racing (and losing to) the load's re-render.
    await expect(nameInput).toHaveValue('Kuldeep Lodha')
    await nameInput.fill('Kuldeep Lodha Updated')

    const putRequest = page.waitForRequest(
      (req) => req.url().includes('/api/admin/content/profile') && req.method() === 'PUT',
    )
    await page.getByRole('button', { name: 'Save Draft' }).click()
    const req = await putRequest
    const body = JSON.parse(req.postData() ?? '{}')
    expect(body.status).toBe('draft')

    await expect(page.getByText(/Draft saved/)).toBeVisible()
    // The whole point of the fix: only the edited key was written.
    expect(putRequests.map((r) => r.key)).toEqual(['profile'])
    expect(body.data.name).toBe('Kuldeep Lodha Updated')
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
