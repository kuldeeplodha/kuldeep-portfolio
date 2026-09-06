import { test, expect, type Route } from '@playwright/test'

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

// V2-P5 (docs/design/portfolio-v2-design-spec.md §Background): Education +
// Certifications kept compact/secondary, and blog polish (typography,
// reading time, related articles).
test.describe('Secondary content & blog polish (V2-P5)', () => {
  test('Education shows the real degrees with the correct GPA on the MS entry', async ({
    page,
  }) => {
    await page.goto('/')
    const education = page.locator('#education')
    await expect(education.getByRole('heading', { name: 'Education' })).toBeVisible()
    await expect(education.getByText('MS in Machine Learning & Artificial Intelligence')).toBeVisible()
    // The GPA belongs to the MS, not the Executive PG (was misattributed before this PR).
    await expect(education.getByText('3.58 / 4.0')).toBeVisible()
    await expect(education.getByText('B.Tech in Computer Science')).toBeVisible()
  })

  test('Certifications shows exactly the 7 real certifications, compactly', async ({ page }) => {
    await page.goto('/')
    const certs = page.locator('#certifications')
    await expect(certs.getByRole('heading', { name: 'Certifications' })).toBeVisible()
    await expect(certs.getByText('Career Essentials in Software Development')).toBeVisible()
    await expect(certs.getByText('SQL Advanced')).toBeVisible()
    // Certifications not in the real content model must not appear.
    await expect(certs.getByText('Building React and Django Apps')).toHaveCount(0)
    await expect(certs.getByText('Docker Foundations')).toHaveCount(0)
    await expect(certs.locator('li')).toHaveCount(7)
  })

  // V2.2 P3: /blog/:slug now renders CmsBlogDetailPage (CMS-backed), not the
  // markdown-file BlogDetailPage these tests originally targeted — see
  // App.tsx's routing comment. Mocking the single-post endpoint in place of
  // the old markdown seed post. "Related articles" isn't part of this
  // dispatch's scope for the CMS blog (see CmsBlogDetailPage.tsx) — that
  // test is dropped rather than kept failing against a feature that
  // doesn't exist yet for this content source.
  test('blog post shows styled content, reading time, and tags', async ({ page }) => {
    await page.route('**/api/blogs/welcome-to-markdown-blog', (route) =>
      json(route, {
        id: 'p1',
        slug: 'welcome-to-markdown-blog',
        title: 'Welcome to the new Markdown Blog',
        excerpt: 'x',
        body: '## What\'s under the hood?\n\nSome content.',
        status: 'published',
        published_at: '2026-09-01T00:00:00Z',
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-09-01T00:00:00Z',
        tags: ['vite'],
        relevant_roles: [],
        reading_time_minutes: 4,
        featured_media_url: null,
        media_urls: [],
      }),
    )
    await page.goto('/blog/welcome-to-markdown-blog')
    await expect(page.locator('h1')).toContainText('Welcome to the new Markdown Blog')
    await expect(page.getByText('min read')).toBeVisible()
    await expect(page.locator('.blog-content h2').first()).toBeVisible()
    // Custom typography CSS is applied (not the dead prose/dark:prose-invert classes).
    const contentClass = await page.locator('.blog-content').getAttribute('class')
    expect(contentClass).not.toContain('prose')
  })
})
