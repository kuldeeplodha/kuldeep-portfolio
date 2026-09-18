# PRD-V2.2: Dynamic Content Authoring, FastAPI Backend & Cloudinary Media CMS

- **PRD ID:** PRD-006 (V2.2-CONTENT-AUTHORING)
- **Feature Name:** Database-Backed Content Authoring, Media Uploads & Archive Architecture
- **Author:** Maya (`maya-mt5yw3ix`), Product Manager
- **Status:** Approved Architecture — Ready for Phased Implementation
- **Target Release:** Portfolio V2.2
- **Reference Tasks:** `V22-EPIC`, `V22-PRD`, `V22-FASTAPI-RESEARCH`, `V22-INFRA-PLAN`
- **Architecture Baseline:**
  - **Frontend:** React 19 + Vite SPA hosted on **GitHub Pages** (`https://kuldeeplodha.github.io/kuldeep-portfolio/`)
  - **Backend:** **Python FastAPI** serverless deployment on **Vercel** (`api/index.py` + `vercel.json`)
  - **Database:** **Turso (libSQL / SQLite)** (5 GB free, 500M row reads/mo, zero suspend, card-free)
  - **Media Storage:** **Cloudinary Free Tier** (10 GB storage, 20 GB CDN, signed uploads, card-free)
  - **Admin Auth:** **JWT** (stateless bearer token issued by FastAPI `/api/auth/login`)
- **Dependencies:** ADR-006 (Blog Architecture), `docs/research/v2.2-fastapi-stack.md`, PR #37 (Parked JSON Import)

---

## 1. Executive Summary & Problem Statement

### 1.1 Context & Problem Statement
In Portfolio V1.5 and V2.1, blogs and projects were tied to static Markdown files (`src/content/blog/*.md`) and hardcoded TypeScript config arrays (`src/config/projects.ts`). Authoring a new post or updating technical case studies required an IDE, manual markdown authoring, and a full Git commit / CI build deployment cycle. Furthermore, no media pipeline existed—images had to be manually committed to the repository.

The human operator approved the **Python FastAPI + Turso + Cloudinary** architecture hosted alongside the existing **GitHub Pages** frontend. This combination guarantees:
1. **Python Engineering Alignment:** Leverages Python and FastAPI, directly mirroring Kuldeep's primary backend engineering lead expertise.
2. **100% Card-Free & Zero Budget:** No credit card required anywhere (GitHub Pages $0, Vercel Serverless Python $0, Turso free tier $0, Cloudinary free tier $0).
3. **Zero-Suspend Database Reliability:** Turso edge SQLite never sleeps or suspends (unlike Supabase or Render), ensuring admin writes and content lookups remain immediately responsive.
4. **Instant In-Panel Authoring:** Enables authoring, editing, publishing, and media upload for both **Blogs** and **Case Studies** directly within `/admin`.

### 1.2 Rulings on Key Open Decisions (Bake-In)
- **Hosting & Domain:** Stay on the current **GitHub Pages URL** (`https://kuldeeplodha.github.io/kuldeep-portfolio/`). No custom domain cutover in V2.2.
- **Large Video Policy (>50 MB):** Direct Cloudinary upload is restricted to images and video clips ≤ 50 MB. Videos exceeding 50 MB use **YouTube / Vimeo embeds** to protect free-tier bandwidth.
- **Author Attribution:** Fixed default to **"Kuldeep Lodha"**. No co-author field in V2.2.

---

## 2. System Architecture & Component Responsibilities

