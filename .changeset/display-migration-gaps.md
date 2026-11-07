---
"@lufia/design-system": minor
---

`StatTile` with `loading` changes its default rendering (not opt-in): the skeleton now holds one line per `delta` and `hint` you pass, a placeholder where a `sparkline` is passed, and a `1lh` value height (with a rem fallback for engines without `lh`), so the loaded tile keeps its exact height. Pass the same `delta`, `hint` and `sparkline` while loading as when loaded. `Badge` reads its corner radius from `--lufia-badge-radius`, falling back to the current pill.
