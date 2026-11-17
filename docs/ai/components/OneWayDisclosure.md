# OneWayDisclosure

> A button that reveals a region and hides itself once it has, moving focus into the content.

- Status: beta
- Category: Data display
- Import: `import { OneWayDisclosure } from "@lufia/design-system/components/OneWayDisclosure"`
- Also from: `@lufia/design-system`
- Source: [src/components/OneWayDisclosure](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/OneWayDisclosure)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-onewaydisclosure--docs)

## Purpose

A button that reveals a region and leaves once it has. It is a disclosure whose trigger is spent: an invitation such as
"Fill in now" that opens a form in place, where a button that stayed behind to fold the content away would be noise.

## When to use

- An invitation to start a task in place (fill in a form, add details) that is not needed again once started.

## When not to use

- Content that people open and close repeatedly: `Disclosure`.
- Views of one page: `Tabs`.
- Content people need to make a decision: show it.

## API

### `OneWayDisclosure`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `trigger` | `ReactNode` | yes |  | The label of the button that reveals the content ("Fill in now"). It is the control's name. |
| `children` | `ReactNode` | yes |  | The content that is revealed. |
| `open` | `boolean` | no |  | Controlled state. Pair it with `onOpenChange`. |
| `defaultOpen` | `boolean` | no | `false` | Initial state when `open` is not given. Start open to render the content with no button. |
| `onOpenChange` | `(open: boolean) => void` | no |  | Called with `true` when the person activates the button. The component never closes itself. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | no | `"secondary"` | Look of the button. Defaults to `"secondary"`. |
| `label` | `string` | no |  | Accessible name of the revealed content. When given, the content is exposed as a `region` landmark with this name, which is also what a screen reader announces when focus moves into it. Leave it out for content that is not a landmark. |
| `panelClassName` | `string` | no |  | Class for the revealed content wrapper. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { OneWayDisclosure } from "@lufia/design-system/components/OneWayDisclosure";

<OneWayDisclosure trigger="Fill in now" label="Your details" variant="primary">
  <ProfileForm />
</OneWayDisclosure>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves to the button |
| Enter or Space | Shows the content, hides the button, focus enters the content |

- The button has `aria-expanded` and `aria-controls` pointing at the content, which stays in the DOM while hidden.
- Activating moves focus to the content wrapper (`tabindex="-1"`, not a tab stop) before the button is hidden, so focus is never left on a control that disappeared. Tab then continues from inside the content. Focus is not moved on first render or when the app opens it without the person pressing the button.
- Give `label` when the content is a self-contained section: it becomes a `region` with that name, announced as focus enters.
- The button is the package `Button`: visible focus ring and 44px touch target under a coarse pointer.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-color-focus-ring`.

## Content guidelines

Write the trigger as the action, in sentence case: "Fill in now", not "More".

## Stories

- `components-data-display-onewaydisclosure--default`
- `components-data-display-onewaydisclosure--open-by-default`
- `components-data-display-onewaydisclosure--secondary`
- `components-data-display-onewaydisclosure--controlled`
- `components-data-display-onewaydisclosure--phone-320`
- `components-data-display-onewaydisclosure--all-themes`
