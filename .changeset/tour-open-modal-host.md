---
"@lufia/design-system": patch
---

Fix `Tour` and the shared portal host. A closed, kept-mounted `Modal` no longer hosts anything: the card of a step with no target (and the popups of `Popover` and `MoreActions`) were rendered inside it at no size and could not be seen. A closed `Modal` no longer carries `aria-modal`. A step with no target inside an open modal now follows `dialogLayout` (`dock` on a phone, `beside` on a wide screen, falling back to below or above the modal). With `beside`, a target card with no room beside the modal goes below or above it instead of over its fields. The spotlight ring is not drawn across the target's own open listbox or menu, and stops where a docked sheet starts.
