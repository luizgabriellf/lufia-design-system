import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);
afterEach(() => cleanup());

// jsdom runs animation frames from a timer it starts on demand. When that timer is created while fake timers are
// installed and the test then restores real timers, the frame loop is lost and later frames never run. Frames built on
// the current `setTimeout` follow whichever timers the test is using.
// Suites that run in the node environment have no window.
if (typeof window !== "undefined") {
  window.requestAnimationFrame = (callback) =>
    setTimeout(() => callback(performance.now()), 16) as unknown as number;
  window.cancelAnimationFrame = (handle) => clearTimeout(handle);
}
