# V1.4 Automated QA — Technical Research & Determinism Validation

**Author:** Kelly (Research Lead, `kelly-mt5wqij5`) · **Date:** 2026-09-04 · **Task:** T-RES-2
**Conversation:** conv-v1-4-automated-qa · **Validates:** [PRD-003](../PRD-V1.4-automated-qa.md) (Maya)
**Status:** Complete — all four workstreams validated against **real, measured** repo data (build gzip sizes + live coverage run on `main`+V1.3). Recommendations ready for architect (`god`) sign-off on the §8 open questions.

> **How to read this:** Every number below is measured, not estimated. Build measured via `npm run build` (vite gzip column); coverage measured via `@vitest/coverage-v8` on the current tree (124 tests, 7 suites, all passing). Where PRD-003 used placeholders, this doc supplies the actual figure and a recommended budget with headroom.

---

## 0. Headline findings (TL;DR for reviewers)

1. **Visual regression → Playwright `toHaveScreenshot` confirmed.** No external SaaS. Determinism recipe defined below; **CI/Linux must be the baseline source of truth** (containerized). `maxDiffPixelRatio: 0.01` recommended (matches AC-2.3).
2. **Theme is NOT light/dark — it's ROLE-driven via a URL query param** (`?role=software|ai|data|system`), applied as `data-role` + CSS custom properties in `useRole.ts`. This is *better* than a localStorage toggle for determinism: drive it by `page.goto('/?role=ai')`. **No localStorage key exists to coordinate with Oscar** — but there IS a framer-motion coordination item (see §2.3).
3. **Coverage floors in PRD-003 are unreachable today.** Measured baseline: **statements 60.16%, branches 51.53%, functions 47.29%, lines 60.56%**. PRD's 80/80/75/70 floors would **fail CI immediately**. Recommend a two-phase floor (lock baseline now, ratchet after test expansion). `validationRegistry.ts` is at **71.19% branch** vs the AC-1.3 **90%** target — reachable but needs ~15–20 targeted branch tests.
4. **Performance budget placeholders were close but too tight.** Measured **total JS gzip ≈ 151.6 KB** vs PRD's 160 KB cap → only ~8 KB headroom (breach-prone). Measured **CSS gzip = 9.11 KB** vs PRD's 20 KB (over-generous). Recommend **per-asset** budgets (below), not one lumped number.
5. **Bundle checker → bespoke ~30-line zlib inspector**, not `size-limit`. Truly zero-dep, and vite already computes gzip for us to assert against.
6. **CI wall-clock risk is Lighthouse.** Coverage + visual + a11y-report add little; LHCI's default 3-runs-per-route is the +4 min threat (AC-5.2). Mitigation: run `perf` as a **parallel job** and cap LHCI `numberOfRuns`.

---

## 1. WS-1 — Coverage Enforcement (measured baseline & realistic floors)

### 1.1 Measured baseline (current tree, 124 tests passing)

| Metric | Current | PRD-003 floor (AC-1.2) | Gap |
|---|---|---|---|
| Statements | **60.16%** (941/1564) | 80% | −19.8 |
| Branches | **51.53%** (723/1403) | 70% | −18.5 |
| Functions | **47.29%** (210/444) | 75% | −27.7 |
| Lines | **60.56%** (874/1443) | 80% | −19.4 |

**Per-module (priority targets):**

| Module | Stmts | Branch | Func | Lines | Note |
|---|---|---|---|---|---|
| `lib/admin/configReducer.ts` | 94.7% | 76.7% | 100% | 98.4% | Strong (V1.2 work) |
| `lib/admin/auth.ts` | 92.3% | 90% | 87.5% | 95.2% | Strong |
| `lib/config/validationRegistry.ts` | 74.7% | **71.2%** | 84.2% | 75.3% | **AC-1.3 wants ≥90% branch → +19pt** |
| `lib/config/exportImport.ts` | 64.9% | 52.1% | 84.2% | 65.3% | Mid — quarantine/import paths uncovered |
| `hooks/useRole.ts` | 78.3% | 41.7% | 81.0% | 81.0% | Branch-poor (role-filter branches) |
| `pages/AdminPage.tsx` | **39.0%** | 36.7% | 24.2% | 38.0% | **Biggest global drag** (~2000 lines, e2e-covered only) |
| `pages/HomePage.tsx` | **0%** | 100% | 0% | 0% | Unit-untested (e2e-covered only) |
| `lib/admin` (dir) | 94.2% | 83.6% | 96.8% | 97.0% | Healthy |
| `lib/ai` (dir) | 90.5% | 88.2% | 87.5% | 89.2% | Healthy |

