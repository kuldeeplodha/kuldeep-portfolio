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
> The admin CMS panel password (`VITE_ADMIN_PASSWORD`) is compiled into the production client-side JS bundle. Any user viewing the source code can retrieve this password. This is suitable for a simple static presentation but should not protect confidential data.
