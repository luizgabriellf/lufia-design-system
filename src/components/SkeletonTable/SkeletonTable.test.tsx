import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { SkeletonTable } from "./SkeletonTable";

describe("SkeletonTable", () => {
  it("draws rows by columns, five by three by default, hidden from assistive technology", () => {
    const { container } = render(<SkeletonTable />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.children).toHaveLength(5);
    for (const row of Array.from(root.children)) expect(row.children).toHaveLength(3);
    expect(root.style.getPropertyValue("--skeleton-table-columns")).toBe("3");
  });

  it("takes rows, columns and the stacking width, and ignores counts below one", () => {
    const { container, rerender } = render(<SkeletonTable rows={2} columns={6} stackBelow="30rem" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.children).toHaveLength(2);
    expect(root.children[0]!.children).toHaveLength(6);
    expect(root).toHaveAttribute("data-columns", "6");
    expect(root.style.getPropertyValue("--skeleton-table-stack")).toBe("30rem");
    rerender(<SkeletonTable rows={0} columns={-1} />);
    expect(root.children).toHaveLength(5);
    expect(root.children[0]!.children).toHaveLength(3);
  });

  it("sizes every bar as a share of its own cell and passes still to every bar", () => {
    const { container } = render(<SkeletonTable still />);
    const bars = container.querySelectorAll<HTMLElement>("[data-variant='text']");
    expect(bars).toHaveLength(15);
    bars.forEach((bar) => {
      expect(bar.style.getPropertyValue("--skeleton-width")).toMatch(/^\d+%$/);
      expect(bar).toHaveAttribute("data-still");
    });
  });

  it("keeps className, style and rest props, and never lets them unhide it", () => {
    const { container } = render(
      <SkeletonTable className="mine" style={{ margin: "1rem" }} data-testid="t" aria-hidden={false} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("mine");
    expect(root.style.margin).toBe("1rem");
    expect(root).toHaveAttribute("data-testid", "t");
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div aria-busy="true">
        <SkeletonTable />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
