import { computePlacement, type PlacementInput } from "./placement";

const viewport = { width: 1000, height: 800 };
const base: PlacementInput = {
  anchor: { left: 400, top: 300, right: 500, bottom: 340 },
  size: { width: 200, height: 100 },
  viewport,
  side: "bottom",
  align: "start",
  gap: 8,
  margin: 8,
  rtl: false,
};

describe("computePlacement", () => {
  it("opens below the anchor, lined up with its start edge", () => {
    expect(computePlacement(base)).toEqual({ left: 400, top: 348, side: "bottom" });
  });

  it("aligns to the end edge and centres", () => {
    expect(computePlacement({ ...base, align: "end" }).left).toBe(300);
    expect(computePlacement({ ...base, align: "center" }).left).toBe(350);
  });

  it("mirrors start and end in right-to-left text", () => {
    expect(computePlacement({ ...base, rtl: true }).left).toBe(300);
    expect(computePlacement({ ...base, rtl: true, side: "start" })).toMatchObject({
      side: "start",
      left: 500 + 8,
    });
  });

  it("flips to the top when the bottom has no room and the top has more", () => {
    const anchor = { left: 400, top: 720, right: 500, bottom: 760 };
    expect(computePlacement({ ...base, anchor })).toEqual({ left: 400, top: 720 - 8 - 100, side: "top" });
  });

  it("does not flip when the opposite side has less room", () => {
    const anchor = { left: 400, top: 20, right: 500, bottom: 60 };
    const result = computePlacement({ ...base, anchor, side: "top", size: { width: 200, height: 760 } });
    // Neither side fits 760px: the top has 4px, the bottom 724px, so it flips and is capped.
    expect(result).toMatchObject({ side: "bottom", maxHeight: 724 });
    const small = computePlacement({ ...base, anchor: { ...anchor, top: 300, bottom: 340 }, side: "top" });
    expect(small.side).toBe("top");
  });

  it("shifts along the other axis to stay inside the margin", () => {
    const anchor = { left: 920, top: 300, right: 990, bottom: 340 };
    expect(computePlacement({ ...base, anchor }).left).toBe(1000 - 8 - 200);
    const near = { left: 0, top: 300, right: 20, bottom: 340 };
    expect(computePlacement({ ...base, anchor: near, align: "end" }).left).toBe(8);
  });

  it("opens to the side, and flips when that side is too narrow", () => {
    expect(computePlacement({ ...base, side: "end" })).toEqual({ left: 508, top: 300, side: "end" });
    const anchor = { left: 880, top: 300, right: 980, bottom: 340 };
    expect(computePlacement({ ...base, anchor, side: "end" })).toMatchObject({
      side: "start",
      left: 880 - 8 - 200,
    });
  });

  it("caps a panel taller than the viewport on a side axis", () => {
    const result = computePlacement({ ...base, side: "end", size: { width: 200, height: 2000 } });
    expect(result).toMatchObject({ top: 8, maxHeight: 784 });
  });
});
