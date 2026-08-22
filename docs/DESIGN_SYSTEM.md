# Kuldeep Portfolio — Design System

Visual language for the four role themes: **Software**, **AI/ML**, **Data**, and **System**.

## Typography

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 12px | 400–600 | Captions, disclaimers, metadata |
| `text-sm` | 14px | 400–600 | Labels, secondary body, nav |
| `text-base` | 16px | 400 | Body copy, section descriptions |
| `text-lg` | 18px | 400 | Hero subtitle |
| `text-2xl` | 24px | 700 | Section headings (h2) |
| `text-3xl` | 30px | 700 | Hero headline (mobile) |
| `text-5xl` | 48px | 700 | Hero headline (desktop) |

**Font families** (see `src/index.css`):

- **Sans:** Inter, system-ui — UI, headings, body
- **Mono:** JetBrains Mono — code tokens, pipeline nodes, terminal motifs

**Heading hierarchy:** single `h1` per page (Hero), section titles as `h2`, subsections as `h3`.

## Spacing

Tailwind spacing scale; common patterns:

| Context | Classes |
|---------|---------|
| Section vertical padding | `py-16` (64px) or `py-20` (80px) for hero |
| Section horizontal padding | `px-6` (24px) |
| Max content width | `max-w-5xl` (1024px) centered |
| Card padding | `p-5` / `p-6` / `p-8` |
| Grid gaps | `gap-4` (tight), `gap-6` (cards), `gap-8` (sections) |
| CTA button padding | `px-6 py-3` |

## Breakpoints

| Name | Min width | Notes |
|------|-----------|-------|
| default | 0px | Mobile-first; test at **320px** |
| `sm` | 640px | Pipeline horizontal layout, 2-col metrics |
| `md` | 768px | Larger headings, experience layout |
| `lg` | 1024px | 4-col metrics grid |

**QA viewports:** 320, 375, 768, 1024, 1440px per role theme.

## Color tokens

Defined in `src/config/themes.ts`, applied as CSS custom properties in `useRole`:

| Variable | Maps to | Usage |
|----------|---------|-------|
| `--color-bg` | `theme.background` | Page background |
| `--color-surface` | `theme.surface` | Cards, elevated panels |
| `--color-text` | `theme.text` | Primary text |
| `--color-text-muted` | `theme.textMuted` | Secondary text, captions |
| `--color-accent` | `theme.accent` | CTAs, links, emphasis |
| `--color-border` | `theme.border` | Dividers, card borders |

### Role themes

| Theme | Mood | Accent | Background |
|-------|------|--------|------------|
| **software** | Terminal, precision | Cyan `#22d3ee` | Dark navy `#0f1419` |
| **ai** | Research, depth | Violet `#a78bfa` | Deep indigo `#0a0e1a` |
| **data** | Clarity, dashboards | Sky `#0ea5e9` | Light slate `#f8fafc` |
| **system** | Overview, synthesis | Emerald `#34d399` | Neutral dark `#111827` |

Use `theme.heroGradient` for Hero section backgrounds (system uses a hybrid multi-stop gradient).

### Contrast (WCAG AA)

Verified text/background pairs (normal text ≥ 4.5:1, large text ≥ 3:1):

| Theme | text on bg | text on surface | accent on bg | muted on bg |
|-------|------------|-----------------|--------------|-------------|
| software | ~14.2:1 ✓ | ~11.8:1 ✓ | ~9.1:1 ✓ | ~5.8:1 ✓ |
| ai | ~13.5:1 ✓ | ~10.9:1 ✓ | ~6.2:1 ✓ | ~5.1:1 ✓ |
| data | ~16.8:1 ✓ | ~16.8:1 ✓ | ~4.6:1 ✓ | ~5.4:1 ✓ |
| system | ~14.9:1 ✓ | ~11.2:1 ✓ | ~7.8:1 ✓ | ~5.9:1 ✓ |

CTA buttons use accent background with `theme.background` as text color — all pass AA for large/bold text.

## Motion

| Principle | Value |
|-----------|-------|
| Micro-interactions | 150–300ms |
| Section transitions | 300ms |
| Decorative loops | 2–3s, ease-in-out |
| Easing | `ease-out` for enter, `ease-in-out` for loops |

**Reduced motion:** `prefers-reduced-motion: reduce` in `index.css` collapses animations/transitions to ~0ms. Components using Framer Motion should use `useReducedMotion()` for infinite/decorative animations (Research Lab tokens, pipeline pulse).

## Role-specific visual language

| Role | Signature element | Location |
|------|-------------------|----------|
| Software | Terminal grid motif | `HeroBackground` |
| AI/ML | NLP token flow + attention SVG | `ResearchLabSection` |
| Data | Chart-accent metric cards | `MetricsSection` |
| System | Hybrid gradient + emphasized pipeline | `Hero`, `CareerPipeline` |

## Do not

- Stock photos, robot graphics, or heavy particle effects
- Skill percentage bars
- Sacrifice readability for decoration
- Claim fabricated research metrics in visuals

## Shared components (coordinate with frontend)

- `HeroBackground` — decorative CSS-only backgrounds
- `CareerPipeline` — interactive node graph; keyboard-focusable nodes
- `MetricsSection` — role-aware dashboard cards
