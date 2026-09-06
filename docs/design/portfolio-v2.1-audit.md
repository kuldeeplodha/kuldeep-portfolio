# Portfolio V2.1 Audit & Refinement Plan

## 1. Audit Table (Step 3 Format)

| Area | Current | Problem | Impact | Recommendation | Implementation |
|---|---|---|---|---|---|
| **Hero** | Visually heavy, multiple CTAs/perspectives compete. | Cluttered focal point; primary identity is diluted. | Visitor confusion within first 5 seconds. | Simplify to one focal point. Emphasize "Senior Software Developer" + backend/architecture keywords. | Update `Hero.tsx`, remove visual noise, update typography to strong display font constraints. |
| **Nav** | Complex IA, multiple dropdowns or hidden items. | Cognitive overload. | Users can't find core sections quickly. | Adopt simpler IA: KULDEEP (Work, Experience, Lab, About, Ask, Resume). | Update `Navbar.tsx`, remove legacy routes/links, streamline `menu-pop-in`. |
| **Tokens/Design-System** | Existing `radius-base`/`card` & `shadow-glass`. | Disconnected usage across sections. | Inconsistent feel between components. | Unify component usage to rely strictly on centralized CSS variables (`radius-card`, `radius-pill`). | Update section layout files to rely on `var(--radius-card)` and `hover-lift`. |
| **Role-System Divergence** | `terminal`/`neural`/`dashboard` have distinct visual schemas. | "Four unrelated websites" feeling. | Weakens the unified personal brand. | Reduce divergent themes. They should be content/emphasis perspectives, not separate visual systems. | Update `useRole.tsx` and `index.css` to reduce aggressive theme overrides (e.g. drop heavy terminal/neural CSS). |
| **Experience** | Standard horizontal/flat layout. | Hard to scan quickly. | Recruiters miss key timeline progression. | Implement premium vertical timeline with scannable bullet constraints (max 5 bullets). | Refactor `ExperienceSection.tsx` into a vertical timeline. |
| **Projects+Detail** | Generic cards & standard layout. | Lacks engineering depth. | Viewed as simple side-projects. | Transition to "Selected Engineering Work" case-study style. Emphasize architecture and problem-solving. | Update `ProjectsSection.tsx` and `ProjectDetailPage.tsx`. |
| **How-I-Engineer** | Standard bio text ("About"). | Generic, lacks technical personality. | Fails to show engineering philosophy. | Restructure as numbered points (e.g., 01 - Systems First). | Refactor `AboutSection.tsx` into `HowIEngineerSection.tsx`. |
| **Research Lab** | Card grid. | Blends in with Projects. | Signature feature is lost. | Adopt technical notebook aesthetic (monospaced numbers, STATUS tags). | Update `ResearchLabSection.tsx`. |
| **Stack** | May include % bars or generic lists. | Unprofessional skill indicators. | Lowers perceived seniority. | Categorize into Backend, Data, Architecture, Infra. Remove all percentages/bars. | Refactor `SkillsSection.tsx` to categorical lists. |
| **Ask Kuldeep** | Existing conversational UI. | May feel disconnected from engineering flow. | Underutilized. | Streamline input + suggested prompt chips. | Update `AskKuldeepSection.tsx`. |
| **Contact/Footer** | Standard links. | Lacks strong CTA. | Wasted final impression. | Make it a prominent "Let's build something" CTA block. | Update `Footer.tsx` and Contact section. |
| **Blog** | Custom typography added in V2-P5. | Good typography, but layout could be cleaner. | Minor. | Ensure blog layout matches V2.1 constraints. | Validate `BlogListPage.tsx` and `BlogDetailPage.tsx`. |
| **Mobile** | Responsive, but potentially messy nav/timeline. | Poor experience on 320-414px. | High drop-off. | Explicitly test and refine mobile padding, font-sizes, and timeline line wrapping. | Adjust Tailwind responsive classes across all sections. |
| **A11y** | Existing skip links and focus rings. | May degrade with new V2 layouts. | Fails standards. | Ensure all new interactive elements maintain `focus-visible:ring-2`. | Audit interactive elements across `src/components`. |
| **Motion** | `menu-pop-in` and `hover-lift`. | Could become excessive. | Distracting for users. | Keep motion restricted and purposeful. Ensure `prefers-reduced-motion` catches all new additions. | Validate `framer-motion` and CSS animations. |
| **Perf** | Good bundle size. | New features could bloat it. | Slower TTI. | No heavy new dependencies. Keep SVGs inline and optimize images. | Check bundle size budget. |

## 2. Minimum Set of Files Touched

- `src/config/portfolio.json` / JSON import logic (Content)
- `src/components/layout/Navbar.tsx` (Nav restructure)
- `src/components/sections/Hero.tsx` (Hero simplification)
- `src/components/sections/ExperienceSection.tsx` (Timeline)
- `src/components/sections/ProjectsSection.tsx` & `ProjectDetailPage.tsx` (Case studies)
- `src/components/sections/AboutSection.tsx` (How I Engineer)
- `src/components/sections/ResearchLabSection.tsx` (Notebook styling)
- `src/components/sections/SkillsSection.tsx` (Engineering Stack)
- `src/components/ui/RoleSwitcher.tsx` (Demotion)
- `src/index.css` (Role system refinement)

## 3. Phase Breakdown (Steps 5-24 mapped to 4 Gated Phases)

- **Phase 1: Foundation (Tokens, Grid, Nav, Hero, JSON Import)**
  - *JSON Content-Import feature is implemented here to ensure all subsequent UI is driven by `v2-real-content.json`.*
  - Incorporates Spec Steps 5-18 (Design Direction, Role Refinement, Hero, Nav, Grid).
- **Phase 2: Sections (Experience, Projects, How I Engineer, Stack)**
  - Incorporates Spec Steps 19, 20, 23, 24-32, 38-40 (Section Headers, Experience Timeline, Project Cards, Engineering Stack).
- **Phase 3: Signature Features (Research Lab, Ask Kuldeep)**
  - Incorporates Spec Steps 35-37, 43-45 (Research Lab Notebook Aesthetic, Ask Kuldeep integration).
- **Phase 4: Polish (Mobile, Accessibility, Motion, Footer, Validation)**
  - Incorporates Spec Steps 46-47 (Contact/Footer), plus overall site polish matching Spec Steps 61-75 (Motion, A11y, Perf).

## 4. SOFTWARE-PRIMARY Repositioning (Explicit Call)

The spec uses illustrative examples (EMR, CRM, Billing) which luckily *do* align perfectly with Kuldeep's actual `v2-real-content.json` experience (Vidai Solutions). To reposition as SOFTWARE-PRIMARY without fabrication:
1. **Primary Identity:** Default to the "Senior Software Developer" / Backend identity. The Hero must loudly declare this role and emphasize Backend, Architecture, and API integrations.
2. **Role System Demotion:** The role switcher will be moved below the main hero message and labeled "Explore another perspective". This reframes AI/ML and Data not as separate careers, but as *additional competencies of a Backend Engineer*.
3. **No Fabrication:** We will strictly populate the Engineering Signal, Research Lab (e.g. NLP/Explainability from his MS), and Projects using ONLY the facts from `v2-real-content.json`. AI/ML details will be presented as his academic/research background that complements his production software engineering experience, avoiding the false impression that he is primarily an AI Researcher by day.
