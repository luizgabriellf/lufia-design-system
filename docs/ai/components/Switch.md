# Switch

> An on/off control whose change takes effect immediately.

- Status: beta
- Category: Forms
- Import: `import { Switch, SwitchInput } from "@lufia/design-system/components/Switch"`
- Also from: `@lufia/design-system`
- Source: [src/components/Switch](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Switch)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-switch--docs)

## Purpose

An on/off control for a setting that takes effect immediately: a `role="switch"` button with a label, an optional hint and
error, and a thumb that slides.

## When to use

- A setting that applies at once, with no Save button: notifications, dark mode, a feature flag.

## When not to use

- A choice that is submitted later with a form: use `Checkbox`, or `SwitchInput` when an on/off switch reads better.
- A choice between two named options that are not on and off ("Monthly" or "Yearly"): use `SegmentedToggle`.

## Exports

| Name | Kind |
| --- | --- |
| `Switch` | component |
| `SwitchInput` | component |

## API

### `Switch`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `name` | `string` | no |  | Submitted as `name=value` while on, like a checkbox. Without `name` nothing is submitted. |
| `defaultChecked` | `boolean` | no | `false` | Initial state when `checked` is not given. |
| `label` | `ReactNode` | yes |  | The visible label. Clicking it toggles the switch. |
| `hint` | `ReactNode` | no |  |  |
| `error` | `ReactNode` | no |  |  |
| `checked` | `boolean` | no |  | Controlled state. |
| `onCheckedChange` | `((checked: boolean) => void)` | no |  |  |
| `value` | `string` | no | `"on"` |  |
| `className` | `string` | no |  | Goes on the root element. |
| `ref` | `Ref<HTMLButtonElement>` | no |  |  |

Other native element attributes pass through to the root element.

### `SwitchInput`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | yes |  | The visible label. Clicking it toggles the switch. |
| `hint` | `ReactNode` | no |  |  |
| `error` | `ReactNode` | no |  |  |
| `value` | `string` | no | `"on"` | Submitted as `name=value` while on. Defaults to `"on"`, like a checkbox. |
| `onCheckedChange` | `((checked: boolean) => void)` | no |  | Called with the new state. A plain `onChange` also works; both fire. |
| `className` | `string` | no |  | Goes on the root element. |
| `ref` | `Ref<HTMLInputElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Example

```tsx
import { Switch } from "@lufia/design-system/components/Switch";

<Switch label="Email alerts" hint="One message a day, at most." checked={on} onCheckedChange={save} />;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

- `SwitchInput` is a native checkbox with `role="switch"`, so the checked state is exposed natively and Space toggles it (Enter does not, as on any checkbox); the label, hint and error wiring is the same.
- `role="switch"` with `aria-checked`, on a `<button>`. The label is a real `<label for>`; the track is 44 by 28px.
- If saving can fail, do the optimistic update, and on failure set the state back and pass `error`.
- Under `forced-colors` the on track uses `Highlight` and the thumb `HighlightText`. The thumb slides with `transform`,

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-color-accent-default`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-on-accent`, `--lufia-font-line-height-normal`, `--lufia-font-size-md`, `--lufia-motion-duration-fast`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-full`, `--lufia-space-1`, `--lufia-space-3`.

## Content guidelines

Name the setting as a noun phrase ("Email alerts", "Dark mode"). The hint says what happens when it is on. Do not use a verb
that flips meaning with the state ("Enable alerts").

## Stories

- `components-forms-switch--default`
- `components-forms-switch--on`
- `components-forms-switch--with-hint`
- `components-forms-switch--invalid`
- `components-forms-switch--disabled`
- `components-forms-switch--disabled-on`
- `components-forms-switch--controlled`
- `components-forms-switch--in-form`
- `components-forms-switch--input-states`
- `components-forms-switch--input-right-to-left`
- `components-forms-switch--long-text`
- `components-forms-switch--phone-320`
- `components-forms-switch--right-to-left`
- `components-forms-switch--all-themes`
