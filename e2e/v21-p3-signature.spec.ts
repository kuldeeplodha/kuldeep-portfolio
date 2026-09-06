import { test, expect } from '@playwright/test'

// V2.1 P3 (docs/design/portfolio-v2.1-spec.md §35-37,43-45): Research Lab's
// notebook-style metadata panel, and Ask Kuldeep reframed as an "engineering
// knowledge interface" with an engineering-note-style response.
test.describe('V2.1 P3 signature features', () => {
  test('Research Lab renders labeled Status/Type metadata for the one real entry', async ({
    page,
  }) => {
    await page.goto('/')
    const lab = page.locator('#research')
    await expect(lab.getByText('Status', { exact: true })).toBeVisible()
    await expect(lab.getByText('Type', { exact: true })).toBeVisible()
    await expect(lab.getByText('Completed · 2024')).toBeVisible()
    await expect(lab.getByText('Focus areas', { exact: true })).toBeVisible()
    // Still exactly one entry — no fabricated "EXPERIMENT 00N" cards.
    await expect(lab.locator('article')).toHaveCount(1)
  })

  test('Ask Kuldeep response reads as an engineering note with contextual metadata', async ({
    page,
  }) => {
    await page.goto('/#ask')
    const ask = page.locator('#ask')
    const question = 'How would you design a scalable Django API?'
    await ask.getByRole('button', { name: question }).click()

    await expect(ask.getByText("Kuldeep's Engineering Note")).toBeVisible()
    // Contextual metadata: the real question just asked, not invented telemetry.
    await expect(ask.getByText(`Re: ${question}`)).toBeVisible()
  })

  test('Ask Kuldeep empty state uses the engineering-note framing, not the raw data-layer message', async ({
    page,
  }) => {
    await page.goto('/#ask')
    const ask = page.locator('#ask')
    await ask.getByLabel('Question for portfolio assistant').fill('zzz nonsense query unrelated to anything zzz')
    await ask.getByRole('button', { name: 'Ask' }).click()

    await expect(ask.getByText('No matching engineering note found')).toBeVisible()
    await expect(ask.getByText('Try asking about: Backend, Architecture, APIs, Performance, Systems')).toBeVisible()
  })

  test('Ask Kuldeep suggested prompts are labeled and keep working', async ({ page }) => {
    await page.goto('/#ask')
    const ask = page.locator('#ask')
    await expect(ask.getByText('Suggested', { exact: true })).toBeVisible()
    await expect(ask.getByRole('button', { name: 'How would you design a scalable Django API?' })).toBeVisible()
  })
})
