# QA Audit Report

**Date:** 2026-08-22  
**Auditor:** Imagine (Tester)

## Executive Summary

This report documents the Quality Assurance (QA) audit for the `kuldeep-portfolio` application. The audit evaluates compliance with Accessibility standards (WCAG 2.1 AA target), End-to-End (E2E) user flows, and Content Validation.

Following the audit, multiple critical accessibility fixes were implemented, and an automated accessibility scanning suite using `@axe-core/playwright` was introduced. Currently, all **18 Playwright E2E tests** (including 6 automated accessibility scans) and all **15 Vitest unit tests** pass with **100% success**.

---

## 1. Accessibility (a11y) Audit

We evaluated the application against **WCAG 2.1 Level AA** criteria.

### Automated Accessibility Scans
We integrated `@axe-core/playwright` into the E2E testing pipeline (`e2e/accessibility.spec.ts`) to run automated checks across multiple viewports (`Desktop Chrome` and `Pixel 5` emulation) on key pages.

### Audit Findings & Resolutions

| Page / Component | Finding | Severity | Resolution |
| :--- | :--- | :--- | :--- |
| **Research Lab (Tokens)** | Decorative translation tokens (e.g. `मशीन`, `语言`) had low color contrast (e.g. 2.37–2.45 ratio) because of low opacity styles on the text. | **Serious** | Set base opacity to `1.0` and adjusted animations so that non-highlighted tokens use the compliant `--color-text-muted` color, achieving a contrast ratio $> 4.5:1$ across all themes. |
| **Skills Section** | Scrollable skill chain containers (`.overflow-x-auto`) were not reachable/scrollable via keyboard. | **Serious** | Added `tabIndex={0}` to all skill chain containers in `SkillsSection.tsx` so keyboard-only users can focus and scroll them using arrow keys. |
| **Project Detail Page** | Scrollable Pipeline flow container (`.overflow-x-auto`) was not keyboard accessible. | **Serious** | Added `tabIndex={0}` and `aria-label="Pipeline steps"` to the scrollable container in `ProjectDetailPage.tsx`. |

All automated axe-core scans now pass with **0 violations** on both desktop and mobile layouts.

---

## 2. End-to-End (E2E) Test Suite

The Playwright test suite was executed across multiple browsers and viewport sizes:
* **Home Page Loading:** Verifies hero section and role switcher.
* **Role Switching:** Verifies query parameter updating (`?role=...`) and client-side page updates without a full page reload.
* **Anchor Navigation:** Validates viewport scrolling to section anchors (e.g., `#projects`).
* **Case Study Navigation:** Ensures the project detail page loads correctly with its pipeline steps and links.
* **Ask Kuldeep (Grounded AI):** Verifies the client-side search matches query patterns and serves grounded answers from the knowledge base.
* **Admin Login Gate:** Confirms input password-gate requires authentication before displaying the CMS panel.

**Status:** All 12 functional E2E tests pass successfully.

---

## 3. Content Validation

We validated the portfolio's data structure via unit tests in `src/test/config.test.ts` and `src/test/components.test.tsx`:
* **Schema Integrity:** Checked that importing malformed configurations (e.g., missing profile details, non-array experience sections, projects lacking titles) throws appropriate structure errors.
* **Role Highlighting Logic:** Confirmed that selecting specific roles correctly highlights the intended metrics and projects (e.g., `software` highlights backend metrics; `ai` highlights ML projects).
* **Grounded Search Precision:** Tested the client-side AI knowledge base with multiple query patterns, verifying it filters stop words/punctuation and correctly prioritizes answers by matching relevance score.

---

## Test Execution Summary

```
# Vitest Unit Tests
Test Files  2 passed (2)
     Tests  15 passed (15)

# Playwright E2E & Accessibility Tests
Running 18 tests using 4 workers
  18 passed (11.8s)
```

## Coverage Enforcement (V1.4 · T-QA-7)

The unit suite now runs under a CI-enforced coverage floor via
`npm run test:coverage` (`@vitest/coverage-v8`, dev-only). See
[`CICD_PLAN.md`](./CICD_PLAN.md#coverage-enforcement-v14--ws-1--t-qa-7) for the
floors of record and denominator.

Current suite: **9 Vitest files / 155 tests** passing (added
`coverageExpansion.test.ts` and `useRole.test.tsx` to drive the validation
registry, exportImport, AI provider, and role-hook branches). Measured
coverage on the enforced denominator:

| Metric | Measured | Floor |
| --- | --- | --- |
| Statements | ~81.6% | 58% |
| Lines | ~82.6% | 58% |
| Functions | ~69.6% | 45% |
| Branches | ~71.8% | 50% |
| `validationRegistry.ts` branches | ~96.7% | 90% |

The HTML report is published as the `coverage-report` CI artifact each run.
