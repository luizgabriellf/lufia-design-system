# IconButton

> A button with only an icon, which therefore requires an accessible name.

- Status: beta
- Category: Actions
- Import: `import { IconButton } from "@lufia/design-system/components/IconButton"`
- Also from: `@lufia/design-system`
- Source: [src/components/IconButton](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/IconButton)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-iconbutton--docs)

## Purpose

A `Button` that shows only an icon. The accessible name is required by the types, and a tooltip comes with it.

## When to use

- Compact, well-known actions where the icon is unambiguous: close, search, settings, overflow.
- Toolbars and table rows where a text label would not fit.

## When not to use

- Actions whose icon is not obvious. Use a `Button` with a label instead.
- The primary action of a view: it deserves a visible label.

## API

### `IconButton`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `href` | `string` | no |  | When present the button renders as a link (through the `LufiaProvider` link component). |
| `aria-label` | `string` | yes |  | Defines a string value that labels the current element. Accessible name. Required: an icon alone has no name, and the types refuse a button without one. |
| `ref` | `Ref<HTMLButtonElement> \| Ref<HTMLAnchorElement>` | no |  | Forwarded to the anchor (the link component must forward its `ref`, as plain `<a>` and router links do). |
| `title` | `string` | no |  | Tooltip text. Defaults to `aria-label`, so sighted mouse users get the same name. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | no | `"ghost"` | Visual weight. One `primary` per view; `danger` only for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | no |  |  |
| `loading` | `boolean` | no |  | Shows a spinner in place of the content and ignores activation. The button keeps its width, stays focusable and reports `aria-busy`. It is not natively disabled, so keyboard focus is not lost when the work starts. |
| `icon` | `ReactNode` | yes |  | The icon. Decorative: the name comes from `aria-label`. |
| `disabled` | `boolean` | no |  | A link cannot be natively disabled; this marks it `aria-disabled` and ignores activation. |

Other native element attributes pass through to the root element.

## Types

- `IconButtonProps`: `(Omit<AsButton, "children" | "fullWidth" | "iconStart" | "iconEnd"> | Omit<AsLink, "children" | "fullWidth" | "iconStart" | "iconEnd">) & { "aria-label": string; icon: ReactNode; title?: string | undefined; }`

## Example

```tsx
import { IconButton } from "@lufia/design-system/components/IconButton";

<IconButton icon={<SettingsIcon />} aria-label="Open settings" onClick={openSettings} />;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab | Moves focus to the button (a disabled one is skipped) |
| Enter / Space | Activates a button; Enter activates a link |

- `aria-label` is the accessible name. `title` shows the same text as a tooltip for mouse users; it is not relied on as the name.
- The title tooltip is not shown on touch or to keyboard users, which is why the name must not depend on it.
- The icon is hidden from assistive technology.
- The target is 2.5rem square at the default size (2rem at `sm`, 2.75rem on coarse pointers), above the WCAG 2.5.8 minimum.
- Focus ring, loading and forced-colors behaviour are those of `Button`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Content guidelines

Name the action, not the picture: "Open settings", not "Cog". Keep it to two or three words.

## Stories

- `components-actions-iconbutton--default`
- `components-actions-iconbutton--secondary`
- `components-actions-iconbutton--primary`
- `components-actions-iconbutton--disabled`
- `components-actions-iconbutton--loading`
- `components-actions-iconbutton--as-link`
- `components-actions-iconbutton--custom-title`
- `components-actions-iconbutton--all-variants-and-sizes`
- `components-actions-iconbutton--all-themes`
