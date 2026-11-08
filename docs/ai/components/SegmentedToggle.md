# SegmentedToggle

> A compact single-choice control for switching between a few views or modes.

- Status: beta
- Category: Forms
- Import: `import { SegmentedToggle } from "@lufia/design-system/components/SegmentedToggle"`
- Also from: `@lufia/design-system`
- Source: [src/components/SegmentedToggle](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SegmentedToggle)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-segmentedtoggle--docs)

## Purpose

Two to four compact choices in one bordered group, where one is chosen (always, unless `value` is `null`). An indicator slides behind the chosen
segment.

## When to use

- Switching how the same content is shown or sourced: list or board, upload or link, monthly or yearly.

## When not to use

- Moving between pages or sibling views with their own content: use `PeerNav` (links or tabs).
- On and off: use `Switch`.
- More than four options, or long labels: use `RadioGroup` or `Select`.

## API

### `SegmentedToggle`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the group ("Display mode"). Required: the visible segments do not say what they choose. |
| `options` | `readonly SegmentedToggleOption[]` | yes |  |  |
| `value` | `string \| null` | no |  | Controlled value. `null` is controlled with nothing chosen: no segment is checked and the indicator is hidden. The first enabled segment is still the tab stop, and an arrow key chooses (selection follows focus) as it does with a value. |
| `defaultValue` | `string \| null` | no |  | Initial value when `value` is not given; `null` starts with nothing chosen. Defaults to the first enabled option. A form reset goes back to it (to `null` when a controlled `value` started as `null`). |
| `onValueChange` | `(value: string) => void` | no |  | Called with the value the user chose. Never `null`: a deselect is reported by `onDeselect`. |
| `allowDeselect` | `boolean` | no |  | When true, activating the chosen segment again clears the choice and calls `onDeselect`. With a controlled `value`, set it to `null` there; an uncontrolled toggle clears itself. |
| `onDeselect` | `() => void` | no |  | Called when `allowDeselect` is on and the user clears the choice, or when a form reset returns to nothing chosen. |
| `disabled` | `boolean` | no |  |  |
| `name` | `string` | no |  | Submitted with the form as `name=value`. |
| `width` | `"fill" \| "fit"` | no | `"fit"` | `"fit"` (default) shrinks to its content; `"fill"` shares the full width between the segments. |
| `size` | `"sm" \| "md"` | no | `"md"` | `"md"` (default) or the denser `"sm"` for rows in a list or a table. |
| `ref` | `Ref<HTMLDivElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `SegmentedToggleOption`: `{ value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean | undefined; tone?: SegmentedToggleTone | undefined; }`
- `SegmentedToggleTone`: `"neutral" | "success" | "warning" | "danger"`

## Example

```tsx
import { SegmentedToggle } from "@lufia/design-system/components/SegmentedToggle";

<SegmentedToggle
  label="View"
  value={view}
  onValueChange={setView}
  options={[
    { value: "list", label: "List" },
    { value: "board", label: "Board" },
  ]}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

- `label` names the group and is required. Icons are decorative.
- The indicator animates `transform` only, jumps on resize, and does not animate under `prefers-reduced-motion`.
- Before scripts run the chosen segment paints its own border and fill, so the choice is visible without the indicator.
- Under `forced-colors` the chosen segment keeps a `Highlight` border.
- Selection follows focus: an arrow key moves focus and chooses, also when nothing was chosen. Space or a click on a focused segment chooses it.
- `tone` is never the only cue: the chosen segment also has the selected border and the indicator. Text and fill pairs are the status `fg` on `bg` pairs checked by `npm run contrast`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-border`, `--lufia-color-status-danger-fg`, `--lufia-color-status-neutral-bg`, `--lufia-color-status-success-bg`, `--lufia-color-status-success-border`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-border`, `--lufia-color-status-warning-fg`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-tight`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-control`, `--lufia-radius-md`, `--lufia-shadow-sm`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`.

## Content guidelines

Labels are one or two words and parallel ("List", "Board"). They name what is shown, not the action. The group `label` names
the dimension being chosen ("View", "Billing period").

## Stories

- `components-forms-segmentedtoggle--default`
- `components-forms-segmentedtoggle--two-choices`
- `components-forms-segmentedtoggle--with-icons`
- `components-forms-segmentedtoggle--disabled-segment`
- `components-forms-segmentedtoggle--disabled`
- `components-forms-segmentedtoggle--fill`
- `components-forms-segmentedtoggle--long-text`
- `components-forms-segmentedtoggle--phone-320`
- `components-forms-segmentedtoggle--right-to-left`
- `components-forms-segmentedtoggle--all-themes`
- `components-forms-segmentedtoggle--status-picker`
