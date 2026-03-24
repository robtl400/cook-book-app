import { describe, it, expect } from 'vitest'
import { normalizeDifficulty, mapPostToDefaults, mapCookToDefaults, DEFAULT_VALUES } from './recipe'

describe('normalizeDifficulty', () => {
  it('returns empty string for falsy values', () => {
    expect(normalizeDifficulty('')).toBe('')
    expect(normalizeDifficulty(null)).toBe('')
    expect(normalizeDifficulty(undefined)).toBe('')
  })

  it('capitalizes easy', () => {
    expect(normalizeDifficulty('easy')).toBe('Easy')
    expect(normalizeDifficulty('EASY')).toBe('Easy')
  })

  it('capitalizes medium', () => {
    expect(normalizeDifficulty('medium')).toBe('Medium')
  })

  it('capitalizes hard', () => {
    expect(normalizeDifficulty('hard')).toBe('Hard')
  })

  it('passes through unknown values unchanged', () => {
    expect(normalizeDifficulty('Expert')).toBe('Expert')
  })
})

describe('mapPostToDefaults', () => {
  it('sorts ingredients by sort_order', () => {
    const post = {
      ingredients: [
        { sort_order: 2, quantity: '1', unit: 'cup', name: 'flour' },
        { sort_order: 0, quantity: '2', unit: 'tbsp', name: 'sugar' },
        { sort_order: 1, quantity: '3', unit: 'tsp', name: 'salt' },
      ],
      steps: [],
    }
    const result = mapPostToDefaults(post)
    expect(result.ingredients[0].name).toBe('sugar')
    expect(result.ingredients[1].name).toBe('salt')
    expect(result.ingredients[2].name).toBe('flour')
  })

  it('sorts steps by sort_order', () => {
    const post = {
      ingredients: [],
      steps: [
        { sort_order: 1, body: 'Mix' },
        { sort_order: 0, body: 'Preheat' },
      ],
    }
    const result = mapPostToDefaults(post)
    expect(result.steps[0].body).toBe('Preheat')
    expect(result.steps[1].body).toBe('Mix')
  })

  it('returns default single row when ingredients is empty', () => {
    const result = mapPostToDefaults({ ingredients: [], steps: [] })
    expect(result.ingredients).toEqual([{ quantity: '', unit: '', name: '' }])
  })

  it('returns default single step row when steps is empty', () => {
    const result = mapPostToDefaults({ ingredients: [], steps: [] })
    expect(result.steps).toEqual([{ body: '' }])
  })
})

describe('mapCookToDefaults', () => {
  it('uses src.id as source_post_id for original source type', () => {
    const src = {
      id: 42,
      attribution: { source_type: 'internal', source_post_id: 42 },
    }
    const result = mapCookToDefaults(src)
    expect(result.source_post_id).toBe(42)
  })

  it('passes through external attribution', () => {
    const src = {
      id: 10,
      attribution: {
        source_type: 'external',
        source_url: 'https://example.com/recipe',
        source_post_id: null,
      },
    }
    const result = mapCookToDefaults(src)
    expect(result.source_type).toBe('external')
    expect(result.source_url).toBe('https://example.com/recipe')
  })

  it('spreads DEFAULT_VALUES for fields not in src', () => {
    const src = { id: 1, attribution: {} }
    const result = mapCookToDefaults(src)
    expect(result.title).toBe('')
    expect(result.self_rating).toBe(0)
  })
})
