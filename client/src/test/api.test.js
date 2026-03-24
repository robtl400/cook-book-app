import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../utils/api'

describe('api utility', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('throws with error message on non-2xx response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    })
    await expect(api.get('/recipes/999')).rejects.toThrow('Not found')
  })

  it('returns json on 2xx response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, title: 'Pasta' }),
    })
    const result = await api.get('/recipes/1')
    expect(result).toEqual({ id: 1, title: 'Pasta' })
  })

  it('sends Content-Type header for POST requests', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 2 }),
    })
    await api.post('/recipes', { title: 'Salad' })
    const [, options] = fetch.mock.calls[0]
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('falls back to HTTP status string when no error message in body', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })
    await expect(api.get('/recipes')).rejects.toThrow('HTTP 500')
  })
})
