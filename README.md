# Kuldeep Lodha — Interactive AI Engineering Portfolio

A configuration-driven, role-switching portfolio built with React, TypeScript, and Vite.

## Features (Phase 1 foundation)

- **4 role perspectives**: Software Engineer, AI/ML, Data Analyst, System View
- **URL-based role selection**: `/?role=software`, `/?role=ai`, `/?role=data`
- **Configuration-first architecture**: all resume content in `src/config/`
- **Ask Kuldeep**: client-side knowledge search (no API keys)
- **Role-specific themes**, metrics, experience emphasis, and projects
- **Career pipeline** visual: Software → Data → ML → AI

## Local development

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (`tsc -b && vite build`) |
| `npm run test` | Run Vitest unit suites |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright end-to-end + accessibility specs |
| `npm run test:coverage` | Vitest with V8 coverage + enforced coverage floors |
| `npm run typecheck` | TypeScript check (`tsc -b --noEmit`) |
| `npm run lint` | Oxlint |

Coverage floors and the rest of the automated-QA gates (a11y reporting, gzip
performance budgets, visual regression) are documented in
[`docs/AUTOMATED_QA.md`](docs/AUTOMATED_QA.md).

## GitHub Pages deployment

Set the base path when building:

```bash
VITE_BASE_PATH=/kuldeep-portfolio/ npm run build
```

Deploy the `dist/` folder via GitHub Actions (workflow in `.github/workflows/deploy.yml`).

## Configuration

All portfolio content lives in `src/config/`:

- `profile.ts` — name, contact, links
- `roles.ts` — role switcher config, hero copy, highlights
- `themes.ts` — color tokens per role
- `experience.ts` — work history with role-specific achievements
- `projects.ts`, `skills.ts`, `education.ts`, `aiKnowledge.ts`

**Resume PDFs** should be placed in `public/resumes/`:
- `software-engineering.pdf`
- `ai-ml.pdf`
- `data-analyst.pdf`

**Social links** (LinkedIn, GitHub) are placeholders until URLs are confirmed.

### Validation & storage

Config edited in the admin panel is validated in real time by a zero-dependency
**validation registry** (`src/lib/config/validationRegistry.ts`) with a two-tier
model: **errors** block Save/Export/Import, **warnings** are advisory. Drafts and
exports are wrapped in a versioned storage envelope
(`{ schemaVersion: 2, savedAt, config }`); a corrupt draft is quarantined and the
bundled default is restored. See
[`docs/CONFIG_VALIDATION.md`](docs/CONFIG_VALIDATION.md) for the contributor guide.

## Admin panel

The configuration panel at `/admin` is password-protected. The gate compares a
SHA-256 digest, so the public bundle only ever contains the hash — never your
plaintext password. Set it up in `.env.local`:

```bash
cp .env.example .env.local
# Generate a hash for your password, then edit VITE_ADMIN_PASSWORD_HASH in .env.local
echo -n 'your-password' | shasum -a 256
```

Restart the dev server after changing env vars. The admin link is not shown in the public navbar — navigate directly to `/admin`.

The panel edits all config sections through a single unified reducer
(`configDraftReducer`): add, duplicate, delete, and **accessible Move Up / Move
Down** reordering across every entity list, with live per-field validation, tab
badges showing error/warning counts, and debounced autosave. Deleting an entity
sweeps cross-references so role highlights never orphan.

For production (GitHub Pages), add a repository secret named
`VITE_ADMIN_PASSWORD_HASH` with that same hex digest; the deploy workflow picks
it up at build time. Until the secret exists, `/admin` shows "Admin not
configured" and stays disabled.

> **Note:** On a static GitHub Pages site this remains a client-side gate. Hashing keeps your password out of the bundle, but it is deterrence-grade — not true server authentication. Do not treat it as such and do not store sensitive data behind it.

## Architecture & docs

- `docs/ARCHITECTURE.md`, `docs/CONTENT_MODEL.md` — system overview & content model
- [`docs/CONFIG_VALIDATION.md`](docs/CONFIG_VALIDATION.md) — validation registry & storage lifecycle (V1.3)
- [`docs/AUTOMATED_QA.md`](docs/AUTOMATED_QA.md) — coverage, a11y reporting, perf budgets, visual regression (V1.4)
- `docs/decisions/` — ADRs (config panel V2, validation registry, automated QA)

## Future work

- [x] Admin configuration panel with export/import (password-protected at `/admin`)
- [x] Unified config reducer with full entity CRUD + accessible reordering
- [x] Zero-dependency real-time validation registry (V1.3)
- [x] Versioned storage envelope with quarantine recovery
- [x] Research Lab section with distinctive visuals
- [x] Skills visualization (clusters, not percentages)
- [x] E2E tests with Playwright
- [x] Automated QA V1.4: coverage floors + a11y reporting merged to main
- [~] Automated QA V1.4: gzip performance budgets & visual regression (in progress)
- [ ] Serverless LLM backend abstraction
- [ ] Remaining admin tabs (skills, education, certifications, research, aiKnowledge)
