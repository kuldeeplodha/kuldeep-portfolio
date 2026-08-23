# Post-Deploy Verification Checklist

**Owner:** Imagine (Tester) · **Applies to:** GitHub Pages deployment via `.github/workflows/deploy.yml`
**Execute against:** the live Pages URL (e.g. `https://<user>.github.io/<repo>/`) once deployment exists.
**Rule:** every item below must PASS before the deployment is declared verified. Any FAIL → ticket to god with repro steps, expected vs actual, severity.

## 0. Pipeline health

- [ ] GitHub Actions run on the deploy commit is **green** (build + test + deploy jobs).
- [ ] Pages reports the latest commit as deployed (Settings → Pages / environment URL).

## 1. Asset loading (base-path correctness)

The production build sets `VITE_BASE_PATH` to the repo name — verify nothing is requested from site root `/`.

- [ ] Homepage HTML loads over HTTPS (`curl -sS -o /dev/null -w "%{http_code}" <URL>` → `200`).
- [ ] CSS bundle loads (DevTools → Network: stylesheet request `200`, no requests to `/assets/...` without repo prefix).
- [ ] JS bundles load and execute (app renders; no blank page).
- [ ] Images load (hero/portrait, project images, resume PDFs under `/resumes/`) — no broken-image icons.
- [ ] Fonts load (Network tab: font files `200`, text renders in intended typefaces).
- [ ] No `404`s in Network tab overall (filter by `4xx`/`5xx`).
- [ ] Deep link into a subpath (e.g. open `/projects/<slug>` directly) does not 404 at server level (SPA fallback works or hash/router strategy holds).

## 2. Console & runtime errors

- [ ] DevTools console on first load: **no errors**, no unhandled promise rejections.
- [ ] Navigate through all sections: console stays clean.
- [ ] No CSP violations reported in console (meta-tag policy from T-SEC-2).

## 3. Role switching

- [ ] Default role renders correctly.
- [ ] `?role=software`, `?role=ai`, `?role=data`, `?role=system` each render their themed content.
- [ ] Switching roles updates theme/content without full page reload; URL query param stays in sync.
- [ ] Direct load of each `?role=` URL deep-links to the right theme (refresh keeps state).
- [ ] Invalid `?role=` value falls back gracefully (no crash).

## 4. Navigation & routing

- [ ] Navbar links scroll/navigate to all sections (single-line layout intact).
- [ ] Project card → detail page navigates; breadcrumb/back returns to the correct section.
- [ ] Project detail **direct URL** loads standalone.
- [ ] Browser **Refresh** on detail page re-renders correctly (no 404, no lost state).
- [ ] Back/Forward buttons work across home ↔ detail transitions.
- [ ] Ask Kuldeep section answers from grounded knowledge base (client-side retrieval works in prod bundle).

## 5. Responsive / viewports

- [ ] Desktop 1440×900: layout intact, no horizontal overflow.
- [ ] Tablet ~768px: sections reflow cleanly.
- [ ] Mobile 320×640 (and Pixel 5 emulation): readable text, tappable targets ≥ 44px, no clipped content, skills/pipeline scrollers usable by touch.
- [ ] No layout shift on font/image load (CLS visually negligible).

## 6. Accessibility spot-check (prod parity)

- [ ] Keyboard-only pass: tab through navbar → sections → role switcher; focus visible everywhere.
- [ ] Scrollable containers (skills chain, pipeline) reachable via keyboard.
- [ ] axe scan on live URL (desktop + mobile emulation) → 0 serious/critical violations.

## 7. Security sanity (static-host context)

- [ ] Site served over HTTPS only; no mixed-content warnings.
- [ ] Admin gate present; note: password is client-side compiled (known obfuscation-only limitation per CICD_PLAN.md) — confirm no secrets beyond that are exposed in the bundle.
- [ ] `robots.txt` and `sitemap.xml` reachable (`200`), URLs inside use the canonical base path.

---

**Evidence convention:** record command outputs (HTTP codes, test counts) and annotated screenshots next to each checked item; append results to this file under "Verification run" when executed.

## Verification run

**Executed:** 2026-08-23T01:45Z vs https://kuldeeplodha.github.io/kuldeep-portfolio/ (deploy run 32610524676, commit `b5d0398` = merge of PR #2; tree byte-identical to gated `3d9297d`). Automated Playwright suite (`prod-verify.mjs`) + curl probes. **Overall: FAIL — blocked by T-DEPLOY-T1.**

