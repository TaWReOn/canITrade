import {
  isChristmasDay,
  isEarlyCloseDay,
  isGoodFriday,
  isIndependenceDay,
  isJuneteenthDay,
  isLaborDay,
  isMartinLutherKingDay,
  isMemorialDay,
  isNewYearDay,
  isPresidentsDay,
  isThanksgivingDay,
  isWeekend,
} from '../utils'

export function canTrade(date?: string | Date): boolean {
  const observedDate = date ?? new Date()
  const formattedDateWithTimezone = formatInTimezone(observedDate, 'America/New_York')

  if (isWeekend(formattedDateWithTimezone.weekday)) return false

  return isHoliday(formattedDateWithTimezone) ? false : isStockMarketOpen(formattedDateWithTimezone)
}

// NOTE: Indexing starts at 1
const RESTING_WEEEKDAY = ['Sat', 'Sun']
const STOCK_CORE_TRADING_START_AT_SEC = 9 * 60 * 60 + 30 * 60
const STOCK_CORE_TRADING_END_AT_SEC = 16 * 60 * 60
const STOCK_EARLY_CLOSE_AT_SEC = 13 * 60 * 60
// const STOCK_PRE_TRADING_START_AT_SEC = 11 * 60 * 60
// const STOCK_PRE_TRADING_END_AT_SEC = STOCK_CORE_TRADING_START_AT_SEC - 1

export const isHoliday = (formattedDatetime: FormattedDateObject) => {
  const month = formattedDatetime.month

  switch (month) {
    case 1: {
      return isNewYearDay(formattedDatetime) || isMartinLutherKingDay(formattedDatetime)
    }
    case 2: {
      return isPresidentsDay(formattedDatetime)
    }
    case 3:
    case 4: {
      return isGoodFriday(formattedDatetime)
    }
    case 5: {
      return isMemorialDay(formattedDatetime)
    }
    case 6: {
      return isJuneteenthDay(formattedDatetime)
    }
    case 7: {
      return isIndependenceDay(formattedDatetime)
    }
    case 9: {
      return isLaborDay(formattedDatetime)
    }
    case 11: {
      return isThanksgivingDay(formattedDatetime)
    }
    case 12: {
      return isChristmasDay(formattedDatetime)
    }
    default: {
      return false
    }
  }
}

// US STOCK WORKING TIME
// Core Trading Session: 9:30 a.m. to 4:00 p.m. ET
// America/New_York

export const isStockMarketOpen = (formattedDate: FormattedDateObject): boolean => {
  if (RESTING_WEEEKDAY.includes(formattedDate.weekday)) {
    return false
  }

  const SEC_SINCE_MIDNIGHT = formattedDate.minute * 60 + formattedDate.hour * 60 * 60
  const closeAtSec = isEarlyCloseDay(formattedDate)
    ? STOCK_EARLY_CLOSE_AT_SEC
    : STOCK_CORE_TRADING_END_AT_SEC

  return STOCK_CORE_TRADING_START_AT_SEC <= SEC_SINCE_MIDNIGHT && SEC_SINCE_MIDNIGHT < closeAtSec
}

type FormattedDateParts = {
  weekday: string
  month: number
  day: number
  year: number
  hour: number
  minute: number
}

type JSDate = {
  date: number
}

const JS_WEEKDAYS = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export type FormattedDateObject = FormattedDateParts & JSDate

export const formatInTimezone = (date: string | Date, timezone = 'UTC'): FormattedDateObject => {
  const d = new Date(date)

  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date')
  }

  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(d)

  const map = Object.fromEntries(
    dateFormatted.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
  ) as unknown as FormattedDateParts

  return {
    weekday: map.weekday,
    month: Number(map.month),
    day: Number(map.day),
    year: Number(map.year),
    hour: Number(map.hour),
    minute: Number(map.minute),
    date: JS_WEEKDAYS[map.weekday as keyof typeof JS_WEEKDAYS],
  }
}
