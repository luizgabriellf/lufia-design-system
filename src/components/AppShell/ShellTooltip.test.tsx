import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";

function Rail({ collapsed = true }: { collapsed?: boolean }) {
  return (
    <Sidebar label="Main" collapsed={collapsed}>
      <SidebarGroup>
        <SidebarItem label="Home" href="/" />
        <SidebarItem label="Inbox" href="/inbox" />
      </SidebarGroup>
    </Sidebar>
  );
}

describe("rail tooltip", () => {
  afterEach(() => vi.useRealTimers());

  it("shows after a hover delay, in the body, and leaves when the pointer does", () => {
    vi.useFakeTimers();
    const { container } = render(<Rail />);
    const home = screen.getByRole("link", { name: "Home" });
    fireEvent.pointerEnter(home, { pointerType: "mouse" });
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(300));
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(tip).toHaveTextContent("Home");
    expect(container).not.toContainElement(tip);
    fireEvent.pointerLeave(home);
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("stays while the pointer moves onto it", () => {
    vi.useFakeTimers();
    render(<Rail />);
    const home = screen.getByRole("link", { name: "Home" });
    fireEvent.pointerEnter(home, { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(300));
    fireEvent.pointerLeave(home);
    fireEvent.pointerEnter(screen.getByRole("tooltip", { hidden: true }));
    act(() => void vi.advanceTimersByTime(500));
    expect(screen.getByRole("tooltip", { hidden: true })).toBeInTheDocument();
  });

  it("is dismissed by Escape while only hovered, with focus elsewhere", () => {
    vi.useFakeTimers();
    render(<Rail />);
    fireEvent.pointerEnter(screen.getByRole("link", { name: "Home" }), { pointerType: "mouse" });
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getByRole("tooltip", { hidden: true })).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("never shows for touch", () => {
    vi.useFakeTimers();
    render(<Rail />);
    fireEvent.pointerEnter(screen.getByRole("link", { name: "Home" }), { pointerType: "touch" });
    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("shows at once on keyboard focus and Escape dismisses it without moving focus", async () => {
    const user = userEvent.setup();
    render(<Rail />);
    await user.tab();
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveFocus();
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Home");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
    expect(home).toHaveFocus();
  });

  it("goes away on blur and when the page scrolls", async () => {
    const user = userEvent.setup();
    render(<Rail />);
    await user.tab();
    await user.tab();
    expect(screen.getAllByRole("tooltip", { hidden: true })).toHaveLength(1);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Inbox");
    fireEvent.scroll(window);
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("does not exist while the sidebar is open", async () => {
    const user = userEvent.setup();
    render(<Rail collapsed={false} />);
    await user.tab();
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("has no axe violations with a tooltip showing", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<Rail />);
    await user.tab();
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
