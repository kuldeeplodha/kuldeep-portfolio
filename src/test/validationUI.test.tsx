import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FieldFeedback } from '../components/admin/InlineFieldFeedback'
import { getFieldInputClass } from '../lib/admin/validationStyles'
import { ValidationStatusBar } from '../components/admin/ValidationStatusBar'
import { DiagnosticImportModal } from '../components/admin/DiagnosticImportModal'
import { AdminPage } from '../pages/AdminPage'
import { activateDevBypass } from '../lib/admin/cms'
import { MemoryRouter } from 'react-router-dom'
import type { ValidationIssue, ValidationSummary } from '../lib/config/validationRegistry'

describe('InlineFieldFeedback component', () => {
  it('renders nothing when issue is undefined', () => {
    const { container } = render(<FieldFeedback />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders error issue with alert role, message, and remediation hint', () => {
    const issue: ValidationIssue = {
      id: 'profile-name-err',
      section: 'profile',
      field: 'name',
      severity: 'error',
      message: 'Name is required.',
      remediation: 'Enter a valid non-empty display name.',
    }

    render(<FieldFeedback issue={issue} />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Name is required.')
    expect(alert).toHaveTextContent('Enter a valid non-empty display name.')
  })

  it('renders warning issue with status role, message, and remediation hint', () => {
    const issue: ValidationIssue = {
      id: 'profile-avatar-warn',
      section: 'profile',
      field: 'avatarUrl',
      severity: 'warning',
      message: 'Avatar URL is empty.',
      remediation: 'Consider providing an image URL.',
    }

    render(<FieldFeedback issue={issue} />)

    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveTextContent('Avatar URL is empty.')
    expect(status).toHaveTextContent('Consider providing an image URL.')
  })
})

describe('getFieldInputClass helper', () => {
  it('returns base class if no issue is passed', () => {
    expect(getFieldInputClass(undefined, 'base-class')).toBe('base-class')
  })

  it('appends red border classes when issue is an error', () => {
    const issue: ValidationIssue = {
      id: 'err-1',
      section: 'profile',
      field: 'name',
      severity: 'error',
      message: 'Required',
    }
    const result = getFieldInputClass(issue, 'base-class')
    expect(result).toContain('base-class')
    expect(result).toContain('!border-red-500')
  })

  it('appends amber border classes when issue is a warning', () => {
    const issue: ValidationIssue = {
      id: 'warn-1',
      section: 'profile',
      field: 'avatarUrl',
      severity: 'warning',
      message: 'Recommended',
    }
    const result = getFieldInputClass(issue, 'base-class')
    expect(result).toContain('base-class')
    expect(result).toContain('!border-amber-500/80')
  })
})

describe('ValidationStatusBar component', () => {
  const cleanSummary: ValidationSummary = {
    isValid: true,
    errorCount: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
    issuesBySection: {},
    issuesByEntity: {},
    issuesByField: {},
  }

  const warningSummary: ValidationSummary = {
    isValid: true,
    errorCount: 0,
    warningCount: 2,
    errors: [],
    warnings: [
      {
        id: 'warn-1',
        section: 'profile',
        field: 'avatarUrl',
        severity: 'warning',
        message: 'Avatar recommended',
        remediation: 'Add avatar',
      },
      {
        id: 'warn-2',
        section: 'projects',
        itemId: 'proj-1',
        field: 'liveUrl',
        severity: 'warning',
        message: 'Live URL recommended',
        remediation: 'Add URL',
      },
    ],
    issuesBySection: {},
    issuesByEntity: {},
    issuesByField: {},
  }

  const errorSummary: ValidationSummary = {
    isValid: false,
    errorCount: 2,
    warningCount: 1,
    errors: [
      {
        id: 'err-1',
        section: 'profile',
        field: 'name',
        severity: 'error',
        message: 'Name is required',
        remediation: 'Fill in name',
      },
      {
        id: 'err-2',
        section: 'projects',
        itemId: 'proj-1',
        field: 'title',
        severity: 'error',
        message: 'Title is required',
        remediation: 'Fill in title',
      },
    ],
    warnings: [
      {
        id: 'warn-1',
        section: 'profile',
        field: 'avatarUrl',
        severity: 'warning',
        message: 'Avatar recommended',
        remediation: 'Add avatar',
      },
    ],
    issuesBySection: {},
    issuesByEntity: {},
    issuesByField: {},
  }

  it('renders clean pass state when no errors or warnings exist', () => {
    render(<ValidationStatusBar summary={cleanSummary} onNavigateToIssue={vi.fn()} />)
    expect(screen.getByText(/All sections valid. Ready to export or save draft./i)).toBeInTheDocument()
    expect(screen.getByText('0 errors · 0 warnings')).toBeInTheDocument()
  })

  it('renders recommendation status when only warnings exist', () => {
    render(<ValidationStatusBar summary={warningSummary} onNavigateToIssue={vi.fn()} />)
    expect(screen.getByText(/2 quality recommendations/i)).toBeInTheDocument()
    expect(screen.getByText(/Draft is valid and safe to save and export/i)).toBeInTheDocument()
  })

  it('renders error counts when errors exist', () => {
    render(<ValidationStatusBar summary={errorSummary} onNavigateToIssue={vi.fn()} />)
    expect(screen.getByText(/2 blocking errors found/i)).toBeInTheDocument()
  })

  it('cycles through errors when Jump to Next Error is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    render(<ValidationStatusBar summary={errorSummary} onNavigateToIssue={onNavigate} />)

    const jumpBtn = screen.getByRole('button', { name: /Jump to Next Error/i })
    expect(jumpBtn).toBeInTheDocument()

    // First jump -> error 1 (profile.name)
    await user.click(jumpBtn)
    expect(onNavigate).toHaveBeenCalledWith('profile', undefined, 'name')

    // Second jump -> error 2 (projects.title)
    await user.click(jumpBtn)
    expect(onNavigate).toHaveBeenCalledWith('projects', 'proj-1', 'title')

    // Third jump -> cycles back to error 1
    await user.click(jumpBtn)
    expect(onNavigate).toHaveBeenCalledWith('profile', undefined, 'name')
  })

  it('toggles issues drawer and allows clicking an issue to navigate', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    render(<ValidationStatusBar summary={errorSummary} onNavigateToIssue={onNavigate} />)

    const toggleBtn = screen.getByRole('button', { name: /View All Errors/i })
    await user.click(toggleBtn)

    // Check drawer opened
    expect(screen.getByText('Hide Error List')).toBeInTheDocument()
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Title is required')).toBeInTheDocument()

    // Click on an error in the drawer
    await user.click(screen.getByText('Title is required'))
    expect(onNavigate).toHaveBeenCalledWith('projects', 'proj-1', 'title')
  })
})

