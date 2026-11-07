import { act, render, screen, waitFor } from "@testing-library/react";
import { axe } from "../../test/axe";
import { endAnimation, mockReducedMotion } from "../../test/motion";
import { Reveal } from "./Reveal";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** jsdom has no stylesheet, so pretend the exit animation is defined. */
function withAnimation() {
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    animationName: "reveal-out",
    animationDuration: "0.16s",
  } as CSSStyleDeclaration);
}

describe("Reveal", () => {
  it("renders shown content without animating it on mount", () => {
    render(<Reveal show>content</Reveal>);
    const root = screen.getByText("content");
    expect(root).toHaveAttribute("data-state", "open");
    expect(root).not.toHaveAttribute("data-animate");
  });

  it("renders nothing while hidden and animates the enter when shown", () => {
    const { rerender } = render(<Reveal show={false}>content</Reveal>);
    expect(screen.queryByText("content")).not.toBeInTheDocument();
    rerender(<Reveal show>content</Reveal>);
    expect(screen.getByText("content")).toHaveAttribute("data-animate");
  });

  it("animates on mount when appear is set", () => {
    render(
      <Reveal show appear>
        content
      </Reveal>,
    );
    expect(screen.getByText("content")).toHaveAttribute("data-animate");
  });

  it("stays mounted for the exit animation and unmounts when it ends", () => {
    withAnimation();
    const { rerender } = render(<Reveal show>content</Reveal>);
    rerender(<Reveal show={false}>content</Reveal>);
    const root = screen.getByText("content");
    expect(root).toHaveAttribute("data-state", "closed");
    act(() => endAnimation(root));
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("ignores animationend bubbling from a child", () => {
    withAnimation();
    const { rerender } = render(
      <Reveal show>
        <span>child</span>
      </Reveal>,
    );
    rerender(
      <Reveal show={false}>
        <span>child</span>
      </Reveal>,
    );
    act(() => endAnimation(screen.getByText("child")));
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("unmounts at once under reduced motion", () => {
    mockReducedMotion(true);
    const { rerender } = render(<Reveal show>content</Reveal>);
    rerender(<Reveal show={false}>content</Reveal>);
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("unmounts on the next frame when no animation is defined", async () => {
    const { rerender } = render(<Reveal show>content</Reveal>);
    rerender(<Reveal show={false}>content</Reveal>);
    expect(screen.getByText("content")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("content")).not.toBeInTheDocument());
  });

  it("re-enters if shown again during the exit", () => {
    withAnimation();
    const { rerender } = render(<Reveal show>content</Reveal>);
    rerender(<Reveal show={false}>content</Reveal>);
    rerender(<Reveal show>content</Reveal>);
    expect(screen.getByText("content")).toHaveAttribute("data-state", "open");
  });

  it("passes variant, className and rest props to the root", () => {
    render(
      <Reveal show variant="rise" className="x" data-testid="r">
        c
      </Reveal>,
    );
    const root = screen.getByTestId("r");
    expect(root).toHaveAttribute("data-variant", "rise");
    expect(root).toHaveClass("x");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Reveal show>
        <p>Hello</p>
      </Reveal>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("unmounts after the exit duration plus a margin when animationend never fires", () => {
    vi.useFakeTimers();
    try {
      withAnimation();
      const onExited = vi.fn();
      const { rerender } = render(
        <Reveal show onExited={onExited}>
          content
        </Reveal>,
      );
      rerender(
        <Reveal show={false} onExited={onExited}>
          content
        </Reveal>,
      );
      expect(screen.getByText("content")).toHaveAttribute("data-state", "closed");
      act(() => void vi.advanceTimersByTime(100));
      expect(screen.getByText("content")).toBeInTheDocument();
      act(() => void vi.advanceTimersByTime(300));
      expect(screen.queryByText("content")).not.toBeInTheDocument();
      expect(onExited).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not run the safety timeout after the animation ended or the content came back", () => {
    vi.useFakeTimers();
    try {
      withAnimation();
      const onExited = vi.fn();
      const { rerender } = render(
        <Reveal show onExited={onExited}>
          content
        </Reveal>,
      );
      rerender(
        <Reveal show={false} onExited={onExited}>
          content
        </Reveal>,
      );
      rerender(
        <Reveal show onExited={onExited}>
          content
        </Reveal>,
      );
      act(() => void vi.advanceTimersByTime(1000));
      expect(screen.getByText("content")).toHaveAttribute("data-state", "open");
      expect(onExited).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
