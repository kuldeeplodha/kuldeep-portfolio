# Accessibility audit — WCAG 2.1 AA

_Last audited: 2026-08-22 (T-FE-1, verified by god on human request)_

## Summary

The portfolio targets **WCAG 2.1 Level AA** where practical. Core flows are keyboard-accessible, use semantic HTML, and respect `prefers-reduced-motion`.

## Checklist

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| Skip to main content | ✓ | `.skip-link` in Navbar → `#main-content` |
| Focus visible | ✓ | Global `:focus-visible` outline using `--color-accent` |
| Single h1 per page | ✓ | Hero (home), ProjectDetailPage, AdminPage |
| Heading hierarchy | ✓ | Sections use h2; subsections h3 |
| Keyboard navigation | ✓ | Role switcher tabs, CareerPipeline buttons, experience expand/collapse |
| Form labels | ✓ | Ask Kuldeep (`htmlFor` + sr-only label), admin inputs labeled |
| Live regions | ✓ | `aria-live="polite"` on Hero role transitions and Ask Kuldeep answers |
| Decorative content | ✓ | `aria-hidden` on HeroBackground, chart accents, pipeline arrows |
| Touch targets (mobile) | ✓ | Nav buttons `min-h-11 min-w-11` (44px) |
| Reduced motion | ✓ | CSS + `useReducedMotion` / Framer `useReducedMotion` |
| Color contrast | ✓ | Documented in `docs/DESIGN_SYSTEM.md` — all themes pass AA |
| Language | ✓ | `<html lang="en">` |
| Semantic landmarks | ✓ | `<main>`, `<nav>`, `<section>`, `<header>`, `<footer>` |

## Manual test steps

1. **Tab through homepage** — skip link appears on first Tab; all nav links reachable
2. **Role switcher** — Arrow keys between tabs; URL updates without full reload
3. **Career pipeline** — Tab to each stage; focus ring visible
4. **Experience timeline** — Enter/Space expands/collapses entries
5. **Ask Kuldeep** — Submit question; answer announced via live region
6. **Mobile menu** — Toggle with keyboard; links close menu on activate
7. **Reduced motion** — Enable in OS settings; Research Lab tokens stop animating

## Run automated tests

```bash
npm run test        # includes RoleSwitcher a11y assertions
npm run test:e2e    # navigation, role switch, mobile menu
```

## Known gaps / future work

- [ ] axe-core automated scan in CI (T-QA-1)
- [ ] Dynamic page `<title>` per route (minor enhancement)
- [ ] Full screen-reader walkthrough recording

## References

- `src/index.css` — skip-link, focus-visible, reduced-motion
- `docs/DESIGN_SYSTEM.md` — contrast table per theme