```
                                  ┌──────────────────────────────────────────────────────────┐
                                  │                       VISITOR BROWSER                    │
                                  └───────────────┬──────────────────────────┬───────────────┘
                                                  │                          │
                                  1. Load SPA     │                          │ 3. Stream Optimized Media
                                  (HTML/JS/CSS)   │                          │    (f_auto, q_auto)
                                                  ▼                          ▼
┌──────────────────────────────────────────────────┐        ┌────────────────────────────────┐
│                   GITHUB PAGES                   │        │         CLOUDINARY CDN         │
│          Static React 19 + Vite SPA              │        │  10 GB Storage / 20 GB Egress  │
│  - Homepage (3+3 Showcase)                       │        │  Images & Video Clips (<=50MB) │
│  - /blog & /case-studies Archives                │        └────────────────────────────────┘
│  - /blog/:slug & /case-studies/:slug Details     │                         ▲
│  - /admin CMS & Markdown Editor                  │                         │
└─────────────────────────┬────────────────────────┘                         │
                          │                                                  │ 2. Direct Signed Upload
                          │ 2. API Calls (Fetch Content & Admin Writes)      │    (Bypasses Vercel Size Limit)
                          ▼                                                  │
┌────────────────────────────────────────────────────────────────────────────┴───────────────┐
│                                   VERCEL SERVERLESS PYTHON                                 │
│                                      FastAPI Backend API                                   │
│  - /api/auth/login & /api/auth/verify (Stateless JWT)                                      │
│  - /api/blogs & /api/case-studies (Public Read Endpoints)                                  │
│  - /api/admin/* (Authenticated CRUD Operations)                                            │
│  - /api/admin/media/sign (Cloudinary Signature Generator)                                  │
└──────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               │
                                               │ 4. Read/Write SQLite Queries
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      TURSO (libSQL)                                        │
│                         Serverless Edge SQLite Database (Zero-Suspend)                     │
│  - blog_posts table                                                                        │
│  - case_studies table                                                                      │
│  - media_assets table                                                                      │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models & Database Schema (Turso / libSQL)

The database runs SQLite dialect on Turso. Tables utilize UUID primary keys and ISO-8601 UTC timestamp strings.

### 3.1 D1/Turso Schema (`migrations/0001_initial_schema.sql`)

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
  tags TEXT NOT NULL DEFAULT '[]', -- JSON string array of tags
  relevant_roles TEXT NOT NULL DEFAULT '["software","ai","data","system"]', -- JSON string array of RoleId
  reading_time_minutes INTEGER NOT NULL DEFAULT 1,
  featured_media_url TEXT,
  media_urls TEXT NOT NULL DEFAULT '[]' -- JSON string array of Cloudinary media URLs
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at DESC);

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
  featured INTEGER NOT NULL DEFAULT 0, -- 1 = featured card treatment on homepage
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  technologies TEXT NOT NULL DEFAULT '[]', -- JSON string array of technologies
  relevant_roles TEXT NOT NULL DEFAULT '["software","system"]', -- JSON string array of RoleId
  problem TEXT NOT NULL,
  context TEXT NOT NULL,
  architecture TEXT NOT NULL, -- Architecture narrative, pipeline steps, and diagram description
  outcome TEXT NOT NULL,
  future_improvements TEXT,
  github_url TEXT,
  live_url TEXT,
  featured_media_url TEXT,
  media_urls TEXT NOT NULL DEFAULT '[]' -- JSON string array of attached Cloudinary media URLs
);

CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status_published ON case_studies(status, published_at DESC);

-- 3. Media Assets Registry
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  public_id TEXT UNIQUE NOT NULL, -- Cloudinary public_id
  secure_url TEXT NOT NULL,       -- Cloudinary HTTPS delivery URL
  format TEXT NOT NULL,           -- jpg, png, webp, mp4, etc.
  resource_type TEXT NOT NULL CHECK (resource_type IN ('image', 'video', 'raw')),
  bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_at TEXT NOT NULL,
  parent_type TEXT CHECK (parent_type IN ('blog', 'case_study', 'general')),
  parent_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_media_assets_public_id ON media_assets(public_id);
```

### 3.2 Frontend TypeScript Interfaces (`src/types/content.ts`)

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
  publicId: string
  secureUrl: string
  format: string
  resourceType: 'image' | 'video' | 'raw'
  bytes: number
  width?: number
  height?: number
  uploadedAt: string
  parentType?: 'blog' | 'case_study' | 'general'
  parentId?: string
}
```

---

## 4. Backend API Specification (Python FastAPI on Vercel)

The backend exposes RESTful endpoints with CORS restricted to the GitHub Pages origin (`https://kuldeeplodha.github.io`).

### 4.1 Authentication & Security (`/api/auth`)
- **`POST /api/auth/login`**:
  - Request body: `{ "password": "..." }`
  - Validates password against `ADMIN_PASSWORD_HASH` using SHA-256 / bcrypt.
  - Returns: `{ "token": "<jwt>", "expiresIn": 86400 }`.
