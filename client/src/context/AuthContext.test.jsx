import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('loading starts true and becomes false after /auth/me resolves', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: null, message: 'Success' }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('login sets user', async () => {
    const mockUser = { id: 1, username: 'alice', display_name: 'Alice' }

    // Initial /auth/me call
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Not authenticated' }),
    })
    // login call
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: mockUser, message: 'Login successful' }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('alice@example.com', 'password123')
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('register sets user', async () => {
    const mockUser = { id: 2, username: 'bob', display_name: 'Bob' }

    // Initial /auth/me call
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Not authenticated' }),
    })
    // register call
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ data: mockUser, message: 'Registration successful' }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.register({ email: 'bob@example.com', username: 'bob', display_name: 'Bob', password: 'password123' })
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('logout clears user', async () => {
    const mockUser = { id: 1, username: 'alice', display_name: 'Alice' }

    // Initial /auth/me returns user
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: mockUser, message: 'Success' }),
    })
    // logout call
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: null, message: 'Logged out successfully' }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(mockUser))

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
  })
})
