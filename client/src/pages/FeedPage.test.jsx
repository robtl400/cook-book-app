import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeedPage from './FeedPage'

vi.mock('../utils/api', () => ({
  api: { get: vi.fn() },
}))

vi.mock('../components/PostCard', () => ({
  default: ({ post }) => <div data-testid="post-card">{post.title}</div>,
}))

vi.mock('../components/Spinner', () => ({
  default: () => <div data-testid="spinner" />,
}))

import { api } from '../utils/api'

function renderFeedPage() {
  return render(
    <MemoryRouter>
      <FeedPage />
    </MemoryRouter>
  )
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows error message and Try again button when API fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'))
    renderFeedPage()

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy()
      expect(screen.getByText('Try again')).toBeTruthy()
    })
  })

  it('retry button clears error and reloads posts', async () => {
    api.get.mockRejectedValueOnce(new Error('Failed to load feed.'))
    api.get.mockResolvedValueOnce([{ id: 1, title: 'Tacos' }])
    renderFeedPage()

    await waitFor(() => expect(screen.getByText('Try again')).toBeTruthy())
    fireEvent.click(screen.getByText('Try again'))

    await waitFor(() => {
      expect(screen.queryByText('Failed to load feed.')).toBeNull()
      expect(screen.getByTestId('post-card')).toBeTruthy()
    })
  })
})
