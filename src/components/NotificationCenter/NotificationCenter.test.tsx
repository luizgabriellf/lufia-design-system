import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Modal } from "../Modal";
import { axe } from "../../test/axe";
import { endAnimation, mockReducedMotion } from "../../test/motion";
import {
  NotificationCenter,
  NotificationPanel,
  NotificationSummary,
  type NotificationCenterProps,
  type NotificationItem,
} from ".";

/** jsdom has no layout: every element gets a box, which `useDismiss` needs to tell a visible popup from a hidden copy. */
const withLayout = () =>
  vi
    .spyOn(Element.prototype, "getClientRects")
    .mockImplementation(() => [new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const onSelect = vi.fn();
const items: NotificationItem[] = [
  {
    id: "a",
    group: "today",
    tab: "approvals",
    title: "Proposal ready",
    meta: "Planner",
    time: "07:52",
    unread: true,
    onSelect,
  },
  {
    id: "b",
    group: "today",
    tab: "agents",
    title: "Run finished",
    meta: "Runner",
    time: "07:10",
    unread: true,
    href: "/runs/1",
  },
  {
    id: "c",
    group: "earlier",
    tab: "approvals",
    title: "Budget approved",
    meta: "Finance",
    time: "Yesterday",
    onSelect,
  },
  {
    id: "d",
    group: "earlier",
    tab: "stock",
    title: "Low stock",
    meta: "Warehouse",
    time: "Mon",
    unread: true,
  },
];
const base: NotificationCenterProps = {
  label: "Notifications",
  unreadCount: 3,
  unreadLabel: "unread",
  unreadCountLabel: (count) => `${count} unread`,
  items,
  groups: [
    { key: "today", label: "Today" },
    { key: "earlier", label: "Earlier" },
  ],
  tabs: [
    { key: "all", label: "All", count: 4, all: true },
    { key: "approvals", label: "Approvals", count: 2 },
    { key: "agents", label: "Agents", count: 1 },
    { key: "stock", label: "Stock", count: 1, empty: { title: "Stock is calm" } },
  ],
  onMarkAllRead: vi.fn(),
  markAllLabel: "Mark all as read",
  footer: { label: "Notification settings", href: "/settings" },
  empty: { title: "Nothing here", description: "You are all caught up." },
  presentation: "popover",
};

function setup(props: Partial<NotificationCenterProps> = {}) {
  withLayout();
  const user = userEvent.setup();
  const view = render(
    <>
      <button type="button">Before</button>
      <NotificationCenter {...base} {...props} />
    </>,
  );
  return { user, ...view, trigger: screen.getByRole("button", { name: /^Notifications/ }) };
}

describe("NotificationCenter", () => {
  beforeEach(() => {
    onSelect.mockClear();
    vi.mocked(base.onMarkAllRead!).mockClear();
  });

  it("names the bell with the unread count and wires the disclosure ARIA", () => {
    const { trigger } = setup();
    expect(trigger).toHaveAccessibleName("Notifications, 3 unread");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("drops the count from the name and the badge at zero", () => {
    const { trigger } = setup({ unreadCount: 0 });
    expect(trigger).toHaveAccessibleName("Notifications");
    expect(document.querySelector('[data-lufia-part="notification-badge"]')).toBeNull();
  });

  it("caps a large count", () => {
    setup({ unreadCount: 120, maxCount: 99 });
    expect(document.querySelector('[data-lufia-part="notification-badge"]')).toHaveTextContent("99+");
  });

  it("opens a labelled, non-modal dialog and moves focus into it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Notifications" });
    expect(dialog).not.toHaveAttribute("aria-modal");
    expect(dialog).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
  });

  it("closes on Escape and returns focus to the bell", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes on a press outside", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Before" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("works controlled: it reports the change and stays as told", async () => {
    const onOpenChange = vi.fn();
    const { user, trigger } = setup({ open: false, onOpenChange });
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the header, the count in words and the mark-all action", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { level: 2, name: "Notifications" })).toBeInTheDocument();
    expect(within(dialog).getAllByText("3 unread").length).toBeGreaterThan(0);
    await user.click(within(dialog).getByRole("button", { name: "Mark all as read" }));
    expect(base.onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("keeps mark-all focusable but inert when nothing is unread", async () => {
    const { user, trigger } = setup({ unreadCount: 0 });
    await user.click(trigger);
    const mark = screen.getByRole("button", { name: "Mark all as read" });
    expect(mark).toHaveAttribute("aria-disabled", "true");
    await user.click(mark);
    expect(base.onMarkAllRead).not.toHaveBeenCalled();
  });

  describe("tabs", () => {
    it("follows the tabs pattern with one shared panel", async () => {
      const { user, trigger } = setup();
      await user.click(trigger);
      const tablist = screen.getByRole("tablist");
      const tabs = within(tablist).getAllByRole("tab");
      expect(tabs.map((tab) => tab.textContent)).toEqual(["All4", "Approvals2", "Agents1", "Stock1"]);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[0]).toHaveAttribute("tabindex", "0");
      expect(tabs[1]).toHaveAttribute("tabindex", "-1");
      const panel = screen.getByRole("tabpanel");
      expect(tabs[0]).toHaveAttribute("aria-controls", panel.id);
      expect(panel).toHaveAccessibleName("All4");
    });

    it("filters the list with arrow keys, Home and End, and reports the change", async () => {
      const onTabChange = vi.fn();
      const { user, trigger } = setup({ onTabChange });
      await user.click(trigger);
      const tabs = screen.getAllByRole("tab");
      tabs[0]!.focus();
      await user.keyboard("{ArrowRight}");
      expect(tabs[1]).toHaveFocus();
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(onTabChange).toHaveBeenLastCalledWith("approvals");
      expect(screen.getByText("Proposal ready")).toBeInTheDocument();
      expect(screen.queryByText("Run finished")).not.toBeInTheDocument();
      await user.keyboard("{End}");
      expect(tabs[3]).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      expect(tabs[0]).toHaveFocus();
      await user.keyboard("{ArrowLeft}");
      expect(tabs[3]).toHaveFocus();
      await user.keyboard("{Home}");
      expect(tabs[0]).toHaveFocus();
    });

    it("mirrors the arrows in right-to-left text", async () => {
      const { user, trigger } = setup();
      await user.click(trigger);
      const tabs = screen.getAllByRole("tab");
      tabs[0]!.focus();
      const real = window.getComputedStyle.bind(window);
      vi.spyOn(window, "getComputedStyle").mockImplementation(
        (element, pseudo) => ({ ...real(element, pseudo), direction: "rtl" }) as CSSStyleDeclaration,
      );
      await user.keyboard("{ArrowLeft}");
      expect(tabs[1]).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      expect(tabs[0]).toHaveFocus();
    });

    it("survives keys that are not safe in an id or a selector", async () => {
      const { user, trigger } = setup({
        tabs: [
          { key: 'a "b"]', label: "Odd", all: true },
          { key: "c d", label: "Other" },
        ],
      });
      await user.click(trigger);
      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveAccessibleName("Odd");
      await user.click(screen.getByRole("tab", { name: "Other" }));
      expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Other");
    });

    it("reports the first tab when a controlled activeTab matches none", async () => {
      const onTabChange = vi.fn();
      const { user, trigger } = setup({ activeTab: "gone", onTabChange });
      await user.click(trigger);
      expect(screen.getByRole("tab", { name: /^All/ })).toHaveAttribute("aria-selected", "true");
      await user.click(screen.getByRole("tab", { name: /^All/ }));
      expect(onTabChange).toHaveBeenCalledWith("all");
    });

    it("can be controlled", async () => {
      const { user, trigger } = setup({ activeTab: "agents" });
      await user.click(trigger);
      expect(screen.getByRole("tab", { name: /Agents/ })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("Run finished")).toBeInTheDocument();
      expect(screen.queryByText("Proposal ready")).not.toBeInTheDocument();
    });

    it("uses the tab's own empty state, then the panel's", async () => {
      const { user, trigger } = setup({ items: [] });
      await user.click(trigger);
      expect(screen.getByText("Nothing here")).toBeInTheDocument();
      await user.click(screen.getByRole("tab", { name: /Stock/ }));
      expect(screen.getByText("Stock is calm")).toBeInTheDocument();
    });
  });

  describe("list", () => {
    it("groups rows under headings in lists", async () => {
      const { user, trigger } = setup();
      await user.click(trigger);
      const today = screen.getByRole("list", { name: "Today" });
      expect(within(today).getAllByRole("listitem")).toHaveLength(2);
      expect(screen.getByRole("heading", { level: 3, name: "Earlier" })).toBeInTheDocument();
    });

    it("says unread in text and renders links and buttons", async () => {
      const { user, trigger } = setup();
      await user.click(trigger);
      expect(screen.getByRole("button", { name: /^unread, Proposal ready/ })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^Budget approved\s+Finance\s+Yesterday$/ }),
      ).toBeInTheDocument();
      const link = screen.getByRole("link", { name: /Run finished/ });
      expect(link).toHaveAttribute("href", "/runs/1");
    });

    it("runs a row's action and closes", async () => {
      const { user, trigger } = setup();
      await user.click(trigger);
      await user.click(screen.getByRole("button", { name: /Proposal ready/ }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    });

    it("shows the footer link", async () => {
      const { user, trigger } = setup();
      await user.click(trigger);
      expect(screen.getByRole("link", { name: "Notification settings" })).toHaveAttribute(
        "href",
        "/settings",
      );
    });

    it("shows skeleton rows with one polite status while loading", async () => {
      const { user, trigger } = setup({ loading: true, loadingLabel: "Loading notifications" });
      await user.click(trigger);
      expect(screen.getByText("Loading notifications").closest('[role="status"]')).toBeInTheDocument();
      expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-busy", "true");
      expect(screen.queryByText("Proposal ready")).not.toBeInTheDocument();
    });

    it("shows the error slot as an alert", async () => {
      const { user, trigger } = setup({ error: <p>Could not load. Try again.</p> });
      await user.click(trigger);
      expect(screen.getByRole("alert")).toHaveTextContent("Could not load. Try again.");
    });

    it("renders the summary slot above the list", async () => {
      const { user, trigger } = setup({
        summary: (
          <NotificationSummary
            title="2 proposals due today"
            description="Review before noon"
            progress={{ done: 1, total: 3, label: "Reviewed" }}
            action={{ label: "Review", href: "/review" }}
            footnote="2 due today · 6 later this week"
          />
        ),
      });
      await user.click(trigger);
      expect(screen.getByRole("group", { name: "2 proposals due today" })).toBeInTheDocument();
      const bar = screen.getByRole("progressbar", { name: "Reviewed" });
      expect(bar).toHaveAttribute("aria-valuenow", "1");
      expect(bar).toHaveAttribute("aria-valuemax", "3");
      expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute("href", "/review");
    });
  });

  describe("focus after an action", () => {
    function WithModal({ presentation }: { presentation: "popover" | "sheet" }) {
      const [shown, setShown] = useState(false);
      return (
        <>
          <NotificationCenter
            {...base}
            presentation={presentation}
            items={[{ id: "x", title: "Open the details", unread: true, onSelect: () => setShown(true) }]}
            tabs={undefined}
            groups={undefined}
            footer={{ label: "Notification settings", onSelect: () => setShown(true) }}
          />
          <Modal open={shown} onClose={() => setShown(false)} title="Details">
            <p>Body</p>
          </Modal>
        </>
      );
    }

    for (const presentation of ["popover", "sheet"] as const) {
      it(`hands focus to the bell before the row's action runs (${presentation})`, async () => {
        withLayout();
        const user = userEvent.setup();
        const seen: (Element | null)[] = [];
        render(
          <NotificationCenter
            {...base}
            presentation={presentation}
            tabs={undefined}
            groups={undefined}
            items={[{ id: "x", title: "Row", onSelect: () => seen.push(document.activeElement) }]}
          />,
        );
        const bell = screen.getByRole("button", { name: /^Notifications/ });
        await user.click(bell);
        await user.click(screen.getByRole("button", { name: "Row" }));
        await waitFor(() => expect(seen).toHaveLength(1));
        expect(seen[0]).toBe(bell);
        expect(bell).toHaveFocus();
      });

      it(`lets a dialog opened by a row take focus and return it to the bell (${presentation})`, async () => {
        withLayout();
        const user = userEvent.setup();
        render(<WithModal presentation={presentation} />);
        const bell = screen.getByRole("button", { name: /^Notifications/ });
        await user.click(bell);
        await user.click(screen.getByRole("button", { name: /Open the details/ }));
        const modal = await screen.findByRole("dialog", { name: "Details" });
        await waitFor(() => expect(modal).toHaveFocus());
        await user.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(bell).toHaveFocus();
      });
    }

    it("closes the panel, then runs the footer action", async () => {
      const onFooter = vi.fn();
      const { user, trigger } = setup({ footer: { label: "Settings", onSelect: onFooter } });
      await user.click(trigger);
      await user.click(screen.getByRole("button", { name: "Settings" }));
      expect(onFooter).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    });

    it("closes the panel, then runs the summary action", async () => {
      const onReview = vi.fn();
      const { user, trigger } = setup({
        summary: <NotificationSummary title="2 due" action={{ label: "Review", onSelect: onReview }} />,
      });
      await user.click(trigger);
      await user.click(screen.getByRole("button", { name: "Review" }));
      expect(onReview).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    });

    it("runs the summary action at once when the panel is hosted on a page", async () => {
      const onReview = vi.fn();
      render(
        <NotificationPanel
          {...base}
          summary={<NotificationSummary title="2 due" action={{ label: "Review", onSelect: onReview }} />}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Review" }));
      expect(onReview).toHaveBeenCalledTimes(1);
    });
  });

  describe("live region", () => {
    it("stays quiet on first paint and announces a later change", () => {
      withLayout();
      const { rerender } = render(<NotificationCenter {...base} />);
      const region = screen.getAllByRole("status")[0]!;
      expect(region).toHaveTextContent("");
      rerender(<NotificationCenter {...base} unreadCount={5} />);
      expect(region).toHaveTextContent("Notifications, 5 unread");
    });
  });

  describe("sheet", () => {
    it("is a modal dialog in a portal, closes on Escape and returns focus", async () => {
      const { user, trigger } = setup({ presentation: "sheet" });
      await user.click(trigger);
      const dialog = screen.getByRole("dialog", { name: "Notifications" });
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog.closest('[data-lufia-part="notification-layer"]')?.parentElement).toBe(document.body);
      expect(dialog).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it("has a close button and closes on the backdrop", async () => {
      const { user, trigger } = setup({ presentation: "sheet" });
      await user.click(trigger);
      await user.click(screen.getByRole("button", { name: "Close" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(trigger);
      await user.click(
        document.querySelector('[data-lufia-part="notification-layer"] > [aria-hidden="true"]')!,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("is chosen by presentation auto below 60rem", async () => {
      vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query.includes("width < 60rem"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }));
      const { user, trigger } = setup({ presentation: "auto" });
      await user.click(trigger);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });
  });

  describe("accessibility", () => {
    it("has no axe violations closed", async () => {
      const { container } = setup();
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations with the popover open", async () => {
      const { user, trigger, container } = setup({
        summary: (
          <NotificationSummary
            title="2 due"
            progress={{ done: 1, total: 2, label: "Reviewed" }}
            action={{ label: "Review" }}
          />
        ),
      });
      await user.click(trigger);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations with the sheet open", async () => {
      const { user, trigger } = setup({ presentation: "sheet" });
      await user.click(trigger);
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it("has no axe violations loading, empty and failed", async () => {
      for (const state of [
        { loading: true, loadingLabel: "Loading" },
        { items: [] },
        { error: <p>Failed</p> },
      ]) {
        const { user, trigger, unmount } = setup({ defaultOpen: false, ...state });
        await user.click(trigger);
        expect(await axe(document.body)).toHaveNoViolations();
        unmount();
      }
    });
  });
});

describe("NotificationPanel", () => {
  it("is a labelled region on its own and axe clean", async () => {
    const { container } = render(<NotificationPanel {...base} />);
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("works without tabs or groups", () => {
    render(<NotificationPanel {...base} tabs={undefined} groups={undefined} />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});

describe("motion", () => {
  const panelRoot = () => document.querySelector('[data-lufia-part="notification-panel"]');
  const popover = () => document.querySelector<HTMLElement>('[data-lufia-part="notification-popover"]');

  it("keeps the popover mounted, inert, while it animates out", async () => {
    mockReducedMotion(false);
    const { user, trigger } = setup();
    await user.click(trigger);
    expect(popover()).toHaveAttribute("data-state", "open");
    // The stylesheet is not loaded in jsdom, so there is no animation to wait for: stub what the presence check reads.
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      animationName: "popover-out",
      animationDuration: "0.16s",
    } as CSSStyleDeclaration);
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(popover()).toHaveAttribute("inert");
    act(() => endAnimation(popover()!));
    expect(popover()).toBeNull();
  });

  it("removes the popover at once under reduced motion", async () => {
    mockReducedMotion(true);
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(popover()).toBeNull();
  });

  it("plays the row entrance on the first view only, and never under reduced motion", async () => {
    mockReducedMotion(false);
    const { user, trigger } = setup();
    await user.click(trigger);
    const content = () => document.querySelector("[data-intro], [data-crossfade]") as HTMLElement | null;
    expect(panelRoot()).toHaveAttribute("data-intro");
    expect(content()).not.toHaveAttribute("data-crossfade");
    await user.click(screen.getByRole("tab", { name: /Approvals/ }));
    expect(screen.getByRole("tabpanel").firstElementChild).toHaveAttribute("data-crossfade");
  });

  it("switches the entrance off under reduced motion", async () => {
    mockReducedMotion(true);
    const { user, trigger } = setup();
    await user.click(trigger);
    expect(panelRoot()).not.toHaveAttribute("data-intro");
  });

  it("marks an item that arrives while open, not the ones it opened with", () => {
    mockReducedMotion(false);
    const { rerender } = render(<NotificationPanel {...base} />);
    expect(document.querySelector("[data-arrived]")).toBeNull();
    const fresh: NotificationItem = {
      id: "new",
      group: "today",
      tab: "approvals",
      title: "Just arrived",
      unread: true,
    };
    rerender(<NotificationPanel {...base} items={[fresh, ...items]} />);
    const arrived = document.querySelectorAll("[data-arrived]");
    expect(arrived).toHaveLength(1);
    expect(arrived[0]).toHaveTextContent("Just arrived");
  });

  it("does not flash a list that finishes loading as new arrivals", () => {
    mockReducedMotion(false);
    const { rerender } = render(<NotificationPanel {...base} items={[]} loading />);
    rerender(<NotificationPanel {...base} items={items} loading={false} />);
    expect(document.querySelector("[data-arrived]")).toBeNull();
    const fresh: NotificationItem = { id: "new", group: "today", tab: "approvals", title: "Just arrived" };
    rerender(<NotificationPanel {...base} items={[fresh, ...items]} loading={false} />);
    expect(document.querySelectorAll("[data-arrived]")).toHaveLength(1);
  });

  it("cascades mark-all-read, and fades the dot instead of removing it", async () => {
    mockReducedMotion(false);
    const user = userEvent.setup();
    function Harness() {
      const [list, setList] = useState(items);
      return (
        <NotificationPanel
          {...base}
          items={list}
          unreadCount={list.filter((item) => item.unread).length}
          onMarkAllRead={() => setList(list.map((item) => ({ ...item, unread: false })))}
        />
      );
    }
    const { container } = render(<Harness />);
    const dots = () => container.querySelectorAll("[data-on]").length;
    expect(dots()).toBe(3);
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(container.querySelector('[data-lufia-part="notification-panel"]')).toHaveAttribute("data-cascade");
    expect(dots()).toBe(0);
    // The dots are still in the document: they fade.
    expect(container.querySelectorAll('[class*="dot"]').length).toBe(4);
  });

  it("pops the badge when the count changes, not on first paint", () => {
    mockReducedMotion(false);
    withLayout();
    const { rerender } = render(<NotificationCenter {...base} />);
    const badge = () => document.querySelector('[data-lufia-part="notification-badge"]');
    expect(badge()).not.toHaveAttribute("data-pop");
    rerender(<NotificationCenter {...base} unreadCount={4} />);
    expect(badge()).toHaveAttribute("data-pop", "a");
    rerender(<NotificationCenter {...base} unreadCount={5} />);
    expect(badge()).toHaveAttribute("data-pop", "b");
  });
});
