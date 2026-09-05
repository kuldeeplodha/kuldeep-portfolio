# ADR-006: V1.5 Blog — Content Source, Rendering & Delivery Decisions

**Status:** Accepted
**Date:** 2026-09-05
**Deciders:** Kuldeep (god/architect), informed by blog research (Kelly). **No PRD input** — see Context.

## Context

V1.5 adds a markdown-driven blog: a list page and per-post detail pages, authored
as files in the repo, with no backend and no admin coupling.

`docs/research/blog-v1.5.md` (Kelly) is delivered and is the sole requirements
input. **`PRD-V1.5-blog.md` (PRD-004) does not exist** — Maya is on hold — so this
ADR breaks with the ADR-004/ADR-005 pattern of resolving a PRD's open-questions
section. It is authored from research alone. The PRD is to be backfilled and
reconciled against these decisions, in the same direction as PRD-V1.4 §3.1 was
reconciled against ADR-005 rather than the reverse: **where the backfilled PRD
disagrees with this ADR, the ADR wins until amended.**

Two claims in the research do not survive contact with the codebase and are
corrected below (Q1, Q4). They are corrected here rather than sent back because
both are mechanical facts about Vite, not product judgements, and blocking
implementation on a research revision would buy nothing.

Verified starting state: Vite 8 + React 19 + react-router-dom 7 SPA, Tailwind 4.
Routes are declared inline in `src/App.tsx` (`/`, `/projects/:projectId`,
`/admin`, `*`). Build is `tsc -b && vite build`. Deploy is GitHub Pages with the
base path injected via `VITE_BASE_PATH`. `public/` currently holds `robots.txt`
and `sitemap.xml`, and **no `404.html`**.

## Decisions

**Q1 — Content lives in `src/content/blog/*.md`, loaded with `import.meta.glob`: ACCEPTED (corrects research §2).**

```ts
const files = import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true })
```

The research recommends Approach A1 but describes it as *"posts in `/public/blog/*.md`;
Vite imports them as strings at build"*. Those are two mutually exclusive designs.
Anything under `public/` is copied verbatim into the output and served as a static
asset — Vite never processes it, so it cannot be globbed or bundled, and the only
way to read it is a runtime `fetch()`. The research's own cons column ("Vite
bundling size overhead — all .md → JS") describes the `src/` design, so `src/` is
what its rationale actually argues for.

Choosing `src/content/`:

- the post index is derived from the glob, so there is no hand-maintained manifest
  that can silently drift from the files on disk (under `public/` there is no way
  to list a directory at runtime, so a manifest would be mandatory);
- a bad slug or a deleted post is a **build** error, not a runtime 404;
- content is hashed and immutably cacheable, and rides the same code-split chunk
  as the blog route rather than adding a fetch waterfall on navigation.

Use `query: '?raw'`. The `as: 'raw'` spelling is deprecated in the Vite version
this repo is on.

Frontmatter (research §6.2) is parsed from the raw string. Do **not** add
`gray-matter` for this — it pulls a Buffer polyfill into the browser bundle. A
narrow front-matter split (`---` … `---`, `key: value`) is sufficient for the
fields the research defines, and belongs in `src/lib/`.

**Q2 — Renderer is `marked` + `DOMPurify`: ACCEPTED as researched, with two amendments.**

`marked` does not sanitize; DOMPurify is the correct pairing, and content being
first-party does not change that (a post is still HTML assembled from a file).

Amendments to the research §3.2 sketch:

- Call **`marked.parse(raw, { async: false })`**, not `marked(raw)`. The bare call
  is typed `string | Promise<string>` and silently becomes async if an extension is
  ever registered; a Promise stringifies into the DOM as `[object Promise]`.
- The `ALLOWED_TAGS` list must add `h1`, `br`, `hr`, `table`/`thead`/`tbody`/`tr`/
  `th`/`td`, and `del`, and `ALLOWED_ATTR` must add `class`. Without `class`,
  fenced code blocks lose their `language-*` hook and any later syntax
  highlighting silently renders unstyled. Tables and rules are ordinary markdown
  and their absence would strip content with no error.

Sanitize once at render, memoized per post. Never interpolate a post into
`dangerouslySetInnerHTML` without passing through the sanitizer.

**Q3 — Routes are `/blog` and `/blog/:slug`: ACCEPTED as researched.**

Added to the existing `<Routes>` block in `src/App.tsx`, matching the
`/projects/:projectId` precedent. New pages `src/pages/BlogPage.tsx` and
`src/pages/BlogDetailPage.tsx`, siblings of `ProjectDetailPage.tsx`.

