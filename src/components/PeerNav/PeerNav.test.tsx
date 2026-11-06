import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { PeerNav, type PeerNavItem } from "./PeerNav";

const tabs: PeerNavItem[] = [
  { key: "a", label: "Overview", description: "Totals", icon: <svg data-testid="icon" /> },
  { key: "b", label: "Work" },
  { key: "c", label: "People", disabled: true },
  { key: "d", label: "Reports" },
];
const links = tabs.map((item) => ({ ...item, href: `/${item.key}` }));

function Controlled({ items }: { items: PeerNavItem[] }) {
  const [value, setValue] = useState("a");
  return <PeerNav label="Views" items={items} value={value} onValueChange={setValue} />;
}

describe("PeerNav as links", () => {
  it("renders a labelled nav of links with aria-current on the current one only", () => {
    render(<PeerNav label="Views" items={links} value="b" />);
    const nav = screen.getByRole("navigation", { name: "Views" });
    expect(nav).toHaveAttribute("data-mode", "links");
    const current = screen.getAllByRole("link").filter((link) => link.hasAttribute("aria-current"));
    expect(current).toHaveLength(1);
    expect(current[0]!).toHaveTextContent("Work");
    expect(current[0]!).toHaveAttribute("aria-current", "page");
  });

  it("navigates through the configured link component", () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <PeerNav label="Views" items={links} value="a" />
      </LufiaProvider>,
    );
    expect(screen.getAllByRole("link")[0]!).toHaveAttribute("data-custom");
  });

  it("moves the chosen styling at once on a plain click, while aria-current stays on the shown page", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PeerNav label="Views" items={links} value="a" onValueChange={onValueChange} />);
    const work = screen.getByRole("link", { name: /Work/ });
    await user.click(work);
    expect(onValueChange).toHaveBeenCalledWith("b", expect.anything());
    expect(work).toHaveAttribute("data-active");
    expect(work).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: /Overview/ })).toHaveAttribute("aria-current", "page");
  });

  it("ignores modified clicks and the current item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PeerNav label="Views" items={links} value="a" onValueChange={onValueChange} />);
    await user.keyboard("{Control>}");
    await user.click(screen.getByRole("link", { name: /Work/ }));
    await user.keyboard("{/Control}");
    await user.click(screen.getByRole("link", { name: /Overview/ }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("blocks a disabled link", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PeerNav label="Views" items={links} value="a" onValueChange={onValueChange} />);
    const disabled = screen.getByRole("link", { name: /People/ });
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    await user.click(disabled);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("scrolls from five items", () => {
    const { rerender } = render(<PeerNav label="Views" items={links} value="a" />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-layout", "fit");
    rerender(<PeerNav label="Views" items={[...links, { key: "e", label: "More", href: "/e" }]} value="a" />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-layout", "scroll");
  });

  it("has no axe violations", async () => {
    const { container } = render(<PeerNav label="Views" items={links} value="a" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("PeerNav as tabs", () => {
  it("becomes a tablist when an item has no href", () => {
    render(<PeerNav label="Views" items={[links[0]!, tabs[1]!]} defaultValue="a" />);
    expect(screen.getByRole("tablist", { name: "Views" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("selects through aria-selected with a single tab stop", () => {
    render(<PeerNav label="Views" items={tabs} defaultValue="b" />);
    const [a, b, , d] = screen.getAllByRole("tab");
    expect([a!, b!, d!].map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
    expect([a!, b!, d!].map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("moves with the arrow keys, wraps, skips disabled tabs and supports Home and End", async () => {
    const user = userEvent.setup();
    render(<Controlled items={tabs} />);
    screen.getByRole("tab", { name: /Overview/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Work/ })).toHaveFocus();
    expect(screen.getByRole("tab", { name: /Work/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Reports/ })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Overview/ })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: /Reports/ })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: /Overview/ })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /Reports/ })).toHaveFocus();
  });

  it("selects on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PeerNav label="Views" items={tabs} defaultValue="a" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: /Reports/ }));
    expect(onValueChange).toHaveBeenCalledWith("d");
    expect(screen.getByRole("tab", { name: /Reports/ })).toHaveAttribute("aria-selected", "true");
  });

  it("links a tab to its panel", () => {
    render(<PeerNav label="Views" id="views" items={[{ ...tabs[0]!, controls: "panel-a" }, tabs[1]!]} />);
    const tab = screen.getByRole("tab", { name: /Overview/ });
    expect(tab).toHaveAttribute("aria-controls", "panel-a");
    expect(tab).toHaveAttribute("id", "views-tab-a");
  });

  it("has no axe violations", async () => {
    const { container } = render(<PeerNav label="Views" items={tabs} defaultValue="a" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("PeerNav onItemClick", () => {
  it("fires for the current item and for modified clicks, which onValueChange ignores", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const onValueChange = vi.fn();
    render(
      <PeerNav
        label="Views"
        items={links}
        value="a"
        onItemClick={onItemClick}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("link", { name: /Overview/ }));
    expect(onItemClick).toHaveBeenLastCalledWith("a", expect.anything());
    await user.keyboard("{Control>}");
    await user.click(screen.getByRole("link", { name: /Work/ }));
    await user.keyboard("{/Control}");
    expect(onItemClick).toHaveBeenLastCalledWith("b", expect.anything());
    expect(onItemClick).toHaveBeenCalledTimes(2);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("takes over for links: a prevented click skips onValueChange and the pending state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PeerNav
        label="Views"
        items={links}
        value="a"
        onValueChange={onValueChange}
        onItemClick={(_, event) => event.preventDefault()}
      />,
    );
    await user.click(screen.getByRole("link", { name: /Work/ }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("takes over for tabs: a prevented click selects nothing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PeerNav
        label="Views"
        items={tabs}
        defaultValue="a"
        onValueChange={onValueChange}
        onItemClick={(_, event) => event.preventDefault()}
      />,
    );
    await user.click(screen.getByRole("tab", { name: /Work/ }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: /Work/ })).toHaveAttribute("aria-selected", "false");
  });

  it("does not fire for a disabled item", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(<PeerNav label="Views" items={links} value="a" onItemClick={onItemClick} />);
    await user.click(screen.getByRole("link", { name: /People/ }));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("lets the handler take over: a prevented click does not move the indicator", async () => {
    const user = userEvent.setup();
    render(
      <PeerNav label="Views" items={links} value="a" onItemClick={(_, event) => event.preventDefault()} />,
    );
    const work = screen.getByRole("link", { name: /Work/ });
    await user.click(work);
    expect(work).not.toHaveAttribute("data-active");
  });

  it("fires for tabs before the selection changes", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(
      <PeerNav
        label="Views"
        items={tabs}
        defaultValue="a"
        onItemClick={(key) => calls.push(`click:${key}`)}
        onValueChange={(key) => calls.push(`change:${key}`)}
      />,
    );
    await user.click(screen.getByRole("tab", { name: /Work/ }));
    await user.click(screen.getByRole("tab", { name: /Work/ }));
    expect(calls).toEqual(["click:b", "change:b", "click:b", "change:b"]);
  });
});

describe("PeerNav phoneGrid", () => {
  it("marks four fitting items for the 2x2 phone grid", () => {
    render(<PeerNav label="Views" items={links} phoneGrid="2x2" />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-phone-grid", "2x2");
  });

  it("leaves other counts, scrolling navs and the default alone", () => {
    const { rerender } = render(<PeerNav label="Views" items={links.slice(0, 3)} phoneGrid="2x2" />);
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-phone-grid");
    rerender(<PeerNav label="Views" items={links} phoneGrid="2x2" layout="scroll" />);
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-phone-grid");
    rerender(<PeerNav label="Views" items={links} />);
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-phone-grid");
  });
});
