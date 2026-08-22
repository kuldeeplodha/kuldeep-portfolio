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

_(pending — execute after first successful Pages deployment)_