- **`GET /api/auth/verify`**:
  - Header: `Authorization: Bearer <jwt>`
  - Validates token authenticity and returns `{ "valid": true, "user": "admin" }`.

### 4.2 Public Content APIs
- **`GET /api/blogs`**:
  - Query parameters: `role?: RoleId`, `tag?: string`, `limit?: int (default 20)`, `offset?: int (default 0)`.
  - Returns array of published `BlogPostEntity` items ordered by `published_at DESC`.
- **`GET /api/blogs/{slug}`**:
  - Returns single published `BlogPostEntity` or 404.
- **`GET /api/case-studies`**:
  - Query parameters: `role?: RoleId`, `limit?: int (default 20)`, `offset?: int (default 0)`.
  - Returns array of published `CaseStudyEntity` items.
- **`GET /api/case-studies/{slug}`**:
  - Returns single published `CaseStudyEntity` or 404.

### 4.3 Admin Authoring APIs (Requires `Authorization: Bearer <jwt>`)
- **Blogs:**
  - `GET /api/admin/blogs` (includes draft and archived posts)
  - `POST /api/admin/blogs` (creates new blog post)
  - `PUT /api/admin/blogs/{id}` (updates blog post)
  - `DELETE /api/admin/blogs/{id}` (deletes blog post)
- **Case Studies:**
  - `GET /api/admin/case-studies` (includes drafts)
  - `POST /api/admin/case-studies` (creates new case study)
  - `PUT /api/admin/case-studies/{id}` (updates case study)
  - `DELETE /api/admin/case-studies/{id}` (deletes case study)

### 4.4 Cloudinary Signed Upload Flow
To avoid Vercel's 4.5 MB request body limit and keep Cloudinary API secrets secure on the server:
1. **`GET /api/admin/media/sign`**:
   - Generates a signed Cloudinary upload signature using `CLOUDINARY_API_SECRET`.
   - Returns: `{ "signature": "...", "timestamp": 1234567890, "apiKey": "...", "cloudName": "..." }`.
2. **Client Direct Upload:**
   - Admin browser POSTs binary payload directly to `https://api.cloudinary.com/v1_1/<cloudName>/auto/upload` with the signature.
   - Cloudinary returns `{ "public_id": "...", "secure_url": "...", "bytes": ..., "format": "..." }`.
3. **`POST /api/admin/media/register`**:
   - Admin panel records the new asset in the Turso `media_assets` table.

---

## 5. Admin Panel UX & Authoring Workflows

The `/admin` configuration panel will feature dedicated management tabs alongside the core profile sections:

```
[ Profile & Bio ] [ Experience ] [ Projects ] [ Blogs ] [ Case Studies ] [ Media Library ] [ Config Backup ]
```

### 5.1 Blogs Authoring Screen
- **List View:** Filter by `All`, `Published`, `Draft`. Search by title. Columns: Title, Status badge, Date, Role badges, Actions (`Edit`, `Duplicate`, `Delete`). Button: `+ New Blog Post`.
- **Editor Screen (Split View):**
  - Left Pane: Monospace Markdown textarea with formatting toolbar (Headers, Bold, Italic, Link, Code block, **Upload Media**).
  - Right Pane: Synchronized live HTML preview with DOMPurify sanitization.
  - Sidebar Drawer: Slug editor, Excerpt (with character counter), Tags input, Role Perspective multi-select, Featured Media picker, Status toggle (`Draft` / `Published`).

### 5.2 Case Studies Authoring Screen
Because senior engineering case studies demand technical depth, the editor organizes content into structured sections:
1. **Metadata:** Title, Subtitle, Organization / Client, Period, Category, Featured checkbox, Role Scope.
2. **Technical Narratives (Markdown-enabled textareas):**
   - **The Problem:** Quantitative bottleneck and business constraints.
   - **Context & Constraints:** Legacy stack, operational environment, and architectural boundaries.
   - **Architecture & Technical Design:** Data pipeline steps, API workflows, system diagrams (with Cloudinary drag-and-drop upload).
   - **Outcome & Measurable Impact:** Quantifiable achievements (e.g. `60%+ latency reduction`), metrics, and outcomes.
   - **Technologies:** Tag selector (Python, Django, PostgreSQL, Docker, etc.).
   - **Links:** Verified GitHub and Live Demo URLs.

