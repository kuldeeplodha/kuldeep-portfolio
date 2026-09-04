# ADR-004: Zero-Dependency Configuration Validation Registry

## Status
Accepted (2026-09-04)

## Context
Phase 1.3 (Configuration Validation) requires a validation layer to prevent corrupted or incomplete configurations from breaking the site. We need a system that supports blocking errors and non-blocking warnings, provides real-time UI feedback, and strictly gates the export/import lifecycle.

## Decision
We will implement a **Zero-Dependency Declarative Validation Registry**.
- We reject external schema libraries (like Zod or Ajv) to strictly maintain the project's zero-dependency footprint.
- We reject JSON Schema as it is harder to integrate with our custom two-tier error/warning requirements and `configDraftReducer`.
- The registry will reside in `src/lib/config/validationRegistry.ts`.
- It will evaluate the draft state in real-time (debounced in the UI) and integrate with the `configDraftReducer` to block saves on fatal errors.

## Consequences
- **Positive:** Keeps bundle size minimal. Allows highly customized, context-aware validation messages and remediation hints as specified in PRD-002.
- **Negative:** Requires manually writing validation functions for every field (more boilerplate than a schema definition).
