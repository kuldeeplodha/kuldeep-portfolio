# PRD-V2.1: JSON Content-Import & Export Feature

- **PRD ID:** PRD-005 (V2.1-JSON-IMPORT)
- **Feature Name:** JSON Content-Import & Round-Trip Export
- **Author:** Maya (`maya-mt5yw3ix`), Product Manager
- **Status:** Ready for Implementation Review
- **Target Release:** Portfolio V2.1
- **Reference Tasks:** `V21-JSON-IMPORT`
- **Dependencies:** ADR-004 (Validation Registry), `docs/CONFIG_VALIDATION.md`, `src/types/index.ts`, `agents/god/notes/v2-real-content.json`

---

## 1. Executive Summary & Problem Statement

### 1.1 Context & Human Ask
The portfolio content is currently config-driven via `src/config/*.ts` and editable locally in the `/admin` Configuration Panel. The human requested:
> *"one json import option to upload content"*

V2.1 UI phases P1–P4 are fully merged. This JSON content-import feature represents the remaining net-new capability for V2.1 before moving to the V2.2 database-backed CMS roadmap.

### 1.2 Objective
Deliver an administrative interface in `/admin` allowing the site owner to:
1. **Upload a `.json` file or paste JSON** directly into the admin panel.
2. **Validate the payload diagnostic-first** against existing TypeScript content interfaces via the zero-dependency validation registry.
3. **Fail closed with granular per-field diagnostics** on invalid input—**never silently coerce, drop, or mutate fields**.
4. **Preview valid changes** before applying them to the active state.
5. **Export current live content as JSON** matching the exact structure of `agents/god/notes/v2-real-content.json` to enable round-trip editing (`Export -> Edit locally -> Re-import`).

---

## 2. Core Architectural Principles & Invariants

1. **Zero-Runtime-Dependency Footprint (ADR-004):**
   No external schema libraries (`zod`, `ajv`, `yup`, or `json-schema`). Validation must execute purely via TypeScript functions in `src/lib/config/validationRegistry.ts`.
