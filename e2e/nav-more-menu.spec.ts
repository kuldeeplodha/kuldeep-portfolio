import { test, expect } from '@playwright/test'

// V1.6 UI Modernization (T-UI-IMPL): the desktop navbar collapses
// Research/Education/About/Ask Kuldeep behind a "More" menu. Only applies
// to the desktop layout (`lg:flex`) — the mobile menu keeps a single flat list.
test.describe('Navbar "More" menu', () => {
  test('opens on click, exposes secondary links, and is keyboard accessible', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'More menu only renders in the desktop nav layout')

    await page.goto('/')

    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toHaveAttribute('aria-haspopup', 'menu')
    await expect(moreButton).toHaveAttribute('aria-expanded', 'false')

    await moreButton.click()
    await expect(moreButton).toHaveAttribute('aria-expanded', 'true')

    const menu = page.getByRole('menu', { name: 'More navigation links' })
    await expect(menu).toBeVisible()
    for (const label of ['Research', 'Education', 'About', 'Ask Kuldeep']) {
      await expect(menu.getByRole('menuitem', { name: label })).toBeVisible()
    }

    // Escape closes the menu and restores aria-expanded=false.
    await page.keyboard.press('Escape')
    await expect(moreButton).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toBeHidden()
  })

  test('clicking a menu item navigates and closes the menu', async ({ page, isMobile }) => {
    test.skip(isMobile, 'More menu only renders in the desktop nav layout')

    await page.goto('/')
    await page.getByRole('button', { name: 'More' }).click()
    await page.getByRole('menuitem', { name: 'Research' }).click()

    await expect(page.locator('#research')).toBeInViewport()
    await expect(page.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('primary links (Projects, Experience, Skills, Contact) stay directly visible', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Primary desktop links are hidden behind the hamburger on mobile')

    await page.goto('/')
    for (const label of ['Projects', 'Experience', 'Skills', 'Contact']) {
      await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })
})
