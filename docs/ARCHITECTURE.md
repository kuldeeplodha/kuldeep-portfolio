# Architecture

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** for styling
- **Framer Motion** for theme transitions
- **React Router** for URL-based role state
- **Vitest** for unit tests
- **GitHub Pages** for static deployment

## Principles

1. **Configuration-first**: UI components consume typed config; no hardcoded resume content in components.
2. **Role as a dimension**: `RoleId` drives theme, hero, metrics, experience ordering, and project filtering.
3. **Resume fidelity**: achievements track `sourceVariants` to preserve role-specific metrics without merging conflicting claims.
4. **Client-side AI**: Phase 1 uses keyword/pattern search over `aiKnowledge.ts`; designed for future LLM backend swap.

## Directory structure

```
src/
  config/       # All portfolio content (single source of truth)
  types/        # TypeScript interfaces
  hooks/        # useRole — role state + filtering
  lib/ai/       # Knowledge search (Phase 1 assistant)
  components/
    layout/     # Navbar, footer
    sections/   # Page sections
    ui/         # Reusable UI (RoleSwitcher, CareerPipeline)
  pages/        # Route-level pages
```

## Role switching flow

```
URL ?role=ai
  → useRole() parses RoleId
  → applies theme CSS variables
  → filters metrics, projects, experience achievements
  → Hero + sections re-render with motion
```

## Deployment

Static build only. No backend. GitHub Actions builds and deploys `dist/` to GitHub Pages.

## Agent ownership (hive)

| Agent role | Responsibility |
|------------|----------------|
| Product Architect (god) | Requirements, milestones, board |
| Content Architect | Resume normalization, config files |
| UX Designer | Design system, themes, motion |
| Frontend Engineer | Components, routing, accessibility |
| AI Engineer | Ask Kuldeep, knowledge base |
| Config/CMS Engineer | Admin panel, export/import |
| QA Engineer | Tests, a11y, responsive |
| DevOps Engineer | CI/CD, GitHub Pages |
