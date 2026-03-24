import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeAgo } from './time'

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" when less than 1 minute ago', () => {
    const date = new Date('2024-01-01T11:59:30Z').toISOString()
    expect(timeAgo(date)).toBe('just now')
  })

  it('returns minutes ago when 1-59 minutes ago', () => {
    const date = new Date('2024-01-01T11:45:00Z').toISOString()
    expect(timeAgo(date)).toBe('15m ago')
  })

  it('returns hours ago when 1-23 hours ago', () => {
    const date = new Date('2024-01-01T09:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('3h ago')
  })

  it('returns days ago when 1-29 days ago', () => {
    const date = new Date('2023-12-25T12:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('7d ago')
  })

  it('returns months ago when 1-11 months ago', () => {
    const date = new Date('2023-10-01T12:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('3mo ago')
  })

  it('returns years ago when 12+ months ago', () => {
    const date = new Date('2022-01-01T12:00:00Z').toISOString()
    expect(timeAgo(date)).toBe('2y ago')
  })
})
