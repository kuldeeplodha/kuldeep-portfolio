/**
 * Single source of truth for the V2 homepage section numbering
 * (docs/design/portfolio-v2-design-spec.md §1 "Section Headers": `01 / TITLE`).
 *
 * This is the FINAL intended section order for the V2 information
 * architecture — including slots for sections that are still content-gated
 * and haven't adopted <SectionHeader> yet (Selected Work, Experience,
 * Research Lab — see docs/design/portfolio-v2-design-spec.md §2.4/§2.5/§2.7).
 * Reserving their slot here means a later phase can add their header
 * without renumbering anything that already shipped.
 *
 * Hero and the closing Contact/Footer are deliberately not numbered —
 * numbering applies to the main content sections between them.
 */
export const SECTION_ORDER = [
  'signal', // §2.3 Engineering Signal (today: SkillsSection, pending content split)
  'work', // §2.4 Selected Work (ProjectsSection) — content-gated, no header yet
  'experience', // §2.5 Experience Timeline — content-gated, no header yet
  'about', // §2.6 How I Engineer
  'lab', // §2.7 Research Lab — content-gated, no header yet
  'stack', // §2.8 Engineering Stack — pending content split from Skills
  'ask', // §2.9 Ask Kuldeep
] as const

export type SectionSlug = (typeof SECTION_ORDER)[number]

/** Returns the zero-padded position of `slug` in the final V2 section order, e.g. "04". */
export function sectionNumber(slug: SectionSlug): string {
  return String(SECTION_ORDER.indexOf(slug) + 1).padStart(2, '0')
}
