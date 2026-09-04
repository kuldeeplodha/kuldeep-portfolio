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
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run unit tests with V8 coverage + enforce the coverage floor |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | Oxlint |

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

For production (GitHub Pages), add a repository secret named
`VITE_ADMIN_PASSWORD_HASH` with that same hex digest; the deploy workflow picks
it up at build time. Until the secret exists, `/admin` shows "Admin not
configured" and stays disabled.

> **Note:** On a static GitHub Pages site this remains a client-side gate. Hashing keeps your password out of the bundle, but it is deterrence-grade — not true server authentication. Do not treat it as such and do not store sensitive data behind it.

## Architecture

See `docs/ARCHITECTURE.md` and `docs/CONTENT_MODEL.md`.

## Future work

- [x] Admin configuration panel with export/import (password-protected at `/admin`)
- [x] Research Lab section with distinctive visuals
- [x] Skills visualization (clusters, not percentages)
- [x] E2E tests with Playwright
- [ ] Serverless LLM backend abstraction
- [ ] Remaining admin tabs (skills, education, certifications, research, aiKnowledge)
