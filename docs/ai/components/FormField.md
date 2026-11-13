# FormField

> Label, hint and error wired to any control, so the control stays accessible by default.

- Status: beta
- Category: Forms
- Import: `import { FormField, FormFieldContext, useFormFieldControl, useFormFieldLabelId } from "@lufia/design-system/components/FormField"`
- Also from: `@lufia/design-system`
- Source: [src/components/FormField](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/FormField)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-formfield--docs)

## Purpose

The wrapper that turns a bare control into a field: a label, an optional hint, an optional error, and the wiring between
them. It generates the ids, points the label at the control, links the hint and the error with `aria-describedby`, sets
`aria-invalid` when there is an error, and marks a required field in text.

## When to use

- Every single-value control that has a label of its own: text, select, search, file, combobox.

## When not to use

- A group of checkboxes or radios. Those have a legend, not a label: use `RadioGroup`, or a native `<fieldset>`.
- A checkbox or switch on its own line. They carry their own label.
- A placeholder in place of a label. A placeholder disappears as soon as the person types.

## Exports

| Name | Kind |
| --- | --- |
| `FormField` | component |
| `FormFieldContext` | component |
| `useFormFieldControl` | hook |
| `useFormFieldLabelId` | hook |

## API

### `FormField`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `string` | no |  | Base id of the control; the hint and error ids derive from it. Generated when omitted. |
| `label` | `ReactNode` | yes |  | The visible label. Every control needs one. |
| `hint` | `ReactNode` | no |  | Help shown under the control, linked to it with `aria-describedby`. |
| `error` | `ReactNode` | no |  | Error text. Its presence marks the control `aria-invalid` and shows the message with an icon. |
| `required` | `boolean` | no |  | Marks the control required and shows an asterisk plus text for assistive technology. |
| `nativeRequired` | `boolean` | no | `true` | Whether `required` also puts the native `required` attribute on the control. Defaults to `true`. Set `false` when the form validates on its own and shows its own messages: the control then gets `aria-required="true"` and no `required`, so the browser shows no native bubble and the form needs no `noValidate`. The label still shows the mark and text. |
| `disabled` | `boolean` | no |  |  |
| `requiredLabel` | `string` | no |  | Text read after the label when `required`. Aria-only: the visible mark is a glyph. Defaults to the `required` label of `LufiaProvider` ("required"), so an app sets the word once; this prop wins when given. |
| `children` | `ReactNode \| ((control: FormFieldControlProps) => ReactNode)` | yes |  | The control. A node reaches the controls of this package through context; a function receives the props to spread on any other control (a third-party input, a native element). |

Other native element attributes pass through to the root element.

### `FormFieldContext`

No props of its own. Native element attributes pass through.

### `useFormFieldControl`

Merges the props a control got from its own caller with the ones of the surrounding `FormField`. Outside a field it returns the caller's props untouched, so every control works on its own. Inside a field, the first control to render takes the field's `id` unless it has its own `id`, which wins; the label follows that control. A second control in the same field keeps its own `id` or gets a generated one, never the field's, so ids stay unique and the label names only one control. `aria-describedby` is the union of both lists without repeated ids, and a control is invalid, required or disabled when either side says so. A field with `nativeRequired={false}` yields `aria-required` and no `required`. Use this when building a control that should join a field; the controls of this package already do.

```ts
useFormFieldControl(own?: OwnProps): { id: string | undefined; "aria-describedby": string | undefined; "aria-invalid": true | undefined; required: true | undefined; "aria-required": true | undefined; disabled: true | undefined; }
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `own` | `OwnProps` | no |  |

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string \| undefined` | yes |  |
| `aria-describedby` | `string \| undefined` | yes |  |
| `aria-invalid` | `true \| undefined` | yes |  |
| `required` | `true \| undefined` | yes |  |
| `aria-required` | `true \| undefined` | yes |  |
| `disabled` | `true \| undefined` | yes |  |

### `useFormFieldLabelId`

The id of the surrounding `FormField`'s label element, for widgets that need to name a second element (a listbox, a popup) after the field. `undefined` outside a field.

```ts
useFormFieldLabelId(): string | undefined
```

## Types

- `FormFieldControlProps`: `{ id: string; "aria-describedby"?: string | undefined; "aria-invalid"?: true | undefined; required?: boolean | undefined; "aria-required"?: true | undefined; disabled?: boolean | undefined; }`

## Example

```tsx
import { FormField } from "@lufia/design-system/components/FormField";
import { TextInput } from "@lufia/design-system/components/TextInput";

<FormField label="Project name" hint="Shown on invoices." required error={errors.name}>
  <TextInput name="name" />
</FormField>;
```

## Accessibility

- The label is a real `<label for>`, so the control's accessible name is the label text.
- The control's accessible description is the hint followed by the error.
- `aria-invalid="true"` is present only while there is an error, so a pristine field is not announced as invalid.
- Validate on blur or on submit, not on every keystroke, so the alert does not interrupt typing.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-status-danger-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-tight`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`, `--lufia-space-1`, `--lufia-space-2`.

## Content guidelines

Labels are nouns, short, in sentence case: "Project name", not "Please enter the name of your project". Hints say what is
allowed or why it is asked ("Up to 40 characters"). Errors say what to do, not what went wrong: "Enter a project name to
continue", not "Invalid input". Never rely on "required" in colour; do not write "(required)" yourself, the component adds it
for assistive technology.

## Stories

- `components-forms-formfield--default`
- `components-forms-formfield--with-hint`
- `components-forms-formfield--required`
- `components-forms-formfield--invalid`
- `components-forms-formfield--disabled`
- `components-forms-formfield--required-from-provider`
- `components-forms-formfield--long-text`
- `components-forms-formfield--phone-320`
- `components-forms-formfield--right-to-left`
- `components-forms-formfield--all-themes`
