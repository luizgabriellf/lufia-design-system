# useFocusTrap

> Keeps Tab inside a container and restores focus when it closes.

- Status: beta
- Category: Hooks
- Import: `import { getFocusableElements, useFocusTrap } from "@lufia/design-system/components/useFocusTrap"`
- Also from: `@lufia/design-system`
- Source: [src/components/useFocusTrap](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useFocusTrap)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usefocustrap--docs)

## Purpose

Keeps keyboard focus inside an overlay while it is open: Tab and Shift+Tab wrap, Escape can close it, focus moves in when
it opens and returns to the opener when it closes. It is what `Modal` and `ConfirmDialog` are built on.

## When to use

- Any overlay that blocks the page behind it: dialogs, drawers, sheets.

## When not to use

- Non-modal popovers, menus and dropdowns. They close on Escape or an outside press and let Tab leave; use a dismiss
- A native `<dialog>` opened with `showModal()`. The browser already traps focus.

## Exports

| Name | Kind |
| --- | --- |
| `getFocusableElements` | function |
| `useFocusTrap` | hook |

## API

### `getFocusableElements`

The tabbable descendants of `root`, in DOM order. Not `offsetParent`-based: that is `null` for fixed-position children.

```ts
getFocusableElements(root: HTMLElement): HTMLElement[]
```

### `useFocusTrap`

Contains Tab and Shift+Tab inside `ref`'s subtree while `open` is true, optionally closes on Escape, moves focus in when it opens and puts it back where it was when it closes. Follows the WAI-ARIA APG "Dialog (Modal)" pattern. Only the topmost layer reacts (see `useDismiss`: a popup inside the overlay counts as a layer), so nested overlays and popups close one at a time.

```ts
useFocusTrap(open: boolean, ref: RefObject<HTMLElement | null>, { onEscape, initialFocus, restoreFocus, inertBackground: inert, }?: UseFocusTrapOptions): void
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | yes |  |
| `ref` | `RefObject<HTMLElement \| null>` | yes |  |
| `__2` | `UseFocusTrapOptions` | no |  |

## Example

```tsx
import { useFocusTrap } from "@lufia/design-system/components/useFocusTrap";

function Panel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref, { onEscape: onClose });
  return open ? (
    <div ref={ref} role="dialog" aria-label="Filters" tabIndex={-1}>
      ...
    </div>
  ) : null;
}
```

## Accessibility

- The default `initialFocus` is the container, which needs a name (`aria-label` or `aria-labelledby`) and `tabIndex={-1}`.
- Tabbable elements are found by selector and visibility (`hidden`, `inert`, `display: none`, `visibility: hidden` are
- On close, whatever is focused is blurred first (iOS Safari resets its zoom on a real blur), then focus is restored. If
- Pair it with `aria-modal="true"` on the dialog; `inertBackground` makes the effect real for browsers and assistive

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usefocustrap--focus-container`
- `hooks-usefocustrap--focus-first-element`
- `hooks-usefocustrap--no-focus-restore`
