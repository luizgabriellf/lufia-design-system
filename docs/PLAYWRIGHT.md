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
- Page actions breakpoints: `hideBelow`, `primaryPlacement="external"` and the secondary collapse flip at 959/960 and 767/768 px.
- Page actions sheet: at 390 px the `MoreActions` sheet's backdrop covers the viewport, the sheet is anchored to the bottom above a fixed high-z-index dock, a long list scrolls inside it, and Escape returns focus to the trigger.

Everything runs in Chromium and WebKit. Failing tests upload screenshots and traces, plus an HTML report, as CI artifacts.

## Design choices

- `retries` is 0. A retry would hide a flaky first attempt, so a flaky test has to be fixed or removed.
- No `toHaveScreenshot` baselines are committed. Pixels depend on the OS, fonts and browser build, so a baseline captured
  locally would fail on CI runners. Computed-style and geometry assertions are deterministic and fail on real regressions.
  Add screenshot baselines only if they are generated in CI itself.
- Locally the suite runs against `storybook dev`, with a 15 s expect timeout for the cold start. CI and `PW_STATIC=1` use the
  built Storybook, which has no cold compile, so the expect timeout is 5 s.
