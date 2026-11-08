import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { SkeletonCard } from "./SkeletonCard";

const bars = (root: Element, variant: string) => root.querySelectorAll(`[data-variant='${variant}']`);

describe("SkeletonCard", () => {
  it("draws a title bar and three lines inside a card, hidden from assistive technology", () => {
    const { container } = render(<SkeletonCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("data-padding", "md");
    expect(bars(root, "text")).toHaveLength(4);
    expect(bars(root, "rect")).toHaveLength(0);
    expect(root.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
  });

  it("makes the last line shorter, like the end of a paragraph", () => {
    const { container } = render(<SkeletonCard header={false} lines={2} />);
    const lines = Array.from(bars(container, "text")) as HTMLElement[];
    expect(lines).toHaveLength(2);
    expect(lines[1]!.style.getPropertyValue("--skeleton-width")).toBe("60%");
  });

  it("draws a block, 6rem by default or the given height, and follows the card padding", () => {
    const { container, rerender } = render(<SkeletonCard header={false} lines={0} block padding="lg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-padding", "lg");
    expect(bars(root, "text")).toHaveLength(0);
    const block = bars(root, "rect")[0] as HTMLElement;
    expect(block.style.getPropertyValue("--skeleton-height")).toBe("");
    rerender(<SkeletonCard header={false} lines={0} block="10rem" />);
    expect((bars(root, "rect")[0] as HTMLElement).style.getPropertyValue("--skeleton-height")).toBe("10rem");
  });

  it("passes still to every bar and keeps className", () => {
    const { container } = render(<SkeletonCard block still className="mine" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("mine");
    root.querySelectorAll("[data-variant]").forEach((bar) => expect(bar).toHaveAttribute("data-still"));
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div aria-busy="true">
        <SkeletonCard block />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
