---
"@lufia/design-system": patch
---

`MoreActions` popover is no longer clipped by an ancestor with `overflow: hidden`. The open menu is portalled out of the component (to the body, or into the open modal it sits in) and placed with `position: fixed` from the button's box. It opens upward when there is no room below, keeps flipping horizontally, follows the button on scroll and resize, and scrolls inside when the list is taller than the room. `useDismiss` takes an optional fifth argument for a portalled popup that counts as inside.
