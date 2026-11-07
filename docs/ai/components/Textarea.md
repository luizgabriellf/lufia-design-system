# Textarea

> A multi-line text field that can show a character count.

- Status: beta
- Category: Forms
- Import: `import { Textarea } from "@lufia/design-system/components/Textarea"`
- Also from: `@lufia/design-system`
- Source: [src/components/Textarea](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Textarea)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-textarea--docs)

## Purpose

A multi-line text control with the same box as `TextInput`, vertical resizing and an optional character count.

## When to use

- Free text that may run past one line: notes, descriptions, messages.

## When not to use

- A short value: use `TextInput`. Do not stretch a textarea to look like an input.
- Formatted text. This is plain text only.

## API

### `Textarea`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `invalid` | `boolean` | no |  | Marks the control invalid without a `FormField`. Inside a field the error does it. |
| `showCount` | `boolean` | no |  | Shows a character count under the box. With `maxLength` it reads "12 / 200". |
| `formatCount` | `((length: number, max: number \| undefined) => ReactNode)` | no | `defaultCount` | Text of the count. Defaults to `12 / 200` with a limit and `12` without. Pass it to localise or reword. |
| `formatCountAnnouncement` | `((length: number, max: number) => string)` | no | `defaultAnnouncement` | Text read out when the person is close to the limit (the last tenth) or over it. Aria-only. |
| `className` | `string` | no |  | Goes on the box that draws the border; the native textarea gets the rest props. |
| `ref` | `Ref<HTMLTextAreaElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Example

```tsx
import { FormField } from "@lufia/design-system/components/FormField";
import { Textarea } from "@lufia/design-system/components/Textarea";

<FormField label="Notes" hint="Visible to everyone on the project.">
  <Textarea name="notes" rows={5} maxLength={500} showCount />
</FormField>;
```

## Accessibility

- The resize handle is vertical only, so the box cannot grow wider than its container at 320px.
- Focus ring, forced-colors and invalid styling match `TextInput`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-status-warning-fg`, `--lufia-color-text-muted`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-space-1`.

## Content guidelines

Say how much is expected in the hint ("A sentence or two is enough"). Show the count only when a limit exists or matters.
Phrase `formatCount` as what is left ("12 characters left") when the limit is tight.

## Stories

- `components-forms-textarea--default`
- `components-forms-textarea--with-hint`
- `components-forms-textarea--required`
- `components-forms-textarea--invalid`
- `components-forms-textarea--disabled`
- `components-forms-textarea--read-only`
- `components-forms-textarea--with-count`
- `components-forms-textarea--near-limit`
- `components-forms-textarea--count-without-limit`
- `components-forms-textarea--custom-count`
- `components-forms-textarea--controlled`
- `components-forms-textarea--long-text`
- `components-forms-textarea--phone-320`
- `components-forms-textarea--right-to-left`
- `components-forms-textarea--all-themes`
