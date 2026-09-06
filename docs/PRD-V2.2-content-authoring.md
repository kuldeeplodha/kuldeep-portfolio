# PRD-V2.2: Dynamic Content Authoring & Media CMS

- **PRD ID:** PRD-006 (V2.2-CONTENT-AUTHORING)
- **Feature Name:** Database-Backed Content Authoring, Media Uploads & Archive Architecture
- **Author:** Maya (`maya-mt5yw3ix`), Product Manager
- **Status:** Ready for Engineering Review
- **Target Release:** Portfolio V2.2
- **Reference Tasks:** `V22-EPIC`, `V22-PRD`, `V22-INFRA-PLAN`
- **Architecture Baseline:** Cloudflare Pages + D1 (SQLite) + R2 Object Storage (Zero Budget / Free Tier)
- **Dependencies:** ADR-006 (Blog Architecture), `docs/research/v2.2-cms-db-research.md`, PR #37 (Parked JSON Import)

---

## 1. Executive Summary & Problem Statement

### 1.1 Context & Human Objectives
In Portfolio V1.5 and V2.1, blogs and case studies were tied to static Markdown files (`src/content/blog/*.md`) and hardcoded TypeScript config arrays (`src/config/projects.ts`). Updating long-form content or publishing new case studies required an IDE, manual file creation, and a full git commit / CI deployment cycle. Furthermore, no media upload pipeline existed—images had to be manually placed in `public/` or `src/assets/`.

The human operator approved the **Cloudflare Pages + D1 + R2** architecture (zero-cost free tier with instant edge publishing) and requested:
1. **In-Panel Authoring:** Dedicated sections in the `/admin` configuration panel to CREATE, EDIT, PUBLISH, and DELETE both **Blogs** and **Case Studies**, with rich **Media Uploads** (images & video) stored in Cloudflare R2.
2. **Homepage Showcase (3 + 3):** The main landing page dynamically displays the latest 3 Case Studies + latest 3 Blog Posts, with direct links to dedicated archive pages.
3. **Dedicated Archive Pages:** Separate public archive listings: `/blog` (all articles) and `/case-studies` (all engineering case studies).
4. **Individual Read/Detail Pages:** Full reader views for each item: `/blog/:slug` and `/case-studies/:slug`.
5. **Strict Role-Theme Inheritance:** Detail pages **MUST** inherit the visitor's selected role theme (`software`, `ai`, `data`, `system`) seamlessly from the main page, eliminating visual disconnections or unstyled defaults.
6. **Zero-Downtime Migration:** Seamlessly migrate existing static markdown blogs into the D1 database store.

### 1.2 Core Constraints & Invariants
- **Strict Free-Tier Budget ($0 / No Credit Card Trap):**
  Must strictly stay within Cloudflare free-tier quotas:
  - Cloudflare Pages: Unlimited bandwidth & deployments.
  - Cloudflare D1: 5 GB SQLite database, 5M row reads/day, 100k row writes/day.
  - Cloudflare R2: 10 GB storage, 0 egress fees, 1M Class A operations/mo.
  - Cloudflare Workers/Pages Functions: 100k requests/day.
- **Fail-Closed Security Gate:**
  All media uploads must be authenticated via the admin session, type-validated against strict magic-byte signatures, and served via sanitized URLs. All markdown bodies must pass DOMPurify sanitization.
- **Zero Runtime Dependencies on the Client:**
  Frontend rendering reuses existing lightweight utilities (`marked` + `DOMPurify`); backend APIs run natively on Cloudflare Pages Functions.

---

## 2. Public Information Architecture (IA) & Navigation

