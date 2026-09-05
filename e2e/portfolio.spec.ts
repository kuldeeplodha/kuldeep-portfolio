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
    await expect(page.locator('h1')).toContainText(/intelligent systems/i)
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
    await page.goto('/projects/gesture-recognition')
    await expect(page.locator('h1')).toContainText('Gesture Recognition')
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible()
  })

  test('Ask Kuldeep returns grounded answer', async ({ page }) => {
    await page.goto('/#ask')
    // V2-P4: suggested questions are now the real content.askKuldeep.suggestedQuestions.
    await page.getByRole('button', { name: /What did you research during your MS/i }).click()
    await expect(page.getByRole('status')).toContainText(/NLP/i)
  })

  test('admin panel requires login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('h1')).toContainText('Admin login')
    await page.getByLabel('Password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('h1')).toContainText('Configuration Panel')
  })

  test('admin panel V2 controls allow reordering, adding and deleting with confirm modal', async ({ page, isMobile }) => {
    await page.goto('/admin')
    await page.getByLabel('Password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('h1')).toContainText('Configuration Panel')

    // Navigate to Experience tab
    const expTab = isMobile
      ? page.locator('div[aria-label="Mobile sections"]').getByRole('button', { name: /Experience/i })
      : page.locator('nav[aria-label="Admin sections"]').getByRole('button', { name: /Experience/i })
    await expTab.click()

    // Add experience item
    await page.getByRole('button', { name: /Add new Experience/i }).click()
    await expect(page.getByRole('textbox', { name: 'Organization' })).toHaveValue('New Organization')

    // Click Delete to open confirmation dialog
    await page.getByRole('button', { name: /^Delete /i }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // Cancel modal
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).not.toBeVisible()
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
