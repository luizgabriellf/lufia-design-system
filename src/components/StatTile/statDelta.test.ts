import { computeStatDelta, type StatDeltaInput } from "./statDelta";

const labels = { up: "Up", down: "Down", flat: "No change", comparison: "vs previous 30 days" };
const base = { goodDirection: "up", labels, locale: "en" } as const;
const run = (o: Partial<StatDeltaInput> & { current: number; previous: number | null | undefined }) =>
  computeStatDelta({ ...base, ...o });

describe("computeStatDelta", () => {
  it("returns null without history", () => {
    expect(run({ current: 5, previous: null })).toBeNull();
    expect(run({ current: 5, previous: undefined })).toBeNull();
    expect(run({ current: 5, previous: Number.NaN })).toBeNull();
    expect(run({ current: Number.NaN, previous: 10 })).toBeNull();
  });

  it("formats a rise as a percentage with the period and the direction word", () => {
    expect(run({ current: 112, previous: 100 })).toEqual({
      delta: "+12% vs previous 30 days",
      trend: "up",
      trendLabel: "Up",
      deltaTone: "success",
    });
  });

  it("formats a fall", () => {
    expect(run({ current: 80, previous: 100 })).toMatchObject({
      delta: "-20% vs previous 30 days",
      trend: "down",
      trendLabel: "Down",
    });
  });

  it("keeps one decimal under 10% and none from 10%", () => {
    expect(run({ current: 103.25, previous: 100 })?.delta).toBe("+3.3% vs previous 30 days");
    expect(run({ current: 109.4, previous: 100 })?.delta).toBe("+9.4% vs previous 30 days");
    expect(run({ current: 110.4, previous: 100 })?.delta).toBe("+10% vs previous 30 days");
  });

  it("uses an absolute change on a zero base, never infinity", () => {
    const r = run({ current: 3, previous: 0 });
    expect(r?.delta).toBe("+3 vs previous 30 days");
    expect(r?.trend).toBe("up");
    expect(run({ current: 3, previous: 0, minBase: 0 })?.delta).toBe("+3 vs previous 30 days");
    expect(run({ current: 3, previous: 0, mode: "percent" })?.delta).toBe("+3 vs previous 30 days");
  });

  it("uses an absolute change below minBase, and percent from minBase", () => {
    expect(run({ current: 4, previous: 1 })?.delta).toBe("+3 vs previous 30 days");
    expect(run({ current: 0, previous: 4 })?.delta).toBe("-4 vs previous 30 days");
    expect(run({ current: 6, previous: 5 })?.delta).toBe("+20% vs previous 30 days");
    expect(run({ current: 4, previous: 1, minBase: 1 })?.delta).toBe("+300% vs previous 30 days");
    expect(run({ current: 4, previous: 1, minBase: 0.5 })?.delta).toBe("+300% vs previous 30 days");
    expect(run({ current: 14, previous: 10, minBase: 20 })?.delta).toBe("+4 vs previous 30 days");
  });

  it("formats an absolute change with formatValue and adds the sign itself", () => {
    const formatValue = (n: number) => `${n} items`;
    expect(run({ current: 4, previous: 1, formatValue })?.delta).toBe("+3 items vs previous 30 days");
    expect(run({ current: 1, previous: 4, formatValue })?.delta).toBe("-3 items vs previous 30 days");
    expect(run({ current: 4, previous: 4, formatValue })?.delta).toBe("0 items vs previous 30 days");
  });

  it("forces a mode", () => {
    expect(run({ current: 150, previous: 100, mode: "absolute" })?.delta).toBe("+50 vs previous 30 days");
    expect(run({ current: 4, previous: 2, mode: "percent" })?.delta).toBe("+100% vs previous 30 days");
  });

  it("divides by the size of a negative base", () => {
    expect(run({ current: -5, previous: -10 })).toMatchObject({
      delta: "+50% vs previous 30 days",
      trend: "up",
    });
    expect(run({ current: -15, previous: -10 })).toMatchObject({
      delta: "-50% vs previous 30 days",
      trend: "down",
    });
    expect(run({ current: 2, previous: -2 })?.delta).toBe("+4 vs previous 30 days");
  });

  it("counts a change within the flat threshold as flat, and shows the real figure", () => {
    expect(run({ current: 100.5, previous: 100 })).toMatchObject({
      delta: "+0.5% vs previous 30 days",
      trend: "flat",
      trendLabel: "No change",
      deltaTone: "neutral",
    });
    expect(run({ current: 100.6, previous: 100 })?.trend).toBe("up");
    expect(run({ current: 99.4, previous: 100 })?.trend).toBe("down");
    expect(run({ current: 102, previous: 100, flatThreshold: 2 })?.trend).toBe("flat");
    expect(run({ current: 100.1, previous: 100, flatThreshold: 0 })?.trend).toBe("up");
    expect(run({ current: 100, previous: 100 })?.delta).toBe("0% vs previous 30 days");
  });

  it("is flat in absolute mode only on exact equality", () => {
    expect(run({ current: 3, previous: 3 })).toMatchObject({ delta: "0 vs previous 30 days", trend: "flat" });
    expect(run({ current: 3.1, previous: 3 })?.trend).toBe("up");
  });

  it("formats with the locale (pt-PT decimal comma)", () => {
    expect(run({ current: 103.5, previous: 100, locale: "pt-PT" })?.delta).toMatch(
      /^\+3,5\s?% vs previous 30 days$/,
    );
    expect(run({ current: 1000.5, previous: 0, locale: "pt-PT" })?.delta).toContain("+1000,5");
    expect(run({ current: 1000.5, previous: 0, locale: "en" })?.delta).toContain("+1,000.5");
  });

  it("maps tones from goodDirection", () => {
    const tone = (goodDirection: "up" | "down" | "neutral", current: number, badTone?: "danger") =>
      run({ current, previous: 100, goodDirection, badTone })?.deltaTone;
    expect(tone("up", 120)).toBe("success");
    expect(tone("up", 80)).toBe("warning");
    expect(tone("up", 80, "danger")).toBe("danger");
    expect(tone("down", 80)).toBe("success");
    expect(tone("down", 120)).toBe("warning");
    expect(tone("down", 120, "danger")).toBe("danger");
    expect(tone("neutral", 120)).toBe("neutral");
    expect(tone("neutral", 80)).toBe("neutral");
    expect(tone("up", 100, "danger")).toBe("neutral");
    expect(tone("down", 100.2, "danger")).toBe("neutral");
  });

  it("lets a comparison function own the whole text", () => {
    const r = run({ current: 112, previous: 100, labels: { ...labels, comparison: (c) => `30 days: ${c}` } });
    expect(r?.delta).toBe("30 days: +12%");
  });

  it("lets the caller's explicit props win when spread after the result", () => {
    const merged = { ...run({ current: 112, previous: 100 }), trend: "down", deltaTone: "danger" };
    expect(merged).toMatchObject({ delta: "+12% vs previous 30 days", trend: "down", deltaTone: "danger" });
  });
});
