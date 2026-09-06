import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// V2.1 P4 (docs/design/portfolio-v2.1-spec.md §46-47,55,61-76,§91): the
// final Contact/Footer real-content CTA, project-page prerendering (so
// detail pages return HTTP 200 instead of a 404 SPA fallback), and the
// updated site-wide <title>.
test.describe('V2.1 P4 polish', () => {
  test('Contact shows the real CTA copy and links (no dead "#" links)', async ({ page }) => {
    await page.goto('/#contact')
    const contact = page.locator('#contact')
    await expect(contact.getByRole('heading', { name: "Let's build something useful." })).toBeVisible()
    await expect(contact.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
      'href',
      /^mailto:/,
    )
    // Real profile.links currently has real LinkedIn/GitHub URLs, so both
    // render here. If they were ever unset again, ContactSection omits
    // them entirely (conditional rendering, see Navbar.tsx) rather than
    // rendering a dead href="#" link — that omission path is exercised by
    // the component's own hasLinkedIn/hasGitHub guards, not re-testable
    // here without a real "URLs missing" fixture.
    const links = contact.getByRole('link')
    for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
      expect(href).not.toBe('#')
    }
  })

  test('Footer shows real name, tagline, and copyright', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.getByText('Kuldeep Lodha', { exact: true })).toBeVisible()
    await expect(footer.getByText('Software · Data · Machine Learning · AI')).toBeVisible()
    await expect(footer.getByText('© 2026 Kuldeep Lodha')).toBeVisible()
  })

  test('site-wide title reads "Senior Software Developer"', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Kuldeep Lodha — Senior Software Developer')
  })

  test('project detail pages are prerendered to static HTML (HTTP 200, not a 404 SPA fallback)', async () => {
    for (const id of ['gesture-recognition', 'ticket-classification', 'sentiment-recommendation']) {
      const distPath = path.resolve(process.cwd(), 'dist', 'projects', id, 'index.html')
      expect(fs.existsSync(distPath)).toBe(true)
      const html = fs.readFileSync(distPath, 'utf-8')
      expect(html).toContain('| Kuldeep Lodha</title>')
      expect(html).toContain('og:type" content="article"')
    }
  })

  test('project prerender pages are listed in the sitemap', async () => {
    const sitemapPath = path.resolve(process.cwd(), 'dist', 'sitemap.xml')
    const sitemap = fs.readFileSync(sitemapPath, 'utf-8')
    expect(sitemap).toContain('/projects/gesture-recognition')
  })

  // §91 validation checklist gap found while closing out P4: the mobile
  // hamburger menu's Escape-close + scroll-lock (added in V2.1-P1) had no
  // direct e2e coverage — only the desktop "More" menu's Escape handling
  // was tested (e2e/nav-more-menu.spec.ts).
  test('mobile menu closes on Escape and unlocks body scroll', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This is the mobile hamburger menu, not the desktop nav')
    await page.goto('/')

    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.locator('#mobile-menu')).toBeVisible()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

    await page.keyboard.press('Escape')
    await expect(page.locator('#mobile-menu')).toBeHidden()
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  })
})
