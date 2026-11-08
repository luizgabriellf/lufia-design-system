# ConfirmDialog

> A modal question that has to be answered, with a destructive variant.

- Status: beta
- Category: Overlays
- Import: `import { ConfirmDialog, useConfirmDialog } from "@lufia/design-system/components/ConfirmDialog"`
- Also from: `@lufia/design-system`
- Source: [src/components/ConfirmDialog](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ConfirmDialog)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-confirmdialog--docs)

## Purpose

A question that has to be answered before anything else can happen: "Delete invoice 2041?" It is a [Modal](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-modal--docs)
with `role="alertdialog"`, two buttons, a destructive variant and a busy state.

## When to use

- An action that is hard or impossible to undo, or whose consequence is not obvious from the button: delete, discard,

## When not to use

- Routine, reversible actions. Prefer doing it and offering **Undo** in a [Toast](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-toast--docs): it is
- Collecting input. Use a Modal with a form.

## Exports

| Name | Kind |
| --- | --- |
| `ConfirmDialog` | component |
| `useConfirmDialog` | hook |

## API

### `ConfirmDialog`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | yes |  | Whether the modal is shown. Controlled: the modal never closes itself, it calls `onClose`. |
| `closeLabel` | `string` | no |  | Accessible name of the close button. Defaults to the provider's `labels.close`. |
| `container` | `Element \| DocumentFragment \| null` | no |  | Where the modal is portaled. Defaults to `document.body`. Pass an element of the same document, for example a preview frame; a container inside another document (an iframe) is not supported. |
| `sheetPlacement` | `"top" \| "bottom"` | no |  | Which edge the phone sheet is anchored to. `bottom` (default) rises from the bottom; `top` hangs from `--lufia-modal-sheet-offset`. |
| `classNames` | `ConfirmDialogClassNames` | no |  | Extra class names for the parts, for an app that attaches its own styles or test selectors. Every part also carries a stable `data-lufia-part` attribute: those of `Modal`, plus `cancel` and `confirm` on the buttons. |
| `size` | `ModalSize \| (string & {})` | no | `"sm"` | Maximum width on screens wider than a phone: a step or any CSS length, as on `Modal`. Default `sm` (not `md`). |
| `title` | `ReactNode` | yes |  | What is being decided, as a question or an action: "Delete invoice 2041?". |
| `message` | `ReactNode` | yes |  | The consequence, in a sentence or two. Read out when the dialog opens. |
| `confirmLabel` | `string` | yes |  | Text of the confirming button. Name the action ("Delete invoice"), not "OK". |
| `cancelLabel` | `string` | yes |  | Text of the cancelling button. |
| `onConfirm` | `() => void` | yes |  |  |
| `onCancel` | `() => void` | yes |  | Cancel button, Escape and a click on the backdrop. Not called while `busy`. |
| `destructive` | `boolean` | no | `false` | The action cannot be undone: the confirm button is styled as dangerous and focus starts on Cancel. |
| `busy` | `boolean` | no | `false` | The confirmed action is running. The dialog refuses to close (no Escape, outside click or Cancel), keeps focus where it is and marks the confirm button `aria-busy`. Clear it when the action settles. |

Other native element attributes pass through to the root element.

### `useConfirmDialog`

A promise-based replacement for `window.confirm()`: ```tsx const { confirm, confirmDialog } = useConfirmDialog(); if (!(await confirm({ title, message, confirmLabel, cancelLabel, destructive: true }))) return; // render {confirmDialog} once in the component's JSX ``` One at a time: a new `confirm()` while one is open settles the first with `false`. Unmounting settles it with `false`.

```ts
useConfirmDialog(): { confirm: (next: ConfirmOptions) => Promise<boolean>; confirmDialog: Element | null; }
```

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `confirm` | `(next: ConfirmOptions) => Promise<boolean>` | yes |  |
| `confirmDialog` | `Element \| null` | yes |  |

## Types

- `ConfirmDialogClassNames`: `ModalClassNames & { cancel?: string | undefined; confirm?: string | undefined; }`
- `ConfirmOptions`: `Pick<ConfirmDialogProps, "className" | "size" | "sheetPlacement" | "classNames"> & { title: ReactNode; message: ReactNode; confirmLabel: string; cancelLabel: string; destructive?: boolean | undefined; }`

## Example

```tsx
import { ConfirmDialog } from "@lufia/design-system/components/ConfirmDialog";

<ConfirmDialog
  open={open}
  title="Delete invoice 2041?"
  message="The invoice and its payment history are removed. This cannot be undone."
  confirmLabel="Delete invoice"
  cancelLabel="Keep invoice"
  destructive
  busy={deleting}
  onConfirm={deleteInvoice}
  onCancel={() => setOpen(false)}
/>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Alert dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/).

- `role="alertdialog"`, named by the title and described by the message, so a screen reader reads both when it opens.
- No close button: the two explicit choices are the way out. Escape still cancels.
- Focus returns to the control that opened it.
- Under `prefers-reduced-motion` the dialog appears at once and the busy spinner stops (the dimmed button and `aria-busy`

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-hover`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-on-solid`, `--lufia-color-status-danger-solid`, `--lufia-color-text-default`, `--lufia-color-text-on-accent`, `--lufia-font-size-md`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-control`, `--lufia-radius-full`, `--lufia-space-2`, `--lufia-space-4`.

## Content guidelines

Title: the question, with the object ("Delete invoice 2041?"). Message: the consequence, one or two sentences. Buttons:
the verb ("Delete invoice" / "Keep invoice"), never "Yes" / "No" or "OK".

## Stories

- `components-overlays-confirmdialog--default`
- `components-overlays-confirmdialog--open-by-default`
- `components-overlays-confirmdialog--destructive`
- `components-overlays-confirmdialog--wide-top-sheet`
- `components-overlays-confirmdialog--part-class-names`
- `components-overlays-confirmdialog--busy`
- `components-overlays-confirmdialog--slow-confirmation`
- `components-overlays-confirmdialog--long-text`
- `components-overlays-confirmdialog--phone`
- `components-overlays-confirmdialog--promise-based`
- `components-overlays-confirmdialog--all-themes`
