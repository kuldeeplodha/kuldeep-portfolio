---
title: Why we dropped gray-matter
slug: why-drop-gray-matter
date: 2026-09-07
excerpt: Sometimes, the best dependency is no dependency. Here is why we built a custom frontmatter parser.
tags: [javascript, parsing, dependencies, performance]
readingTimeMinutes: 4
---

# Why we dropped gray-matter

When parsing frontmatter from Markdown files, `gray-matter` is the industry standard. However, we recently decided to drop it from our project.

## The Bundle Cost

`gray-matter` is a fantastic library, but it relies on some Node.js built-ins and pulls in a `Buffer` polyfill when bundled for the browser. This bloats our client-side bundle for an incredibly simple task: splitting a string by `---` and reading some key-value pairs.

## Our Solution

Instead, we built a 20-line regex-based parser that handles exactly what we need, and nothing more:

- `title`
- `slug`
- `date`
- `tags` (as arrays)
- `readingTimeMinutes` (as numbers)

By keeping it narrow, we save bundle size and keep our architecture easy to understand.
