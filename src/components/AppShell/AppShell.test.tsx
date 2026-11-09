import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { axe } from "../../test/axe";
import { mockDialog } from "../../test/dialog";
import { mockReducedMotion } from "../../test/motion";
import { AppShell, type AppShellProps } from "./AppShell";
import {
  ShellPrimaryActionOwner,
  ShellPrimaryActionSlot,
  useShellPrimaryAction,
  useShellPrimaryActionState,
} from "./primaryAction";
import { readFileSync } from "node:fs";
import { useState, type ReactNode } from "react";
import type { ShellNavGroup } from "./navigation";

const css = readFileSync("src/components/AppShell/AppShell.module.css", "utf8");

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

  it("renders the saved rail and open groups on the server, so the first paint is already right", () => {
    const render = (props: Partial<AppShellProps>) =>
      renderToString(
        <AppShell groups={groups} labels={labels} currentPath="/" {...props}>
          <h1>Page</h1>
        </AppShell>,
      );
    expect(render({ defaultCollapsed: true })).toMatch(/class="[^"]*shell[^"]*"[^>]*data-collapsed/);
    expect(render({})).not.toContain("data-collapsed");
    expect(render({ defaultOpenGroups: ["modules"] })).toContain('aria-expanded="true"');
    expect(render({ defaultOpenGroups: [] })).toContain('aria-expanded="false"');
  });

  it("passes nav item counts, tone, class and data-* down to the links", () => {
    setup({
      groups: [
        {
          key: "g",
          items: [
            {
              key: "alerts",
              label: "Alerts",
              href: "/alerts",
              count: 150,
              countTone: "danger",
              badge: "New",
              badgeTone: "neutral",
              className: "app-hook",
              data: { "data-tour": "alerts" },
            },
            { key: "quiet", label: "Quiet", href: "/quiet", count: 0 },
          ],
        },
      ],
    });
    const [link] = screen.getAllByRole("link", { name: /^Alerts/ });
    expect(link).toHaveClass("app-hook");
    expect(link).toHaveAttribute("data-tour", "alerts");
    expect(within(link!).getByText("99+")).toHaveAttribute("data-tone", "danger");
    expect(within(link!).getByText("New")).toHaveAttribute("data-tone", "neutral");
    expect(screen.getAllByRole("link", { name: "Quiet" })[0]).toHaveTextContent(/^Quiet$/);
  });

  it("takes attributes for the main landmark and follows its id with the skip link", () => {
    setup({ mainProps: { id: "content", className: "page-area", "data-page": "x", tabIndex: -1 } });
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "content");
    expect(main).toHaveClass("page-area");
    expect(main).toHaveAttribute("data-page", "x");
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#content");
  });

  it("remounts the main landmark and its page when mainKey changes, and only then", () => {
    function Probe() {
      const [stamp] = useState(() => Math.random());
      return <p data-stamp={stamp}>probe</p>;
    }
    const render1 = (key: string) => (
      <AppShell groups={groups} labels={labels} mainKey={key}>
        <Probe />
      </AppShell>
    );
    const { rerender } = render(render1("a"));
    const first = screen.getByText("probe");
    const main = screen.getByRole("main");
    rerender(render1("a"));
    expect(screen.getByText("probe")).toBe(first);
    rerender(render1("b"));
    expect(screen.getByText("probe")).not.toBe(first);
    expect(screen.getByRole("main")).not.toBe(main);
  });

  it("puts mainStart inside main, before the page, and leaves statusRow outside it", () => {
    setup({ mainStart: <div role="note">Trial ends soon</div>, statusRow: <p>Offline</p> });
    const main = screen.getByRole("main");
    const note = within(main).getByRole("note");
    const page = within(main).getByRole("heading", { name: "Page" });
    expect(note.compareDocumentPosition(page) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(main).queryByText("Offline")).not.toBeInTheDocument();
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("shows a tooltip, not a native title, on the rail's search entry", async () => {
    const user = userEvent.setup();
    setup({ defaultCollapsed: true });
    const entry = screen.getAllByRole("button", { name: "Search…" })[0]!;
    expect(entry).not.toHaveAttribute("title");
    await user.tab();
    await user.tab();
    await user.tab();
    entry.focus();
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Search…");
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

  it("names the menu button and the sheet's close button with openMenu and closeMenu when given", async () => {
    const user = userEvent.setup();
    setup({ labels: { ...labels, openMenu: "Open menu", closeMenu: "Close menu" } });
    const menu = screen.getByRole("button", { name: "Open menu" });
    await user.click(menu);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(within(dialog).getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("keeps the menu name on the button and the provider's close label on the sheet without them", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(
      within(screen.getByRole("dialog", { name: "Menu" })).getByRole("button", { name: "Close" }),
    ).toBeInTheDocument();
  });

  it("hides the floating bar on wide screens and the slot on phones whatever the stylesheet order", () => {
    // One class from MobileFloatBar or Button that loads later must not win: the shell's rules are scoped under it.
    expect(css).toMatch(/\.shell \.float \{\s*display: none;/);
    expect(css).toMatch(/@media \(width < 60rem\)[\s\S]*\.shell \.primarySlot \{\s*display: none;/);
    expect(css).not.toMatch(/^\.float,?\s/m);
  });

  it("closes the sheet when a footer link is followed", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const help = within(dialog).getByRole("link", { name: "Help" });
    help.addEventListener("click", (event) => event.preventDefault());
    await user.click(help);
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

  it("keeps the floating bar over the open sheet, with the menu button turned into the close button", async () => {
    const user = userEvent.setup();
    setup({ labels: { ...labels, openMenu: "Open menu", closeMenu: "Close menu" } });
    const opener = screen.getByRole("button", { name: "Open menu" });
    expect(opener).toHaveAttribute("aria-expanded", "false");
    await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const dock = within(dialog).getByRole("group", { name: "Quick navigation" });
    const close = within(dock).getByRole("button", { name: "Close menu" });
    expect(close).not.toHaveAttribute("aria-haspopup");
    expect(close.querySelector("[data-open]")).not.toBeNull();
    expect(within(dock).getByRole("button", { name: "Search…" })).toBeInTheDocument();
    // The page's own bar stands back while its copy is on top; it says the menu is open.
    expect(opener).toHaveAttribute("aria-expanded", "true");
    expect(opener.closest('[role="group"]')).toHaveAttribute("data-menu-open");
    expect(css).toMatch(/\.shell \.float\[data-menu-open\] \{\s*visibility: hidden;/);
    expect(dock.querySelector('[data-lufia-part="float-bar-scrim"]')).toBeNull();
    await user.click(close);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
    expect(opener).toHaveAttribute("aria-expanded", "false");
    expect(opener.closest('[role="group"]')).not.toHaveAttribute("data-menu-open");
  });

  it("closes the sheet before a search or the main action from the bar over it", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const onAction = vi.fn();
    setup({
      search: { label: "Search…", onSelect: onSearch },
      primaryAction: { label: "New item", onSelect: onAction },
    });
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Search…" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onSearch).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "New item" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("closes from a drag down too, and the bar is back in step", async () => {
    const user = userEvent.setup();
    setup();
    const opener = screen.getByRole("button", { name: "Menu" });
    await user.click(opener);
    const grabber = document.querySelector<HTMLElement>("[data-swipe]")!;
    fireEvent.pointerDown(grabber, { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(grabber, { pointerId: 1, clientY: 200, pointerType: "touch" });
    fireEvent.pointerMove(grabber, { pointerId: 1, clientY: 300, pointerType: "touch" });
    act(() => {
      fireEvent.pointerUp(grabber, { pointerId: 1, clientY: 300, pointerType: "touch" });
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(opener).toHaveAttribute("aria-expanded", "false");
    expect(opener.closest('[role="group"]')).not.toHaveAttribute("data-menu-open");
    await user.click(opener);
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
  });

  it("turns the close icon back while the sheet leaves, whichever way it was closed", () => {
    expect(css).toMatch(
      /:global\(\[data-lufia-part="nav-sheet-layer"\]\[data-state="closed"\]\) \.menuGlyph\[data-open\] \.menuGlyphMenu \{\s*opacity: 1;/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.menuGlyph\[data-open\] \.menuGlyphMenu,/,
    );
  });

  it("keeps the end of the page clear of the floating bar", () => {
    expect(css).toMatch(
      /calc\(var\(--lufia-app-shell-float-clearance, 6\.5rem\) \+ env\(safe-area-inset-bottom\)\)/,
    );
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

    it("can be added and removed at runtime without remounting the page", () => {
      const view = (bars: boolean) => (
        <AppShell
          groups={groups}
          labels={labels}
          topBar={bars ? <div>Unit bar</div> : undefined}
          statusRow={bars ? <div>All synced</div> : undefined}
        >
          <input aria-label="Draft" />
        </AppShell>
      );
      const { rerender } = render(view(false));
      const main = screen.getByRole("main");
      const input = screen.getByLabelText("Draft");
      rerender(view(true));
      expect(screen.getByText("Unit bar")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBe(main);
      expect(screen.getByLabelText("Draft")).toBe(input);
      rerender(view(false));
      expect(screen.getByRole("main")).toBe(main);
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

    it("sizes the desktop slot: md by default, a Button size, or touch for 44px", () => {
      const { unmount } = renderShell(null, { primaryAction: { label: "Default action" } });
      const slot = () => within(screen.getByRole("main")).getByRole("button", { name: "Default action" });
      expect(slot()).toHaveAttribute("data-size", "md");
      expect(slot()).not.toHaveAttribute("data-touch");
      unmount();
      for (const [size, data, touch] of [
        ["lg", "lg", false],
        ["touch", "md", true],
      ] as const) {
        const view = render(
          <AppShell groups={groups} labels={labels} primaryAction={{ label: "Default action" }}>
            <ShellPrimaryActionSlot size={size} />
          </AppShell>,
        );
        expect(slot()).toHaveAttribute("data-size", data);
        if (touch) expect(slot()).toHaveAttribute("data-touch", "true");
        else expect(slot()).not.toHaveAttribute("data-touch");
        view.unmount();
      }
      expect(css).toMatch(/\.primarySlot\[data-touch\] \{\s*min-block-size: 2\.75rem;/);
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

    it("exposes the current action and its description through useShellPrimaryActionState", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const seen: Array<ReturnType<typeof useShellPrimaryActionState>> = [];
      function Reader() {
        const state = useShellPrimaryActionState();
        seen.push(state);
        return state?.action ? (
          <button type="button" onClick={state.action.onSelect}>
            {`Palette: ${state.action.label} (${state.action.description ?? "none"})`}
          </button>
        ) : null;
      }
      const { rerender } = render(
        <AppShell groups={groups} labels={labels} primaryAction={{ label: "Default action" }}>
          <Reader />
        </AppShell>,
      );
      expect(seen.at(-1)).toMatchObject({ isFallback: true, action: { label: "Default action" } });
      rerender(
        <AppShell groups={groups} labels={labels} primaryAction={{ label: "Default action" }}>
          <Reader />
          <Page action={{ label: "New order", description: "Start an order", onSelect }} />
        </AppShell>,
      );
      expect(seen.at(-1)).toMatchObject({ isFallback: false });
      await user.click(screen.getByRole("button", { name: "Palette: New order (Start an order)" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("returns null from useShellPrimaryActionState outside a shell", () => {
      let state: ReturnType<typeof useShellPrimaryActionState> | undefined;
      function Reader() {
        state = useShellPrimaryActionState();
        return null;
      }
      render(<Reader />);
      expect(state).toBeNull();
    });

    it("marks the shell's default as a fallback while a ShellPrimaryActionOwner is in the page", () => {
      const markup = renderToString(
        <AppShell groups={groups} labels={labels} primaryAction={{ label: "Default action" }}>
          <ShellPrimaryActionSlot />
          <ShellPrimaryActionOwner />
        </AppShell>,
      );
      expect(markup).toContain("data-lufia-shell-primary-owner");
      expect(markup).toMatch(/data-fallback="true"/);
      expect(css).toMatch(
        /\.shell:has\(\[data-lufia-shell-primary-owner\]\) \.float \[data-fallback\][^{]*\{\s*visibility: hidden/,
      );
      render(<ShellPrimaryActionOwner />);
      expect(document.querySelector("[data-lufia-shell-primary-owner]")).toHaveAttribute("hidden");
    });
  });

  describe("context slot, sheet control and primary action details", () => {
    it("renders the context slot in the sidebar and in the sheet, telling each its surface", async () => {
      const user = userEvent.setup();
      const surfaces: string[] = [];
      setup({
        context: ({ surface, collapsed }) => {
          surfaces.push(`${surface}:${collapsed}`);
          return <div role="region" aria-label={`Context ${surface}`} />;
        },
      });
      expect(screen.getByRole("region", { name: "Context sidebar" })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(within(screen.getByRole("dialog")).getByRole("region", { name: "Context sheet" })).toBeVisible();
      expect(surfaces).toContain("sidebar:false");
      expect(surfaces).toContain("sheet:false");
    });

    it("puts the context in the sheet's fixed part, outside the scrolling body, and in the body with hideSheetNavigation", async () => {
      const user = userEvent.setup();
      const { unmount } = setup({ context: <div role="region" aria-label="Scope" /> });
      await user.click(screen.getByRole("button", { name: "Menu" }));
      let region = within(screen.getByRole("dialog")).getByRole("region", { name: "Scope" });
      expect(region.closest("[data-sheet-body]")).toBeNull();
      expect(region.closest('[data-lufia-part="nav-sheet-context"]')).not.toBeNull();
      unmount();
      setup({ context: <div role="region" aria-label="Scope" />, hideSheetNavigation: true });
      await user.click(screen.getByRole("button", { name: "Menu" }));
      region = within(screen.getByRole("dialog")).getByRole("region", { name: "Scope" });
      expect(region.closest("[data-sheet-body]")).not.toBeNull();
    });

    it("gives the rail state to the sidebar context only", () => {
      const seen: string[] = [];
      setup({
        defaultCollapsed: true,
        context: ({ surface, collapsed }) => {
          seen.push(`${surface}:${collapsed}`);
          return null;
        },
      });
      expect(seen).toContain("sidebar:true");
    });

    it("lets a slot close the sheet through closeSheet", async () => {
      const user = userEvent.setup();
      setup({
        context: ({ surface, closeSheet }) =>
          surface === "sheet" ? (
            <button type="button" onClick={closeSheet}>
              Done
            </button>
          ) : null,
      });
      await user.click(screen.getByRole("button", { name: "Menu" }));
      await user.click(screen.getByRole("button", { name: "Done" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("lets a slot open the sheet through openSheet", async () => {
      const user = userEvent.setup();
      setup({
        topBarEnd: undefined,
        brand: ({ surface, openSheet }) =>
          surface === "topBar" ? (
            <button type="button" onClick={openSheet}>
              Switch
            </button>
          ) : null,
      });
      await user.click(screen.getByRole("button", { name: "Switch" }));
      expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    });

    it("hides the navigation in the sheet but not in the sidebar with hideSheetNavigation", async () => {
      const user = userEvent.setup();
      setup({ hideSheetNavigation: true, context: <div role="note">Picker</div> });
      await user.click(screen.getByRole("button", { name: "Menu" }));
      const dialog = screen.getByRole("dialog", { name: "Menu" });
      expect(within(dialog).queryByRole("navigation")).toBeNull();
      expect(within(dialog).getByRole("note")).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    });

    it("controls the sheet from outside and reports a close", async () => {
      const user = userEvent.setup();
      const onMenuOpenChange = vi.fn();
      const { rerender } = setup({ menuOpen: false, onMenuOpenChange });
      expect(screen.queryByRole("dialog")).toBeNull();
      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(onMenuOpenChange).toHaveBeenLastCalledWith(true);
      expect(screen.queryByRole("dialog")).toBeNull();
      rerender(
        <AppShell groups={groups} labels={labels} menuOpen onMenuOpenChange={onMenuOpenChange}>
          <h1>Page</h1>
        </AppShell>,
      );
      expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(onMenuOpenChange).toHaveBeenLastCalledWith(false);
    });

    it("reports a change of the sheet only when it changes: not on a desktop click, once per phone tap", async () => {
      const user = userEvent.setup();
      const onMenuOpenChange = vi.fn();
      setup({ onMenuOpenChange });
      const sidebar = screen.getByRole("navigation", { name: "Main navigation" });
      const home = within(sidebar).getByRole("link", { name: "Home" });
      home.addEventListener("click", (event) => event.preventDefault());
      await user.click(home);
      expect(onMenuOpenChange).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(onMenuOpenChange).toHaveBeenCalledTimes(1);
      expect(onMenuOpenChange).toHaveBeenLastCalledWith(true);

      const link = within(screen.getByRole("dialog", { name: "Menu" })).getByRole("link", { name: "Home" });
      link.addEventListener("click", (event) => event.preventDefault());
      await user.click(link);
      expect(onMenuOpenChange).toHaveBeenCalledTimes(2);
      expect(onMenuOpenChange).toHaveBeenLastCalledWith(false);
    });

    it("reports one close for a followed footer link", async () => {
      const user = userEvent.setup();
      const onMenuOpenChange = vi.fn();
      setup({ onMenuOpenChange });
      await user.click(screen.getByRole("button", { name: "Menu" }));
      onMenuOpenChange.mockClear();
      const help = within(screen.getByRole("dialog", { name: "Menu" })).getByRole("link", { name: "Help" });
      help.addEventListener("click", (event) => event.preventDefault());
      await user.click(help);
      expect(onMenuOpenChange).toHaveBeenCalledTimes(1);
    });

    it("still reopens a controlled sheet the owner refused to open", async () => {
      const user = userEvent.setup();
      const onMenuOpenChange = vi.fn();
      setup({ menuOpen: false, onMenuOpenChange });
      await user.click(screen.getByRole("button", { name: "Menu" }));
      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(onMenuOpenChange).toHaveBeenCalledTimes(2);
    });

    it("calls onIntent on pointer entry and focus of the floating-bar action and of the slot", async () => {
      const user = userEvent.setup();
      const onIntent = vi.fn();
      setup({ primaryAction: { label: "New item", onIntent } });
      await user.hover(within(floatBar()).getByRole("button", { name: /New item/ }));
      expect(onIntent).toHaveBeenCalledTimes(1);
      onIntent.mockClear();
      render(
        <AppShell
          groups={groups}
          labels={labels}
          primaryAction={{ label: "Slot item", href: "/n", onIntent }}
        >
          <ShellPrimaryActionSlot />
        </AppShell>,
      );
      screen.getAllByRole("link", { name: /Slot item/ }).forEach((link) => link.focus());
      expect(onIntent).toHaveBeenCalled();
    });

    it("calls onIntent on the floating bar when the action is a link", async () => {
      const user = userEvent.setup();
      const onIntent = vi.fn();
      setup({ primaryAction: { label: "Go on", href: "/go", onIntent } });
      await user.hover(within(floatBar()).getByRole("link", { name: /Go on/ }));
      expect(onIntent).toHaveBeenCalledTimes(1);
    });

    it("passes a registered action's onIntent through, always the latest one", async () => {
      const user = userEvent.setup();
      const first = vi.fn();
      const second = vi.fn();
      function Page({ onIntent }: { onIntent: () => void }) {
        useShellPrimaryAction({ label: "Page act", onIntent });
        return <ShellPrimaryActionSlot />;
      }
      const tree = (onIntent: () => void) => (
        <AppShell groups={groups} labels={labels}>
          <Page onIntent={onIntent} />
        </AppShell>
      );
      const { rerender } = render(tree(first));
      rerender(tree(second));
      await user.hover(screen.getAllByRole("button", { name: /Page act/ })[0]!);
      expect(second).toHaveBeenCalled();
      expect(first).not.toHaveBeenCalled();
    });

    it("keeps the default action out of the desktop slot until a page registers one, when asked", () => {
      function Slot({ desktopPrimaryFallback }: { desktopPrimaryFallback?: boolean }) {
        return (
          <AppShell
            groups={groups}
            labels={labels}
            primaryAction={{ label: "Default act" }}
            desktopPrimaryFallback={desktopPrimaryFallback}
          >
            <div data-testid="slot">
              <ShellPrimaryActionSlot />
            </div>
          </AppShell>
        );
      }
      const { rerender } = render(<Slot />);
      expect(within(screen.getByTestId("slot")).getByRole("button", { name: "Default act" })).toHaveAttribute(
        "data-fallback",
      );
      rerender(<Slot desktopPrimaryFallback={false} />);
      expect(within(screen.getByTestId("slot")).queryByRole("button")).toBeNull();
      expect(within(floatBar()).getByRole("button", { name: /Default act/ })).toHaveAttribute(
        "data-fallback",
      );
    });

    it("shows a page's registered action in the slot even when the fallback is off, unmarked", () => {
      function Page() {
        useShellPrimaryAction({ label: "Page act" });
        return <ShellPrimaryActionSlot />;
      }
      render(
        <AppShell
          groups={groups}
          labels={labels}
          primaryAction={{ label: "Default act" }}
          desktopPrimaryFallback={false}
        >
          <div data-testid="slot">
            <Page />
          </div>
        </AppShell>,
      );
      const button = within(screen.getByTestId("slot")).getByRole("button", { name: "Page act" });
      expect(button).not.toHaveAttribute("data-fallback");
    });
  });

  describe("route transition, progress and pending page", () => {
    const withRoute = (routeKey: string, extra: Partial<AppShellProps> = {}) => (
      <AppShell groups={groups} labels={labels} routeKey={routeKey} mainStart={<p>Banner</p>} {...extra}>
        <h1>Page {routeKey}</h1>
      </AppShell>
    );

    it("marks the arriving page when routeKey changes, not on the first render or a repeat", () => {
      mockReducedMotion(false);
      const { rerender } = render(withRoute("/a"));
      const page = () => screen.getByRole("heading").parentElement!;
      expect(page()).not.toHaveAttribute("data-route-enter");
      rerender(withRoute("/a"));
      expect(page()).not.toHaveAttribute("data-route-enter");
      rerender(withRoute("/b"));
      expect(screen.getByRole("heading")).toHaveAttribute("data-route-enter", "rise");
      expect(screen.getByText("Banner").parentElement).not.toHaveAttribute("data-route-enter");
    });

    it("keeps the page mounted across a route change (nothing remounts)", () => {
      mockReducedMotion(false);
      const { rerender } = render(withRoute("/a"));
      const main = screen.getByRole("main");
      rerender(withRoute("/b"));
      expect(screen.getByRole("main")).toBe(main);
    });

    it("draws the progress bar while routePending, and not without a routeKey or with routeProgress off", () => {
      vi.useFakeTimers();
      try {
        const { rerender } = render(withRoute("/a", { routePending: true }));
        act(() => void vi.advanceTimersByTime(200));
        expect(document.querySelector("[data-route-progress]")).not.toBeNull();
        rerender(withRoute("/a", { routePending: true, routeProgress: false }));
        expect(document.querySelector("[data-route-progress]")).toBeNull();
        rerender(
          <AppShell groups={groups} labels={labels} routePending>
            <h1>x</h1>
          </AppShell>,
        );
        act(() => void vi.advanceTimersByTime(500));
        expect(document.querySelector("[data-route-progress]")).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it("shows mainPending in place of the page, hides the page through its own wrapper and keeps the banner visible", () => {
      const { rerender } = render(withRoute("/a"));
      const heading = screen.getByRole("heading");
      expect(screen.getByRole("main")).not.toHaveAttribute("aria-busy");
      expect(heading).toBeVisible();
      rerender(withRoute("/a", { mainPending: <p>Loading skeleton</p> }));
      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-busy", "true");
      expect(main).toHaveAttribute("data-pending");
      expect(screen.getByText("Loading skeleton")).toBeVisible();
      const hiddenHeading = screen.getByRole("heading", { hidden: true });
      expect(hiddenHeading).toBe(heading);
      expect(hiddenHeading).not.toBeVisible();
      expect(hiddenHeading.closest("[hidden]")).not.toBeNull();
      expect(screen.getByText("Banner")).toBeVisible();
      rerender(withRoute("/a"));
      expect(screen.queryByText("Loading skeleton")).toBeNull();
      expect(screen.getByRole("heading")).toBe(heading);
      expect(heading).toBeVisible();
    });

    it("moves focus to main when the page that had it is hidden, and leaves focus elsewhere alone", () => {
      const tree = (extra: Partial<AppShellProps> = {}) => (
        <AppShell groups={groups} labels={labels} routeKey="/a" {...extra}>
          <button type="button">In page</button>
        </AppShell>
      );
      const { rerender } = render(tree());
      screen.getByRole("button", { name: "In page" }).focus();
      rerender(tree({ mainPending: <p>Skeleton</p> }));
      expect(screen.getByRole("main")).toHaveFocus();
      expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");

      rerender(tree());
      const search = screen.getAllByRole("link", { name: "Home" })[0]!;
      search.focus();
      rerender(tree({ mainPending: <p>Skeleton</p> }));
      expect(search).toHaveFocus();
    });

    it("keeps the consumer's busy state and data-pending on main, and adds the pending page to them", () => {
      const { rerender } = render(
        withRoute("/a", { mainProps: { "aria-busy": true, "data-pending": "mine" } }),
      );
      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-busy", "true");
      expect(main).toHaveAttribute("data-pending", "mine");
      rerender(withRoute("/a", { mainProps: { "aria-busy": false }, mainPending: <p>Skeleton</p> }));
      expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
      expect(screen.getByRole("main")).toHaveAttribute("data-pending", "");
      rerender(withRoute("/a", { mainProps: { "aria-busy": false } }));
      expect(screen.getByRole("main")).not.toHaveAttribute("aria-busy", "true");
    });

    it("draws the fade behind the floating bar by default, and not with floatScrim={false}", () => {
      const scrim = () => floatBar().querySelector('[data-lufia-part="float-bar-scrim"]');
      const { rerender } = render(withRoute("/a"));
      expect(scrim()).toHaveAttribute("aria-hidden", "true");
      rerender(withRoute("/a", { floatScrim: false }));
      expect(scrim()).toBeNull();
    });

    it("lets the arriving page only fade after a skeleton, and rise otherwise", () => {
      mockReducedMotion(false);
      const { rerender } = render(withRoute("/a"));
      rerender(withRoute("/a", { mainPending: <p>Skeleton</p> }));
      rerender(withRoute("/b"));
      expect(screen.getByRole("heading")).toHaveAttribute("data-route-enter", "fade");
      rerender(withRoute("/c"));
      expect(screen.getByRole("heading")).toHaveAttribute("data-route-enter", "rise");
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

  describe("route transition hooks", () => {
    it("puts routeTransitionProps on the region that plays the route motion", () => {
      render(
        <AppShell
          groups={groups}
          labels={labels}
          routeKey="/a"
          routeTransitionProps={{ className: "app-stagger", "data-stagger": "sections" }}
        >
          <h1>Page</h1>
        </AppShell>,
      );
      const region = screen.getByRole("heading").parentElement!;
      expect(region).toHaveClass("app-stagger");
      expect(region).toHaveAttribute("data-stagger", "sections");
    });

    it("tracks link clicks next to routePending with routeTrackLinks", () => {
      vi.useFakeTimers();
      window.history.pushState({}, "", "/a");
      try {
        render(
          <AppShell groups={groups} labels={labels} routeKey="/a" routePending={false} routeTrackLinks>
            <a href="/b">Go</a>
          </AppShell>,
        );
        act(() => screen.getByRole("link", { name: "Go" }).click());
        act(() => void vi.advanceTimersByTime(200));
        expect(document.querySelector("[data-route-progress]")).not.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("sub-items", () => {
    const nested: ShellNavGroup[] = [
      {
        key: "main",
        items: [
          { key: "home", label: "Home", href: "/", exact: true },
          {
            key: "admin",
            label: "Admin",
            href: "/admin",
            items: [
              { key: "users", label: "Users", href: "/admin?section=users", match: "query" },
              {
                key: "audit",
                label: "Audit",
                href: "/admin?section=audit",
                match: "query",
                badge: "OK",
                badgeTone: "success",
              },
            ],
          },
        ],
      },
      {
        key: "more",
        label: "More",
        collapsible: true,
        items: [
          {
            key: "tools",
            label: "Tools",
            href: "/tools",
            items: [{ key: "import", label: "Import", href: "/tools/import" }],
          },
        ],
      },
    ];
    const sidebar = () => screen.getByRole("navigation", { name: "Main navigation" });
    const shell = (props: Partial<AppShellProps> = {}) => (
      <AppShell groups={nested} labels={labels} currentPath="/admin?section=users" {...props}>
        <h1>Page</h1>
      </AppShell>
    );

    it("lists the sub-items of the current branch and marks the current one", () => {
      render(shell());
      const nav = sidebar();
      const users = within(nav).getByRole("link", { name: "Users" });
      expect(users).toHaveAttribute("aria-current", "page");
      const admin = within(nav).getByRole("link", { name: "Admin" });
      expect(admin).not.toHaveAttribute("aria-current");
      expect(admin).toHaveAttribute("data-branch");
      expect(admin).not.toHaveAttribute("data-active");
      // The sub-list is nested in the item's own list entry.
      expect(users.closest("ul")!.closest("li")).toBe(admin.closest("li"));
      expect(
        within(nav)
          .getAllByRole("link")
          .filter((l) => l.getAttribute("aria-current")),
      ).toHaveLength(1);
    });

    it("matches the item itself without the query, and hides sub-items of other branches", () => {
      render(shell({ currentPath: "/admin" }));
      const nav = sidebar();
      expect(within(nav).getByRole("link", { name: "Admin" })).toHaveAttribute("aria-current", "page");
      // The Tools branch is not current: its sub-items are inert, out of the tab order.
      const tucked = within(nav).getByText("Import").closest("[data-sub-items]")!;
      expect(tucked).toHaveAttribute("data-state", "closed");
      expect(tucked).toHaveAttribute("inert");
    });

    it("opens the collapsible group that holds the current sub-item", () => {
      render(shell({ currentPath: "/tools/import" }));
      const nav = sidebar();
      expect(within(nav).getByRole("button", { name: "More" })).toHaveAttribute("aria-expanded", "true");
      expect(within(nav).getByRole("link", { name: "Import" })).toHaveAttribute("aria-current", "page");
    });

    it("always lists the sub-items with expanded", () => {
      const always = nested.map((group) => ({
        ...group,
        items: group.items.map((item) => (item.key === "tools" ? { ...item, expanded: true } : item)),
      }));
      render(shell({ groups: always, defaultOpenGroups: ["more"] }));
      const list = within(sidebar()).getByText("Import").closest("[data-sub-items]")!;
      expect(list).toHaveAttribute("data-state", "open");
      expect(list).not.toHaveAttribute("inert");
    });

    it("in the rail hides the sub-items and marks the item that holds the current one", () => {
      render(shell({ defaultCollapsed: true }));
      const nav = sidebar();
      expect(within(nav).queryByRole("link", { name: "Users" })).toBeNull();
      const admin = within(nav).getByRole("link", { name: "Admin" });
      expect(admin).toHaveAttribute("aria-current", "true");
      expect(admin).toHaveAttribute("data-active");
    });

    it("draws a success badge with its tone", () => {
      render(shell());
      expect(within(sidebar()).getByText("OK")).toHaveAttribute("data-tone", "success");
    });

    it("has no axe violations, expanded and as a rail", async () => {
      const { container, unmount } = render(shell());
      expect(await axe(container)).toHaveNoViolations();
      unmount();
      const rail = render(shell({ defaultCollapsed: true }));
      expect(await axe(rail.container)).toHaveNoViolations();
    });
  });
});
