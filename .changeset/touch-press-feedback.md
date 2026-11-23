---
"@lufia/design-system": patch
---

Interactive controls now show a pressed state on touch screens (the press scale for compact controls, the hover surface for rows, a slight dim for inline links), and `MobileFloatBar` eases its press instead of applying it at once. Hover-only feedback is limited to devices that can hover, so it no longer sticks after a tap.
