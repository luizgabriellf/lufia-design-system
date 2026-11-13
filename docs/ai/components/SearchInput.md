# SearchInput

> A search field with a clear button, optional debounce and a shortcut hint.

- Status: beta
- Category: Forms
- Import: `import { SearchInput } from "@lufia/design-system/components/SearchInput"`
- Also from: `@lufia/design-system`
- Source: [src/components/SearchInput](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SearchInput)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-searchinput--docs)

## Purpose

A search box: a magnifier, a native `type="search"` input, a clear button, an optional shortcut hint and a debounced
`onSearch`.

## When to use

- Filtering or finding items in a list, a table or a whole product.

## When not to use

- Choosing one value from a list of known options: use `Combobox`, which keeps the choice and its keyboard model.
- A form field whose text is data, not a query: use `TextInput`.

## API

### `SearchInput`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `onChange` | `ChangeEventHandler<HTMLInputElement, HTMLInputElement> & ChangeEventHandler<HTMLInputElement>` | no |  | The native change event, called on every keystroke before `onValueChange`. Pair it with `value` as with any input. |
| `value` | `string` | no |  | Controlled text. |
| `defaultValue` | `string` | no | `""` |  |
| `onValueChange` | `(value: string) => void` | no |  | Called on every keystroke with the current text. |
| `onSearch` | `(value: string) => void` | no |  | Called with the text once the person stops typing for `debounceMs`, at once on Enter, and at once when the text is cleared. It does not fire for the initial value, or twice for the same text in a row. |
| `debounceMs` | `number` | no | `300` | Quiet time before `onSearch` fires while typing, in milliseconds. Default 300. |
| `clearLabel` | `string` | no | `"Clear search"` | Accessible name of the clear button. Aria-only. |
| `shortcut` | `string` | no |  | A hint for the key that focuses the field, such as "/" or "Ctrl K". Display only: the app binds the key. |
| `loading` | `boolean` | no | `false` | A search is running. Shows a ring, sets `aria-busy` and announces `loadingLabel`. |
| `loadingLabel` | `string` | no | `"Searching"` | Text announced while `loading`. Aria-only. |
| `invalid` | `boolean` | no |  | Marks the control invalid without a `FormField`. |
| `className` | `string` | no |  | Goes on the box that draws the border; the native input gets the rest props. |
| `ref` | `Ref<HTMLInputElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Example

```tsx
import { SearchInput } from "@lufia/design-system/components/SearchInput";

<SearchInput
  placeholder="Search customers"
  clearLabel="Clear search"
  shortcut="/"
  onSearch={(text) => load(text)}
  loading={isLoading}
/>;
```

## Accessibility

- Needs a name: put it in a `FormField`, pass `aria-label`, or the placeholder is used as a last resort.
- The clear button has its own accessible name (`clearLabel`) and is 32px square inside a 44px box.
- While `loading`, the input has `aria-busy` and a status region announces `loadingLabel`. The ring stops under `prefers-reduced-motion`.
- Results are not announced by this component: the list you update should announce its own count (a live region).

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-mono`, `--lufia-font-line-height-normal`, `--lufia-font-size-xs`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-radius-full`, `--lufia-radius-xs`, `--lufia-space-2`.

## Content guidelines

The placeholder says what can be searched ("Search customers"), not "Search...". Put the scope in it when there is more than one
search on a page. `clearLabel` and `loadingLabel` are read aloud: "Clear search", "Searching customers".

## Stories

- `components-forms-searchinput--default`
- `components-forms-searchinput--with-value`
- `components-forms-searchinput--with-shortcut`
- `components-forms-searchinput--inside-form-field`
- `components-forms-searchinput--invalid`
- `components-forms-searchinput--loading`
- `components-forms-searchinput--disabled`
- `components-forms-searchinput--read-only`
- `components-forms-searchinput--debounced`
- `components-forms-searchinput--long-text`
- `components-forms-searchinput--in-toolbar`
- `components-forms-searchinput--in-grid-form`
- `components-forms-searchinput--in-filter-form-grid`
- `components-forms-searchinput--in-filter-form-single-column`
- `components-forms-searchinput--in-filter-form-flex-wrap`
- `components-forms-searchinput--in-filter-form-align-end`
- `components-forms-searchinput--in-filter-form-justify-start`
- `components-forms-searchinput--in-column-flex`
- `components-forms-searchinput--phone-320`
- `components-forms-searchinput--right-to-left`
- `components-forms-searchinput--all-themes`
