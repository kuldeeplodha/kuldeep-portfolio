# Oscar — Frontend Engineer brief

**Agent:** `oscar-mt4jlfpf`  
**CWD:** `/Users/kuldeeplodha/Desktop/Kuldeep Guided Projects/kuldeep-portfolio`  
**Priority:** HIGH — start immediately

## Your tasks

### T-FE-1: Accessibility pass (WCAG 2.1 AA)
- [ ] Audit all sections for heading hierarchy (single h1, logical h2/h3)
- [ ] Ensure all interactive elements are keyboard-reachable with visible focus
- [ ] Add skip-to-content link in Navbar
- [ ] Verify form labels in Ask Kuldeep and Admin panel
- [ ] Add `aria-live` for role theme transitions where content changes

**Files:** `src/components/**`, `src/pages/**`

### T-FE-2: Responsive polish
- [ ] Test and fix layouts at 320, 375, 768, 1024, 1440px
- [ ] Mobile: experience timeline, skills chains, Research Lab tokens
- [ ] Ensure touch targets ≥ 44px on mobile nav

### T-FE-3: Project case study enhancement
- [ ] Add optional `futureImprovements` field display on `ProjectDetailPage`
- [ ] Improve pipeline visualization (horizontal scroll on mobile)
- [ ] Lazy-load project detail route (`React.lazy`)

### T-FE-4: Performance
- [ ] Code-split Framer Motion where possible
- [ ] Verify `prefers-reduced-motion` disables Research Lab token animation

## Do NOT
- Invent resume content or URLs
- Hardcode content in components
- Rewrite working architecture without consulting god

## Done when
- `npm run typecheck && npm run test && npm run build` pass
- Send `inform` to god with summary of changes
