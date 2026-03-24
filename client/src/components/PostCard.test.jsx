import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PostCard from './PostCard'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('./SaveToBoxModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="save-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

vi.mock('./AttributionBadge', () => ({
  default: () => null,
}))

import { useAuth } from '../context/AuthContext'

const basePost = {
  id: 1,
  title: 'Spaghetti Bolognese',
  description: 'A classic Italian pasta dish.',
  self_rating: 4,
  image_url: 'https://example.com/pasta.jpg',
  source_type: 'original',
  user: { id: 10, username: 'chef', display_name: 'Chef Bob' },
}

function renderPostCard(post = basePost) {
  return render(
    <MemoryRouter>
      <PostCard post={post} />
    </MemoryRouter>
  )
}

describe('PostCard', () => {
  it('renders title and description', () => {
    useAuth.mockReturnValue({ user: null })
    renderPostCard()

    expect(screen.getByText('Spaghetti Bolognese')).toBeTruthy()
    expect(screen.getByText('A classic Italian pasta dish.')).toBeTruthy()
  })

  it('shows fallback placeholder when image errors', () => {
    useAuth.mockReturnValue({ user: null })
    renderPostCard()

    const img = screen.getByRole('img', { name: /Spaghetti Bolognese/i })
    fireEvent.error(img)

    // After error, img should be gone and placeholder div shown
    expect(screen.queryByRole('img', { name: /Spaghetti Bolognese/i })).toBeNull()
  })

  it('hides Save button when not authenticated', () => {
    useAuth.mockReturnValue({ user: null })
    renderPostCard()

    expect(screen.queryByText('Save to My Recipe Box')).toBeNull()
  })

  it('shows Save button when authenticated', () => {
    useAuth.mockReturnValue({ user: { id: 5, username: 'alice' } })
    renderPostCard()

    expect(screen.getByText('Save to My Recipe Box')).toBeTruthy()
  })
})
