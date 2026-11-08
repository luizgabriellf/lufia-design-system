# Skeleton

> A placeholder with the shape of the content that is loading.

- Status: beta
- Category: Motion
- Import: `import { Skeleton } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/Skeleton](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/Skeleton)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-skeleton--docs)

## Purpose

A placeholder that holds the shape of content while it loads, with a calm shimmer.

## When to use

- A region whose layout is known while its data is pending: cards, lists, table rows, profile headers.

## When not to use

- Unknown shape or very short waits (under about 300 ms): show nothing, or a spinner on the triggering control.
- Errors or empty results: use an error message or [EmptyState](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-emptystate--docs).

## API

### `Skeleton`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `"text" \| "rect" \| "circle"` | no | `"text"` | `text` is one line of text, `rect` a block, `circle` an avatar. |
| `width` | `string` | no |  | CSS length. Give the size of the content that will replace the placeholder so nothing jumps. |
| `height` | `string` | no |  | CSS length. Text defaults to one line height. |
| `still` | `boolean` | no | `false` | Turn the shimmer off. It also stops under `prefers-reduced-motion`. |
| `label` | `string` | no |  | Accessible name for the loading state, for example "Loading invoices". Set it on one skeleton per loading region: it renders a polite status message. Without it the skeleton is hidden from assistive technology. |

Other native element attributes pass through to the root element.

## Types

- `SkeletonProps`: `Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { variant?: "text" | "rect" | "circle" | undefined; width?: string | undefined; height?: string | undefined; still?: boolean | undefined; label?: string | undefined; }`

## Example

```tsx
import { Skeleton } from "@lufia/design-system/motion";

<div aria-busy={loading}>
  {loading ? (
    <>
      <Skeleton width="60%" />
      <Skeleton variant="rect" height="6rem" label="Loading profile" />
    </>
  ) : (
    <Profile />
  )}
</div>;
```

## Accessibility

- Skeletons are `aria-hidden` by default. Set `label` on **one** skeleton per loading region: it renders a polite `role="status"` message ("Loading profile"). The string is yours, so it can be translated.
- Mark the region `aria-busy="true"` while loading.
- The shimmer is `transform` only, and it stops under `prefers-reduced-motion` (the shape stays). `still` turns it off everywhere.
- In `forced-colors` mode the skeleton becomes an outlined box and the shimmer is removed.
- No information is carried by the motion.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-color-bg-surface-solid`, `--lufia-color-border-subtle`, `--lufia-radius-card`, `--lufia-radius-full`, `--lufia-radius-sm`.

## Stories

- `components-motion-skeleton--text`
- `components-motion-skeleton--rect`
- `components-motion-skeleton--circle`
- `components-motion-skeleton--still`
- `components-motion-skeleton--composed`
- `components-motion-skeleton--all-themes`
