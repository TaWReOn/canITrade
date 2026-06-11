import { type FormattedDateObject, formatInTimezone, isHoliday } from '../canTrade'
import { isWeekend } from '../utils'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Converts (year, monthIndex, day) into the UTC Date representing 09:30 America/New_York
// on that calendar day. Handles DST automatically by self-checking the result.
const nyMorningOpenUTC = (year: number, monthIndex: number, day: number): Date => {
  const candidate = new Date(Date.UTC(year, monthIndex, day, 13, 30))
  const parts = formatInTimezone(candidate, 'America/New_York')
  if (parts.hour === 9 && parts.minute === 30 && parts.day === day) return candidate
  return new Date(Date.UTC(year, monthIndex, day, 14, 30))
}

const isTradingDay = (p: FormattedDateObject): boolean => !isWeekend(p.weekday) && !isHoliday(p)

export function nextTradeAt(date?: string | Date): string {
  const input = new Date(date ?? new Date())
  if (Number.isNaN(input.getTime())) throw new Error('Invalid date')

  let parts = formatInTimezone(input, 'America/New_York')
  const openUTC = nyMorningOpenUTC(parts.year, parts.month - 1, parts.day)

  if (input.getTime() < openUTC.getTime() && isTradingDay(parts)) {
    return openUTC.toISOString()
  }

  let cursor = new Date(openUTC.getTime() + ONE_DAY_MS)
  while (true) {
    parts = formatInTimezone(cursor, 'America/New_York')
    if (isTradingDay(parts)) {
      return nyMorningOpenUTC(parts.year, parts.month - 1, parts.day).toISOString()
    }
    cursor = new Date(cursor.getTime() + ONE_DAY_MS)
  }
}
