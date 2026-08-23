# Configuration Panel V2 — Technical Research

_T-RES-1 · Kelly (research) · 2026-08-23 · Scope: research & documentation only — no `src/` changes_

## Research Question

What architectural and UX patterns should **Configuration Panel V2** (evolution of `src/pages/AdminPage.tsx`) adopt for:

1. CRUD + immutable updates across deeply nested config entities in React 19 / TypeScript;
2. accessible, touch-friendly list reordering compatible with a static Vite build;
3. granular Pass/Warning/Error validation surfaced during editing (not only at save);
4. robust `localStorage` draft persistence and round-trip JSON integrity?

## Context

**Current state (verified against source):**

- `PortfolioConfig` (`src/types/index.ts`) is a single nested tree: one scalar object (`profile`), two keyed records (`roles`, `themes` — fixed `RoleId` keys), and **8 arrays of entities**: `experience`, `projects`, `skills` (nested one level deeper: `SkillCategory → Skill[]`), `education`, `certifications`, `research`, `metrics`, `aiKnowledge`. Entities cross-reference by id (`relevantRoles`, `sourceVariants`, `highlightedSkillIds`…), so referential integrity matters.
- `AdminPage.tsx` (~780 lines) is one monolithic component: 10 tabs rendered via conditionals; **9 separate "selected item id" `useState`s**; a split-brain state where `profile` is edited outside the main `config` object and merged ad hoc at save time (`{ ...config, profile }`) — every list-update helper must remember to re-attach it. Updates follow a uniform but hand-repeated pattern: `arr.map(x => x.id === selectedId ? { ...x, ...patch } : x)`.
- **No create / delete / duplicate for any entity.** The skills editor renders inputs but cannot add or remove rows. Reordering does not exist anywhere, yet display order is array order (experience chronology, project prominence, metric placement are all order-dependent).
- Validation (`src/lib/config/exportImport.ts:validateFullConfig`) runs **only on Save Draft / Export**, returning a flat `string[]` with positional prefixes ("Experience #2 …"). No field-level targeting, no warnings-vs-errors distinction, no live feedback while typing.
- Persistence: single unversioned JSON blob under key `kuldeep-portfolio-config-draft`. Critically, `loadDraftFromLocalStorage()` does `JSON.parse(raw) as PortfolioConfig` **without any validation** — a corrupted or stale-schema draft loads straight into render and can crash the panel or silently poison an export. Import *is* validated (`parseImportedConfig`), so the trust boundary is asymmetric.
- Stack constraints (per `docs/ARCHITECTURE.md`): React 19 + TypeScript + Vite + Tailwind 4, static GitHub Pages hosting, no backend. Admin page sits behind `AdminGate` hash-auth (PR #5) and is code-split from the public bundle, so admin-only dependency weight does not affect visitor LCP.

## Constraints

1. **Stack preservation** — React 19 + TypeScript + Vite + Tailwind CSS must be retained; no framework swap.
2. **Static build** — everything ships as static JS to GitHub Pages; no server-side validation, no API round-trips. All correctness enforcement lives client-side before export.
3. **Zero-to-minimal dependencies** — the repo currently has a deliberately lean dep tree; heavy form/state frameworks (Redux Toolkit, React Hook Form + Zod bundle, Formik) would be disproportionate for a single-user admin tool.
4. **WCAG AA keyboard accessibility** is a standing requirement (T-FE-1 heritage; axe-clean scans are the QA norm). Any reordering UI must be fully operable without a pointer.
5. **Mobile touch** must not be broken — the panel is used opportunistically on tablets/phones.
6. **Data safety** — the draft is the user's only working copy; V2 must never lose edits silently (current load path can).
7. **Governance** — changes flow through PR-gated lifecycle (CI + QA + security gates); research doc feeds god's implementation planning.

## Options

### A. State management

| # | Approach | Sketch |
|---|----------|--------|
| A1 | **Status quo, formalized**: keep `useState` tree + hand-written per-entity update fns | More of today: every new field/entity = another bespoke closure |
| A2 | **Typed generic reducer + path/entity helpers (zero-dep)** | One `useReducer(ConfigReducer)` over a normalized-ish shape; generic actions `patchEntity(section, id, patch)`, `insertEntity`, `removeEntity`, `moveEntity(section, id, delta)`; helpers typed off `PortfolioConfig` keys |
| A3 | **Immer** (`produce()`) | Write mutably inside a producer; structural sharing keeps renders cheap; ~3–4 kB gzipped core |
| A4 | **External store (Zustand/Jotai/XState)** | Store outside React; selectors per tab; adds dep + mental model |

### B. List reordering

| # | Approach | Sketch |
|---|----------|--------|
| B1 | **Move Up / Move Down buttons** | Two icon buttons per row calling `moveEntity(section, id, ±1)`; plain `<button>`s = free keyboard + screen-reader semantics |
| B2 | **Native HTML5 drag-and-drop** (`draggable`, DnD events) | Zero deps; desktop-pointer only; keyboard story must be bolted on manually |
| B3 | **dnd-kit** (`@dnd-kit/core` + `@dnd-kit/sortable`) | Pointer/touch/keyboard sensors built-in; ~10–12 kB gzipped; industry default for accessible DnD |
| B4 | **B1 now + optional dnd-kit enhancement later** | Buttons as the accessible baseline; drag layered on as progressive enhancement bound to the same reducer action |

### C. Validation architecture

| # | Approach | Sketch |
|---|----------|--------|
| C1 | Status quo: flat `string[]` at save | Today's behaviour; no live feedback, no severity |
| C2 | **Declarative rule registry → structured issues (zero-dep)** | Per-section rule tables (`field, check, level, message`); validator walks config → `ValidationIssue { section, itemId?, field, level: 'error'\|'warning'\|'pass', message }`; aggregated in `useMemo` into lookup maps for O(1) field/section status |
| C3 | **Zod schema per entity** | Single source for types + runtime checks; ~13 kB gzipped; duplicate type definitions vs existing TS interfaces unless interfaces are derived from schemas |
| C4 | Hand-rolled recursive schema descriptor engine | Full generality nobody needs at this scale; high complexity |

### D. Storage & import/export

| # | Approach | Sketch |
|---|----------|--------|
| D1 | Status quo (raw cast on load) | Corrupt/stale draft crashes or poisons panel |
| D2 | **Versioned envelope + validate-on-load + quarantine** | Save `{ schemaVersion, savedAt, config }`; on load: parse → migrate chain → `validateFullConfig` → accept / quarantine bad payload under backup key + fall back to bundled default; export embeds `schemaVersion` too |
| D3 | IndexedDB storage | Overkill for one <100 KB JSON document |
| D4 | File System Access API autosave | Non-cross-browser (no Firefox/Safari parity); breaks the browser-draft portability model |

## Comparison

Scores: ● low / ◐ medium / ●● high suitability (suitability = fit for THIS project).

| Criterion | A2 reducer+helpers | A3 Immer | A4 store lib | B1 buttons | B2 native DnD | B3 dnd-kit | C2 rule registry | C3 Zod | D2 versioned envelope |
|-----------|-------------------|----------|--------------|------------|---------------|------------|------------------|--------|----------------------|
| **Complexity** | ● (fits existing map-by-id pattern) | ◐ (new mental model, tiny) | ◐● (store + selectors) | ● trivial | ●● (keyboard a11y DIY) | ◐ (sensor wiring) | ● (tables mirror existing validators) | ◐ (schema/type reconciliation) | ◐ (migration discipline) |
| **Maintainability** | ●● one action set serves all 11 entities | ●● uniform producers | ◐ indirection | ●● self-evident | ● fragile event code | ●● maintained upstream | ●● rules co-located per section | ●● but dual-source-of-truth risk | ●● explicit versioning |
| **Performance** | ●● fine at this scale (<100 KB tree) | ●● structural sharing avoids full-tree copies | ●● | ●● | ●● | ●● (transform overhead negligible) | ●● memoized pass, debounced | ◐ parse cost per keystroke unless cached | ●● negligible |
| **Security** | ●● pure functions, auditable | ●● | ●● | ●● | ●● | ●● | ●● reuses hardened `isValidSafeUrl` gate | ●● | ●● closes the unvalidated-load hole |
| **Compatibility** | ●● React 19-native, zero deps | ●● works w/ React 19 (immutability preserved) | ●● but unnecessary | ●● all browsers/touch | ◐ no mobile touch support | ●● touch+kb built-in | ●● | ●● | ●● localStorage universal |
| **DX (single-dev admin)** | ◐● slightly more boilerplate than Immer | ●● near-zero update code | ◐ overkill | ●● | ○ poor | ●● excellent | ●● predictable, testable | ◐● nice inference, heavier | ●● saves real debugging pain |
| **New deps added** | 0 | 1 (~4 kB) | 1+ | 0 | 0 | 2 (~11 kB) | 0 | 1 (~13 kB) | 0 |

**Key observations:**

- The current update pattern is already 90 % of A2 — nine copy-pasted functions prove the abstraction exists; it just was never extracted. A2 captures proven behaviour with zero new surface area.
- Native HTML5 DnD (B2) is effectively disqualified alone: no touch support (the contract explicitly names mobile) and WCAG AA compliance would have to be rebuilt by hand — exactly what B1 gives for free.
- Zod (C3) buys runtime parsing the codebase already implements by hand in `validateFullConfig`; adopting it means either maintaining two type sources or regenerating interfaces — churn disproportionate to benefit at 11 known entity shapes. It remains the right call *if* third-party configs become an untrusted input class.
- The asymmetric trust boundary (validated import vs unvalidated draft load) is the single highest-risk defect found; D2 fixes it and enables future schema evolution.

## Recommendation

Adopt the **zero-new-dependency track**, staged:

1. **State (A2):** one `configDraftReducer` with generic, typed actions — `patchEntity(section, id, patch)`, `patchProfile(patch)`, `insertEntity(section, afterId?)`, `removeEntity(section, id)`, `duplicateEntity(section, id)`, `moveEntity(section, id, -1|1)` — eliminating the profile/config split-brain (single source of truth) and the nine duplicated closures. ID generation via `crypto.randomUUID()` with collision guard against existing ids.
2. **Reordering (B4):** ship accessible Move Up/Down buttons bound to `moveEntity` (WCAG AA by construction, touch-safe); treat dnd-kit as a documented future enhancement reusing the same action — never native DnD.
3. **Validation (C2):** declarative rule registry per section producing `ValidationIssue { section, itemId?, field, level }`; three levels (Error blocks save/export, Warning surfaces inline, Pass implicit); aggregate via `useMemo` + 300 ms debounce; sidebar/tab badges show error/warning counts; field-level messages replace today's save-time string dump. Port existing `validateFullConfig` rules into the registry verbatim (incl. `isValidSafeUrl` href guards — security-critical, keep them) and retain the function as the export/import gate so the round-trip contract doesn't change.
4. **Storage (D2):** wrap drafts and exports in `{ schemaVersion: 2, savedAt, config }`; on load run parse → migrate → validate → **quarantine-on-failure** (copy bad payload to `…-draft-corrupt` key, start from bundled default, surface non-blocking notice). Add debounced autosave (e.g. 800 ms after last change) alongside manual Save, plus `structuredClone` for deep snapshots. Export/import remain gated by full validation.

Rationale: every recommendation preserves the existing stack and governance posture, adds **zero** runtime dependencies, converts patterns already proven in the codebase into abstractions rather than introducing foreign models, and directly repairs the two latent defects found (split-brain state, unvalidated draft load).

## Alternatives

- **Immer (A3):** legitimate runner-up for state; if V2 implementation finds the reducer boilerplate painful in practice, switching `patchEntity` internals to `produce()` is localized and does not change component-facing APIs.
- **dnd-kit (B3):** if the human explicitly wants drag interaction, add `@dnd-kit/core` + `@dnd-kit/sortable` behind the same `moveEntity` action; keep button controls regardless as the accessible fallback.
- **Zod (C3):** justified only if imported JSON becomes a genuinely untrusted input (multi-user exports). Then derive TS types from schemas and delete hand-written validators wholesale — do not maintain both.
- **Do-nothing:** V1 still functions for editing existing content, but cannot add/remove/reorder entries, gives no live validation, and risks crashing on a corrupt draft — incompatible with the stated V2 objective.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration drops users' existing unversioned drafts | Medium | Medium | Treat legacy raw-blob drafts as `schemaVersion 1`: auto-wrap + validate on first load instead of discarding |
| Reducer refactor regresses existing edit flows | Medium | High | Characterization tests around each tab's update paths before refactor; QA gate covers all 10 tabs (existing hive gate practice) |
| Debounced autosave persists half-typed fields | Low | Low | Validate-before-autosave only downgrades to warnings; errors never block draft autosave (only save/export), matching "guide editing" goal |
| Quarantine path confuses user ("where did my draft go?") | Medium | Low | Explicit status banner naming the backup key + Restore button that reloads quarantined payload into the editor |
| New insert/delete creates broken cross-references (orphaned ids in `highlightedProjectIds` etc.) | Medium | Medium | On `removeEntity`, sweep record fields referencing the id; warn on duplicates rather than silently merging |
| Accessibility regression in reorder controls | Low | Medium | `aria-label` incl. item name ("Move Experience at AVNI up"), disabled states at list bounds, axe scan in QA gate |
| Scope creep toward full CMS | Medium | Medium | Contract already bounds V2 to these four areas; park extras (undo history, multi-draft slots) as backlog notes |

## Implementation Guidance

**Suggested slice order (each its own fix/ or feat/ branch + PR per governance sec.12):**

1. **Storage hardening first** (smallest diff, highest risk removed): versioned envelope, validate-on-load, quarantine, autosave debounce. Unit-test migration + corrupt-payload paths in Vitest (suite currently 31 unit / 18 e2e green — keep floor).
2. **State consolidation second**: introduce reducer + generic entity actions; mechanically port the nine update fns onto it; delete profile split-brain. Characterization tests first.
3. **CRUD completion third**: Insert/Duplicate/Delete per entity list, using `crypto.randomUUID()`; cross-reference sweep on delete; confirmation dialog on delete (destructive, no undo yet — undo history is explicitly out of scope).
4. **Reordering fourth**: `moveEntity` + Move Up/Down controls on experience, projects, metrics, skills categories, certifications, education, research lists (order-sensitive sections).
5. **Validation UX last**: rule registry + issue maps + tab badges + field-level rendering; keep `validateFullConfig` as the export/import gate (now fed from registry output filtered to errors) so import security behaviour is unchanged until Peter re-audits.

**Type sketch** (illustrative only, not committed code):

```ts
type ConfigSection = Exclude<keyof PortfolioConfig, 'profile' | 'roles' | 'themes'>
interface ValidationIssue {
  section: keyof PortfolioConfig
  itemId?: string
  field?: string
  level: 'error' | 'warning'
  message: string
}
interface StoredDraft {
  schemaVersion: number
  savedAt: string
  config: PortfolioConfig
}
```

**Testing additions to plan for:** reducer unit tests (all actions × sections), draft migration/quarantine tests, move-boundary a11y tests, validation registry golden-file test against the shipped `portfolioConfig` (must yield zero errors out of the box), e2e happy-path "add → edit → reorder → save → reload → export".

## Confidence

**High (~85 %)** on the overall direction: recommendations are conservative extensions of patterns already proven in this codebase, carry zero new dependencies, and directly address defects verified in source. Residual uncertainty concentrates in (a) whether the human wants true drag-and-drop enough to justify dnd-kit (a product call, not technical), and (b) exact autosave timing/UX preferences. Both are cheaply reversible post-implementation given the PR-gated flow.
