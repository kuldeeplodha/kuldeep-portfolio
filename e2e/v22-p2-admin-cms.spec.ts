import { test, expect, type Page, type Route } from '@playwright/test'

// V2.2 P2: the Blog Posts / Case Studies admin tabs against Alex's FastAPI/
// Turso backend (backend/, P1). No live backend runs in CI (no accounts, no
// deploy yet — see the P2 dispatch), so every /api/** and Cloudinary call is
// mocked via page.route. This tests the UI's request plumbing and states,
// not the real backend — that's backend/tests/ (pytest) and, once merged,
// a manual local-backend smoke test.

const CMS_PASSWORD = 'admin-password-for-cms'

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

async function loginToAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByLabel('Password').fill('test-admin-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('h1')).toContainText('Configuration Panel')
}

async function openTab(page: Page, name: string | RegExp, isMobile: boolean | undefined) {
  const nav = isMobile
    ? page.locator('div[aria-label="Mobile sections"]')
    : page.locator('nav[aria-label="Admin sections"]')
  await nav.getByRole('button', { name }).click()
}

test.describe('V2.2 P2 admin CMS (mocked backend)', () => {
  test('Blog Posts tab shows the backend-connect gate before any CMS data loads', async ({
    page,
    isMobile,
  }) => {
    await loginToAdmin(page)
    await openTab(page, /Blog Posts/i, isMobile)
    await expect(page.getByRole('heading', { name: 'Connect to the content backend' })).toBeVisible()
    await expect(page.getByLabel('Admin password')).toBeVisible()
  })

  test('creating and publishing a blog post', async ({ page, isMobile }) => {
    let created: Record<string, unknown> | null = null

    await page.route('**/api/auth/login', (route) => json(route, { token: 'fake-jwt', expiresIn: 86400 }))
    await page.route('**/api/admin/blogs', (route) => {
      if (route.request().method() === 'POST') {
        created = JSON.parse(route.request().postData() ?? '{}')
        return json(route, created)
      }
      return json(route, created ? [created] : [])
    })

    await loginToAdmin(page)
    await openTab(page, /Blog Posts/i, isMobile)

    await page.getByLabel('Admin password').fill(CMS_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: 'Blog Posts' })).toBeVisible()
    await page.getByRole('button', { name: '+ New Blog Post' }).click()

    await page.getByLabel('Title', { exact: true }).fill('Shipping the V2.2 CMS')
    await expect(page.getByLabel('Slug')).toHaveValue('shipping-the-v2-2-cms')
    await page.getByLabel('Excerpt').fill('How the admin authoring flow came together.')
    await page.getByLabel('Body (Markdown)').fill('# Heading\n\nSome **markdown** body content.')

    await page.getByRole('button', { name: 'Publish' }).click()

    // Back on the list, the new post shows with a published badge.
    await expect(page.getByText('Shipping the V2.2 CMS')).toBeVisible()
    await expect(page.getByText('published', { exact: true })).toBeVisible()
    expect(created).not.toBeNull()
    expect((created as Record<string, unknown>).status).toBe('published')
  })

  test('a request failure surfaces as an inline error, not a crash', async ({ page, isMobile }) => {
    await page.route('**/api/auth/login', (route) => json(route, { token: 'fake-jwt', expiresIn: 86400 }))
    await page.route('**/api/admin/blogs', (route) => json(route, { detail: 'Database unavailable' }, 500))

    await loginToAdmin(page)
    await openTab(page, /Blog Posts/i, isMobile)
    await page.getByLabel('Admin password').fill(CMS_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toContainText('Database unavailable')
  })

  test('media upload signs via the backend then embeds the returned URL', async ({ page, isMobile }) => {
    await page.route('**/api/auth/login', (route) => json(route, { token: 'fake-jwt', expiresIn: 86400 }))
    await page.route('**/api/admin/blogs', (route) => json(route, []))
    await page.route('**/api/admin/media/sign', (route) =>
      json(route, { signature: 'sig', timestamp: 123, apiKey: 'key', cloudName: 'demo' }),
    )
    await page.route('https://api.cloudinary.com/**', (route) =>
      json(route, { secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg' }),
    )

    await loginToAdmin(page)
    await openTab(page, /Blog Posts/i, isMobile)
    await page.getByLabel('Admin password').fill(CMS_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByRole('button', { name: '+ New Blog Post' }).click()

    await page.getByLabel('Featured image').setInputFiles({
      name: 'cover.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-png-bytes'),
    })

    await expect(page.getByText('https://res.cloudinary.com/demo/image/upload/v1/test.jpg')).toBeVisible()
  })

  test('Case Studies tab creates a draft with structured sections', async ({ page, isMobile }) => {
    let created: Record<string, unknown> | null = null
    await page.route('**/api/auth/login', (route) => json(route, { token: 'fake-jwt', expiresIn: 86400 }))
    await page.route('**/api/admin/case-studies', (route) => {
      if (route.request().method() === 'POST') {
        created = JSON.parse(route.request().postData() ?? '{}')
        return json(route, created)
      }
      return json(route, created ? [created] : [])
    })

    await loginToAdmin(page)
    await openTab(page, /Case Studies/i, isMobile)
    await page.getByLabel('Admin password').fill(CMS_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.getByRole('button', { name: '+ New Case Study' }).click()
    await page.getByLabel('Title', { exact: true }).fill('Real-time Gesture Recognition Pipeline')
    await page.getByLabel('Problem').fill('Latency-sensitive gesture classification at the edge.')
    await page.getByLabel('Context').fill('Built for a robotics coursework demo.')
    await page.getByLabel('Architecture').fill('Camera -> preprocessing -> CNN -> action mapping.')
    await page.getByLabel('Outcome').fill('Sub-100ms inference on-device.')

    await page.getByRole('button', { name: 'Save draft' }).click()

    await expect(page.getByText('Real-time Gesture Recognition Pipeline')).toBeVisible()
    expect(created).not.toBeNull()
    expect((created as Record<string, unknown>).status).toBe('draft')
  })
})
