import { test, expect } from '@playwright/test'

// V2-P4 (docs/design/portfolio-v2-design-spec.md §2.7-2.9): Research Lab
// (honest single real entry), Engineering Stack (no percentage bars), Ask
// Kuldeep (real suggested questions), and the project case-study pages.
test.describe('Engineering differentiation (V2-P4)', () => {
  test('Research Lab shows only the one real research entry, honestly', async ({ page }) => {
    await page.goto('/')
    const lab = page.locator('#research')
    await expect(lab.getByRole('heading', { name: 'Research Lab' })).toBeVisible()
    await expect(lab.getByText('MS Research Thesis · 2024')).toBeVisible()
    await expect(lab.getByText('Explainability in Low-Resource and Multilingual NLP Applications')).toBeVisible()
    // Only one featured research card, not a fabricated multi-experiment log.
    await expect(lab.getByText('Completed · 2024')).toBeVisible()
    await expect(lab.getByText('Currently Exploring')).toBeVisible()
    await expect(lab.getByText('Generative AI')).toBeVisible()
  })

  test('Engineering Stack shows categorized technologies with no percentage bars', async ({ page }) => {
    await page.goto('/')
    const stack = page.locator('#stack')
    await expect(stack.getByRole('heading', { name: 'Engineering Stack' })).toBeVisible()
    await expect(stack.getByText('Backend', { exact: true })).toBeVisible()
    await expect(stack.getByText('Django REST Framework')).toBeVisible()
    await expect(stack.getByText('AI & NLP')).toBeVisible()
    // No proficiency indicators anywhere in the section.
    await expect(stack.locator('[role="progressbar"]')).toHaveCount(0)
    await expect(stack.getByText('%')).toHaveCount(0)
  })

  test('Ask Kuldeep shows the real suggested questions and response heading', async ({ page }) => {
    await page.goto('/#ask')
    const ask = page.locator('#ask')
    await expect(ask.getByRole('button', { name: 'How would you design a scalable Django API?' })).toBeVisible()
    await ask.getByRole('button', { name: 'How would you design a scalable Django API?' }).click()
    await expect(ask.getByText("Kuldeep's Engineering Note")).toBeVisible()
  })

  test('project case-study page shows the honest category badge', async ({ page }) => {
    await page.goto('/projects/gesture-recognition')
    await expect(page.getByText('Machine Learning · Deep Learning')).toBeVisible()
  })
})
