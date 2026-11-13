import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Checklist, type ChecklistItem } from "./Checklist";

const items: ChecklistItem[] = [
  { key: "a", text: "Check the date", status: "done" },
  { key: "b", text: "Clear the route", status: "attention", hint: "Blocked last visit" },
  { key: "c", text: "Replace the signs" },
];
const statusLabels = { todo: "To do", done: "Done", attention: "Needs attention" };

describe("Checklist", () => {
  it("renders a list item per entry, named by the title", () => {
    render(<Checklist items={items} title="Inspection" statusLabels={statusLabels} />);
    const list = screen.getByRole("list", { name: "Inspection" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Blocked last visit")).toBeInTheDocument();
  });

  it("reads the status in words before the text, so colour and shape are never the only signal", () => {
    render(<Checklist items={items} statusLabels={statusLabels} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Done: Check the date");
    expect(rows[1]).toHaveTextContent("Needs attention: Clear the route");
    expect(rows[2]).toHaveTextContent("To do: Replace the signs");
  });

  it("defaults the status to todo and exposes it as a data attribute", () => {
    render(<Checklist items={items} />);
    expect(screen.getAllByRole("listitem").map((row) => row.getAttribute("data-status"))).toEqual([
      "done",
      "attention",
      "todo",
    ]);
  });

  it("adds no hidden text for a status without a label", () => {
    render(<Checklist items={items} statusLabels={{ done: "Done" }} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Done: Check the date");
    expect(rows[2]).toHaveTextContent(/^Replace the signs$/);
  });

  it("is read-only: no checkbox, no tab stop", () => {
    const { container } = render(<Checklist items={items} statusLabels={statusLabels} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(container.querySelector("button, a, input, [tabindex]")).toBeNull();
  });

  it("names the list with aria-label when there is no title", () => {
    render(<Checklist items={items} aria-label="Inspection" />);
    expect(screen.getByRole("list", { name: "Inspection" })).toBeInTheDocument();
  });

  it("exposes the density", () => {
    const { container, rerender } = render(<Checklist items={items} />);
    expect(container.firstElementChild).toHaveAttribute("data-density", "md");
    rerender(<Checklist items={items} density="sm" />);
    expect(container.firstElementChild).toHaveAttribute("data-density", "sm");
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<Checklist items={[]} title="Empty" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("passes className and rest props to the root", () => {
    render(<Checklist items={items} className="extra" data-testid="c" />);
    expect(screen.getByTestId("c")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Checklist items={items} title="Inspection" statusLabels={statusLabels} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
