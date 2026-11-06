import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { mockReducedMotion } from "../../test/motion";
import { useSlidingIndicator } from "./useSlidingIndicator";

function Tabs({ stretch = false }: { stretch?: boolean }) {
  const [active, setActive] = useState("a");
  const nav = useRef<HTMLDivElement>(null);
  const indicator = useSlidingIndicator(nav, `[data-id="${active}"]`, active, { stretch });
  return (
    <div ref={nav} style={{ position: "relative" }}>
      {["a", "b"].map((id) => (
        <button key={id} type="button" data-id={id} onClick={() => setActive(id)}>
          {id}
        </button>
      ))}
      <button type="button" onClick={() => setActive("missing")}>
        none
      </button>
      <span ref={indicator} data-testid="mark" hidden />
    </div>
  );
}

function mockBox(left: number) {
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockReturnValue(left);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(80);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(32);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useSlidingIndicator", () => {
  it("shows the indicator behind the active item, sized to it", () => {
    mockBox(40);
    render(<Tabs />);
    const mark = screen.getByTestId("mark");
    expect(mark.hidden).toBe(false);
    expect(mark.style.width).toBe("80px");
    expect(mark.style.height).toBe("32px");
    expect(mark.style.transform).toBe("translate3d(40px, 0px, 0)");
  });

  it("hides the indicator when nothing matches", async () => {
    mockBox(0);
    render(<Tabs />);
    await userEvent.setup().click(screen.getByRole("button", { name: "none" }));
    expect(screen.getByTestId("mark")).toHaveProperty("hidden", true);
  });

  it("stretches a fixed-width indicator with scaleX", () => {
    mockBox(10);
    render(<Tabs stretch />);
    const mark = screen.getByTestId("mark");
    expect(mark.style.width).toBe("100px");
    expect(mark.style.transform).toContain("scaleX(0.8)");
  });

  it("enables the slide only after the first position, at once under reduced motion", () => {
    mockBox(0);
    mockReducedMotion(true);
    render(<Tabs />);
    expect(screen.getByTestId("mark").dataset.ready).toBe("true");
  });

  it("waits one frame before enabling the slide otherwise", () => {
    mockBox(0);
    mockReducedMotion(false);
    let flush: FrameRequestCallback = () => {};
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => ((flush = cb), 1));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    render(<Tabs />);
    const mark = screen.getByTestId("mark");
    expect(mark.dataset.ready).toBeUndefined();
    flush(0);
    expect(mark.dataset.ready).toBe("true");
  });
});
