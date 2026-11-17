import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { LufiaProvider } from "../LufiaProvider";
import { Menu, type MenuEntry, type MenuProps } from "./Menu";

/** jsdom has no layout: every element gets a box so `useDismiss`, focus and the visible-item filter see rendered elements. */
const withLayout = () =>
  vi
    .spyOn(Element.prototype, "getClientRects")
    .mockReturnValue([new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);

afterEach(() => {
  vi.restoreAllMocks();
});

const items: MenuEntry[] = [
  { key: "apple", label: "Apple" },
  { key: "apricot", label: "Apricot", disabled: true },
  { key: "banana", label: "Banana", current: true },
  { key: "cherry", label: "Cherry" },
];

type SetupProps = Partial<MenuProps>;

function setup(props: SetupProps = {}) {
  withLayout();
  const user = userEvent.setup();
  const view = render(
    <>
      <button type="button">Before</button>
      <Menu
        label="Fruit"
        items={items}
        trigger={(triggerProps) => (
          <button type="button" {...triggerProps}>
            Open fruit
          </button>
        )}
        {...props}
      />
      <button type="button">After</button>
    </>,
  );
  return { user, view, trigger: screen.getByRole("button", { name: "Open fruit" }) };
}

/** The page-level `region` rule asks for landmarks around all content; a bare component in a test body has none. */
const PAGE_RULES_OFF = { rules: { region: { enabled: false } } };

/** Longer than the type-ahead reset, so earlier letters are forgotten. */
const pause = () => new Promise((resolve) => setTimeout(resolve, 550));

const gone = () => waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());

