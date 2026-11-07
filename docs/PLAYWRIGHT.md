# Browser tests (Playwright)

Playwright runs the real Storybook stories in Chromium and WebKit, covering keyboard behavior that jsdom alone cannot verify.

## Run locally

```bash
npm ci
npx playwright install chromium webkit
npm run test:browser
```

The Playwright config starts Storybook automatically on port 6006. If it is already running locally, that server is reused. For interactive debugging, run `npm run test:browser:ui`.

## Current coverage

- Modal: keyboard focus, Escape to close, and focus restoration.
- Combobox inside Modal: Escape closes the combobox before the enclosing dialog.
- Visual captures: Button states at widths 320, 390, 768 and 1440, plus open Modal at 320 and 1440, across both Storybook themes and both color modes.
- Browsers: Chromium and WebKit, exercising both standard desktop behavior and Safari's rendering engine.

Every capture is attached to the Playwright HTML report; failed tests also retain traces. GitHub Actions uploads `playwright-report/` and `test-results/` for inspection.

**Visual baseline status:** Screenshots are *captured* but are **not yet pixel-diff assertions**. This initial step deliberately does not manufacture golden images: reference snapshots must be generated in a real browser, reviewed and committed before enabling blocking visual diffs. Behavioral assertions already fail CI.

## Next steps

1. Review the CI image artifacts and choose stable, representative stories.
2. Commit approved screenshot baselines and enable Playwright's `toHaveScreenshot` diff gate, with a documented review workflow for intended visual changes.
3. Extend the matrix to remaining primitives and add explicit mobile/touch interaction tests and additional focus/scroll regression cases.