---

## 6. Public Presentation & Information Architecture

### 6.1 Homepage Showcase (Latest 3 + 3)
The landing page (`HomePage.tsx`) integrates two dynamic content strips:
1. **"Selected Case Studies" (Latest 3):**
   - Renders the 3 most recent published case studies matching the active role perspective (or top 3 if in `system` role).
   - Shows Category badge, Title, Period, Summary, and Tech chips.
   - Action Button: `View All Case Studies →` pointing to `/case-studies`.
2. **"Latest Engineering Articles" (Latest 3):**
   - Renders the 3 most recent published blog posts.
   - Shows Date, Reading time, Title, Excerpt, and Tag pills.
   - Action Button: `View All Articles →` pointing to `/blog`.

### 6.2 Dedicated Archive Pages
- **`/case-studies` Archive:** Grid of all published engineering case studies with filter controls for Technology and Role Perspective.
- **`/blog` Archive:** Bento grid layout of all published articles with tag filtering and instant client-side title/excerpt search.

### 6.3 Individual Reader / Detail Pages
- **`/blog/:slug`:** Full article view with reading time, table of contents, rendered markdown, syntax-highlighted code blocks, and related posts.
- **`/case-studies/:slug`:** Comprehensive engineering case study layout: Problem, Context, Architecture, Outcome, Tech Stack, and Media attachments.

---

## 7. Role-Theme Inheritance Requirement

### 7.1 Problem Definition
In the existing SPA, `useRole()` reads `?role=software|ai|data|system` from URL search parameters. Navigating to `/blog` or `/case-studies/:slug` without preserving `location.search` causes the URL query string to drop, resetting `data-role` and CSS custom variables to the default `system` theme.

### 7.2 Architectural Resolution
1. **Layout-Level Theme Sync:**
   Mount `<RoleThemeSync>` inside `App.tsx` outside `<Routes>`. This guarantees `document.documentElement` attributes (`data-role`, `data-layout`, and `--color-*` CSS tokens) remain permanently synchronized across all route changes.
2. **Role-Preserving Link (`<RoleAwareLink>`):**
   Drop-in router `<Link>` component that automatically propagates `location.search` (`?role=...`) across all internal page transitions unless explicitly overridden.
3. **Detail Page Consistency:**
   `BlogDetailPage` and `CaseStudyDetailPage` strictly consume semantic CSS variables:
   - Page background: `var(--color-bg)`
   - Cards and containers: `var(--color-surface)`
   - Text & Headings: `var(--color-text)` and `var(--color-text-muted)`
   - Accents and borders: `var(--color-accent)` and `var(--color-border)`

---

## 8. Migration Plan for Existing Markdown Blogs

### 8.1 Inventory
Current repository contains 3 markdown posts in `src/content/blog/`:
- `post-1.md` (`welcome-to-markdown-blog`)
- `post-2.md` (`building-zero-dependency-validation-registry`)
- `post-3.md` (`automated-qa-visual-regression-testing`)

### 8.2 Migration Script (`scripts/migrate-blogs-to-turso.py`)
A Python migration script connects to Turso via `libsql-client`:
1. Reads and parses frontmatter from `src/content/blog/*.md`.
2. Inserts rows into the `blog_posts` table with `status = 'published'`.
3. Verifies row counts and slug integrity.

### 8.3 Dual-Engine Fallback (Zero Downtime)
If the FastAPI backend is temporarily unavailable or during offline local development, the frontend loader transparently falls back to bundled static posts from `import.meta.glob`, ensuring zero downtime or broken routes.

---

## 9. Reconciliation with Parked JSON-Import PR (PR #37)

- **PR #37 ([`docs/PRD-V2.1-json-content-import.md`](https://github.com/kuldeeplodha/kuldeep-portfolio/pull/37)):**
  Governs **structured resume config** (`PortfolioConfig`: profile, experience timeline, skills, education, role themes, philosophy, metrics).
- **PRD-006 (V2.2 Content Authoring):**
  Governs **dynamic narrative content** (`blog_posts`, `case_studies`, `media_assets`) stored in Turso.
