# Tour

> A non-modal guided tour: a card that walks through steps with a spotlight on each target, while the page stays usable.

- Status: beta
- Category: Overlays
- Import: `import { Tour } from "@lufia/design-system/components/Tour"`
- Also from: `@lufia/design-system`
- Source: [src/components/Tour](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Tour)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-overlays-tour--docs)

## Purpose

A guided tour: a card that walks through a list of steps, with a spotlight on each step's target. It is non-modal. The
spotlight only dims the page around the target; it does not block it, so the person can use the highlighted control, or any
other, while the card stays on screen. Nothing is made inert and page scroll is not locked.

## When to use

- Introducing a screen's main controls once, the first time a person visits it.
- A short, optional walkthrough that can be reopened from a help menu.

## When not to use

- Instructions the person needs to complete a task: put them next to the control, in help text.
- A choice or a question: use `Modal` or `ConfirmDialog`.
- Anchored content without steps: use `Popover`.
- Anything long. Keep a tour to about five steps and let the person skip it.

## API

### `Tour`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `steps` | `readonly TourStep[]` | yes |  |  |
| `open` | `boolean` | yes |  | Whether the tour is showing. The app decides when it starts and remembers that it was seen. |
| `stepIndex` | `number` | no |  | The current step, zero-based. Controlled; pair it with `onStepChange`. |
| `defaultStepIndex` | `number` | no | `0` | The step a tour that manages its own state starts on each time it opens. Default `0`. |
| `onStepChange` | `(index: number) => void` | no |  | Called with the next step when the buttons or the arrow keys move. |
| `onClose` | `(reason: TourCloseReason) => void` | no |  | Called when the person leaves early. The tour does not close itself: set `open` to `false`. |
| `onFinish` | `() => void` | no |  | Called when the person finishes the last step. Set `open` to `false` here. |
| `labels` | `TourLabels` | yes |  |  |
| `spotlightPadding` | `number` | no | `6` | Space between the target and the edge of the spotlight, in pixels. Default `6`. |
| `targetStatus` | `"ready" \| "seeking" \| "missing" \| "blocked"` | no | `"ready"` | The status of the current step's target, supplied by the host. Default `ready`. |
| `resolveTarget` | `(step: TourStep) => Element \| null` | no |  | Finds a step's target in place of (and before) `target`. Return `null` to fall back to `target`. Called on every frame while the tour shows, so keep it cheap. It receives the current step. |
| `isStandIn` | `(element: Element, step: TourStep) => boolean` | no |  | Tells the tour that the resolved element only stands in for the real target, so `standInNote` is appended. |
| `dialogLayout` | `TourDialogLayout` | no |  | Layout switches for a target inside an open modal `dialog`. |
| `compactOnTyping` | `boolean \| { hideBelowHeight: number; }` | no | `false` | Below 40rem, while a text field outside the card has focus, set `data-compact` on the card (CSS then hides the body, the hint, the note and the step counter, leaving the title, the close button and the actions) so the card does not cover the field being filled. It settles 300 ms after focus leaves and never changes mid-press. Default `false`. Pass `{ hideBelowHeight }` to also hide the card entirely while the field has focus and the visual viewport is shorter than that many pixels (an on-screen keyboard on a short phone). The card then has `data-typing-hidden` and is `display: none`: it leaves the accessibility tree and the tab order until typing stops or the viewport grows back (the step counter is still announced through the live region). `true` only compacts. |
| `showCloseButton` | `boolean` | no | `true` | Whether the card has its close button. Default `true`. |
| `skipOnLastStep` | `boolean` | no | `false` | Keep the skip button (`labels.skip`, calling `onClose("skip")`) on the last step, next to the finish button, so a host that always offers an explicit leave action keeps it there. Default `false`. Independently of this prop, a last step in `do` mode shows the skip button when `showCloseButton` is `false`, because that step has no finish button and would otherwise have no action at all. |
| `closeOnEscape` | `boolean` | no | `true` | Whether Escape calls `onClose("escape")`. Default `true`. |
| `arrowKeyNavigation` | `boolean` | no | `true` | Whether the arrow keys step while focus is on the card. Default `true`. |

Other native element attributes pass through to the root element.

## Types

- `TourCloseReason`: `"skip" | "close" | "escape"`
- `TourDialogLayout`: `{ dock?: boolean | undefined; beside?: boolean | undefined; clipSpotlight?: boolean | undefined; }`
- `TourLabels`: `{ next: string; back: string; skip: string; close: string; finish: string; stepOf: (current: number, total: number) => string; doHint?: string | undefined; skipStep?: string | undefined; seeking?: string | undefined; blocked?: string | undefined; }`
- `TourStep`: `{ target?: string | RefObject<Element | null> | undefined; title: ReactNode; body: ReactNode; placement?: "auto" | Side | undefined; mode?: "read" | "do" | undefined; missingBody?: ReactNode; standInNote?: ReactNode; }`
- `TourTargetStatus`: `"ready" | "seeking" | "missing" | "blocked"`