```
                       ┌───────────────────────────────┐
                       │          Navbar               │
                       └──────────────┬────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │    Homepage     │       │  Blog Archive   │       │  Case Studies   │
   │      ("/")      │       │    ("/blog")    │       │ ("/case-studies")│
   └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
            │                         │                         │
     (Latest 3 + 3)                   │                         │
            ├─────────────────────────┼─────────────────────────┤
            ▼                         ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │  Blog Article   │       │   Case Study    │       │   Admin Panel   │
   │  ("/blog/:slug")│       │("/case-studies/ │       │   ("/admin")    │
   │                 │       │     :slug")     │       │                 │
   └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 2.1 Route Map
| Route | Access | Component | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | Public | `HomePage` | Displays Hero, Experience, Stack, + **Latest 3 Case Studies** and **Latest 3 Blog Posts**. |
| `/blog` | Public | `BlogListPage` | Dedicated archive displaying all published articles with tag search, filter by role, and pagination. |
| `/blog/:slug` | Public | `BlogDetailPage` | Full article reader with table of contents, reading time, code highlighting, and related articles. |
| `/case-studies` | Public | `CaseStudyListPage` | Dedicated archive displaying all published technical case studies with category and tech filters. |
| `/case-studies/:slug` | Public | `CaseStudyDetailPage`| Comprehensive engineering deep-dive: Problem, Context, Architecture, Outcome, Tech Stack, Media. |
| `/admin` | Authenticated | `AdminPage` | Config panel with new **Blogs**, **Case Studies**, and **Media Library** authoring tabs. |

### 2.2 Navigation Bar Updates
- **Desktop Navigation:**
  - Primary links: Work (`#projects`), Experience (`#experience`), Stack (`#stack`), Case Studies (`/case-studies`).
  - "More" Dropdown: Blog (`/blog`), Research Lab (`#research`), Education (`#education`), About (`#about`), Ask Kuldeep (`#ask`).
- **Mobile Navigation Drawer:**
  - Explicit entries for both `Case Studies` (`/case-studies`) and `Blog` (`/blog`).
- **URL Parameter Preservation:**
  All internal navigation links automatically propagate the active `?role=` search parameter to maintain theme continuity.

---

## 3. Data Models & Database Schema (Cloudflare D1)

Cloudflare D1 runs edge SQLite. Tables use UUID primary keys and ISO-8601 UTC timestamp strings.

### 3.1 D1 Schema Definition (`migrations/0001_initial_schema.sql`)

```sql
-- 1. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  relevant_roles TEXT NOT NULL DEFAULT '["software","ai","data","system"]', -- JSON array of RoleId
  reading_time_minutes INTEGER NOT NULL DEFAULT 1,
  featured_media_url TEXT,
  media_urls TEXT NOT NULL DEFAULT '[]' -- JSON array of R2 media URLs
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON blog_posts(status, published_at DESC);

-- 2. Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  summary TEXT NOT NULL,
  client_or_org TEXT NOT NULL,
  period TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured INTEGER NOT NULL DEFAULT 0, -- 1 for larger visual treatment on homepage
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  technologies TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  relevant_roles TEXT NOT NULL DEFAULT '["software","system"]', -- JSON array of RoleId
  problem TEXT NOT NULL,
  context TEXT NOT NULL,
  architecture TEXT NOT NULL, -- Architecture & pipeline steps narrative
  outcome TEXT NOT NULL,
  future_improvements TEXT,
  github_url TEXT,
  live_url TEXT,
  featured_media_url TEXT,
  media_urls TEXT NOT NULL DEFAULT '[]' -- JSON array of attached images/videos
);

CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status_published ON case_studies(status, published_at DESC);

-- 3. Media Assets Registry
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_key TEXT UNIQUE NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL,
  parent_type TEXT CHECK (parent_type IN ('blog', 'case_study', 'general')),
  parent_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_media_assets_r2_key ON media_assets(r2_key);
```

### 3.2 TypeScript Interfaces (`src/types/content.ts`)