describe("Menu", () => {
  it("renders a closed trigger with the menu button ARIA and no list", () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens as a named menu of menuitems, linked to the trigger, in a portal", async () => {
    const { user, trigger, view } = setup();
    await user.click(trigger);
    const menu = screen.getByRole("menu", { name: "Fruit" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    expect(menu.parentElement).toBe(document.body);
    expect(view.container.contains(menu)).toBe(false);
  });

  it("focuses the current item on open, or the first with initialFocus=first", async () => {
    const first = setup();
    await first.user.click(first.trigger);
    expect(screen.getByRole("menuitem", { name: "Banana" })).toHaveFocus();
    first.view.unmount();
    const second = setup({ initialFocus: "first" });
    await second.user.click(second.trigger);
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus();
  });

  it("focuses the first item when none is current", async () => {
    const { user, trigger } = setup({
      items: [
        { key: "a", label: "Alpha" },
        { key: "b", label: "Beta" },
      ],
    });
    await user.click(trigger);
    expect(screen.getByRole("menuitem", { name: "Alpha" })).toHaveFocus();
  });

  it("opens with ArrowDown on the trigger, and ArrowUp opens on the last item", async () => {
    const { user, trigger } = setup({ initialFocus: "first" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await gone();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Cherry" })).toHaveFocus();
  });

  it("moves focus with the arrow keys, wrapping at both ends, and with Home and End", async () => {
    const { user, trigger } = setup({ initialFocus: "first" });
    await user.click(trigger);
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Cherry" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Cherry" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus();
  });

  it("keeps a single Tab stop that follows focus", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const stops = () => screen.getAllByRole("menuitem").filter((item) => item.tabIndex === 0);
    expect(stops().map((item) => item.textContent)).toEqual(["Banana"]);
    await user.keyboard("{ArrowDown}");
    expect(stops().map((item) => item.textContent)).toEqual(["Cherry"]);
  });

  it("jumps to the item that starts with the typed letters, and cycles on a repeated letter", async () => {
    const { user, trigger } = setup({ initialFocus: "first" });
    await user.click(trigger);
    await user.keyboard("c");
    expect(screen.getByRole("menuitem", { name: "Cherry" })).toHaveFocus();
    await pause();
    await user.keyboard("{Home}");
    await user.keyboard("apr");
    expect(screen.getByRole("menuitem", { name: "Apricot" })).toHaveFocus();
    await pause();
    await user.keyboard("{Home}");
    await user.keyboard("a");
    expect(screen.getByRole("menuitem", { name: "Apricot" })).toHaveFocus();
    await user.keyboard("a");
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus();
  });

  it("activates with Enter and Space, closes, returns focus to the trigger, then runs onSelect", async () => {
    const onSelect = vi.fn();
    const { user, trigger } = setup({
      initialFocus: "first",
      items: [
        { key: "a", label: "Alpha", onSelect },
        { key: "b", label: "Beta" },
      ],
    });
    await user.click(trigger);
    await user.keyboard("{Enter}");
    await gone();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard(" ");
    await gone();
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("stays open after a selection with closeOnSelect=false", async () => {
    const onSelect = vi.fn();
    const { user, trigger } = setup({
      closeOnSelect: false,
      items: [{ key: "a", label: "Alpha", onSelect }],
    });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Alpha" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("does not activate a disabled item, but it stays focusable and marked", async () => {
    const onSelect = vi.fn();
    const { user, trigger } = setup({
      initialFocus: "first",
      items: [
        { key: "a", label: "Alpha" },
        { key: "b", label: "Beta", disabled: true, onSelect },
      ],
    });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    const beta = screen.getByRole("menuitem", { name: "Beta" });
    expect(beta).toHaveFocus();
    expect(beta).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Enter}");
    await user.click(beta);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    await gone();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Tab and the next Tab moves on from the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.tab();
    await gone();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(trigger).not.toHaveFocus();
  });

  it("closes on a press outside and leaves focus where the press put it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "After" }));
    await gone();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("toggles closed from the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(trigger);
    await gone();
  });

  it("does not move focus when it starts open", () => {
    setup({ defaultOpen: true });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });

  it("goes through onOpenChange and follows a controlled open", async () => {
    const onOpenChange = vi.fn();
    const { user, trigger, view } = setup({ open: false, onOpenChange });
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    view.rerender(
      <Menu
        open
        onOpenChange={onOpenChange}
        label="Fruit"
        items={items}
        trigger={(props) => (
          <button type="button" {...props}>
            Open fruit
          </button>
        )}
      />,
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("returns focus to the trigger when the caller closes a controlled menu while focus is inside", async () => {
    withLayout();
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Menu
          open={open}
          onOpenChange={setOpen}
          label="Fruit"
          items={[{ key: "a", label: "Alpha", onSelect: () => setOpen(false) }]}
          closeOnSelect={false}
          trigger={(props) => (
            <button type="button" {...props}>
              Open fruit
            </button>
          )}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Open fruit" }));
    await user.click(screen.getByRole("menuitem", { name: "Alpha" }));
    await gone();
    expect(screen.getByRole("button", { name: "Open fruit" })).toHaveFocus();
  });

  it("renders link items through the provider with aria-current on the current one", async () => {
    const { user, trigger } = setup({
      items: [
        { key: "a", label: "Overview", href: "/overview", current: true },
        { key: "b", label: "Reports", href: "/reports" },
      ],
    });
    await user.click(trigger);
    const links = screen.getAllByRole("menuitem");
    expect(links[0]).toHaveAttribute("href", "/overview");
    expect(links[0]).toHaveAttribute("aria-current", "page");
    expect(links[1]).not.toHaveAttribute("aria-current");
  });

  it("uses the link adapter of the provider", async () => {
    withLayout();
    const user = userEvent.setup();
    render(
      <LufiaProvider
        linkComponent={({ href, children, ...rest }) => (
          <a data-adapter="yes" href={`/app${href}`} {...rest}>
            {children}
          </a>
        )}
      >
        <Menu
          label="Go"
          items={[{ key: "a", label: "Overview", href: "/overview" }]}
          trigger={(props) => (
            <button type="button" {...props}>
              Open
            </button>
          )}
        />
      </LufiaProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("menuitem", { name: "Overview" })).toHaveAttribute("href", "/app/overview");
  });

  describe("native link items", () => {
    const fileItems: MenuEntry[] = [
      { key: "a", label: "Alpha", href: "/files/a.csv", native: true, download: "a.csv", onSelect: vi.fn() },
      {
        key: "b",
        label: "Beta",
        href: "https://example.com/b",
        native: true,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      { key: "c", label: "Gamma", href: "/files/c.csv", native: true },
      { key: "d", label: "Delta" },
    ];

    it("renders a plain anchor with download, target and rel passed through, bypassing the link adapter", async () => {
      withLayout();
      const user = userEvent.setup();
      render(
        <LufiaProvider
          linkComponent={({ children, ...rest }) => (
            <a data-adapter="yes" {...rest}>
              {children}
            </a>
          )}
        >
          <Menu
            label="Export"
            items={fileItems}
            trigger={(props) => (
              <button type="button" {...props}>
                Open
              </button>
            )}
          />
        </LufiaProvider>,
      );
      await user.click(screen.getByRole("button", { name: "Open" }));
      const alpha = screen.getByRole("menuitem", { name: "Alpha" });
      expect(alpha.tagName).toBe("A");
      expect(alpha).toHaveAttribute("href", "/files/a.csv");
      expect(alpha).toHaveAttribute("download", "a.csv");
      expect(alpha).not.toHaveAttribute("data-adapter");
      const beta = screen.getByRole("menuitem", { name: "Beta" });
      expect(beta).toHaveAttribute("target", "_blank");
      expect(beta).toHaveAttribute("rel", "noopener noreferrer");
      const gamma = screen.getByRole("menuitem", { name: "Gamma" });
      expect(gamma).not.toHaveAttribute("download");
      expect(gamma).not.toHaveAttribute("target");
    });

    it("sets download as a boolean attribute", async () => {
      const { user, trigger } = setup({
        items: [{ key: "a", label: "Alpha", href: "/a", native: true, download: true }],
      });
      await user.click(trigger);
      expect(screen.getByRole("menuitem", { name: "Alpha" })).toHaveAttribute("download", "");
    });

    it("closes on activation, runs onSelect and returns focus to the trigger", async () => {
      const onSelect = vi.fn();
      const { user, trigger } = setup({
        initialFocus: "first",
        items: [{ key: "a", label: "Alpha", href: "#a", native: true, onSelect }],
      });
      await user.click(trigger);
      await user.keyboard("{Enter}");
      expect(onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    });

    it("activates with Space and stays open with closeOnSelect false", async () => {
      const onSelect = vi.fn();
      const { user, trigger } = setup({
        initialFocus: "first",
        closeOnSelect: false,
        items: [{ key: "a", label: "Alpha", href: "#a", native: true, onSelect }],
      });
      await user.click(trigger);
      await user.keyboard(" ");
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("moves with the arrow keys and type-ahead like every other item", async () => {
      const { user, trigger } = setup({ initialFocus: "first", items: fileItems });
      await user.click(trigger);
      expect(screen.getByRole("menuitem", { name: "Alpha" })).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("menuitem", { name: "Beta" })).toHaveFocus();
      await user.keyboard("d");
      expect(screen.getByRole("menuitem", { name: "Delta" })).toHaveFocus();
      await user.keyboard("{ArrowUp}{ArrowUp}");
      expect(screen.getByRole("menuitem", { name: "Beta" })).toHaveFocus();
      await user.keyboard("{End}");
      expect(screen.getByRole("menuitem", { name: "Delta" })).toHaveFocus();
    });

    it("does not activate a disabled native item and cancels the navigation", async () => {
      const onSelect = vi.fn();
      const { user, trigger } = setup({
        items: [{ key: "a", label: "Alpha", href: "/a", native: true, disabled: true, onSelect }],
      });
      await user.click(trigger);
      const alpha = screen.getByRole("menuitem", { name: "Alpha" });
      expect(alpha).toHaveAttribute("aria-disabled", "true");
      await user.click(alpha);
      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("works in the inline presentation and has no axe violations", async () => {
      withLayout();
      const onSelect = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <main>
          <Menu
            presentation="inline"
            label="Export"
            items={[{ key: "a", label: "Alpha", href: "#a", native: true, download: "a.csv", onSelect }]}
          />
        </main>,
      );
      expect(await axe(container, PAGE_RULES_OFF)).toHaveNoViolations();
      await user.click(screen.getByRole("menuitem", { name: "Alpha" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  it("activates a link item with Space", async () => {
    const onSelect = vi.fn();
    const { user, trigger } = setup({
      initialFocus: "first",
      items: [{ key: "a", label: "Overview", href: "#overview", onSelect }],
    });
    await user.click(trigger);
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders description, meta, icon, group headings and separators", async () => {
    const { user, trigger } = setup({
      items: [
        {
          key: "a",
          label: "Alpha",
          description: "First one",
          meta: "Ctrl+A",
          icon: <svg data-testid="icon" />,
        },
        { type: "separator", key: "sep" },
        { type: "group", key: "g", label: "More", items: [{ key: "b", label: "Beta" }] },
      ],
    });
    await user.click(trigger);
    expect(screen.getByText("First one")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+A")).toBeInTheDocument();
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("separator")).toBeInTheDocument();
    const group = screen.getByRole("group", { name: "More" });
    expect(group).toContainElement(screen.getByRole("menuitem", { name: "Beta" }));
  });

  it("skips the separators and headings when moving focus", async () => {
    const { user, trigger } = setup({
      initialFocus: "first",
      items: [
        { key: "a", label: "Alpha" },
        { type: "separator", key: "sep" },
        { type: "group", key: "g", label: "More", items: [{ key: "b", label: "Beta" }] },
      ],
    });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Beta" })).toHaveFocus();
  });

  describe("listbox", () => {
    const listbox = { role: "listbox" } as const;

    it("exposes options, the selected one aria-selected, and aria-haspopup=listbox", async () => {
      const { user, trigger } = setup(listbox);
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      await user.click(trigger);
      expect(screen.getByRole("listbox", { name: "Fruit" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
      expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Banana" })).toHaveFocus();
    });

    it("selects with Enter and closes", async () => {
      const onSelect = vi.fn();
      const { user, trigger } = setup({ ...listbox, items: [{ key: "a", label: "Alpha", onSelect }] });
      await user.click(trigger);
      await user.keyboard("{Enter}");
      expect(onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    });
  });

  it("passes className and rest props to the list", async () => {
    const { user, trigger } = setup({ className: "custom", "data-testid": "list" } as SetupProps);
    await user.click(trigger);
    expect(screen.getByTestId("list")).toBe(screen.getByRole("menu"));
    expect(screen.getByTestId("list")).toHaveClass("custom");
  });

  it("makes the list at least as wide as the trigger with matchTriggerWidth", async () => {
    const { user, trigger } = setup({ matchTriggerWidth: true });
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 180, 30));
    await user.click(trigger);
    expect(screen.getByRole("menu").style.minInlineSize).toBe("180px");
  });

  describe("inline", () => {
    function inline(props: Partial<MenuProps> = {}) {
      withLayout();
      const user = userEvent.setup();
      const view = render(<Menu presentation="inline" label="Fruit" items={items} {...props} />);
      return { user, view };
    }

    it("renders an always-visible list with no trigger", () => {
      const { view } = inline();
      expect(screen.getByRole("menu", { name: "Fruit" })).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(view.container.contains(screen.getByRole("menu"))).toBe(true);
    });

    it("is one Tab stop and navigates with the keyboard", async () => {
      const { user } = inline();
      await user.tab();
      expect(screen.getByRole("menuitem", { name: "Banana" })).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("menuitem", { name: "Cherry" })).toHaveFocus();
      await user.keyboard("{Home}");
      expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus();
    });

    it("runs onSelect and stays visible", async () => {
      const onSelect = vi.fn();
      const { user } = inline({ items: [{ key: "a", label: "Alpha", onSelect }] });
      await user.click(screen.getByRole("menuitem", { name: "Alpha" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("supports listbox mode", () => {
      inline({ role: "listbox" });
      expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("accessibility", () => {
    it("has no axe violations open as a menu", async () => {
      setup({
        defaultOpen: true,
        items: [
          ...items,
          { type: "separator", key: "s" },
          {
            type: "group",
            key: "g",
            label: "Group",
            items: [{ key: "x", label: "Xigua", href: "/x", current: true }],
          },
        ],
      });
      expect(await axe(document.body, PAGE_RULES_OFF)).toHaveNoViolations();
    });

    it("has no axe violations open as a listbox", async () => {
      setup({ defaultOpen: true, role: "listbox" });
      expect(await axe(document.body, PAGE_RULES_OFF)).toHaveNoViolations();
    });

    it("has no axe violations inline", async () => {
      withLayout();
      const { container } = render(<Menu presentation="inline" role="listbox" label="Fruit" items={items} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations closed", async () => {
      const { view } = setup();
      expect(await axe(view.container)).toHaveNoViolations();
    });
  });
});
