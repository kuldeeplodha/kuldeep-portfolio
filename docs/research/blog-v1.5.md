# V1.5 Blog — Markdown-Driven Content Architecture

**Author:** Kelly (Research Lead, `kelly-mt5wqij5`) · **Date:** 2026-09-05 · **Task:** T-BLOG-RES  
**Conversation:** conv-v15-blog · **Scope:** research & written doc only — no `src/` code changes

---

## 0. Research Question

How should the portfolio add a **markdown-driven blog/content section** that:

1. Fits the existing Vite/React 19 stack, role-driven theming, and static GitHub Pages deployment?
2. Sources content durably (local `.md` files vs admin Config Panel vs hybrid)?
3. Handles markdown rendering safely (XSS prevention, sanitization)?
4. Routes blog list + detail pages consistently with the existing router pattern?
5. Preserves SEO and supports RSS without a backend?

---

## 1. Context

### 1.1 Existing architecture (verified)

- **Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + React Router 7
- **Hosting:** Static GitHub Pages (no backend, no server-side rendering)
- **Deployment:** `npm run build` outputs `dist/`, GitHub Actions deploys to GitHub Pages
- **Routing:** React Router 7 with lazy-loaded pages (e.g., `ProjectDetailPage`); hash-based role state via URL query param `?role=<RoleId>`
- **Styling:** Tailwind 4 + CSS custom properties for role-driven themes (see `useRole.ts`)
- **Admin panel:** `AdminPage.tsx` (`~2000 lines`), uses zero-dep `configDraftReducer` (V1.2) + `validationRegistry` (V1.3) for UI feedback. No markdown authoring yet.
- **Config structure:** Single `PortfolioConfig` tree (src/config/golden-state.json) with 10 root properties (`profile`, `roles`, `themes`, `experience[]`, `projects[]`, `skills[]`, `education[]`, `certifications[]`, `research[]`, `metrics[]`, `aiKnowledge[]`). No blog/content array yet.
- **Security posture:** No `dangerouslySetInnerHTML` in codebase; import path validates config (`parseImportedConfig`, `validateFullConfig`); export-only JSON format; no backend execution.
- **Data flow:** Config read from JSON once at app startup → consumed by pages/components → admin panel allows edit/export-draft. No runtime schema migrations planned for V1.5 blog.

### 1.2 Role-driven theming (important for blog context)

Each `role` (software, ai, data, system) has:
- Separate color/typography theme (CSS custom properties in `useRole.ts`)
- Filtered content (metrics, projects, experience achievements are role-selective)
- Hero section that shifts per role

Blog content can be:
- **Role-agnostic** (all visitors see the same posts) — simplest, recommended for launch
- **Role-specific** (posts tagged with roles, filtered per URL `?role=`) — future enhancement

---

## 2. Option A: Content sourcing approaches

| Approach | Sketch | Pros | Cons |
|----------|--------|------|------|
| **A1: Local `.md` files + static bundling** | Blog posts in `/src/content/blog/*.md`; Vite `import.meta.glob(..., { query:'?raw', eager:true })` indexes posts at build-time; parsed at runtime | Git-versioned; fast cold deploy; no admin panel coupling; full control; easy branching/CI; build-time slug validation; hashed asset caching | No live editing; requires npm run build to publish; automatic post discovery reduces manual registry maintenance; no drafts/scheduling |
| **A2: Config Panel V2 integration** | Add `blog: BlogPost[]` array to `PortfolioConfig`; author in AdminPage with form fields (title, slug, date, markdown, tags); export/import as JSON | Live authoring UI; drafts via localStorage; role-scoped tags; re-uses ConfigPanel V1.2 reducer | Tightly couples blog to admin panel; large .md in JSON serialization; no version control history; inline editing can lose state; not suitable for multi-author (single-user tool) |
| **A3: Hybrid: `.md` files + config metadata** | Posts live in `/public/blog/*.md` (git-versioned content); `PortfolioConfig.blog: BlogMetadata[]` holds slug, title, date, tags, excerpt (no markdown body); Fetch + parse .md at runtime | Git history; decoupled; admin panel can edit metadata; scalable; allows drafts via metadata `published: false` | Extra fetch overhead; metadata duplication risk; requires lint rule to sync; 2-tier authoring (body in .md, meta in admin) |

