# ActionIcons

> Deprecated aliases of six action icons; use the named icons of Icon instead.

- Status: deprecated
- Category: Actions
- Import: `import { ACTION_ICONS, DeleteIcon, DuplicateIcon, EditIcon, OpenIcon, PendingIcon, ReportIcon } from "@lufia/design-system/components/ActionIcons"`
- Also from: `@lufia/design-system`
- Source: [src/components/ActionIcons](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ActionIcons)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-actionicons--docs)

## Purpose

**Deprecated.** These six names are now aliases of the [icon set](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-utilities-icon--docs) and will be
removed in the next minor release. Replace them as follows:

| Deprecated      | Use instead     |
| --------------- | --------------- |
| `DeleteIcon`    | `TrashIcon`     |
| `EditIcon`      | `EditIcon`      |
| `DuplicateIcon` | `CopyIcon`      |
| `PendingIcon`   | `ClockIcon`     |
| `OpenIcon`      | `RotateCcwIcon` |
| `ReportIcon`    | `FileTextIcon`  |
| `ACTION_ICONS`  | `ICONS`         |

The aliases draw on the set's 24-unit grid and default to the `md` size (20px). Pass `size={13}` for the size of the old
16-unit icons.

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
| `size` | `IconSize` | no |  | Rendered size: `sm`, `md` or `lg` read `--lufia-icon-size-*` (16, 20 and 24px by default), `1em` follows the font size of the text around it, and a number is a size in px. Default `md`. |
| `title` | `string` | no |  | Makes the icon meaningful: rendered as an SVG `<title>`, with `role="img"`. Without `title` or `aria-label` the icon is decorative and hidden from assistive technology. Prefer naming the button or link that holds the icon instead. |
| `ref` | `Ref<SVGSVGElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `IconProps`: `Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "children" | "ref"> & { size?: IconSize | undefined; title?: string | undefined; ref?: Ref<SVGSVGElement> | undefined; }`

## Example

```tsx
import { TrashIcon } from "@lufia/design-system/icons";

<button type="button">
  <TrashIcon size="sm" /> Delete
</button>;
```

## Accessibility

- **Decorative by default**: `aria-hidden="true"` and `focusable="false"`, so assistive technology skips it.
- **Meaningful on request**: `aria-label` switches to `role="img"` with that name. Prefer labelling the surrounding button instead, so the name is announced once.
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
