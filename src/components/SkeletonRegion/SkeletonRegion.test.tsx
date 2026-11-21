import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { SkeletonTable } from "../SkeletonTable";
import { SkeletonRegion } from "./SkeletonRegion";

describe("SkeletonRegion", () => {
  it("announces the label from a status and marks the region busy", () => {
    render(
      <SkeletonRegion label="Loading invoices" data-testid="region">
        <SkeletonTable rows={2} columns={2} />
      </SkeletonRegion>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading invoices");
    expect(screen.getByTestId("region")).toHaveAttribute("aria-busy", "true");
  });

  it("keeps the placeholders out of the accessibility tree", () => {
    render(
      <SkeletonRegion label="Loading invoices" data-testid="region">
        <SkeletonTable rows={2} columns={2} />
      </SkeletonRegion>,
    );
    expect(screen.getByTestId("region")).toHaveTextContent(/^Loading invoices$/);
  });

  it("passes className and rest props to the root and stays busy", () => {
    render(
      <SkeletonRegion
        label="Loading"
        className="extra"
        id="orders-loading"
        aria-busy="false"
        data-testid="region"
      />,
    );
    const region = screen.getByTestId("region");
    expect(region).toHaveClass("extra");
    expect(region).toHaveAttribute("id", "orders-loading");
    expect(region).toHaveAttribute("aria-busy", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SkeletonRegion label="Loading invoices">
        <SkeletonTable rows={2} columns={2} />
      </SkeletonRegion>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
