---
"@lufia/design-system": minor
---

`StatTile` with `loading` now keeps the loaded tile's exact height: its skeletons take the line boxes of the figure, change, hint and chart (pass the same `delta`, `hint` and `sparkline` while loading). `Badge` reads its corner radius from `--lufia-badge-radius`, falling back to the current pill.
