# Blog Authoring Guide (V1.5)

A contributor and author guide for adding and maintaining posts on the markdown-driven portfolio blog.

- **Design Record:** [ADR-006](./decisions/ADR-006-blog-v1.5.md) (content, rendering, and delivery decisions).
- **Core Principle:** Git-backed static content. Posts live alongside codebase source, are indexed at build time, and require zero external CMS or database services.
- **Routes:** `/blog` (feed list) and `/blog/:slug` (post detail), lazily loaded via `React.lazy` and `Suspense`.

---

## Quick Start: Adding a Post

To publish a new article:

1. Create a new markdown file inside `src/content/blog/` (e.g. `src/content/blog/my-new-post.md`).
2. Add the required frontmatter block at the very top of the file:
   ```markdown
   ---
   title: Building Resilient Web Applications
   slug: building-resilient-web-applications
   date: 2026-09-05
   excerpt: An exploration of defensive architecture, error boundaries, and static fallback patterns.
   tags: [architecture, typescript, reliability]
   readingTimeMinutes: 4
   ---

   # Building Resilient Web Applications

   Your markdown content starts here...
   ```
3. Run `npm run dev` to preview locally at `http://localhost:5173/blog`.
4. Run `npm run build` to verify the production bundle and static prerendered HTML output.

---

## Frontmatter Reference

Frontmatter is declared between opening `---` and closing `---` delimiters at the start of each `.md` file. The parser (`src/lib/blog/index.ts`) is a custom zero-dependency parser tailored for the browser bundle.

### Schema & Fields

| Field | Type | Required? | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | **Yes** | Post title. Rendered in article headers, feed cards, `<title>` tags, and OpenGraph metadata. | `title: My First Post` |
| `slug` | `string` | **Yes** | Unique URL identifier (kebab-case). Defines the route `/blog/:slug` and the static prerender directory `dist/blog/:slug/index.html`. | `slug: my-first-post` |
| `date` | `string` | **Yes** | ISO date (`YYYY-MM-DD`). Used to sort posts chronologically (newest first) and populate `<time dateTime="...">`. | `date: 2026-09-05` |
| `excerpt` | `string` | **Yes** | Summary paragraph displayed on list cards and injected into `<meta name="description">` and `og:description`. | `excerpt: A quick look at static site architecture.` |
| `tags` | `string[]` | **Yes** | Comma-separated list wrapped in square brackets. Rendered as tag badges. | `tags: [react, vite, performance]` |
| `readingTimeMinutes` | `number` | Optional | Estimated read time displayed in post meta headers. | `readingTimeMinutes: 5` |
| `roles` | `string[]` | Optional | Target audience / role affinities (`[software, ai, data, system]`). | `roles: [software, ai]` |

> [!IMPORTANT]
> - `slug` must be unique across all markdown files. A missing `slug` will throw a runtime/build error.
> - Use array bracket syntax for `tags` and `roles` (e.g. `tags: [foo, bar]`). Do not use multi-line YAML bullet lists.
> - Quotes around strings are optional, but basic single or double quotes will be cleanly stripped by the parser.

---

## Markdown Formatting & Sanitization

