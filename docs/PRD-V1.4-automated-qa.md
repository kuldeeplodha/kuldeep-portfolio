# PRD-003: V1.4 Automated QA — Coverage, Visual Regression, A11y Reporting & Performance Budgets

- **Document Version:** 1.0.1 (reconciled against Kelly's measured research 2026-09-04)
- **Status:** APPROVED (ADR-005) — coverage floors (§3.1) pending ADR-005 amendment per measured baseline
- **Author:** Maya (`maya-mt5yw3ix`), Product Manager
- **Stakeholders:** Kuldeep (`god`), Kelly (`kelly-mt5wqij5`), Sunanda (`sunanda-mt4huhsn`), Oscar (`oscar-mt4jlfpf`), Imagine (`imagine-mt4lmpk8`), Peter (`peter-mt4lojhs`)
- **Target Release:** V1.4
- **Related:** PRD-002 (V1.3), ADR-005 (docs/decisions/ADR-005-automated-qa-v1.4.md), Research docs/research/automated-qa-v1.4.md (MEASURED), QA_REPORT.md, CICD_PLAN.md

> **DURABILITY NOTE:** This is the authoritative copy. The working-tree copy at docs/PRD-V1.4-automated-qa.md and docs/decisions/ADR-005-automated-qa-v1.4.md were lost to shared-worktree branch churn (created untracked, wiped by another agent's checkout/clean). god to commit both to `main` (alongside PRD-V1.3/ADR-004) so they are durable. Do NOT recreate them as untracked files in an active feature branch's working tree — they just get lost again.

---

## 1. Executive Summary

### 1.1 Background & Problem Statement
The portfolio has a working automated-test baseline: **7 Vitest suites** (124 tests) and **2 Playwright e2e specs** (`portfolio.spec.ts`, `accessibility.spec.ts`) across `chromium` + `mobile-chrome`, with `@axe-core/playwright` wired for WCAG 2.1 AA scans (4 pages × 2 viewports). CI runs `lint → typecheck → test → test:e2e → build` on every PR; the Pages deploy repeats it on `main`.

Structural gaps that let regressions ship: (1) no coverage floor; (2) no visual regression; (3) axe is pass/fail only, no persisted report/trend; (4) no performance budgets (entry ~106 KB gzip already); (5) thin CI failure artifacts.

### 1.2 Objectives
1. Enforce a coverage floor + expand coverage of high-risk modules.
2. Visual regression via Playwright screenshots across viewports and **role themes**, deterministic capture.
3. Automated a11y reporting — persist axe results (JSON) + PR job-summary aggregate, keep the serious/critical gate.
4. Performance budgets — per-asset gzip budgets (fail-on-regression) + Lighthouse CI on key routes.
5. Harden CI artifacts.
6. **Zero new runtime deps** (all dev/CI-only).

### 1.3 Non-Goals
Cross-browser beyond Chromium; load/stress/synthetic-monitoring; app refactors except for testability/determinism; new product features.

---

## 2. Workstreams & Scope

### WS-1 — Coverage Enforcement & Expansion (`T-QA-7`, Sunanda)
- `@vitest/coverage-v8` (dev-only), `npm run test:coverage` (lcov + text-summary), CI floor that fails below threshold, HTML artifact.
- **Measured baseline (Kelly):** statements 60.16% / branches 51.53% / functions 47.29% / lines 60.56%. validationRegistry.ts branch = 71.2%. Biggest drag: AdminPage.tsx 39%, HomePage.tsx 0% (both e2e-covered only).
- **Two-phase floors (see §3.1):** Phase A locks floors just below current measured; Phase B authors targeted suites (validationRegistry→90% branch, exportImport, useRole) then ratchets. Consider excluding e2e-only view shells (HomePage/AdminPage) from the unit-coverage denominator.

### WS-2 — Visual Regression Testing (`T-QA-8`, Imagine)
- Playwright `toHaveScreenshot`; baselines generated **and compared only inside the official Playwright Docker image** (CI = sole source of truth; mac/local view-diff-only). ADR-005 Q1.
- **Theme correction (Kelly):** there is **no light/dark toggle and no theme localStorage key**. Themes are **role-driven** via the `?role=software|ai|data|system` URL param (`data-role` attr + CSS vars in `useRole.ts`). Capture each theme with `page.goto('/?role=ai')` — a fresh load mounts in-theme and does **not** fire the 450 ms role transition. Cover ≥1 light-family role (`data`) and ≥1 dark-family role (`software`/`ai`).
- **Oscar coordination item (corrected):** NOT a localStorage key — add `<MotionConfig reducedMotion="user">` in `main.tsx`. framer-motion (^13, ~11 animation sites) animates via inline JS that Playwright's `animations:'disabled'` does NOT stop and that ignores `prefers-reduced-motion` unless the app opts in. This one change stills all framer animation for stable VR and is a genuine a11y win.
- Determinism: reduced-motion via MotionConfig, pinned `deviceScaleFactor`/locale/tz, font readiness, mask dynamic regions, `maxDiffPixelRatio ≤ 0.01`.
- Targets: homepage hero, role variants, projects section, a project case-study page, admin login, admin config panel × Desktop Chrome + Pixel 5 × role themes.

### WS-3 — Automated Accessibility Reporting (`T-QA-9`, Imagine)
- Serialize full `AxeResults` (violations + passes + **incomplete**) to `test-results/a11y/*.json` per page/viewport; aggregate Markdown to `$GITHUB_STEP_SUMMARY` + upload JSON artifact.
- Keep serious/critical **hard-fail**; moderate/minor **report-only**; report `incomplete` (needs manual review) with a warn marker but **NEVER gate on it** (would be flaky).

### WS-4 — Performance Budgets (`T-QA-10`, Sunanda/Alex)
- **Bundle:** bespoke ~30-line Node `zlib.gzipSync` CI script (NO `size-limit` dep) comparing dist gzip vs a committed budget file, warn at 90%, fail on breach.
- **Lighthouse:** `@lhci/cli` (~0.15.x), `staticDistDir: ./dist`, thresholds in `lighthouserc.js`, on `/`, a project page, `/admin`. **`numberOfRuns: 1`** in a **parallel `perf` job** to stay under the +4 min CI ceiling.

---

## 3. Acceptance Criteria (measured-reconciled)

### 3.1 Coverage (WS-1) — PENDING ADR-005 amendment
- **AC-1.1** `npm run test:coverage` produces lcov + text summary.
- **AC-1.2 (REVISED):** Two-phase. **Phase A** CI floor set just below current measured baseline (proposed: statements 58% / branches 50% / functions 45% / lines 58%) so CI does not fail on the first PR. **Phase B** authors targeted suites then ratchets floors upward via ADR note (never down). *(Supersedes the original 80/80/75/70 which is unreachable at the measured 60/51/47/60 baseline — needs god sign-off as an ADR-005 amendment.)*
- **AC-1.3 (REVISED):** `validationRegistry.ts` reaches **≥ 90% branch** in Phase B (currently 71.2%).
- **AC-1.4** Coverage HTML artifact uploaded every run.

### 3.2 Visual Regression (WS-2)
- **AC-2.1 (REVISED):** ≥ 8 committed baselines across 2 viewports × **≥2 role themes (≥1 `data`-light + ≥1 `software`/`ai`-dark)**.
- **AC-2.2** A deliberate visual change fails the job; diff images produced.
- **AC-2.3** 3 consecutive CI runs on unchanged tree → zero false diffs; `maxDiffPixelRatio ≤ 0.01`.
- **AC-2.4** Documented `--update-snapshots` (CI/Docker only) + CI-authoritative baseline policy.

### 3.3 A11y Reporting (WS-3)
- **AC-3.1** Structured axe JSON (incl. incomplete) under `test-results/a11y/`.
- **AC-3.2** Aggregated summary to job summary + artifact.
- **AC-3.3** serious/critical still fail CI; incomplete never gates.

### 3.4 Performance Budgets (WS-4)
- **AC-4.1 (REVISED — measured + 10% headroom):** per-asset gzip budgets: **entry index.js 120 KB** (measured 105.89), **validationRegistry 33 KB** (28.13), **AdminPage 19 KB** (16.22), **total-JS 175 KB** (~151.6), **CSS 12 KB** (9.11); warn at 90%; hard-fail on breach. *(Supersedes placeholder 160/20 KB.)*
- **AC-4.2** Lighthouse on 3 routes: Perf ≥ 0.90, A11y ≥ 0.95, BP ≥ 0.95; LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms (mobile). Perf metrics **soft-warn first cycle**, ratchet to hard-fail after (ADR-005 Q4).
- **AC-4.3** Breach fails PR with actionable diff; Lighthouse report artifact.

### 3.5 CI Health
- **AC-5.1** Playwright HTML report + traces on failure.
- **AC-5.2** Added CI wall-clock ≤ +4 min (Lighthouse is the only threat → parallel job + `numberOfRuns:1`; defer to V1.5 only if a measured run breaches).
- **AC-5.3** New jobs green on main; zero new flake over a 5-run soak.

---

## 4–9
User stories, technical approach, NFRs, rollout (WS-1→WS-3→WS-4→WS-2), open questions, DoD: unchanged from v1.0.0 except the measured reconciliations above. Zero new runtime deps. Each workstream ships as its own PR through the standard gate (CI + Imagine QA + Peter Security + god merge).
