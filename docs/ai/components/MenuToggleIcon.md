# MenuToggleIcon

> Three bars that morph into a cross, for the button that opens and closes a menu or a navigation sheet.

- Status: beta
- Category: Utilities
- Import: `import { MenuToggleIcon } from "@lufia/design-system/components/MenuToggleIcon"`
- Also from: `@lufia/design-system`
- Source: [src/components/MenuToggleIcon](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/MenuToggleIcon)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-utilities-menutoggleicon--docs)

## Purpose

Three bars that turn into a cross. It is the icon of the button that opens and closes a menu or a navigation sheet.

## When to use

- The trigger of a menu, drawer or navigation sheet, so the same control shows that it is open.

## When not to use

- A disclosure or an accordion: those turn a chevron, as `Disclosure` does.
- A control whose icon must say something else when open: use two named icons.

## API

### `MenuToggleIcon`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `ref` | `Ref<SVGSVGElement>` | no |  |  |
| `size` | `IconSize` | no |  | Rendered size: `sm`, `md` or `lg` read `--lufia-icon-size-*` (16, 20 and 24px by default), `1em` follows the font size of the text around it, and a number is a size in px. Default `md`. |
| `open` | `boolean` | yes |  | `true` draws the cross, `false` the three bars. The bars morph between the two when the value changes. |

Other native element attributes pass through to the root element.

## Types

- `MenuToggleIconProps`: `Omit<IconProps, "children" | "aria-hidden" | "aria-label" | "aria-labelledby" | "title"> & { open: boolean; }`

## Example

```tsx
import { IconButton } from "@lufia/design-system/components/IconButton";
import { MenuToggleIcon } from "@lufia/design-system/components/MenuToggleIcon";

<IconButton
  aria-label={open ? "Close menu" : "Open menu"}
  aria-expanded={open}
  onClick={() => setOpen(!open)}
  icon={<MenuToggleIcon open={open} />}
/>;
```

## Accessibility

- It is decorative and always `aria-hidden`; it cannot take a `title` or an `aria-label`. The button that holds it carries the name and `aria-expanded`, and the name should say what the press will do.
- The bars move with `transform` and `opacity` only, using the fast motion duration and the in-out easing. Under `prefers-reduced-motion` the icon swaps between the two shapes with no movement.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-motion-duration-fast`, `--lufia-motion-easing-in-out`.

## Stories

- `components-utilities-menutoggleicon--closed`
- `components-utilities-menutoggleicon--open`
- `components-utilities-menutoggleicon--in-icon-button`
- `components-utilities-menutoggleicon--sizes`
- `components-utilities-menutoggleicon--all-themes`
