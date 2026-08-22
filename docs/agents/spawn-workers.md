# Spawn worker briefs (ephemeral)

These workers are requested via `hive/spawn-requests/`. They spawn when Autonomy & Budgets → worker spawn is enabled.

---

## worker-content — Content Architect

**Objective:** Audit and enrich portfolio config from three resumes without inventing facts.

**Tasks:**
1. Read `resume-extracts/{software,ai_ml,data_analyst}.txt`
2. Compare against `src/config/*.ts` — list gaps and conflicts
3. Expand `aiKnowledge.ts` with education, certifications, career-direction entries
4. Update `docs/CONTENT_MODEL.md` with any new conflict findings
5. Add placeholder comments for missing LinkedIn/GitHub (do not invent URLs)

**Acceptance:** All facts traceable to resume extracts; no new companies/metrics invented.

---

## worker-ai — AI Engineer

**Objective:** Harden Ask Kuldeep and prepare LLM backend abstraction.

**Tasks:**
1. Create `src/lib/ai/provider.ts` — interface: `search(query) → answer`
2. Refactor `knowledgeSearch.ts` as `ClientSearchProvider` implementing interface
3. Add stub `ServerLLMProvider` (throws "not configured" — for future serverless)
4. Expand unit tests for edge cases (empty query, multi-match, no-match fallback)
5. Document future architecture in `docs/AI_ARCHITECTURE.md`

**Acceptance:** No API keys in frontend; tests pass; Ask Kuldeep unchanged for users.

---

## worker-cms — Configuration / CMS Engineer

**Objective:** Extend admin panel to edit full portfolio config.

**Tasks:**
1. Add tabbed admin UI: Profile | Experience | Projects | Skills | Education | Certs | Research
2. Form validation per section (required fields, email format)
3. Export full `PortfolioConfig` JSON; import with schema validation
4. Unsaved-changes indicator; reset to defaults
5. Preview mode (optional): open `/` in new tab with draft from localStorage

**Acceptance:** Export/import round-trip works; no server persistence claims.

---

## worker-qa — QA Engineer

**Objective:** Final quality pass before deployment.

**Tasks:**
1. Add axe-core accessibility tests in Vitest or Playwright
2. E2e: resume download per role, all 4 role themes, contact mailto
3. Content validation script: no empty required fields in config
4. Link checker for internal routes and configured external URLs
5. Write `docs/QA_REPORT.md` with pass/fail checklist

**Acceptance:** All tests green; QA report committed.

---

## worker-devops — DevOps Engineer

**Objective:** Deploy to GitHub Pages.

**Tasks:**
1. `git commit` portfolio (if not committed)
2. Create GitHub repo `kuldeep-portfolio` (or user-specified name)
3. Push to `main`; enable GitHub Pages via Actions
4. Verify production build with `VITE_BASE_PATH=/<repo>/`
5. Update `index.html` canonical URL, `sitemap.xml`, README deploy section

**Acceptance:** Live URL loads; CI green on push.

**Blocker:** Needs GitHub credentials / user approval for repo creation.
