import type { FormattedDateObject } from './canTrade'

const weekdayOf = (year: number, monthIndex: number, day: number): number =>
  new Date(Date.UTC(year, monthIndex, day)).getUTCDay()

const nthWeekdayOfMonth = (
  year: number,
  monthIndex: number,
  weekday: number,
  n: number,
): number => {
  const firstDOW = weekdayOf(year, monthIndex, 1)
  return 1 + ((weekday - firstDOW + 7) % 7) + 7 * (n - 1)
}

// Returns the day-of-month the NYSE actually closes for a fixed-date holiday.
// Saturday → previous Friday; Sunday → following Monday; weekday → same day.
const observedDay = (year: number, monthIndex: number, day: number): number => {
  const dow = weekdayOf(year, monthIndex, day)
  if (dow === 6) return day - 1
  if (dow === 0) return day + 1
  return day
}

export const isWeekend = (weekday: string) => weekday === 'Sat' || weekday === 'Sun'

// FIXED DATE HOLIDAYS

export const isNewYearDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 1) return false

  // NYSE exception: when Jan 1 falls on Saturday, NYSE does NOT close Fri Dec 31.
  // So no observance shift for the Sat case — only the standard Sun → Mon shift applies.
  const jan1DOW = weekdayOf(year, 0, 1)
  if (jan1DOW === 6) return day === 1 // Sat: closed only by weekend rule itself
  if (jan1DOW === 0) return day === 2 // Sun → observed on Monday Jan 2
  return day === 1
}

export const isJuneteenthDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 6) return false
  return day === observedDay(year, 5, 19)
}

export const isIndependenceDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 7) return false
  return day === observedDay(year, 6, 4)
}

export const isChristmasDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 12) return false
  return day === observedDay(year, 11, 25)
}

// DYNAMIC DATE HOLIDAYS

export const isMartinLutherKingDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 1) return false
  return day === nthWeekdayOfMonth(year, 0, 1, 3) // 3rd Monday of January
}

export const isPresidentsDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 2) return false
  return day === nthWeekdayOfMonth(year, 1, 1, 3) // 3rd Monday of February
}

export const isMemorialDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 5) return false

  // Last Monday of May = May 31 minus the offset back to most recent Monday.
  const may31DOW = weekdayOf(year, 4, 31)
  const daysBack = (may31DOW - 1 + 7) % 7
  return day === 31 - daysBack
}

export const isLaborDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 9) return false
  return day === nthWeekdayOfMonth(year, 8, 1, 1) // 1st Monday of September
}

export const isThanksgivingDay = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  if (month !== 11) return false
  return day === nthWeekdayOfMonth(year, 10, 4, 4) // 4th Thursday of November
}

// Meeus/Jones/Butcher Gregorian Easter algorithm.
// Returns Easter Sunday with monthIndex 0-indexed (2 = March, 3 = April).
const easterSunday = (year: number): { monthIndex: number; day: number } => {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { monthIndex: month - 1, day }
}

export const isGoodFriday = (formattedDate: FormattedDateObject) => {
  const { year, day, month } = formattedDate
  // Easter spans Mar 22 - Apr 25, so Good Friday is always in March or April.
  if (month !== 3 && month !== 4) return false

  const { monthIndex: easterMonthIndex, day: easterDay } = easterSunday(year)

  // Date.UTC handles the rollover when Easter is on Apr 1 or Apr 2 (Good Friday lands in March).
  const gf = new Date(Date.UTC(year, easterMonthIndex, easterDay - 2))

  return month === gf.getUTCMonth() + 1 && day === gf.getUTCDate()
}

// EARLY-CLOSE (HALF) DAYS — NYSE closes at 13:00 ET instead of 16:00 ET

// Day before Independence Day: only when Jul 4 lands on Tue-Fri.
// If Jul 4 is on Sat, Jul 3 is the FULL observed closure (handled by isIndependenceDay).
const isPreJuly4HalfDay = (p: FormattedDateObject): boolean => {
  if (p.month !== 7 || p.day !== 3) return false
  const jul4DOW = weekdayOf(p.year, 6, 4)
  return jul4DOW >= 2 && jul4DOW <= 5
}

// Black Friday — always the Friday immediately after Thanksgiving.
const isBlackFriday = (p: FormattedDateObject): boolean => {
  if (p.month !== 11) return false
  const thanksgivingDay = nthWeekdayOfMonth(p.year, 10, 4, 4)
  return p.day === thanksgivingDay + 1
}

// Christmas Eve: only when Dec 25 lands on Tue-Fri.
// If Dec 25 is on Sat, Dec 24 is the FULL observed closure (handled by isChristmasDay).
const isChristmasEveHalfDay = (p: FormattedDateObject): boolean => {
  if (p.month !== 12 || p.day !== 24) return false
  const dec25DOW = weekdayOf(p.year, 11, 25)
  return dec25DOW >= 2 && dec25DOW <= 5
}

export const isEarlyCloseDay = (p: FormattedDateObject): boolean =>
  isPreJuly4HalfDay(p) || isBlackFriday(p) || isChristmasEveHalfDay(p)
