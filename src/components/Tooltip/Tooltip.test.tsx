import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { endAnimation, mockReducedMotion, stubExitAnimation } from "../../test/motion";
import { Tooltip, type TooltipProps } from "./Tooltip";

const css = readFileSync("src/components/Tooltip/Tooltip.module.css", "utf8");

function Demo(props: Partial<TooltipProps>) {
  return (
    <>
      <Tooltip content="Save changes" {...props}>
        {(trigger) => (
          <button type="button" {...trigger}>
            Save
          </button>
        )}
      </Tooltip>
      <button type="button">Other</button>
    </>
  );
}

const tip = () => screen.queryByRole("tooltip");

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Tooltip", () => {
  it("shows after the hover delay, in the body, and describes the trigger", () => {
    vi.useFakeTimers();
    const { container } = render(<Demo />);
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.pointerEnter(button, { pointerType: "mouse" });
    expect(tip()).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(300));
    expect(tip()).toHaveTextContent("Save changes");
    expect(container).not.toContainElement(tip());
    expect(button).toHaveAccessibleDescription("Save changes");
    expect(button).not.toHaveAttribute("aria-labelledby");
  });

  it("honours a custom delay", () => {
    vi.useFakeTimers();
    render(<Demo delay={600} />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Save" }), { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(300));
    expect(tip()).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(400));
    expect(tip()).toBeInTheDocument();
  });

  it("never shows for a touch hover", () => {
    vi.useFakeTimers();
    render(<Demo />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Save" }), { pointerType: "touch" });
    act(() => void vi.advanceTimersByTime(1000));
    expect(tip()).not.toBeInTheDocument();
  });

  it("leaves with the pointer, and stays while the pointer is on it", () => {
    vi.useFakeTimers();
    render(<Demo />);
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.pointerEnter(button, { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(300));
    fireEvent.pointerLeave(button);
    fireEvent.pointerEnter(tip()!);
    act(() => void vi.advanceTimersByTime(500));
    expect(tip()).toBeInTheDocument();
    fireEvent.pointerLeave(tip()!);
    act(() => void vi.advanceTimersByTime(50));
    expect(tip()).not.toBeInTheDocument();
  });

  it("shows at once on keyboard focus, and Escape and blur dismiss it without moving focus", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    const button = screen.getByRole("button", { name: "Save" });
    expect(tip()).toHaveTextContent("Save changes");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(tip()).not.toBeInTheDocument());
    expect(button).toHaveFocus();
    fireEvent.blur(button);
    fireEvent.focus(button);
    expect(tip()).toBeInTheDocument();
    await user.tab();
    await waitFor(() => expect(tip()).not.toBeInTheDocument());
  });

  it("goes away when the page scrolls", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(tip()).toBeInTheDocument();
    fireEvent.scroll(window);
    await waitFor(() => expect(tip()).not.toBeInTheDocument());
  });

  it("is dismissed by Escape while only hovered", () => {
    vi.useFakeTimers();
    render(<Demo />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Save" }), { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(300));
    fireEvent.keyDown(document.body, { key: "Escape" });
    act(() => void vi.advanceTimersByTime(50));
    expect(tip()).not.toBeInTheDocument();
  });

  it("does nothing while disabled", async () => {
    const user = userEvent.setup();
    render(<Demo disabled />);
    await user.tab();
    expect(tip()).not.toBeInTheDocument();
  });

  it("with relation label, names the control through a hidden copy that is always in the DOM", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Search" relation="label">
        {(trigger) => <button type="button" {...trigger} />}
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "Search" });
    expect(button).not.toHaveAttribute("aria-describedby");
    await user.tab();
    const visible = screen.getByRole("tooltip", { hidden: true });
    expect(visible).toHaveAttribute("aria-hidden", "true");
    expect(button).toHaveAccessibleName("Search");
  });

  describe("placement", () => {
    /** jsdom has no layout: the trigger sits at `anchor`, the tooltip is 80 by 24, the viewport is 1024 by 768. */
    const withBoxes = (anchor: DOMRect) => {
      vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1024);
      vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(768);
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
        return this.getAttribute("role") === "tooltip" ? new DOMRect(0, 0, 80, 24) : anchor;
      });
    };

    it("opens above the trigger by default and centres on it", async () => {
      withBoxes(new DOMRect(400, 300, 40, 40));
      const user = userEvent.setup();
      render(<Demo />);
      await user.tab();
      expect(tip()).toHaveAttribute("data-side", "top");
      expect(tip()).toHaveStyle({ left: "380px", top: "268px" });
    });

    it("flips to the opposite side when it does not fit", async () => {
      withBoxes(new DOMRect(400, 4, 40, 20));
      const user = userEvent.setup();
      render(<Demo />);
      await user.tab();
      expect(tip()).toHaveAttribute("data-side", "bottom");
      expect(tip()).toHaveStyle({ top: "32px" });
    });

    it("opens to the inline end of the trigger", async () => {
      withBoxes(new DOMRect(100, 300, 40, 40));
      const user = userEvent.setup();
      render(<Demo placement="end" />);
      await user.tab();
      expect(tip()).toHaveAttribute("data-side", "end");
      expect(tip()).toHaveStyle({ left: "148px", top: "308px" });
    });
  });

  describe("exit and motion", () => {
    it("fades out in place, takes no pointer, and is removed when the animation ends", async () => {
      mockReducedMotion(false);
      const user = userEvent.setup();
      render(<Demo />);
      await user.tab();
      const node = tip()!;
      expect(node).toHaveAttribute("data-state", "open");
      stubExitAnimation("tooltip-out");
      await user.keyboard("{Escape}");
      expect(node).toHaveAttribute("data-state", "closed");
      act(() => endAnimation(node));
      expect(node).not.toBeInTheDocument();
    });

    it("is removed at once under reduced motion", async () => {
      mockReducedMotion(true);
      const user = userEvent.setup();
      render(<Demo />);
      await user.tab();
      expect(tip()).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(tip()).not.toBeInTheDocument();
    });

    it("animates opacity only, with the motion tokens, and sits on the tooltip layer", () => {
      expect(css).toMatch(/z-index:\s*var\(--lufia-z-tooltip\)/);
      expect(css).toMatch(
        /tooltip-in var\(--lufia-motion-duration-fast\) var\(--lufia-motion-easing-out\) backwards/,
      );
      expect(css).toMatch(
        /\.tooltip\[data-state="closed"\] \{[^}]*pointer-events: none;[^}]*tooltip-out var\(--lufia-motion-duration-exit\) var\(--lufia-motion-easing-in\)/,
      );
      expect(css).toMatch(/@keyframes tooltip-out \{\s*to \{\s*opacity: 0;\s*\}\s*\}/);
      expect(css).not.toMatch(/#|rgb\(|hsl\(/);
    });
  });

  it("has no axe violations with a tooltip showing", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<Demo />);
    await user.tab();
    expect(tip()).toBeInTheDocument();
    // The page rule asks for landmarks around all content; a test page has none, and the tooltip is not page content.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