- **Reconciliation Decision:**
  **PR #37 is NOT superseded.** Structured resume data continues to live in `src/config/*.ts` and local drafts. In V2.2, the JSON Import/Export capability folds cleanly into `/admin` under a dedicated **"Config Backup & Restore"** tab.

---

## 10. Phased Build Plan & Acceptance Criteria

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Backend Scaffold, Turso Database & JWT Auth (Dev / Alex)      │
│ - Deploy FastAPI scaffold to Vercel (api/index.py, vercel.json)        │
│ - Configure Turso database connection & execute D1/Turso SQL schema    │
│ - Implement /api/auth/login and /api/auth/verify (JWT bearer token)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Admin Authoring UI & Cloudinary Media Upload (Dev / Sunanda)  │
│ - Implement Cloudinary signed upload endpoint (/api/admin/media/sign)  │
│ - Build Admin Blogs & Case Studies tabs in /admin with live preview    │
│ - Drag-and-drop Cloudinary media upload and markdown insertion         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Public IA, Read Pages & Role Theme Inheritance (Dev / Oscar)  │
│ - Homepage 3+3 showcase strips (Latest Case Studies + Latest Blogs)    │
│ - Dedicated archive pages (/blog and /case-studies) with tag search    │
│ - Individual reader views (/blog/:slug and /case-studies/:slug)        │
│ - Mount <RoleThemeSync> and update links to preserve ?role=            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Blog Migration, Cutover & End-to-End Verification (QA / All)  │
│ - Execute migration script to seed existing 3 markdown blogs into Turso│
│ - Test dual-engine static fallback mechanism                           │
│ - Automated QA pass (Imagine QA, Peter Security, Vitest & Playwright)  │
└────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 Acceptance Criteria (Backend, DB & Auth)
- [ ] **AC-1.1:** FastAPI deploys cleanly to Vercel serverless environment with cold start < 1s.
- [ ] **AC-1.2:** Turso database tables (`blog_posts`, `case_studies`, `media_assets`) initialized and verified.
- [ ] **AC-1.3:** `POST /api/auth/login` verifies admin credentials and issues valid JWT bearer token.
- [ ] **AC-1.4:** Protected admin endpoints strictly return HTTP 401 on missing or invalid JWT.

### Phase 2 Acceptance Criteria (Admin UI & Media Upload)
- [ ] **AC-2.1:** Admin can create, edit, draft, publish, and delete blog posts with full metadata in `/admin`.
- [ ] **AC-2.2:** Admin can create, edit, draft, publish, and delete case studies with structured sections in `/admin`.
- [ ] **AC-2.3:** Markdown editor includes split-view live preview matching site typography.
- [ ] **AC-2.4:** `GET /api/admin/media/sign` generates valid Cloudinary upload signature.
- [ ] **AC-2.5:** Drag-and-drop upload places images/videos into Cloudinary and inserts markdown link at cursor. Files >50 MB trigger embed warning.

### Phase 3 Acceptance Criteria (Public IA & Theme Inheritance)
- [ ] **AC-3.1:** Homepage displays latest 3 Case Studies and latest 3 Blogs with correct role-based filtering.
- [ ] **AC-3.2:** Dedicated archives `/blog` and `/case-studies` list all published items with tag filtering and search.
- [ ] **AC-3.3:** Reader routes `/blog/:slug` and `/case-studies/:slug` render full formatted content.
- [ ] **AC-3.4:** Draft posts are strictly inaccessible to public visitors.
- [ ] **AC-3.5:** Navigating from homepage into archive or detail pages preserves `?role=`; theme tokens adapt seamlessly.

### Phase 4 Acceptance Criteria (Migration, Fallback & QA)
- [ ] **AC-4.1:** Migration script successfully seeds all 3 existing markdown blogs into Turso with matching slugs.
- [ ] **AC-4.2:** Frontend seamlessly falls back to static bundled posts if backend is offline.
- [ ] **AC-4.3:** 100% card-free guarantee verified: GitHub Pages, Vercel Serverless, Turso, and Cloudinary all operate within free limits.
- [ ] **AC-4.4:** All pages pass WCAG 2.1 AA accessibility checks and Playwright visual regression suite.