## Example

```tsx
import { Tour } from "@lufia/design-system/components/Tour";

<Tour
  open={open}
  steps={[
    { target: '[data-tour="search"]', title: "Find anything", body: "Type a name or a number." },
    { target: searchButtonRef, title: "Narrow it down", body: "Filters stay in place.", placement: "bottom" },
    { title: "That is all", body: "Open this tour again from the help menu." },
  ]}
  labels={{
    next: "Next",
    back: "Back",
    skip: "Skip tour",
    close: "Close tour",
    finish: "Done",
    stepOf: (current, total) => `Step ${current} of ${total}`,
  }}
  onFinish={() => {
    markSeen();
    setOpen(false);
  }}
  onClose={(reason) => {
    markDismissed(reason);
    setOpen(false);
  }}
/>;
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Right / Left arrow | Focus on the card \| Next / previous step (reversed in right-to-left text); an arrow key never finishes the tour |
| Escape | Card or no focus \| Calls `onClose("escape")` |
| Tab / Shift+Tab | Card \| Moves between the card's buttons; focus is not trapped |
| Enter / Space | A button \| Activates it |

- The card is `role="dialog"` with `aria-modal="false"`, named by the step title and described by its body. The page behind stays in the accessibility tree and operable.
- Each step moves focus to the card's heading (without scrolling the page) so a screen reader reads the new step. A hidden polite status region announces the counter from `labels.stepOf` when the step changes.
- Closing from the card hands focus back to the element that had it when the tour opened, when that element is still in the page.
- The spotlight and the dimming are decoration (`aria-hidden`) and never the only signal: the card says what the step is about. In forced-colors mode the spotlight is a `Highlight` border and the card border is `CanvasText`.
- The card is portalled to the end of the body, so the browser's Tab order leaves it at the end of the page; the arrow keys and the buttons are the way through the steps.
- A sheet, menu or dialog opened after the tour started sits below the card (`--lufia-tour-z`). The package's inert page skips the tour layer, so the card stays operable by pointer. The overlay's focus trap still owns Tab and Shift+Tab while focus is inside the overlay, so the card is not in the keyboard path then; once focus is on the card (a press on one of its buttons) Tab follows the browser's order instead of being pulled back. A step whose target is outside such an overlay stays on `document.body`; a step with no target is hosted in the topmost open modal, as above.
- The card and its content fade in; the spotlight glides between targets. Under reduced motion both appear without motion and scrolling is not smooth.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-canvas`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-distance-rise`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-in-out`, `--lufia-motion-easing-out`, `--lufia-radius-md`, `--lufia-radius-panel`, `--lufia-shadow-lg`, `--lufia-space-2`, `--lufia-space-4`, `--lufia-tour-card-inline-size`, `--lufia-tour-scrim`, `--lufia-tour-z`, `--lufia-z-tour`.

## Content guidelines

Titles say what the control is for ("Find anything"). Bodies are one or two short sentences. Always offer `skip` and `close`
through `labels`, and never start a tour the person did not ask for more than once.

## Stories

- `components-overlays-tour--default`
- `components-overlays-tour--second-step`
- `components-overlays-tour--placed-at-start`
- `components-overlays-tour--centred-card`
- `components-overlays-tour--missing-target`
- `components-overlays-tour--closed`
- `components-overlays-tour--phone-390`
- `components-overlays-tour--phone-320`
- `components-overlays-tour--right-to-left`
- `components-overlays-tour--inside-a-modal`
- `components-overlays-tour--do-step`
- `components-overlays-tour--do-step-missing`
- `components-overlays-tour--seeking`
- `components-overlays-tour--blocked`
- `components-overlays-tour--custom-target`
- `components-overlays-tour--compact-while-typing`
- `components-overlays-tour--skip-on-last-step`
- `components-overlays-tour--last-do-step-no-close`
- `components-overlays-tour--switches-off`
- `components-overlays-tour--beside-the-dialog`
- `components-overlays-tour--docked-dialog`
- `components-overlays-tour--docked-modal`
- `components-overlays-tour--docked-portal-modal`
- `components-overlays-tour--no-target-in-native-dialog`
- `components-overlays-tour--no-target-in-dialog-modal`
- `components-overlays-tour--no-target-in-portal-modal`
- `components-overlays-tour--no-target-among-closed-kept-modals`
- `components-overlays-tour--no-target-docked-phone`
- `components-overlays-tour--no-target-beside-modal`
- `components-overlays-tour--hidden-while-typing-on-short-viewport`
- `components-overlays-tour--auto-placement`
- `components-overlays-tour--focus-after-seeking`
- `components-overlays-tour--overlay-opened-after-tour`
- `components-overlays-tour--overlay-opened-after-tour-phone-390`
- `components-overlays-tour--short-sheet-no-target`
- `components-overlays-tour--short-sheet-target`
- `components-overlays-tour--wide-dialog-form`
- `components-overlays-tour--target-fills-dialog-body`
