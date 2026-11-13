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

Other native element attributes pass through to the root element.

## Types

- `TourCloseReason`: `"skip" | "close" | "escape"`
- `TourLabels`: `{ next: string; back: string; skip: string; close: string; finish: string; stepOf: (current: number, total: number) => string; }`
- `TourStep`: `{ target?: string | RefObject<Element | null> | undefined; title: ReactNode; body: ReactNode; placement?: Side | undefined; }`

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
- The card and its content fade in; the spotlight glides between targets. Under reduced motion both appear without motion and scrolling is not smooth.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-canvas`, `--lufia-color-bg-surface-solid`, `--lufia-color-border-strong`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-distance-rise`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-exit`, `--lufia-motion-easing-in`, `--lufia-motion-easing-in-out`, `--lufia-motion-easing-out`, `--lufia-overlay-z`, `--lufia-radius-md`, `--lufia-radius-panel`, `--lufia-shadow-lg`, `--lufia-space-2`, `--lufia-space-4`, `--lufia-tour-card-inline-size`, `--lufia-tour-scrim`, `--lufia-z-modal`.

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
