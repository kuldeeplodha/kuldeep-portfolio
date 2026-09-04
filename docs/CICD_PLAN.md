# CI/CD Deployment Plan: GitHub Actions Pipeline

To deploy the **Munder Difflin** portfolio website autonomously to GitHub Pages, we have set up a workflow that runs tests, checks typings, builds the project, and deploys the static assets.

## Workflow Overview

The GitHub Actions workflow is defined at:
[`deploy.yml`](file:///Users/kuldeeplodha/Desktop/Kuldeep%20Guided%20Projects/kuldeep-portfolio/.github/workflows/deploy.yml)

### Workflow Steps:
1. **Trigger:** Fires on any push to the `main` branch or manual trigger via `workflow_dispatch`.
2. **Build Job:**
   - Checks out code.
   - Installs Node.js v22 and caches npm packages.
   - Runs `npm ci` (clean install).
   - Runs `npm run lint` (code quality check).
   - Runs `npm run typecheck` (TypeScript validation).
   - Runs `npm run test` (unit tests).
   - Installs Playwright Chromium dependencies and runs `npm run test:e2e` (E2E testing).
   - Runs `npm run build` (builds production assets with `VITE_BASE_PATH` set to the repo name).
   - Uploads the built static files (`dist`) as a GitHub Pages artifact.
3. **Deploy Job:**
   - Deploys the uploaded artifact to GitHub Pages.

---

## Coverage Enforcement (V1.4 · WS-1 · T-QA-7)

The PR CI workflow (`.github/workflows/ci.yml`) runs `npm run test:coverage`
instead of `npm run test`. This produces a V8 coverage report and **fails the
build when coverage drops below the floor** configured in
`vite.config.ts` → `test.coverage.thresholds`.

**Phase A floors of record** (ADR-005 Amendment-1, confirmed by architect):

| Metric | Floor |
| --- | --- |
| Statements | 58% |
| Lines | 58% |
| Functions | 45% |
| Branches | 50% |
| `validationRegistry.ts` branches | 90% (PRD-V1.4 AC-1.3) |

- Floors are **up-only**: Phase B ratchets them higher after further targeted
  suites; they never drop without an ADR note.
- **Denominator:** all `src/**` app source except the e2e-only view shells
  (`HomePage.tsx`, `AdminPage.tsx`), the React bootstrap (`main.tsx`),
  type-only files, and the test suites themselves — so the floor reflects
  unit-testable code.
- The full HTML coverage report is uploaded as the **`coverage-report`** CI
  artifact on every run (14-day retention); `lcov.info` is emitted for
  external tooling.
- Tooling: `@vitest/coverage-v8` (dev-only; no runtime dependency added).

---

## Action Items: How to Setup & Activate

To activate this pipeline, follow these 3 steps:

### 1. Initialize Git and Push to GitHub
If you haven't already initialized git and pushed your repository to GitHub, run the following commands in the project directory (`/Users/kuldeeplodha/Desktop/Kuldeep Guided Projects/kuldeep-portfolio`):
```bash
git init
git add .
git commit -m "feat: initial commit with CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### 2. Configure GitHub Pages Permissions
On GitHub, go to your repository settings to enable actions-based deployments:
1. Navigate to **Settings** -> **Pages** (in the sidebar).
2. Under **Build and deployment** -> **Source**, select **GitHub Actions** (instead of *Deploy from a branch*).

### 3. Provide Environment Variables / Social URLs
Once the pipeline runs, update the `.env` configuration or provide the god agent with the following details so they can be injected into the build:
- **LinkedIn URL**
- **GitHub URL**
- **Canonical Deployment URL** (e.g. `https://<your-username>.github.io/<your-repo-name>/`)

---

## Security Consideration

> [!WARNING]
> The admin CMS panel gate is client-side only. Since 2026-08-23 the build embeds a `VITE_ADMIN_PASSWORD_HASH` (SHA-256 hex digest) instead of the plaintext password, so the raw password no longer appears in the production bundle — but the gate itself remains deterrence-grade and should not protect confidential data. True server-side auth would require a backend/serverless function.
