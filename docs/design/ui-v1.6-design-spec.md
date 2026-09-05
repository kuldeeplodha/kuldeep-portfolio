# V1.6 UI Design Specification: Refined Glassmorphism + Gradient Mesh

This document serves as the final implementation specification for the V1.6 UI Modernization (Level 2). It synthesizes Kelly's initial research/audit with Imagine's visual spike to provide concrete tokens and component-level instructions for engineering (Sunanda).

## 1. Design Tokens (CSS Variables)

We will unify the research doc's proposed scale and the spike's successful simplified values. These must be defined in the `@theme` block of `src/index.css` (Tailwind v4).

### Radius Scale
The spike successfully simplified the radius scale. We will adopt a concise 3-tier system:
- `--radius-base: 16px;` (for buttons, dropdowns, inputs)
- `--radius-card: 24px;` (for large surfaces: blog cards, project cards)
- `--radius-pill: 9999px;` (for tags, avatars)

*Implementation Note:* Remove all ad-hoc `rounded-lg`, `rounded-md`, etc. Replace with `rounded-[var(--radius-base)]` or `rounded-[var(--radius-card)]`.

### Elevation & Glassmorphism Scale
Adopt the spike's `shadow-glass` but map it into a standardized scale:
- `--shadow-glass-sm: 0 4px 16px 0 color-mix(in srgb, var(--color-text) 5%, transparent);` (Navbar, dropdowns)
- `--shadow-glass-md: 0 8px 32px 0 color-mix(in srgb, var(--color-text) 5%, transparent);` (Cards, default state)
- `--shadow-glass-lg: 0 12px 48px 0 color-mix(in srgb, var(--color-accent) 15%, transparent);` (Cards, hover state)

### Gradient Mesh (Phase 2)
For future components (hero, featured blog), define base gradient tokens per role in the `useRole` hook:
- `--color-gradient-1`
- `--color-gradient-2`
- `--color-gradient-3`

## 2. Component Specifications

### 2.1 Navbar (Leaner IA + Glassmorphism)
**Reference:** Imagine's spike (`spike/ui-modernization`) successfully implements the interaction model.
- **Visuals:** Keep the `backdrop-blur-md` and border. Add `shadow-[var(--shadow-glass-sm)]` when scrolled.
- **IA (Desktop):** 
  - Show 4 primary links: `Projects`, `Experience`, `Skills`, `Contact`.
  - Add a `More ▾` dropdown containing: `Research`, `Education`, `About`, `Ask Kuldeep`.
  - Keep `Blog` and `Resume` exposed as primary call-to-actions.
- **Interaction:** Use `framer-motion` for the dropdown (as seen in the spike). Ensure the dropdown is fully keyboard accessible (use `focus-within` or `onBlur` for closing, and ensure `aria-expanded` is toggled).
- **Mobile Menu:** Use the single-column layout from the spike, grouping `NAV_ITEMS` cleanly.

### 2.2 Blog List Page (Bento/Card Uplift)
**Reference:** Imagine's spike (`spike/ui-modernization`) nails the card animation and hover states.
- **Card Styling:** Use `rounded-[var(--radius-card)]`, `shadow-[var(--shadow-glass-md)]` transitioning to `shadow-[var(--shadow-glass-lg)]` on hover.
- **Bento Grid:** Update the flat list to a CSS Grid. `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. (The spike kept a 1-column list; we must implement a true bento grid as specified in the original research).
- **Typography:** The spike's `text-5xl font-extrabold` for the page title is approved.
- **Tags:** Use `rounded-[var(--radius-pill)]` with `color-mix` backgrounds for high-contrast, accessible tags.
- **Motion:** Use `framer-motion` `staggerChildren` for page load, and a subtle `y: -4` hover lift on cards (keep exactly as spiked).

## 3. Engineering Guidelines
1. **Zero New Dependencies:** Continue using Tailwind v4 and `framer-motion`.
2. **Accessibility:** Ensure all new dropdown buttons have `aria-haspopup="menu"` and `aria-expanded`. Maintain focus rings (`focus-visible:ring-2`) exactly as restored in the spike.
3. **Role Themes:** Do NOT break the existing 4 role themes (`software`, `neural`, `dashboard`, `hybrid`). The new CSS variables must inherit and blend with the existing `--color-bg`, `--color-text`, and `--color-accent` tokens via `color-mix()`.
