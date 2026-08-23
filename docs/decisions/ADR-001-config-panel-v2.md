# ADR-001: Configuration Panel V2 Architecture & State Model

## Status
**ACCEPTED** (2026-08-23 by Kuldeep — Architect / Product Owner)

## Context
The portfolio admin panel at `/admin` (`src/pages/AdminPage.tsx`) was established in Phase 0 as a single monolithic component with manual draft saving, flat validation string lists, no entity addition/deletion/reordering, a split-brain profile/config state, and unvalidated draft loading from `localStorage`.

Kelly conducted comprehensive technical research in `docs/research/config-panel-v2.md` (T-RES-1) evaluating state management options, list reordering techniques, live validation architectures, and storage integrity safeguards.

## Decision

1. **Zero-Dependency Unified Reducer (`configDraftReducer`):**
   - Consolidate state into a single typed `PortfolioConfig` root to eliminate the split-brain `profile` vs `config` bug.
   - Implement generic, pure action creators: `patchEntity(section, id, patch)`, `patchProfile(patch)`, `insertEntity(section, afterId?)`, `removeEntity(section, id)`, `duplicateEntity(section, id)`, `moveEntity(section, id, -1 | 1)`.
   - Use `crypto.randomUUID()` with collision guards for new entity IDs.
   - Sweep cross-references on entity deletion to prevent orphaned IDs in role highlights.

2. **Accessible List Reordering:**
   - Implement accessible Move Up / Move Down buttons (`<button aria-label="Move item up">`) calling `moveEntity` across all order-dependent entity arrays (Experience, Projects, Metrics, Skills, Education, Certifications, Research).
   - Reject raw HTML5 DnD due to complete lack of mobile touch support and poor keyboard accessibility.
   - Preserve `moveEntity` action interface so drag-and-drop (`dnd-kit`) can be layered on later as a pure progressive enhancement if requested.

3. **Declarative Validation Registry & Real-Time UX:**
   - Establish a declarative rule registry producing structured `ValidationIssue { section, itemId?, field, level: 'error' | 'warning', message }`.
   - Maintain three tiers: `Error` (blocks save/export), `Warning` (surfaces non-blocking guidance), and `Pass` (implicit).
   - Display section tab badges with error/warning counts and inline field validation messages.
   - Port all existing `validateFullConfig` rules and `isValidSafeUrl` security gates into the registry, retaining `validateFullConfig` as the export/import gate.

4. **Hardened Storage Envelope & Quarantine Recovery:**
   - Wrap draft and export JSON in `{ schemaVersion: 2, savedAt: string, config: PortfolioConfig }`.
   - On load: parse JSON → run migration chain (auto-upgrading legacy unversioned drafts to v1) → validate schema → accept.
   - If a draft is corrupted or invalid, quarantine it under `kuldeep-portfolio-config-draft-corrupt` and fall back to the bundled default config, presenting a non-blocking restore banner.
   - Add debounced autosave (800ms) with `structuredClone` deep snapshotting.

## Consequences
- **Positive:** Eliminates split-brain state, enables full CRUD across all 10 entity sections, guarantees WCAG AA keyboard and mobile touch accessibility, prevents corrupted draft crashes, adds live feedback for editors, and introduces zero new runtime dependencies.
- **Negative / Tradeoffs:** Slightly more reducer boilerplate than Immer; deletion requires explicit confirmation UI since undo history is intentionally deferred.

## Implementation Plan
- **T-CMS-3 (Sunanda):** Storage hardening (versioned envelope, validate-on-load, quarantine recovery, autosave).
- **T-CMS-4 (Sunanda):** State consolidation & CRUD engine (`configDraftReducer`, generic entity actions, cross-reference sweep).
- **T-CMS-5 (Oscar):** UI controls (Move Up/Down buttons, Create/Delete modal, tab badges, responsive cards).
- **T-CMS-6 (Sunanda):** Live validation registry & inline field feedback.
- **Gates:** Imagine (QA re-gate across all 10 tabs & E2E round-trips) + Peter (Security audit on new input surfaces).
