import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from './NavBar'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

const mockUser = { id: 1, username: 'alice', display_name: 'Alice' }

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
    renderNavBar()

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

  it('clears input when search button is clicked with a query', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderNavBar()

    const input = screen.getByPlaceholderText('Search recipes…')
    fireEvent.change(input, { target: { value: 'tacos' } })
    fireEvent.click(screen.getByLabelText('Search'))

    expect(input.value).toBe('')
  })

  it('does not clear input when search button is clicked with empty query', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderNavBar()

    const input = screen.getByPlaceholderText('Search recipes…')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(screen.getByLabelText('Search'))

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
    useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() })
    renderNavBar()

    expect(screen.getByText('Log out')).toBeTruthy()
    expect(screen.queryByText('Log in')).toBeNull()
  })

  it('hamburger button opens mobile menu', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderNavBar()

    // Mobile menu not in DOM initially
    expect(screen.queryByText('Log in', { selector: 'a[href="/login"]' })).toBeTruthy()
    const hamburger = screen.getByLabelText('Open menu')
    expect(hamburger).toBeTruthy()

    fireEvent.click(hamburger)

    // After click, mobile menu renders — now multiple "Log in" elements exist
    const allLogIn = screen.getAllByText('Log in')
    expect(allLogIn.length).toBeGreaterThanOrEqual(2)
  })

  it('hamburger closes mobile menu when clicked again', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderNavBar()

    const hamburger = screen.getByLabelText('Open menu')
    fireEvent.click(hamburger)
    // Open — multiple Log in elements
    expect(screen.getAllByText('Log in').length).toBeGreaterThanOrEqual(2)

    fireEvent.click(hamburger)
    // Closed — back to one
    expect(screen.getAllByText('Log in').length).toBe(1)
  })

  it('mobile menu shows nav links for authenticated user', () => {
    useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() })
    renderNavBar()

    fireEvent.click(screen.getByLabelText('Open menu'))

    expect(screen.getAllByText('Feed').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Explore').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/My Recipe Box/).length).toBeGreaterThanOrEqual(1)
  })

  it('mobile menu shows login/register for unauthenticated user', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderNavBar()

    fireEvent.click(screen.getByLabelText('Open menu'))

    // Two of each (desktop hidden + mobile visible)
    expect(screen.getAllByText('Log in').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Sign up').length).toBeGreaterThanOrEqual(2)
  })
})
