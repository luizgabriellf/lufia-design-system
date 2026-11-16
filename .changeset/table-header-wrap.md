---
"@lufia/design-system": minor
---

`Table` headers can take less width, and two card-mode layouts are hardened.

- New `Th wrap` and `SortableTh wrap`: the header text may wrap onto two balanced lines, aligned to the bottom of the header row, so a wide table with long uppercase headers scrolls sideways less. Default off.
- New `Th abbr` and `SortableTh abbr`: a short visible text for a long header. The children (or `label`) stay the full name, which assistive technology reads, which is the `title` tooltip of the short text, and which the revealed header row shows in card mode. The native `abbr` attribute is set on the `th`. Default off.
- Fix: in card mode a `Td cardSlot="corner"` now ignores an inline `width` (such as `width: 1%` kept for a narrow desktop column) and keeps the size of its content, instead of collapsing to a few pixels. Table layout still honours the width. This is the one visible change for existing consumers.
- Change: with `cardLayout="grid"` a badge keeps its text on one line and a half-width cell is never narrower than its content, so a long pill takes a line of its own instead of wrapping onto two lines; short pills and text still pair up. A pill wider than the whole card can opt back in with `Badge wrap`. The cards are now a wrapping flex row instead of a CSS grid; the two-column and one-column behaviour is unchanged.
