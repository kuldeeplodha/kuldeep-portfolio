import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useRole } from '../hooks/useRole'
import { ResearchLabSection } from '../components/sections/ResearchLabSection'
import { SiteContentProvider } from '../lib/content/SiteContentProvider'

// CMS-UNIFY-CONFIG-EDITOR: confirms the 3 newly-DB-wired keys (roles,
// certifications, research) actually swap to the live DB value once the
// provider resolves — the generic siteContentProvider.test.tsx already
// covers the fallback/error/empty mechanics generically, this covers the
// specific new call sites.

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

function wrapperWithProvider(initialEntry: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <SiteContentProvider>{children}</SiteContentProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe('useRole — roles/certifications read from the DB when published', () => {
  it('uses the DB-published roles record instead of the bundled default', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'roles',
          data: {
            software: { id: 'software', label: 'DB Software Label', themeId: 'software', hero: { eyebrow: '', headline: '', subtitle: '', focus: [], primaryCta: '', primaryCtaTarget: '', secondaryCta: '', secondaryCtaTarget: '' }, highlightedSkillIds: [], highlightedProjectIds: [], highlightedMetricIds: [], experiencePriorityIds: [], resumeVariant: 'software', navEmphasis: [] },
            ai: { id: 'ai', label: 'AI', themeId: 'ai', hero: { eyebrow: '', headline: '', subtitle: '', focus: [], primaryCta: '', primaryCtaTarget: '', secondaryCta: '', secondaryCtaTarget: '' }, highlightedSkillIds: [], highlightedProjectIds: [], highlightedMetricIds: [], experiencePriorityIds: [], resumeVariant: 'ai_ml', navEmphasis: [] },
            data: { id: 'data', label: 'Data', themeId: 'data', hero: { eyebrow: '', headline: '', subtitle: '', focus: [], primaryCta: '', primaryCtaTarget: '', secondaryCta: '', secondaryCtaTarget: '' }, highlightedSkillIds: [], highlightedProjectIds: [], highlightedMetricIds: [], experiencePriorityIds: [], resumeVariant: 'data_analyst', navEmphasis: [] },
            system: { id: 'system', label: 'System', themeId: 'system', hero: { eyebrow: '', headline: '', subtitle: '', focus: [], primaryCta: '', primaryCtaTarget: '', secondaryCta: '', secondaryCtaTarget: '' }, highlightedSkillIds: [], highlightedProjectIds: [], highlightedMetricIds: [], experiencePriorityIds: [], resumeVariant: 'software', navEmphasis: [] },
          },
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    const { result } = renderHook(() => useRole(), { wrapper: wrapperWithProvider('/?role=software') })
    await waitFor(() => expect(result.current.role.label).toBe('DB Software Label'))
  })

  it('uses the DB-published certifications list instead of the bundled default', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'certifications',
          data: [{ id: 'db-cert', name: 'DB-Only Certification', issuer: 'Test Issuer', date: '2026', sourceVariants: ['software', 'ai_ml', 'data_analyst'] }],
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    const { result } = renderHook(() => useRole(), { wrapper: wrapperWithProvider('/?role=software') })
    await waitFor(() => expect(result.current.filteredCertifications.some((c) => c.name === 'DB-Only Certification')).toBe(true))
  })

  it('falls back to the bundled roles/certifications when the DB has neither published', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    const { result } = renderHook(() => useRole(), { wrapper: wrapperWithProvider('/?role=software') })
    await waitFor(() => expect(result.current.role.themeId).toBe('software'))
    expect(result.current.filteredCertifications.length).toBeGreaterThan(0)
  })
})

describe('ResearchLabSection — research/researchIntro read from the DB when published', () => {
  it('renders the DB-published research entry and intro instead of the bundled default', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'research',
          data: {
            researchIntro: 'DB research intro copy.',
            research: [{ id: 'db-research', title: 'DB Research Title', type: 'Test', description: 'DB description.', status: 'Completed · 2026', areas: [] }],
          },
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    render(
      <MemoryRouter>
        <SiteContentProvider>
          <ResearchLabSection />
        </SiteContentProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('DB Research Title')).toBeInTheDocument())
    expect(screen.getByText('DB research intro copy.')).toBeInTheDocument()
  })

  it('falls back to the bundled research entry when the DB has nothing published', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    render(
      <MemoryRouter>
        <SiteContentProvider>
          <ResearchLabSection />
        </SiteContentProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Explainability in Low-Resource and Multilingual NLP Applications')).toBeInTheDocument())
  })
})
