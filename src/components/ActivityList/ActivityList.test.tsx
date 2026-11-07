import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { ActivityList, type ActivityItem } from "./ActivityList";

const css = readFileSync("src/components/ActivityList/ActivityList.module.css", "utf8");

const items: ActivityItem[] = [
  {
    id: "a",
    title: "Report published",
    meta: "By Ana",
    time: "2 h ago",
    dateTime: "2026-03-12T10:00:00Z",
    tone: "success",
  },
  {
    id: "b",
    title: "Export failed",
    time: "Yesterday",
    tone: "danger",
    toneLabel: "Failed",
    action: <a href="/b">Retry</a>,
  },
  { id: "c", title: "Note added", time: "12 Mar" },
];

describe("ActivityList", () => {
  it("renders an ordered list of entries with title, meta and time", () => {
    render(<ActivityList items={items} aria-label="Recent activity" />);
    const list = screen.getByRole("list", { name: "Recent activity" });
    expect(list.tagName).toBe("OL");
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText("By Ana")).toBeInTheDocument();
  });

  it("uses a time element when dateTime is given, a plain span otherwise", () => {
    render(<ActivityList items={items} />);
    expect(screen.getByText("2 h ago").tagName).toBe("TIME");
    expect(screen.getByText("2 h ago")).toHaveAttribute("datetime", "2026-03-12T10:00:00Z");
    expect(screen.getByText("12 Mar").tagName).toBe("SPAN");
  });

  it("reads the tone in words and renders the action", () => {
    render(<ActivityList items={items} />);
    expect(screen.getAllByRole("listitem")[1]!).toHaveTextContent("Failed: Export failed");
    expect(screen.getByRole("link", { name: "Retry" })).toBeInTheDocument();
  });

  it("draws the rail and a decorative marker per entry only with timeline", () => {
    const { container, rerender } = render(<ActivityList items={items} />);
    expect(container.querySelectorAll("[aria-hidden]")).toHaveLength(0);
    expect(container.firstElementChild).not.toHaveAttribute("data-timeline");
    rerender(<ActivityList items={items} timeline />);
    expect(container.firstElementChild).toHaveAttribute("data-timeline");
    expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(3);
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<ActivityList items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("positions the rail with logical properties, so it flips in right-to-left", () => {
    const rail = css.match(/\.rail::after \{([^}]*)\}/);
    expect(rail?.[1]).toMatch(/inset-inline-start/);
    expect(rail?.[1]).not.toMatch(/\b(left|right)\s*:/);
  });

  it("passes className and rest props to the list", () => {
    render(<ActivityList items={items} className="extra" data-testid="l" />);
    expect(screen.getByTestId("l")).toHaveClass("extra");
  });

  it("has no axe violations, plain and as a timeline", async () => {
    const { container } = render(
      <div>
        <ActivityList items={items} aria-label="Plain" />
        <ActivityList items={items} timeline aria-label="Timeline" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
