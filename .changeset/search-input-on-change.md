---
"@lufia/design-system": patch
---

Fix `SearchInput` used with `value` and `onChange`: the native `onChange` handler was overwritten, so the value never updated. It is now called before `onValueChange` and is part of the props type.
