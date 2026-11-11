import { readFileSync } from "node:fs";
import { act, fireEvent, render } from "@testing-library/react";
import { axe } from "../../test/axe";
import {
  doneRouteProgress,
  RouteProgress,
  ROUTE_PROGRESS_DONE_EVENT,
  ROUTE_PROGRESS_REVEAL_DELAY_MS,
  ROUTE_PROGRESS_START_EVENT,
  ROUTE_PROGRESS_TIMEOUT_MS,
  startRouteProgress,
} from "./RouteProgress";

const css = readFileSync("src/components/AppShell/RouteProgress.module.css", "utf8");

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
    advance(9_000);
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
    window.history.replaceState({}, "", "/");
  });

  it("does not start for a link to the same path with another query", () => {
    const { container } = render(<RouteProgress routeKey="/a" />);
    fireEvent.click(addLink(`${window.location.pathname}?page=2`));
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1000);
    expect(bar(container)).toBeNull();
  });

  it("leaves link clicks alone when the app supplies pending, even as false", () => {
    const { container, rerender } = render(<RouteProgress routeKey="/a" pending={false} />);
    fireEvent.click(addLink("/x"));
    advance(1000);
    expect(bar(container)).toBeNull();
    rerender(<RouteProgress routeKey="/a" pending />);
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    expect(bar(container)).not.toBeNull();
  });

  it("finishes a run started by a link when the address changes, without a route key change", () => {
    const { container } = render(<RouteProgress routeKey="/a" />);
    fireEvent.click(addLink("/x"));
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    expect(bar(container)).not.toBeNull();
    window.history.pushState({}, "", "/x");
    advance(400);
    advance(400);
    expect(bar(container)).toBeNull();
  });

  it("never shows a run whose address changed before the reveal delay", () => {
    const { container } = render(<RouteProgress routeKey="/a" />);
    fireEvent.click(addLink("/x"));
    window.history.pushState({}, "", "/x");
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    advance(1000);
    expect(bar(container)).toBeNull();
  });

  it("ends a run nothing finishes (a cancelled or guarded navigation, a redirect back) after the safety timeout", () => {
    const { container } = render(<RouteProgress routeKey="/a" />);
    fireEvent.click(addLink("/x"));
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    advance(ROUTE_PROGRESS_TIMEOUT_MS - 1000);
    expect(bar(container)).not.toBeNull();
    advance(1500);
    advance(400);
    expect(bar(container)).toBeNull();
  });

  it("ends a pending that never goes back to false after the safety timeout", () => {
    const { container } = render(<RouteProgress routeKey="/a" pending />);
    advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
    expect(bar(container)).not.toBeNull();
    advance(ROUTE_PROGRESS_TIMEOUT_MS + 400);
    expect(bar(container)).toBeNull();
  });

  describe("trackLinks query", () => {
    beforeEach(() => window.history.pushState({}, "", "/list?page=1"));

    it("starts for a link that changes only the query, and finishes when the address changes", () => {
      const { container } = render(<RouteProgress routeKey="/list" trackLinks="query" />);
      fireEvent.click(addLink("/list?page=2"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      expect(bar(container)).not.toBeNull();
      window.history.pushState({}, "", "/list?page=2");
      advance(400);
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("still ignores a link to the same address and a hash-only link", () => {
      const { container } = render(<RouteProgress routeKey="/list" trackLinks="query" />);
      fireEvent.click(addLink("/list?page=1"));
      fireEvent.click(addLink("/list?page=1#details"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1000);
      expect(bar(container)).toBeNull();
    });

    it("tracks links alongside pending, as trackLinks does", () => {
      const { container } = render(<RouteProgress routeKey="/list" pending={false} trackLinks="query" />);
      fireEvent.click(addLink("/list?page=3"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      expect(bar(container)).not.toBeNull();
    });
  });

  describe("timeout", () => {
    it("keeps a pending run past the default with a longer timeout, then ends it", () => {
      const { container } = render(<RouteProgress routeKey="/a" pending timeout={20_000} />);
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      advance(15_000);
      expect(bar(container)).not.toBeNull();
      advance(5_400);
      expect(bar(container)).toBeNull();
    });

    it("never cuts a pending run short with Infinity, and finishes it when pending ends", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/a" pending timeout={Infinity} />);
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      advance(60_000);
      expect(bar(container)).not.toBeNull();
      rerender(<RouteProgress routeKey="/a" pending={false} timeout={Infinity} />);
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("applies to a run started from code", () => {
      const { container } = render(<RouteProgress routeKey="/a" timeout={Infinity} />);
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      advance(60_000);
      expect(bar(container)).not.toBeNull();
      act(() => doneRouteProgress());
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("still caps a run that only a link click started at 10 seconds", () => {
      const { container } = render(<RouteProgress routeKey="/a" timeout={Infinity} />);
      fireEvent.click(addLink("/x"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      advance(ROUTE_PROGRESS_TIMEOUT_MS + 400);
      expect(bar(container)).toBeNull();
    });

    it("caps a link run at a shorter timeout", () => {
      const { container } = render(<RouteProgress routeKey="/a" timeout={3_000} />);
      fireEvent.click(addLink("/x"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      advance(3_400);
      expect(bar(container)).toBeNull();
    });

    it("keeps a pending run when the cap of a link clicked meanwhile lapses", () => {
      window.history.pushState({}, "", "/start");
      const { container } = render(<RouteProgress routeKey="/start" pending trackLinks timeout={Infinity} />);
      fireEvent.click(addLink("/elsewhere"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      advance(ROUTE_PROGRESS_TIMEOUT_MS + 5_000);
      expect(bar(container)).not.toBeNull();
      expect(bar(container)).not.toHaveAttribute("data-finishing");
    });
  });

  describe("pending and link tracking together", () => {
    beforeEach(() => window.history.pushState({}, "", "/start"));

    it("leaves link clicks to the app once pending is passed, unless trackLinks is set", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/start" pending={false} />);
      fireEvent.click(addLink("/elsewhere"));
      advance(1000);
      expect(bar(container)).toBeNull();
      rerender(<RouteProgress routeKey="/start" pending={false} trackLinks />);
      fireEvent.click(addLink("/elsewhere"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      expect(bar(container)).not.toBeNull();
    });

    it("keeps the bar after pending ends while a clicked link is still on its way", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/start" pending trackLinks />);
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      fireEvent.click(addLink("/elsewhere"));
      rerender(<RouteProgress routeKey="/start" pending={false} trackLinks />);
      advance(1000);
      expect(bar(container)).not.toBeNull();
      expect(bar(container)).not.toHaveAttribute("data-finishing");
      window.history.pushState({}, "", "/elsewhere");
      advance(400);
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("keeps the bar after a clicked link arrives while pending is still true", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/start" pending={false} trackLinks />);
      fireEvent.click(addLink("/elsewhere"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      rerender(<RouteProgress routeKey="/start" pending trackLinks />);
      window.history.pushState({}, "", "/elsewhere");
      advance(1000);
      expect(bar(container)).not.toBeNull();
      expect(bar(container)).not.toHaveAttribute("data-finishing");
      rerender(<RouteProgress routeKey="/start" pending={false} trackLinks />);
      expect(bar(container)).toHaveAttribute("data-finishing");
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("finishes both at once when the route key changes", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/start" pending trackLinks />);
      fireEvent.click(addLink("/elsewhere"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      rerender(<RouteProgress routeKey="/elsewhere" pending trackLinks />);
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("still ends by itself after the safety timeout", () => {
      const { container } = render(<RouteProgress routeKey="/start" pending trackLinks />);
      fireEvent.click(addLink("/elsewhere"));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      expect(bar(container)).not.toBeNull();
      advance(ROUTE_PROGRESS_TIMEOUT_MS + 400);
      expect(bar(container)).toBeNull();
    });
  });

  describe("started from code", () => {
    it("starts on startRouteProgress() and finishes on doneRouteProgress()", () => {
      const { container } = render(<RouteProgress routeKey="/a" />);
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      expect(bar(container)).not.toBeNull();
      act(() => doneRouteProgress());
      expect(bar(container)).toHaveAttribute("data-finishing");
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("goes away when a run restarted during the finish ends before its reveal delay", () => {
      const { container } = render(<RouteProgress routeKey="/a" />);
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      act(() => doneRouteProgress());
      // A second step starts while the bar is still finishing, and is over almost at once.
      advance(50);
      act(() => startRouteProgress());
      advance(20);
      act(() => doneRouteProgress());
      advance(1000);
      expect(bar(container)).toBeNull();
    });

    it("never shows when done arrives within the reveal delay", () => {
      const { container } = render(<RouteProgress routeKey="/a" />);
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS - 20);
      act(() => doneRouteProgress());
      advance(1000);
      expect(bar(container)).toBeNull();
    });

    it("finishes on a route key change", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/a" />);
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      rerender(<RouteProgress routeKey="/b" />);
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("works with pending: done leaves the bar while pending is true, pending false then finishes it", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/a" pending />);
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      act(() => doneRouteProgress());
      advance(400);
      expect(bar(container)).not.toHaveAttribute("data-finishing");
      rerender(<RouteProgress routeKey="/a" pending={false} />);
      expect(bar(container)).toHaveAttribute("data-finishing");
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("works with pending: pending false leaves a run started from code until done", () => {
      const { container, rerender } = render(<RouteProgress routeKey="/a" pending={false} />);
      act(() => startRouteProgress());
      rerender(<RouteProgress routeKey="/a" pending />);
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      rerender(<RouteProgress routeKey="/a" pending={false} />);
      advance(400);
      expect(bar(container)).not.toBeNull();
      expect(bar(container)).not.toHaveAttribute("data-finishing");
      act(() => doneRouteProgress());
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("works with trackLinks: done leaves a link click that has not arrived", () => {
      const { container } = render(<RouteProgress routeKey="/a" />);
      fireEvent.click(addLink("/elsewhere"));
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      act(() => doneRouteProgress());
      advance(400);
      expect(bar(container)).not.toBeNull();
    });

    it("ignores a done with nothing started from code", () => {
      const { container } = render(<RouteProgress routeKey="/a" pending />);
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      act(() => doneRouteProgress());
      expect(bar(container)).not.toHaveAttribute("data-finishing");
    });

    it("listens for custom event names, and dispatches the documented defaults", () => {
      const seen: string[] = [];
      const record = (event: Event) => seen.push(event.type);
      window.addEventListener(ROUTE_PROGRESS_START_EVENT, record);
      window.addEventListener(ROUTE_PROGRESS_DONE_EVENT, record);
      startRouteProgress();
      doneRouteProgress();
      window.removeEventListener(ROUTE_PROGRESS_START_EVENT, record);
      window.removeEventListener(ROUTE_PROGRESS_DONE_EVENT, record);
      expect(seen).toEqual(["lufia:route-progress-start", "lufia:route-progress-done"]);

      const { container } = render(
        <RouteProgress routeKey="/a" events={{ start: "app:nav-start", done: "app:nav-end" }} />,
      );
      act(() => void window.dispatchEvent(new Event("app:nav-start")));
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      expect(bar(container)).not.toBeNull();
      act(() => startRouteProgress());
      act(() => void window.dispatchEvent(new Event("app:nav-end")));
      advance(400);
      expect(bar(container)).toBeNull();
    });

    it("stops listening when unmounted", () => {
      const { container, unmount } = render(<RouteProgress routeKey="/a" />);
      unmount();
      act(() => startRouteProgress());
      advance(ROUTE_PROGRESS_REVEAL_DELAY_MS + 1);
      expect(bar(container)).toBeNull();
    });
  });

  it("fades out with opacity on the exit token when it finishes, and sits on the tooltip layer", () => {
    expect(css).toMatch(/\[data-finishing\][^}]*opacity:\s*0/);
    expect(css).toMatch(/opacity var\(--lufia-motion-duration-exit\)/);
    expect(css).toMatch(/z-index:\s*var\(--lufia-z-tooltip\)/);
  });
});
