# Modal

> A dialog that interrupts the page and traps focus until it is dismissed.

- Status: beta
- Category: Overlays
- Import: `import { Modal, notifyTopModalDialogChanged } from "@lufia/design-system/components/Modal"`
- Also from: `@lufia/design-system`
- Source: [src/components/Modal](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Modal)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-modal--docs)

## Purpose

A dialog that blocks the page behind it until the person answers or dismisses it. Portaled to `document.body`, with focus
containment, scroll lock, an inert background and an enter/exit motion.

## When to use

- A focused task or a decision that must be finished or abandoned before returning to the page: editing a record, picking
- Anything that interrupts and needs an answer: build on it with [ConfirmDialog](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-confirmdialog--docs).

## When not to use

- A message that does not need a response: use a [Toast](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-toast--docs).
- Content the person should be able to compare with the page. A side panel or an inline expansion lets them keep the
- Navigation. If the content has its own URL and is more than a step, make it a page. To make a modal linkable, drive

## Exports

| Name | Kind |
| --- | --- |
| `Modal` | component |
| `notifyTopModalDialogChanged` | function |

## API

### `Modal`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | yes |  | Whether the modal is shown. Controlled: the modal never closes itself, it calls `onClose`. |
| `onClose` | `() => void` | yes |  | Called when the person asks to close: the close button, Escape, or a click outside (see the policy props). |
| `title` | `ReactNode` | yes |  | The dialog's accessible name and visible heading. |
| `description` | `ReactNode` | no |  | Optional supporting text, wired to `aria-describedby`. |
| `size` | `ModalSize \| (string & {})` | no | `"md"` | Maximum width on screens wider than a phone: a step, or any CSS length for a custom maximum inline size (`"62rem"`, `"min(100%, 70ch)"`). On a phone every size is a sheet. Default `md`. |
| `sheetPlacement` | `"bottom" \| "top"` | no | `"bottom"` | Which edge the phone sheet is anchored to. `bottom` (default) rises from the bottom; `top` hangs from `--lufia-modal-sheet-offset`. |
| `titleWrap` | `"wrap" \| "ellipsis"` | no | `"wrap"` | `wrap` (default) lets a long title wrap onto several lines; `ellipsis` keeps it on one line and truncates it. |
| `scrollShadow` | `boolean` | no | `false` | Scroll the body between the fixed header and footer and show an edge shadow where more content is hidden. |
| `keepMounted` | `boolean` | no | `false` | Keep the content mounted while the modal is closed, so typed input and component state survive. The closed modal is hidden and inert; it has no exit animation. |
| `renderAs` | `"portal" \| "dialog"` | no | `"portal"` | `portal` (default) renders a fixed-position layer in a portal. `dialog` renders a native `<dialog>` opened with `showModal()`, which sits in the browser's top layer above everything, including other fixed layers. Focus trap, Escape, scroll lock and the shared layer stack behave the same in both. Differences in `dialog` mode: the page behind is made inert by the browser, not by the package; the exit is not animated; the backdrop is the native `::backdrop`. |
| `classNames` | `ModalClassNames` | no |  | Extra class names for the parts, for an app that attaches its own styles or test selectors. Every part also carries a stable `data-lufia-part` attribute: `layer`, `backdrop`, `frame`, `panel`, `header`, `title`, `description`, `body`, `footer`, `close`. |
| `headerAction` | `ReactNode` | no |  | Extra controls placed beside the close button in the header. |
| `footer` | `ReactNode` | no |  | Content of the footer bar, usually the actions. The bar is left out when this is empty. |
| `closeLabel` | `string` | no |  | Accessible name of the close button. Defaults to the provider's `labels.close`. |
| `hideCloseButton` | `boolean` | no | `false` | Leave out the close button, e.g. when the footer already offers the way out. Escape and outside click still apply. |
| `busy` | `boolean` | no | `false` | An action that dismissing would not abort is in flight. Sets `aria-busy`, disables the close button and refuses every dismissal (Escape, outside click, the close button), so a refused dismissal is perceivable and not a silent no-op. |
| `closeOnEscape` | `boolean` | no | `true` | Escape calls `onClose`. Default `true`. |
| `closeOnOutsideClick` | `boolean` | no | `true` | A click on the backdrop calls `onClose`. Default `true`. Turn it off for forms with unsaved input. |
| `initialFocus` | `"container" \| "first" \| RefObject<HTMLElement \| null>` | no | `"container"` | Where focus lands on open. Default: the dialog itself (named by the title, no keyboard pops up). |
| `role` | `"dialog" \| "alertdialog"` | no | `"dialog"` | `alertdialog` for an interruption that needs an answer (see `ConfirmDialog`). Default `dialog`. |
| `container` | `Element \| DocumentFragment \| null` | no |  | Where the modal is portaled. Defaults to `document.body`. Pass an element of the same document, for example a preview frame; a container inside another document (an iframe) is not supported. |
| `scrollContainerSelectors` | `readonly string[]` | no |  | Inner scroll containers to lock instead of the document, for app shells that scroll an inner pane. |