describe('DiagnosticImportModal component', () => {
  beforeEach(() => {
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      window.URL.revokeObjectURL = vi.fn()
    }
  })

  const failSummary: ValidationSummary = {
    isValid: false,
    errorCount: 1,
    warningCount: 0,
    errors: [
      {
        id: 'err-1',
        section: 'profile',
        field: 'name',
        severity: 'error',
        message: 'Name is empty',
        remediation: 'Set name',
      },
    ],
    warnings: [],
    issuesBySection: {},
    issuesByEntity: {},
    issuesByField: {},
  }

  const warnSummary: ValidationSummary = {
    isValid: true,
    errorCount: 0,
    warningCount: 1,
    errors: [],
    warnings: [
      {
        id: 'warn-1',
        section: 'profile',
        field: 'avatarUrl',
        severity: 'warning',
        message: 'Avatar recommended',
        remediation: 'Set avatar',
      },
    ],
    issuesBySection: {},
    issuesByEntity: {},
    issuesByField: {},
  }

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DiagnosticImportModal
        isOpen={false}
        summary={failSummary}
        onClose={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders error diagnostics with table breakdown when errorCount > 0', () => {
    render(
      <DiagnosticImportModal
        isOpen={true}
        summary={failSummary}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Import Failed: 1 Error Detected/i)).toBeInTheDocument()
    expect(screen.getByText('Name is empty')).toBeInTheDocument()
    expect(screen.getByText('Set name')).toBeInTheDocument()
    // Cannot proceed when errorCount > 0
    expect(screen.queryByRole('button', { name: /Proceed with Import/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close & Return to Editor/i })).toBeInTheDocument()
  })

  it('allows proceeding when import only has warnings', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <DiagnosticImportModal
        isOpen={true}
        summary={warnSummary}
        onClose={vi.fn()}
        onConfirmImport={onConfirm}
      />,
    )

    expect(screen.getByText(/Import Review: 1 Quality Recommendation/i)).toBeInTheDocument()
    const proceedBtn = screen.getByRole('button', { name: /Proceed with Import/i })
    expect(proceedBtn).toBeInTheDocument()

    await user.click(proceedBtn)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('allows downloading error log', async () => {
    const user = userEvent.setup()
    render(
      <DiagnosticImportModal
        isOpen={true}
        summary={failSummary}
        onClose={vi.fn()}
      />,
    )

    const downloadBtn = screen.getByRole('button', { name: /Download Error Log/i })
    expect(downloadBtn).toBeInTheDocument()

    await user.click(downloadBtn)
  })

  it('closes modal on Escape key press', () => {
    const onClose = vi.fn()
    render(
      <DiagnosticImportModal
        isOpen={true}
        summary={failSummary}
        onClose={onClose}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('AdminPage Validation Integration', () => {
  // V2.2 P4: single-JWT gate via CmsAuthGate — dev bypass unlocks it in
  // Vitest (import.meta.env.DEV defaults to true) without a mocked backend.
  beforeEach(() => {
    try {
      window.localStorage?.clear()
      window.sessionStorage?.clear()
      activateDevBypass()
    } catch {}
  })

  it('displays valid status bar initially for default portfolio config', () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/All sections valid\. Ready to export or save draft\./i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Export JSON/i })).toBeEnabled()
  })

  it('gates Save Draft and Export JSON buttons and displays inline error feedback when name is cleared', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )

    const nameInput = screen.getByLabelText(/Full name/i)
    expect(nameInput).toBeInTheDocument()

    // Clear name
    await user.clear(nameInput)

    // Inline error feedback should appear
    await waitFor(() => {
      expect(screen.getByText(/Profile: Name is required/i)).toBeInTheDocument()
    })

    // Validation status bar should indicate blocking error
    expect(screen.getByText(/1 blocking error found/i)).toBeInTheDocument()

    // Save Draft and Export buttons should be disabled
    const saveDraftBtn = screen.getByRole('button', { name: /Save Draft/i })
    const exportBtn = screen.getByRole('button', { name: /Export JSON/i })
    expect(saveDraftBtn).toBeDisabled()
    expect(exportBtn).toBeDisabled()

    // Profile tab badge should show '1 err'
    expect(screen.getAllByText('1 err').length).toBeGreaterThan(0)
  })

  it('navigates and focuses invalid field when Jump to Next Error is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )

    // Switch to Experience tab first
    const expTabs = screen.getAllByRole('button', { name: /Experience/i })
    await user.click(expTabs[0])

    // Clear organization on the current experience item
    const orgInput = screen.getByLabelText(/Organization/i)
    await user.clear(orgInput)

    // Switch away to Profile tab
    const profileTabs = screen.getAllByRole('button', { name: /Profile/i })
    await user.click(profileTabs[0])

    // Status bar shows error
    expect(screen.getByText(/1 blocking error found/i)).toBeInTheDocument()

    // Click Jump to Next Error
    const jumpBtn = screen.getByRole('button', { name: /Jump to Next Error/i })
    await user.click(jumpBtn)

    // Should switch back to Experience tab and show the invalid input
    await waitFor(() => {
      expect(screen.getByLabelText(/Organization/i)).toBeInTheDocument()
    })
  })
})
