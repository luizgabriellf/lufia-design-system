# Popover

> A non-modal panel anchored to a trigger, for content that needs more room than a menu and less ceremony than a dialog.

- Status: beta
- Category: Overlays
- Import: `import { Popover } from "@lufia/design-system/components/Popover"`
- Also from: `@lufia/design-system`
- Source: [src/components/Popover](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Popover)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-popover--docs)

## Purpose

A non-modal panel anchored to a trigger. It holds content that needs more room than a menu, such as a small form, a filter
set or an explanation, and it never blocks the page: no focus trap, no scroll lock, nothing made inert.

## When to use

- Contextual content tied to one control: a few filters, a short form, a rich explanation.
- Something the person may want to consult while still working on the page.

## When not to use

- A list of actions: use `MoreActions`.
- A question that must be answered, or content that needs the whole page's attention: use `Modal` or `ConfirmDialog`.
- A one-line hint: use a tooltip or help text.
- Long flows or large forms: use a page or a `Modal`.

## API

### `Popover`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `trigger` | `(props: PopoverTriggerProps) => ReactNode` | yes |  | Renders the element that opens the panel (usually a `Button`) and spreads the given props onto it. Called on every render, so keep it cheap: `trigger={(props) => <Button {...props}>Filters</Button>}`. |
| `children` | `ReactNode` | yes |  | The panel's content. Rendered only while the panel is open (and while it animates out). |
| `label` | `string` | yes |  | Accessible name of the panel (`role="dialog"`), such as "Filters". |
| `open` | `boolean` | no |  | Whether the panel is open. Controlled; pair it with `onOpenChange`. |
| `defaultOpen` | `boolean` | no | `false` | Whether the panel starts open when `open` is not given. For documentation and tests; focus is not moved on first paint. |
| `onOpenChange` | `(open: boolean) => void` | no |  | Called with the next state when the trigger, Escape or a press outside asks to change it. |
| `placement` | `"end" \| "top" \| "bottom" \| "start"` | no | `"bottom"` | Which side of the trigger the panel opens on. `start` and `end` follow the writing direction. It flips to the opposite side when it does not fit. Default `bottom`. |
| `align` | `"end" \| "start" \| "center"` | no | `"start"` | How the panel lines up with the trigger along the other axis. It shifts to stay in the viewport. Default `start`. |
| `initialFocus` | `"first" \| "panel"` | no | `"first"` | Where focus goes when the panel opens: the first focusable element inside (`"first"`, default; the panel itself when there is none) or the panel. |

Other native element attributes pass through to the root element.

## Types

- `PopoverTriggerProps`: `{ ref: (element: HTMLElement | null) => void; onClick: () => void; "aria-expanded": boolean; "aria-controls": string | undefined; "aria-haspopup": "dialog"; }`

## Example

```tsx
import { Popover } from "@lufia/design-system/components/Popover";

<Popover label="Filters" trigger={(props) => <Button {...props}>Filters</Button>}>
  <FilterForm />
</Popover>;
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Enter / Space | Trigger \| Opens or closes the panel; focus moves to the first control inside (or the panel) |
| Escape | Anywhere \| Closes the panel and returns focus to the trigger |
| Tab | Last control in the panel \| Focus goes to the trigger and on to the next element after it; the panel stays open |
| Shift+Tab | First control in the panel \| Focus goes back to the trigger; the panel stays open |

- The trigger carries `aria-expanded` and `aria-haspopup="dialog"`, and `aria-controls` while the panel is rendered.
- The panel is `role="dialog"` named by `label`. It is not `aria-modal`: the page behind stays in the accessibility tree and operable. Focus moves in on open (so a screen reader announces the dialog) and returns to the trigger on Escape, and when the panel is closed from inside while focus was in it.
- The panel is portalled to the end of the body, so the browser's own Tab order would skip the rest of the page; leaving the panel at either end goes through the trigger instead.
- The panel is `inert` while it animates out. Under reduced motion it appears and disappears without the scale and fade. In forced-colors mode its border is `CanvasText`.
- The panel is not closed when the trigger scrolls out of view; it keeps following it and stays clamped inside the viewport. Close it from `onOpenChange` or your own scroll handling when that matters.
- This is the non-modal variant of the WAI-ARIA dialog pattern; the APG documents only the modal one, so the focus rules above are the ones this component follows.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-subtle`, `--lufia-color-text-default`, `--lufia-font-size-sm`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`, `--lufia-popover-max-inline-size`, `--lufia-popover-padding`, `--lufia-popover-radius`, `--lufia-radius-panel`, `--lufia-shadow-lg`, `--lufia-space-4`, `--lufia-z-dropdown`.

## Content guidelines

Name the panel by what it holds ("Filters", "Share settings"). Keep it short; put the primary action last.

## Stories

- `components-overlays-popover--default`
- `components-overlays-popover--open`
- `components-overlays-popover--placed-above`
- `components-overlays-popover--placed-at-start`
- `components-overlays-popover--placed-at-end`
- `components-overlays-popover--aligned-to-end`
- `components-overlays-popover--centered`
- `components-overlays-popover--long-content`
- `components-overlays-popover--controlled-by-the-caller`
- `components-overlays-popover--flips-near-the-bottom`
- `components-overlays-popover--shifts-near-the-edge`
- `components-overlays-popover--in-clipping-card`
- `components-overlays-popover--phone-320`
- `components-overlays-popover--phone-390`
- `components-overlays-popover--right-to-left`
- `components-overlays-popover--all-themes`
