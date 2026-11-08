# DetailList

> Label and value pairs for the details of one record.

- Status: beta
- Category: Data display
- Import: `import { DetailList } from "@lufia/design-system/components/DetailList"`
- Also from: `@lufia/design-system`
- Source: [src/components/DetailList](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/DetailList)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-detaillist--docs)

## Purpose

Key-value rows for detail panels and modals, rendered as a native description list.

## When to use

- Several short label/value facts about one record.

## When not to use

- Tabular data with many records (use a table) or editable fields (use a form).

## API

### `DetailList`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `rows` | `DetailListRow[]` | yes |  |  |

Other native element attributes pass through to the root element.

## Types

- `DetailListProps`: `HTMLAttributes<HTMLDListElement> & { rows: DetailListRow[]; }`
- `DetailListRow`: `{ label: string; value: ReactNode; mono?: boolean | undefined; }`

## Example

```tsx
import { DetailList } from "@lufia/design-system/components/DetailList";

<DetailList
  rows={[
    { label: "Name", value: "Ada Example" },
    { label: "Identifier", value: "A-1042", mono: true },
  ]}
/>;
```

## Accessibility

- Uses `<dl>`, `<dt>` and `<dd>`, which expose the label-value relationship to screen readers without extra ARIA.
- The label column is capped at 40% and wraps. A long label never pushes values out of their container, so the layout reflows at 320px.
- Values may be any React node; links and buttons inside keep their own focus behaviour.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-mono`, `--lufia-space-2`, `--lufia-space-4`.

## Content guidelines

Labels are short nouns without trailing colons (the grid provides the separation). Use `mono` for dates, counts and
identifiers so digits align. Localise and format values (dates, numbers) in the app: locales differ in both.

## Stories

- `components-data-display-detaillist--default`
- `components-data-display-detaillist--rich-values`
- `components-data-display-detaillist--long-label`
- `components-data-display-detaillist--empty`
- `components-data-display-detaillist--all-themes`
