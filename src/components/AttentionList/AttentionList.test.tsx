import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { AttentionList, type AttentionItem } from "./AttentionList";

const items: AttentionItem[] = [
  {
    id: "a",
    tone: "danger",
    toneLabel: "Overdue",
    title: "Renew the contract",
    meta: "3 days late",
    action: <a href="/a">Open</a>,
  },
  { id: "b", tone: "warning", title: "Review the draft" },
  { id: "c", title: "Plain item" },
];

describe("AttentionList", () => {
  it("renders one list item per entry with title, meta and action", () => {
    render(<AttentionList items={items} aria-label="Needs attention" />);
    const list = screen.getByRole("list", { name: "Needs attention" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText("3 days late")).toBeInTheDocument();
    expect(within(rows[0]!).getByRole("link", { name: "Open" })).toBeInTheDocument();
  });

  it("reads the tone in words before the title, so colour is never the only signal", () => {
    render(<AttentionList items={items} />);
    expect(screen.getAllByRole("listitem")[0]!).toHaveTextContent("Overdue: Renew the contract");
  });

  it("exposes the tone, neutral by default", () => {
    render(<AttentionList items={items} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows.map((row) => row.getAttribute("data-tone"))).toEqual(["danger", "warning", "neutral"]);
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<AttentionList items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("passes className and rest props to the list", () => {
    render(<AttentionList items={items} className="extra" data-testid="l" />);
    expect(screen.getByTestId("l")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(<AttentionList items={items} aria-label="Needs attention" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws the edge bar by default and the inset bar on request", () => {
    const { rerender } = render(<AttentionList items={items} aria-label="Needs attention" />);
    expect(screen.getByRole("list")).toHaveAttribute("data-bar-style", "edge");
    rerender(<AttentionList items={items} barStyle="inset" aria-label="Needs attention" />);
    expect(screen.getByRole("list")).toHaveAttribute("data-bar-style", "inset");
  });
});
