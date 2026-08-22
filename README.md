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

The configuration panel at `/admin` is password-protected. Set your password in `.env.local`:

```bash
cp .env.example .env.local
# Edit VITE_ADMIN_PASSWORD in .env.local
```

Restart the dev server after changing env vars. The admin link is not shown in the public navbar — navigate directly to `/admin`.

> **Note:** On a static GitHub Pages site, this is a client-side gate only. It keeps casual visitors out but is not cryptographically secure. Do not treat it as true server authentication.

## Architecture

See `docs/ARCHITECTURE.md` and `docs/CONTENT_MODEL.md`.

## Future work

- [x] Admin configuration panel with export/import (password-protected at `/admin`)
- [x] Research Lab section with distinctive visuals
- [x] Skills visualization (clusters, not percentages)
- [x] E2E tests with Playwright
- [ ] Serverless LLM backend abstraction
- [ ] Remaining admin tabs (skills, education, certifications, research, aiKnowledge)
