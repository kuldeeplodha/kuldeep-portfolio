import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CertificationsSection } from '../components/sections/CertificationsSection'
import { SiteContentProvider } from '../lib/content/SiteContentProvider'

// CERT-MEDIA-VERIFIED-FEATURE: certifications gained optional mediaUrl /
// verified / verifyUrl fields. These tests confirm (a) existing certs with
// none of the new fields still render exactly as before (back-compat) and
// (b) the new image/badge render correctly and safely once populated.

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

function renderSection() {
  return render(
    <MemoryRouter>
      <SiteContentProvider>
        <CertificationsSection />
      </SiteContentProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe('CertificationsSection — mediaUrl/verified/verifyUrl', () => {
  it('renders a cert with none of the new fields exactly as before (back-compat)', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'certifications',
          data: [
            { id: 'c1', name: 'Legacy Cert', issuer: 'Old Issuer', date: '2020', sourceVariants: ['software'] },
          ],
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    renderSection()
    await waitFor(() => expect(screen.getByText('Legacy Cert')).toBeInTheDocument())
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByText('Verified')).not.toBeInTheDocument()
  })

  it('renders the media thumbnail and a Verified badge linking to verifyUrl when both are set', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'certifications',
          data: [
            {
              id: 'c2',
              name: 'Media Cert',
              issuer: 'New Issuer',
              date: '2026',
              sourceVariants: ['software'],
              mediaUrl: 'https://res.cloudinary.com/demo/image/upload/cert.png',
              verified: true,
              verifyUrl: 'https://issuer.example.com/verify/xyz',
            },
          ],
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    renderSection()
    await waitFor(() => expect(screen.getByText('Media Cert')).toBeInTheDocument())

    const img = screen.getByRole('img', { name: 'Media Cert' })
    expect(img).toHaveAttribute('src', 'https://res.cloudinary.com/demo/image/upload/cert.png')
    expect(img).toHaveAttribute('loading', 'lazy')

    const badge = screen.getByRole('link', { name: 'Verified' })
    expect(badge).toHaveAttribute('href', 'https://issuer.example.com/verify/xyz')
    expect(badge).toHaveAttribute('target', '_blank')
    expect(badge).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders a Verified badge as plain text (no link) when verified is true but verifyUrl is absent', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'certifications',
          data: [
            { id: 'c3', name: 'Verified No Link', issuer: 'Issuer', date: '2026', sourceVariants: ['software'], verified: true },
          ],
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    renderSection()
    await waitFor(() => expect(screen.getByText('Verified No Link')).toBeInTheDocument())
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Verified' })).not.toBeInTheDocument()
  })

  it('does not render an image or a Verified badge when verified is false', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'certifications',
          data: [
            {
              id: 'c4',
              name: 'Unverified Cert',
              issuer: 'Issuer',
              date: '2026',
              sourceVariants: ['software'],
              verified: false,
              verifyUrl: 'https://issuer.example.com/verify/should-not-show',
            },
          ],
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    renderSection()
    await waitFor(() => expect(screen.getByText('Unverified Cert')).toBeInTheDocument())
    expect(screen.queryByText('Verified')).not.toBeInTheDocument()
  })

  it('does not render an unsafe mediaUrl (javascript:) or verifyUrl as a link', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse([
        {
          section_key: 'certifications',
          data: [
            {
              id: 'c5',
              name: 'Unsafe Cert',
              issuer: 'Issuer',
              date: '2026',
              sourceVariants: ['software'],
              mediaUrl: 'javascript:alert(1)',
              verified: true,
              verifyUrl: 'javascript:alert(1)',
            },
          ],
          status: 'published',
          published_at: null,
          updated_at: 'now',
        },
      ]),
    )
    renderSection()
    await waitFor(() => expect(screen.getByText('Unsafe Cert')).toBeInTheDocument())
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // verified===true with an unsafe verifyUrl falls back to the plain-text badge, not a link.
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Verified' })).not.toBeInTheDocument()
  })
})
