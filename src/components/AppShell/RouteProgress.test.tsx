import { act, fireEvent, render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { RouteProgress, ROUTE_PROGRESS_REVEAL_DELAY_MS } from "./RouteProgress";

const bar = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-route-progress]");
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("RouteProgress", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("draws nothing while idle", () => {
    const { container } = render(<RouteProgress routeKey="/a" />);
    advance(1000);
    expect(bar(container)).toBeNull();
  });

  it("stays hidden for a navigation that arrives before the reveal delay", () => {
    const { container, rerender } = render(<RouteProgress routeKey="/a" pending />);
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS - 20);
    rerender(<RouteProgress routeKey="/b" pending={false} />);
    advance(1000);
    expect(bar(container)).toBeNull();
  });

  it("appears after the delay, creeps toward a ceiling below the end, then finishes and goes", () => {
    const { container, rerender } = render(<RouteProgress routeKey="/a" pending />);
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    expect(bar(container)).toHaveStyle({ transform: "scaleX(0.2)" });
    expect(bar(container)).toHaveAttribute("aria-hidden", "true");
    advance(20_000);
    const scale = Number(/scaleX\(([\d.]+)\)/.exec(bar(container)!.style.transform)![1]);
    expect(scale).toBeGreaterThan(0.5);
    expect(scale).toBeLessThanOrEqual(0.85);
    rerender(<RouteProgress routeKey="/b" pending={false} />);
    expect(bar(container)).toHaveStyle({ transform: "scaleX(1)" });
    advance(400);
    expect(bar(container)).toBeNull();
  });

  it("finishes when the route key changes even if pending was never set", () => {
    const { container, rerender } = render(<RouteProgress routeKey="/a" />);
    fireEvent.click(addLink("/next"));
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    expect(bar(container)).not.toBeNull();
    rerender(<RouteProgress routeKey="/next" />);
    advance(400);
    expect(bar(container)).toBeNull();
  });

  function addLink(href: string, attrs: Record<string, string> = {}) {
    const link = document.createElement("a");
    link.setAttribute("href", href);
    for (const [name, value] of Object.entries(attrs)) link.setAttribute(name, value);
    link.textContent = "go";
    document.body.append(link);
    return link;
  }

  it("starts on a plain click on a link to another page, and ignores the rest", () => {
    const { container } = render(<RouteProgress routeKey="/a" />);
    const ignored = [
      addLink(window.location.pathname),
      addLink("https://elsewhere.example/x"),
      addLink("/x", { target: "_blank" }),
      addLink("/x", { download: "" }),
    ];
    for (const link of ignored) fireEvent.click(link);
    fireEvent.click(addLink("/x"), { ctrlKey: true });
    fireEvent.click(addLink("/x"), { button: 1 });
    advance(1000);
    expect(bar(container)).toBeNull();
    fireEvent.click(addLink("/x"));
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    expect(bar(container)).not.toBeNull();
  });

  it("does not listen to clicks with trackLinks off", () => {
    const { container } = render(<RouteProgress routeKey="/a" trackLinks={false} />);
    fireEvent.click(addLink("/x"));
    advance(1000);
    expect(bar(container)).toBeNull();
  });

  it("honours a custom reveal delay", () => {
    const { container } = render(<RouteProgress routeKey="/a" pending revealDelay={500} />);
    advance(400);
    expect(bar(container)).toBeNull();
    advance(101);
    expect(bar(container)).not.toBeNull();
  });

  it("finishes a cancelled navigation when pending goes back to false", () => {
    const { container, rerender } = render(<RouteProgress routeKey="/a" pending />);
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    rerender(<RouteProgress routeKey="/a" pending={false} />);
    advance(400);
    expect(bar(container)).toBeNull();
  });

  it("has no axe violations while showing", async () => {
    vi.useRealTimers();
    const { container } = render(<RouteProgress routeKey="/a" pending revealDelay={0} />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(bar(container)).not.toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  afterEach(() => {
    document.querySelectorAll("body > a").forEach((node) => node.remove());
  });
});
