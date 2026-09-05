---
title: Understanding our Vite Configuration
slug: understanding-vite-config
date: 2026-09-06
excerpt: A brief dive into how we configure Vite to give us optimal build times and proper code splitting.
tags: [vite, build, tooling]
readingTimeMinutes: 5
---

# Understanding our Vite Configuration

Vite has dramatically changed our front-end build pipeline.

In this post, we explore some of the key settings in our `vite.config.ts` that help us stay fast and lean.

## Code Splitting

By relying on React's `lazy()` and `Suspense`, Vite automatically chunks our routes. The blog list and blog detail pages each get their own JavaScript bundle. This means our homepage doesn't load the Markdown parser (`marked`) or `DOMPurify` until the user actually navigates to the blog.

## Import Glob

Using `import.meta.glob` is like having a tiny filesystem reader built right into the bundler.

```typescript
const posts = import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true })
```

This single line collects all our markdown files and embeds them as strings in the build, without any need for Node.js `fs` module scripts at runtime!
