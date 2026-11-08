# SkeletonCard

> A loading card: title bar, text lines and an optional block in the card's padding.

- Status: beta
- Category: Feedback
- Import: `import { SkeletonCard } from "@lufia/design-system/components/SkeletonCard"`
- Also from: `@lufia/design-system`
- Source: [src/components/SkeletonCard](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SkeletonCard)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-skeletoncard--docs)

## Purpose

A `Card` that is loading: a title bar, text lines and an optional block, drawn inside the card's own padding box, so the
loaded card takes exactly its place.

## When to use

- A grid or a stack of cards whose content is loading.

## When not to use

- A key figure: `StatTile` has its own `loading` state that keeps the tile's exact height.
- A detail section with a known layout of its own: compose `Skeleton` inside that section.

## API

### `SkeletonCard`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | no |  | Inner spacing of every slot. Defaults to `md`. |
| `header` | `boolean` | no | `true` | Draws a title bar on the line box of the card's title, spaced from the body like the card's header. Default `true`. |
| `lines` | `number` | no | `3` | Number of body text lines. The last one is shorter, like the end of a paragraph. Default 3. |
| `block` | `string \| boolean` | no | `false` | A block under the lines, for a chart or a media area: `true` for 6rem, or a CSS height. Default `false`. |
| `still` | `boolean` | no | `false` | Turn the shimmer off. It also stops under `prefers-reduced-motion`. |

Other native element attributes pass through to the root element.

## Types

- `SkeletonCardProps`: `Omit<CardProps, "children" | "href" | "title" | "headingLevel" | "description" | "headerAction" | "footer" | "flush" | "divider"> & { header?: boolean | undefined; lines?: number | undefined; block?: string | boolean | undefined; still?: boolean | undefined; }`

## Example

```tsx
import { SkeletonCard } from "@lufia/design-system/components/SkeletonCard";

<div aria-busy={loading}>{loading ? <SkeletonCard lines={2} block /> : <StorageCard />}</div>;
```

## Accessibility

- The card is decorative (`aria-hidden`) and has no heading. Name the loading state once for the region, for example with a `Skeleton` that has a `label`, and mark the region `aria-busy="true"`.
- The shimmer comes from `Skeleton`: `transform` only, stopped under `prefers-reduced-motion`, and `still` turns it off.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-font-family-display`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`.

## Stories

- `components-feedback-skeletoncard--default`
- `components-feedback-skeletoncard--with-block`
- `components-feedback-skeletoncard--block-only`
- `components-feedback-skeletoncard--beside-loaded`
- `components-feedback-skeletoncard--paddings`
- `components-feedback-skeletoncard--widths`
- `components-feedback-skeletoncard--all-themes`
