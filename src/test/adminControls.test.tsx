import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EntityToolbar } from '../components/admin/EntityToolbar'
import { ConfirmModal } from '../components/admin/ConfirmModal'
import { createDefaultEntity } from '../lib/admin/defaultTemplates'
import { validateFullConfig } from '../lib/config/exportImport'
import { portfolioConfig } from '../config'
import { AdminPage } from '../pages/AdminPage'
import { activateDevBypass } from '../lib/admin/cms'
import { MemoryRouter } from 'react-router-dom'

describe('EntityToolbar component', () => {
  it('disables Move Up on first item and Move Down on last item', () => {
    const onMoveUp = vi.fn()
    const onMoveDown = vi.fn()
    const onDuplicate = vi.fn()
    const onDelete = vi.fn()
    const onAdd = vi.fn()

    const { rerender } = render(
      <EntityToolbar
        sectionTitle="Experience"
        itemName="Software Engineer @ Google"
        currentIndex={0}
        totalCount={3}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onAdd={onAdd}
      />,
    )

    const upBtn = screen.getByRole('button', { name: /Move Software Engineer @ Google up/i })
    const downBtn = screen.getByRole('button', { name: /Move Software Engineer @ Google down/i })

    expect(upBtn).toBeDisabled()
    expect(downBtn).not.toBeDisabled()

    // Rerender as last item (index 2 of 3)
    rerender(
      <EntityToolbar
        sectionTitle="Experience"
        itemName="Software Engineer @ Google"
        currentIndex={2}
        totalCount={3}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onAdd={onAdd}
      />,
    )

    expect(screen.getByRole('button', { name: /Move Software Engineer @ Google up/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Move Software Engineer @ Google down/i })).toBeDisabled()
  })

  it('triggers action callbacks when clicked', async () => {
    const user = userEvent.setup()
    const onMoveUp = vi.fn()
    const onMoveDown = vi.fn()
    const onDuplicate = vi.fn()
    const onDelete = vi.fn()
    const onAdd = vi.fn()

    render(
      <EntityToolbar
        sectionTitle="Project"
        itemName="Neural Search Engine"
        currentIndex={1}
        totalCount={3}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onAdd={onAdd}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Move Neural Search Engine up/i }))
    expect(onMoveUp).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: /Move Neural Search Engine down/i }))
    expect(onMoveDown).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: /Duplicate Neural Search Engine/i }))
    expect(onDuplicate).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: /Delete Neural Search Engine/i }))
    expect(onDelete).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: /Add new Project/i }))
    expect(onAdd).toHaveBeenCalledOnce()
  })
})

describe('ConfirmModal accessible dialog', () => {
  it('renders with ARIA modal attributes and handles confirm/cancel', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Project"
        itemName="Old Project"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-modal-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-modal-desc')

    expect(screen.getByText('Delete Project')).toBeInTheDocument()
    expect(screen.getByText(/"Old Project"/)).toBeInTheDocument()

    // Test cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()

    // Test confirm
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('closes on Escape key press', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        itemName="Item 1"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

describe('defaultTemplates and schema validation', () => {
  const sections = [
    'experience',
    'projects',
    'metrics',
    'skills',
    'education',
    'certifications',
    'research',
    'aiKnowledge',
  ] as const

  sections.forEach((section) => {
    it(`createDefaultEntity('${section}') generates valid entity matching schema`, () => {
      const entity = createDefaultEntity(section, 'test-id')
      expect(entity.id).toBe('test-id')

      const testConfig = {
        ...portfolioConfig,
        [section]: [entity, ...portfolioConfig[section]],
      }
      const issues = validateFullConfig(testConfig)
      expect(issues).toEqual([])
    })
  })
})

describe('AdminPage integrated V2 controls', () => {
  // V2.2 P4: /admin is now gated by CmsAuthGate (a real JWT). The dev-only
  // bypass (Vitest's import.meta.env.DEV defaults to true, same as `vite
  // dev`) unlocks it without mocking a backend — see src/test/cms.test.ts.
  beforeEach(() => {
    try {
      window.localStorage?.clear()
      window.sessionStorage?.clear()
      activateDevBypass()
    } catch {}
  })

  it('renders section badges with accurate entity counts', () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )

    // Experience badge
    expect(screen.getAllByText(String(portfolioConfig.experience.length)).length).toBeGreaterThan(0)
    // Projects badge
    expect(screen.getAllByText(String(portfolioConfig.projects.length)).length).toBeGreaterThan(0)
  })

  it('allows navigating tabs and shows section controls', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )

    // Switch to Projects tab
    const projectTabs = screen.getAllByRole('button', { name: /Projects/i })
    await user.click(projectTabs[0])

    expect(screen.getByRole('button', { name: /Add new Project/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Duplicate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
  })

  it('adds a new experience item when clicking Add Experience', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )

    // Switch to Experience tab
    const expTabs = screen.getAllByRole('button', { name: /Experience/i })
    await user.click(expTabs[0])

    const initialCount = portfolioConfig.experience.length

    // Click Add Experience
    await user.click(screen.getByRole('button', { name: /Add new Experience/i }))

    // New item should be selected and reflected in count
    expect(screen.getByDisplayValue('New Organization')).toBeInTheDocument()
    expect(screen.getAllByText(String(initialCount + 1)).length).toBeGreaterThan(0)
  })

  it('opens delete confirmation modal and deletes entity when confirmed', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )

    // Switch to Experience tab
    const expTabs = screen.getAllByRole('button', { name: /Experience/i })
    await user.click(expTabs[0])

    const initialCount = portfolioConfig.experience.length

    // Click Delete button
    const deleteBtn = screen.getByRole('button', { name: /^Delete /i })
    await user.click(deleteBtn)

    // Modal dialog should appear
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Delete Experience')).toBeInTheDocument()

    // Confirm deletion
    const modalDeleteBtn = screen.getByRole('button', { name: 'Delete' })
    await user.click(modalDeleteBtn)

    // Modal should close and item count decremented
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(screen.getAllByText(String(initialCount - 1)).length).toBeGreaterThan(0)
  })
})
