import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { DetailList } from "./DetailList";

const rows = [
  { label: "Name", value: "Ada" },
  { label: "Identifier", value: "A-1042", mono: true },
];

describe("DetailList", () => {
  it("renders each row as a term and a definition", () => {
    render(<DetailList rows={rows} />);
    expect(screen.getAllByRole("term")).toHaveLength(2);
    expect(screen.getAllByRole("definition")).toHaveLength(2);
    expect(screen.getByText("A-1042")).toHaveClass("mono");
    expect(screen.getByText("Ada")).not.toHaveClass("mono");
  });

  it("accepts React nodes as values and forwards className", () => {
    const { container } = render(
      <DetailList className="extra" rows={[{ label: "Link", value: <a href="#x">Go</a> }]} />,
    );
    expect(container.querySelector("dl")).toHaveClass("extra");
    expect(screen.getByRole("link", { name: "Go" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<DetailList rows={rows} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