2. **Strict Fail-Closed Gate (Oscar's Risk Guard):**
   Never silently coerce mismatched types (e.g. string to number, invalid enum string to fallback, or dropping unmapped fields). If an imported document has missing required fields or invalid types, the entire import is rejected with exact field coordinates and remediation hints.
3. **Dual Payload Format Support:**
   Must seamlessly accept both:
   - The versioned envelope: `{ "schemaVersion": 2, "savedAt": "...", "config": { ... } }` (used by current CMS exports).
   - The direct unversioned content root matching `agents/god/notes/v2-real-content.json` (convenient for raw editing).
4. **Security & Protocol Sanitation:**
   All external URLs (links, attachments, project URLs) must pass `isValidSafeUrl` to reject `javascript:`, `data:`, and obfuscated whitespace bypass vectors.

---

## 3. Persistence Architecture & Answer to Key Open Question

### Key Question: Where does imported content persist on a static GitHub Pages site?

Because GitHub Pages is a purely static host with no server-side execution, dynamic backend, or writable persistent filesystem, content persistence operates in two distinct tiers:

```
+-----------------------------------------------------------------------+
|            Tier 1: Client-Side (Instant Preview & Session)             |
|                                                                       |
|  [ Upload / Paste JSON ] ---> [ Validation Engine ]                   |
|                                     │                                 |
|                                (Valid pass)                           |
|                                     ▼                                 |
|                             [ Diff Preview ]                          |
|                                     │                                 |
|                                 (Confirm)                             |
|                                     ▼                                 |
|                  localStorage: "kuldeep-portfolio-config-draft"       |
|                                     │                                 |
|                                     ▼                                 |
|                        React Context & Live State                     |
+-----------------------------------------------------------------------+
                                     │
                           (Export Round-Trip)
                                     ▼
+-----------------------------------------------------------------------+
|            Tier 2: Production Deploy (Permanent Public Site)          |
|                                                                       |
|  [ Export JSON File ] ---> [ Commit to Git Repo / src/config/ ]       |
|                                     │                                 |
|                                (git push)                             |
|                                     ▼                                 |
|                        GitHub Actions (deploy.yml)                    |
|                                     │                                 |
|                                     ▼                                 |
|                     Public Static Build on GitHub Pages               |
+-----------------------------------------------------------------------+
```

1. **Tier 1: Client-Side Local Draft (`localStorage`) — Instant Preview & Edit:**
   - On "Apply", the validated JSON is written to `localStorage` under `kuldeep-portfolio-config-draft` via `saveDraftToLocalStorage`.
   - The active React state rehydrates immediately. The admin sees their updates across the portfolio within that browser session without a redeploy.
   - If a corrupt draft is encountered on reload, the existing quarantine mechanism (`kuldeep-portfolio-config-draft-corrupt`) isolates it.
2. **Tier 2: Production Deployment (`git` + GitHub Actions) — Public Persistence:**
   - Changes stored in browser `localStorage` affect only the admin's local device. To publish updates to all visitors worldwide on GitHub Pages, the exported JSON must be committed into the repository or used to update `src/config/`.
   - **UI Guidance:** Upon successful import and application, the Admin panel displays a clear helper banner:
     > *"Draft applied locally. To publish permanently to all public visitors on GitHub Pages, export this JSON and commit it to the repository or run your deployment workflow."*
   - *Note on Future Scope:* V2.2 (`V22-EPIC` / `V22-RESEARCH`) is investigating a dedicated database / backend CMS for remote authoring without manual Git pushes. For V2.1, this two-tier static architecture is the correct and sound model.

---

## 4. User Stories

| ID | Persona | Story | Value / Outcome |
| :--- | :--- | :--- | :--- |
| **US-1** | Admin | As an admin, I want to upload a `.json` file or paste raw JSON into the admin panel | Quick and flexible content ingestion without opening an IDE. |
| **US-2** | Admin | As an admin, when my JSON is invalid, I want to see exact per-field errors with line/remediation hints and have the import rejected | Prevents corrupt or incomplete content from breaking the public site; no mystery coercions. |
| **US-3** | Admin | As an admin, when my JSON is valid, I want to inspect a preview diff of changed sections before confirming | Peace of mind and accidental overwrite prevention. |
| **US-4** | Admin | As an admin, when I confirm the import, I want the active site state and draft storage to update instantly | Immediate feedback and local verification of new content. |
| **US-5** | Admin | As an admin, I want to export the current content store as a clean JSON file matching `v2-real-content.json` | Enables a full round-trip: export -> modify in preferred editor -> re-import. |
| **US-6** | Visitor | As a visitor, I want the portfolio to render reliably with no broken layouts, missing fields, or XSS vectors | High-quality, robust personal brand presentation. |

---

## 5. Functional Scope & Workflow

### 5.1 Admin Import/Export Modal & Controls
- Located in `/admin` header alongside the existing draft management controls.
- **Primary Actions:**
  - `[ Import JSON ]` button triggering the Import Modal.
  - `[ Export JSON ]` button triggering instant download of the current configuration.

### 5.2 Import Modal Tabs
1. **Upload File Tab:**
   - Drag-and-drop dropzone or system file picker.
   - Restricts file type to `.json` or `application/json`.
   - Displays file name and byte size upon selection.
2. **Paste Text Tab:**
   - Monospace textarea with syntax highlight or line numbering.
   - "Format / Prettify" button to format raw JSON.
   - Quick "Clear" button.

### 5.3 Step-by-Step Intake Lifecycle

```
[ Input: File / Text ]
          │
          ▼
   1. JSON.parse()
          ├─► Syntax Error? ──► Render Syntax Error with Line/Offset (Reject)
          ▼
   2. Format Normalizer
          ├─► Envelope (schemaVersion: 2)? Extract .config
          └─► Raw content root? Adopt directly
          ▼
   3. Schema & Validation Registry Check (validationRegistry.ts)
          ├─► Any Errors (Severity: 'error')? ──► Render Per-Field Diagnostics (Reject)
          ▼
   4. Change Detection & Preview
          ├─► Compute section-by-section diff (added/changed/removed count)
          ├─► Show any Warnings (Severity: 'warning') with advisory badges
          ▼
   5. User Confirmation ("Apply Changes")
          ▼
   6. Commit to State
          ├─► saveDraftToLocalStorage()
          ├─► dispatch({ type: 'SET_ENTIRE_CONFIG', payload: newConfig })
          └─► Flash success toast + Static deploy guidance
```

---

## 6. Validation & Error Handling Contract

### 6.1 Diagnostic Result Structure
Reuses and builds on `DiagnosticImportResult` in `src/lib/config/exportImport.ts`:

```ts
export interface DiagnosticImportResult {
  config?: PortfolioConfig
  summary: ValidationSummary
  syntaxError?: string
}

export interface ValidationIssue {
  id: string                     // e.g. "profile-email-invalid", "exp-0-org-required"
  section: keyof PortfolioConfig // 'profile' | 'experience' | 'projects' | ...
  itemId?: string                // Entity identifier if in an array
  field?: string                 // e.g. "email", "githubUrl"
  severity: 'error' | 'warning'
  message: string                // Human-readable issue description
  remediation?: string           // Specific instruction to fix the issue
}
```

### 6.2 Strict Rejection Rules (Fail-Closed)
1. **JSON Syntax Violations:** Unclosed brackets, trailing commas in strict JSON, invalid quotes.
2. **Missing Required Root Keys:** Missing any of the core sections required by `PortfolioConfig` (e.g. `profile`, `experience`, `projects`, `skills`, `education`, `roles`, `themes`).
3. **Type Mismatches:** String supplied where array expected, object where boolean expected, etc.
4. **Invalid Enums:**
   - `RoleId`: Must be one of `'software' | 'ai' | 'data' | 'system'`.
   - `ResumeVariant`: Must be one of `'software' | 'ai_ml' | 'data_analyst'`.
5. **Security Protocols (`isValidSafeUrl`):**
   - Must reject `javascript:`, `data:`, `vbscript:`, or unescaped control chars in any URL field.
6. **Zero Silent Coercion:**
   - If an unexpected extra field exists, flag as warning or reject if in strict mode; **never silently strip data without admin awareness**.

---

## 7. Export Round-Trip Specification

### 7.1 Target Export Structure
The export must generate a JSON file formatted as:
```json
{
  "schemaVersion": 2,
  "savedAt": "2026-09-06T10:00:00.000Z",
  "config": {
    "site": { ... },
    "roleModes": { ... },
    "home": { ... },
    "about": { ... },
    "careerJourney": [ ... ],
    "experience": [ ... ],
    "impact": { ... },
    "projects": [ ... ],
    "research": { ... },
    "skills": { ... },
    "education": [ ... ],
    "certifications": [ ... ],
    "currentlyExploring": { ... },
    "philosophy": { ... },
    "askKuldeep": { ... },
    "contact": { ... },
    "footer": { ... }
  }
}
```
*Note:* The exported `config` matches the schema of `agents/god/notes/v2-real-content.json` and the TypeScript definitions in `src/types/index.ts`.

### 7.2 Round-Trip Invariant Test
A user must be able to perform:
```
Export JSON -> Save to disk -> Import same file immediately -> 0 errors, 0 warnings, 0 diff
```

---

## 8. Acceptance Criteria Checklist

- [ ] **AC-1 (File Upload):** Admin can upload a valid `.json` file via file picker or drag-and-drop; payload is parsed without unhandled exceptions.
- [ ] **AC-2 (Text Paste):** Admin can paste raw JSON text into a dedicated textarea with an optional "Format JSON" action.
- [ ] **AC-3 (Syntax Guard):** Malformed JSON displays immediate inline syntax error messaging pointing to line/column, leaving the current draft state completely untouched.
- [ ] **AC-4 (Per-Field Diagnostics & Fail-Closed):** Any payload failing `validateConfigRegistry` displays a structured table/list of errors specifying Section, Field, Message, and Remediation. The "Apply" button remains strictly disabled.
- [ ] **AC-5 (No Silent Coercion):** Fields with wrong types or missing required values are rejected explicitly rather than defaulted or coerced.
- [ ] **AC-6 (Change Preview):** On valid JSON, the modal displays a diff summary (e.g. `Profile: 3 fields modified`, `Projects: 1 added`) before committing changes.
- [ ] **AC-7 (Apply & Hydration):** Confirming the import commits the data to `localStorage` (`kuldeep-portfolio-config-draft`), updates the active React context/reducer, and closes the modal with a success toast.
- [ ] **AC-8 (Round-Trip Export):** The "Export JSON" button emits a `.json` file matching `schemaVersion: 2` and `v2-real-content.json` structure that re-imports cleanly with 100% validity.
- [ ] **AC-9 (A11y & Zero Dependencies):** All modal controls, error lists, and tabs adhere to WCAG 2.1 AA (`aria-invalid`, `aria-describedby`, focus trap) and add zero runtime npm dependencies.

---

## 9. Non-Goals

1. **Server-Side Persistence / DB Storage:** Static GitHub Pages site. No server endpoints or databases in V2.1 (deferred to V2.2 roadmap).
2. **In-Browser Schema Visual Builder:** No drag-and-drop visual schema builder; standard JSON input/output.
3. **Automated Remote Git Pushes:** The client bundle does not embed GitHub PATs or push commits to GitHub directly.
4. **Multi-File Batch Imports:** Single cohesive JSON import only.

---

## 10. Open Questions & Recommendations for God

1. **Where does imported content persist on a static site?**
   - *Recommendation:* Two-tier model (Client-side draft in `localStorage` for immediate live session testing; Export file for Git commit to deploy permanently). V2.2 will address hosted DB persistence.
2. **Schema Versioning:**
   - *Recommendation:* Keep `schemaVersion: 2` for the envelope, matching the existing `CURRENT_SCHEMA_VERSION` in `exportImport.ts`.
3. **Dual Intake Flexibility:**
   - *Recommendation:* Support both wrapped `{ schemaVersion: 2, config: ... }` and naked root object (like `v2-real-content.json`). The normalizer unwraps automatically.
