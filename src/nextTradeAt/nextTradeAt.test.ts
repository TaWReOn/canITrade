import { describe, expect, it } from 'vitest'
import { nextTradeAt } from '.'

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/

describe('nextTradeAt', () => {
  describe('API shape', () => {
    it('returns an ISO 8601 UTC string when called with no arguments', () => {
      expect(nextTradeAt()).toMatch(ISO_PATTERN)
    })

    it('accepts an ISO 8601 string', () => {
      expect(nextTradeAt('2026-12-25T10:00:00Z')).toMatch(ISO_PATTERN)
    })

    it('accepts a Date instance', () => {
      expect(nextTradeAt(new Date())).toMatch(ISO_PATTERN)
    })

    it('throws on an invalid date string', () => {
      expect(() => nextTradeAt('not-a-date')).toThrow('Invalid date')
    })
  })

  describe('README examples', () => {
    it('Christmas 2026 (Fri) → Monday Dec 28, 09:30 ET (EST = 14:30 UTC)', () => {
      expect(nextTradeAt('2026-12-25T10:00:00Z')).toBe('2026-12-28T14:30:00.000Z')
    })
  })

  describe('within a normal trading day', () => {
    it('before 09:30 ET on a trading day → returns today at 09:30 ET (EDT)', () => {
      // Fri May 22, 2026, 06:00 ET (10:00 UTC) — before open
      expect(nextTradeAt('2026-05-22T10:00:00Z')).toBe('2026-05-22T13:30:00.000Z')
    })

    it('exactly at 09:30 ET on a trading day → returns NEXT trading day open', () => {
      // Fri May 22, 2026, 09:30 ET (13:30 UTC) — exactly open; spec returns next
      // Mon May 25, 2026 is Memorial Day (closed) → Tue May 26 09:30 ET = 13:30 UTC
      expect(nextTradeAt('2026-05-22T13:30:00Z')).toBe('2026-05-26T13:30:00.000Z')
    })

    it('after close on a trading day → next day open', () => {
      // Thu May 21, 2026, 16:00 ET (20:00 UTC) — just closed
      // Next is Fri May 22, 09:30 ET = 13:30 UTC
      expect(nextTradeAt('2026-05-21T20:00:00Z')).toBe('2026-05-22T13:30:00.000Z')
    })
  })

  describe('skips weekends', () => {
    it('Saturday → following Monday open', () => {
      // Sat May 23, 2026 noon UTC → Mon May 25 is Memorial Day → Tue May 26
      expect(nextTradeAt('2026-05-23T12:00:00Z')).toBe('2026-05-26T13:30:00.000Z')
    })

    it('Sunday → following Monday open', () => {
      // Sun May 24, 2026 → Mon May 25 Memorial Day → Tue May 26
      expect(nextTradeAt('2026-05-24T12:00:00Z')).toBe('2026-05-26T13:30:00.000Z')
    })
  })

  describe('skips full-day holidays', () => {
    it('Independence Day shift: Fri Jul 3, 2026 (observed) → Mon Jul 6', () => {
      // Sat Jul 4, 2026 → observed Fri Jul 3 (closed full day)
      // Sun Jul 5 → Mon Jul 6 09:30 ET (EDT) = 13:30 UTC
      expect(nextTradeAt('2026-07-03T16:00:00Z')).toBe('2026-07-06T13:30:00.000Z')
    })

    it('Thanksgiving Thu → Black Friday (open, half day) → returns Black Friday open', () => {
      // Thu Nov 26, 2026 (Thanksgiving) at 10:00 ET (15:00 UTC, market closed)
      // → Fri Nov 27 is Black Friday (half-day, but OPEN at 09:30) = 14:30 UTC (EST after DST end)
      expect(nextTradeAt('2026-11-26T15:00:00Z')).toBe('2026-11-27T14:30:00.000Z')
    })
  })

  describe('DST crossover', () => {
    it('spring forward weekend (Mar 8, 2026 = DST starts) → Mon Mar 9 in EDT', () => {
      // Sat Mar 7, 2026 → Sun Mar 8 (DST begins) → Mon Mar 9, 09:30 ET in EDT = 13:30 UTC
      expect(nextTradeAt('2026-03-07T12:00:00Z')).toBe('2026-03-09T13:30:00.000Z')
    })

    it('fall back weekend (Nov 1, 2026 = DST ends) → Mon Nov 2 in EST', () => {
      // Sat Oct 31, 2026 → Sun Nov 1 (DST ends) → Mon Nov 2, 09:30 ET in EST = 14:30 UTC
      expect(nextTradeAt('2026-10-31T12:00:00Z')).toBe('2026-11-02T14:30:00.000Z')
    })
  })

  describe('year boundary', () => {
    it('Dec 31 evening → next year first trading day', () => {
      // Thu Dec 31, 2026, 22:00 UTC = 17:00 ET (just closed)
      // → Fri Jan 1, 2027 (New Year's Day, closed)
      // → Sat Jan 2 / Sun Jan 3 (weekend)
      // → Mon Jan 4, 09:30 ET in EST = 14:30 UTC
      expect(nextTradeAt('2026-12-31T22:00:00Z')).toBe('2027-01-04T14:30:00.000Z')
    })
  })
})
