# ADR-005: V1.4 Automated QA — Tooling & Gate Decisions

**Status:** Accepted (amended)
**Date:** 2026-09-04
**Deciders:** Kuldeep (god/architect), informed by PRD-003 (Maya) and tooling research (Kelly)

## Context

V1.4 adds automated QA across four workstreams: coverage enforcement (WS-1),
visual regression (WS-2), automated a11y reporting (WS-3), and performance
budgets (WS-4). PRD-V1.4-automated-qa.md (Maya) and
research/automated-qa-v1.4.md (Kelly) are both delivered. Four open
questions from PRD section 8 required a sign-off before implementation
could be assigned.

## Decisions

**Q1 — CI/Linux as sole source of truth for visual baselines: ACCEPTED.**
Baselines are generated and compared only inside the official Playwright
Docker image (matching CI), `maxDiffPixelRatio` 0.01. Local/mac runs never
generate or compare baselines — they may only view diffs. This neutralizes
the cross-OS font/anti-aliasing flake Kelly flagged as the main risk of
`toHaveScreenshot`.

**Q2 — gzip budget inspector: BESPOKE, zero-dependency.**
Use Node's built-in `zlib.gzipSync` in a ~30-line CI script to measure
gzip size of build output and compare against a committed budget file,
rather than adding `size-limit` as a devDependency (Vite already computes
gzip sizes at build time, so this is a thin wrapper, not new plumbing).
Keeps the project's established zero-added-dependency posture (matches
the ADR-004 validation registry and configReducer precedent).

**Q3 — thresholds: AMENDED 2026-09-04 with measured data.**
Kelly's deep research (fresh build + live `@vitest/coverage-v8` run, not
estimated) found PRD-003's proposed coverage floors (80/80/75/70%) are
**unreachable against the current codebase** — measured baseline is
lines 60.16%, statements 51.53%, functions 47.29%, branches 60.56%.
Setting the PRD's floors from day one would fail CI immediately on
`T-QA-7`. Superseding the original "approved as proposed" call:

- **Coverage floors — lock just under measured baseline now, ratchet later:**
  lines 58%, statements 50%, functions 45%, branches 58% as the initial
  CI gate. `validationRegistry` gets its own higher floor per PRD intent
  (currently 71% branch; target ≥90%, tracked as a fast-follow suite-writing
  card, not a day-one CI floor). Floors only ever move up in later PRs —
  never loosened without a new ADR note.
- **Gzip perf budgets — replace PRD's placeholder numbers with measured
  per-asset gzip figures**, +10% headroom baked in:
  - entry bundle: budget 120KB (measured 105.9KB gzip)
  - `validationRegistry` chunk (lazy): budget 33KB (measured 28.1KB)
  - `AdminPage` chunk (lazy): budget 19KB (measured 16.2KB)
  - total JS: budget 175KB (measured 151.6KB)
  - CSS: budget 12KB (measured 9.11KB)

  These replace the PRD's placeholder 160KB JS / 20KB CSS figures outright.

**Q4 — Lighthouse CI: IN SCOPE for V1.4, as a parallel job.**
Zero-cost, named in the original dispatch, scoped by Kelly
(`treosh/lighthouse-ci-action`, `staticDistDir`, `lighthouserc.js`,
`numberOfRuns: 1`). Run it as a **parallel** CI job, not serial — it's the
only piece that threatens Maya's AC-5.2 (+4min CI ceiling). Gate strategy:
hard-fail on visual diffs, a11y serious/critical, and gzip budget
regressions from day one; soft-warn (report-only) on Lighthouse
performance metrics for the first cycle, then ratchet to hard-fail once a
cycle of real numbers is in hand. If the parallel job still breaches the
CI time ceiling once wired, defer Lighthouse to V1.5 rather than relax
the ceiling.

## Sequencing

WS-1 → WS-3 → WS-4 → WS-2 (visual regression last, highest flake risk,
benefits from the other three being stable first).

## Other corrections folded in (from Kelly, sent to Maya directly)

- Theming is role-driven via the `?role=` URL param — there is no
  light/dark mode and no theme `localStorage` key; PRD wording referring
  to a theme toggle is incorrect and should be read as N/A.
- The real cross-team coordination item for WS-2 determinism is adding
  `<MotionConfig reducedMotion="user">` in `main.tsx` (Oscar) —
  framer-motion animates via inline JS that Playwright's
  `animations: 'disabled'` cannot stop on its own.

## Consequences

- Maya's filed cards (`T-QA-7..10`) carry these corrected numbers, not the
  PRD's original placeholders. Sunanda (T-QA-7, T-QA-10) and Imagine
  (T-QA-9, T-QA-8) implement against this ADR, not PRD-003 §8 directly,
  wherever the two disagree.
- No new runtime dependencies. Dev/CI-only additions: `@vitest/coverage-v8`,
  Playwright's built-in screenshot API (already a devDependency),
  `treosh/lighthouse-ci-action` (GitHub Action, not an npm dependency).
- Peter's security gate applies as usual to any new devDependency
  (`@vitest/coverage-v8`) — expect a fast pass given it's a first-party
  Vitest package.
- **Process note:** this file was lost once (written to the shared
  working tree, wiped by a branch switch before being committed) and was
  recreated via an isolated `git worktree` against `main`. Docs that
  aren't tied to a single feature branch should be committed directly to
  `main` promptly rather than left untracked in the shared checkout.
