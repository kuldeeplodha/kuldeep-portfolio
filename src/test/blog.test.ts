import { describe, it, expect } from 'vitest';
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
