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
| `ref` | `Ref<HTMLButtonElement> \| Ref<HTMLAnchorElement>` | no |  | Forwarded to the anchor (the link component must forward its `ref`, as plain `<a>` and router links do). |
| `href` | `string` | no |  | When present the button renders as a link (through the `LufiaProvider` link component). |
| `aria-label` | `string` | yes |  | Defines a string value that labels the current element. Accessible name. Required: an icon alone has no name, and the types refuse a button without one. |
| `title` | `string` | no |  | The tooltip text. Defaults to `aria-label`, so sighted users get the same name. It is the package tooltip, not a native `title` attribute: none is rendered. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger" \| "link"` | no | `"ghost"` | Visual weight. One `primary` per view; `danger` only for destructive actions. `link` is text with no fill, border or padding, for an action inside a sentence or a quiet "show more"; it stays text-sized on touch screens, where a pseudo-element takes the touch. |
| `loading` | `boolean` | no |  | Shows a spinner in place of the content and ignores activation. The button keeps its width, stays focusable and reports `aria-busy`. It is not natively disabled, so keyboard focus is not lost when the work starts. |
| `render` | `ReactElement<RenderedElementProps, string \| JSXElementConstructor<any>>` | no |  | The element to render instead of the default `<button>` or link, for a link the `LufiaProvider` link component cannot express: a router link with a route object or a locale, or a plain `<a>` that must skip the router. It receives the button's class, state attributes, content and remaining props, and keeps its own props and `ref`; put `href` on the element itself. It must render one anchor or button and pass what it receives through to it. It is not natively disabled: `disabled` and `loading` mark it `aria-disabled` and ignore activation. Server Components: create the element in a Client Component (an element passed from a Server Component can arrive as a lazy reference and throws); build the button inside a small client component, or pass a plain `<a>`. |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | no |  | Default `md` (2.5rem). `xl` is 4rem, for a large media control such as a play button over a poster. |
| `shape` | `"default" \| "circle"` | no |  | `circle` makes the control round with equal sides (full radius). Default `default`: the rounded square. |
| `icon` | `ReactNode` | yes |  | The icon. Decorative: the name comes from `aria-label`. |
| `tooltipPlacement` | `"end" \| "top" \| "bottom" \| "start"` | no | `"top"` | The side of the button the tooltip opens on; it flips when it does not fit. Default `top`. |
| `tooltip` | `boolean` | no | `true` | Shows the tooltip on hover and keyboard focus. Default `true`. Turn it off when you wrap the button in your own `Tooltip`, or while a menu or popover it opens is showing. A `disabled` or `loading` button never shows one. |
| `disabled` | `boolean` | no |  | A link cannot be natively disabled; this marks it `aria-disabled` and ignores activation. |

Other native element attributes pass through to the root element.

#### Variants

The props are a union of forms; `href` selects the form. Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated. Native element attributes (event handlers, for instance) are typed for each form's element.

##### `href: undefined`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `form` | `string` | no | Native attribute in this form. |
| `formAction` | `string \| ((formData: FormData) => void \| Promise<void>)` | no | Native attribute in this form. |
| `formEncType` | `string` | no | Native attribute in this form. |
| `formMethod` | `string` | no | Native attribute in this form. |
| `formNoValidate` | `boolean` | no | Native attribute in this form. |
| `formTarget` | `string` | no | Native attribute in this form. |
| `href` | `undefined` | no |  |
| `name` | `string` | no | Native attribute in this form. |
| `ref` | `Ref<HTMLButtonElement>` | no | In every form; only its type differs. |
| `value` | `string \| number \| readonly string[]` | no | Native attribute in this form. |

##### `href: string`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `download` | `any` | no | Native attribute in this form. |
| `href` | `string` | yes | When present the button renders as a link (through the `LufiaProvider` link component). |
| `hrefLang` | `string` | no | Native attribute in this form. |
| `media` | `string` | no | Native attribute in this form. |
| `ping` | `string` | no | Native attribute in this form. |
| `ref` | `Ref<HTMLAnchorElement>` | no | Forwarded to the anchor (the link component must forward its `ref`, as plain `<a>` and router links do). In every form; only its type differs. |
| `referrerPolicy` | `"" \| "origin" \| "no-referrer" \| "no-referrer-when-downgrade" \| "origin-when-cross-origin" \| "same-origin" \| "strict-origin" \| "strict-origin-when-cross-origin" \| "unsafe-url"` | no | Native attribute in this form. |
| `target` | `HTMLAttributeAnchorTarget` | no | Native attribute in this form. |

## Types

- `IconButtonShape`: `"default" | "circle"`
- `IconButtonSize`: `"sm" | "md" | "lg" | "xl"`

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
| Tab | Moves focus to the button and shows its tooltip (a disabled one is skipped) |
| Escape | Hides the tooltip; focus stays |
| Enter / Space | Activates a button; Enter activates a link |

- `aria-label` is the accessible name. The tooltip shows the same text, is `aria-hidden` and is never the name, so nothing is announced twice.
- The tooltip shows on keyboard focus and mouse hover, not on touch, which is why the name must not depend on it.
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
- `components-actions-iconbutton--tooltip-below`
- `components-actions-iconbutton--no-tooltip`
- `components-actions-iconbutton--media-play`
- `components-actions-iconbutton--media-play-all-themes`
- `components-actions-iconbutton--size-hook`
- `components-actions-iconbutton--pressed`
- `components-actions-iconbutton--pressed-secondary`
- `components-actions-iconbutton--all-variants-and-sizes`
- `components-actions-iconbutton--all-themes`
