# Automated QA (V1.4)

The V1.4 quality system: coverage enforcement, automated accessibility
reporting, performance budgets, and visual regression. This is a contributor's
guide to how the gates work and what numbers they enforce.

- **Design record:** [ADR-005](./decisions/ADR-005-automated-qa-v1.4.md) (the
  authoritative, measured decisions), [PRD-V1.4](./PRD-V1.4-automated-qa.md).
- **Ground rule:** every threshold below comes from a real measured build, not an
  estimate. ADR-005 supersedes the PRD's original placeholder numbers.
- **Zero new *runtime* dependencies** — all additions are dev/CI-only.

## Status at a glance

The four workstreams land as separate PRs through the standard gate (CI + QA +
Security + merge). Status as of this document:

| WS | Feature | Status |
| :-- | :-- | :-- |
| WS-1 | Coverage enforcement | **Merged to `main`** (PR #11) — `test:coverage` + CI floor are live |
| WS-3 | A11y reporting | **Merged to `main`** (PR #9) — axe JSON + job summary are live |
| WS-4 | Performance budgets | **In progress** (Alex) — not yet shipped |
| WS-2 | Visual regression | **In progress** — not yet shipped |

> WS-1 and WS-3 are on `main`; their `npm` scripts / CI jobs are live. WS-4 and
> WS-2 are still in flight — check `package.json` and `.github/workflows/ci.yml`
> for exactly what is wired in your checkout.

Sequencing: ADR-005 recorded a **preferred** risk-ordering of
WS-1 → WS-3 → WS-4 → WS-2 (visual regression last, highest flake risk). In
practice WS-1 and WS-3 shipped first, then WS-4 and WS-2 were started **in
parallel** — the small extra flake risk was accepted deliberately to move both
at once rather than serializing them.

---

## WS-1 — Coverage enforcement

Adds `@vitest/coverage-v8` (dev-only) and a `test:coverage` script producing an
lcov report + text summary, with a CI floor that fails the build below threshold
and uploads the HTML report as an artifact.

**Coverage floors (ADR-005 Q3, measured 2026-09-04).** The PRD's original
80/80/75/70 targets were *unreachable* — the measured baseline is lines 60.16%,
statements 51.53%, functions 47.29%, branches 60.56%. So the gate locks **just
below** the measured baseline and ratchets up later:

| Metric | Initial CI floor | Measured baseline |
| :-- | :-- | :-- |
| Lines | **58%** | 60.16% |
| Statements | **50%** | 51.53% |
| Functions | **45%** | 47.29% |
| Branches | **58%** | 60.56% |

- `validationRegistry.ts` gets its own **higher floor: ≥ 90% branch** (currently
  ~71%), authored as a fast-follow suite-writing card — it is the security- and
  correctness-critical module.
- **Floors only ever move up.** Loosening a floor requires a new ADR note.
- Biggest coverage drag is the e2e-only view shells (`AdminPage.tsx` ~39%,
  `HomePage.tsx` 0%); excluding those from the unit denominator is under
  consideration.

```bash
npm run test:coverage   # lcov + text summary; CI fails below the floor
```

## WS-3 — Automated accessibility reporting

Builds on the existing `@axe-core/playwright` scans (WCAG 2.1 AA, 4 pages × 2
viewports). WS-3 makes them **reportable and trendable** rather than pass/fail
only:

- Serializes the full `AxeResults` — violations, passes, **and `incomplete`** —
  to `test-results/a11y/*.json` per page/viewport.
- Aggregates a Markdown summary to `$GITHUB_STEP_SUMMARY` and uploads the JSON as
  a CI artifact.
- **Gate policy:** serious/critical violations still **hard-fail** CI;
  moderate/minor are report-only; `incomplete` (needs manual review) is surfaced
  with a warn marker but **never gates** — gating on it would be flaky.

## WS-4 — Performance budgets *(in progress — Alex)*

Two independent checks:

- **Bundle gzip budgets** — a bespoke ~30-line Node `zlib.gzipSync` CI script
  (ADR-005 Q2: **no `size-limit` dependency**) compares `dist/` gzip sizes to a
  committed budget file: warn at 90%, hard-fail on breach. Budgets are measured
  + 10% headroom:

  | Asset | Budget (gzip) | Measured |
  | :-- | :-- | :-- |
  | Entry `index.js` | 120 KB | 105.9 KB |
  | `validationRegistry` chunk (lazy) | 33 KB | 28.1 KB |
  | `AdminPage` chunk (lazy) | 19 KB | 16.2 KB |
  | Total JS | 175 KB | 151.6 KB |
  | CSS | 12 KB | 9.1 KB |

  These replace the PRD's placeholder 160 KB JS / 20 KB CSS figures.

- **Lighthouse CI** (`@lhci/cli`, `staticDistDir: ./dist`, thresholds in
  `lighthouserc.js`) on `/`, a project page, and `/admin`. Targets: Perf ≥ 0.90,
  A11y ≥ 0.95, Best-Practices ≥ 0.95; LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms
  (mobile). Runs as a **parallel** `perf` job with `numberOfRuns: 1` to stay
  under the +4 min CI ceiling. Perf metrics **soft-warn** the first cycle, then
  ratchet to hard-fail (ADR-005 Q4). If the parallel job still breaches the CI
  time ceiling, Lighthouse defers to V1.5 rather than relaxing the ceiling.

## WS-2 — Visual regression *(in progress)*

Playwright `toHaveScreenshot` across viewports and role themes.

- **CI/Linux is the sole source of truth** (ADR-005 Q1): baselines are generated
  and compared only inside the official Playwright Docker image, at
  `maxDiffPixelRatio ≤ 0.01`. Local/mac runs may **view** diffs but never
  generate or compare baselines — this neutralizes cross-OS font/anti-aliasing
  flake. Update baselines with `--update-snapshots` **inside Docker only.**
- **Themes are role-driven, not light/dark.** There is no light/dark toggle and
  no theme `localStorage` key. Each theme is a `?role=` URL param
  (`software`/`ai`/`data`/`system`). Capture with `page.goto('/?role=ai')` — a
  fresh load mounts in-theme and skips the 450 ms role transition. Cover ≥ 1
  light-family role (`data`) and ≥ 1 dark-family role (`software`/`ai`).
- **Determinism dependency:** requires `<MotionConfig reducedMotion="user">` in
  `main.tsx` (merged to `main`, PR #10). framer-motion animates
  via inline JS that Playwright's `animations: 'disabled'` cannot stop; this one
  change stills all framer animation for stable capture — and is a genuine a11y
  win. Also pin `deviceScaleFactor`/locale/timezone, await font readiness, and
  mask dynamic regions.
- **Targets:** homepage hero, role variants, projects section, a project
  case-study page, admin login, admin config panel — × Desktop Chrome + Pixel 5
  × role themes (≥ 8 committed baselines).

---

## CI shape

CI runs `lint → typecheck → test → test:e2e → build` on every PR; Pages deploy
repeats it on `main`. V1.4 adds the coverage floor into the `test` step, the
a11y report to the e2e step, and a **parallel `perf` job** for gzip budgets +
Lighthouse. Added wall-clock is capped at **+4 min** (AC-5.2); Playwright HTML
reports and traces are uploaded on failure.

## Durability note

ADR-005 and PRD-V1.4 were each lost once to shared-worktree branch churn (written
untracked in the shared checkout, wiped by another agent's `git checkout`).
Docs not tied to a single feature branch are committed straight to `main` from an
isolated `git worktree`. See the repo's worktree protocol before editing docs in
the shared checkout.
