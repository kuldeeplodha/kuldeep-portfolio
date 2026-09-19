# ADR-008: AdminPage Bundle Budget Increase After Friendly Panel Restore

**Status:** Accepted
**Date:** 2026-09-19
**Deciders:** Kuldeep (god/architect), via CMS-RESTORE-FRIENDLY-PANEL dispatch

## Context

PR #80 (CMS-UNIFY-CONFIG-EDITOR part 2) retired the legacy multi-tab
Configuration Panel and shrank `AdminPage.tsx` from ~2060 lines to
~90, dropping its gzip chunk from 116KB to 47KB and eventually the
`.perf-budget.json` `AdminPage chunk` budget to 25,600 bytes (25KB) to
match. CMS-RESTORE-FRIENDLY-PANEL (human feedback: the raw-JSON-only
editor was not user-friendly) restored that panel's per-section forms
— `configReducer.ts`, `validationRegistry.ts` (1766 lines), `defaultTemplates.ts`,
`EntityToolbar`/`MediaFields`/`ValidationStatusBar`/`InlineFieldFeedback`/
`DiagnosticImportModal` — wired to the DB instead of localStorage.

`validationRegistry.ts` used to ship as its own lazy chunk with a
separate 33,792-byte budget line (`validationRegistry chunk`); it is
statically imported by `AdminPage.tsx` again now, so it bundles into
the same chunk rather than splitting out — that budget line now always
reads 0% (harmless, but no longer meaningful).

Post-restore, `AdminPage-*.js` measures ~29.1KB gzip
(`node scripts/check-bundle-size.mjs`), which fails the stale 25KB cap
(116.4%) even though total JS budget has large headroom (187KB / 300KB,
62%) and every other budget line passes clean.

## Decision

Raise the `AdminPage chunk` budget from 25,600 to 38,912 bytes (38KB) —
roughly 30% headroom over the current ~29.1KB measured value, enough to
absorb incremental future changes to the friendly forms without another
immediate ratchet. `total JS` (300KB) is untouched and still has ample
margin. The now-dead `validationRegistry chunk` line is left in place
(always passes at 0%) rather than removed — out of scope for this
restore, and harmless as a no-op check.

The "up-only, ADR note required" rule (ADR-005/ADR-007) applies the
same way to perf budgets as to coverage floors: this is a one-time
realignment reflecting a deliberate, approved feature restoration, not
a precedent for loosening budgets to dodge a real regression.

## Consequences

- CI's `perf-budgets` job passes again without disabling or weakening
  the AdminPage-specific check.
- Any future PR that grows `AdminPage-*.js` past 38KB gzip fails CI,
  same enforcement as before, just recalibrated to the restored
  panel's real weight.
- If the friendly forms are further consolidated or lazy-split later,
  the budget can ratchet back down, per the existing amendment process.
