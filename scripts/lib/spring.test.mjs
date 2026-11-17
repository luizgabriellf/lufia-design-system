import { describe, expect, it } from "vitest";
import { springLinear, springStops } from "./spring.mjs";

describe("spring easing generator", () => {
  const stops = springStops();

  it("starts at 0 and ends at exactly 1", () => {
    expect(stops[0]).toBe(0);
    expect(stops.at(-1)).toBe(1);
  });

  it("overshoots by about 5%, once", () => {
    const peak = Math.max(...stops);
    expect(peak).toBeGreaterThan(1.03);
    expect(peak).toBeLessThan(1.08);
    const crossings = stops.filter((value, i) => i > 0 && value > 1 !== stops[i - 1] > 1).length;
    expect(crossings).toBe(2); // up through 1, back down to 1: no ringing after
  });

  it("rises monotonically up to the peak", () => {
    const peakAt = stops.indexOf(Math.max(...stops));
    for (let i = 1; i <= peakAt; i++) expect(stops[i]).toBeGreaterThan(stops[i - 1] ?? 0);
  });

  it("settles without dipping below 1 after the peak", () => {
    const peakAt = stops.indexOf(Math.max(...stops));
    for (const value of stops.slice(peakAt)) expect(value).toBeGreaterThanOrEqual(1);
  });

  it("is deterministic and compact", () => {
    expect(springLinear()).toBe(springLinear());
    expect(stops.length).toBeGreaterThanOrEqual(24);
    expect(stops.length).toBeLessThanOrEqual(32);
    expect(springLinear()).toMatch(/^linear\((-?\d+(\.\d{1,3})?, )+1\)$/);
  });
});
