# Combobox

> A searchable single-select dropdown input with async options, following the APG combobox pattern.

- Status: beta
- Category: Forms
- Import: `import { Combobox } from "@lufia/design-system/components/Combobox"`
- Also from: `@lufia/design-system`
- Source: [src/components/Combobox](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Combobox)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-combobox--docs)

## Purpose

A searchable single select. The person types to narrow a list and picks one option. Options can arrive asynchronously, and
the empty and loading states are part of the component.

## When to use

- A list too long to scan (more than about fifteen options), or one where people know what they are looking for.
- Data that is loaded as the person types.

## When not to use

- A short list: use `Select` (native, with the platform's picker on phones) or `RadioGroup`.
- A free-text field with suggestions: the box here only accepts a listed option.
- Several choices at once: this is a single select.
- A search that opens a results page: use `SearchInput`.

## API

### `Combobox`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `name` | `string` | no |  | Submitted with the form as `name=value` (empty when nothing is chosen). The visible text is not submitted. |
| `options` | `readonly ComboboxOption[]` | yes |  | The options to offer. For async data, replace them as results arrive and set `filter={false}`. |
| `value` | `string \| null` | no |  | Chosen option value, or `null` for none. Controlled. |
| `defaultValue` | `string \| null` | no | `null` | Initial value when `value` is not given. |
| `onValueChange` | `((value: string \| null, option: ComboboxOption \| null) => void)` | no |  |  |
| `onQueryChange` | `((query: string) => void)` | no |  | Called on every keystroke with the typed text, and with `""` once the box is cleared. Use it to load options. |
| `filter` | `false \| ((option: ComboboxOption, query: string) => boolean)` | no |  | How typed text narrows the list. Default: the label contains the text, ignoring case and diacritics. Pass a function to match your own way, or `false` to show `options` as given (the server already filtered them). |
| `loading` | `boolean` | no | `false` | Options are being loaded. Shows a ring and `loadingLabel`, and sets `aria-busy`. |
| `loadingLabel` | `ReactNode` | yes |  | Shown, and announced, while `loading`. |
| `emptyLabel` | `ReactNode` | yes |  | Shown, and announced, when nothing matches. |
| `resultsLabel` | `((count: number) => string)` | no |  | Announced when the list changes ("3 results"). Optional; the empty and loading texts are always announced. |
| `valueLabel` | `string` | no |  | Label of the chosen option when it is not in `options` (a value set before the options loaded). |
| `clearable` | `boolean` | no | `false` | Shows a clear button while something is chosen. Escape clears too, when the list is closed. |
| `clearLabel` | `string` | no | `"Clear"` | Accessible name of the clear button. Aria-only. |
| `toggleLabel` | `string` | no | `"Show options"` | Accessible name of the button that opens the list. Aria-only. |
| `requiredMessage` | `string` | no |  | Message the browser shows when a `required` combobox is submitted with nothing chosen. Defaults to the browser's own "please fill out this field" in the person's language. |
| `invalid` | `boolean` | no |  | Marks the control invalid without a `FormField`. |
| `className` | `string` | no |  | Goes on the root element. |
| `ref` | `Ref<HTMLInputElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `ComboboxOption`: `{ value: string; label: string; description?: string | undefined; disabled?: boolean | undefined; }`

## Example

```tsx
import { FormField } from "@lufia/design-system/components/FormField";
import { Combobox } from "@lufia/design-system/components/Combobox";

<FormField label="City" error={errors.city}>
  <Combobox
    name="city"
    options={cities}
    placeholder="Search for a city"
    emptyLabel="No city matches that search."
    loadingLabel="Loading cities…"
    onValueChange={(value) => setCity(value)}
  />
</FormField>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

- Option ids come from their `value` and do not change between renders, so assistive technology keeps its place when the list updates.
- A visually hidden status region announces the empty and loading texts, and the result count when you pass `resultsLabel`.
- A list that is empty or loading is not "expanded": there is nothing to point `aria-controls` at, so the message lives in the status region only.
- The highlighted option is shown with a fill and a bar on its start edge, and in forced-colors with the system highlight.
- A `required` combobox is invalid until an option is chosen, whatever text is typed: the browser refuses to submit, focuses the box and shows its own message (or `requiredMessage`). It also carries `aria-required`.
- A form `reset` returns it to `defaultValue`.
- It opens upward when there is little room below the box. The list is placed inside the field and is not portaled, so a parent with `overflow: hidden` or `overflow: auto` (a scrollable dialog body, a table cell) clips it or makes the parent scroll. Give the field room, or place it where nothing clips. A portaled list that escapes clipping ancestors is planned as a follow-up.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface-raised`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-distance-nudge`, `--lufia-motion-duration-fast`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-control`, `--lufia-radius-full`, `--lufia-radius-md`, `--lufia-shadow-md`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-z-dropdown`.

## Content guidelines

Labels are the thing being chosen ("City", "Assignee"), the placeholder says how ("Search for a city"). The empty text says
what to do next ("No city matches that search. Try another name."), and the loading text names what loads. Keep option labels
short and put the secondary detail (country, e-mail, code) in the description. Do not include the description in what must be
unique to tell options apart.

## Stories

- `components-forms-combobox--default`
- `components-forms-combobox--open`
- `components-forms-combobox--with-value`
- `components-forms-combobox--with-hint`
- `components-forms-combobox--required`
- `components-forms-combobox--invalid`
- `components-forms-combobox--disabled`
- `components-forms-combobox--read-only`
- `components-forms-combobox--clearable`
- `components-forms-combobox--empty`
- `components-forms-combobox--loading`
- `components-forms-combobox--async-options`
- `components-forms-combobox--long-options`
- `components-forms-combobox--many-options`
- `components-forms-combobox--inside-dialog`
- `components-forms-combobox--phone-320`
- `components-forms-combobox--right-to-left`
- `components-forms-combobox--all-themes`
