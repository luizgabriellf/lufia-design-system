# SkeletonRegion

> The named, busy wrapper of a loading shape: announces what is loading once, around decorative placeholders.

- Status: beta
- Category: Feedback
- Import: `import { SkeletonRegion } from "@lufia/design-system/components/SkeletonRegion"`
- Also from: `@lufia/design-system`
- Source: [src/components/SkeletonRegion](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SkeletonRegion)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-skeletonregion--docs)

## Purpose

The named wrapper of a loading shape. The skeleton pieces are decorative and hidden from assistive technology;
`SkeletonRegion` is the one place that says what is loading. It has no styles of its own.

## When to use

- Around every skeleton shape that stands in for content: a table, a card grid, a page.
- Once per wait. Several placeholders that load together share one region.

## When not to use

- For a short inline wait in a button or a field: use `Spinner` with a label or `PendingSubmit`.
- Around content that is already on screen and only refreshing: set `aria-busy` on that content instead.
- Nested inside another `SkeletonRegion`: one announcement is enough.

## API

### `SkeletonRegion`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | no |  | The placeholders: `Skeleton`, `SkeletonTable`, `SkeletonCard`, `SkeletonPageHeader` or a shape of your own. |
| `label` | `ReactNode` | yes |  | What is loading, for example "Loading invoices". Read by assistive technology, never drawn. |

Other native element attributes pass through to the root element.

## Types

- `SkeletonRegionProps`: `HTMLAttributes<HTMLDivElement> & { label: ReactNode; children?: ReactNode; }`

## Example

```tsx
import { SkeletonRegion } from "@lufia/design-system/components/SkeletonRegion";
import { SkeletonTable } from "@lufia/design-system/components/SkeletonTable";

{
  loading ? (
    <SkeletonRegion label="Loading invoices">
      <SkeletonTable rows={10} columns={4} />
    </SkeletonRegion>
  ) : (
    <InvoiceTable />
  );
}
```

## Accessibility

- The root carries `aria-busy="true"` for as long as it is rendered. Unmount it when the content arrives; the component owns the attribute, so a passed `aria-busy` is ignored.
- `label` sits in a visually hidden `role="status"` element (a polite live region), so it is announced without moving focus. The status is a child of the busy root, not the root itself.
- WCAG 4.1.3 (Status Messages): the loading state is exposed to assistive technology without receiving focus.
- Layout props (`className`, `style`) go to the root, which is a plain `div`: give it the grid or the gap the placeholders need.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `components-feedback-skeletonregion--default`
- `components-feedback-skeletonregion--whole-page`
- `components-feedback-skeletonregion--all-themes`