| § | Item | Status | Evidence |
|---|------|--------|----------|
| 0 | Actions run green | PASS | Deploy run on `b5d0398` completed success (one earlier same-SHA run failed → retry succeeded, transient). CI green on `3d9297d`. |
| 0 | Pages serving latest commit | PASS | Live HTML serves `/kuldeep-portfolio/assets/index-CY4R2S_Q.js`, matching `b5d0398` build. |
| 1 | Homepage HTTPS 200 | PASS | curl + navigation: 200. |
| 1 | CSS/JS bundles load from correct base | PASS | All asset requests carry `/kuldeep-portfolio/` prefix; zero root-relative asset requests observed. |
| 1 | Fonts load | PASS | Google Fonts CSS 200; font file 200. |
| 1 | Images load | BLOCKED | 0 `<img>` mounted — T-DEPLOY-T1 prevents section render. |
| 1 | Subpath deep link (`/projects/<slug>`) | **FAIL** | Serves GitHub default 404 page (no SPA fallback). → **T-DEPLOY-T3** |
| 2 | Console clean | **FAIL** | (a) CSP violation: fetch of `fonts.googleapis.com/css2?...` violates `connect-src` → **T-DEPLOY-T4**; (b) react-router warning `No routes matched location "/kuldeep-portfolio/"` → T-DEPLOY-T1 symptom. No pageerrors/unhandled rejections. |
| 3 | Role themes via tabs | BLOCKED | Role tab UI never mounts (T1). Theme bootstrap itself works: body bg correct & distinct ×4 on deep links (software `rgb(15,20,25)` / ai `rgb(10,14,26)` / data `rgb(248,250,252)` / system `rgb(17,24,39)`). |
| 3 | `?role=` deep links + invalid fallback | PARTIAL | Deep-link theme application PASS ×4; content render + URL-sync/no-reload checks BLOCKED by T1. |
| 4 | Nav anchors / project routing / Ask Kuldeep | BLOCKED | Only navbar + footer exist in DOM (#root has 2 children, no `h1`/`h2` anywhere). |
| 5 | Viewports 1440/768/320 | PARTIAL | 320px: no horizontal overflow (trivial — near-empty page); meaningful layout checks BLOCKED by T1. Tap-target spot-check flagged navbar brand cluster 32px height (re-check after T1). |
| 6 | Keyboard focus + axe | PARTIAL | Focus-visible outline present on first Tab (solid outline). axe mobile: 0 serious/critical — **but scanned the unmounted skeleton only**; re-scan required post-fix. Desktop axe BLOCKED. |
| 7 | HTTPS-only, no mixed content | PASS | Zero non-https requests across all sessions. |
| 7 | Admin gate + draft round-trip | BLOCKED | `/admin` renders login-shell only; Password field absent (T1). |
| 7 | Secrets in bundles | PASS | All JS bundles fetched & regex-scanned (sk-/ghp_/AKIA/private-key): none found. |
| 7 | sitemap.xml reachable, canonical URLs | PASS | `/kuldeep-portfolio/sitemap.xml` → 200. |
| 7 | robots.txt | **FAIL** | `https://kuldeeplodha.github.io/robots.txt` → 404. → **T-DEPLOY-T2** |

### Tickets raised

- **T-DEPLOY-T1 (Blocker) — Router basename missing on Pages build.** Symptom: prod serves only navbar+footer; console: `No routes matched location "/kuldeep-portfolio/"`. Expected: full SPA. Likely fix: `<BrowserRouter basename={import.meta.env.BASE_URL}>` in `src/main.tsx` (local dev unaffected since BASE=`/`). Blocks §§1–6 substantive checks.
- **T-DEPLOY-T2 (Low) — robots.txt missing** at site root; checklist §7 expects 200.
- **T-DEPLOY-T3 (Medium) — No SPA fallback for subpaths:** direct/refreshed `/projects/<slug>` URLs get GitHub default 404. Fix: copy `index.html` → `dist/404.html` in deploy workflow (works with basename-corrected router).
- **T-DEPLOY-T4 (Medium) — CSP self-violation:** strict CSP meta blocks `connect-src` fetch of Google Fonts stylesheet requested at runtime. Either allow `style-src https://fonts.googleapis.com` (+ `font-src https://fonts.gstatic.com`) explicitly, or self-host fonts (preferred: removes external dep entirely).

**Re-test plan:** after T1 (+ideally T3/T4) land on main and Pages redeploys, re-run `prod-verify.mjs` end-to-end; all BLOCKED/PARTIAL items must resolve to PASS before deployment is declared verified.