**Root cause of the global gap:** the well-tested logic (`lib/admin`, `lib/ai`) is dragged down by **page components tested only through e2e** — `AdminPage.tsx` (39%) and `HomePage.tsx` (0%) alone account for most of the shortfall. v8 coverage counts these as unit-uncovered even though Playwright exercises them.

### 1.2 Recommendation — two-phase floor (do NOT enforce 80/80/75/70 on day one)

Enforcing PRD-003's floors immediately turns CI red on the first PR. Instead:

- **Phase A (WS-1 PR #1 — lock the baseline):** set enforced floors just **below** measured current so no regression can slip and no false red:
  `statements 58, branches 50, functions 45, lines 58`. Emit `lcov` + `text-summary`, upload HTML report (AC-1.4). This satisfies the *intent* of AC-1.2 (a real gate) immediately.
- **Phase B (WS-1 PR #2 — climb & ratchet):** author the targeted suites, then raise floors toward the PRD targets. Realistic reach in one focused pass:
  - `validationRegistry.ts` branch 71→**≥90%** (AC-1.3) — enumerate each rule's pass/fail/skip branch + `isValidSafeUrl` edge cases. Highest-value, self-contained.
  - `exportImport.ts` — cover import/quarantine/migration branches (currently 52% branch).
  - `useRole.ts` — cover role-filter branches (currently 42% branch): each role × highlighted-vs-relevant fallbacks.
  - Consider **excluding pure e2e-only page shells** (`HomePage.tsx`, large `AdminPage.tsx` view code) from the unit-coverage denominator via `coverage.exclude`, OR add focused component tests — decide per module. Excluding e2e-covered view code is legitimate and lets the *logic* floors reach 80% honestly.
- **ADR required** (NFR-4): record the initial floors and the ratchet policy; floors go up via ADR, never silently down.

**Config (dev-only):** `@vitest/coverage-v8` (I verified it installs and runs cleanly against Vitest 4.1.11 — measured above). Add `test:coverage` script + `coverage: { provider: 'v8', reporter: ['text-summary','lcov','html'], thresholds: {…}, exclude: […] }` in `vite.config.ts`. **CI cost ≈ +2s** (coverage instrumentation over the existing `vitest run`) — negligible against AC-5.2.

---

## 2. WS-2 — Visual Regression (determinism recipe & theme mechanism)

### 2.1 Tool choice — confirmed: Playwright built-in `toHaveScreenshot()`

Reconfirmed against the alternatives. For a solo, static, Chromium-only (per Non-Goals) portfolio already running Playwright in CI:

| Option | Cost | Verdict |
|---|---|---|
| **Playwright `toHaveScreenshot`** | $0, baselines in-repo | ✅ **Confirmed** |
| Percy | from ~$599/mo, pixel-diff, higher false-positives | ❌ Overkill |
| Chromatic | from ~$179/mo, **Storybook-only** (we have none) | ❌ Wrong tool |
| Argos | ~$100/mo, reuses Playwright screenshots, nice PR UI | ⚠️ Optional future upgrade only if review UX hurts |

### 2.2 Theme determinism — **corrects a PRD assumption**

PRD-003 (WS-2, §5) says "drive light/dark via the app's existing theme mechanism (confirm selector/localStorage key with Oscar)." **Measured reality (`src/hooks/useRole.ts`):** there is **no light/dark toggle and no theme localStorage key**. Themes are **role themes** selected by the `?role=` URL search param:

- Roles: `software | ai | data | system` (default `system` = no param).
- `useRole` sets `document.documentElement[data-role]`, `[data-layout]`, and `--color-*` CSS custom properties; also `document.body` bg/color.
- Switching roles happens via `setSearchParams` (URL), **not** localStorage.

**Implication (a determinism win):** capture each theme by loading the URL directly — `page.goto('/?role=software')`, `?role=ai`, `?role=data`, and `/` (system). A **fresh page load mounts already in the target theme** and, crucially, **does not fire the role-transition animation** (that 450ms `isTransitioning` timeout in `useRole` only triggers on in-session `setRole`, not on initial mount). So per-theme baselines via direct navigation are inherently transition-free and stable — no localStorage seeding, no coordination of a theme key with Oscar needed.

> **AC-2.1 note:** PRD says "2 themes (light/dark)". Recommend re-scoping to **role themes** — snapshot at least `system` + one dark role (`software`/`ai`) + the light role (`data` uses a light palette, `#f8fafc` bg). 2 viewports × ≥2 role themes × key pages still comfortably yields the ≥8 baselines AC-2.1 requires. Flag to Maya to reword AC-2.1/§5 from "light/dark" to "role themes (incl. at least one light + one dark palette)."

### 2.3 The real determinism risk: **framer-motion (JS-driven), not CSS**

Measured: framer-motion `^13.1.1` is used in **6 files / 11 motion sites** (`Hero`, `RoleSwitcher`, `RoleTransition`, `CareerPipeline`, `ResearchLabSection`), wrapped in `<LazyMotion features={domAnimation}>` in `main.tsx` — **with no `reducedMotion` config**.

This matters: Playwright's `toHaveScreenshot({ animations: 'disabled' })` freezes **CSS** animations/transitions and waits for web fonts — but framer-motion animates via **inline JS style updates**, which `animations:'disabled'` does **not** stop, and which do **not** honor `prefers-reduced-motion` unless the app opts in (framer's default is `reducedMotion:"never"`).

**Recommended determinism recipe (central Playwright fixture):**
1. **App-side (coordinate with Oscar — small, genuine a11y win):** wrap the tree in `<MotionConfig reducedMotion="user">` in `main.tsx`. Then Playwright emulating `prefers-reduced-motion: reduce` instantly stills every framer animation to its end-state. *This is the single most important step for VR stability* and improves real-user a11y. **← Oscar coordination item (replaces the non-existent localStorage-key item).**
2. `use: { reducedMotion: 'reduce' }` in a dedicated visual project (emulates the media feature).
3. `toHaveScreenshot({ animations: 'disabled' })` — kills CSS animation/transition + waits fonts.
4. **Fallback if (1) is deferred:** `page.addStyleTag` injecting `*,*::before,*::after{animation:none!important;transition:none!important}` **and** wait a fixed settle (`page.waitForTimeout` past 450ms) — cruder, and won't fully still framer transforms, so (1) is strongly preferred.
5. **Pin the environment** in the visual project's `use`: `deviceScaleFactor` (Pixel 5 preset already sets it; pin desktop to 1), `locale: 'en-US'`, `timezoneId: 'UTC'`, `colorScheme` unused (role-driven), viewport from the two existing projects.
6. **Font readiness:** Playwright auto-waits fonts; additionally `await page.evaluate(() => document.fonts.ready)` before first snapshot to be safe.
7. **Mask nondeterministic regions:** `mask:` any live/date/random content. The `HeroBackground`/`ResearchLabSection` may have generative visuals — mask or seed them; verify with Oscar which are deterministic.
8. **Network:** content is static (no runtime fetch in the shipped bundle — AI provider is stubbed), so no network stubbing strictly needed, but `page.route` block any analytics/font-CDN calls to remove that variable. **Fonts:** if self-hosted, deterministic; if from a CDN, either self-host for CI or accept `document.fonts.ready` gating.

### 2.4 CI baselines: Linux is the source of truth — confirmed

Cross-OS font hinting/anti-aliasing differs (mac dev vs Ubuntu runner); Playwright already suffixes baselines `*-chromium-linux.png`. **Commit only Linux baselines**, generated in the **official Playwright container** (`mcr.microsoft.com/playwright:vX.Y.Z-jammy`, pinned to the installed Playwright version) so dev updates match CI byte-for-byte. Local runs are **advisory only** (answers PRD Q1: yes, accept the containerized-baseline operational cost).

- npm script `test:e2e:update-visual` documented as **"Docker only"**.
- Baselines under `e2e/__screenshots__/`; PRs render image diffs inline.
- On the visual job, upload the Playwright HTML report + diff PNGs as artifacts **on failure** (AC-5.1, AC-2.2).
- **`maxDiffPixelRatio: 0.01`** documented (AC-2.3) — conservative; do NOT loosen to force green (hides real regressions). Run the 3× soak (AC-2.3) after the recipe lands to prove flake=0.

**CI cost:** visual specs ride the existing `test:e2e` job (same preview server). Extra ~snapshot compares are fast; expect **+30–90s** depending on target count. Within budget.

---

## 3. WS-4 — Performance Budgets (measured gzip sizes & real budgets)

### 3.1 Measured production build (gzip = actual transfer size)

From `npm run build` (vite's own gzip column):

| Asset | Raw | **Gzip** | Loaded when |
|---|---|---|---|
| `index-*.js` (entry) | 341.92 KB | **105.89 KB** | Every visitor |
| `validationRegistry-*.js` | 95.87 KB | **28.13 KB** | Lazy — `/admin` only |
| `AdminPage-*.js` | 80.84 KB | **16.22 KB** | Lazy — `/admin` only |
| `ProjectDetailPage-*.js` | 3.42 KB | **1.04 KB** | Lazy — project pages |
| `rolldown-runtime-*.js` | 0.58 KB | **0.36 KB** | Every visitor |
| **Total JS** | ~522 KB | **≈ 151.6 KB** | (sum of all chunks) |
| `index-*.css` | 52.01 KB | **9.11 KB** | Every visitor |
| `index.html` | 2.39 KB | 0.91 KB | Every visitor |

**Public-visitor JS (what a non-admin actually downloads):** entry + runtime + (on a project page) ProjectDetailPage ≈ **106.3–107.3 KB gzip**. The 44 KB of admin chunks (`validationRegistry` + `AdminPage`) are **lazy** and never hit for public visitors.

### 3.2 Budget recommendation — per-asset, not one lumped number

PRD-003's placeholders: total JS gzip ≤ 160 KB, CSS ≤ 20 KB.
- **160 KB total-JS is breach-prone:** measured 151.6 → only **~8.4 KB (5.5%) headroom**. A single mid-size util import would trip it. And a lumped total conflates lazy admin code with the visitor-critical entry.
- **20 KB CSS is over-generous:** measured 9.11 → 2.2× slack; regressions hide under it.

**Recommended committed budget (gzip, per-asset with ~15–20% headroom):**

| Budget key | Measured | **Proposed cap** | Rationale |
|---|---|---|---|
| Entry `index-*.js` | 105.89 | **120 KB** | Visitor-critical; ~13% headroom |
| `validationRegistry-*.js` | 28.13 | **33 KB** | Admin lazy chunk |
| `AdminPage-*.js` | 16.22 | **19 KB** | Admin lazy chunk |
| **Total JS (all chunks)** | 151.6 | **175 KB** | ~15% headroom (replaces the tight 160) |
| CSS `index-*.css` | 9.11 | **12 KB** | Tighten from 20 |
| **warn-band** | — | **90% of cap** | Warn before hard-fail (AC-4.3) |

Per-asset caps make the failure message actionable ("`index.js` grew from 105.9→121 KB, cap 120") — exactly AC-4.3's requirement. **Flag to Maya/god:** update AC-4.1's 160/20 to these measured figures (PRD explicitly said "to be confirmed against a fresh gzip measurement").

### 3.3 Bundle checker — recommend **bespoke zero-dep zlib inspector** (answers PRD Q2)

| Option | Deps | Fit |
|---|---|---|
| **Bespoke ~30-line `dist` inspector** | 0 (node `zlib` + `fs`) | ✅ Recommended |
| `size-limit` | moderate devDep tree | ⚠️ Nicer PR annotations, but heavier |

The PRD's zero-dep ethos (NFR-1) is about *runtime* deps, and `size-limit` would only be a devDep — so it's *allowed*. But it's unwarranted here: **vite already computes the gzip sizes**, and a small script (`zlib.gzipSync(readFileSync(asset))` over `dist/assets/*.{js,css}`, compared to a committed `perf-budget.json`, `process.exit(1)` on breach with a per-asset diff table) gives full control, zero maintenance surface, and matches the project's demonstrated zero-dep discipline (the whole config/validation layer is hand-rolled). Use `size-limit` only if the team specifically wants its polished PR-comment UX. **Runs in ~seconds** — trivial CI cost.

### 3.4 Lighthouse CI (`@lhci/cli`) — config validation (answers PRD Q4)

- **Serve the built app** via `staticDistDir: ./dist` (LHCI serves it — no separate preview server needed) **or** point `url` at the existing `vite preview` on :4173. `staticDistDir` is simpler and deterministic. **Caveat:** this is an SPA on hash/history routing under a base path — verify LHCI resolves `/`, a project route, and `/admin` correctly; if history-fallback bites, use the running `vite preview` server + explicit URLs instead.
- **Assert (AC-4.2):** `categories:performance ≥ 0.90`, `accessibility ≥ 0.95`, `best-practices ≥ 0.95`; `largest-contentful-paint ≤ 2500`, `cumulative-layout-shift ≤ 0.1`, `total-blocking-time ≤ 200` on emulated mobile (LHCI's default mobile preset — the stricter bar).
- **Measure-first:** run LHCI once to capture actual scores, then set assertions at current-minus-margin in **`warn`** for one PR cycle, promote to **`error`** after (matches PRD §7 "report-only then enforcing"). Upload HTML report + budget diff as artifacts (AC-4.3).
- **Versions to pin at implementation:** `@lhci/cli` ~`0.15.x` (bundles Lighthouse ~`12.6.x`). Pin exact — Lighthouse scoring curves shift between minors and can silently move a passing score.

---

## 4. WS-3 — Automated A11y Reporting (validated against existing axe wiring)

**Measured current state (`e2e/accessibility.spec.ts`):** `@axe-core/playwright ^4.13.0` already wired, scanning 4 pages (home, project detail, admin login, admin config panel) with tags `wcag2a/wcag21a/wcag2aa/wcag21aa`, asserting `violations == []` (hard fail). Runs across both Playwright projects (desktop + mobile) = 8 scans.

**Recommended extension (confirms PRD approach):**
1. **Serialize full results** — capture the whole `AxeResults` object (not just `violations`): persist `violations`, `passes`, **`incomplete`** (needs-review), and `inapplicable` counts to `test-results/a11y/<page>-<viewport>.json` per scan. `incomplete` = rules axe couldn't auto-decide (e.g. color-contrast over images) — **report them as "needs manual review," never fail on them** (that would be flaky/wrong). This directly answers your incomplete/needs-review question: surface `incomplete.length` per page in the summary with an ⚠️ marker; keep them non-gating.
2. **Aggregate to Markdown** — a small post-processor reads the JSON files and emits a table (rule id, impact, node count, affected page/viewport), written to **`$GITHUB_STEP_SUMMARY`** (renders on the PR's run page) and uploaded as an artifact (AC-3.2). Node's `fs` + template string — zero-dep.
3. **Keep the hard gate** (AC-3.3): any `serious`/`critical` still fails CI. Make `moderate`/`minor` **report-only** (configurable via the severity policy) so the report is informative without over-gating. Implement by filtering `violations` by `impact` before the `expect`.
4. **Serializer shape:** wrap the existing `AxeBuilder(...).analyze()` in a helper `scanAndPersist(page, name)` that writes JSON + returns violations for the gate assertion. Small refactor of the existing spec; no new dep.

**CI cost:** serialization + summary generation is I/O-trivial (**+seconds**). The axe scans already run today. Negligible against AC-5.2.

---

## 5. CI wall-clock impact (AC-5.2: ≤ +4 min ceiling)

| Addition | Added time | Notes |
|---|---|---|
| WS-1 coverage | +~2s | v8 instrumentation over existing `vitest run` |
| WS-2 visual | +30–90s | Extra snapshot compares in existing e2e job |
| WS-3 a11y report | +~5s | Serialize + summary; scans already run |
| WS-4 bundle budget | +~5s | zlib over `dist` |
| WS-4 Lighthouse CI | **+2–4 min ← the risk** | 3 routes × default 3 runs = 9 audits |

**The only threat to the +4 min ceiling is Lighthouse.** Mitigations (apply all):
- Run **`perf` as its own parallel job** (per PRD §5 CI shape) so its wall-clock overlaps `e2e`/`a11y` rather than summing.
- Cap `numberOfRuns: 1` (or 2) per route instead of the default 3 — trades a little median-smoothing for ~3× less time; acceptable for a gate (assert on the single run, keep warn-band).
- Share the `npm ci` + `playwright install` cache across jobs (PRD §5).
- **Decision lever (PRD Q4):** if the ceiling is tight after measuring, **defer Lighthouse to V1.5** and ship V1.4 as coverage + visual + a11y + bundle-budget (all cheap). Bundle-budget alone already guards payload; Lighthouse adds CWV/runtime which is nice-to-have. **My recommendation: keep Lighthouse but parallel + `numberOfRuns:1`; fall back to deferral only if the measured job exceeds budget.**

---

## 6. Recommended sequencing (aligns with PRD §7, refined by risk/cost)

1. **WS-1 Coverage** — Phase A (lock baseline, cheap, unblocks the quality gate) → Phase B (climb `validationRegistry` to 90% branch, ratchet floors).
2. **WS-3 A11y reporting** — builds on existing axe wiring, lowest risk.
3. **WS-4 Performance** — bundle budget first (bespoke inspector, trivial), then Lighthouse (parallel job, measure-first, warn→error).
4. **WS-2 Visual regression last** — highest flake risk; requires the framer-motion `MotionConfig` change (Oscar) + containerized Linux baselines resolved first.

Each ships as its own PR through the standard gate (CI + Imagine QA + Peter Security + god merge); land thresholds report-only for one cycle, then enforce.

---

## 7. Answers to PRD-003 §8 open questions (for god)

- **Q1 (VR baselines):** **Yes** — CI/Linux is the single source of truth; generate via pinned Playwright container; local runs advisory. Accept the containerized-baseline op cost.
- **Q2 (checker):** **Bespoke zero-dep zlib inspector.** `size-limit` allowed (devDep) but unwarranted — vite already gives gzip; bespoke is ~30 lines, zero maintenance, matches project ethos.
- **Q3 (thresholds):** Coverage floors **80/80/75/70 are unreachable today (measured 60/52/47/61)** — adopt the two-phase floor (§1.2). Performance budgets: replace the 160/20 placeholders with the **measured per-asset budgets in §3.2** (total JS 175 KB, CSS 12 KB, per-asset caps). ADR to record both.
- **Q4 (Lighthouse scope):** **Keep in V1.4** with parallel `perf` job + `numberOfRuns:1`; defer to V1.5 only if the measured job breaches AC-5.2.

## 8. Items to reconcile with the PRD/team

- **AC-2.1 wording:** "light/dark themes" → "role themes (`?role=`), incl. ≥1 light (`data`) + ≥1 dark (`software`/`ai`) palette." (Measured: no light/dark toggle exists.)
- **AC-1.2/AC-1.3:** re-baseline floors per §1.2; note `validationRegistry` starts at 71% branch not ~90%.
- **AC-4.1:** replace 160/20 KB with §3.2 measured budgets.
- **Oscar coordination:** the real item is `<MotionConfig reducedMotion="user">` in `main.tsx` (§2.3) — there is **no theme localStorage key** to coordinate. Also confirm which Hero/ResearchLab visuals are generative (need masking/seeding).

---

## 9. Sources

- [Visual comparisons — Playwright docs](https://playwright.dev/docs/test-snapshots)
- [Playwright Visual Regression Testing in CI (Argos)](https://argos-ci.com/blog/playwright-visual-regression-testing-ci)
- [Percy vs Chromatic vs Argos: 2026 Visual Testing Comparison (Argos)](https://argos-ci.com/blog/percy-vs-chromatic-vs-argos)
- [Playwright Visual Regression: Baselines, Flake & CI Guide 2026 (TestQuality)](https://testquality.com/playwright-visual-regression-guide/)
- [treosh/lighthouse-ci-action — GitHub Marketplace](https://github.com/marketplace/actions/lighthouse-ci-action)
- [Lighthouse CI (LHCI): Complete Guide to @lhci/cli in 2026 (Unlighthouse)](https://unlighthouse.dev/learn-lighthouse/lighthouse-ci)
- [Lighthouse CI GitHub Actions: Setup Guide (Unlighthouse)](https://unlighthouse.dev/learn-lighthouse/lighthouse-ci/github-actions)
- Measured in-repo: `npm run build` (gzip sizes), `@vitest/coverage-v8` run on `main`+V1.3 (124 tests), `src/hooks/useRole.ts`, `src/main.tsx`, `e2e/accessibility.spec.ts`.