```ts
import type { RoleId } from './index'

export type ContentStatus = 'draft' | 'published' | 'archived'

export interface BlogPostEntity {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  status: ContentStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  tags: string[]
  relevantRoles: RoleId[]
  readingTimeMinutes: number
  featuredMediaUrl?: string
  mediaUrls: string[]
}

export interface CaseStudyEntity {
  id: string
  slug: string
  title: string
  subtitle: string
  summary: string
  clientOrOrg: string
  period: string
  category: string
  status: ContentStatus
  featured: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  technologies: string[]
  relevantRoles: RoleId[]
  problem: string
  context: string
  architecture: string
  outcome: string
  futureImprovements?: string
  githubUrl?: string
  liveUrl?: string
  featuredMediaUrl?: string
  mediaUrls: string[]
}

export interface MediaAssetEntity {
  id: string
  filename: string
  r2Key: string
  publicUrl: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
  parentType?: 'blog' | 'case_study' | 'general'
  parentId?: string
}
```

---

## 4. Media Storage Architecture on Cloudflare R2

### 4.1 Storage & Quotas
- Cloudflare R2 bucket: `kuldeep-portfolio-media`.
- 10 GB free storage, **zero egress bandwidth fees**.
- Public Domain: Served via a custom domain (e.g. `https://media.kuldeeplodha.com`) or standard R2 public dev bucket (`https://pub-<id>.r2.dev`).

### 4.2 File Validation Rules
1. **Allowed Mime Types:**
   - **Images (Max 10 MB):** `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`.
   - **Videos (Max 50 MB):** `video/mp4`, `video/webm`.
2. **Larger Video Policy:** Videos exceeding 50 MB are blocked from direct R2 upload to preserve free quota. The editor provides a YouTube/Vimeo embed helper snippet instead.
3. **Magic-Byte Inspection:** The upload worker inspects the first 512 bytes to verify magic numbers, preventing renamed executables or disguised scripts.
4. **Key Format:** `uploads/{YYYY}/{MM}/{uuid}-{sanitized-filename}`.

### 4.3 Media Upload Flow

```
[ Admin Browser ]                          [ Cloudflare Pages Function ]               [ Cloudflare R2 ]
        │                                                │                                     │
        │── 1. POST /api/media/upload (multipart) ─────►│                                     │
        │      (Header: Authorization / Session)         │                                     │
        │                                                │── 2. Authenticate admin             │
        │                                                │── 3. Validate size & magic bytes    │
        │                                                │── 4. R2.put(key, body, headers) ───►│
        │                                                │◄─ 5. Upload Success ────────────────│
        │                                                │── 6. INSERT into media_assets       │
        │◄─ 7. Return { url, key, mimeType, size } ──────│                                     │
        │                                                │                                     │
   8. Insert Markdown:                                   │                                     │
      ![caption](https://media.../uuid.png)              │                                     │
```

---

## 5. Admin Panel UX & Authoring Workflows

The existing `/admin` route will be expanded with three top-level navigation tabs alongside the core profile configuration:

```
[ Profile & Bio ] [ Experience ] [ Projects ] [ Blogs ] [ Case Studies ] [ Media Library ] [ Config Backup ]
```

### 5.1 Blogs Authoring Flow
1. **Post List View:**
   - Filter by status (`All`, `Published`, `Draft`).
   - Columns: Title, Status badge (Green = Published, Amber = Draft), Date, Roles, Views/Reading Time, Actions (`Edit`, `Duplicate`, `Delete`).
   - Button: `+ New Blog Post`.
2. **Post Editor Screen:**
   - **Header Bar:** Title input (auto-generates slug; slug editable with lock icon), Status selector (`Draft` / `Published`), Action buttons: `[ Save Draft ]`, `[ Publish ]`, `[ Preview ]`, `[ Cancel ]`.
   - **Main Area (Split View):**
     - *Left Pane:* Markdown editor with formatting toolbar (H2, H3, Bold, Italic, Code, Blockquote, Link, Bullet List, **Upload Media** button).
     - *Right Pane:* Synchronous live preview rendered with `renderMarkdown` and scoped CSS.
   - **Sidebar Drawer (Metadata):**
     - Excerpt textarea (100–300 chars, validation counter).
     - Tags chip selector (type to add, click to delete).
     - Relevant Roles multi-select (using existing `RoleScopeEditor`).
     - Featured Image dropzone (drag image or pick from R2 library).
     - Published Date picker (defaults to current date upon publish).

