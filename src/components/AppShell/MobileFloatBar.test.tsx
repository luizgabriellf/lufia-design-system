import { readFileSync } from "node:fs";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { MobileFloatBar, MobileFloatBarButton, MobileFloatBarSeparator } from "./MobileFloatBar";

describe("MobileFloatBar", () => {
  it("is a named group of controls", () => {
    render(
      <MobileFloatBar label="Quick navigation">
        <MobileFloatBarButton label="Search" />
        <MobileFloatBarSeparator />
        <MobileFloatBarButton variant="icon" label="Menu" icon={<svg />} />
      </MobileFloatBar>,
    );
    expect(screen.getByRole("group", { name: "Quick navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Search", "Menu"]);
  });

  it("calls onClick on a button and passes aria state through", async () => {
    const onClick = vi.fn();
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton variant="icon" label="Menu" aria-expanded={false} onClick={onClick} />
      </MobileFloatBar>,
    );
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.setup().click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a link through the link component when it has an href", () => {
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton variant="primary" label="New item" href="/new" />
      </MobileFloatBar>,
    );
    expect(screen.getByRole("link", { name: "New item" })).toHaveAttribute("href", "/new");
  });

  it("keeps the name of an icon-only control", () => {
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton variant="icon" label="Menu" icon={<svg data-testid="i" />} />
      </MobileFloatBar>,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName("Menu");
    expect(screen.getByTestId("i").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton label="Search" />
        <MobileFloatBarButton variant="primary" label="New" href="/new" />
        <MobileFloatBarButton variant="icon" label="Menu" />
      </MobileFloatBar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("passes data-* attributes to a button and to a link", () => {
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton label="Search" data-tour="search" />
        <MobileFloatBarButton variant="primary" label="New item" href="/new" data-tour="primary" data-x="1" />
      </MobileFloatBar>,
    );
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("data-tour", "search");
    const link = screen.getByRole("link", { name: "New item" });
    expect(link).toHaveAttribute("data-tour", "primary");
    expect(link).toHaveAttribute("data-x", "1");
  });
});

describe("MobileFloatBar visual viewport", () => {
  type Listener = () => void;
  function fakeViewport(initial: { height: number; offsetTop?: number; scale?: number }) {
    const listeners: Record<string, Set<Listener>> = { resize: new Set(), scroll: new Set() };
    const view = {
      height: initial.height,
      offsetTop: initial.offsetTop ?? 0,
      scale: initial.scale ?? 1,
      addEventListener: vi.fn((type: string, fn: Listener) => listeners[type]!.add(fn)),
      removeEventListener: vi.fn((type: string, fn: Listener) => listeners[type]!.delete(fn)),
      fire: (type: string) => listeners[type]!.forEach((fn) => fn()),
      listeners,
    };
    vi.stubGlobal("visualViewport", view);
    return view;
  }
  const frames: FrameRequestCallback[] = [];
  const flush = () => act(() => frames.splice(0).forEach((frame) => frame(0)));

  beforeEach(() => {
    vi.stubGlobal("innerHeight", 800);
    vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => frames.push(frame));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });
  afterEach(() => {
    frames.length = 0;
    vi.unstubAllGlobals();
  });

  const bar = () => screen.getByRole("group", { name: "Bar" });
  const offset = () => bar().style.getPropertyValue("--lufia-float-bar-viewport-offset");

  it("lifts the bar above what covers the bottom of the page, once per frame", () => {
    const view = fakeViewport({ height: 800 });
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton label="Search" />
      </MobileFloatBar>,
    );
    expect(offset()).toBe("0px");
    expect(bar()).not.toHaveAttribute("data-viewport-lifted");
    view.height = 500;
    view.fire("resize");
    view.fire("scroll");
    expect(frames).toHaveLength(1);
    flush();
    expect(offset()).toBe("300px");
    expect(bar()).toHaveAttribute("data-viewport-lifted");
    view.offsetTop = 100;
    view.fire("scroll");
    flush();
    expect(offset()).toBe("200px");
  });

  it("stays put while the page is pinch-zoomed", () => {
    const view = fakeViewport({ height: 400, scale: 2 });
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton label="Search" />
      </MobileFloatBar>,
    );
    expect(offset()).toBe("0px");
    view.scale = 1;
    view.fire("resize");
    flush();
    expect(offset()).toBe("400px");
  });

  it("removes its listeners and the offset on unmount, and does nothing with followViewport off", () => {
    const view = fakeViewport({ height: 500 });
    const { unmount } = render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton label="Search" />
      </MobileFloatBar>,
    );
    unmount();
    expect(view.listeners.resize!.size).toBe(0);
    expect(view.listeners.scroll!.size).toBe(0);
    render(
      <MobileFloatBar label="Bar" followViewport={false}>
        <MobileFloatBarButton label="Search" />
      </MobileFloatBar>,
    );
    expect(view.addEventListener).toHaveBeenCalledTimes(2);
    expect(offset()).toBe("");
  });

  it("is a no-op without visualViewport", () => {
    vi.stubGlobal("visualViewport", undefined);
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton label="Search" />
      </MobileFloatBar>,
    );
    expect(offset()).toBe("");
  });

  it("moves with transform only and does not ease", () => {
    const css = readFileSync("src/components/AppShell/MobileFloatBar.module.css", "utf8");
    expect(css).toMatch(
      /transform: translateY\(calc\(-1 \* var\(--lufia-float-bar-viewport-offset, 0px\)\)\)/,
    );
    expect(css).not.toMatch(/transition[^;]*transform/);
  });
});
