import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Tabs, type TabsItem } from "./Tabs";

const items: TabsItem[] = [
  { key: "a", label: "Overview", panel: <p>Overview panel</p> },
  { key: "b", label: "Work", panel: <p>Work panel</p> },
  { key: "c", label: "People", panel: <p>People panel</p>, disabled: true },
  { key: "d", label: "Reports", panel: <p>Reports panel</p> },
];

describe("Tabs", () => {
  it("renders a named tablist, tabs wired to their panels, and only the chosen panel", () => {
    render(<Tabs label="Sections" items={items} />);
    expect(screen.getByRole("tablist", { name: "Sections" })).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[0]!).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]!).toHaveAttribute("aria-selected", "false");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Overview panel");
    expect(panel).toHaveAttribute("aria-labelledby", tabs[0]!.id);
    expect(tabs[0]!).toHaveAttribute("aria-controls", panel.id);
    expect(tabs[1]!).not.toHaveAttribute("aria-controls");
    expect(screen.queryByText("Work panel")).not.toBeInTheDocument();
  });

  it("names the list with aria-labelledby", () => {
    render(
      <>
        <h2 id="heading">Sections</h2>
        <Tabs labelledBy="heading" items={items} />
      </>,
    );
    expect(screen.getByRole("tablist", { name: "Sections" })).toBeInTheDocument();
  });

  it("keeps exactly one tab in the tab order, the chosen one", () => {
    render(<Tabs label="Sections" items={items} defaultValue="b" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1, -1]);
  });

  it("chooses on click and reports it, uncontrolled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="Sections" items={items} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Work" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Work panel");
  });

  it("is controlled by value: it reports the change but waits for the parent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="Sections" items={items} value="a" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Work" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("moves focus and choice with the arrow keys, wrapping and skipping disabled tabs", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Sections" items={items} />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Work" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Work panel");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Reports" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Reports" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Reports" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Reports panel");
  });

  it("leaves the other axis' arrows alone", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Sections" items={items} />);
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
  });

  it("reverses Left and Right in right-to-left layouts", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <Tabs label="Sections" items={items} />
      </div>,
    );
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Work" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
  });

  it("uses Up and Down when vertical", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Sections" items={items} orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Work" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
  });

  it("with manual activation, arrows only move focus and Enter or Space chooses", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="Sections" items={items} activation="manual" onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Work" })).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Work panel");
    await user.keyboard("{ArrowRight}{ }");
    expect(onValueChange).toHaveBeenLastCalledWith("d");
  });

  it("returns the tab stop to the chosen tab after focus leaves a manual list", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tabs label="Sections" items={items} activation="manual" />
        <button type="button">After</button>
      </>,
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    await user.tab();
    // The panel is a tab stop after the list; the one after it is the next control.
    expect(screen.getByRole("tabpanel")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(screen.getAllByRole("tab").map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it("does not choose a disabled tab", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="Sections" items={items} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "People" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps hidden panels mounted with keepMounted", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Sections" items={items} keepMounted />);
    const work = screen.getByText("Work panel").closest('[role="tabpanel"]')!;
    expect(work).toHaveAttribute("hidden");
    expect(screen.getByRole("tab", { name: "Work" })).toHaveAttribute("aria-controls", work.id);
    await user.click(screen.getByRole("tab", { name: "Work" }));
    expect(work).not.toHaveAttribute("hidden");
  });

  it("forwards ref, className and rest props to the root", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Tabs label="Sections" items={items} ref={ref} className="extra" data-testid="root" />);
    expect(ref.current).toBe(screen.getByTestId("root"));
    expect(ref.current).toHaveClass("extra");
  });

  it("works controlled from state", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("a");
      return <Tabs label="Sections" items={items} value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole("tab", { name: "Reports" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Reports panel");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Tabs label="Sections" items={items} keepMounted />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when vertical and manual", async () => {
    const { container } = render(
      <Tabs label="Sections" items={items} orientation="vertical" activation="manual" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Tabs as links", () => {
  const links: TabsItem[] = items.map((item) => ({ ...item, href: `/${item.key}` }));

  it("renders a labelled nav of links with aria-current on the current one and no tablist", () => {
    render(<Tabs label="Sections" items={links} value="b" />);
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    const current = screen.getAllByRole("link").filter((link) => link.hasAttribute("aria-current"));
    expect(current).toHaveLength(1);
    expect(current[0]!).toHaveTextContent("Work");
    expect(current[0]!).toHaveAttribute("aria-current", "page");
  });

  it("renders through the configured link component", () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <Tabs label="Sections" items={links} value="a" />
      </LufiaProvider>,
    );
    expect(screen.getAllByRole("link")[0]!).toHaveAttribute("data-custom");
    expect(screen.getAllByRole("link")[1]!).toHaveAttribute("href", "/b");
  });

  it("keeps every link a normal tab stop, with no arrow-key roving", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Sections" items={links} value="a" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("link", { name: "Overview" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Work" })).toHaveFocus();
  });

  it("makes a disabled link inert", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Sections" items={links} value="a" />);
    const people = screen.getByRole("link", { name: "People" });
    expect(people).toHaveAttribute("aria-disabled", "true");
    expect(people).toHaveAttribute("tabindex", "-1");
    const clicked = vi.fn((event: Event) => event.defaultPrevented);
    document.addEventListener("click", clicked);
    await user.click(people);
    document.removeEventListener("click", clicked);
    expect(clicked).toHaveReturnedWith(true);
  });

  it("becomes a tablist when one item has no href", () => {
    render(<Tabs label="Sections" items={[links[0]!, { key: "x", label: "No link" }]} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Tabs label="Sections" items={links} value="a" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
