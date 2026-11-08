---
"@lufia/design-system": minor
---

Add `computeStatDelta`, a pure helper that turns a current and a previous number into the `delta`, `trend`,
`trendLabel` and `deltaTone` props of `StatTile`. It formats a percentage by default, switches to an absolute change on a
zero or small base (`minBase`, default 5), treats changes within `flatThreshold` as flat, maps `goodDirection` to the tone
and returns `null` without a previous value. All text comes in through `labels`.
