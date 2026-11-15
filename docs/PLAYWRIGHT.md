# Playwright browser tests

Playwright runs the existing Storybook stories in Chromium and WebKit.

## Run locally

```bash
npm ci
npx playwright install chromium webkit
npm run test:browser
```

The test runner starts Storybook on port 6006. An already running local server is reused. In CI it serves the
`storybook-static` the verify job built (`scripts/serve-static.mjs`); set `PW_STATIC=1` after `npm run build-storybook`
to do the same locally.
Use `npm run test:browser:ui` for interactive debugging.

## Coverage

- Modal focus: Shift+Tab from the first focusable wraps to "Save changes", Tab from the last wraps back, Escape closes, and the opener regains focus.
- Combobox inside a modal: Escape closes the list before the dialog.
- Theme: the modal surface background (computed style) differs between light and dark in both themes, and the primary action colour differs between the default and example-brand themes.
- Layout: buttons do not overflow horizontally at 320, 390, 768 and 1440 px; the open modal fits the viewport at 320 and 1440 px.
- Right-to-left: the Storybook `dir` toolbar sets `dir="rtl"` (`globals=dir:rtl`), and the status timeline connector moves to the opposite physical side.
- Page actions breakpoints: `hideBelow`, `primaryPlacement="external"` and the secondary collapse flip at 959/960 and 767/768 px.
- Page actions container collapse: a 49rem host collapses the secondary actions into the menu and a 51rem host keeps them; a narrow-only item is listed in the sheet at 390 px even in a wide host.
- Page actions sheet: at 390 px the `MoreActions` sheet's backdrop covers the viewport, the sheet is anchored to the bottom above a fixed high-z-index dock, a long list scrolls inside it, and Escape returns focus to the trigger.
- Notification center: at 1440 px the bell opens a popover that takes focus, tabs switch the list and Escape returns focus to the bell; at 390 px the panel is a modal sheet above a fixed dock; a long list scrolls inside the panel with the footer in place; the open animation runs and is absent under reduced motion.
- Popover: near the bottom edge the panel flips above the trigger and stays inside the viewport; inside an `overflow: hidden` card it is portalled out and not clipped, and Escape returns focus to the trigger; at 320 px it fits the viewport width.
- Tour: the spotlight surrounds the target and the card sits beside it inside the viewport while the page behind still takes input; arrow keys step and Escape closes; a missing target gives a centred card; at 390 px the card is a docked sheet clear of the target.
- Tour with no target under a modal: with a native `dialog` opened by `showModal()` and the package `Modal` in both `renderAs` variants, the centred card is visible above the modal and its buttons can be clicked.
- Tour above later overlays: a `MoreActions` bottom sheet at 390 px and a portal `Modal` at 1280 px opened after the card is showing do not cover it: `elementFromPoint` at the card buttons returns them, Next and Skip work with a real click, and Tab on the card is not pulled back into the sheet.
- Tour, dock and in-dialog fallback: at 390x844 a `Modal` sheet shorter than the viewport ends where the docked card starts (no target and a target inside it) and its footer buttons take a real click; at 1440x900 the card inside a wide dialog form touches neither the target, its sibling fields nor the footer; at 390 px the ring of a target filling the dialog body ends above the docked card.
- Tour, typing: on a 420 px-high viewport, focusing a field with `compactOnTyping={{ hideBelowHeight }}` hides the card (`data-typing-hidden`) and blurring it brings it back; `placement: "auto"` keeps the card beside the target inside the viewport.
- Select: a long selected label in a 96 px box keeps its computed end padding at least as wide as the chevron, so the text stops before it, in left-to-right and right-to-left.
- Select, compact: the same room for the smaller chevron in the `size="sm"` box, in left-to-right and right-to-left.
- Textarea, auto height: the box grows with its content from `rows`, stops at `maxRows` and scrolls, and shrinks back when emptied.
- Table: `frame="flush"` has no outer border, radius or background at 390 and 1440 px (the header rule stays); a link in the `after` slot is hit by `elementFromPoint` and is not nested in the row control while the rest of the row still hits the control; `--lufia-table-row-scroll-margin` keeps a focused row control below a sticky bar after the browser scrolls it into view.
- Stat tile: at 390 px the button label is at least 24 by 24 px and the tile is no taller than a plain one.

Everything runs in Chromium and WebKit. Failing tests upload screenshots and traces, plus an HTML report, as CI artifacts.

## Design choices

- `retries` is 0. A retry would hide a flaky first attempt, so a flaky test has to be fixed or removed.
- No `toHaveScreenshot` baselines are committed. Pixels depend on the OS, fonts and browser build, so a baseline captured
  locally would fail on CI runners. Computed-style and geometry assertions are deterministic and fail on real regressions.
  Add screenshot baselines only if they are generated in CI itself.
- Locally the suite runs against `storybook dev`, with a 15 s expect timeout for the cold start. CI and `PW_STATIC=1` use the
  built Storybook, which has no cold compile, so the expect timeout is 5 s.
