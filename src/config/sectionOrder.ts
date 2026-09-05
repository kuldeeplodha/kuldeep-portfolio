/**
 * Single source of truth for the V2 homepage section numbering
 * (docs/design/portfolio-v2-design-spec.md §1 "Section Headers": `01 / TITLE`).
 *
 * This is the FINAL intended section order for the V2 information
 * architecture. Hero and the closing Contact/Footer are deliberately not
 * numbered — numbering applies to the main content sections between them.
 * Education/Certifications sit after the core engineering story (P5) —
 * kept visually secondary per uiContentRules, not "background noise" but
 * not competing with Selected Work/Experience for attention either.
 */
export const SECTION_ORDER = [
  'signal', // §2.3 Engineering Signal
  'work', // §2.4 Selected Work
  'experience', // §2.5 Experience Timeline
  'about', // §2.6 How I Engineer
  'lab', // §2.7 Research Lab
  'stack', // §2.8 Engineering Stack
  'education', // Background — kept compact/secondary
  'certifications', // Background — kept compact/secondary
  'ask', // §2.9 Ask Kuldeep
] as const

export type SectionSlug = (typeof SECTION_ORDER)[number]

/** Returns the zero-padded position of `slug` in the final V2 section order, e.g. "04". */
export function sectionNumber(slug: SectionSlug): string {
  return String(SECTION_ORDER.indexOf(slug) + 1).padStart(2, '0')
}
