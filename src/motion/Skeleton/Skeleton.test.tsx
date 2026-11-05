import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive technology by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces a loading message when given a label", () => {
    render(<Skeleton label="Loading invoices" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading invoices");
    expect(status).not.toHaveAttribute("aria-hidden");
  });

  it("sets size through custom properties and exposes variant and still", () => {
    const { container } = render(<Skeleton variant="circle" width="3rem" height="3rem" still />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--skeleton-width")).toBe("3rem");
    expect(root.style.getPropertyValue("--skeleton-height")).toBe("3rem");
    expect(root).toHaveAttribute("data-variant", "circle");
    expect(root).toHaveAttribute("data-still");
  });

  it("keeps caller style and className", () => {
    const { container } = render(<Skeleton className="x" style={{ margin: "1rem" }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("x");
    expect(root.style.margin).toBe("1rem");
  });

  it("has no axe violations, with and without a label", async () => {
    const { container } = render(
      <div aria-busy="true">
        <Skeleton label="Loading" />
        <Skeleton variant="rect" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
