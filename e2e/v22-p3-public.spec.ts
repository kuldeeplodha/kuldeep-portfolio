import { test, expect, type Page, type Route } from '@playwright/test'

// V2.2 P3: the public reading experience backed by the CMS API — homepage
// 3+3 strips, /blog & /case-studies archives, detail pages, and role/theme
// inheritance across navigation (PRD §6-7). No live backend runs in CI, so
// every /api/** call is mocked via page.route, same convention as
// e2e/v22-p2-admin-cms.spec.ts.

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

const BLOG_A = {
  id: 'b1',
  slug: 'first-post',
  title: 'First Post',
  excerpt: 'The first excerpt.',
  body: 'Body one',
  status: 'published',
  published_at: '2026-09-05T00:00:00Z',
  created_at: '2026-09-05T00:00:00Z',
  updated_at: '2026-09-05T00:00:00Z',
  tags: ['ml'],
  relevant_roles: [],
  reading_time_minutes: 2,
  featured_media_url: null,
  media_urls: [],
}

const CASE_STUDY_A = {
  id: 'c1',
  slug: 'gesture-pipeline',
  title: 'Gesture Recognition Pipeline',
  subtitle: 'Real-time inference at the edge',
  summary: 'A summary of the case study.',
  client_or_org: 'Coursework',
  period: '2025',
  category: 'AI/ML',
  status: 'published',
  featured: 1,
  published_at: '2026-09-04T00:00:00Z',
  created_at: '2026-09-04T00:00:00Z',
  updated_at: '2026-09-04T00:00:00Z',
  technologies: ['Python', 'OpenCV'],
  relevant_roles: [],
  problem: 'Problem text.',
  context: 'Context text.',
  architecture: 'Architecture text.',
  outcome: 'Outcome text.',
  future_improvements: null,
  github_url: null,
  live_url: null,
  featured_media_url: null,
  media_urls: [],
}

async function mockContent(page: Page, { blogs = [BLOG_A], caseStudies = [CASE_STUDY_A] } = {}) {
  await page.route('**/api/blogs', (route) => json(route, blogs))
  await page.route(`**/api/blogs/${BLOG_A.slug}`, (route) => json(route, BLOG_A))
  await page.route('**/api/case-studies', (route) => json(route, caseStudies))
  await page.route(`**/api/case-studies/${CASE_STUDY_A.slug}`, (route) => json(route, CASE_STUDY_A))
}

test.describe('V2.2 P3 public reading experience (mocked backend)', () => {
  test('homepage shows latest 3 blogs and case studies with View all links', async ({ page }) => {
    await mockContent(page)
    await page.goto('/')

    await expect(page.locator('#case-studies').getByRole('heading', { name: 'Selected Case Studies' })).toBeVisible()
    await expect(page.locator('#case-studies').getByText('Gesture Recognition Pipeline')).toBeVisible()
    await expect(page.locator('#case-studies').getByRole('link', { name: 'View All Case Studies →' })).toHaveAttribute(
      'href',
      '/case-studies',
    )

    await expect(page.locator('#articles').getByRole('heading', { name: 'Latest Engineering Articles' })).toBeVisible()
    await expect(page.locator('#articles').getByText('First Post')).toBeVisible()
    await expect(page.locator('#articles').getByRole('link', { name: 'View All Articles →' })).toHaveAttribute(
      'href',
      '/blog',
    )
  })

  test('homepage strips hide gracefully when the backend has nothing published', async ({ page }) => {
    await mockContent(page, { blogs: [], caseStudies: [] })
    await page.goto('/')
    await expect(page.locator('#case-studies')).toHaveCount(0)
    await expect(page.locator('#articles')).toHaveCount(0)
  })

  test('case studies archive lists published items and links to detail', async ({ page }) => {
    await mockContent(page)
    await page.goto('/case-studies')
    await expect(page.getByRole('heading', { name: 'Case Studies', level: 1 })).toBeVisible()
    await page.getByRole('link', { name: 'Gesture Recognition Pipeline' }).click()
    await expect(page.getByRole('heading', { name: 'Gesture Recognition Pipeline', level: 1 })).toBeVisible()
    await expect(page.getByText('Problem text.')).toBeVisible()
    await expect(page.getByText('Python')).toBeVisible()
  })

  test('a draft (404 from the public endpoint) renders not-found, not a crash', async ({ page }) => {
    await page.route('**/api/case-studies/draft-only', (route) => json(route, { detail: 'Not Found' }, 404))
    await page.goto('/case-studies/draft-only')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test('role query is preserved when navigating from homepage into the blog archive and back', async ({ page }) => {
    await mockContent(page)
    await page.goto('/?role=ai')

    await page.locator('#articles').getByRole('link', { name: 'View All Articles →' }).click()
    await expect(page).toHaveURL(/\/blog\?role=ai$/)

    await page.getByRole('link', { name: 'First Post' }).first().click()
    await expect(page).toHaveURL(/\/blog\/first-post\?role=ai$/)

    // Theme tokens follow the role, even on this new route.
    const dataRole = await page.evaluate(() => document.documentElement.getAttribute('data-role'))
    expect(dataRole).toBe('ai')
  })

  test('blog archive search filters by title/excerpt', async ({ page }) => {
    const second = { ...BLOG_A, id: 'b2', slug: 'second-post', title: 'Second Post', excerpt: 'Different topic entirely.' }
    await mockContent(page, { blogs: [BLOG_A, second] })
    await page.goto('/blog')
    await expect(page.getByText('First Post')).toBeVisible()
    await expect(page.getByText('Second Post')).toBeVisible()

    await page.getByLabel('Search articles').fill('Different topic')
    await expect(page.getByText('Second Post')).toBeVisible()
    await expect(page.getByText('First Post')).toHaveCount(0)
  })
})
