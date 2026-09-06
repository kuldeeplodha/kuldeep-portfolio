import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'
import { SelectedCaseStudiesSection } from '../components/sections/SelectedCaseStudiesSection'
import { LatestArticlesSection } from '../components/sections/LatestArticlesSection'
import { CaseStudiesListPage } from '../pages/CaseStudiesListPage'
import { CaseStudyDetailPage } from '../pages/CaseStudyDetailPage'
import { CmsBlogListPage } from '../pages/CmsBlogListPage'
import { CmsBlogDetailPage } from '../pages/CmsBlogDetailPage'

// V2.2 P3: RTL coverage for the new public CMS-backed components — these
// aren't on the HomePage.tsx/AdminPage.tsx "e2e-only view shell" exclude
// list (vite.config.ts), so they count toward the unit coverage floor.
// Matches the fetch-mocking convention already used for src/lib/admin/cms.ts
// (src/test/cms.test.ts).

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

function withProviders(children: ReactNode, initialEntries: string[] = ['/']) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </MotionConfig>
    </LazyMotion>
  )
}

const BLOG_A = {
  id: 'b1',
  slug: 'first-post',
  title: 'First Post',
  excerpt: 'An excerpt.',
  body: '## Heading\n\nSome body text.',
  status: 'published',
  published_at: '2026-09-05T00:00:00Z',
  created_at: '2026-09-05T00:00:00Z',
  updated_at: '2026-09-05T00:00:00Z',
  tags: ['ml'],
  relevant_roles: [],
  reading_time_minutes: 2,
  featured_media_url: null,
  media_urls: [],
}

const CASE_STUDY_A = {
  id: 'c1',
  slug: 'gesture-pipeline',
  title: 'Gesture Recognition Pipeline',
  subtitle: 'Real-time inference at the edge',
  summary: 'A summary of the case study.',
  client_or_org: 'Coursework',
  period: '2025',
  category: 'AI/ML',
  status: 'published',
  featured: 1,
  published_at: '2026-09-04T00:00:00Z',
  created_at: '2026-09-04T00:00:00Z',
  updated_at: '2026-09-04T00:00:00Z',
  technologies: ['Python', 'OpenCV'],
  relevant_roles: [],
  problem: 'Problem text.',
  context: 'Context text.',
  architecture: 'Architecture text.',
  outcome: 'Outcome text.',
  future_improvements: null,
  github_url: null,
  live_url: null,
  featured_media_url: null,
  media_urls: [],
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SelectedCaseStudiesSection', () => {
  it('renders the latest published case studies once loaded', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([CASE_STUDY_A]))
    render(withProviders(<SelectedCaseStudiesSection />))
    await waitFor(() => expect(screen.getByText('Gesture Recognition Pipeline')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'View All Case Studies →' })).toHaveAttribute('href', '/case-studies')
  })

  it('renders nothing once loaded with zero published case studies', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
    const { container } = render(withProviders(<SelectedCaseStudiesSection />))
    await waitFor(() => expect(container.querySelector('#case-studies')).not.toBeInTheDocument())
  })

  it('renders nothing when the backend is unreachable', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    const { container } = render(withProviders(<SelectedCaseStudiesSection />))
    await waitFor(() => expect(container.querySelector('#case-studies')).not.toBeInTheDocument())
  })
})

describe('LatestArticlesSection', () => {
  it('renders the latest published articles once loaded', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([BLOG_A]))
    render(withProviders(<LatestArticlesSection />))
    await waitFor(() => expect(screen.getByText('First Post')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'View All Articles →' })).toHaveAttribute('href', '/blog')
  })
})

describe('CaseStudiesListPage', () => {
  it('lists published case studies and filters by technology', async () => {
    const user = userEvent.setup()
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([CASE_STUDY_A]))
    render(withProviders(<CaseStudiesListPage />))

    expect(screen.getByRole('heading', { name: 'Case Studies', level: 1 })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Gesture Recognition Pipeline')).toBeInTheDocument())

    const filterGroup = screen.getByRole('group', { name: 'Filter by technology' })
    await user.click(within(filterGroup).getByRole('button', { name: 'OpenCV' }))
    expect(screen.getByText('Gesture Recognition Pipeline')).toBeInTheDocument()

    await user.click(within(filterGroup).getByRole('button', { name: 'All' }))
    expect(screen.getByText('Gesture Recognition Pipeline')).toBeInTheDocument()
  })

  it('shows an error state when the backend is unreachable', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    render(withProviders(<CaseStudiesListPage />))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})

describe('CaseStudyDetailPage', () => {
  function renderAtSlug(slug: string) {
    return render(
      withProviders(
        <Routes>
          <Route path="/case-studies/:slug" element={<CaseStudyDetailPage />} />
        </Routes>,
        [`/case-studies/${slug}`],
      ),
    )
  }

  it('renders the full case study once loaded', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(CASE_STUDY_A))
    renderAtSlug('gesture-pipeline')
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Gesture Recognition Pipeline', level: 1 })).toBeInTheDocument(),
    )
    expect(screen.getByText('Problem text.')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('renders NotFoundPage for a draft (404 from the public endpoint)', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ detail: 'Not Found' }, 404))
    renderAtSlug('draft-only')
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
  })
})

describe('CmsBlogListPage', () => {
  it('lists published posts and filters by search', async () => {
    const user = userEvent.setup()
    const second = { ...BLOG_A, id: 'b2', slug: 'second-post', title: 'Second Post', excerpt: 'Unrelated content.' }
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([BLOG_A, second]))
    render(withProviders(<CmsBlogListPage />))

    await waitFor(() => expect(screen.getByText('First Post')).toBeInTheDocument())
    expect(screen.getByText('Second Post')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Search articles'), 'Unrelated')
    expect(screen.getByText('Second Post')).toBeInTheDocument()
    expect(screen.queryByText('First Post')).not.toBeInTheDocument()
  })
})

describe('CmsBlogDetailPage', () => {
  function renderAtSlug(slug: string) {
    return render(
      withProviders(
        <Routes>
          <Route path="/blog/:slug" element={<CmsBlogDetailPage />} />
        </Routes>,
        [`/blog/${slug}`],
      ),
    )
  }

  it('renders the rendered markdown body via .blog-content', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse(BLOG_A))
    renderAtSlug('first-post')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'First Post', level: 1 })).toBeInTheDocument())
    expect(document.querySelector('.blog-content h2')).toHaveTextContent('Heading')
  })

  it('renders NotFoundPage when the slug does not resolve', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('fetch failed'))
    renderAtSlug('missing')
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
  })
})
