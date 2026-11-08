---
"@lufia/design-system": minor
---

Close the gaps of a server-backed `CommandPalette`. `labels.loading` shows a spinner row below the commands while `loading` is true and announces it once, `hint` may be a function of `{ query }` and `hintPlacement="top"` keeps it above the list, `notice` renders a message (such as an error) above the results without replacing them so keyboard selection keeps working, and `CommandItem.tone` (`default`, `accent`, `danger`) tints an item's icon. Existing usage is unchanged.
