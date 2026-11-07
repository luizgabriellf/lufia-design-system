# Toast

> A transient message that confirms an action without taking focus.

- Status: beta
- Category: Feedback
- Import: `import { ToastProvider, useOptionalToast, useToast } from "@lufia/design-system/components/Toast"`
- Also from: `@lufia/design-system`
- Source: [src/components/Toast](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Toast)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-toast--docs)

## Purpose

Short, non-blocking notifications that stack in a corner of the screen, are announced to screen readers, close by
themselves and wait while they are hovered or focused. Mount `ToastProvider` once, call `useToast()` anywhere below.

## When to use

- Confirming something the person just did that needs no decision: saved, copied, sent, restored.
- Reporting a background result they might have missed: sync finished, upload failed.
- Offering **Undo** right after a reversible action. It is better than a confirmation dialog.

## When not to use

- Anything that must be answered or read before moving on: use [ConfirmDialog](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-confirmdialog--docs)
- Information the person will need again (instructions, a long explanation). Put it on the page.
- More than one at a time for the same outcome: identical string messages are de-duplicated, and `limit` caps the stack.

## Exports

| Name | Kind |
| --- | --- |
| `ToastProvider` | component |
| `useOptionalToast` | hook |
| `useToast` | hook |

## API

### `ToastProvider`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  |  |
| `placement` | `"bottom-end" \| "bottom-start" \| "top-end" \| "top-start"` | no | `"bottom-end"` | Corner of the viewport the stack sits in. Default `bottom-end`. |
| `limit` | `number` | no | `5` | The most toasts shown at once; older ones leave first. Default 5. |
| `duration` | `number` | no | `DEFAULT_DURATION_MS` | Default time before a toast closes, in ms. Default 5000. Errors and toasts with an action stay until dismissed. |
| `container` | `Element \| "auto" \| null` | no | `"auto"` | Where the notification region is rendered. `"auto"` (default) hosts it inside the topmost open modal `<dialog>` while there is one, so toasts stay visible above a native top-layer dialog (a `Modal` with `renderAs="dialog"`), and in `document.body` otherwise. Pass an element to always render there, or `null` for `document.body` only. |
| `toneAliases` | `Readonly<Record<string, ToastTone>>` | no |  | Names an app uses for tones, mapped to built-in ones: `{ ok: "success", warn: "warning" }`. |

### `useOptionalToast`

The toast API when rendered inside a `ToastProvider`, otherwise `null`: for code that may run outside one.

```ts
useOptionalToast(): ToastApi | null
```

### `useToast`

Show and dismiss notifications. Must be used inside a `ToastProvider`.

```ts
useToast(): ToastApi
```

## Types

- `ToastAction`: `{ label: string; onAction: () => void; }`
- `ToastOptions`: `{ message: ReactNode; tone?: ToastToneName | undefined; action?: ToastAction | undefined; duration?: number | null | undefined; id?: string | undefined; }`
- `ToastPlacement`: `"bottom-end" | "bottom-start" | "top-end" | "top-start"`
- `ToastProviderProps`: `{ children: ReactNode; placement?: ToastPlacement | undefined; limit?: number | undefined; duration?: number | undefined; container?: Element | "auto" | null | undefined; toneAliases?: Readonly<Record<string, ToastTone>> | undefined; }`
- `ToastTone`: `"info" | "success" | "warning" | "error"`
- `ToastToneName`: `(string & {}) | ToastTone`

## Example

```tsx
import { ToastProvider, useToast } from "@lufia/design-system/components/Toast";

// once, near the root (inside LufiaProvider if you translate the aria labels)
<ToastProvider placement="bottom-end">{children}</ToastProvider>;

// anywhere below
const toast = useToast();
toast.success("Changes saved.");
toast.error("Upload failed.");
toast.info("Invoice moved to the trash.", { action: { label: "Undo", onAction: restore } });
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/).

- Announcing is separate from showing. Visually hidden live regions (`role="alert"` for errors, `role="status"` for the
- In tests the copy means `getByText` can find the message twice. Assert what is announced with `getByRole("status")`
- Keyboard: toasts are reached in DOM order with Tab; each has its action (if any) and a dismiss button. Escape on a
- The notification region stays live while a [Modal](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-modal--docs) is open (the modal marks the rest
- Targets: the dismiss button and action are at least 28 px tall (WCAG 2.5.8 asks for 24 px).
- Motion: enter 240 ms and exit 160 ms, `transform` and `opacity` only, direction follows the placement. Under
- Colour is never the only signal: each tone has its own icon, and the message says what happened. Under `forced-colors`
- Not recorded yet: a manual VoiceOver and NVDA pass (required before `stable`).

## Motion

| Toast                         | Closes by itself?                                       |
| ----------------------------- | ------------------------------------------------------- |
| `info`, `success`, `warning`  | After `duration` (5 s).                                 |
| `error`                       | Never, unless `duration` says so.                       |
| Any toast with an `action`    | Never, unless `duration` says so.                       |
| Any toast, hovered or focused | Paused; resumes with at least 1.5 s left when released. |

This follows WCAG 2.2.1 (Timing Adjustable): errors carry the most important and often the longest text, and an action
needs time to be found.

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface-raised`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-fg`, `--lufia-color-status-neutral-bg`, `--lufia-color-status-success-bg`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-size-md`, `--lufia-font-weight-semibold`, `--lufia-motion-distance-slide`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-in`, `--lufia-motion-easing-out`, `--lufia-radius-card`, `--lufia-radius-full`, `--lufia-radius-md`, `--lufia-shadow-md`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-space-5`, `--lufia-space-6`, `--lufia-toast-border-width`, `--lufia-toast-icon-size`, `--lufia-toast-offset-block`, `--lufia-toast-radius`, `--lufia-z-toast`.

## Content guidelines

One sentence, past tense for results ("Changes saved."), the object for failures ("Upload failed. Check your connection
and try again."). Say what to do after an error. Actions are a verb ("Undo", "Retry"). Never put a link that leads
somewhere in a toast that vanishes.

## Stories

- `components-feedback-toast--default`
- `components-feedback-toast--all-tones`
- `components-feedback-toast--top-start`
- `components-feedback-toast--long-message`
- `components-feedback-toast--phone`
- `components-feedback-toast--above-a-native-dialog`
- `components-feedback-toast--tone-aliases`
- `components-feedback-toast--above-a-modal`