### 5.2 Case Studies Authoring Flow
Because technical case studies require deeper rigor than unstructured blog posts, the Case Study editor uses structured narrative sections:
1. **Metadata:** Title, Subtitle, Client / Organization, Project Period, Category, Featured checkbox (for larger homepage card treatment), Role Scope.
2. **Structured Sections (Markdown-enabled textareas):**
   - **The Problem:** The operational/business bottleneck and quantitative constraints.
   - **Context & Constraints:** Legacy stack, timeline, team setup, and architectural requirements.
   - **Architecture & Technical Design:** Data pipelines, API workflows, system diagrams (with drag-and-drop R2 diagram upload).
   - **Outcome & Measurable Impact:** Quantifiable achievements (e.g. `60%+ latency reduction`), metrics, and business value.
   - **Technology Stack:** Tag selector (Python, Django, PostgreSQL, Docker, etc.).
   - **Links:** GitHub repository URL and Live Demo URL (gated by `isValidSafeUrl`).
3. **Media Attachments:** Dedicated multi-file dropzone for screenshots, architecture diagrams, and short screen recordings.

---

## 6. Public Presentation & Homepage Showcase

### 6.1 Homepage Strip: Latest 3 + 3
The `HomePage.tsx` layout will incorporate two dynamic preview strips:
1. **"Selected Case Studies" Section (Latest 3):**
   - Shows the 3 most recently published case studies relevant to the active role perspective (or top 3 if in `system` role).
   - Card layout: Category pill, Title, Organization/Period, Summary, Tech chips, Featured media banner.
   - Section Footer: Clean action button: `View All Case Studies →` pointing to `/case-studies`.
2. **"Latest Engineering Notes & Articles" Section (Latest 3):**
   - Shows the 3 most recently published blog posts.
   - Card layout: Date, Reading time, Title, Excerpt, Tag pills.
   - Section Footer: Clean action button: `View All Articles →` pointing to `/blog`.

### 6.2 Dedicated Archive Pages
1. **`/case-studies` Archive:**
   - Header: Title, Description, Filter bar by Technology and Role Perspective.
   - Grid of case studies with expandable summaries and visual indicators.
2. **`/blog` Archive:**
   - Modern bento/grid layout listing all published articles.
   - Search input (instant client-side filtering across title, excerpt, and tags).
   - Tag filter cloud.

---

## 7. Role-Theme Inheritance Requirement

### 7.1 Problem Definition
In the existing SPA, `useRole()` reads `?role=software|ai|data|system` from URL search parameters. Navigating to `/blog` or `/projects/:id` without preserving `search: location.search` causes the URL query string to be dropped, causing the hook to reset `data-role` and CSS custom properties to default (`system`).

### 7.2 Architectural Resolution
1. **Layout-Level Role Provider:**
   Mount `useRole()` inside a top-level wrapper (`<RoleThemeSync>`) in `App.tsx` outside `<Routes>`. This guarantees that `document.documentElement` attributes (`data-role`, `data-layout`, and `--color-*` CSS variables) remain active across every route transition.
2. **Role-Preserving Link Component (`<RoleAwareLink>`):**
   Create a drop-in `<RoleAwareLink>` component (or custom helper) that automatically merges the current `location.search` (`?role=...`) into any relative destination URL unless explicitly overridden.
3. **Detail Page Consistency:**
   Both `BlogDetailPage` and `CaseStudyDetailPage` must consume semantic CSS custom properties:
   - Page background: `var(--color-bg)`
   - Article surfaces: `var(--color-surface)`
   - Text & Headings: `var(--color-text)` and `var(--color-text-muted)`
   - Accents, borders & badges: `var(--color-accent)` and `var(--color-border)`
   - Fenced code block borders: `var(--color-accent)`
