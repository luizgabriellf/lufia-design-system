# Chip

> A compact pill: an action to apply, a toggle that is on or off, or a removable value.

- Status: beta
- Category: Actions
- Import: `import { Chip } from "@lufia/design-system/components/Chip"`
- Also from: `@lufia/design-system`
- Source: [src/components/Chip](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Chip)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-chip--docs)

## Purpose

A compact pill control with three uses in one API: an action chip the user applies, a toggle chip that is on or off, and a
removable chip whose only interactive part is its remove button.

## When to use

- A suggestion the user can apply with one tap.
- A filter or option that is on or off, in a group.
- A value the user added and may remove, such as a tag or a recipient.

## When not to use

- A primary action: use a `Button`.
- A status label that does nothing: use a `Badge`.
- Navigation to another page: use a `Link` or `FilterLinks`.

## API

### `Chip`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  | The label. Always required: the selected state and the icon never carry the meaning on their own. |
| `iconStart` | `ReactNode` | no |  | Decorative icon before the label; hidden from assistive technology. |
| `size` | `"sm" \| "md"` | no | `"md"` | `sm` is 24px high and `md` 28px on a fine pointer. A coarse pointer keeps the look and widens the hit area only. |
| `disabled` | `boolean` | no | `false` | Dims the chip and ignores activation. For a removable chip it disables the remove button. |
| `ref` | `Ref<HTMLElement>` | no |  |  |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` | no |  | Makes the chip a button that applies a suggestion or a filter. |
| `selected` | `boolean` | no |  | Makes the chip a toggle: `true` or `false` is exposed as `aria-pressed`, and selected looks like the accent subtle fill with the accent border and text. Leave it out for an action chip, which has no pressed state. |
| `onRemove` | `MouseEventHandler<HTMLButtonElement>` | no |  | Called when the remove button is activated. Makes the chip removable. |
| `removeLabel` | `string` | no |  | Accessible name of the remove button, such as "Remove Draft". Required with `onRemove`. |

Other native element attributes pass through to the root element.

#### Variants

The props are a union of forms; `onClick` selects the form. Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated.

##### `ChipPressable`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` | no | Makes the chip a button that applies a suggestion or a filter. In every form; only its type differs. |
| `onRemove` | `undefined` | no |  |
| `removeLabel` | `undefined` | no |  |
| `selected` | `boolean` | no | Makes the chip a toggle: `true` or `false` is exposed as `aria-pressed`, and selected looks like the accent subtle fill with the accent border and text. Leave it out for an action chip, which has no pressed state. In every form; only its type differs. |

##### `ChipRemovable`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `onClick` | `undefined` | no | In every form; only its type differs. |
| `onRemove` | `MouseEventHandler<HTMLButtonElement>` | yes | Called when the remove button is activated. Makes the chip removable. |
| `removeLabel` | `string` | yes | Accessible name of the remove button, such as "Remove Draft". Required with `onRemove`. |
| `selected` | `undefined` | no | In every form; only its type differs. |

## Types

- `ChipProps`: `ChipPressable | ChipRemovable`
- `ChipSize`: `"sm" | "md"`

## Example

```tsx
import { Chip } from "@lufia/design-system/components/Chip";

<Chip onClick={ask}>Summarise this report</Chip>
<Chip selected={isOpen} onClick={toggleOpen}>Open</Chip>
<Chip onRemove={drop} removeLabel="Remove Draft">Draft</Chip>
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

Keyboard:

| Key | Action |
| --- | --- |
| `Tab` | Moves to the chip button, or to the remove button of a removable chip |
| `Enter` / `Space` | Activates the focused button |

- The chip is a native `<button type="button">` when it acts. A toggle chip reports its state with `aria-pressed`, so selected is never only a colour.
- A removable chip never nests buttons: the label is text, and the remove button carries its own name from `removeLabel` ("Remove Draft"), which should name the thing removed.
- Visual height is 24px (`sm`) or 28px (`md`). Under a coarse pointer the chip keeps its size and a pseudo-element extends the hit area to `--lufia-target-touch` (44px by default), so neighbours do not grow.
- Focus shows the shared focus ring; the press scale and transitions are off under `prefers-reduced-motion`.
- In forced-colors mode the selected chip takes a thicker `Highlight` border, so the state stays visible without colour.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-chip-bg`, `--lufia-chip-bg-hover`, `--lufia-chip-border`, `--lufia-chip-fg`, `--lufia-chip-radius`, `--lufia-chip-selected-bg`, `--lufia-chip-selected-border`, `--lufia-chip-selected-fg`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-font-family-body`, `--lufia-font-line-height-tight`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-medium`, `--lufia-motion-duration-fast`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-motion-scale-press`, `--lufia-opacity-disabled`, `--lufia-radius-full`, `--lufia-target-touch`.

## Content guidelines

One to three words, sentence case. Give `removeLabel` a verb and the item name so a screen reader user knows what goes.

## Stories

- `components-actions-chip--default`
- `components-actions-chip--with-icon`
- `components-actions-chip--small`
- `components-actions-chip--selected`
- `components-actions-chip--disabled`
- `components-actions-chip--static`
- `components-actions-chip--removable`
- `components-actions-chip--removable-disabled`
- `components-actions-chip--long-label`
- `components-actions-chip--toggle-group`
- `components-actions-chip--removable-list`
- `components-actions-chip--all-states-and-sizes`
- `components-actions-chip--phone-320`
- `components-actions-chip--right-to-left`
- `components-actions-chip--all-themes`
