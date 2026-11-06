import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { mockDialog } from "../../test/dialog";
import { mockReducedMotion } from "../../test/motion";
import { AppShell, type AppShellProps } from "./AppShell";
import { ShellPrimaryActionSlot, useShellPrimaryAction } from "./primaryAction";
import type { ReactNode } from "react";
import type { ShellNavGroup } from "./navigation";

const groups: ShellNavGroup[] = [
  {
    key: "main",
    items: [
      { key: "home", label: "Home", href: "/" },
      { key: "inbox", label: "Inbox", href: "/inbox", badge: 2 },
    ],
  },
  {
    key: "modules",
    label: "Modules",
    collapsible: true,
    items: [
      { key: "reports", label: "Reports", href: "/reports" },
      { key: "exports", label: "Exports", href: "/exports" },
    ],
  },
];

const labels: AppShellProps["labels"] = {
  skipToContent: "Skip to content",
  navigation: "Main navigation",
  menu: "Menu",
  floatBar: "Quick navigation",
  collapseSidebar: "Collapse sidebar",
  expandSidebar: "Expand sidebar",
};

function setup(props: Partial<AppShellProps> = {}) {
  return render(
    <AppShell
      groups={groups}
      labels={labels}
      currentPath="/inbox"
      brand={<span>Brand</span>}
      footer={<a href="/help">Help</a>}
      search={{ label: "Search…", onSelect: () => {}, shortcut: "Ctrl K" }}
      primaryAction={{ label: "New item", onSelect: () => {} }}
      {...props}
    >
      <h1>Page</h1>
    </AppShell>,
  );
}

