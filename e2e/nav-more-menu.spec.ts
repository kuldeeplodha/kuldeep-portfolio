import { test, expect } from '@playwright/test'

// V2-P1 nav restructure (docs/design/portfolio-v2-design-spec.md §2.1): the
// desktop navbar's primary bar is Work/Experience/Lab/About; Stack/
// Education/Contact/Blog collapse behind a "More" menu; Ask Kuldeep +
// Resume are standalone secondary CTAs. Only applies to the desktop layout
// (`lg:flex`) — the mobile menu keeps a single flat list. ('Stack' replaced
// 'Skills' in V2-P4 — SkillsSection is no longer rendered on the homepage.)
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
    for (const label of ['Stack', 'Education', 'Contact', 'Blog']) {
      await expect(menu.getByRole('menuitem', { name: label })).toBeVisible()
    }

    // Escape closes the menu and restores aria-expanded=false.
    await page.keyboard.press('Escape')
    await expect(moreButton).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toBeHidden()
  })

  test('clicking a hash-anchor menu item navigates and closes the menu', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'More menu only renders in the desktop nav layout')

    await page.goto('/')
    await page.getByRole('button', { name: 'More' }).click()
    await page.getByRole('menuitem', { name: 'Stack' }).click()

    await expect(page.locator('#stack')).toBeInViewport()
    await expect(page.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('Blog menu item navigates to the /blog route', async ({ page, isMobile }) => {
    test.skip(isMobile, 'More menu only renders in the desktop nav layout')

    await page.goto('/')
    await page.getByRole('button', { name: 'More' }).click()
    await page.getByRole('menuitem', { name: 'Blog' }).click()

    await expect(page).toHaveURL(/.*\/blog$/)
  })

  test('primary links (Work, Experience, Lab, About) stay directly visible', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Primary desktop links are hidden behind the hamburger on mobile')

    await page.goto('/')
    for (const label of ['Work', 'Experience', 'Lab', 'About']) {
      await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })

  test('Ask Kuldeep and Resume stay visible as standalone secondary CTAs', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Secondary CTAs are hidden behind the hamburger on mobile')

    await page.goto('/')
    // Scoped to the navbar: "Ask Kuldeep" also appears as a CTA elsewhere on
    // the homepage (e.g. the career pipeline), which is out of scope here.
    const nav = page.getByLabel('Main navigation')
    await expect(nav.getByRole('link', { name: 'Ask Kuldeep', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Resume', exact: true })).toBeVisible()
  })
})
