import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../components/ui/Pagination'

describe('Pagination', () => {
  it('renders nothing when there is only 1 page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} hasMore={false} onPageChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders correctly with multiple pages', () => {
    render(<Pagination page={1} totalPages={2} hasMore={true} onPageChange={vi.fn()} />)
    expect(screen.getByText('Page 1 of 2')).toBeVisible()
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled()
  })

  it('calls onPageChange with correct values', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={3} hasMore={true} onPageChange={onPageChange} />)
    
    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onPageChange).toHaveBeenCalledWith(1)

    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables next button when on last page', () => {
    render(<Pagination page={3} totalPages={3} hasMore={false} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })
})
