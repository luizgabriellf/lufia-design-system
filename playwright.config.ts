import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// CI serves the Storybook the verify job already built; locally the default is `storybook dev`.
// Set PW_STATIC=1 to test a local `npm run build-storybook` output instead.
const useStatic =
  process.env.PW_STATIC === "1" || (Boolean(process.env.CI) && existsSync("storybook-static/iframe.html"));

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // No retries: a retry would hide a flaky first attempt. A failure must be fixed or the test removed.
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  // `storybook dev` compiles stories on first request, so allow for a slow cold start there.
  expect: { timeout: useStatic ? 5_000 : 15_000 },
  use: {
    baseURL: "http://127.0.0.1:6006",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: useStatic
      ? "node scripts/serve-static.mjs storybook-static 6006"
      : "npm run storybook -- --ci --no-open",
    url: "http://127.0.0.1:6006/iframe.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { STORYBOOK_DISABLE_TELEMETRY: "1" },
  },
});
