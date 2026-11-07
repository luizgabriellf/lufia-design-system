# Playwright browser tests

Playwright runs the existing Storybook stories in Chromium and WebKit.

## Run locally

```bash
npm ci
npx playwright install chromium webkit
npm run test:browser
```

The test runner starts Storybook on port 6006. An already running local server is reused.
Use `npm run test:browser:ui` for interactive debugging.

## Coverage

- Modal focus trapping, Escape dismissal, and opener focus restoration.
- Combobox inside a modal: Escape closes the list before the dialog.
- Button screenshots at 320, 390, 768, and 1440 px.
- Open modal screenshots at 320 and 1440 px.
- Both Storybook themes and both light/dark modes in Chromium and WebKit.

The GitHub Actions job uploads screenshots, traces, and an HTML report.

## Visual regression baseline

Screenshots are captured for review, but pixel-diff assertions are not yet enabled.
Approved reference screenshots must be generated with a real browser and committed
before visual changes can block CI. The keyboard and interaction tests already fail CI.

## Next steps

- Review and approve initial screenshot baselines.
- Enable Playwright `toHaveScreenshot` with an intentional update workflow.
- Expand coverage to other components and touch interactions.
