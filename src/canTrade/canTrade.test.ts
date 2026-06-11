import { describe, expect, it } from 'vitest'
import { canTrade } from '.'

describe('canTrade', () => {
  it('returns a boolean when called with no arguments', () => {
    expect(typeof canTrade()).toBe('boolean')
  })

  it('accepts an ISO 8601 string', () => {
    expect(typeof canTrade('2026-05-22T14:30:00Z')).toBe('boolean')
  })

  it('accepts a Date instance', () => {
    expect(typeof canTrade(new Date())).toBe('boolean')
  })
})
