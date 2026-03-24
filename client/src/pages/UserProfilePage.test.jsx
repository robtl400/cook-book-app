import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import UserProfilePage from './UserProfilePage'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}))

vi.mock('../components/PostCard', () => ({
  default: ({ post }) => <div data-testid="post-card">{post.title}</div>,
}))

vi.mock('../components/Spinner', () => ({
  default: ({ size }) => <div data-testid={`spinner${size ? `-${size}` : ''}`} />,
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

const mockProfile = {
  id: 1,
  username: 'alice',
  display_name: 'Alice',
  follower_count: 5,
  following_count: 3,
  bio: '',
  profile_image_url: null,
}

function renderProfilePage(userId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/users/${userId}`]}>
      <Routes>
        <Route path="/users/:id" element={<UserProfilePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('UserProfilePage — boxes tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: { id: 1, username: 'alice' } })
  })

  it('shows spinner while boxes are loading', async () => {
    // Profile + posts resolve; boxes hangs
    api.get
      .mockResolvedValueOnce(mockProfile)   // /users/1
      .mockResolvedValueOnce([])             // /users/1/posts
      .mockReturnValueOnce(new Promise(() => {})) // /users/1/boxes — hangs

    renderProfilePage()

    // Wait for profile to load
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy())

    // Switch to boxes tab
    fireEvent.click(screen.getByText('Recipe Boxes'))

    expect(screen.getByTestId('spinner-sm')).toBeTruthy()
  })

  it('renders boxes when API returns data', async () => {
    api.get
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 10, name: 'Weeknight Dinners', post_count: 4, box_type: 'custom' },
        { id: 11, name: 'Desserts', post_count: 2, box_type: 'custom' },
      ])

    renderProfilePage()
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy())

    fireEvent.click(screen.getByText('Recipe Boxes'))

    await waitFor(() => {
      expect(screen.getByText('Weeknight Dinners')).toBeTruthy()
      expect(screen.getByText('Desserts')).toBeTruthy()
    })
  })

  it('shows empty state when no boxes', async () => {
    api.get
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    renderProfilePage()
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy())

    fireEvent.click(screen.getByText('Recipe Boxes'))

    await waitFor(() => {
      expect(screen.getByText('No public recipe boxes.')).toBeTruthy()
    })
  })

  it('shows empty state when boxes API fails', async () => {
    api.get
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('Server error'))

    renderProfilePage()
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy())

    fireEvent.click(screen.getByText('Recipe Boxes'))

    await waitFor(() => {
      expect(screen.getByText('No public recipe boxes.')).toBeTruthy()
    })
  })
})

describe('UserProfilePage — retry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: { id: 1, username: 'alice' } })
  })

  it('shows retry button on profile load error', async () => {
    api.get
      .mockRejectedValueOnce(new Error('Not found')) // /users/1 profile fails
      .mockResolvedValueOnce([])                     // /users/1/posts (default tab)

    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeTruthy()
    })
  })

  it('retries profile load when Try again is clicked', async () => {
    api.get
      .mockRejectedValueOnce(new Error('Not found')) // /users/1 profile - attempt 1
      .mockResolvedValueOnce([])                     // /users/1/posts - mount
      .mockResolvedValueOnce(mockProfile)            // /users/1 profile - retry
      .mockResolvedValueOnce([])                     // /users/1/posts - after retry

    renderProfilePage()

    await waitFor(() => expect(screen.getByText('Try again')).toBeTruthy())
    fireEvent.click(screen.getByText('Try again'))

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy()
    })
  })
})
