import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

describe('ProtectedRoute', () => {
  it('shows spinner when loading', () => {
    useAuth.mockReturnValue({ loading: true, user: null })

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(container.querySelector('.animate-spin')).toBeTruthy()
    expect(screen.queryByText('Protected content')).toBeNull()
  })

  it('redirects to /login when not authenticated', () => {
    useAuth.mockReturnValue({ loading: false, user: null })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.queryByText('Protected content')).toBeNull()
  })

  it('renders children when user exists', () => {
    useAuth.mockReturnValue({ loading: false, user: { id: 1, username: 'alice' } })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected content')).toBeTruthy()
  })
})
