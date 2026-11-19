# Button

> The control for an action: a native button, or a link that looks like one.

- Status: beta
- Category: Actions
- Import: `import { Button } from "@lufia/design-system/components/Button"`
- Also from: `@lufia/design-system`
- Source: [src/components/Button](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Button)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-actions-button--docs)

## Purpose

The control for an action. It renders a native `<button>`, or a link when `href` is given, and looks the same either way.

## When to use

- Anything that does something on the page: submit, open a dialog, add, save.
- With `href`, a call to action that navigates and should look like a button.

## When not to use

- Navigation inside text: use `Link`.
- A button with only an icon: use `IconButton`, which requires an accessible name.
- More than one `primary` in the same view.

## API

### `Button`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger" \| "link"` | no | `"secondary"` | Visual weight. One `primary` per view; `danger` only for destructive actions. `link` is text with no fill, border or padding, for an action inside a sentence or a quiet "show more"; it stays text-sized on touch screens, where a pseudo-element takes the touch. |
| `size` | `"sm" \| "md" \| "lg"` | no | `variant === "link" ? undefined : "md"` | Default `md`. With `variant="link"` the default is no size: the text inherits the font size around it. |
| `loading` | `boolean` | no | `false` | Shows a spinner in place of the content and ignores activation. The button keeps its width, stays focusable and reports `aria-busy`. It is not natively disabled, so keyboard focus is not lost when the work starts. |
| `fullWidth` | `boolean` | no | `false` | Stretches to the full width of its container. |
| `iconStart` | `ReactNode` | no |  | Decorative icon before the label; hidden from assistive technology. |
| `iconEnd` | `ReactNode` | no |  | Decorative icon after the label; hidden from assistive technology. |
| `render` | `ReactElement<RenderedElementProps, string \| JSXElementConstructor<any>>` | no |  | The element to render instead of the default `<button>` or link, for a link the `LufiaProvider` link component cannot express: a router link with a route object or a locale, or a plain `<a>` that must skip the router. It receives the button's class, state attributes, content and remaining props, and keeps its own props and `ref`; put `href` on the element itself. It must render one anchor or button and pass what it receives through to it. It is not natively disabled: `disabled` and `loading` mark it `aria-disabled` and ignore activation. Server Components: create the element in a Client Component (an element passed from a Server Component can arrive as a lazy reference and throws); build the button inside a small client component, or pass a plain `<a>`. |
| `href` | `string` | no |  | When present the button renders as a link (through the `LufiaProvider` link component). |
| `ref` | `Ref<HTMLButtonElement> \| Ref<HTMLAnchorElement>` | no |  | Forwarded to the anchor (the link component must forward its `ref`, as plain `<a>` and router links do). |
| `disabled` | `boolean` | no |  | A link cannot be natively disabled; this marks it `aria-disabled` and ignores activation. |

Other native element attributes pass through to the root element.

#### Variants

The props are a union of forms; `href` selects the form. Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated. Native element attributes (event handlers, for instance) are typed for each form's element.

##### `AsButton`

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

##### `AsLink`

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

- `ButtonProps`: `AsButton | AsLink`
- `ButtonSize`: `"sm" | "md" | "lg"`
- `ButtonVariant`: `"primary" | "secondary" | "ghost" | "danger" | "link"`

## Example

```tsx
import { Button } from "@lufia/design-system/components/Button";

<Button variant="primary" iconStart={<PlusIcon />} onClick={create}>
  New report
</Button>
<Button href="/reports" iconEnd={<ArrowRightIcon />}>Open reports</Button>
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab | Moves focus to the button (a disabled one is skipped) |
| Enter / Space | Activates a button; Enter activates a link |

- Native elements, so role, focus and activation come from the browser.
- Focus shows a 2px ring with an offset in every variant. In forced-colors mode the border uses `ButtonText`.
- Icons are decorative and hidden; the label is the accessible name.
- Targets are at least 2rem tall (`sm`), and 2.75rem on coarse pointers. The `link` variant is the exception: it is inline text and has no minimum height.
- A link used as a button is marked `aria-disabled` when disabled or loading, and its activation is cancelled.
- The hover lift applies only where a pointer can hover and is dropped under `prefers-reduced-motion`; the press scale takes over while the button is held.
- The spinner is a rotation only and stops under `prefers-reduced-motion`; `aria-busy` and the cursor still say it is busy.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-button-danger-bg`, `--lufia-button-danger-border`, `--lufia-button-danger-fg`, `--lufia-button-danger-shadow`, `--lufia-button-danger-shadow-hover`, `--lufia-button-ghost-shadow`, `--lufia-button-ghost-shadow-hover`, `--lufia-button-hover-lift`, `--lufia-button-primary-bg`, `--lufia-button-primary-bg-hover`, `--lufia-button-primary-border`, `--lufia-button-primary-border-hover`, `--lufia-button-primary-fg`, `--lufia-button-primary-shadow`, `--lufia-button-primary-shadow-hover`, `--lufia-button-secondary-bg`, `--lufia-button-secondary-bg-hover`, `--lufia-button-secondary-border`, `--lufia-button-secondary-border-hover`, `--lufia-button-secondary-fg`, `--lufia-button-secondary-shadow`, `--lufia-button-secondary-shadow-hover`, `--lufia-color-accent-border`, `--lufia-color-accent-default`, `--lufia-color-accent-hover`, `--lufia-color-accent-subtle`, `--lufia-color-bg-field`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-on-solid`, `--lufia-color-status-danger-solid`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-on-accent`, `--lufia-font-family-body`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-fast`, `--lufia-motion-duration-instant`, `--lufia-motion-duration-slow`, `--lufia-motion-easing-out`, `--lufia-motion-scale-press`, `--lufia-opacity-disabled`, `--lufia-radius-control`, `--lufia-radius-full`, `--lufia-radius-sm`, `--lufia-radius-xs`, `--lufia-target-touch`.

## Content guidelines

Start with a verb ("Save changes", "Delete record"). Keep it to one to three words; longer labels wrap instead of
truncating. Give the destructive action a specific name rather than "Yes".

## Stories

- `components-actions-button--default`
- `components-actions-button--primary`
- `components-actions-button--ghost`
- `components-actions-button--link-in-sentence`
- `components-actions-button--link-show-more`
- `components-actions-button--link-loading`
- `components-actions-button--link-disabled`
- `components-actions-button--danger`
- `components-actions-button--disabled`
- `components-actions-button--loading`
- `components-actions-button--with-icons`
- `components-actions-button--icon-end`
- `components-actions-button--full-width`
- `components-actions-button--as-link`
- `components-actions-button--rendered`
- `components-actions-button--long-label`
- `components-actions-button--all-variants-and-sizes`
- `components-actions-button--phone-320`
- `components-actions-button--right-to-left`
- `components-actions-button--all-themes`
- `components-actions-button--themed-surface`
