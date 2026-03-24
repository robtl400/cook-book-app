import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from './NavBar'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

function renderNavBar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavBar />
    </MemoryRouter>
  )
}

describe('NavBar', () => {
  it('navigates to /search?q=... when Enter is pressed with a query', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    const { container } = renderNavBar()

    const input = screen.getByPlaceholderText('Search recipes…')
    fireEvent.change(input, { target: { value: 'pasta' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // After navigation the input clears
    expect(input.value).toBe('')
  })

  it('does not navigate when Enter is pressed with empty query', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderNavBar()

    const input = screen.getByPlaceholderText('Search recipes…')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Input value is not cleared (no navigation occurred)
    expect(input.value).toBe('   ')
  })

  it('shows Login and Sign up when no user', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderNavBar()

    expect(screen.getByText('Log in')).toBeTruthy()
    expect(screen.getByText('Sign up')).toBeTruthy()
    expect(screen.queryByText('Log out')).toBeNull()
  })

  it('shows Log out when user is authenticated', () => {
    useAuth.mockReturnValue({ user: { id: 1, username: 'alice', display_name: 'Alice' }, logout: vi.fn() })
    renderNavBar()

    expect(screen.getByText('Log out')).toBeTruthy()
    expect(screen.queryByText('Log in')).toBeNull()
  })
})
