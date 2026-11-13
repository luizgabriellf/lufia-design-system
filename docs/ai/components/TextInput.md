# TextInput

> A single-line text field with optional prefix and suffix.

- Status: beta
- Category: Forms
- Import: `import { TextInput } from "@lufia/design-system/components/TextInput"`
- Also from: `@lufia/design-system`
- Source: [src/components/TextInput](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/TextInput)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-textinput--docs)

## Purpose

A single-line text control: a native `<input>` in a bordered box, with optional prefix and suffix slots for units, signs and
icons.

## When to use

- Short free text, numbers, e-mail, URLs, passwords: anything that fits on one line.
- Set `type`, `inputMode` and `autoComplete` for the data: they pick the on-screen keyboard and enable autofill.

## When not to use

- More than one line of text: use `Textarea`.
- A choice from a known list: use `Select` or `Combobox`.
- Searching: use `SearchInput`, which adds a clear button and debouncing.

## API

### `TextInput`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `"sm" \| "md"` | no | `"md"` | `sm` is the compact control for toolbars and filter rows, with the metrics of `Select size="sm"`: a 2rem box with the small font size. It still fills its row. On touch screens and phone widths it grows to the touch target, like `Button`. Give it an `aria-label` or a visually hidden label. Default `md`. This replaces the native numeric `size`: a props type that extends the native input attributes and is spread into `TextInput` must omit it (`Omit<InputHTMLAttributes<HTMLInputElement>, "size">`). |
| `prefix` | `ReactNode` | no |  | Content before the text: a unit, a currency sign, a decorative icon (give an icon `aria-hidden`). |
| `suffix` | `ReactNode` | no |  | Content after the text: a unit, a button. |
| `invalid` | `boolean` | no |  | Marks the control invalid without a `FormField`. Inside a field the error does it. |
| `className` | `string` | no |  | Goes on the box that draws the border; the native input gets the rest props. |
| `ref` | `Ref<HTMLInputElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `TextInputProps`: `Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "prefix" | "size"> & { size?: TextInputSize | undefined; prefix?: ReactNode; suffix?: ReactNode; invalid?: boolean | undefined; className?: string | undefined; ref?: Ref<HTMLInputElement> | undefined; }`

## Example

```tsx
import { FormField } from "@lufia/design-system/components/FormField";
import { TextInput } from "@lufia/design-system/components/TextInput";

<FormField label="Amount" hint="Without tax." error={errors.amount}>
  <TextInput name="amount" prefix="EUR" inputMode="decimal" />
</FormField>;
```

## Accessibility

- Always inside a `FormField`, or give `aria-label`. A placeholder is not a label.
- The box draws a 2px focus ring around the whole control; the native outline is replaced, not removed. Under `forced-colors` the ring uses `Highlight`, and an invalid control gets a thicker border.
- Height is at least 44px; the text is 16px so iOS does not zoom on focus. The compact `size="sm"` is 32px with 14px text on a fine pointer and grows to 44px on touch screens and phone widths (never below the 24px minimum of WCAG 2.5.8).

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-font-size-sm`, `--lufia-space-2`, `--lufia-target-touch`.

## Content guidelines

Placeholders show an example ("Quarterly report"), never an instruction and never the label again. Units go in the prefix or
suffix, not in the label. Keep error text next to the field, in the `FormField`.

## Stories

- `components-forms-textinput--default`
- `components-forms-textinput--with-value`
- `components-forms-textinput--with-hint`
- `components-forms-textinput--required`
- `components-forms-textinput--invalid`
- `components-forms-textinput--disabled`
- `components-forms-textinput--read-only`
- `components-forms-textinput--prefix`
- `components-forms-textinput--suffix`
- `components-forms-textinput--prefix-and-suffix`
- `components-forms-textinput--with-icon`
- `components-forms-textinput--password`
- `components-forms-textinput--long-text`
- `components-forms-textinput--compact`
- `components-forms-textinput--compact-with-affixes`
- `components-forms-textinput--compact-beside-select`
- `components-forms-textinput--phone-320`
- `components-forms-textinput--right-to-left`
- `components-forms-textinput--all-themes`
