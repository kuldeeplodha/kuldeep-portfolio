# Configuration Validation Registry

A contributor's guide to the zero-dependency validation layer that guards the
`/admin` Configuration Panel and the config import/export lifecycle.

- **Source:** `src/lib/config/validationRegistry.ts` (rules + engine),
  `src/lib/config/exportImport.ts` (storage envelope + import/export gates).
- **Design record:** [ADR-004](./decisions/ADR-004-config-validation.md),
  [PRD-V1.3](./PRD-V1.3-configuration-validation.md),
  [ADR-001](./decisions/ADR-001-config-panel-v2.md).
- **Status:** Shipped to `main` (V1.3).

---

## 1. Why a registry (and not Zod/Ajv/JSON Schema)

The portfolio holds a hard **zero-runtime-dependency** line. Rather than pull in
a schema library, validation is a set of pure TypeScript functions in a single
declarative registry. That keeps the bundle minimal and lets each rule carry a
context-aware `message` and `remediation` hint that a generic schema error
cannot. The tradeoff — accepted in ADR-004 — is more hand-written rules than a
schema definition would need.

The engine is fast enough to run on every keystroke: the whole config is
< 100 KB, so a full pass (50–100 checks) completes in a couple of milliseconds
with no perceptible typing lag. The panel runs it synchronously inside a
`useMemo`.

## 2. The two-tier severity model

Every rule produces a structured `ValidationIssue`, never a raw string:

```ts
export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  id: string                     // e.g. "exp-0-org-required"
  section: keyof PortfolioConfig // 'profile' | 'experience' | 'projects' | ...
  itemId?: string                // entity UUID / array id
  field?: string                 // e.g. "email", "githubUrl"
  severity: ValidationSeverity
  message: string                // human-readable description
  remediation?: string           // actionable fix hint
}
```

| | **Error** (`error`) | **Warning** (`warning`) | **Pass** |
| :-- | :-- | :-- | :-- |
| Meaning | Breaking violation: empty required field, invalid/unsafe URL, corrupt data | Quality issue: short content, missing optional metadata, orphaned reference | Clean field |
| Blocks Save Draft | **Yes** | No (advisory) | Yes |
| Blocks Export JSON | **Yes** (fail-closed) | No | Yes |
| Blocks Import | **Yes** (file rejected, state untouched) | No (confirm-with-warnings) | Yes |
| Tab badge | Red count | Amber count | Entity count |
| Field style | Red border + `aria-invalid="true"` | Amber border | Neutral |

**Errors block; warnings guide.** That single rule governs the whole panel and
the import/export pipeline.

## 3. Engine API

All exported from `src/lib/config/validationRegistry.ts`:

| Function | Purpose |
| :-- | :-- |
| `validateConfigRegistry(config): ValidationSummary` | The main pass. Runs every rule, returns the full summary. |
| `getFieldIssue(summary, section, field, itemId?)` | First issue for one field — for inline field UI. |
| `getFieldIssues(...)` | All issues for one field. |
| `getSectionIssues(summary, section)` | All issues in a section — for tab badges. |
| `registerRule(rule)` / `clearCustomRules()` | Register/clear an extra `ValidationRule` (test hooks and extensibility). |

`ValidationSummary` carries pre-built index maps so the UI renders in O(1):

```ts
interface ValidationSummary {
  isValid: boolean          // errors.length === 0
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  errorCount: number
  warningCount: number
  issuesBySection: Record<string, ValidationIssue[]>  // → tab badges
  issuesByEntity: Record<string, ValidationIssue[]>   // → invalid cards
  issuesByField: Record<string, ValidationIssue[]>    // → inline field errors
}
```

### Shared field validators

Reusable predicates back many rules and are exported for direct use:

- `isValidSafeUrl(url)` — the security gate. Allows relative `/…` and
  `http:` / `https:` only; rejects `javascript:`, `data:`, case variants
  (`JAVASCRIPT:`) and whitespace-bypass attempts (`\njavascript:`).
- `isValidEmail(email)`, `isValidPhone(phone)`, `isValidCssColor(color)`,
  `isValidGpa(gpa)`.

## 4. What gets validated

Rules cover all 11 config sections: `profile`, `roles`, `themes`, `experience`,
`projects`, `skills`, `education`, `certifications`, `research`, `metrics`,
`aiKnowledge`. Highlights:

- **Required fields** (name, title, email, org, role, etc.) → **error** when empty.
- **Length bounds** (e.g. `navDisplayName` ≤ 30, `summary` ≥ 10) → error, with a
  softer **warning** tier for "very short" content.
- **Safe URLs** on every URL field (avatar, LinkedIn, GitHub, project/attachment
  links, images) via `isValidSafeUrl` → **error**.
- **Enum membership** — `resumeVariant`, `layoutVariant`, theme/role references
  → error on an invalid reference.
- **Cross-reference integrity** — `highlighted*Ids` / `experiencePriorityIds`
  pointing at a non-existent entity → **warning** (orphaned reference).

The exhaustive field-by-field table (condition, message, remediation) lives in
[PRD-V1.3 §3](./PRD-V1.3-configuration-validation.md#3-field-by-field-validation-specifications)
— that PRD is the spec of record; keep the two in sync when adding rules.

## 5. Import / export lifecycle (`exportImport.ts`)

Config is always wrapped in a **versioned storage envelope**:

```json
{ "schemaVersion": 2, "savedAt": "2026-09-04T22:30:00.000Z", "config": { ... } }
```

- **Storage keys:** draft at `kuldeep-portfolio-config-draft`; a rejected draft is
  quarantined at `kuldeep-portfolio-config-draft-corrupt`.
- **Load / migrate:** `loadDraftFromLocalStorage()` runs `migrateDraft()` — a
  `schemaVersion: 2` draft is accepted as-is, a `version: 1` draft is upgraded,
  and a legacy unversioned object (has `profile`/`experience`/`projects`) is
  adopted as v-pre-1. Anything unrecognized returns `null`.
- **Quarantine recovery:** a corrupt/invalid draft is moved to the quarantine key
  and the bundled default is loaded, with a non-blocking restore banner.
  Inspect via `getQuarantinedDraft()`, purge via `clearQuarantine()`.
- **Export is fail-closed:** `exportConfig` / `downloadConfig` only emit after
  `validateFullConfig(config)` returns no errors.
- **Import is diagnostic:** `parseImportedConfigDiagnostic(json)` returns a
  `DiagnosticImportResult` (section / item / field / problem / remediation) so a
  bad file is reported field-by-field and the active draft is never mutated.
  `validateFullConfig` remains the legacy string-list gate for backward compat.

## 6. Adding or changing a rule

1. Add the rule in `validationRegistry.ts` (or `registerRule` for a dynamic one),
   picking `severity` deliberately — **error only when it must block save/export.**
2. Give it a stable `id`, a clear `message`, and a `remediation` hint.
3. Mirror it in the [PRD-V1.3 §3](./PRD-V1.3-configuration-validation.md) table.
4. If it's a URL/security rule, route through `isValidSafeUrl` rather than a new
   regex — that keeps the protocol allowlist in one audited place.
5. Add/extend unit coverage; the registry carries a raised coverage floor under
   [Automated QA](./AUTOMATED_QA.md).
