import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from './LandingPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../utils/api', () => ({
  api: { get: vi.fn() },
}))

vi.mock('../components/PostCard', () => ({
  default: ({ post }) => <div data-testid="post-card">{post.title}</div>,
}))

import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: null, loading: false })
  })

  it('renders hero text and CTA buttons', () => {
    api.get.mockResolvedValue({ posts: [] })
    renderLandingPage()

    expect(screen.getByText(/Share what you actually cook/)).toBeTruthy()
    expect(screen.getByText('Get started')).toBeTruthy()
    expect(screen.getByText('Log in')).toBeTruthy()
  })

  it('shows preview posts when API returns data', async () => {
    api.get.mockResolvedValue({
      posts: [
        { id: 1, title: 'Pasta', source_type: 'original', user: { id: 10, username: 'chef' } },
        { id: 2, title: 'Pizza', source_type: 'original', user: { id: 10, username: 'chef' } },
      ],
    })

    renderLandingPage()

    await waitFor(() => {
      expect(screen.getByText('Pasta')).toBeTruthy()
      expect(screen.getByText('Pizza')).toBeTruthy()
    })
    expect(screen.getByText(/See what people are cooking/i)).toBeTruthy()
  })

  it('does not show preview section when API returns empty', async () => {
    api.get.mockResolvedValue({ posts: [] })
    renderLandingPage()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })
    expect(screen.queryByText(/See what people are cooking/i)).toBeNull()
  })

  it('does not crash when API fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'))
    renderLandingPage()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })
    // Hero still renders — no crash
    expect(screen.getByText('Get started')).toBeTruthy()
    expect(screen.queryByText(/See what people are cooking/i)).toBeNull()
  })

  it('redirects to /feed when user is logged in', () => {
    useAuth.mockReturnValue({ user: { id: 1, username: 'alice' }, loading: false })
    api.get.mockResolvedValue({ posts: [] })
    renderLandingPage()

    expect(screen.queryByText('Get started')).toBeNull()
  })
})