describe("AppShell", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.unstubAllGlobals());

  it("renders the page in a single main landmark with a skip link to it", () => {
    setup();
    const main = screen.getByRole("main");
    expect(within(main).getByRole("heading", { name: "Page" })).toBeInTheDocument();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveAttribute("href", `#${main.id}`);
  });

  it("marks the item for currentPath and no other with aria-current", () => {
    setup();
    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Inbox");
  });

  it("takes a matcher in place of currentPath", () => {
    setup({ currentPath: undefined, isActive: (item) => item.key === "home" });
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("opens the group that holds the current page and keeps the others closed", () => {
    setup({ currentPath: "/reports" });
    expect(screen.getByRole("button", { name: "Modules" })).toHaveAttribute("aria-expanded", "true");
    setup({ currentPath: "/" });
    expect(screen.getAllByRole("button", { name: "Modules" })[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a closed group on arrival at a page inside it", () => {
    const { rerender } = setup({ currentPath: "/" });
    expect(screen.getByRole("button", { name: "Modules" })).toHaveAttribute("aria-expanded", "false");
    rerender(
      <AppShell groups={groups} labels={labels} currentPath="/exports">
        <h1>Page</h1>
      </AppShell>,
    );
    expect(screen.getByRole("button", { name: "Modules" })).toHaveAttribute("aria-expanded", "true");
  });

  it("turns the sidebar into a rail and back, reporting the change", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    const { container } = setup({ onCollapsedChange });
    const shell = container.firstElementChild!;
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(shell).toHaveAttribute("data-collapsed");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(shell).not.toHaveAttribute("data-collapsed");
  });

  it("starts as a rail with defaultCollapsed, and gives slots the state", () => {
    setup({ defaultCollapsed: true, brand: ({ collapsed }) => <span>{collapsed ? "B" : "Brand"}</span> });
    expect(screen.getAllByText("B").length).toBeGreaterThan(0);
  });

  it("hides the rail button when the sidebar is fixed", () => {
    setup({ fixedSidebar: true });
    expect(screen.queryByRole("button", { name: "Collapse sidebar" })).not.toBeInTheDocument();
  });

  it("opens the navigation sheet from the menu button, and a chosen link closes it", async () => {
    const user = userEvent.setup();
    setup();
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    await user.click(menu);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(menu).toHaveAttribute("aria-expanded", "true");
    const link = within(dialog).getByRole("link", { name: "Home" });
    link.addEventListener("click", (event) => event.preventDefault());
    await user.click(link);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("makes a clicked item look current at once while aria-current stays on the shown page", async () => {
    const user = userEvent.setup();
    setup();
    const sidebar = screen.getByRole("navigation", { name: "Main navigation" });
    const home = within(sidebar).getByRole("link", { name: "Home" });
    home.addEventListener("click", (event) => event.preventDefault());
    await user.click(home);
    expect(home).toHaveAttribute("data-active");
    expect(home).not.toHaveAttribute("aria-current");
    expect(within(sidebar).getByRole("link", { name: /Inbox/ })).toHaveAttribute("aria-current", "page");
    expect(within(sidebar).getByRole("link", { name: /Inbox/ })).not.toHaveAttribute("data-active");
  });

  it("runs onSelect for the search entries", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    setup({ search: { label: "Search…", onSelect } });
    await user.click(screen.getAllByRole("button", { name: /Search/ })[0]!);
    expect(onSelect).toHaveBeenCalled();
  });

  it("closes the sheet when the viewport grows past the breakpoint", async () => {
    const user = userEvent.setup();
    let matches = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return query.includes("min-width") ? matches : query.includes("reduced-motion");
      },
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }));
    setup();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    matches = true;
    act(() => listeners.forEach((fn) => fn()));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("has no axe violations, closed and with the sheet open", async () => {
    const user = userEvent.setup();
    const { container } = setup();
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("AppShell slots", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.unstubAllGlobals());

  const floatBar = () => screen.getByRole("group", { name: "Quick navigation" });

  describe("navigationPending", () => {
    it("shows the skeleton in place of the navigation, in the sidebar and in the sheet, and says it is busy", async () => {
      const user = userEvent.setup();
      setup({ navigationPending: <div data-testid="skeleton">Loading navigation</div> });
      const sidebar = screen.getByRole("navigation", { name: "Main navigation" });
      expect(sidebar).toHaveAttribute("aria-busy", "true");
      expect(within(sidebar).getByTestId("skeleton")).toBeInTheDocument();
      expect(within(sidebar).queryByRole("link", { name: "Home" })).toBeNull();
      await user.click(screen.getByRole("button", { name: "Menu" }));
      const sheet = within(screen.getByRole("dialog", { name: "Menu" }));
      expect(sheet.getByTestId("skeleton")).toBeInTheDocument();
      expect(sheet.queryByRole("link", { name: "Home" })).toBeNull();
    });

    it("renders the navigation normally without it", () => {
      setup();
      const sidebar = screen.getByRole("navigation", { name: "Main navigation" });
      expect(sidebar).not.toHaveAttribute("aria-busy");
      expect(within(sidebar).getByRole("link", { name: "Home" })).toBeInTheDocument();
    });
  });

  describe("topBar and statusRow", () => {
    it("render beside the sidebar, above the page and outside its landmark, in that order", () => {
      setup({ topBar: <div>Unit bar</div>, statusRow: <div>All synced</div> });
      const main = screen.getByRole("main");
      const top = screen.getByText("Unit bar");
      const status = screen.getByText("All synced");
      expect(main).not.toContainElement(top);
      expect(top.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(status.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("leave no empty wrappers when omitted, and keep main a direct child of the shell", () => {
      const { container } = setup();
      expect(container.querySelector(".contextBar, .statusRow, .content")).toBeNull();
      expect(screen.getByRole("main").parentElement).toBe(container.firstElementChild);
    });
  });

  describe("search", () => {
    it("shows the shortcut in a kbd, and names the shortcut and the popup for assistive technology", () => {
      setup({
        search: {
          label: "Search…",
          onSelect: () => {},
          shortcut: "Ctrl K",
          keyShortcuts: "Control+K",
          opensDialog: true,
        },
      });
      const entry = screen.getAllByRole("button", { name: /Search/ })[0]!;
      expect(entry).toHaveAttribute("aria-keyshortcuts", "Control+K");
      expect(entry).toHaveAttribute("aria-haspopup", "dialog");
      expect(within(entry).getByText("Ctrl K").tagName).toBe("KBD");
    });

    it("replaces the sidebar entry with searchTrigger, giving it the rail state, and keeps the float bar entry", () => {
      const { unmount } = setup({
        searchTrigger: ({ collapsed }) => <button type="button">{collapsed ? "Rail find" : "Find"}</button>,
      });
      expect(screen.getByRole("button", { name: "Find" })).toBeInTheDocument();
      expect(within(floatBar()).getByRole("button", { name: /Search/ })).toBeInTheDocument();
      unmount();
      setup({
        defaultCollapsed: true,
        searchTrigger: ({ collapsed }) => <button type="button">{collapsed ? "Rail find" : "Find"}</button>,
      });
      expect(screen.getByRole("button", { name: "Rail find" })).toBeInTheDocument();
    });

    it("has no sidebar entry when searchTrigger is null", () => {
      setup({ search: undefined, searchTrigger: null });
      expect(screen.queryByRole("button", { name: /Search/ })).toBeNull();
    });
  });

  it("names an item with its own aria-label", () => {
    setup({
      groups: [
        {
          key: "main",
          items: [{ key: "inbox", label: "Inbox", href: "/inbox", ariaLabel: "Inbox, 3 unread" }],
        },
      ],
    });
    expect(screen.getAllByRole("link", { name: "Inbox, 3 unread" }).length).toBeGreaterThan(0);
  });

  describe("static headings and base groups", () => {
    it("labels a non-collapsible group with a static heading and leaves a label-less group as a plain run", () => {
      setup({
        groups: [
          { key: "base", items: [{ key: "home", label: "Home", href: "/" }] },
          { key: "work", label: "Work", items: [{ key: "inbox", label: "Inbox", href: "/inbox" }] },
        ],
      });
      const sidebar = screen.getByRole("navigation", { name: "Main navigation" });
      expect(within(sidebar).getByRole("group", { name: "Work" })).toBeInTheDocument();
      expect(within(sidebar).queryByRole("button", { name: "Work" })).toBeNull();
      expect(within(sidebar).getAllByRole("group")).toHaveLength(2);
      expect(within(sidebar).getAllByRole("group")[0]).not.toHaveAccessibleName();
    });
  });

  describe("data attributes on the floating bar", () => {
    it("passes data-* to the search, primary and menu controls", () => {
      setup({
        search: { label: "Search…", onSelect: () => {}, data: { "data-tour": "search" } },
        primaryAction: { label: "New item", onSelect: () => {}, data: { "data-tour": "primary" } },
        menuData: { "data-tour": "menu" },
      });
      expect(within(floatBar()).getByRole("button", { name: /Search/ })).toHaveAttribute(
        "data-tour",
        "search",
      );
      expect(within(floatBar()).getByRole("button", { name: /New item/ })).toHaveAttribute(
        "data-tour",
        "primary",
      );
      expect(within(floatBar()).getByRole("button", { name: "Menu" })).toHaveAttribute("data-tour", "menu");
    });

    it("reaches a primary action rendered as a link", () => {
      setup({ primaryAction: { label: "New item", href: "/new", data: { "data-tour": "primary" } } });
      expect(within(floatBar()).getByRole("link", { name: /New item/ })).toHaveAttribute(
        "data-tour",
        "primary",
      );
    });
  });

  describe("primary action registration", () => {
    function Page({
      action,
      children,
    }: {
      action: Parameters<typeof useShellPrimaryAction>[0];
      children?: ReactNode;
    }) {
      const hosted = useShellPrimaryAction(action);
      return (
        <section>
          <p>{hosted ? "hosted" : "own trigger"}</p>
          {children}
        </section>
      );
    }

    const renderShell = (children: ReactNode, props: Partial<AppShellProps> = {}) =>
      render(
        <AppShell groups={groups} labels={labels} {...props}>
          <ShellPrimaryActionSlot />
          {children}
        </AppShell>,
      );

    it("shows a page's registered action on the floating bar and in the desktop slot, replacing the shell default", () => {
      renderShell(<Page action={{ label: "New order" }} />, { primaryAction: { label: "Default action" } });
      expect(within(floatBar()).getByRole("button", { name: "New order" })).toBeInTheDocument();
      expect(within(screen.getByRole("main")).getByRole("button", { name: "New order" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Default action" })).toBeNull();
      expect(screen.getByText("hosted")).toBeInTheDocument();
    });

    it("falls back to the shell's primaryAction, and to nothing", () => {
      const { unmount } = renderShell(null, { primaryAction: { label: "Default action", href: "/new" } });
      expect(within(screen.getByRole("main")).getByRole("link", { name: "Default action" })).toHaveAttribute(
        "href",
        "/new",
      );
      unmount();
      renderShell(null);
      expect(within(screen.getByRole("main")).queryByRole("button")).toBeNull();
    });

    it("calls the latest onSelect, and the previous action returns when the newer page unmounts", async () => {
      const user = userEvent.setup();
      const first = vi.fn();
      const second = vi.fn();
      function Pages({ showSecond }: { showSecond: boolean }) {
        return (
          <>
            <Page action={{ label: "First", onSelect: first }} />
            {showSecond ? <Page action={{ label: "Second", onSelect: second }} /> : null}
          </>
        );
      }
      const { rerender } = renderShell(<Pages showSecond />);
      expect(within(floatBar()).queryByRole("button", { name: "First" })).toBeNull();
      await user.click(within(floatBar()).getByRole("button", { name: "Second" }));
      expect(second).toHaveBeenCalledTimes(1);
      rerender(
        <AppShell groups={groups} labels={labels}>
          <ShellPrimaryActionSlot />
          <Pages showSecond={false} />
        </AppShell>,
      );
      await user.click(within(floatBar()).getByRole("button", { name: "First" }));
      expect(first).toHaveBeenCalledTimes(1);
    });

    it("updates a registration in place: the newer page keeps winning when the older one changes", () => {
      const view = (first: string) => (
        <AppShell groups={groups} labels={labels}>
          <Page action={{ label: first }} />
          <Page action={{ label: "Second" }} />
        </AppShell>
      );
      const { rerender } = render(view("First"));
      expect(within(floatBar()).getByRole("button", { name: "Second" })).toBeInTheDocument();
      rerender(view("First, renamed"));
      expect(within(floatBar()).getByRole("button", { name: "Second" })).toBeInTheDocument();
      expect(within(floatBar()).queryByRole("button", { name: "First, renamed" })).toBeNull();
    });

    it("forwards the action's data attributes in the desktop slot, as a button and as a link", () => {
      const { unmount } = renderShell(<Page action={{ label: "New", data: { "data-tour": "x" } }} />);
      expect(within(screen.getByRole("main")).getByRole("button", { name: "New" })).toHaveAttribute(
        "data-tour",
        "x",
      );
      unmount();
      renderShell(<Page action={{ label: "New", href: "/new", data: { "data-tour": "y" } }} />);
      expect(within(screen.getByRole("main")).getByRole("link", { name: "New" })).toHaveAttribute(
        "data-tour",
        "y",
      );
    });

    it("updates when the label changes and unregisters on unmount", () => {
      const { rerender } = renderShell(<Page action={{ label: "One" }} />);
      expect(within(floatBar()).getByRole("button", { name: "One" })).toBeInTheDocument();
      rerender(
        <AppShell groups={groups} labels={labels}>
          <Page action={{ label: "Two" }} />
        </AppShell>,
      );
      expect(within(floatBar()).getByRole("button", { name: "Two" })).toBeInTheDocument();
      rerender(
        <AppShell groups={groups} labels={labels}>
          <Page action={null} />
        </AppShell>,
      );
      expect(within(floatBar()).queryByRole("button", { name: "Two" })).toBeNull();
    });

    it("reports that no shell hosts the action outside one", () => {
      render(<Page action={{ label: "New order" }} />);
      expect(screen.getByText("own trigger")).toBeInTheDocument();
    });

    it("renders nothing from the slot outside a shell", () => {
      const { container } = render(<ShellPrimaryActionSlot />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('sheetAs="dialog"', () => {
    let dialogMock: ReturnType<typeof mockDialog>;
    beforeEach(() => {
      dialogMock = mockDialog();
    });
    afterEach(() => {
      cleanup();
      dialogMock.restore();
    });

    it("opens the phone navigation in a native dialog and closes it on Escape", async () => {
      const user = userEvent.setup();
      setup({ sheetAs: "dialog" });
      await user.click(screen.getByRole("button", { name: "Menu" }));
      const dialog = screen.getByRole("dialog", { name: "Menu" });
      expect(dialog.tagName).toBe("DIALOG");
      expect(dialogMock.showModal).toHaveBeenCalledTimes(1);
      expect(within(dialog).getByRole("link", { name: "Home" })).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
    });

    it("keeps the portal sheet by default", async () => {
      const user = userEvent.setup();
      setup();
      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(screen.getByRole("dialog", { name: "Menu" }).tagName).toBe("DIV");
      expect(dialogMock.showModal).not.toHaveBeenCalled();
    });
  });
});
