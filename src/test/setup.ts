import '@testing-library/jest-dom/vitest'

// jsdom has no IntersectionObserver — needed by framer-motion's `whileInView`
// feature, used by the shared `Reveal`/`SectionShell` primitives (V2-P6).
// A minimal no-op stub is enough: unit tests don't assert on the actual
// scroll-triggered reveal animation (that's covered by e2e/polish-v2.spec.ts
// with real browser scrolling), they just need the component tree to mount
// without framer-motion throwing.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin: string = ''
    readonly scrollMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver
}
