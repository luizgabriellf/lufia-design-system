# DateRangeField

> Two date fields that form one range, in a fieldset, where the start is never after the end.

- Status: beta
- Category: Forms
- Import: `import { DateRangeField } from "@lufia/design-system/components/DateRangeField"`
- Also from: `@lufia/design-system`
- Source: [src/components/DateRangeField](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/DateRangeField)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-daterangefield--docs)

## Purpose

Two `DateField`s that form one range, in a fieldset named by a legend. The start is never after the end. The native `max` of
the start and `min` of the end steer the picker, and a typed or picked value that would break the order is corrected: the end
the person just edited is kept and the other end moves to the same value (both ends equal). `onValueChange` is called once,
with the corrected range. Any `min` and `max` of the whole range apply on top. The ends sit side by side and stack when the
room is narrow.

## When to use

- A start and an end that belong together: a stay, a reporting period, an event window.

## When not to use

- A single date: use `DateField`.
- Presets ("last 30 days"), a calendar showing the range or ranges across more than two ends: not provided here.

## API

### `DateRangeField`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `legend` | `ReactNode` | yes |  | Names the group, as a `<legend>` ("Stay"). |
| `startLabel` | `ReactNode` | yes |  | The label of the first field ("From"). |
| `endLabel` | `ReactNode` | yes |  | The label of the second field ("To"). |
| `type` | `"date" \| "time" \| "datetime-local" \| "month"` | no | `"date"` | Which native control both ends use. `date` (default), `time`, `datetime-local` or `month`. |
| `value` | `DateRange` | no |  | Controlled range. |
| `defaultValue` | `DateRange` | no | `EMPTY` |  |
| `onValueChange` | `(value: DateRange) => void` | no |  | Called once with the whole range whenever either end changes. The order is enforced: when an edit would put the start after the end, the end just edited is kept and the other end moves to the same value (both ends equal), and the range reported here is already corrected. |
| `min` | `string` | no | `""` | The earliest value of the range. The end also cannot go below the start. |
| `max` | `string` | no | `""` | The latest value of the range. The start also cannot go above the end. |
| `step` | `string \| number` | no |  | The step of both native controls. |
| `startName` | `string` | no |  | Names the form entries of the two ends, so they submit as `startName=…&endName=…`. |
| `endName` | `string` | no |  |  |
| `hint` | `ReactNode` | no |  | Help shown under the group, linked to it with `aria-describedby`. |
| `error` | `ReactNode` | no |  | Error text for the group. It marks both ends invalid and shows the message with an icon. |
| `required` | `boolean` | no |  | Marks both ends required; each label shows the mark and the text for assistive technology. |
| `nativeRequired` | `boolean` | no |  | As on `FormField`: whether `required` also sets the native `required` attribute. Defaults to `true`. |
| `requiredLabel` | `string` | no |  | Text read after a label when `required`. Defaults to the `required` label of `LufiaProvider`. |
| `clearLabel` | `string` | no |  | The accessible name of the clear buttons, in your language. See `DateField`. |
| `className` | `string` | no |  | Goes on the fieldset. |
| `ref` | `Ref<HTMLFieldSetElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `DateRange`: `{ start: string; end: string; }`

## Example

```tsx
import { DateRangeField } from "@lufia/design-system/components/DateRangeField";

<DateRangeField
  legend="Stay"
  startLabel="From"
  endLabel="To"
  startName="from"
  endName="to"
  value={range}
  onValueChange={setRange}
  error={errors.range}
/>;
```

## Accessibility

Keyboard:

Each end is a native input with the platform's keyboard behaviour; Tab goes from the start to the end, in reading order.

- A `<fieldset>` with a `<legend>` names the group; each end has its own visible label. The hint and the error are the description of the group.
- An error marks both ends `aria-invalid`, is announced when it appears, and is part of the description of the group and of each end.
- `required` marks both labels with the mark and the text for assistive technology, and sets the native `required` unless `nativeRequired={false}`.
- A disabled group disables both ends and the fieldset.
- The ends stack through the grid itself (no media query), so nothing overflows at 320px or at 200% zoom.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-tight`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`.

## Content guidelines

A legend that names the range ("Stay", "Reporting period"), and short parallel labels ("From", "To"). Say a length limit in the
hint, not only in the error.

## Stories

- `components-forms-daterangefield--default`
- `components-forms-daterangefield--with-values`
- `components-forms-daterangefield--with-min-and-max`
- `components-forms-daterangefield--months`
- `components-forms-daterangefield--dates-and-times`
- `components-forms-daterangefield--required`
- `components-forms-daterangefield--invalid`
- `components-forms-daterangefield--disabled`
- `components-forms-daterangefield--clearable`
- `components-forms-daterangefield--controlled`
- `components-forms-daterangefield--narrow`
- `components-forms-daterangefield--phone-320`
- `components-forms-daterangefield--right-to-left`
- `components-forms-daterangefield--all-themes`
