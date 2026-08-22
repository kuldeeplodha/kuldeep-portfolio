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
    await page.getByRole('link', { name: 'Projects' }).click()
    await expect(page.locator('#projects')).toBeInViewport()
  })

  test('project case study page loads', async ({ page }) => {
    await page.goto('/projects/gesture-recognition')
    await expect(page.locator('h1')).toContainText('Gesture Recognition')
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible()
  })

  test('Ask Kuldeep returns grounded answer', async ({ page }) => {
    await page.goto('/#ask')
    await page.getByRole('button', { name: /NLP work/i }).click()
    await expect(page.getByRole('status')).toContainText(/NLP/i)
  })

  test('admin panel requires login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('h1')).toContainText('Admin login')
    await page.getByLabel('Password').fill('test-admin-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('h1')).toContainText('Configuration Panel')
  })
})
