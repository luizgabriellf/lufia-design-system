# Reveal

> Fades and lifts content in as it enters, once.

- Status: beta
- Category: Motion
- Import: `import { Reveal } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/Reveal](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/Reveal)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-reveal--docs)

## Purpose

Mounts and unmounts content with an enter and an exit animation. Entrances use `--lufia-motion-duration-enter`, exits the
shorter `--lufia-motion-duration-exit`.

## When to use

- A notice, panel or row that appears or disappears because of something the person did.

## When not to use

- Content that changes height in place: use [Collapse](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-collapse--docs).
- Content that is on screen from the first paint. `Reveal` does not animate on mount unless you set `appear`: only real
- Dialogs and popovers. They need focus management that belongs to their own components.

## API

### `Reveal`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `show` | `boolean` | yes |  | Whether the content is shown. Toggling it plays the enter or exit animation. |
| `variant` | `"scale" \| "fade" \| "rise"` | no | `"fade"` | `fade` changes opacity only, `rise` also moves the content up, `scale` grows it slightly. |
| `appear` | `boolean` | no | `false` | Play the enter animation when the component mounts already shown. Off by default: only real changes animate. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { Reveal } from "@lufia/design-system/motion";

<Reveal show={saved} variant="rise">
  <Banner>Changes saved</Banner>
</Reveal>;
```

## Accessibility

- Under `prefers-reduced-motion` the content appears and disappears at once.
- Nothing is conveyed by the motion alone: the content is in the DOM and the accessibility tree whenever it is shown.
- If the content is an important status, put it in (or wrap it with) a live region so it is announced. `Reveal` adds no
- During the exit the content is no longer clickable (`pointer-events: none`), but it is still focusable for the 160 ms

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-motion-distance-rise`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`.

## Stories

- `components-motion-reveal--default`
- `components-motion-reveal--fade`
- `components-motion-reveal--scale`
- `components-motion-reveal--starts-hidden`
- `components-motion-reveal--appears-on-mount`
- `components-motion-reveal--all-themes`
