import { afterEach, describe, it, expect, vi } from 'vitest';
import { parseFrontmatter } from '../lib/blog';
import { renderMarkdown } from '../lib/blog/renderMarkdown';

describe('Blog Frontmatter Parser', () => {
  it('parses valid frontmatter correctly', () => {
    const raw = `---
title: Test Post
slug: test-post
date: 2026-09-05
tags: [test, blog]
readingTimeMinutes: 5
---
# Content here`;
    
    const { meta, body } = parseFrontmatter(raw);
    expect(meta.title).toBe('Test Post');
    expect(meta.slug).toBe('test-post');
    expect(meta.date).toBe('2026-09-05');
    expect(meta.tags).toEqual(['test', 'blog']);
    expect(meta.readingTimeMinutes).toBe(5);
    expect(body).toBe('# Content here');
  });

  it('throws on missing frontmatter', () => {
    const raw = `# Just content`;
    expect(() => parseFrontmatter(raw)).toThrow('Invalid frontmatter');
  });
});

describe('Blog Markdown Renderer', () => {
  it('renders markdown to safe HTML', () => {
    const markdown = `# Hello\n\n<script>alert(1)</script>\n\n**bold**`;
    const html = renderMarkdown(markdown);
    
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).not.toContain('<script>');
  });
  
  it('allows specific tags and classes', () => {
    const markdown = '```js\nconst x = 1;\n```\n\n<del>strikethrough</del>';
    const html = renderMarkdown(markdown);
    
    // Marked should produce something like <pre><code class="language-js">
    expect(html).toContain('class="language-js"');
    expect(html).toContain('<del>strikethrough</del>');
  });
});

describe('renderMarkdown base-path rewriting', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefixes root-relative links and images with the configured base path', () => {
    vi.stubEnv('BASE_URL', '/kuldeep-portfolio/');
    const markdown = '[**Building AI Agents**](/blog/building-ai-agents-with-claude)\n\n![Architecture diagram](/blog-assets/building-ai-agents-with-claude/hero.svg)';
    const html = renderMarkdown(markdown);

    expect(html).toContain('href="/kuldeep-portfolio/blog/building-ai-agents-with-claude"');
    expect(html).toContain('src="/kuldeep-portfolio/blog-assets/building-ai-agents-with-claude/hero.svg"');
  });

  it('leaves external, protocol-relative, mailto, and anchor refs untouched', () => {
    vi.stubEnv('BASE_URL', '/kuldeep-portfolio/');
    const markdown = [
      '[External](https://example.com/docs)',
      '[Insecure](http://example.com/docs)',
      '[Protocol-relative](//example.com/cdn/lib.js)',
      '[Email](mailto:hello@example.com)',
      '[Anchor](#references)',
    ].join('\n\n');
    const html = renderMarkdown(markdown);

    expect(html).toContain('href="https://example.com/docs"');
    expect(html).toContain('href="http://example.com/docs"');
    expect(html).toContain('href="//example.com/cdn/lib.js"');
    expect(html).toContain('href="mailto:hello@example.com"');
    expect(html).toContain('href="#references"');
  });

  it('never produces a double slash when the base path is prefixed', () => {
    vi.stubEnv('BASE_URL', '/kuldeep-portfolio/');
    const html = renderMarkdown('[Link](/blog/post)');

    expect(html).not.toMatch(/kuldeep-portfolio\/\//);
    expect(html).toContain('href="/kuldeep-portfolio/blog/post"');
  });

  it('leaves root-relative refs unchanged when the base path is "/" (dev default)', () => {
    vi.stubEnv('BASE_URL', '/');
    const html = renderMarkdown('[Link](/blog/post)\n\n![alt](/blog-assets/post/img.svg)');

    expect(html).toContain('href="/blog/post"');
    expect(html).toContain('src="/blog-assets/post/img.svg"');
  });
});
