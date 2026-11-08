# useFocusTrap

> Keeps Tab inside a container and restores focus when it closes.

- Status: beta
- Category: Hooks
- Import: `import { getFocusableElements, hasOpenOverlay, isTopOverlayLayer, overlayDepth, registerOverlayLayer, useFocusTrap } from "@lufia/design-system/components/useFocusTrap"`
- Also from: `@lufia/design-system`
- Source: [src/components/useFocusTrap](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useFocusTrap)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usefocustrap--docs)

## Purpose

Keeps keyboard focus inside an overlay while it is open: Tab and Shift+Tab wrap, Escape can close it, focus moves in when
it opens and returns to the opener when it closes. It is what `Modal` and `ConfirmDialog` are built on.

## When to use

- Any overlay that blocks the page behind it: dialogs, drawers, sheets.

## When not to use

- Non-modal popovers, menus and dropdowns. They close on Escape or an outside press and let Tab leave; use a dismiss helper instead.
- A native `<dialog>` opened with `showModal()`. The browser already traps focus.

## Exports

| Name | Kind |
| --- | --- |
| `getFocusableElements` | function |
| `hasOpenOverlay` | function |
| `isTopOverlayLayer` | function |
| `overlayDepth` | function |
| `registerOverlayLayer` | function |
| `useFocusTrap` | hook |

## API

### `getFocusableElements`

The tabbable descendants of `root`, in keyboard Tab order. Not `offsetParent`-based: that is `null` for fixed-position children. Positive tabindex values precede the natural DOM order; negative tabindex values are only programmatically focusable.

```ts
getFocusableElements(root: HTMLElement): HTMLElement[]
```

### `hasOpenOverlay`

Whether any layer is open on the shared overlay stack. The same as `overlayDepth() > 0`. Use it to leave a global shortcut or an outside-press handler alone while a dialog or popup is open. Read-only and not reactive.

```ts
hasOpenOverlay(): boolean
```

### `isTopOverlayLayer`

Whether `layer` is the topmost registered layer. Same as `layer.isTop()`.

```ts
isTopOverlayLayer(layer: OverlayLayer): boolean
```

### `overlayDepth`

How many layers are open on the shared overlay stack right now: package modals and traps, dismissable popups that registered through `useDismiss`, and any layer an app registered with `registerOverlayLayer`. `0` when nothing is open. A read-only snapshot, not reactive: call it when you need it (in an event handler, in a key handler), not during render. Read it here instead of reaching for the `globalThis.__lufiaOverlayStack` key, which is an implementation detail.

```ts
overlayDepth(): number
```

### `registerOverlayLayer`

Pushes a layer onto the stack shared by `useFocusTrap`, `useDismiss` and every other overlay that registers here, and returns a handle. Use it to make an overlay the package does not own (an app's legacy modal or trap) take part: the package's traps then leave Escape and Tab alone while it is on top, and it can ask `isTop()` before handling them itself. Release it when the overlay closes. Registering again moves a layer to the top, so register once per open (an effect keyed on `open` only), not on every render. A legacy overlay portaled into `document.body` above a package `Modal` must carry `data-lufia-inert-exempt`, otherwise the Modal makes it `inert` with the rest of the page.

```ts
registerOverlayLayer(): OverlayLayer
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

## Types

- `OverlayLayer`: `{ isTop: () => boolean; release: () => void; }`
- `UseFocusTrapOptions`: `{ onEscape?: (() => void) | undefined; initialFocus?: RefObject<HTMLElement | null> | "container" | "first" | undefined; restoreFocus?: boolean | undefined; inertBackground?: boolean | undefined; }`

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

- The default `initialFocus` is the container, which needs a name (`aria-label` or `aria-labelledby`) and `tabIndex={-1}`. It avoids opening a mobile keyboard and never picks an action for the person. For a destructive confirmation, point `initialFocus` at the safe button.
- Tabbable elements are found by selector and visibility (`hidden`, `inert`, `display: none`, `visibility: hidden` are skipped). Fixed-position children count.
- On close, whatever is focused is blurred first (iOS Safari resets its zoom on a real blur), then focus is restored. If something moved focus elsewhere on purpose in the meantime, it is left alone.
- Pair it with `aria-modal="true"` on the dialog; `inertBackground` makes the effect real for browsers and assistive technologies that ignore `aria-modal`.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usefocustrap--focus-container`
- `hooks-usefocustrap--focus-first-element`
- `hooks-usefocustrap--no-focus-restore`
