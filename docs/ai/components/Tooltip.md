# Tooltip

> A short, non-interactive text that names or explains a control on hover and keyboard focus.

- Status: beta
- Category: Overlays
- Import: `import { Tooltip } from "@lufia/design-system/components/Tooltip"`
- Also from: `@lufia/design-system`
- Source: [src/components/Tooltip](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Tooltip)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-tooltip--docs)

## Purpose

A short text that names or explains one control. It appears when the pointer rests on the control or when it gets keyboard
focus, and goes away when either leaves.

## When to use

- Naming an icon-only control, or adding a few words of context to a control whose label is short.
- A collapsed rail or toolbar where the label is hidden.

## When not to use

- Content with a link, a button or a form: use `Popover`.
- Help that every user needs, including on touch: use visible help text or a `FormField` hint.
- Errors and status: use `Banner`, `Toast` or the field's error text.

## API

### `Tooltip`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `(props: TooltipTrigger) => ReactNode` | yes |  | Renders the one focusable element the tooltip belongs to and spreads the given props onto it: `{(props) => <IconButton {...props} icon={...} aria-label="Save" />}`. Put your own handlers before the spread, or call the given ones from them: the spread replaces a handler of the same name. |
| `content` | `ReactNode` | yes |  | The text of the tooltip. Short and non-interactive: a hovering person can move onto it, but it never takes focus. |
| `placement` | `"end" \| "top" \| "bottom" \| "start"` | no | `"top"` | Which side of the trigger it opens on (`start` and `end` follow the writing direction). It flips to the opposite side when it does not fit. Default `top`. |
| `relation` | `"label" \| "description"` | no | `"description"` | How the control relates to the text. `description` (default): `aria-describedby`, for a control that already has a name. `label`: the tooltip is the control's only name, so `aria-labelledby` points at a visually hidden copy of `content` that is always in the DOM; prefer a real `aria-label` when you can. |
| `delay` | `number` | no | `TOOLTIP_DELAY_MS` | Milliseconds a hovering pointer waits before the tooltip shows. Keyboard focus shows it at once. Default 250. |
| `disabled` | `boolean` | no | `false` | Turns the tooltip off without changing the tree, for example while a menu the control opens is showing. With `relation="label"` the control keeps its name. |

## Types

- `TooltipProps`: `{ children: (props: TooltipTrigger) => ReactNode; content: ReactNode; placement?: Side | undefined; relation?: "label" | "description" | undefined; delay?: number | undefined; disabled?: boolean | undefined; }`
- `TooltipTriggerProps`: `TooltipHandlers & { "aria-describedby"?: string | undefined; "aria-labelledby"?: string | undefined; }`

## Example

```tsx
import { Tooltip } from "@lufia/design-system/components/Tooltip";

<Tooltip content="Export the table as CSV">
  {(props) => (
    <Button variant="secondary" {...props}>
      Export
    </Button>
  )}
</Tooltip>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab | Anywhere \| Focus on the control shows the tooltip at once |
| Escape | Anywhere \| Hides the tooltip; focus stays where it is |
| Tab away | Control \| Blur hides it |

- It follows the WAI-ARIA tooltip pattern: `role="tooltip"`, linked from the control by `aria-describedby` (or `aria-labelledby` with `relation="label"`), never focusable and never holding interactive content.
- It meets WCAG 1.4.13: dismissible with Escape without moving the pointer or focus, hoverable (the pointer can move onto it and it stays), and persistent until the pointer or focus leaves, Escape is pressed or the page scrolls.
- A touch hover never shows it (a tap would leave it stuck); keyboard focus does. Touch users do not see it, so never put information in it that is not available another way.
- Enter and exit are a fade with the motion tokens; under `prefers-reduced-motion` it appears and disappears at once. In forced-colors mode its border is `CanvasText`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-subtle`, `--lufia-color-text-default`, `--lufia-font-size-sm`, `--lufia-font-weight-medium`, `--lufia-motion-duration-exit`, `--lufia-motion-duration-fast`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`, `--lufia-radius-control`, `--lufia-shadow-md`, `--lufia-space-1`, `--lufia-space-3`, `--lufia-z-tooltip`.

## Content guidelines

One short phrase, no full stop for a fragment, no markup. Do not repeat the control's visible label.

## Stories

- `components-overlays-tooltip--default`
- `components-overlays-tooltip--below`
- `components-overlays-tooltip--at-start`
- `components-overlays-tooltip--at-end`
- `components-overlays-tooltip--no-delay`
- `components-overlays-tooltip--disabled`
- `components-overlays-tooltip--only-name`
- `components-overlays-tooltip--on-icon-button`
- `components-overlays-tooltip--flips-near-the-edge`
- `components-overlays-tooltip--long-text`
- `components-overlays-tooltip--all-themes`
