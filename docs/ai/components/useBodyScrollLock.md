# useBodyScrollLock

> Locks page scrolling while an overlay is open, without layout shift.

- Status: beta
- Category: Hooks
- Import: `import { isBodyScrollLocked, useBodyScrollLock } from "@lufia/design-system/components/useBodyScrollLock"`
- Also from: `@lufia/design-system`
- Source: [src/components/useBodyScrollLock](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useBodyScrollLock)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usebodyscrolllock--docs)

## Purpose

A hook that locks page scroll while an overlay (modal, drawer, sheet) is open, and restores the scroll position when it
closes. Locks are reference counted, so stacked overlays are safe.

## When to use

- See the Storybook page.

## When not to use

- See the Storybook page.

## Exports

| Name | Kind |
| --- | --- |
| `isBodyScrollLocked` | function |
| `useBodyScrollLock` | hook |

## API

### `isBodyScrollLocked`

Whether any overlay currently holds the lock. For consumers outside the component tree that rendered the overlay (for example a document-level gesture handler). It reads a counter rather than sniffing styles, because the two lock strategies leave different style fingerprints.

```ts
isBodyScrollLocked(): boolean
```

### `useBodyScrollLock`

```ts
useBodyScrollLock(locked: boolean, options?: UseBodyScrollLockOptions): void
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `locked` | `boolean` | yes |  |
| `options` | `UseBodyScrollLockOptions` | no |  |

## Types

- `UseBodyScrollLockOptions`: `{ scrollContainerSelectors?: readonly string[] | undefined; }`

## Example

```tsx
import { useBodyScrollLock } from "@lufia/design-system/components/useBodyScrollLock";

function Modal({ open }: { open: boolean }) {
  useBodyScrollLock(open);
  // ...
}
```

## Accessibility

- Locking scroll does not move focus or trap it. Pair it with a focus trap and `aria-modal` on the dialog.
- The previous scroll position is restored on release, so keyboard and screen-reader users return to where they were.
- It only touches inline styles (`overflow`, `position`, `top`, `width`, `padding-right`, `overscroll-behavior`) and removes them on cleanup,

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usebodyscrolllock--document-scroll`
- `hooks-usebodyscrolllock--inner-scroll-shell`
