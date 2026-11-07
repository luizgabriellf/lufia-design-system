# RadioGroup

> A set of radios where exactly one choice applies.

- Status: beta
- Category: Forms
- Import: `import { RadioGroup } from "@lufia/design-system/components/RadioGroup"`
- Also from: `@lufia/design-system`
- Source: [src/components/RadioGroup](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/RadioGroup)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-radiogroup--docs)

## Purpose

One choice from a short, visible list. Each option has a label and may have a description. The group has a roving tab stop
and arrow-key navigation.

## When to use

- Two to six mutually exclusive options, where seeing them all helps the decision.

## When not to use

- Seven or more options: use `Select` or `Combobox`.
- On/off: use `Switch` or `Checkbox`.
- A compact two-or-three-way view switch: use `SegmentedToggle`.

## API

### `RadioGroup`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | yes |  | Names the group, like a `<legend>`. |
| `options` | `readonly RadioOption[]` | yes |  |  |
| `hint` | `ReactNode` | no |  |  |
| `error` | `ReactNode` | no |  |  |
| `required` | `boolean` | no |  |  |
| `disabled` | `boolean` | no |  |  |
| `value` | `string` | no |  | Controlled value. `""` means nothing chosen. |
| `defaultValue` | `string` | no | `""` |  |
| `onValueChange` | `((value: string) => void)` | no |  |  |
| `name` | `string` | no |  | Submitted with the form as `name=value`. |
| `orientation` | `"vertical" \| "horizontal"` | no | `"vertical"` | `"vertical"` (default) stacks the options; `"horizontal"` wraps them in a row. |
| `variant` | `"default" \| "card"` | no | `"default"` | `"default"` draws the options as plain rows. `"card"` draws each as a bordered, selectable row (a card when it carries `meta` or `content`), with the chosen one outlined in the accent colour. The radio semantics and the keyboard are the same. Defaults to `"default"`. |
| `requiredLabel` | `string` | no |  | Text read after the label when `required`. Aria-only: the visible mark is a glyph. Defaults to the `required` label of `LufiaProvider`. |
| `requiredMessage` | `string` | no |  | Shown when a required group is submitted with nothing chosen. Defaults to the browser's own message. |
| `ref` | `Ref<HTMLDivElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `RadioOption`: `{ value: string; label: ReactNode; description?: ReactNode; meta?: ReactNode; content?: ReactNode; disabled?: boolean | undefined; }`

## Example

```tsx
import { RadioGroup } from "@lufia/design-system/components/RadioGroup";

<RadioGroup
  label="Payment method"
  name="payment"
  value={method}
  onValueChange={setMethod}
  options={[
    { value: "card", label: "Card", description: "Charged today." },
    { value: "transfer", label: "Bank transfer" },
  ]}
  error={errors.payment}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

- In right-to-left layouts Left and Right swap.
- `role="radiogroup"` named by the label; each option is `role="radio"` with `aria-checked`, named by its label and
- A required group blocks form submission until an option is chosen, with the browser's own message: an invisible, unsubmitted input mirrors the value for that. A form `reset` returns the group to `defaultValue`.
- The card variant changes the look only: the same roving focus, arrow keys and `radio` semantics. `meta` and `content` join the option's `aria-describedby`.
- Required adds an asterisk, the text `required` for screen readers (the `required` label of `LufiaProvider`, or `requiredLabel`), and `aria-required`.
- The error is in the group's description, with `role="alert"` and `aria-invalid`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-field`, `--lufia-color-bg-surface`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-on-accent`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-card`, `--lufia-radius-control`, `--lufia-radius-full`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-space-6`.

## Content guidelines

The group label is the question or the noun ("Payment method"). Options are parallel, short and sentence case. Describe the
consequence in the description, not the label. Pre-select the safe default when there is one; otherwise leave nothing chosen
and require a choice.

## Stories

- `components-forms-radiogroup--default`
- `components-forms-radiogroup--nothing-chosen`
- `components-forms-radiogroup--with-hint`
- `components-forms-radiogroup--required`
- `components-forms-radiogroup--invalid`
- `components-forms-radiogroup--card-variant`
- `components-forms-radiogroup--card-horizontal`
- `components-forms-radiogroup--card-invalid`
- `components-forms-radiogroup--card-long-text`
- `components-forms-radiogroup--card-phone-320`
- `components-forms-radiogroup--disabled`
- `components-forms-radiogroup--horizontal`
- `components-forms-radiogroup--long-text`
- `components-forms-radiogroup--phone-320`
- `components-forms-radiogroup--right-to-left`
- `components-forms-radiogroup--all-themes`
