import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
    
    // Ensure one of the seed posts is visible
    const postLink = page.getByRole('link', { name: 'Welcome to the new Markdown Blog' });
    await expect(postLink).toBeVisible();
    
    // Click through to detail page
    await postLink.click();
    
    // Ensure detail page renders
    await expect(page.getByRole('heading', { name: 'Welcome to the new Markdown Blog', level: 1 }).first()).toBeVisible();
    
    // Ensure marked + DOMPurify rendered the markdown content
    await expect(page.locator('.blog-content h2').filter({ hasText: 'What\'s under the hood?' })).toBeVisible();
  });

  test('navigation to blog works from homepage (desktop and mobile)', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) {
      await page.getByRole('button', { name: 'Toggle menu' }).click();
    }
    
    const blogLink = page.getByRole('link', { name: 'Blog', exact: true });
    await expect(blogLink).toBeVisible();
    await blogLink.click();
    
    await expect(page).toHaveURL(/.*\/blog$/);
    await expect(page.getByRole('heading', { name: 'Blog', level: 1, exact: true })).toBeVisible();
  });
});