### 2.1 Recommendation: **Approach A1 (Local `.md` + static bundling) for V1.5 launch**

**Rationale:**

1. **Simplest on day one:** Git-versioned posts, no admin coupling, no extra runtime fetches.
2. **Aligns with portfolio philosophy:** Config-first, static-first, no backend.
3. **Automatic post discovery:** `import.meta.glob()` builds a post index at compile time (no manual registry needed); catches bad slugs in CI before deploy.
4. **Scaling path:** If single-user admin editing becomes a bottleneck, migrate to A3 (hybrid) or A2 (panel) later.
5. **No live-authoring pressure:** Portfolio is personal brand, not news site; monthly posts ≫ real-time drafts.

**Bootstrap plan:**
- Create `/public/blog/` directory
- Add ~3–5 sample posts (`.md` format)
- Implement `useBlogPosts()` hook (read below §3)

---

## 3. Markdown rendering library + XSS/sanitization

### 3.1 Library options

| Library | Size (gzip) | XSS safety | Notes | Recommendation |
|---------|------------|-----------|-------|-----------------|
| **markdown-it** | ~12 KB | ❌ Renders HTML as-is (no sanitization) | Popular, fast, minimal. Requires paired sanitizer. | ✅ Use with `dompurify` (2.5 KB) or `xss` (4 KB) |
| **marked** | ~5–6 KB | ❌ Also renders as-is | Lightweight, popular. Same sanitizer coupling needed. | ✅ Use with sanitizer |
| **remark + unified** | ~20+ KB (with plugins) | ⚠️ Configurable; default HTML pass-through | Plugin ecosystem; overkill for simple blog. | ❌ Too heavy for one-user portfolio |
| **markdown-to-jsx** | ~7 KB | ⚠️ JSX-only; no HTML tags from markdown | Outputs React components; harder to customize styling. | ⚠️ Viable if JSX posts acceptable |
| **showdown** | ~25 KB | ❌ No sanitization | Old, large, not recommended. | ❌ Skip |

### 3.2 Recommended stack: **marked + DOMPurify**

**Size:** ~11–13 KB gzipped (marked ~5 KB + DOMPurify ~2.5 KB)

