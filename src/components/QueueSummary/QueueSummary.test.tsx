import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { QueueSummary, type QueueSummaryItem } from "./QueueSummary";

const base = {
  clearLabel: (count: number) => `${count} clear`,
  allClearTitle: "All clear",
  allClearBody: "Nothing waits for you",
};
const mixed: QueueSummaryItem[] = [
  { id: "a", label: "Alpha", count: 2, tone: "warning", href: "/a", hint: "Hint a" },
  { id: "b", label: "Bravo", count: 0, href: "/b", hint: "Hint b", "data-queue": "b" },
  { id: "c", label: "Charlie", count: 5, tone: "danger", href: "/c" },
  { id: "d", label: "Delta", count: null, href: "/d" },
  { id: "e", label: "Echo", count: 1, href: "/e" },
];

describe("QueueSummary", () => {
  it("leads with open queues by tone, then unknown ones, and folds the zeros", () => {
    render(<QueueSummary {...base} items={mixed} />);
    const rows = within(screen.getAllByRole("list")[0]!).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent?.slice(0, 5))).toEqual(["Charl", "Alpha", "Echo1", "Delta"]);
    expect(screen.getByText("1 clear")).toBeInTheDocument();
  });

  it("does not sort the array it was given", () => {
    const items = [...mixed];
    render(<QueueSummary {...base} items={items} />);
    expect(items.map((item) => item.id)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("keeps a destination for each empty queue behind the fold", async () => {
    const user = userEvent.setup();
    render(<QueueSummary {...base} items={mixed} />);
    await user.click(screen.getByText("1 clear"));
    const link = screen.getByRole("link", { name: /Bravo/ });
    expect(link).toHaveAttribute("href", "/b");
    expect(link.closest("[data-queue]")).toHaveAttribute("data-queue", "b");
  });

  it("shows the all-clear only when every count is exactly zero", () => {
    const zeros: QueueSummaryItem[] = [
      { id: "a", label: "Alpha", count: 0, href: "/a" },
      { id: "b", label: "Bravo", count: 0, href: "/b" },
    ];
    const { rerender } = render(<QueueSummary {...base} items={zeros} />);
    expect(screen.getByText("All clear")).toBeInTheDocument();
    expect(screen.getByText("2 clear")).toBeInTheDocument();
    rerender(<QueueSummary {...base} items={[...zeros, { id: "c", label: "Charlie", count: null }]} />);
    expect(screen.queryByText("All clear")).toBeNull();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the formatted value and the unknown figure", () => {
    render(
      <QueueSummary
        {...base}
        unknownValue="n/a"
        items={[
          { id: "a", label: "Alpha", count: 1200, value: "1.2k" },
          { id: "b", label: "Bravo", count: null },
        ]}
      />,
    );
    expect(screen.getByText("1.2k")).toBeInTheDocument();
    expect(screen.getByText("n/a")).toBeInTheDocument();
  });

  it("renders nothing without items", () => {
    const { container } = render(<QueueSummary {...base} items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no axe violations open, folded or all clear", async () => {
    const { container, rerender } = render(<QueueSummary {...base} items={mixed} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<QueueSummary {...base} items={[{ id: "a", label: "Alpha", count: 0, href: "/a" }]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
