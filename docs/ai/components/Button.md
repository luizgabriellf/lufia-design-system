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
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | no | `"secondary"` | Visual weight. One `primary` per view; `danger` only for destructive actions. |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` |  |
| `loading` | `boolean` | no | `false` | Shows a spinner in place of the content and ignores activation. The button keeps its width, stays focusable and reports `aria-busy`. It is not natively disabled, so keyboard focus is not lost when the work starts. |
| `fullWidth` | `boolean` | no | `false` | Stretches to the full width of its container. |
| `iconStart` | `ReactNode` | no |  | Decorative icon before the label; hidden from assistive technology. |
| `iconEnd` | `ReactNode` | no |  | Decorative icon after the label; hidden from assistive technology. |
| `href` | `string` | no |  | When present the button renders as a link (through the `LufiaProvider` link component). |
| `ref` | `Ref<HTMLButtonElement> \| Ref<HTMLAnchorElement>` | no |  | Forwarded to the anchor (the link component must forward its `ref`, as plain `<a>` and router links do). |
| `disabled` | `boolean` | no |  | A link cannot be natively disabled; this marks it `aria-disabled` and ignores activation. |

Other native element attributes pass through to the root element.

## Types

- `ButtonProps`: `AsButton | AsLink`
- `ButtonSize`: `"sm" | "md" | "lg"`
- `ButtonVariant`: `"primary" | "secondary" | "ghost" | "danger"`

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
- Targets are at least 2rem tall (`sm`), and 2.75rem on coarse pointers.
- A link used as a button is marked `aria-disabled` when disabled or loading, and its activation is cancelled.
- The spinner is a rotation only and stops under `prefers-reduced-motion`; `aria-busy` and the cursor still say it is busy.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-hover`, `--lufia-color-accent-subtle`, `--lufia-color-bg-field`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-on-solid`, `--lufia-color-status-danger-solid`, `--lufia-color-text-default`, `--lufia-color-text-on-accent`, `--lufia-font-family-body`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-fast`, `--lufia-motion-duration-instant`, `--lufia-motion-duration-slow`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-control`, `--lufia-radius-full`, `--lufia-radius-sm`.

## Content guidelines

Start with a verb ("Save changes", "Delete record"). Keep it to one to three words; longer labels wrap instead of
truncating. Give the destructive action a specific name rather than "Yes".

## Stories

- `components-actions-button--default`
- `components-actions-button--primary`
- `components-actions-button--ghost`
- `components-actions-button--danger`
- `components-actions-button--disabled`
- `components-actions-button--loading`
- `components-actions-button--with-icons`
- `components-actions-button--icon-end`
- `components-actions-button--full-width`
- `components-actions-button--as-link`
- `components-actions-button--long-label`
- `components-actions-button--all-variants-and-sizes`
- `components-actions-button--phone-320`
- `components-actions-button--right-to-left`
- `components-actions-button--all-themes`
