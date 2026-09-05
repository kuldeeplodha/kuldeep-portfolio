# Portfolio V2 Design Specification

> **Objective:** Transition to a premium engineering portfolio (V2 Information Architecture) while maintaining the V1.6 glassmorphism visual system.

## 1. Core Visual Directives
- **Retain V1.6 Look:** This V2 architecture must be applied using the *existing* V1.6 UI tokens defined in `src/index.css`.
  - Radius: `rounded-[var(--radius-base)]`, `rounded-[var(--radius-card)]`, `rounded-[var(--radius-pill)]`.
  - Shadows/Glass: `shadow-[var(--shadow-glass-sm)]`, `shadow-[var(--shadow-glass-md)]`, `shadow-[var(--shadow-glass-lg)]` (hover states).
  - Backgrounds: Use `color-mix` combinations (e.g. `color-mix(in srgb, var(--color-bg) 90%, transparent)`).
- **Component Reuse:** Do NOT duplicate components. Evolve existing V1.6 components to support V2 layouts.
- **Section Headers:** Implement a consistent numbering system (`01 / SECTION TITLE`) using `var(--color-text-muted)` for the number and `var(--color-text)` for the title.

---

## 2. Information Architecture & Section Specifications

### 2.1 Navigation Restructure
- **Primary Links:** `Work`, `Experience`, `Lab`, `About`.
- **Secondary Actions:** `Ask Kuldeep`, `Resume`.
- **Styling:** Retain the V1.6 glass navbar (`backdrop-blur-md`, `shadow-[var(--shadow-glass-sm)]`). Dropdown menus or mobile menus follow the same V1.6 `menu-pop-in` animation.

### 2.2 Hero Restructure & Role Switcher Demotion
- **Hierarchy:** Clear display typography for the name and title ("Senior Software Engineer").
- **Message:** "I build scalable backend systems, APIs and engineering platforms." Focus on high-signal keywords (Backend · Architecture · APIs · Integrations).
- **CTAs:** `Explore work`, `Download resume`.
- **Role Switcher:** Move this component *below* the main hero message. Present it as "Explore another perspective" rather than a primary identity toggle.

### 2.3 Engineering Signal Section
- **Concept:** Replace generic skill percentage bars with high-signal engineering categories.
- **Layout:** A grid of V1.6 `radius-card` cards highlighting domains (e.g., Backend Systems, Architecture, Technical Leadership) and their associated keywords. Keep it text-driven and professional.

### 2.4 Selected Work (Case-Study Cards)
- **Concept:** Evolve `ProjectsSection` from generic portfolio previews to case-study cards.
- **Layout:** Vertical list or bento grid using `shadow-[var(--shadow-glass-md)]`.
- **Content:** Emphasize the problem, engineering complexity, and Kuldeep's specific contribution. Do not invent metrics. Use `radius-pill` tags for the tech stack. Link to the detailed project case study.

### 2.5 Experience Timeline
- **Concept:** A vertical timeline replacing flat experience cards.
- **Design:** Use a minimal line connecting roles.
- **Content:** Role, company, dates, context (2-3 sentences), and categorized bullet points (Engineering, Leadership, Systems).
- **Style:** Minimal containers with `radius-base`. Emphasize readability over excessive decoration.

### 2.6 How I Engineer (About Philosophy)
- **Concept:** Transition from a standard biography to an engineering philosophy overview.
- **Structure:** Step-by-step or numbered points (01 - Systems First, 02 - Simplicity Scales).
- **Visuals:** Clean, text-heavy layout with strong typographic hierarchy. No background cards needed—rely on white space.

### 2.7 Research Lab
- **Concept:** A technical notebook aesthetic highlighting experiments and deep-dives.
- **Design:** Use monospaced fonts (`var(--font-mono)`) for experiment numbers and status tags (`COMPLETED`, `IN PROGRESS`).
- **Cards:** Apply `radius-card` with a distinct border treatment (e.g., dashed borders or a darker `color-mix` surface) to separate it from the polished project case studies.

### 2.8 Engineering Stack
- **Concept:** A categorized grid of technologies.
- **Strict Rule:** **NO skill percentage bars.**
- **Layout:** Categorized lists (Backend, Data, Architecture, Infrastructure). Use `radius-base` cards for each category or a multi-column list. Use `radius-pill` for the individual tools.

### 2.9 Ask Kuldeep UI
- **Concept:** Retain the conversational AI component but streamline the UI.
- **Layout:** Integrate cleanly into the page flow. A prominent text input with suggested queries (Backend, Architecture, Systems, AI) below it as `radius-pill` quick-actions. Use `shadow-[var(--shadow-glass-md)]` for the chat interface.

### 2.10 Contact & Let's Build Something
- **Concept:** A strong, minimal call-to-action to close the page.
- **Message:** "Have an interesting engineering problem to solve?"
- **Visuals:** Large, centered typography with a primary button for getting in touch.

### 2.11 Footer
- **Layout:** Minimal, containing standard links (LinkedIn, GitHub, Email, Resume).
- **Styling:** Subdued colors (`var(--color-text-muted)`). Align with the grid used in the navigation.

---

## 3. Implementation Handoff
Sunanda will implement this phased architecture in the existing `src/` structure.
- **Dependency:** Wait for Kelly's content audit to ensure the text matches the V2 narrative.
- **Testing:** Existing Playwright E2E tests for navigation and accessibility must be updated to match the new DOM targets.