Markdown rendering is handled by [`marked`](https://marked.js.org/) and sanitized by [`DOMPurify`](https://github.com/cure53/DOMPurify) (`src/lib/blog/renderMarkdown.ts`).

### Supported Syntax
- **Headings:** `#` through `######`
- **Text formatting:** `**bold**`, `*italic*`, `~~strikethrough~~` (`<del>`)
- **Lists:** Ordered (`1.`, `2.`) and unordered (`-`, `*`)
- **Blockquotes:** `> quote`
- **Horizontal rules:** `---`
- **Tables:** Standard GFM markdown tables with `|` and header separators
- **Links & Images:** `[Link Text](url)`, `![Alt text](image-url)`
- **Code:** Inline `` `code` `` and fenced code blocks (```):
  ````markdown
  ```typescript
  const message: string = "Hello, World!";
  console.log(message);
  ```
  ````

### Security & Sanitization Allowlist
To prevent stored cross-site scripting (XSS), DOMPurify enforces strict element and attribute allowlists:
- **Allowed Tags:** `p`, `a`, `strong`, `em`, `code`, `pre`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `ul`, `ol`, `li`, `img`, `blockquote`, `br`, `hr`, `del`, `table`, `thead`, `tbody`, `tr`, `th`, `td`
- **Allowed Attributes:** `href`, `src`, `alt`, `title`, `class`
- **Disallowed / Stripped:** `<script>`, `<iframe>`, `<object>`, `<embed>`, inline styles (`style="..."`), and raw form inputs are stripped silently during rendering.
- `ALLOW_DATA_ATTR` is disabled (`false`).

---

## Slug & URL Routing

The blog operates under React Router with Vite code splitting:

```
src/content/blog/my-post.md
   │  (slug: "my-post")
   ▼
Client Route:       /blog/my-post
Prerendered File:   dist/blog/my-post/index.html
Sitemap Entry:      https://kuldeeplodha.github.io/kuldeep-portfolio/blog/my-post
```

- In `src/App.tsx`, routes `/blog` and `/blog/:slug` are wrapped in `React.lazy()` so the markdown parser (~13 KB gzipped) and article bodies do not impact the initial homepage bundle.
- If an author links to a slug that does not exist, `getBlogPostBySlug()` returns `undefined`, and `BlogDetailPage` cleanly renders the existing `NotFoundPage`.

---

## Build Pipeline & Static Prerendering (SSG)

Standard Single-Page Application (SPA) builds emit only one `index.html`, which breaks SEO and social media previews for sub-routes. The portfolio uses a custom post-build script (`scripts/postbuild.mjs`) executed immediately after `vite build`:

```bash
npm run build
# executes: tsc -b && vite build && node scripts/postbuild.mjs
```

### What `postbuild.mjs` Does:
1. **GitHub Pages Deep-Linking:** Copies `dist/index.html` to `dist/404.html` so direct navigation to any client route resolves correctly on static hosts.
2. **Post Prerendering:** For every `.md` file found in `src/content/blog/`, creates `dist/blog/<slug>/index.html` with:
   - Sanitized `<title>${post.title} | Blog</title>`
   - `<meta name="description" content="${post.excerpt}">`
   - Fully qualified `<link rel="canonical" href="...">` respecting `VITE_BASE_PATH`
   - OpenGraph metadata: `og:title`, `og:description`, `og:url`, and `og:type="article"`
3. **Blog Feed HTML:** Emits `dist/blog/index.html` with title `Blog | Portfolio`.
4. **Sitemap Generation:** Dynamically appends `<url>` records for `/blog` and every `/blog/:slug` into `dist/sitemap.xml`.

---

## Local Development & Testing

### Development Server
```bash
npm run dev
```
Vite indexes markdown files eagerly via `import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true })`. Changes to markdown files or frontmatter update immediately via Hot Module Replacement (HMR) without needing a server restart.

### Quality & Verification Checklist
Before submitting a pull request with new posts or blog features, run the full verification suite:

```bash
# 1. Typecheck TypeScript
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit tests (parser & renderer tests in src/test/blog.test.ts)
npm run test

# 4. Production build (validates postbuild SSG generation)
npm run build

# 5. End-to-end tests (validates prerender output and axe a11y)
npm run test:e2e
```

---

## Troubleshooting & Common Mistakes

- **Error: `Invalid frontmatter`**: The file must begin with `---` on line 1, followed by YAML keys, and close with `---`. Ensure there is no blank line before the opening `---`.
- **Error: `Post ... missing slug in frontmatter`**: Every post must specify a `slug`. Check for typos in the key name.
- **Unrendered or missing HTML tags**: If an HTML tag in your markdown disappears in the browser, check if it is part of the DOMPurify allowlist. Non-standard HTML tags are stripped for security.
- **Wrong Canonical URL in Deployments**: Ensure `VITE_BASE_PATH` is passed during production builds (e.g. `VITE_BASE_PATH=/kuldeep-portfolio/ npm run build`) so canonical links and sitemap entries generate the correct base path.
