# usePrefersReducedMotion

> Reads the reduced-motion preference, for code that animates in JavaScript.

- Status: beta
- Category: Hooks
- Import: `import { usePrefersReducedMotion } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/usePrefersReducedMotion](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/usePrefersReducedMotion)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-useprefersreducedmotion--docs)

## Purpose

Returns `true` while the operating system asks for reduced motion (`prefers-reduced-motion: reduce`) and follows the
setting when it changes.

## When to use

- Motion CSS cannot switch off by itself: `requestAnimationFrame` loops, the Web Animations API, scroll-driven effects,

## When not to use

- Plain CSS transitions and keyframes. Give them `--lufia-motion-*` tokens, which collapse by themselves, or add a

## API

### `usePrefersReducedMotion`

Whether the user asked the system for reduced motion (`prefers-reduced-motion: reduce`). Follows runtime changes. Use it for motion that CSS cannot switch off by itself: `requestAnimationFrame` loops, the Web Animations API, or deciding whether to wait for an exit animation before unmounting.

```ts
usePrefersReducedMotion(): boolean
```

## Example

```tsx
import { usePrefersReducedMotion } from "@lufia/design-system/motion";

const reduced = usePrefersReducedMotion();
if (reduced) showFinalState();
```

## Accessibility

- Reduced motion means _less_ motion, not none of the information: render the final state, do not hide the change.
- On the server the hook returns `false` (full motion), because the preference is unknown. React re-reads the real value
- Without `matchMedia` (old environments, some test runners) it returns `false`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-useprefersreducedmotion--default`
