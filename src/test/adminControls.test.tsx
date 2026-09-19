import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from '../components/admin/ConfirmModal'

// CMS-UNIFY-CONFIG-EDITOR: 'EntityToolbar component', 'defaultTemplates
// and schema validation', and 'AdminPage integrated V2 controls' were
// removed along with the retired legacy Configuration Panel (EntityToolbar
// and defaultTemplates.ts are now deleted; AdminPage no longer has
// per-entity add/move/duplicate/delete controls -- it's the generic
// SiteContentAdminPanel/BlogsAdminPanel/CaseStudiesAdminPanel now, each
// covered by its own test file). ConfirmModal itself SURVIVES the
// retirement -- it's still used by CaseStudiesAdminPanel/BlogsAdminPanel --
// so its standalone component test stays here.

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
