import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CaseStudiesAdminPanel } from '../components/admin/cms/CaseStudiesAdminPanel'

// FIX-ADMIN-SAVE-UX: a case study used to be publishable with real
// title+summary but a genuinely empty structured body (Problem/Context/
// Architecture/Outcome) -- it looked "finished" on the live site but
// wasn't. Publish must stay disabled, with a visible on-screen reason,
// until every body field has content; Save draft must still work with
// them blank.

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => body,
  } as Response
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
})

async function openNewCaseStudyForm() {
  ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse([]))
  const user = userEvent.setup()
  render(<CaseStudiesAdminPanel />)
  await user.click(await screen.findByRole('button', { name: '+ New Case Study' }))
  return user
}

describe('CaseStudiesAdminPanel — publish gate on empty body fields', () => {
  it('Publish is disabled and shows a visible reason when title/slug are set but body fields are blank', async () => {
    const user = await openNewCaseStudyForm()

    await user.type(screen.getByLabelText('Title', { exact: true }), 'A New Case Study')

    const publishBtn = screen.getByRole('button', { name: 'Publish' })
    expect(publishBtn).toBeDisabled()
    // Always-visible reason, not just a hover title= tooltip.
    expect(
      screen.getByText(/Publish is disabled until you fill in: Problem, Context, Architecture, Outcome/i),
    ).toBeInTheDocument()
    // Save draft stays available even with an incomplete body.
    expect(screen.getByRole('button', { name: 'Save draft' })).not.toBeDisabled()
  })

  it('each empty body field shows an inline per-field notice', async () => {
    await openNewCaseStudyForm()
    expect(screen.getByText(/Problem is empty — Publish is disabled/i)).toBeInTheDocument()
    expect(screen.getByText(/Context is empty — Publish is disabled/i)).toBeInTheDocument()
    expect(screen.getByText(/Architecture is empty — Publish is disabled/i)).toBeInTheDocument()
    expect(screen.getByText(/Outcome is empty — Publish is disabled/i)).toBeInTheDocument()
  })

  it('Publish becomes enabled once title, slug, and all 4 body fields are filled', async () => {
    const user = await openNewCaseStudyForm()

    await user.type(screen.getByLabelText('Title', { exact: true }), 'A New Case Study')
    await user.type(screen.getByLabelText(/^Problem/), 'The problem.')
    await user.type(screen.getByLabelText(/^Context/), 'The context.')
    await user.type(screen.getByLabelText(/^Architecture/), 'The architecture.')
    await user.type(screen.getByLabelText(/^Outcome/), 'The outcome.')

    expect(screen.getByRole('button', { name: 'Publish' })).not.toBeDisabled()
    expect(
      screen.queryByText(/Publish is disabled until you fill in/i),
    ).not.toBeInTheDocument()
  })

  it('clicking Publish once complete actually creates it with status published', async () => {
    const user = await openNewCaseStudyForm()

    await user.type(screen.getByLabelText('Title', { exact: true }), 'A New Case Study')
    await user.type(screen.getByLabelText(/^Problem/), 'The problem.')
    await user.type(screen.getByLabelText(/^Context/), 'The context.')
    await user.type(screen.getByLabelText(/^Architecture/), 'The architecture.')
    await user.type(screen.getByLabelText(/^Outcome/), 'The outcome.')

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 'x' })) // POST create
      .mockResolvedValueOnce(jsonResponse([])) // refetch after save

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const createCall = fetchMock.mock.calls.find(([, init]) => (init as RequestInit)?.method === 'POST')
    expect(createCall).toBeDefined()
    const body = JSON.parse((createCall![1] as RequestInit).body as string)
    expect(body.status).toBe('published')
    expect(body.problem).toBe('The problem.')
  })

  it('Save draft still works with every body field blank', async () => {
    const user = await openNewCaseStudyForm()
    await user.type(screen.getByLabelText('Title', { exact: true }), 'A Draft Case Study')

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 'y' })) // POST create
      .mockResolvedValueOnce(jsonResponse([])) // refetch after save

    await user.click(screen.getByRole('button', { name: 'Save draft' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const createCall = fetchMock.mock.calls.find(([, init]) => (init as RequestInit)?.method === 'POST')
    expect(createCall).toBeDefined()
    const body = JSON.parse((createCall![1] as RequestInit).body as string)
    expect(body.status).toBe('draft')
  })

  it('Draft and Publish buttons carry visibly distinct captions', async () => {
    await openNewCaseStudyForm()
    expect(screen.getByText(/Private — not visible on the live site\./i)).toBeInTheDocument()
    expect(screen.getByText(/Goes live immediately on the public site\./i)).toBeInTheDocument()
  })
})
