import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { StatusTimeline, type StatusTimelineTrack } from "./StatusTimeline";

const tracks: StatusTimelineTrack[] = [
  {
    id: "a",
    title: "Review",
    nodes: [
      { id: "1", label: "Submit", state: "done", stateLabel: "Done", timestampLabel: "5 Nov 2026, 10:00" },
      {
        id: "2",
        label: "Feedback",
        state: "overdue",
        stateLabel: "Overdue",
        deadlineLabel: "Due 1 Nov",
        hint: "Hint text",
      },
      {
        id: "3",
        label: "Confirm",
        state: "needsTimestamp",
        stateLabel: "Needs date",
        action: <button type="button">Save</button>,
      },
    ],
  },
  { id: "empty", title: "Release", nodes: [] },
];

describe("StatusTimeline", () => {
  it("renders a section per non-empty track and omits empty ones", () => {
    render(<StatusTimeline tracks={tracks} />);
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Release" })).not.toBeInTheDocument();
  });

  it("lists nodes in order with state in words", () => {
    render(<StatusTimeline tracks={tracks} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Done");
    expect(items[1]).toHaveTextContent("Overdue");
  });

  it("shows the timestamp, or the deadline only while there is no timestamp", () => {
    render(<StatusTimeline tracks={tracks} />);
    expect(screen.getByText("5 Nov 2026, 10:00")).toBeInTheDocument();
    expect(screen.getByText("Due 1 Nov")).toBeInTheDocument();
    expect(screen.getByText("Hint text")).toBeInTheDocument();
  });

  it("renders each state as the package StatusBadge, toned by state", () => {
    render(<StatusTimeline tracks={tracks} />);
    expect(screen.getByText("Done")).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("Overdue")).toHaveAttribute("data-tone", "danger");
    expect(screen.getByText("Needs date")).toHaveAttribute("data-tone", "neutral");
  });

  it("draws a distinct marker glyph per state, so states differ without colour", () => {
    const states = ["needsTimestamp", "pending", "overdue", "done", "notApplicable"] as const;
    const { container } = render(
      <StatusTimeline
        tracks={[
          {
            id: "all",
            title: "All",
            nodes: states.map((state) => ({ id: state, label: state, state, stateLabel: state })),
          },
        ]}
      />,
    );
    const glyphs = [...container.querySelectorAll("li svg path")].map((path) => path.getAttribute("d"));
    expect(glyphs).toHaveLength(states.length);
    expect(new Set(glyphs).size).toBe(states.length);
  });

  it("renders inline actions", () => {
    render(<StatusTimeline tracks={tracks} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders every state without axe violations", async () => {
    const all: StatusTimelineTrack = {
      id: "all",
      title: "All states",
      nodes: (["needsTimestamp", "pending", "overdue", "done", "notApplicable"] as const).map((state) => ({
        id: state,
        label: `Node ${state}`,
        state,
        stateLabel: state,
      })),
    };
    const { container } = render(<StatusTimeline tracks={[all]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
