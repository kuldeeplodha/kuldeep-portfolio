# ADR-007: Coverage Floor Realignment After Legacy Config Panel Retirement

**Status:** Accepted
**Date:** 2026-09-19
**Deciders:** Kuldeep (god/architect)

## Context

PR #80 (CMS-UNIFY-CONFIG-EDITOR part 2) retired the legacy localStorage
Configuration Panel and ~6.9k lines of code with it, including
`src/lib/config/validationRegistry.ts` (1766 lines of dense pure-logic
validation rules) and the two test files written specifically to farm
branch coverage from it (`src/test/coverageExpansion.test.ts`,
`src/test/validationRegistry.test.ts` — the former's own file comment
said its purpose was "raising branch coverage ... toward the V1.4
coverage floor").

With that file and its tests gone, the ADR-005 Amendment-1 floors
(statements/lines 58%, functions 45%, branches 50%) no longer reflect
this codebase's real composition — measured post-deletion coverage is
~52% statements, ~53% lines, ~45% functions, ~40% branches. This is a
**deletion artifact, not a behavior regression**: the removed tests
were coverage-padding via exhaustive branch traversal of one file's
validation rules, not behavioral tests of the UI components (Hero,
AboutSection, AskKuldeepSection, etc.) that now make up a larger share
of the denominator than before.

## Decision

Floors are realigned to the new baseline, with a small buffer under the
measured numbers so the gate still catches real regressions rather than
tracking at zero margin:

| Metric     | Old (ADR-005 Amendment-1) | Measured (post PR #80) | New floor |
|------------|---------------------------|-------------------------|-----------|
| Statements | 58%                       | ~52%                    | 50%       |
| Lines      | 58%                       | ~53%                    | 50%       |
| Functions  | 45%                       | ~45%                    | 43%       |
| Branches   | 50%                       | ~40%                    | 38%       |

The per-file `validationRegistry.ts` branch threshold (90%, PRD-V1.4
AC-1.3) is removed along with the file it measured.

The "floors are up-only, never down without an ADR note" rule from
ADR-005 remains in force **from this new baseline forward** — this is
a one-time realignment to a deletion, not a precedent for lowering
floors to dodge a coverage gap in future work.

## Consequences

- CI's `verify` job passes again without padding coverage with tests
  that don't test behavior.
- Any future PR that drops coverage below these new floors fails CI,
  same as before.
- If UI-component unit testing is prioritized later, floors ratchet up
  from this baseline, per the existing amendment process.
