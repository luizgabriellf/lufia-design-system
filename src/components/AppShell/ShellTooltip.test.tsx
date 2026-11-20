import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { endAnimation, mockReducedMotion, stubExitAnimation } from "../../test/motion";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";

function Rail({ collapsed = true }: { collapsed?: boolean }) {
  return (
    <Sidebar label="Main" collapsed={collapsed}>
      <SidebarGroup>
        <SidebarItem label="Home" href="/" />
        <SidebarItem label="Inbox" href="/inbox" />
      </SidebarGroup>
    </Sidebar>
  );
}

const css = readFileSync("src/components/Tooltip/Tooltip.module.css", "utf8");

describe("rail tooltip", () => {
  it("sits on the tooltip layer, above toasts and sheets", () => {
    expect(css).toMatch(/z-index:\s*var\(--lufia-z-tooltip\)/);
    expect(css).not.toMatch(/z-index:\s*var\(--lufia-z-toast\)/);
  });

  afterEach(() => vi.useRealTimers());

  it("shows after a hover delay, in the body, and leaves when the pointer does", () => {
    vi.useFakeTimers();
    const { container } = render(<Rail />);
    const home = screen.getByRole("link", { name: "Home" });
    fireEvent.pointerEnter(home, { pointerType: "mouse" });
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(300));
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(tip).toHaveTextContent("Home");
    expect(container).not.toContainElement(tip);
    fireEvent.pointerLeave(home);
    act(() => void vi.advanceTimersByTime(200));
    // No stylesheet in jsdom, so there is no exit animation to wait for: the tooltip goes on the next frame.
    act(() => void vi.advanceTimersByTime(50));
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("stays while the pointer moves onto it", () => {
    vi.useFakeTimers();
    render(<Rail />);
    const home = screen.getByRole("link", { name: "Home" });
    fireEvent.pointerEnter(home, { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(300));
    fireEvent.pointerLeave(home);
    fireEvent.pointerEnter(screen.getByRole("tooltip", { hidden: true }));
    act(() => void vi.advanceTimersByTime(500));
    expect(screen.getByRole("tooltip", { hidden: true })).toBeInTheDocument();
  });

  it("is dismissed by Escape while only hovered, with focus elsewhere", () => {
    vi.useFakeTimers();
    render(<Rail />);
    fireEvent.pointerEnter(screen.getByRole("link", { name: "Home" }), { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getByRole("tooltip", { hidden: true })).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "Escape" });
    act(() => void vi.advanceTimersByTime(50));
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("never shows for touch", () => {
    vi.useFakeTimers();
    render(<Rail />);
    fireEvent.pointerEnter(screen.getByRole("link", { name: "Home" }), { pointerType: "touch" });
    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("shows at once on keyboard focus and Escape dismisses it without moving focus", async () => {
    const user = userEvent.setup();
    render(<Rail />);
    await user.tab();
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveFocus();
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Home");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument());
    expect(home).toHaveFocus();
  });

  it("goes away on blur and when the page scrolls", async () => {
    const user = userEvent.setup();
    render(<Rail />);
    await user.tab();
    await user.tab();
    // The one for the item that lost focus finishes leaving on the next frame.
    await waitFor(() => expect(screen.getAllByRole("tooltip", { hidden: true })).toHaveLength(1));
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Inbox");
    fireEvent.scroll(window);
    await waitFor(() => expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument());
  });

  it("does not exist while the sidebar is open", async () => {
    const user = userEvent.setup();
    render(<Rail collapsed={false} />);
    await user.tab();
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  describe("exit", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    const withExitAnimation = () => stubExitAnimation("tooltip-out");

    it("fades out in place, takes no pointer, and is removed when the animation ends", async () => {
      mockReducedMotion(false);
      const user = userEvent.setup();
      render(<Rail />);
      await user.tab();
      const tip = screen.getByRole("tooltip", { hidden: true });
      expect(tip).toHaveAttribute("data-state", "open");
      const place = tip.getAttribute("style");
      withExitAnimation();
      await user.keyboard("{Escape}");
      expect(tip).toBeInTheDocument();
      expect(tip).toHaveAttribute("data-state", "closed");
      expect(tip).toHaveAttribute("style", place);
      act(() => endAnimation(tip));
      expect(tip).not.toBeInTheDocument();
    });

    it("is removed by a timeout when animationend never arrives", async () => {
      mockReducedMotion(false);
      const user = userEvent.setup();
      render(<Rail />);
      await user.tab();
      const tip = screen.getByRole("tooltip", { hidden: true });
      withExitAnimation();
      await user.keyboard("{Escape}");
      expect(tip).toBeInTheDocument();
      await waitFor(() => expect(tip).not.toBeInTheDocument(), { timeout: 1000 });
    });

    it("goes straight back to shown when it is asked for again during the exit", async () => {
      mockReducedMotion(false);
      const user = userEvent.setup();
      render(<Rail />);
      await user.tab();
      const home = screen.getByRole("link", { name: "Home" });
      const tip = screen.getByRole("tooltip", { hidden: true });
      withExitAnimation();
      await user.keyboard("{Escape}");
      expect(tip).toHaveAttribute("data-state", "closed");
      fireEvent.blur(home);
      fireEvent.focus(home);
      expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-state", "open");
      act(() => endAnimation(screen.getByRole("tooltip", { hidden: true })));
      expect(screen.getByRole("tooltip", { hidden: true })).toBeInTheDocument();
    });

    it("is removed at once under reduced motion", async () => {
      mockReducedMotion(true);
      const user = userEvent.setup();
      render(<Rail />);
      await user.tab();
      expect(screen.getByRole("tooltip", { hidden: true })).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
    });

    it("leaves with opacity only, for the exit duration and the exit easing", () => {
      expect(css).toMatch(
        /\.tooltip\[data-state="closed"\] \{[^}]*pointer-events: none;[^}]*tooltip-out var\(--lufia-motion-duration-exit\) var\(--lufia-motion-easing-in\)/,
      );
      expect(css).toMatch(/@keyframes tooltip-out \{\s*to \{\s*opacity: 0;\s*\}\s*\}/);
    });
  });

  it("has no axe violations with a tooltip showing", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<Rail />);
    await user.tab();
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