Other native element attributes pass through to the root element.

### `notifyTopModalDialogChanged`

Tells the store of open modal dialogs to look again. The package calls it itself when it closes or removes a native `Modal` (`renderAs="dialog"`): a dialog React removes is detached before its `open` attribute changes, so the attribute observer cannot see it. Public for an app that opens or closes its own native `<dialog>` and wants anything following the topmost dialog (the `ToastProvider` region that moves into it) to update at once. Cheap and safe to call at any time; it does nothing when nothing is listening.

```ts
notifyTopModalDialogChanged(): void
```

## Types

- `ModalClassNames`: `{ layer?: string | undefined; backdrop?: string | undefined; frame?: string | undefined; panel?: string | undefined; header?: string | undefined; title?: string | undefined; description?: string | undefined; body?: string | undefined; footer?: string | undefined; close?: string | undefined; }`
- `ModalSize`: `"sm" | "md" | "lg" | "xl"`

## Example

```tsx
import { Modal } from "@lufia/design-system/components/Modal";

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Edit project"
  description="Rename the project or change who can see it."
  footer={
    <>
      <button onClick={() => setOpen(false)}>Cancel</button>
      <button onClick={save}>Save changes</button>
    </>
  }
>
  <form>...</form>
</Modal>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Dialog (modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

- `role="dialog"` (or `alertdialog`), `aria-modal="true"`, `aria-labelledby` the title and `aria-describedby` the
- The page behind is made `inert` and page scroll is locked, so neither keyboard, pointer nor screen reader can reach it.
- The dialog is the scroll container, with the header and footer sticky. Long content scrolls with the arrow keys while
- Close button: 36 px on desktop and 44 px on phones. Focus is always visible. Under `forced-colors` the border uses
- Motion uses `--lufia-motion-duration-enter` (240 ms) and `-exit` (160 ms), scale on desktop and rise on phones. Under
- Choose the initial focus deliberately. The default (the dialog) is safe for informational content; for a destructive

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-bg-canvas`, `--lufia-color-bg-surface-raised`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-display`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-weight-semibold`, `--lufia-modal-backdrop`, `--lufia-modal-body-padding`, `--lufia-modal-close-size`, `--lufia-modal-footer-padding`, `--lufia-modal-header-padding`, `--lufia-modal-radius`, `--lufia-modal-scroll-shadow`, `--lufia-modal-sheet-offset`, `--lufia-modal-sheet-radius`, `--lufia-modal-size`, `--lufia-modal-title-size`, `--lufia-motion-distance-rise`, `--lufia-motion-distance-travel`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-md`, `--lufia-radius-panel`, `--lufia-shadow-lg`, `--lufia-space-12`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-space-5`, `--lufia-z-modal`, `--lufia-z-overlay`.

## Content guidelines

Titles say what the dialog is for ("Edit project", "Delete invoice 2041?"), not "Are you sure?". Buttons say what they do
("Save changes"), not "OK". Put the primary action last and the cancel action before it; on phones the order reverses so the
primary action sits on top.

## Stories

- `components-overlays-modal--default`
- `components-overlays-modal--open-by-default`
- `components-overlays-modal--with-description`
- `components-overlays-modal--small`
- `components-overlays-modal--large`
- `components-overlays-modal--extra-large`
- `components-overlays-modal--long-content`
- `components-overlays-modal--long-title`
- `components-overlays-modal--header-action`
- `components-overlays-modal--no-close-button`
- `components-overlays-modal--busy-while-saving`
- `components-overlays-modal--strict-dismissal`
- `components-overlays-modal--focus-first-element`
- `components-overlays-modal--title-ellipsis`
- `components-overlays-modal--scroll-shadow`
- `components-overlays-modal--sticky-content-under-header`
- `components-overlays-modal--custom-size`
- `components-overlays-modal--part-class-names`
- `components-overlays-modal--themed-by-variables`
- `components-overlays-modal--top-sheet-on-phone`
- `components-overlays-modal--native-top-layer`
- `components-overlays-modal--native-keep-mounted`
- `components-overlays-modal--keep-mounted`
- `components-overlays-modal--phone`
- `components-overlays-modal--stacked-modals`
- `components-overlays-modal--all-themes`
