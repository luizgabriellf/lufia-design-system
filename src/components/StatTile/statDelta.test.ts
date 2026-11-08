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

  it("counts a change within the flat threshold as flat, and shows its size without a sign", () => {
    expect(run({ current: 100.5, previous: 100 })).toMatchObject({
      delta: "0.5% vs previous 30 days",
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

  it("decides trend and tone on the rounded text, not the raw number", () => {
    const flat = { delta: "0 vs previous 30 days", trend: "flat", deltaTone: "neutral" };
    expect(run({ current: 3.0001, previous: 3 })).toMatchObject(flat);
    expect(run({ current: 0.3, previous: 0.1 + 0.2 })).toMatchObject(flat);
    expect(run({ current: 1e-5, previous: 0 })).toMatchObject(flat);
    expect(run({ current: 1e-5, previous: 0, goodDirection: "down" })).toMatchObject(flat);
    expect(run({ current: 100.004, previous: 100, flatThreshold: 0 })).toMatchObject({
      delta: "0% vs previous 30 days",
      trend: "flat",
    });
  });

  it("treats the threshold the same on both sides of float noise", () => {
    const a = run({ current: 10.05, previous: 10 });
    const b = run({ current: 201, previous: 200 });
    expect(a).toMatchObject({ delta: "0.5% vs previous 30 days", trend: "flat" });
    expect(b).toMatchObject({ delta: "0.5% vs previous 30 days", trend: "flat" });
    expect(run({ current: 10.06, previous: 10 })).toMatchObject({
      delta: "+0.6% vs previous 30 days",
      trend: "up",
    });
  });

  it("reads a flat change without a sign, so it does not contradict the direction word", () => {
    expect(run({ current: 100.3, previous: 100 })?.delta).toBe("0.3% vs previous 30 days");
    expect(run({ current: 99.7, previous: 100 })?.delta).toBe("0.3% vs previous 30 days");
    expect(run({ current: 4.0001, previous: 4, formatValue: (n) => `${n.toFixed(0)} items` })?.delta).toBe(
      "0 items vs previous 30 days",
    );
  });

  it("drops binary float noise before rounding", () => {
    expect(run({ current: 100.35, previous: 100 })?.delta).toBe("0.4% vs previous 30 days");
    expect(run({ current: 100.55, previous: 100 })?.delta).toBe("+0.6% vs previous 30 days");
    expect(run({ current: 0.3, previous: 0.1, formatValue: String })?.delta).toBe("+0.2 vs previous 30 days");
  });

  it("rounds 9.95 to 9.99 percent up to 10%", () => {
    for (const current of [109.95, 109.96, 109.99]) {
      expect(run({ current, previous: 100 })?.delta).toBe("+10% vs previous 30 days");
    }
    expect(run({ current: 90.05, previous: 100 })?.delta).toBe("-10% vs previous 30 days");
  });

  it("returns null when the change overflows", () => {
    expect(run({ current: 5, previous: Infinity })).toBeNull();
    expect(run({ current: Infinity, previous: 10 })).toBeNull();
    expect(run({ current: 1e308, previous: -1e308 })).toBeNull();
    expect(run({ current: 1e308, previous: -1e308, mode: "absolute" })).toBeNull();
    expect(run({ current: 1e308, previous: 1e-300, mode: "percent" })).toBeNull();
  });

  it("keeps the bidi mark with the sign in right-to-left locales", () => {
    const formatValue = (n: number) => String(n);
    const r = run({ current: 4, previous: 1, locale: "ar-EG", formatValue });
    const mark = new Intl.NumberFormat("ar-EG", { signDisplay: "always" }).formatToParts(1)[0];
    expect(mark?.type).toBe("literal");
    expect(r?.delta.startsWith(`${mark?.value}+3`)).toBe(true);
    const down = run({ current: 1, previous: 4, locale: "ar-EG", formatValue });
    expect(down?.delta.startsWith(`${mark?.value}-3`)).toBe(true);
  });
  it("keeps every digit of a large absolute change", () => {
    const result = computeStatDelta({ ...base, current: 123456789012345, previous: 0 });
    expect(result?.delta).toContain("123,456,789,012,345");
  });
});
