# Collapse

> Animates the height of content that opens and closes.

- Status: beta
- Category: Motion
- Import: `import { Collapse } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/Collapse](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/Collapse)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-collapse--docs)

## Purpose

Expands and collapses content to its natural height. It is the one place the package animates a layout property, and it
does so without measuring anything in JavaScript (`grid-template-rows` from `0fr` to `1fr`).

## When to use

- Disclosures, accordions, "show more" areas, inline filter panels.

## When not to use

- Do not animate `height` or `max-height` yourself for the same purpose. `verify-motion` flags it, and `Collapse` is the approved route.
- Content that should leave the page entirely: use [Reveal](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-reveal--docs).

## API

### `Collapse`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | yes |  | Whether the content is expanded. |

Other native element attributes pass through to the root element.

## Types

- `CollapseProps`: `HTMLAttributes<HTMLDivElement> & { open: boolean; }`

## Example

```tsx
import { Collapse } from "@lufia/design-system/motion";

<button type="button" aria-expanded={open} aria-controls="shipping" onClick={() => setOpen(!open)}>
  Shipping details
</button>
<Collapse id="shipping" open={open}>
  Orders ship within two working days.
</Collapse>;
```

## Accessibility

- The trigger is yours. It must be a button with `aria-expanded` and `aria-controls` pointing at the `id` you pass.
- While closed the content is `inert` and `visibility: hidden`: it cannot receive focus and is not read by screen readers, but it is still in the server-rendered HTML.
- Opening and closing are instant under `prefers-reduced-motion`.
- The inner wrapper clips overflow while animating and when open; leave room for focus rings of controls at its edge.
- Browsers without `grid-template-rows` transitions (older than 2023) still work: the panel snaps open and closed.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in-out`.

## Stories

- `components-motion-collapse--closed`
- `components-motion-collapse--open`
- `components-motion-collapse--long-content`
- `components-motion-collapse--all-themes`
