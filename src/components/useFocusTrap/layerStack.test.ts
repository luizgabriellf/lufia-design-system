import { hasOpenOverlay, overlayDepth, registerOverlayLayer } from "./layerStack";

describe("overlay stack readers", () => {
  it("reports an empty stack", () => {
    expect(overlayDepth()).toBe(0);
    expect(hasOpenOverlay()).toBe(false);
  });

  it("counts registered layers and falls back to zero when they are released", () => {
    const first = registerOverlayLayer();
    expect(overlayDepth()).toBe(1);
    expect(hasOpenOverlay()).toBe(true);
    const second = registerOverlayLayer();
    expect(overlayDepth()).toBe(2);
    second.release();
    expect(overlayDepth()).toBe(1);
    first.release();
    first.release();
    expect(overlayDepth()).toBe(0);
    expect(hasOpenOverlay()).toBe(false);
  });

  it("reads the shared stack on globalThis, so another copy of the package agrees", () => {
    const host = globalThis as typeof globalThis & { __lufiaOverlayStack?: symbol[] };
    const layer = registerOverlayLayer();
    expect(host.__lufiaOverlayStack).toHaveLength(overlayDepth());
    host.__lufiaOverlayStack!.push(Symbol("other copy"));
    expect(overlayDepth()).toBe(2);
    host.__lufiaOverlayStack!.pop();
    layer.release();
  });
});
