import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";

function Example({
  collapsed = false,
  onCollapsedChange,
}: {
  collapsed?: boolean;
  onCollapsedChange?: (c: boolean) => void;
}) {
  return (
    <Sidebar
      label="Main"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      collapseLabel="Collapse sidebar"
      expandLabel="Expand sidebar"
      header={<strong>Brand</strong>}
      footer={<a href="/help">Help</a>}
    >
      <SidebarGroup label="Work">
        <SidebarItem label="Home" href="/" active />
        <SidebarItem label="Inbox" href="/inbox" badge={3} />
        <SidebarItem label="Export" onClick={() => {}} />
        <SidebarItem label="Locked" href="/locked" disabled />
      </SidebarGroup>
      <SidebarGroup label="Modules" collapsible defaultOpen={false}>
        <SidebarItem label="Reports" href="/reports" />
      </SidebarGroup>
    </Sidebar>
  );
}

describe("Sidebar", () => {
  it("has a labelled navigation with the header and footer slots around it", () => {
    render(<Example />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument();
  });

  it("marks only the current item with aria-current", () => {
    render(<Example />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Inbox/ })).not.toHaveAttribute("aria-current");
  });

  it("renders links for items with an href and buttons for the rest, disabled ones inert", () => {
    render(<Example />);
    expect(screen.getByRole("link", { name: /Inbox 3/ })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Locked" })).toBeDisabled();
  });

  it("lists items inside labelled groups", () => {
    render(<Example />);
    expect(screen.getByRole("group", { name: "Work" })).toBeInTheDocument();
    expect(screen.getAllByRole("list")[0]).toBeInTheDocument();
  });

  it("opens and closes a collapsible group with aria-expanded, hiding the items while closed", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const toggle = screen.getByRole("button", { name: "Modules" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const reports = screen.getByText("Reports");
    expect(reports.closest("[inert]")).not.toBeNull();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(reports.closest("[inert]")).toBeNull();
    expect(toggle).toHaveAttribute("aria-controls", expect.stringContaining("-items"));
  });

  it("reports the rail button and names it for the state it will move to", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    const { rerender } = render(<Example onCollapsedChange={onCollapsedChange} />);
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    rerender(<Example collapsed onCollapsedChange={onCollapsedChange} />);
    await user.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("keeps every name as a rail and leaves the tooltip to the tooltip, not the native title", () => {
    render(<Example collapsed />);
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).not.toHaveAttribute("title");
    // A rail shows collapsible groups' items too, since a closed group would hide icons.
    expect(screen.getByRole("link", { name: "Reports" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Modules" })).not.toBeInTheDocument();
  });

  it("passes className and data-* attributes through to the item", () => {
    render(
      <Sidebar label="Main">
        <SidebarGroup>
          <SidebarItem label="Home" href="/" className="hook" data={{ "data-tour": "home", "data-n": 2 }} />
          <SidebarItem label="Act" className="hook-b" data={{ "data-tour": "act" }} onClick={() => {}} />
        </SidebarGroup>
      </Sidebar>,
    );
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveClass("hook");
    expect(home).toHaveAttribute("data-tour", "home");
    expect(home).toHaveAttribute("data-n", "2");
    expect(screen.getByRole("button", { name: "Act" })).toHaveAttribute("data-tour", "act");
  });

  it("shows a count with its tone, caps it at 99+ and hides it at zero", () => {
    render(
      <Sidebar label="Main">
        <SidebarGroup>
          <SidebarItem label="Alerts" href="/a" count={4} countTone="danger" />
          <SidebarItem label="Exams" href="/e" count={250} />
          <SidebarItem label="Capped" href="/c" count={12} maxCount={9} />
          <SidebarItem label="Quiet" href="/q" count={0} />
          <SidebarItem label="Tagged" href="/t" badge="New" badgeTone="neutral" />
        </SidebarGroup>
      </Sidebar>,
    );
    expect(screen.getByText("4")).toHaveAttribute("data-tone", "danger");
    expect(screen.getByText("99+")).toHaveAttribute("data-tone", "neutral");
    expect(screen.getByText("9+")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quiet" })).toHaveTextContent(/^Quiet$/);
    expect(screen.getByText("New")).toHaveAttribute("data-tone", "neutral");
  });

  it("defaults a word badge to the warning tone", () => {
    render(<Example />);
    expect(screen.getByText("3")).toHaveAttribute("data-tone", "warning");
  });

  it("hides the word badge of an item that has a count, in the rail", () => {
    render(
      <Sidebar label="Main" collapsed>
        <SidebarGroup>
          <SidebarItem label="Both" href="/b" badge="New" count={3} />
          <SidebarItem label="Word" href="/w" badge="Fresh" />
        </SidebarGroup>
      </Sidebar>,
    );
    expect(screen.getByText("New")).toHaveAttribute("data-with-count");
    expect(screen.getByText("Fresh")).not.toHaveAttribute("data-with-count");
  });

  it("has no axe violations expanded or as a rail", async () => {
    const { container, rerender } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<Example collapsed />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
