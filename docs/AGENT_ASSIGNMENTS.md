# Agent assignments — Kuldeep Portfolio

_Orchestrator: god · Repo: `kuldeep-portfolio` · CWD: `/Users/kuldeeplodha/Desktop/Kuldeep Guided Projects/kuldeep-portfolio`_

## Floor map

| # | Role | Agent ID | Status | Primary deliverables |
|---|------|----------|--------|-------------------|
| 1 | **Product Architect** | `god` | active | board.md, tasks.json, milestones, acceptance criteria, integration |
| 2 | **Content Architect** | `worker-content` (spawn) | queued | Resume audit, config enrichment, conflicting-metric doc |
| 3 | **UX / Visual Designer** | `sunanda-mt4huhsn` | on hold → assign | Design system polish, Research Lab visuals, motion |
| 4 | **Frontend Engineer** | `oscar-mt4jlfpf` | **active** | Component polish, a11y, responsive, case-study UX |
| 5 | **AI Engineer** | `worker-ai` (spawn) | queued | Expand aiKnowledge, LLM abstraction layer, retrieval tests |
| 6 | **CMS Engineer** | `worker-cms` (spawn) | queued | Full admin forms for experience/projects/skills |
| 7 | **QA Engineer** | `worker-qa` (spawn) | queued | a11y audit, Lighthouse, content validation, link checks |
| 8 | **DevOps Engineer** | `worker-devops` (spawn) | queued | GitHub push, Pages deploy, CI hardening |

## Already done (god — Phase 0–8)

- Scaffold, config model, all core sections, role switcher, Ask Kuldeep v1
- Admin panel (profile only), 11 unit + 12 e2e tests, CI workflow
- Resume PDFs in `public/resumes/`

## Parallel workstreams (remaining)

### Stream A — Polish & ship (Oscar + Sunanda)
- Oscar: accessibility pass, responsive breakpoints (320–1440), project case-study polish
- Sunanda: design system tokens doc, Research Lab visual upgrade, hero background motifs per role

### Stream B — Content & AI (spawn workers)
- Content: expand `aiKnowledge.ts`, add missing cert URLs as placeholders only, audit metrics
- AI: `lib/ai/provider.ts` abstraction (client search now, serverless later)

### Stream C — CMS depth (spawn)
- Admin forms for experience, projects, skills, education, certifications
- JSON export includes full config; import validation

### Stream D — Quality & deploy (spawn + god)
- QA: WCAG 2.1 AA checklist, axe-core tests, resume download e2e
- DevOps: create GitHub repo, push, verify Pages, update canonical URLs

## Collaboration rules

1. **Read before write** — inspect `docs/ARCHITECTURE.md` and existing `src/config/`
2. **No invented facts** — resumes in `resume-extracts/` and `public/resumes/` are source of truth
3. **Config-first** — content changes go in `src/config/`, not components
4. **Small commits** — one concern per commit; run `npm run test && npm run build` before done
5. **Report to god** — `inform` message when your task is complete; `query` if blocked

## Acceptance per agent

See `docs/agents/*.md` for individual briefs.
