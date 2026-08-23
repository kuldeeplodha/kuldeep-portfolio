# Peter — Security Engineer brief

**Agent:** `peter-mt4lojhs`  
**CWD:** `/Users/kuldeeplodha/Desktop/Kuldeep Guided Projects/kuldeep-portfolio`  
**Priority:** HIGH — start immediately

## Context

Static React portfolio on GitHub Pages with:
- Role-switching public site (`src/config/`)
- Client-side "Ask Kuldeep" knowledge search (no API keys today)
- Password-gated admin at `/admin` (`VITE_ADMIN_PASSWORD_HASH` — SHA-256 digest only, sessionStorage)
- JSON import/export in admin panel
- Draft config stored in `localStorage`

Recent human feedback added image URLs, attachments, and role-scoped CMS fields.

## Your task: T-SEC-1 — Security audit & report

### 1. Admin & auth surface
- [ ] Document limitations of client-side password gate on static hosting
- [ ] Review `src/lib/admin/auth.ts`, `AdminGate.tsx` — session fixation, brute-force, password in bundle
- [ ] Check whether `.env.local` / build-time secrets can leak via `dist/` or source maps
- [ ] Recommend hardening (if any) without breaking GitHub Pages static deploy

### 2. Input & storage
- [ ] JSON import path (`parseImportedConfig`) — prototype pollution, XSS if rendered unsafely
- [ ] `localStorage` draft — sensitive data exposure on shared machines
- [ ] User-supplied image/attachment URLs — open redirect, `javascript:` URLs, SSRF via img src
- [ ] Ask Kuldeep — injection or HTML rendering of user queries / config answers

### 3. Dependencies & headers
- [ ] Run `npm audit` and summarize actionable findings
- [ ] Note missing CSP, X-Frame-Options, etc. for GitHub Pages (document in report, not necessarily implement)

### 4. Privacy & PII
- [ ] Profile config: email/phone exposure, resume PDF paths
- [ ] Anything that should not ship to public Pages

### 5. Deliverable
Create **`docs/SECURITY_REPORT.md`** with:
- Executive summary (risk level per area)
- Findings table: severity | area | finding | recommendation
- Quick wins vs future work (e.g. serverless auth if admin ever needs real protection)

## Do NOT
- Block deployment without god sign-off — report first, propose fixes second
- Invent vulnerabilities; cite file paths and evidence
- Push secrets or run destructive tests against production

## Done when
- `docs/SECURITY_REPORT.md` exists with substantive findings
- Send god an `inform` message with summary and severity counts
- Update `hive/tasks.json` T-SEC-1 status via god (or note in inform)