4. **Automated Verification:** Playwright visual regression and e2e tests will assert that navigating to `/blog/:slug?role=ai` maintains `data-role="ai"` and purple accent styling throughout.

---

## 8. Migration Plan for Existing Markdown Blogs

### 8.1 Inventory
Current repository contains 3 markdown posts in `src/content/blog/`:
- `post-1.md` (`welcome-to-markdown-blog`, Date: `2026-09-05`, Tags: `architecture, blog, react, vite`)
- `post-2.md` (`building-zero-dependency-validation-registry`, Date: `2026-09-05`, Tags: `typescript, validation, zero-dependency`)
- `post-3.md` (`automated-qa-visual-regression-testing`, Date: `2026-09-05`, Tags: `playwright, testing, automated-qa`)

### 8.2 Migration Script (`scripts/migrate-blogs-to-d1.mjs`)
A Node.js migration script will be committed to the repository:
1. Iterates over all `.md` files in `src/content/blog/`.
2. Parses frontmatter YAML and markdown body using `parseFrontmatter`.
3. Connects to the Cloudflare D1 database (via `wrangler d1 execute` or direct API).
4. Executes `INSERT OR IGNORE INTO blog_posts` with `status = 'published'`.
5. Logs verification report of migrated posts.

### 8.3 Dual-Engine Fallback (Zero Downtime)
During initial cutover, `getAllBlogPosts()` will query D1 via `/api/blogs`. If the D1 API returns 0 posts (e.g. during database setup or local offline testing), the loader transparently falls back to the static `import.meta.glob` content, ensuring zero visual disruption or 404 errors.

---

## 9. Reconciliation with Parked JSON-Import PRD (PR #37)

### 9.1 Relationship Analysis
- **PR #37 ([`docs/PRD-V2.1-json-content-import.md`](https://github.com/kuldeeplodha/kuldeep-portfolio/pull/37)):**
  Gated strictly around **structured resume config** (`PortfolioConfig`: profile, experience timeline, skills, education, role themes, philosophy, metrics).
- **PRD-006 (V2.2 Content Authoring):**
  Gated around **narrative content & media** (`blog_posts`, `case_studies`, `media_assets`) stored dynamically in Cloudflare D1/R2.

### 9.2 Decision & Recommendation
**PR #37 remains active and is NOT superseded.**
- Structured portfolio data (which changes infrequently and represents resume factuality) continues to live cleanly in `src/config/*.ts` and local drafts.
- In V2.2, the JSON Import/Export capability folds into `/admin` under a dedicated **"Config Backup & Restore"** tab.
- This provides the portfolio owner with the best of both worlds:
  1. Instant CMS publishing for daily articles, project deep-dives, and media uploads.
  2. Complete JSON backup/export for structured portfolio data and disaster recovery.

---

## 10. Phased Implementation Plan (Aligned with Alex's Infra Plan)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 0: Cloudflare Infrastructure & Deployment (Alex / DevOps)         │
│ - Human setup: Cloudflare account (free), create D1 db & R2 bucket     │
│ - Connect repo to Cloudflare Pages; configure wrangler.toml            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Database Schema & Migration (Dev)                              │
│ - Apply D1 schema migrations (blog_posts, case_studies, media_assets)  │
│ - Execute migration script for existing 3 blog posts                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Cloudflare Pages Functions API Layer (Dev)                    │
│ - Public GET endpoints (/api/blogs, /api/case-studies)                 │
│ - Authenticated admin endpoints (CRUD + R2 media upload stream)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Public IA, Read Pages & Role Theme Inheritance (Dev/UX)       │
│ - Homepage 3+3 strips; Archive pages (/blog, /case-studies)            │
│ - Detail pages (/blog/:slug, /case-studies/:slug)                      │
│ - Mount <RoleThemeSync> and update links to preserve ?role=            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Admin Panel Authoring & Media Library UI (Dev/UX)             │
│ - Split-view Markdown editor, case study editor, R2 media dropzone     │
│ - Role multi-select, live preview, publish/draft toggle                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 5: QA, Security Verification, & DNS Cutover (QA/Sec/DevOps)      │
│ - Imagine QA (regression, a11y, 3+3 layout), Peter Security (R2/upload)│
│ - Final DNS cutover to Cloudflare Pages                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Acceptance Criteria Checklist

