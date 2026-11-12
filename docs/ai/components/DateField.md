# DateField

> A native date, time, date-and-time or month control in the shared field box, with icon and optional clear button.

- Status: beta
- Category: Forms
- Import: `import { DateField } from "@lufia/design-system/components/DateField"`
- Also from: `@lufia/design-system`
- Source: [src/components/DateField](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/DateField)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-datefield--docs)

## Purpose

A native date, time, date-and-time or month control in the shared field box: the same height, padding, focus ring and
states as `TextInput`, a calendar or clock icon, and an optional clear button. It enhances the browser's own control, it does
not replace it: editing, the keyboard and the mobile picker are the platform's.

## When to use

- A date, a time of day, a local date and time or a month, entered by typing or through the platform picker.
- A mobile form: the native picker is usually the best one there is.

## When not to use

- A custom calendar popup, presets such as "last 7 days" or a range in one control: not provided here.
- Two ends of one range: use `DateRangeField`.
- A birth date or any date far in the past: three `Select`s or a text field with a format hint can be faster than scrolling.

## API

### `DateField`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | `"date" \| "time" \| "datetime-local" \| "month"` | no | `"date"` | Which native control to render. `date` (default), `time`, `datetime-local` or `month`. |
| `value` | `string` | no |  | Controlled value, as the native control emits it: `2030-01-31`, `14:30`, `2030-01-31T14:30` or `2030-01`. `""` is empty. |
| `defaultValue` | `string` | no | `""` |  |
| `onValueChange` | `(value: string) => void` | no |  | Called with the value the native control emits, or `""` when it is emptied or cleared. |
| `min` | `string` | no |  | The earliest value, in the same format as `value`. |
| `max` | `string` | no |  | The latest value, in the same format as `value`. |
| `step` | `string \| number` | no |  | The step of the native control: days for `date`, seconds for `time` and `datetime-local`, months for `month`. |
| `clearLabel` | `string` | no |  | The accessible name of a clear button, in your language. Giving it adds the button, which shows only while the field has a value and is neither required, disabled nor read-only. Clearing dispatches bubbling `input` and `change` events, as an edit would. Aria-only: the package has no copy. |
| `invalid` | `boolean` | no |  | Marks the control invalid without a `FormField`. Inside a field the error does it. |
| `className` | `string` | no |  | Goes on the box that draws the border; the native input gets the rest props. |
| `ref` | `Ref<HTMLInputElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `DateFieldType`: `"date" | "time" | "datetime-local" | "month"`

## Example

```tsx
import { DateField } from "@lufia/design-system/components/DateField";
import { FormField } from "@lufia/design-system/components/FormField";

<FormField label="Start date" error={errors.start}>
  <DateField name="start" min="2030-01-01" clearLabel="Clear date" onValueChange={setStart} />
</FormField>;
```

## Accessibility

Keyboard:

A native input, so the platform's behaviour applies: Tab moves in and out, the arrow keys change the focused segment and
typing fills it. The clear button is in the tab order after the input and works with Enter and Space.

- Always inside a `FormField`, or give `aria-label`.
- The calendar or clock icon is decorative and hidden from assistive technology. It appears only where the browser lets a script open its picker (`showPicker`) and the native indicator can be hidden; elsewhere the native indicator stays, so there is always exactly one. Clicking the icon is a pointer convenience: keyboard and screen-reader users use the native control.
- The icon is drawn after the first render, so server-rendered markup shows the native indicator until it hydrates.
- Empty controls keep their height and start alignment, including on iOS Safari, where the native control otherwise collapses or centres its text.
- The clear button is named by `clearLabel`. Without it there is no button.
- Under `forced-colors` the box, the icon and the focus ring use system colours.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-bg-surface-raised`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-radius-full`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-target-touch`.

## Content guidelines

Label the field with what the date is ("Start date"), not the control ("Date picker"). Put the expected range or time zone in
the hint.

## Stories

- `components-forms-datefield--default`
- `components-forms-datefield--all-types`
- `components-forms-datefield--all-types-empty`
- `components-forms-datefield--with-hint`
- `components-forms-datefield--with-min-and-max`
- `components-forms-datefield--required`
- `components-forms-datefield--invalid`
- `components-forms-datefield--disabled`
- `components-forms-datefield--read-only`
- `components-forms-datefield--clearable`
- `components-forms-datefield--controlled`
- `components-forms-datefield--narrow`
- `components-forms-datefield--phone-320`
- `components-forms-datefield--right-to-left`
- `components-forms-datefield--all-themes`
