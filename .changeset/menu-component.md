---
"@lufia/design-system": minor
---

Menu (beta): a list of choices that hangs from its own trigger, for pickers such as a scope switcher or an export menu.
`role="menu"` (default, `menuitem`) or `role="listbox"` (`option`, the `current` one `aria-selected`); action items
(`onSelect`) and link items (`href`, through the provider's link adapter, `aria-current="page"` on the current one), each
with an optional `description`, `meta` text and `icon`, plus groups with headings and separators. Roving focus with the
arrow keys, Home, End and type-ahead; Escape and Tab close and focus returns to the trigger. Controlled or uncontrolled
`open`, `placement` and `align` with the same clip-aware flip as `Popover`, `matchTriggerWidth`, `closeOnSelect`, and
`presentation="inline"` for the same items as an always-visible list. Themed with `--lufia-menu-*` hooks.
