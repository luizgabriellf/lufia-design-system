# ActionIcons

> A small, consistent set of stroke icons for common row and page actions.

- Status: beta
- Category: Actions
- Import: `import { ACTION_ICONS, DeleteIcon, DuplicateIcon, EditIcon, OpenIcon, PendingIcon, ReportIcon } from "@lufia/design-system/components/ActionIcons"`
- Also from: `@lufia/design-system`
- Source: [src/components/ActionIcons](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ActionIcons)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-actionicons--docs)

## Purpose

Six small outline icons for action menus and row actions: `DeleteIcon`, `EditIcon`, `DuplicateIcon`, `PendingIcon`,
`OpenIcon` and `ReportIcon`. They share a 16x16 grid, a 1.4 stroke and round caps, and inherit `currentColor`.

## When to use

- Beside a visible text label in menus and buttons (decorative).
- As the only content of an icon button, with an accessible name on the button.

## When not to use

- As the only carrier of meaning without a name. If the icon stands alone, give it `aria-label`.

## Exports

| Name | Kind |
| --- | --- |
| `ACTION_ICONS` | constant |
| `DeleteIcon` | component |
| `DuplicateIcon` | component |
| `EditIcon` | component |
| `OpenIcon` | component |
| `PendingIcon` | component |
| `ReportIcon` | component |

## API

### `DeleteIcon`, `DuplicateIcon`, `EditIcon`, `OpenIcon`, `PendingIcon`, `ReportIcon`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `number` | no |  | Rendered width and height in px. |

Other native element attributes pass through to the root element.

## Types

- `IconProps`: `Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "children"> & { size?: number | undefined; }`

## Example

```tsx
import { DeleteIcon } from "@lufia/design-system/components/ActionIcons";

<button type="button">
  <DeleteIcon /> Delete
</button>;
```

## Accessibility

- **Decorative by default**: `aria-hidden="true"` and `focusable="false"`, so assistive technology skips it.
- **Meaningful on request**: `aria-label` switches to `role="img"` with that name. Prefer labelling the surrounding button
- Icons inherit `currentColor`; contrast is the responsibility of the text colour they sit in (3:1 for non-text content).
- Keyboard and focus behaviour belong to the enclosing control.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Content guidelines

Icons carry no text. Localised labels are supplied by the app next to the icon.

## Stories

- `components-actions-actionicons--default`
- `components-actions-actionicons--gallery`
- `components-actions-actionicons--sizes`
- `components-actions-actionicons--meaningful`
- `components-actions-actionicons--all-themes`
