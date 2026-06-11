## API

### `canTrade(date?)`

Checks whether the provided timestamp is within NYSE trading hours.

If no date is provided, the current UTC date and time will be used.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `date` | `string \| Date` *(optional)* | ISO 8601 UTC timestamp or JavaScript `Date` object |

#### Returns

```ts
boolean
```

#### Example

```js
import { canTrade } from 'cantrade'

canTrade()
// → true

canTrade('2026-05-22T14:30:00Z')
// → true
```

---

### `nextTradeAt(date?)`

Returns the next exact timestamp when trading opens.

Useful when the provided date falls outside trading hours, during weekends, or on market holidays.

If no date is provided, the current UTC date and time will be used.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `date` | `string \| Date` *(optional)* | ISO 8601 UTC timestamp or JavaScript `Date` object |

#### Returns

```ts
string
```

Returns an ISO 8601 UTC timestamp.

#### Example

```js
import { nextTradeAt } from 'cantrade'

nextTradeAt()
// → "2026-05-26T13:30:00Z"

nextTradeAt('2026-12-25T10:00:00Z')
// → "2026-12-28T14:30:00Z"
```

---

## NYSE Holiday Rules

The NYSE observes **10 full-day closures** plus several **early-close days**. This list differs from the U.S. federal holiday calendar — notably, the NYSE remains **open on Columbus Day and Veterans Day**.

### Fixed-Date Holidays

These holidays always occur on the same calendar date.

| Holiday | Rule |
|---|---|
| New Year's Day | January 1 |
| Juneteenth | June 19 |
| Independence Day | July 4 |
| Christmas Day | December 25 |

### Weekday-Positioned Holidays

These holidays are calculated by weekday-of-month position.

| Holiday | Rule |
|---|---|
| Martin Luther King Jr. Day | Third Monday in January |
| Presidents' Day | Third Monday in February |
| Memorial Day | Last Monday in May |
| Labor Day | First Monday in September |
| Thanksgiving | Fourth Thursday in November |

### Easter-Based Holidays

| Holiday | Rule |
|---|---|
| Good Friday | Friday before Easter Sunday |

Good Friday is not a U.S. federal holiday, but the NYSE is closed.

### Observance When Falling on a Weekend

Applies to **fixed-date holidays only** — weekday-positioned holidays cannot fall on a weekend.

| If Holiday Falls On | Observed On |
|---|---|
| Saturday | Previous Friday |
| Sunday | Following Monday |

Example:

```text
2026-07-04 → Saturday
Observed   → 2026-07-03 (Friday — market closed)
```

### Early Closes (1:00 p.m. ET)

On these days the NYSE closes early — at **13:00 America/New_York** instead of the usual 16:00.

| Day | Rule |
|---|---|
| Day before Independence Day | When both July 3 and July 4 fall on weekdays |
| Black Friday | Day after Thanksgiving (always a Friday) |
| Christmas Eve | When both December 24 and December 25 fall on weekdays |

On an early-close day, `canTrade()` returns `true` only between 09:30 and 13:00 ET, and `nextTradeAt()` accounts for the early close when computing the next open timestamp.