**Why:**
- **Minimal footprint** (blog is lazily-loaded code-split, so this doesn't hit homepage LCP)
- **Safe by default:** DOMPurify whitelist allows `<p>`, `<a>`, `<strong>`, `<em>`, `<code>`, `<pre>`, `<h2>–<h6>`, `<ul>`, `<ol>`, `<li>`, `<img>` with origin check
- **No JSX lock-in** (markdown-to-jsx would require JSX syntax in posts)
- **Tested in production** (both libraries, millions of sites)

**Implementation sketch:**
```typescript
import { marked } from 'marked'
import DOMPurify from 'dompurify'

function renderMarkdown(raw: string): string {
  const html = marked(raw)
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'a', 'strong', 'em', 'code', 'pre', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'blockquote'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    ALLOW_DATA_ATTR: false
  })
}
```

**Security note:**
- `<script>`, `<iframe>`, `<form>` are blocked by default (DOMPurify whitelist).
- Image `src` is sanitized; `javascript:` protocol stripped.
- `onerror`, `onclick` event handlers are removed.
- Result is safe to render via `dangerouslySetInnerHTML` (ironically, after sanitization).

---

## 4. Routing (list + detail pages) consistent with existing pattern

### 4.1 Router configuration

Current pattern (App.tsx):
```tsx
<Route path="/projects/:projectId" element={<ProjectDetailPage />} />
```

Proposed blog routes:
```tsx
<Route path="/blog" element={<BlogListPage />} />
<Route path="/blog/:slug" element={<BlogDetailPage />} />
```

### 4.2 URL scheme + SEO

- **List:** `/blog` → shows paginated/filterable list (10–15 posts per page)
- **Detail:** `/blog/how-to-build-a-portfolio` (slug, not id) → single post + metadata (date, tags, reading time)
- **Role filtering (future):** `/blog?role=ai` → filter posts tagged `roles: ['ai']`

### 4.3 Integration points

**BlogListPage.tsx:**
- Fetch blog metadata (read from JSON data structure or imported .md frontmatter)
- Lazy-load post list; pagination via URL state or query params
- Tags as filterable chips (Tailwind + existing component patterns)
- Each post card shows: title, excerpt, date, reading time, tags

**BlogDetailPage.tsx:**
- Route param `:slug` → find post in loaded index
- Render markdown via `renderMarkdown()` utility (marked + DOMPurify)
- CSS: wrap rendered HTML in a `.blog-content` class; Tailwind prose utilities or custom markdown styling
- Sidebar/metadata: date, author, tags, related posts, "back to list" link
- Accessibility: semantic `<article>`, proper heading hierarchy (`<h1>` for post title, `<h2>–<h6>` in body)

**Code-splitting strategy:**
- Lazy-load both `BlogListPage` and `BlogDetailPage` in App.tsx (like `ProjectDetailPage`)
- Markdown content (.md strings) imported via Vite macro or lazy-fetched; doesn't block homepage LCP

---

## 5. SEO, RSS, and build considerations

### 5.1 SEO

**Vite SPA limitation (critical):**
- Vite builds a **single `index.html`** file for the entire SPA; there are NO per-route HTML files (e.g., `/dist/blog/post-slug.html` does not exist).
- Search engine crawlers receive a shell HTML + JavaScript bundle; crawlers may not execute JS, so blog post routes appear empty to SEO indexers.
- **Current state:** Blog routes have NO per-route SEO benefit without a prerender/SSG step (e.g., `vite-plugin-ssr`, `prerender-spa-plugin`). Adding a sitemap listing `/blog/post-slug` URLs is misleading without prerendering.
- **GitHub Pages limitation:** Deep links like `/blog/slug` will 404 without a server-side fallback (index.html → 404.html rewrite). This requires a `404.html` workaround (copy `index.html` as `404.html` in the build step); **currently not in place**.

**Workaround for V1.5 (social sharing + internal crawl):**
- Update title/meta tags dynamically in `BlogDetailPage` (useful for social media previews when shared directly)
- Listing `/blog/posts` in sitemap helps internal navigation; external SEO is limited without prerendering

**Metadata (title, description, OG tags):**
- Add `<Helmet>` or manual document.title + meta tag updates in `BlogDetailPage`
- Example (no external library needed for static portfolio):
```tsx
useEffect(() => {
  document.title = `${post.title} | Kuldeep's Portfolio`
  document.querySelector('meta[name="description"]')?.setAttribute('content', post.excerpt)
  // OG tags for social preview
}, [post])
```

**Sitemap:** Extend `public/sitemap.xml` to include blog post routes:
```xml
<url><loc>https://kuldeeplodha.github.io/blog</loc></url>
<url><loc>https://kuldeeplodha.github.io/blog/post-slug-1</loc></url>
<url><loc>https://kuldeeplodha.github.io/blog/post-slug-2</loc></url>
```

**robots.txt:** Already exists (`public/robots.txt`); no changes needed if all blog routes are public.

### 5.2 RSS/Atom feed

**Option 1: Static XML file (no runtime generation)**
- Build step generates `public/blog/feed.xml` from post metadata
- Requires a build plugin or npm script (e.g., using `feed` package, ~3 KB gzipped)
- Simple HTTP GET to `/blog/feed.xml` returns valid RSS

**Option 2: Runtime generation**
- BlogFeedPage.tsx (lazy-loaded) generates XML on demand
- Lightweight; `feed` package on demand (no bundled penalty)
- Slightly less efficient than static file

**Recommendation:** **Static RSS** (build-time via npm script)
- No runtime overhead
- RSS readers cache the file; instant delivery
- Simpler debugging (no React rendering bugs)

**Implementation sketch (package.json script):**
```json
{
  "scripts": {
    "build": "tsc -b && vite build && npm run build:rss",
    "build:rss": "node scripts/generate-rss.js"
  }
}
```

---

## 6. Content sourcing deep dive: V1.5 file layout

### 6.1 Directory structure (Option A1 recommended)

```
/src/content/blog/
  post-1-how-to-build-a-portfolio.md
  post-2-typescript-tips.md
  post-3-accessibility-in-react.md

/src/pages/
  BlogListPage.tsx        (new)
  BlogDetailPage.tsx      (new)

/src/lib/blog/
  index.ts                (new: export types, useBlogPosts hook)
  renderMarkdown.ts       (new: marked + DOMPurify wrapper)
  types.ts                (new: BlogPost, BlogMetadata)

