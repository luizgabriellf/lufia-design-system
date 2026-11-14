# Checkbox

> A checkbox with a mixed state, for independent on/off choices.

- Status: beta
- Category: Forms
- Import: `import { Checkbox } from "@lufia/design-system/components/Checkbox"`
- Also from: `@lufia/design-system`
- Source: [src/components/Checkbox](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Checkbox)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-checkbox--docs)

## Purpose

A native checkbox with a drawn box, a label that is part of the click target, an optional hint and error, and the mixed
(indeterminate) state.

## When to use

- Independent yes/no choices, and consent that is submitted with a form.
- A list where several items can be chosen at once.

## When not to use

- A setting that applies the moment it is flipped: use `Switch`.
- One choice from several: use `RadioGroup`.
- A group of checkboxes needs a group name: wrap them in a `<fieldset>` with a `<legend>`; `FormField` is for single controls.

## API

### `Checkbox`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | yes |  | The visible label, to the side of the box. Required: a checkbox without text is not understandable. |
| `hint` | `ReactNode` | no |  | Help under the label, linked with `aria-describedby`. |
| `error` | `ReactNode` | no |  | Error under the label. Marks the checkbox `aria-invalid`. |
| `indeterminate` | `boolean` | no | `false` | The mixed state of a parent whose children are partly checked. It is a display state: the native `checked` stays what it was, and the person's click sets it to a plain checked or unchecked value, so the next render should clear this prop. |
| `size` | `"sm" \| "md"` | no | `"md"` | `md` (default) is the 16px label in a 44px row. `sm` is for dense panels: a 14px label in a shorter row, so it sits next to 13px helper text. The drawn box and its 24px target are the same in both. |
| `className` | `string` | no |  | Goes on the root element. |
| `ref` | `Ref<HTMLInputElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `CheckboxProps`: `Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type" | "size"> & { label: ReactNode; hint?: ReactNode; error?: ReactNode; indeterminate?: boolean | undefined; size?: "sm" | "md" | undefined; className?: string | undefined; ref?: Ref<HTMLInputElement> | undefined; }`

## Example

```tsx
import { Checkbox } from "@lufia/design-system/components/Checkbox";

<Checkbox name="terms" label="I accept the terms of service" required error={errors.terms} />;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).

- The label is a real `<label for>`, so the accessible name is the label text. The row is at least 44px tall (32px with `size="sm"`) and the box has a 24px target (WCAG 2.5.8).
- A mixed box exposes `aria-checked="mixed"` through the native `indeterminate` property.
- Hint and error are in the accessible description; the error has `role="alert"` and the input `aria-invalid`.
- Under `forced-colors` the checked box uses `Highlight` and its mark `HighlightText`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-color-accent-default`, `--lufia-color-bg-field`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-on-accent`, `--lufia-font-line-height-normal`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-xs`, `--lufia-space-1`, `--lufia-space-3`.

## Content guidelines

Write the label as the statement that is true when the box is checked ("Send me the weekly report"), never as a question or
a negative ("Don't send..."). Put the long legal text in the hint or a link next to the control, not in the label.

## Stories

- `components-forms-checkbox--default`
- `components-forms-checkbox--checked`
- `components-forms-checkbox--indeterminate`
- `components-forms-checkbox--with-hint`
- `components-forms-checkbox--required`
- `components-forms-checkbox--invalid`
- `components-forms-checkbox--disabled`
- `components-forms-checkbox--disabled-checked`
- `components-forms-checkbox--select-all`
- `components-forms-checkbox--long-text`
- `components-forms-checkbox--small`
- `components-forms-checkbox--phone-320`
- `components-forms-checkbox--right-to-left`
- `components-forms-checkbox--all-themes`
