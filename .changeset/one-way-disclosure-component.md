---
"@lufia/design-system": minor
---

OneWayDisclosure (beta): a button that reveals a region and hides itself once it has, for an invitation such as "Fill in now" that opens a
form in place. The button carries `aria-expanded` and `aria-controls`; on activation the content is shown and focus moves into it
before the button is hidden, so focus is never lost. Uncontrolled (`defaultOpen`) or controlled (`open`, `onOpenChange`); `label`
exposes the content as a named region, `variant` styles the button. Focus does not move on first render.
