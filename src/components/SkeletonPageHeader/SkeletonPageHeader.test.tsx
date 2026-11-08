import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { SkeletonPageHeader } from "./SkeletonPageHeader";

describe("SkeletonPageHeader", () => {
  it("draws a title and a description line by default, hidden and without a heading or landmark", () => {
    const { container } = render(<SkeletonPageHeader />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.querySelectorAll("[data-variant='text']")).toHaveLength(2);
    expect(root.querySelectorAll("[data-variant='rect']")).toHaveLength(0);
    expect(root.querySelector("h1, h2, h3, h4, h5, h6, header")).toBeNull();
  });

  it("adds the eyebrow and one placeholder per action", () => {
    const { container } = render(<SkeletonPageHeader eyebrow actions={2} description={false} />);
    expect(container.querySelectorAll("[data-variant='text']")).toHaveLength(2);
    expect(container.querySelectorAll("[data-variant='rect']")).toHaveLength(2);
  });

  it("passes still to every bar and keeps className and rest props", () => {
    const { container } = render(<SkeletonPageHeader actions={1} still className="mine" data-testid="h" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("mine");
    expect(root).toHaveAttribute("data-testid", "h");
    root.querySelectorAll("[data-variant]").forEach((bar) => expect(bar).toHaveAttribute("data-still"));
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div aria-busy="true">
        <SkeletonPageHeader eyebrow actions={2} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
