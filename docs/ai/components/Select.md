# Select

> A native select (dropdown) styled with tokens, for choosing one option from a short list.

- Status: beta
- Category: Forms
- Import: `import { Select } from "@lufia/design-system/components/Select"`
- Also from: `@lufia/design-system`
- Source: [src/components/Select](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Select)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-select--docs)

## Purpose

A native `<select>` in the shared field box, with a drawn chevron. The browser keeps its own list, keyboard handling,
typeahead and mobile picker.

## When to use

- Three to about fifteen options the person can recognise by name, where a native picker is a feature (phones).
- A compact `size="sm"` select as one filter among several in a toolbar.

## When not to use

- Fewer than four options that matter equally: a `RadioGroup` shows them all at once.
- Long lists, search, async data or options with more than text: use `Combobox`.
- Option labels that may be longer than a phone-width field: the closed select shows one line, and how the browser draws it is not ours to control (iOS Safari is not guaranteed to wrap it). Use `Combobox` with `wrapValue`, which wraps the chosen label predictably.

## API

### `Select`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `"sm" \| "md"` | no | `"md"` | `sm` is the compact control for toolbars and filter rows: a shorter box that sizes to its content instead of filling the row, so it sits beside buttons. On touch screens and phone widths it grows to the touch target, like `Button`. Give it an `aria-label` or a visually hidden label. Default `md`. |
| `variant` | `"default" \| "pill"` | no | `"default"` | `pill` rounds the box fully, to match pill-shaped buttons and chips in the same row. Default `default`. |
| `options` | `readonly SelectOption[]` | no |  | The choices. Use `groups` for `<optgroup>`s. |
| `groups` | `readonly SelectOptionGroup[]` | no |  | Labelled groups of choices, rendered as `<optgroup>`s after `options`. |
| `children` | `ReactNode` | no |  | `<option>` and `<optgroup>` elements, when `options` is not enough. |
| `placeholder` | `string` | no |  | Text of the empty first choice ("Choose a country"). It is selectable only before a choice is made: once chosen, the person cannot go back to nothing unless the field is optional, so set `allowEmpty` for that. |
| `allowEmpty` | `boolean` | no | `false` | Keeps the placeholder choosable after a value is picked, for optional fields. |
| `invalid` | `boolean` | no |  | Marks the control invalid without a `FormField`. Inside a field the error does it. |
| `className` | `string` | no |  | Goes on the box that draws the border; the native select gets the rest props. |
| `ref` | `Ref<HTMLSelectElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `SelectOption`: `{ value: string; label: string; disabled?: boolean | undefined; }`
- `SelectOptionGroup`: `{ label: string; options: readonly SelectOption[]; disabled?: boolean | undefined; }`

## Example

```tsx
import { FormField } from "@lufia/design-system/components/FormField";
import { Select } from "@lufia/design-system/components/Select";

<FormField label="Country" error={errors.country}>
  <Select
    name="country"
    placeholder="Choose a country"
    defaultValue=""
    options={[
      { value: "pt", label: "Portugal" },
      { value: "es", label: "Spain" },
    ]}
  />
</FormField>;
```

## Accessibility

- Always inside a `FormField`, or give `aria-label`, or a `<label htmlFor>` (it may wrap `VisuallyHidden`). A compact select in a toolbar has no visible label, so it needs one of the last two.
- The chevron is decorative and does not take clicks; the whole box opens the list.
- Under `forced-colors` the box and focus ring use system colours.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-bg-surface-solid`, `--lufia-color-text-default`, `--lufia-font-size-sm`, `--lufia-icon-size-sm`, `--lufia-opacity-disabled`, `--lufia-radius-full`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-target-touch`.

## Content guidelines

Options are sentence case, parallel and sorted in a way that fits the data (alphabetical for names, natural order for
ranges). The placeholder is an instruction, "Choose a country", never the label again.

## Stories

- `components-forms-select--default`
- `components-forms-select--with-placeholder`
- `components-forms-select--optional-with-empty-choice`
- `components-forms-select--with-hint`
- `components-forms-select--required`
- `components-forms-select--invalid`
- `components-forms-select--disabled`
- `components-forms-select--with-groups`
- `components-forms-select--with-child-groups`
- `components-forms-select--long-text`
- `components-forms-select--narrow-long-label`
- `components-forms-select--compact`
- `components-forms-select--compact-pill`
- `components-forms-select--in-filter-row`
- `components-forms-select--compact-narrow-long-label`
- `components-forms-select--phone-320`
- `components-forms-select--right-to-left`
- `components-forms-select--all-themes`
