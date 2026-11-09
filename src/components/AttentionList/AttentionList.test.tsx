import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { AttentionList, type AttentionGroup, type AttentionItem } from "./AttentionList";

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

const groups: AttentionGroup[] = [
  {
    id: "overdue",
    tone: "danger",
    label: "Overdue",
    items: [
      { id: "a", title: "Renew the contract", meta: "12 days ago", href: "/a" },
      { id: "b", title: "Submit the audit", href: "/b", count: "3" },
    ],
  },
  { id: "soon", tone: "warning", label: "To resolve", count: "9", items: [{ id: "c", title: "Plain row" }] },
  { id: "none", tone: "info", label: "Nothing here", items: [] },
];

describe("AttentionList groups", () => {
  it("names each group's list with its label and count, and skips empty groups", () => {
    render(<AttentionList groups={groups} aria-label="Needs attention" />);
    const root = screen.getByRole("list", { name: "Needs attention" });
    expect(root).toHaveAttribute("data-layout", "groups");
    expect(root).not.toHaveAttribute("data-bar-style");
    expect(screen.getByRole("list", { name: "Overdue 2" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "To resolve 9" })).toBeInTheDocument();
    expect(screen.queryByText("Nothing here")).not.toBeInTheDocument();
  });

  it("makes the whole row one link holding title, meta and count", () => {
    render(<AttentionList groups={groups} aria-label="Needs attention" />);
    const first = screen.getByRole("link", { name: /Renew the contract/ });
    expect(first).toHaveAttribute("href", "/a");
    expect(first).toHaveTextContent("12 days ago");
    expect(screen.getByRole("link", { name: /Submit the audit/ })).toHaveTextContent("3");
  });

  it("makes the row a button with onSelect alone, and runs onSelect before a link navigates", () => {
    const onSelect = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <AttentionList
        aria-label="Needs attention"
        groups={[
          {
            id: "g",
            label: "Group",
            items: [
              { id: "button", title: "Press me", onSelect },
              { id: "link", title: "Follow me", href: "/x", onSelect },
            ],
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Press me" }));
    fireEvent.click(screen.getByRole("link", { name: "Follow me" }));
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("drops the per-row action when the row is itself a target, so targets never nest", () => {
    render(<AttentionList items={[{ id: "a", title: "Row", href: "/a", action: <a href="/b">Open</a> }]} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/a");
  });

  it("renders nothing when every group is empty", () => {
    const { container } = render(<AttentionList groups={[{ id: "g", label: "Group", items: [] }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no axe violations", async () => {
    const { container } = render(<AttentionList groups={groups} aria-label="Needs attention" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
