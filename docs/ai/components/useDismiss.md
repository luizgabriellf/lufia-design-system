# useDismiss

> Calls back on Escape or an outside press, for popovers and menus.

- Status: beta
- Category: Hooks
- Import: `import { useDismiss } from "@lufia/design-system/components/useDismiss"`
- Also from: `@lufia/design-system`
- Source: [src/components/useDismiss](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useDismiss)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usedismiss--docs)

## Purpose

Closes a non-modal popup (dropdown, menu, popover) when Escape is pressed or the pointer presses outside it.

## When to use

- Menus, dropdowns, popovers and disclosure panels that sit over the page without blocking it.

## When not to use

- Modal overlays. They trap focus and own Escape: use `Modal` or `useFocusTrap`.

## API

### `useDismiss`

Closes a non-modal popup (dropdown, menu, popover) on Escape or a pointer press outside it. Escape returns focus to the `toggle` that opened it. A copy with no layout boxes (a desktop and a phone instance of the same control, one hidden by CSS) never listens, so the two do not close each other.

```ts
useDismiss(open: boolean, close: () => void, root: RefObject<HTMLElement | null>, toggle?: RefObject<HTMLElement | null> | undefined): void
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | yes |  |
| `close` | `() => void` | yes |  |
| `root` | `RefObject<HTMLElement \| null>` | yes |  |
| `toggle` | `RefObject<HTMLElement \| null>` | no |  |

## Example

```tsx
import { useDismiss } from "@lufia/design-system/components/useDismiss";

useDismiss(open, () => setOpen(false), rootRef, toggleRef);
```

## Accessibility

- Escape closes and returns focus to the control that opened the popup (WAI-ARIA APG menu button pattern). The key is
- Tab is not intercepted: leaving the popup by keyboard is allowed, and the consumer decides whether that closes it.
- A hidden copy of the control (same component rendered for desktop and phone, one hidden by CSS) never listens, because

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usedismiss--default`
