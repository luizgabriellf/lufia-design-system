# ChoiceTile

> A pressable, selectable tile for one value out of a short visible set: a day, a time slot, a plan or a size.

- Status: beta
- Category: Forms
- Import: `import { ChoiceTile } from "@lufia/design-system/components/ChoiceTile"`
- Also from: `@lufia/design-system`
- Source: [src/components/ChoiceTile](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ChoiceTile)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-choicetile--docs)

## Purpose

A pressable, selectable tile for picking one value out of a short visible set: a day, a time slot, a plan or a size. The
tiles sit in a row, a wrapping grid or a horizontally scrolling strip. It is larger than a `Chip` and has room for an
eyebrow and a description.

## When to use

- One value from a short, visible set where the values are scannable: dates, times, plans, sizes.

## When not to use

- A small one-line filter or tag: use a `Chip`.
- A vertical list of choices with descriptions or icons: use an `OptionRow`.
- Two to four exclusive views that change the content below: use `SegmentedToggle`.
- A long set: use a `Select` or a `Combobox`.

## API

### `ChoiceTile`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `boolean` | no | `false` | Dims the tile, removes it from the tab order and ignores activation. |
| `label` | `ReactNode` | yes |  | The value being picked, such as a date or a time. It is the main line: semibold, with tabular numbers. |
| `eyebrow` | `ReactNode` | no |  | Small muted line above the label, such as a weekday. Without it the tile is a single line. |
| `description` | `ReactNode` | no |  | Small muted line below the label. |
| `selected` | `boolean` | no |  | Marks the tile as the chosen one and exposes it as `aria-pressed`. For a single choice, wrap the tiles in a `role="radiogroup"` of your own and manage it, or keep the toggle-button pattern: both are the caller's decision. |
| `emphasis` | `"solid" \| "subtle"` | no | `"solid"` | How the selected tile reads. `solid` (default) is the accent fill with the on-accent text, the strongest element of its set. `subtle` is the accent subtle fill with the accent border and text, for a set that sits inside an already emphasised surface. |
| `size` | `"sm" \| "md"` | no | `"md"` | `md` (default) is at least `--lufia-target-touch` tall. `sm` is 36px on a fine pointer and regains the touch floor on a coarse one. |
| `fullWidth` | `boolean` | no | `false` | Stretches the tile to the width of its container, for a grid column or a stacked list. |
| `ref` | `Ref<HTMLButtonElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `ChoiceTileEmphasis`: `"solid" | "subtle"`
- `ChoiceTileSize`: `"sm" | "md"`

## Example

```tsx
import { ChoiceTile } from "@lufia/design-system/components/ChoiceTile";

<div role="group" aria-label="Time">
  {slots.map((slot) => (
    <ChoiceTile key={slot} label={slot} selected={slot === picked} onClick={() => setPicked(slot)} />
  ))}
</div>

<ChoiceTile eyebrow="Thursday" label="19/11" selected />
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| `Tab` | Moves to the next tile |
| `Enter` / `Space` | Activates the focused tile |

- The tile is a native `<button type="button">`. `selected` is exposed as `aria-pressed`, so the state is never only a colour.
- The accessible name is the eyebrow, the label and the description, in that order.
- For one choice with arrow-key movement, wrap the tiles in a `role="radiogroup"` and manage it yourself; the package ships no group component. Without it, the tiles are toggle buttons in a labelled `role="group"`.
- Focus shows the shared focus ring; the press scale and transitions are off under `prefers-reduced-motion`.
- In forced-colors mode the selected tile takes a thicker `Highlight` border.
- Label, eyebrow and description wrap instead of overflowing, so 200% text size does not clip them.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-on-accent`, `--lufia-font-family-body`, `--lufia-font-line-height-tight`, `--lufia-font-numeric-tabular`, `--lufia-font-size-md`, `--lufia-font-size-xs`, `--lufia-font-weight-medium`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-fast`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-motion-scale-press`, `--lufia-opacity-disabled`, `--lufia-radius-control`, `--lufia-target-touch`.

## Content guidelines

Keep the label short and scannable. Use the eyebrow for the unit that gives it context, such as the weekday.

## Stories

- `components-forms-choicetile--default`
- `components-forms-choicetile--selected`
- `components-forms-choicetile--selected-subtle`
- `components-forms-choicetile--small`
- `components-forms-choicetile--with-eyebrow`
- `components-forms-choicetile--with-description`
- `components-forms-choicetile--disabled`
- `components-forms-choicetile--full-width`
- `components-forms-choicetile--long-label`
- `components-forms-choicetile--time-slot-grid`
- `components-forms-choicetile--day-strip-scrolling`
- `components-forms-choicetile--subtle-emphasis`
- `components-forms-choicetile--sizes`
- `components-forms-choicetile--all-states`
- `components-forms-choicetile--phone-320`
- `components-forms-choicetile--right-to-left`
- `components-forms-choicetile--all-themes`
