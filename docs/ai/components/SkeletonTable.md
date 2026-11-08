# SkeletonTable

> Placeholder rows for a loading table: equal columns, bars inside their cells, stacked on narrow widths.

- Status: beta
- Category: Feedback
- Import: `import { SkeletonTable } from "@lufia/design-system/components/SkeletonTable"`
- Also from: `@lufia/design-system`
- Source: [src/components/SkeletonTable](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SkeletonTable)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-skeletontable--docs)

## Purpose

Placeholder rows for a table or a list that is loading. The columns share the width equally, every bar is a share of its
own cell, and below `stackBelow` (45rem by default) each row stacks its cells in one column, so nothing overflows at any
width.

## When to use

- A table or a list whose columns are known while its rows load.

## When not to use

- A table that loads in under about 300 ms: show nothing.
- An empty result: use [EmptyState](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-emptystate--docs).

## API

### `SkeletonTable`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `rows` | `number` | no | `5` | Number of placeholder rows. Give the page size of the table that will replace it, so nothing jumps. Default 5. |
| `columns` | `number` | no | `3` | Number of columns in each row. Default 3. |
| `stackBelow` | `string` | no |  | CSS length. Below this width of the table each row stacks its cells in one column, like a table that turns into a list on phones. Default `45rem`. |
| `still` | `boolean` | no | `false` | Turn the shimmer off. It also stops under `prefers-reduced-motion`. |

Other native element attributes pass through to the root element.

## Types

- `SkeletonTableProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { rows?: number | undefined; columns?: number | undefined; stackBelow?: string | undefined; still?: boolean | undefined; }`

## Example

```tsx
import { SkeletonTable } from "@lufia/design-system/components/SkeletonTable";
import { VisuallyHidden } from "@lufia/design-system/components/VisuallyHidden";

<div aria-busy={loading}>
  {loading ? (
    <>
      <VisuallyHidden role="status">Loading invoices</VisuallyHidden>
      <SkeletonTable rows={10} columns={4} />
    </>
  ) : (
    <InvoiceTable />
  )}
</div>;
```

## Accessibility

- The whole table is decorative (`aria-hidden`), whatever props it gets. Name the loading state once for the region, for example with a `VisuallyHidden` status or a `Skeleton` that has a `label`, and mark the region `aria-busy="true"`.
- The shimmer comes from `Skeleton`: `transform` only, stopped under `prefers-reduced-motion`, and `still` turns it off.
- In `forced-colors` mode the bars become outlined boxes.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-border-subtle`, `--lufia-font-line-height-normal`, `--lufia-font-size-sm`, `--lufia-skeleton-bg`, `--lufia-skeleton-shine`, `--lufia-skeleton-table-gap`, `--lufia-skeleton-table-row-padding`.

## Stories

- `components-feedback-skeletontable--default`
- `components-feedback-skeletontable--in-a-card`
- `components-feedback-skeletontable--many-columns`
- `components-feedback-skeletontable--widths`
- `components-feedback-skeletontable--still`
- `components-feedback-skeletontable--all-themes`
