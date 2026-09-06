import { test, expect, type Route } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// V2.2 P3: /blog and /blog/:slug now render the CMS-backed CmsBlogListPage/
// CmsBlogDetailPage (src/App.tsx) instead of the markdown-file BlogListPage/
// BlogDetailPage — see App.tsx's comment for why (PRD's official Phase
// 3/4 plan). The markdown seed posts these tests used to exercise live
// ("welcome-to-markdown-blog" etc.) no longer back the live route, so the
// navigation/rendering tests below mock the public content API instead.
// The prerender test is untouched — it checks build output, not live
// routing, and scripts/postbuild.mjs's markdown handling is unchanged.

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

const MOCK_POST = {
  id: 'p1',
  slug: 'shipping-the-cms',
  title: 'Shipping the CMS',
  excerpt: 'How the content backend came together.',
  body: 'Some **markdown** content.',
  status: 'published',
  published_at: '2026-09-01T00:00:00Z',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  tags: ['engineering'],
  relevant_roles: [],
  reading_time_minutes: 3,
  featured_media_url: null,
  media_urls: [],
};

test.describe('Blog', () => {
  test('static prerender generates index.html for posts with correct title', async () => {
    // We check the build output directly for the prerender requirement
    const distPath = path.resolve(process.cwd(), 'dist', 'blog', 'welcome-to-markdown-blog', 'index.html');

    // Assert file exists
    expect(fs.existsSync(distPath)).toBe(true);

    // Assert title
    const htmlContent = fs.readFileSync(distPath, 'utf-8');
    expect(htmlContent).toContain('<title>Welcome to the new Markdown Blog | Blog</title>');
  });

  test('blog list page renders and links to posts', async ({ page }) => {
    await page.route('**/api/blogs', (route) => json(route, [MOCK_POST]));
    await page.route('**/api/blogs/shipping-the-cms', (route) => json(route, MOCK_POST));

    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();

    const postLink = page.getByRole('link', { name: 'Shipping the CMS' }).first();
    await expect(postLink).toBeVisible();

    await postLink.click();

    await expect(page.getByRole('heading', { name: 'Shipping the CMS', level: 1 })).toBeVisible();
    // marked + DOMPurify rendered the markdown body into .blog-content.
    await expect(page.locator('.blog-content')).toContainText('Some markdown content.');
  });

  test('navigation to blog works from homepage (desktop and mobile)', async ({ page, isMobile }) => {
    await page.route('**/api/blogs', (route) => json(route, []));
    await page.goto('/');
    // V2-P1 nav restructure: on desktop, Blog lives in the "More" menu with
    // role="menuitem" (not "link"); the mobile menu keeps a plain flat list.
    let blogLink;
    if (isMobile) {
      await page.getByRole('button', { name: 'Toggle menu' }).click();
      blogLink = page.getByRole('link', { name: 'Blog', exact: true });
    } else {
      await page.getByRole('button', { name: 'More' }).click();
      blogLink = page.getByRole('menuitem', { name: 'Blog', exact: true });
    }

    await expect(blogLink).toBeVisible();
    await blogLink.click();

    await expect(page).toHaveURL(/.*\/blog$/);
    await expect(page.getByRole('heading', { name: 'Blog', level: 1, exact: true })).toBeVisible();
  });

  // V1.6 UI Modernization (T-UI-IMPL §2.2): bento grid layout for the post list.
  test('blog list renders posts in a responsive bento grid', async ({ page }) => {
    const posts = [1, 2, 3].map((n) => ({ ...MOCK_POST, id: `p${n}`, slug: `post-${n}`, title: `Post ${n}` }));
    await page.route('**/api/blogs', (route) => json(route, posts));

    await page.goto('/blog');

    const grid = page.locator('main').locator('div.grid').first();
    await expect(grid).toBeVisible();
    await expect(grid).toHaveClass(/grid-cols-1/);
    await expect(grid).toHaveClass(/md:grid-cols-2/);
    await expect(grid).toHaveClass(/lg:grid-cols-3/);

    const cards = grid.locator('> article');
    await expect(cards).toHaveCount(3);
  });
});
