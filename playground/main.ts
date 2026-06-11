import * as cantrade from '../src/index'

console.log(cantrade)

declare global {
  interface Window {
    canTrade: typeof cantrade.canTrade
    nextTradeAt: typeof cantrade.nextTradeAt
    formatInTimezone: typeof cantrade.formatInTimezone
  }
}

window.canTrade = cantrade.canTrade
window.nextTradeAt = cantrade.nextTradeAt
window.formatInTimezone = cantrade.formatInTimezone

console.log('%ccanTrade ready', 'font-weight: bold;', '\nTry: canTrade()\n     nextTradeAt()')