Both blog routes are **lazily loaded** (`React.lazy` + `Suspense`) so `marked` +
DOMPurify (~13 KB gzipped) and every post body stay out of the homepage bundle.
This is what makes the size cost in Q1 acceptable.

An unknown slug renders the existing `NotFoundPage`, not an empty detail page.

**Q4 — SEO: a build-time prerender step, NOT accepting SPA no-SEO (corrects research §5.1).**

Research §5.1 states that *"Vite generates static HTML at build time"* and that
crawlers will fetch `dist/blog/post-slug.html`. This is false for this project.
`vite build` emits **one** `index.html` for an SPA; no per-route HTML exists. As
written, the proposed sitemap would advertise URLs that return a shell whose
`<title>` and description belong to the homepage, and every social share of a post
would preview as the portfolio root.

A blog on a portfolio exists to be found and shared, so accepting that is not
viable. A full SSG framework is disproportionate for the same reason A2/A3 were
rejected in the research — it would restructure the app for one feature.

**Decision: a `postbuild` Node script.** Slugs are already known at build time
(Q1), so for each post it writes `dist/blog/<slug>/index.html` — a copy of the
built `index.html` with `<title>`, `<meta name="description">`, canonical, and
OG/Twitter tags replaced from that post's frontmatter — plus `dist/blog/index.html`
for the list page.

Every post URL then returns **200 with correct, unique metadata**, which is what
social unfurlers (no JS execution at all) and crawl budget actually need. Body
content stays client-rendered, which is acceptable: crawlers that matter execute
JS, and the metadata that unfurlers need is now static.

Two constraints for the implementer:

- The canonical/OG URLs must be built from `VITE_BASE_PATH`. Hardcoding
  `https://kuldeeplodha.github.io/` breaks the moment the base path or domain
  changes, and a wrong canonical is worse than none.
- If DOMPurify is ever used inside this Node script, it needs an explicit
  `jsdom` window (`createDOMPurify(new JSDOM('').window)`) — it has no DOM in
  Node. Prefer keeping the script metadata-only so this does not arise.

`public/sitemap.xml` is extended with the blog URLs by the same script, so the
sitemap cannot drift from the posts that actually exist.

**Q5 — GitHub Pages deep links: copy `index.html` → `404.html` at build: ACCEPTED.**

GitHub Pages serves static files only and has no rewrite layer, so a direct hit on
a client-side route returns a hard 404. Pages serves `404.html` for any unmatched
path, so shipping a copy of the app shell there lets the router take over and
resolve the URL. Without it, every shared `/blog/:slug` link is broken for anyone
who does not arrive via in-app navigation — which is the entire purpose of Q3.

Q4's prerender already emits real files for known posts, so `404.html` is the
fallback for everything else (mistyped slugs, future routes) and remains
necessary. Both are emitted by the same `postbuild` script; `npm run build`
becomes `tsc -b && vite build && node scripts/postbuild.mjs`.

`404.html` must be committed-by-build, not by hand — a hand-maintained copy goes
stale against every asset-hash change and fails silently.

## Sequencing

1. `src/lib/` frontmatter parse + `import.meta.glob` loader, with unit tests (Q1).
2. `renderMarkdown` with the corrected `marked.parse` + DOMPurify allow-lists (Q2).
3. `BlogPage` / `BlogDetailPage`, lazy routes in `App.tsx` (Q3).
4. `scripts/postbuild.mjs` — prerender, sitemap, `404.html` (Q4, Q5).
5. 3–5 seed posts in `src/content/blog/`.

1–3 are independently testable under vitest. 4 needs an e2e assertion that
`dist/blog/<slug>/index.html` exists and carries that post's `<title>`; a unit test
cannot see it because it is a build artefact.

## Consequences

- Publishing a post requires a commit and a deploy. Accepted — this matches the
  config-first, static-first, no-backend philosophy, and monthly cadence does not
  justify live authoring. The A2/A3 admin-panel paths from the research remain
  open if that changes.
- `npm run build` grows a step and can now fail for a content reason (bad
  frontmatter, duplicate slug). This is the intended trade from Q1: fail at build,
  not in front of a reader.
- Post bodies are in the JS bundle rather than fetched. Bounded by lazy loading
  and by post count; revisit past ~50 posts, when a manifest-plus-fetch split
  starts to pay for its complexity.
- The DOMPurify allow-list is now a content constraint: a post using an HTML tag
  outside it renders stripped, with no error. Document the supported subset
  alongside the seed posts.
- PRD-004 remains unwritten. Implementation proceeds against this ADR. When Maya
  authors `PRD-V1.5-blog.md`, it must be reconciled against these five decisions,
  and any disagreement resolved by amending this ADR rather than by diverging in
  code.
