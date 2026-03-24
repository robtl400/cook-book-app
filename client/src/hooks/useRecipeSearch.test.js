import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecipeSearch } from './useRecipeSearch'

describe('useRecipeSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears results immediately when query is empty', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 1, title: 'Pasta' }], message: 'Success' }),
    })

    const { result } = renderHook(() => useRecipeSearch())

    // Set a non-empty query first
    act(() => {
      result.current[1]('pasta')
    })
    vi.advanceTimersByTime(300)

    // Now clear it
    act(() => {
      result.current[1]('')
    })

    // Results cleared immediately without waiting for debounce
    expect(result.current[2]).toEqual([])
  })

  it('does not call fetch before 300ms debounce', () => {
    const { result } = renderHook(() => useRecipeSearch())

    act(() => {
      result.current[1]('pasta')
    })

    // Before debounce fires
    vi.advanceTimersByTime(299)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('calls fetch after 300ms debounce for non-empty query', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 1, title: 'Pasta' }], message: 'Success' }),
    })

    const { result } = renderHook(() => useRecipeSearch())

    act(() => {
      result.current[1]('pasta')
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      // Let promises resolve
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [url] = fetch.mock.calls[0]
    expect(url).toContain('/search/recipes?q=pasta')
  })
})
