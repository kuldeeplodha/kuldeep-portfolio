/**
 * V2.1 P1 shared page grid (docs/design/portfolio-v2.1-spec.md §18): one
 * consistent content grid — max-width 1200-1280px, desktop padding
 * 24-48px, mobile 16-20px — that every major section aligns to. Exported
 * as constants (rather than repeated literal classnames) so SectionShell,
 * Hero, and Navbar can't drift apart from each other.
 */
export const GRID_PADDING = 'px-4 sm:px-5 lg:px-12'
export const GRID_WIDTH = 'max-w-[1200px]'
export const GRID_WIDTH_NARROW = 'max-w-3xl'
