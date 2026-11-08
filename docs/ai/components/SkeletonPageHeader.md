# SkeletonPageHeader

> The top of a loading page, on PageHeader's own layout and breakpoints.

- Status: beta
- Category: Feedback
- Import: `import { SkeletonPageHeader } from "@lufia/design-system/components/SkeletonPageHeader"`
- Also from: `@lufia/design-system`
- Source: [src/components/SkeletonPageHeader](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SkeletonPageHeader)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-skeletonpageheader--docs)

## Purpose

The top of a page that is loading. It uses `PageHeader`'s own layout classes, so the eyebrow, title and description take
the same line boxes, the title grows at the same breakpoint (48rem) and the actions wrap under the text the same way.

## When to use

- A page whose title comes from data that is still loading.

## When not to use

- A title you already know: render the real `PageHeader` and load only the rest.

## API

### `SkeletonPageHeader`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `eyebrow` | `boolean` | no | `false` | Draws the eyebrow line above the title. Default `false`. |
| `description` | `boolean` | no | `true` | Draws the description line under the title. Default `true`. |
| `actions` | `number` | no | `0` | Number of action placeholders, each the size of a medium `Button`. Default 0. |
| `still` | `boolean` | no | `false` | Turn the shimmer off. It also stops under `prefers-reduced-motion`. |

Other native element attributes pass through to the root element.

## Types

- `SkeletonPageHeaderProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { eyebrow?: boolean | undefined; description?: boolean | undefined; actions?: number | undefined; still?: boolean | undefined; }`

## Example

```tsx
import { SkeletonPageHeader } from "@lufia/design-system/components/SkeletonPageHeader";

{
  loading ? <SkeletonPageHeader eyebrow actions={1} /> : <PageHeader title={title} actions={actions} />;
}
```

## Accessibility

- Decorative (`aria-hidden`), and a plain `div`: no heading and no landmark until the real `PageHeader` arrives. Name the loading state once for the page, and mark the region `aria-busy="true"`.
- The shimmer comes from `Skeleton`: `transform` only, stopped under `prefers-reduced-motion`, and `still` turns it off.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-radius-control`.

## Stories

- `components-feedback-skeletonpageheader--default`
- `components-feedback-skeletonpageheader--title-only`
- `components-feedback-skeletonpageheader--two-actions`
- `components-feedback-skeletonpageheader--above-loaded`
- `components-feedback-skeletonpageheader--widths`
- `components-feedback-skeletonpageheader--all-themes`
