import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CommentSection from './CommentSection'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

function renderCommentSection(postId = 1, postOwnerId = 99) {
  return render(
    <MemoryRouter>
      <CommentSection postId={postId} postOwnerId={postOwnerId} />
    </MemoryRouter>
  )
}

function mockFetch(responses) {
  let callCount = 0
  vi.stubGlobal('fetch', vi.fn(() => {
    const resp = responses[callCount] ?? responses[responses.length - 1]
    callCount++
    return Promise.resolve(resp)
  }))
}

const mockUser = { id: 1, username: 'alice', display_name: 'Alice' }

describe('CommentSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('shows spinner while loading comments', () => {
    useAuth.mockReturnValue({ user: mockUser })
    // Never-resolving fetch
    fetch.mockReturnValue(new Promise(() => {}))

    renderCommentSection()
    // Spinner component should be present
    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('shows error state when fetch fails', async () => {
    useAuth.mockReturnValue({ user: mockUser })
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    })

    renderCommentSection()
    await waitFor(() => expect(screen.getByText("Couldn't load comments.")).toBeTruthy())
  })

  it('shows empty state when no comments', async () => {
    useAuth.mockReturnValue({ user: mockUser })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [], message: 'Success' }),
    })

    renderCommentSection()
    await waitFor(() => expect(screen.getByText('No comments yet. Be the first!')).toBeTruthy())
  })

  it('shows login prompt when unauthenticated', async () => {
    useAuth.mockReturnValue({ user: null })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [], message: 'Success' }),
    })

    renderCommentSection()
    await waitFor(() => expect(screen.getByText('Log in')).toBeTruthy())
    expect(screen.queryByPlaceholderText('Add a comment…')).toBeNull()
  })

  it('submits a comment and adds it to the list', async () => {
    useAuth.mockReturnValue({ user: mockUser })
    const newComment = {
      id: 100,
      body: 'Great recipe!',
      user_id: 1,
      post_id: 1,
      created_at: new Date().toISOString(),
      user: mockUser,
      replies: [],
    }

    // GET comments
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [], message: 'Success' }),
    })
    // POST comment
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ data: newComment, message: 'Comment added' }),
    })

    renderCommentSection()
    await waitFor(() => expect(screen.getByPlaceholderText('Add a comment…')).toBeTruthy())

    const textarea = screen.getByPlaceholderText('Add a comment…')
    fireEvent.change(textarea, { target: { value: 'Great recipe!' } })
    fireEvent.click(screen.getByText('Post comment'))

    await waitFor(() => expect(screen.getByText('Great recipe!')).toBeTruthy())
  })

  it('deletes a comment and removes it from the list', async () => {
    useAuth.mockReturnValue({ user: mockUser })
    const comment = {
      id: 5,
      body: 'This is deletable',
      user_id: 1,
      post_id: 1,
      created_at: new Date().toISOString(),
      user: mockUser,
      replies: [],
    }

    // GET comments
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [comment], message: 'Success' }),
    })
    // DELETE comment
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: null, message: 'Deleted' }),
    })

    renderCommentSection(1, 1)
    await waitFor(() => expect(screen.getByText('This is deletable')).toBeTruthy())

    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => expect(screen.queryByText('This is deletable')).toBeNull())
  })
})
