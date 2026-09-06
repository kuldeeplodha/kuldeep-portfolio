import { test, expect } from '@playwright/test'

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

  test('blog post shows styled content, reading time, and tags', async ({ page }) => {
    await page.goto('/blog/welcome-to-markdown-blog')
    // The post body itself contains a markdown h1, so scope to the page header's title.
    await expect(page.locator('header h1')).toContainText('Welcome to the new Markdown Blog')
    await expect(page.getByText('min read')).toBeVisible()
    await expect(page.locator('.blog-content h2').first()).toBeVisible()
    // Custom typography CSS is applied (not the dead prose/dark:prose-invert classes).
    const contentClass = await page.locator('.blog-content').getAttribute('class')
    expect(contentClass).not.toContain('prose')
  })

  test('related articles appear when posts share a tag, and link correctly', async ({ page }) => {
    // post-1 and post-2 both share the "vite" tag.
    await page.goto('/blog/welcome-to-markdown-blog')
    const related = page.getByRole('heading', { name: 'Related articles' })
    await expect(related).toBeVisible()
    const relatedLink = page.getByRole('link', { name: 'Understanding our Vite Configuration' })
    await expect(relatedLink).toBeVisible()
    await relatedLink.click()
    await expect(page).toHaveURL(/\/blog\/understanding-vite-config$/)
  })
})
