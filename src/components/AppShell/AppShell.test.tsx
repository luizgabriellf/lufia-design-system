import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { mockReducedMotion } from "../../test/motion";
import { AppShell, type AppShellProps } from "./AppShell";
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
