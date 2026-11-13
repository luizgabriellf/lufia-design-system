# ListField

> A field holding a list of short text entries, each editable in place, with an add row and a remove button.

- Status: beta
- Category: Forms
- Import: `import { ListField } from "@lufia/design-system/components/ListField"`
- Also from: `@lufia/design-system`
- Source: [src/components/ListField](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ListField)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-listfield--docs)

## Purpose

A form field that holds a list of short text entries: one text input per entry, editable in place, an add row and a remove
button on each entry. The entries are submitted as one hidden text value.

## When to use

- A list of short values the person writes themselves: tasks, tags, phone numbers, keywords.
- Storing the list as one text column, with your own delimiter.

## When not to use

- Long or formatted entries: use `Textarea`.
- Choosing from known options: use `Combobox` or a set of checkboxes.
- Entries with several fields each: build a form for the row.

## API

### `ListField`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | yes |  | Names the group and the add input. |
| `labels` | `ListFieldLabels` | yes |  | Every user-facing string of the field. The package has no built-in language. |
| `name` | `string` | no |  | Submitted with the form as ONE hidden text value under this name: `serialize(items)`. |
| `items` | `readonly string[]` | no |  | Controlled entries. A value that differs from what the field holds replaces its rows. |
| `defaultItems` | `readonly string[]` | no |  |  |
| `onChange` | `(items: string[]) => void` | no |  | Called with the entries (sanitized, empty ones left out) after every add, edit and removal. |
| `serialize` | `(items: readonly string[]) => string` | no | `joinLines` | Turns the entries into the submitted value. Defaults to joining them with a line feed. |
| `sanitizeItem` | `(text: string) => string` | no |  | Cleans one entry when it is added and whenever the entries are read (trimming, collapsing spaces). Must be idempotent. |
| `maxItems` | `number` | no | `30` | The most entries. Adding is disabled when reached. Default 30. |
| `itemMaxLength` | `number` | no |  | The longest entry, in characters. |
| `maxTotalLength` | `number` | no |  | The longest serialized value, in characters. The add input stops accepting text at the room left, and adding is disabled when none is. |
| `required` | `boolean` | no |  | At least one entry is needed. The add input then carries `labels.requiredMessage` as its custom validity. |
| `placeholder` | `string` | no |  | Placeholder of the add input. |
| `hint` | `ReactNode` | no |  |  |
| `error` | `ReactNode` | no |  |  |
| `badge` | `ReactNode` | no |  | Content next to the label, such as a `Badge`. |
| `disabled` | `boolean` | no |  |  |
| `requiredLabel` | `string` | no |  | Text read after the label when `required`. Aria-only: the visible mark is a glyph. Defaults to the `required` label of `LufiaProvider`. |
| `ref` | `Ref<ListFieldHandle>` | no |  | Imperative handle: `commitDraft()`. |

Other native element attributes pass through to the root element.

## Types

- `ListFieldHandle`: `{ commitDraft: () => boolean; }`
- `ListFieldLabels`: `{ add: string; remove: (index: number, text: string) => string; entry: (index: number) => string; requiredMessage?: string | undefined; }`

## Example

```tsx
import { ListField } from "@lufia/design-system/components/ListField";

<ListField
  name="responsibilities"
  label="Responsibilities"
  labels={{
    add: "Add",
    remove: (index, text) => `Remove entry ${index}: ${text}`,
    entry: (index) => `Entry ${index}`,
    requiredMessage: "Add at least one entry.",
  }}
  defaultItems={["Inspect the site"]}
/>;
```

## Accessibility

- The field is a `group` named by its label. Each entry input is named by `labels.entry(index)`, each remove button by `labels.remove(index, text)`.
- The label points at the add input. The hint and error describe the group.
- Rows enter with a rise and fade and leave with a fade, using only `opacity` and `transform`; under `prefers-reduced-motion` they appear and disappear at once. A leaving row is `inert`.
- Remove buttons are at least 32px tall and grow to the 44px touch target on touch screens and phone widths.
- No live region: the list is the content, and focus stays on a control the person is using.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-status-danger-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-tight`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`, `--lufia-space-1`, `--lufia-space-2`.

## Content guidelines

Say what one entry is in the label and what the delimiter or limit is in the hint. Name the remove button after the entry
it removes ("Remove entry 2: Inspect the site"), not just "Remove".

## Stories

- `components-forms-listfield--default`
- `components-forms-listfield--empty`
- `components-forms-listfield--with-hint-and-badge`
- `components-forms-listfield--controlled`
- `components-forms-listfield--required`
- `components-forms-listfield--invalid`
- `components-forms-listfield--disabled`
- `components-forms-listfield--full`
- `components-forms-listfield--max-items`
- `components-forms-listfield--long-entries`
- `components-forms-listfield--phone-320`
- `components-forms-listfield--right-to-left`
- `components-forms-listfield--all-themes`
