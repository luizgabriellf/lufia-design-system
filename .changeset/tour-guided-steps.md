---
"@lufia/design-system": minor
---

`Tour`: add steps that wait for the person (`mode: "do"`), a host-supplied `targetStatus` (`ready`, `seeking`, `missing`,
`blocked`) with `missingBody` and the labels `doHint`, `skipStep`, `seeking` and `blocked`, a `resolveTarget` resolver with
`isStandIn` and `standInNote`, a typing guard that keeps focus in a filled text field, `compactOnTyping` for phones, a
`dialogLayout` option (`dock`, `beside`, `clipSpotlight`) for targets inside a dialog, and the switches `showCloseButton`,
`closeOnEscape` and `arrowKeyNavigation`. The card also exposes `data-lufia-part="card"`, `data-mode`, `data-status` and
`data-compact`. Everything is opt-in; existing behaviour is unchanged.
