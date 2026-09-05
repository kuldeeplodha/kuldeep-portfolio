---
title: Welcome to the new Markdown Blog
slug: welcome-to-markdown-blog
date: 2026-09-05
excerpt: We have officially migrated our thoughts and announcements to a new static markdown blog architecture!
tags: [architecture, blog, react, vite]
readingTimeMinutes: 3
---

# Welcome to the new Markdown Blog

This is the very first post on our new markdown-driven blog! By keeping content tightly coupled to the git repository, we avoid unnecessary backend complexity while ensuring everything is properly version-controlled and cacheable.

## What's under the hood?

We use a few battle-tested tools to bring this to life:
- **Vite** for incredibly fast local development and `import.meta.glob` indexing
- **Marked** for converting raw markdown into HTML
- **DOMPurify** to sanitize the output, keeping our readers safe from XSS
- **React Router** for lazy-loading blog routes so the homepage stays fast

### Next Steps

Expect to see more deep-dives into our architecture and engineering decisions here. Stay tuned!

