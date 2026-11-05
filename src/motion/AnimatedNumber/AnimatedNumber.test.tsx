import { act, render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { mockReducedMotion } from "../../test/motion";
import { AnimatedNumber } from "./AnimatedNumber";

beforeEach(() =>
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }),
);
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("AnimatedNumber", () => {
  it("renders the real value on first render", () => {
    render(<AnimatedNumber value={1200} format={(n) => n.toLocaleString("en-US")} />);
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("counts to the new value, passing through intermediate numbers", () => {
    const { rerender, container } = render(<AnimatedNumber value={0} duration={400} />);
    rerender(<AnimatedNumber value={100} duration={400} />);
    advance(16);
    advance(200);
    const middle = Number(container.textContent);
    expect(middle).toBeGreaterThan(0);
    expect(middle).toBeLessThan(100);
    expect(Number.isInteger(middle)).toBe(true);
    expect(container.firstElementChild).toHaveAttribute("data-animating");
    advance(600);
    expect(container.textContent).toBe("100");
    expect(container.firstElementChild).not.toHaveAttribute("data-animating");
  });

  it("starts from where it is when interrupted", () => {
    const { rerender, container } = render(<AnimatedNumber value={0} duration={400} />);
    rerender(<AnimatedNumber value={100} duration={400} />);
    advance(16);
    advance(150);
    const mid = Number(container.textContent);
    rerender(<AnimatedNumber value={0} duration={400} />);
    advance(16);
    expect(Number(container.textContent)).toBeLessThanOrEqual(mid);
    advance(600);
    expect(container.textContent).toBe("0");
  });

  it("keeps the precision of fractional targets", () => {
    const { rerender, container } = render(<AnimatedNumber value={0} duration={100} />);
    rerender(<AnimatedNumber value={1.25} duration={100} />);
    advance(500);
    expect(container.textContent).toBe("1.25");
  });

  it("shows the new value at once under reduced motion", () => {
    mockReducedMotion(true);
    const { rerender, container } = render(<AnimatedNumber value={1} />);
    rerender(<AnimatedNumber value={50} />);
    expect(container.textContent).toBe("50");
  });

  it("jumps within a frame when the duration token collapses", () => {
    const { rerender, container } = render(<AnimatedNumber value={1} duration={0} />);
    rerender(<AnimatedNumber value={9} duration={0} />);
    advance(32);
    expect(container.textContent).toBe("9");
  });

  it("reads the duration from the token when no prop is given", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => "0.01ms",
    } as unknown as CSSStyleDeclaration);
    const { rerender, container } = render(<AnimatedNumber value={1} />);
    rerender(<AnimatedNumber value={40} />);
    advance(32);
    expect(container.textContent).toBe("40");
  });

  it("has no axe violations", async () => {
    vi.useRealTimers();
    const { container } = render(
      <p>
        Total: <AnimatedNumber value={3} />
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
