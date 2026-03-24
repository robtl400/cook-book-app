import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExplorePage from './ExplorePage'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../utils/api', () => ({
  api: { get: vi.fn() },
}))

vi.mock('../components/PostCard', () => ({
  default: ({ post }) => <div data-testid="post-card">{post.title}</div>,
}))

vi.mock('../components/Spinner', () => ({
  default: () => <div data-testid="spinner" />,
}))

import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

function renderExplorePage() {
  return render(
    <MemoryRouter>
      <ExplorePage />
    </MemoryRouter>
  )
}

describe('ExplorePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockResolvedValue([])
  })

  it('shows "Post a Recipe" CTA for authenticated user when empty', async () => {
    useAuth.mockReturnValue({ user: { id: 1, username: 'alice' } })
    renderExplorePage()

    await waitFor(() => {
      expect(screen.getByText('+ Post a Recipe')).toBeTruthy()
    })
  })

  it('shows "Sign up to post" CTA for guest when empty', async () => {
    useAuth.mockReturnValue({ user: null })
    renderExplorePage()

    await waitFor(() => {
      expect(screen.getByText('Sign up to post')).toBeTruthy()
    })
  })
})
