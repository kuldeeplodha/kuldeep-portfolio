import { test, expect } from '@playwright/test'

test.describe('V2.3 Case Studies', () => {
  test('homepage strip loads and links to archive', async ({ page }) => {
    // Intercept to avoid needing the real backend during basic e2e navigation
    await page.route('**/api/case-studies*', async (route) => {
      await route.fulfill({
        json: {
          items: [
            { id: '1', slug: 'case-1', title: 'Test Case 1', summary: 'Summary 1', period: '2026', category: 'Software', technologies: ['React'], relevant_roles: [] },
          ],
          page: 1, limit: 3, total: 1, total_pages: 1, has_more: false
        }
      })
    })

    await page.goto('/')
    const heading = page.locator('h2', { hasText: 'Selected Engineering Work' })
    await expect(heading).toBeVisible()

    await expect(page.locator('text=Test Case 1').first()).toBeVisible()
    await expect(page.locator('text=Summary 1').first()).toBeVisible()

    const archiveLink = page.locator('text=View all case studies')
    await expect(archiveLink).toBeVisible()
    await archiveLink.click()

    await expect(page).toHaveURL(/.*\/case-studies/)
  })

  test('case studies archive lists items and has pagination', async ({ page }) => {
    await page.route('**/api/case-studies*', async (route) => {
      const url = new URL(route.request().url())
      const pageNum = url.searchParams.get('page')
      
      if (pageNum === '2') {
        await route.fulfill({
          json: {
            items: [
              { id: '3', slug: 'case-3', title: 'Test Case 3', summary: 'Summary 3', period: '2026', category: 'AI', technologies: ['Python'], relevant_roles: [] },
            ],
            page: 2, limit: 10, total: 11, total_pages: 2, has_more: false
          }
        })
      } else {
        await route.fulfill({
          json: {
            items: [
              { id: '2', slug: 'case-2', title: 'Test Case 2', summary: 'Summary 2', period: '2026', category: 'AI', technologies: ['Python'], relevant_roles: [] },
            ],
            page: 1, limit: 10, total: 11, total_pages: 2, has_more: true
          }
        })
      }
    })

    await page.goto('/case-studies')
    await expect(page.locator('h1', { hasText: 'Case Studies' })).toBeVisible()
    await expect(page.locator('text=Test Case 2')).toBeVisible()

    // check pagination
    await expect(page.locator('text=Page 1 of 2')).toBeVisible()
    
    const nextBtn = page.getByRole('button', { name: /next page/i })
    await expect(nextBtn).not.toBeDisabled()
    await expect(page.getByRole('button', { name: /previous page/i })).toBeDisabled()
    
    await nextBtn.click()
    
    await expect(page.locator('text=Page 2 of 2')).toBeVisible()
    await expect(page.locator('text=Test Case 3')).toBeVisible()
    await expect(page.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  test('case study detail page renders full content', async ({ page }) => {
    await page.route('**/api/case-studies/test-slug', async (route) => {
      await route.fulfill({
        json: { 
          id: '3', slug: 'test-slug', title: 'Full Case Study', 
          summary: 'A long summary.', period: '2026', category: 'Data', 
          problem: 'Problem statement', context: 'Context statement', 
          architecture: 'Architecture details', outcome: 'Success', 
          technologies: ['SQL'], relevant_roles: [], media_urls: [] 
        }
      })
    })

    await page.goto('/projects/test-slug')
    
    await expect(page.locator('h1', { hasText: 'Full Case Study' })).toBeVisible()
    await expect(page.locator('text=Problem statement')).toBeVisible()
    await expect(page.locator('text=Architecture details')).toBeVisible()
    await expect(page.locator('text=SQL')).toBeVisible()
  })
})
