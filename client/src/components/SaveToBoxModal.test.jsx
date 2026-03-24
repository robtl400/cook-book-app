import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SaveToBoxModal from './SaveToBoxModal'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

const mockUser = { id: 1, username: 'alice' }
const likedBox = { id: 10, name: 'My Recipe Box', box_type: 'liked', is_default: true }
const subBox1 = { id: 20, name: 'Weeknight Dinners', box_type: 'custom', is_default: false }
const subBox2 = { id: 21, name: 'Meal Prep', box_type: 'custom', is_default: false }

function makeBoxesResponse(boxes) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data: boxes, message: 'Success' }),
  }
}

function makeSavedResponse(ids) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data: ids, message: 'Success' }),
  }
}

function setup({ boxes = [likedBox, subBox1, subBox2], savedIds = [likedBox.id, subBox1.id] } = {}) {
  useAuth.mockReturnValue({ user: mockUser })
  vi.stubGlobal('fetch', vi.fn())
  fetch
    .mockResolvedValueOnce(makeBoxesResponse(boxes))
    .mockResolvedValueOnce(makeSavedResponse(savedIds))

  return render(<SaveToBoxModal postId={1} onClose={vi.fn()} />)
}

describe('SaveToBoxModal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('unchecking liked clears sub-boxes', async () => {
    setup()

    await waitFor(() => expect(screen.getByLabelText('My Recipe Box')).toBeTruthy())

    const likedCheckbox = screen.getByLabelText('My Recipe Box')
    expect(likedCheckbox.checked).toBe(true)

    fireEvent.click(likedCheckbox)

    // All sub-boxes should be unchecked and disabled
    const subCheckbox = screen.getByLabelText('Weeknight Dinners')
    expect(subCheckbox.checked).toBe(false)
    expect(subCheckbox.disabled).toBe(true)
  })

  it('re-checking liked restores sub-boxes to initial state', async () => {
    setup()

    await waitFor(() => expect(screen.getByLabelText('My Recipe Box')).toBeTruthy())

    const likedCheckbox = screen.getByLabelText('My Recipe Box')

    // Uncheck then re-check
    fireEvent.click(likedCheckbox)
    fireEvent.click(likedCheckbox)

    // Sub-box that was saved should be re-checked
    const subCheckbox = screen.getByLabelText('Weeknight Dinners')
    expect(subCheckbox.checked).toBe(true)
  })

  it('toggling a sub-box adds/removes it from staged set', async () => {
    setup()

    await waitFor(() => expect(screen.getByLabelText('Meal Prep')).toBeTruthy())

    // Meal Prep was not in savedIds so should be unchecked
    const mealPrepCheckbox = screen.getByLabelText('Meal Prep')
    expect(mealPrepCheckbox.checked).toBe(false)

    // Toggle on
    fireEvent.click(mealPrepCheckbox)
    expect(mealPrepCheckbox.checked).toBe(true)

    // Toggle off
    fireEvent.click(mealPrepCheckbox)
    expect(mealPrepCheckbox.checked).toBe(false)
  })

  it('creating a new box adds it to the list and auto-stages it', async () => {
    setup()

    await waitFor(() => expect(screen.getByPlaceholderText('New list name…')).toBeTruthy())

    const newBox = { id: 99, name: 'Pasta Night', box_type: 'custom', is_default: false }
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ data: newBox, message: 'Created' }),
    })

    const input = screen.getByPlaceholderText('New list name…')
    fireEvent.change(input, { target: { value: 'Pasta Night' } })
    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => expect(screen.getByLabelText('Pasta Night')).toBeTruthy())

    const newCheckbox = screen.getByLabelText('Pasta Night')
    expect(newCheckbox.checked).toBe(true)
  })
})