### 11.1 Admin Content Authoring
- [ ] **AC-1 (Blog Editor):** Admin can create, edit, save draft, publish, and delete blog posts with title, slug, excerpt, body, tags, and role scope in `/admin`.
- [ ] **AC-2 (Case Study Editor):** Admin can create, edit, save draft, publish, and delete case studies with Problem, Context, Architecture, Outcome, Tech Stack, and links.
- [ ] **AC-3 (Live Markdown Preview):** Split-view editor provides instant live preview with sanitized HTML rendering matching site typography.
- [ ] **AC-4 (Slug Integrity):** Slugs are auto-generated from titles, enforce alphanumeric lowercase hyphenated format, and check for unique collisions.

### 11.2 Media Uploads (R2)
- [ ] **AC-5 (Image Upload):** Admin can upload images (`jpeg`, `png`, `webp`, `gif`, `svg`) up to 10 MB. Image is stored in R2 and returns a permanent public URL.
- [ ] **AC-6 (Video Upload & Guard):** Admin can upload MP4/WebM videos up to 50 MB. Videos exceeding 50 MB are blocked with a clear message suggesting external embed.
- [ ] **AC-7 (Media Insertion):** Uploading media directly inserts the appropriate Markdown tag (`![alt](url)` or video tag) at the editor cursor.

### 11.3 Public IA & Homepage 3+3
- [ ] **AC-8 (Homepage Showcase):** Homepage renders the latest 3 published Case Studies and latest 3 published Blogs, filtering appropriately for active role perspective.
- [ ] **AC-9 (Archive Pages):** Dedicated archive pages `/blog` and `/case-studies` list all published items with tag filtering and search.
- [ ] **AC-10 (Detail Reader Views):** Individual read routes `/blog/:slug` and `/case-studies/:slug` render full formatted content.
- [ ] **AC-11 (Draft Concealment):** Unauthenticated visitors cannot access or read draft or archived posts.

### 11.4 Role-Theme Inheritance
- [ ] **AC-12 (Theme Continuity):** Navigating from the homepage into any archive or detail page preserves the active role theme (`?role=software|ai|data|system`). All page tokens (`--color-bg`, `--color-accent`, etc.) adapt immediately.

### 11.5 Migration & Zero-Cost Compliance
- [ ] **AC-13 (Blog Migration):** Existing 3 markdown posts are seeded into D1 with zero data loss or slug changes.
- [ ] **AC-14 (Hybrid Fallback):** If D1 is temporarily unavailable, static bundled posts serve as a fallback without breaking the site.
- [ ] **AC-15 (Free Tier Guarantee):** All architectural components (Pages, D1, R2, Functions) operate 100% within free quotas with zero recurring monthly costs.
- [ ] **AC-16 (Security & A11y):** All new pages meet WCAG 2.1 AA; uploads are protected against unauthorized access and arbitrary file execution.

---

## 12. Open Questions for the Human

1. **Custom Domain Cutover:**
   Will your custom domain (`kuldeeplodha.com`) be connected directly to Cloudflare Pages (requires pointing DNS nameservers to Cloudflare), or should we deploy initially to the free `*.pages.dev` subdomain?
2. **Video Hosting Preference:**
   For videos over 50 MB (e.g. long demo recordings), do you prefer embedding from YouTube (unlisted) or Vimeo, or would you like to keep all media strictly under the 50 MB R2 limit?
3. **Author Metadata:**
   Should all articles and case studies default to "Kuldeep Lodha", or would you like an optional "Author" field for future co-authored technical papers or guest contributors?
