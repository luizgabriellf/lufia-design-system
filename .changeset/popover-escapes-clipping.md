---
"@lufia/design-system": minor
---

`MoreActions` popover is no longer clipped by an ancestor with `overflow: hidden`. Once mounted, the open menu is portalled out of the component (to the body, or into the open modal it sits in) and placed with `position: fixed` from the button's box. It opens upward when there is no room below, keeps flipping horizontally, follows the button on scroll and resize (closing when the button is hidden or scrolls out of view), and scrolls inside when the list is taller than the room.

Consumers: the open menu is no longer inside the component's root element, so query it by role (`getByRole("menu")`) rather than within the root. A nested `data-lufia-theme`/`data-lufia-mode` scope, `dir`, `lang` and the root's inline `--lufia-*` properties are copied onto the menu. `useDismiss` takes an optional fifth argument for a portalled popup that counts as inside.

Test DOMs without layout (jsdom) need no mocks: the menu opens and stays open, and the hidden-trigger and scrolled-away checks apply only when the trigger had layout as the menu opened.