/src/test/
  blog.test.tsx           (new: unit tests for rendering, sanitization)
```

### 6.2 Post metadata (frontmatter)

Each `.md` file starts with YAML frontmatter:
```markdown
---
title: How to Build a Portfolio
slug: how-to-build-a-portfolio
date: 2026-09-05
excerpt: A step-by-step guide to creating a personal portfolio website.
tags: [career, portfolio, web-dev]
readingTimeMinutes: 8
roles: []  # Empty = all roles. Or ['ai', 'data'] for role-specific posts.
---

# How to Build a Portfolio

Your markdown content here...
```

### 6.3 Runtime post loading

**Vite `import.meta.glob()` approach (RECOMMENDED for V1.5):**

Vite's glob import automatically discovers all `.md` files at build time and creates a post index:

```typescript
// /src/lib/blog/index.ts
const postModules = import.meta.glob<string>('/src/content/blog/*.md', { query: '?raw', eager: true })

function parseFrontmatter(raw: string): { meta: BlogMetadata; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Invalid frontmatter')
  const [, frontmatterYaml, body] = match
  const meta = parseSimpleYAML(frontmatterYaml) // simple key-value parser (see Appendix §10)
  return { meta, body }
}

export function useBlogPosts(): BlogPost[] {
  return Object.entries(postModules)
    .map(([filepath, raw]) => {
      const { meta, body } = parseFrontmatter(raw as string)
      // Validate slug exists
      if (!meta.slug) throw new Error(`Post ${filepath} missing slug in frontmatter`)
      return { ...meta, body }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // newest first
}
```

**Advantages of this approach:**
- **Automatic post discovery:** New files in `/src/content/blog/*.md` are indexed without manual registry edits.
- **Build-time validation:** Vite fails the build if a post has a missing or duplicate `slug` — catches errors before deploy.
- **Zero additional dependencies:** No YAML parser needed; simple regex frontmatter parser (§10).
- **Type-safe:** TypeScript sees all posts; IDE autocomplete for post properties.

**Alternative (manual registry, if preferred):**

```typescript
// /src/lib/blog/registry.ts
export const blogRegistry = [
  {
    slug: 'how-to-build-a-portfolio',
    title: 'How to Build a Portfolio',
    date: new Date('2026-09-05'),
    // ... other meta
    body: () => import('/src/content/blog/post-1-how-to-build-a-portfolio.md?raw').then(m => m.default)
  },
  // ...
]
```

**Recommendation:** Use `import.meta.glob()` for automatic discovery; manual registry only if posts are stored elsewhere.

---

## 7. Build and deployment considerations

### 7.1 Bundle impact

**Markdown dependencies (one-time at blog pages load):**
- `marked`: ~5 KB gzipped
- `dompurify`: ~2.5 KB gzipped
- **Total blog chunk:** ~7.5 KB added (lazy-loaded, doesn't hit homepage)

**No change to homepage metrics** (GH Pages Lighthouse, LCP, FCP) if blog is behind a route and lazy-loaded.

### 7.2 Build process

**No changes needed:**
- Vite already has `?raw` query param for text imports
- `npm run build` will include `/public/blog/*.md` in the bundle as strings
- Static site generation is automatic (Vite + GitHub Pages)

### 7.3 CI/GitHub Actions

**No changes to existing workflow** if using Option A1.
- If adding RSS build step, update `.github/workflows/deploy.yml` to run `npm run build:rss` after `npm run build`

### 7.4 Deployment

- Posts go live when merged to `main`
- No need for a separate content deployment process
- Rollback via git revert + redeploy

---

## 8. Integration points in existing codebase

### 8.1 Files to modify

| File | Change | Notes |
|------|--------|-------|
| `/src/App.tsx` | Add lazy-loaded routes for `/blog` and `/blog/:slug` | Follow existing pattern for `ProjectDetailPage` |
| `/src/components/layout/Navbar.tsx` | Add "Blog" link to navigation menu | Conditional on blog feature flag (optional) |
| `/public/sitemap.xml` | Add blog route entries | Manual or script-generated |
| `package.json` | Add `marked` and `dompurify` dependencies; optionally add build:rss script | |
| `/src/hooks/useRole.ts` | No changes needed (blog styling inherits role themes via CSS vars) | |
| `/src/pages/AdminPage.tsx` | No changes needed for V1.5 (admin doesn't author blog) | Future: integrate A3 hybrid or A2 panel approach |

### 8.2 Files to create

| File | Purpose |
|------|---------|
| `/src/pages/BlogListPage.tsx` | Blog post listing, filtering, pagination |
| `/src/pages/BlogDetailPage.tsx` | Single post view with rendered markdown |
| `/src/lib/blog/types.ts` | TypeScript interfaces (`BlogPost`, `BlogMetadata`) |
| `/src/lib/blog/index.ts` | `useBlogPosts()` hook, post registry |
| `/src/lib/blog/renderMarkdown.ts` | Marked + DOMPurify wrapper function |
| `/src/test/blog.test.tsx` | Unit tests for rendering, edge cases, XSS prevention |
| `/public/blog/post-1.md` | First blog post (sample) |
| `/public/blog/post-2.md` | Second blog post (sample) |
| `scripts/generate-rss.js` | (Optional) build-time RSS generation |

---

## 9. Recommended approach summary

### **For V1.5 launch (immediate):**

1. **Content sourcing:** Local `.md` files in `/public/blog/` (Option A1)
   - Git-versioned, no admin coupling, simplest on day one
   
2. **Rendering:** `marked` + `dompurify` (~7.5 KB gzipped)
   - Minimal, safe, tested in production
   
3. **Routing:** `/blog` (list) and `/blog/:slug` (detail)
   - Consistent with existing patterns, lazy-loaded
   
4. **SEO:** Static metadata in pages + manual sitemap update
   - No runtime overhead; search engines crawl static HTML
   
5. **RSS:** Static build-time generation (optional for V1.5.1)
   - Can be added in a follow-up PR with minimal effort

### **Scaling path (V1.6+):**

- If admin authoring becomes a bottleneck: migrate to **Option A3 (hybrid)** — keep `.md` in git, add blog metadata array to `PortfolioConfig`, author metadata in admin panel
- If real-time editing needed: migrate to **Option A2 (full panel)** — move markdown bodies to config JSON, re-use `configDraftReducer` for drafts
- If multi-author: introduce a lightweight backend (out of scope for portfolio)

---

## 10. Appendix: Frontmatter parsing helper (zero-dependency)

If avoiding YAML library, use this simple parser:

```typescript
// Parse basic YAML-like frontmatter into key-value pairs
function parseSimpleFrontmatter(raw: string): Record<string, any> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  
  const lines = match[1].split('\n')
  const result: Record<string, any> = {}
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':')
    if (!key) continue
    const value = valueParts.join(':').trim()
    
    // Simple type coercion
    if (value === 'true') result[key.trim()] = true
    else if (value === 'false') result[key.trim()] = false
    else if (!isNaN(Number(value))) result[key.trim()] = Number(value)
    else if (value.startsWith('[') && value.endsWith(']')) {
      result[key.trim()] = value.slice(1, -1).split(',').map(v => v.trim())
    } else {
      result[key.trim()] = value
    }
  }
  
  return result
}
```

---

## 11. Conclusion

**V1.5 Blog approach is low-risk and aligned with portfolio philosophy:**

- Leverages existing static build + GitHub Pages infrastructure
- Minimal new dependencies (marked + dompurify, both battle-tested)
- Git-versioned posts (full VC history, easy rollback)
- Scalable: can move to admin authoring or hybrid approach later without breaking existing posts
- No homepage performance impact (lazy-loaded chunk)
- Automatic post discovery via Vite `import.meta.glob()` (no manual registry maintenance)
- **Limitation:** Vite SPA builds a single index.html; external SEO indexing requires a prerender/SSG step (out of scope for V1.5). Internal navigation + social previews work via dynamic meta tags.

**Next steps for V1.5 implementation:**
1. Create `/src/content/blog/` directory and add 3–5 sample `.md` posts
2. Implement `BlogListPage.tsx` and `BlogDetailPage.tsx`; wire into App.tsx routing
3. Add `404.html` fallback in build step (copy `dist/index.html` → `dist/404.html`) to support GitHub Pages deep linking
4. Validate rendering and styling across all role themes
5. (Optional for V1.5.1) Add build-time RSS generation via `scripts/generate-rss.js`
