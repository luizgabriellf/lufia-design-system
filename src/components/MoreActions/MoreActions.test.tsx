import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { configureAxe } from "vitest-axe";
import { axe } from "../../test/axe";
import { pushLayer, removeLayer } from "../useFocusTrap/layerStack";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { useState } from "react";
import { Modal } from "../Modal";
import { MoreActions, type MoreActionItem } from "./MoreActions";

/** jsdom has no layout. Every element gets a box, except those inside a CSS-hidden (`narrowOnly`) entry on a wide page. */
const withLayout = ({ narrow = false }: { narrow?: boolean } = {}) =>
  vi.spyOn(Element.prototype, "getClientRects").mockImplementation(function (this: Element) {
    const hidden = !narrow && this.closest("[data-narrow-only]");
    return (hidden ? [] : [new DOMRect(0, 0, 10, 10)]) as unknown as DOMRectList;
  });

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const onSelect = vi.fn();
const items: MoreActionItem[] = [
  { key: "dup", label: "Duplicate", onSelect },
  { key: "exp", label: "Export", description: "As CSV", onSelect },
  { key: "arc", label: "Archive", disabled: true, onSelect },
  { key: "del", label: "Delete", tone: "danger", onSelect },
];

function setup(list: readonly MoreActionItem[] = items) {
  withLayout();
  const user = userEvent.setup();
  const { container } = render(
    <>
      <button type="button">Before</button>
      <MoreActions label="More actions" items={list} />
      <button type="button">After</button>
    </>,
  );
  return { user, container, trigger: screen.getByRole("button", { name: "More actions" }) };
}

describe("MoreActions", () => {
  beforeEach(() => onSelect.mockClear());

  it("renders a closed menu button with the menu-button ARIA", () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens on click, names the menu, focuses the first item and links trigger to menu", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const menu = screen.getByRole("menu", { name: "More actions" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });

  it("opens with Enter, Space and ArrowDown on the first item, ArrowUp on the last", async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await user.keyboard(" ");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("moves with arrows (wrapping, disabled items included), Home and End", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Export/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("typeahead jumps to the item starting with the typed letter after the pause, including disabled ones", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("e");
    expect(screen.getByRole("menuitem", { name: /Export/ })).toHaveFocus();
    await act(async () => vi.advanceTimersByTime(600));
    await user.keyboard("d");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await act(async () => vi.advanceTimersByTime(600));
    await user.keyboard("a"); // Archive is disabled but focusable
    expect(screen.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    vi.useRealTimers();
  });

  it("typeahead builds a prefix within the pause", async () => {
    const { user, trigger } = setup([
      { key: "1", label: "Download" },
      { key: "2", label: "Duplicate" },
      { key: "3", label: "Delete" },
    ]);
    await user.click(trigger);
    await user.keyboard("de");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("Escape closes through the layer stack and returns focus to the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on a press outside", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "After" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Tab returns focus to the button first, so the next stop follows from it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.tab();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.click(trigger);
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
  });

  it("toggles closed when the trigger is pressed again", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("selecting an item closes the menu, returns focus to the trigger and calls onSelect", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("Enter on a focused item selects it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("keeps a disabled item focusable but does not activate it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const archive = screen.getByRole("menuitem", { name: "Archive" });
    expect(archive).toHaveAttribute("aria-disabled", "true");
    archive.focus();
    expect(archive).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.click(archive);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders href items as links through the configured link component", async () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    withLayout();
    const user = userEvent.setup();
    render(
      <LufiaProvider linkComponent={Custom}>
        <MoreActions label="More" items={[{ key: "a", label: "Open", href: "/open" }]} />
      </LufiaProvider>,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    const item = screen.getByRole("menuitem", { name: "Open" });
    expect(item).toHaveAttribute("href", "/open");
    expect(item).toHaveAttribute("data-custom");
  });

  it("skips narrowOnly items on a wide page and includes them on a narrow one", async () => {
    vi.restoreAllMocks();
    const list: MoreActionItem[] = [
      { key: "n", label: "Narrow item", narrowOnly: true },
      { key: "a", label: "Always" },
    ];
    const user = userEvent.setup();
    withLayout({ narrow: false });
    const { unmount } = render(<MoreActions label="More" items={list} />);
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menuitem", { name: "Always" })).toHaveFocus();
    unmount();
    vi.restoreAllMocks();
    withLayout({ narrow: true });
    render(<MoreActions label="More" items={list} />);
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menuitem", { name: "Narrow item" })).toHaveFocus();
  });

  it("Escape closes only the menu when a higher layer is on top of it, then the menu once it is back on top", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const above = pushLayer();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    removeLayer(above);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("returns focus to the button after a link item is chosen", async () => {
    withLayout();
    const user = userEvent.setup();
    render(<MoreActions label="More" items={[{ key: "a", label: "Open", href: "#open" }]} />);
    const trigger = screen.getByRole("button", { name: "More" });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Open" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("renders no menu button when there are no items", () => {
    render(<MoreActions label="More" items={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  describe("alignment", () => {
    const box = (left: number, width: number) =>
      ({ left, right: left + width, width, top: 0, bottom: 10, height: 10, x: left, y: 0 }) as DOMRect;

    function measure(menuLeft: number, triggerLeft: number) {
      withLayout();
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
        this: HTMLElement,
      ) {
        return this.getAttribute("role") === "menu" ? box(menuLeft, 200) : box(triggerLeft, 40);
      });
      Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 300 });
    }

    it("flips to the other edge when the menu would run past the viewport and the other edge fits", async () => {
      measure(-60, 20); // end-aligned menu hangs 60px off the left; start-aligned (left 20, right 220) fits
      const user = userEvent.setup();
      const { container } = render(<MoreActions label="More" items={items} align="end" />);
      expect(container.firstElementChild).toHaveAttribute("data-align", "end");
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(container.firstElementChild).toHaveAttribute("data-align", "start");
    });

    it("keeps the alignment when it fits, or when the other edge would not fit either", async () => {
      const user = userEvent.setup();
      measure(10, 20);
      const first = render(<MoreActions label="More" items={items} align="end" />);
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(first.container.firstElementChild).toHaveAttribute("data-align", "end");
      first.unmount();
      vi.restoreAllMocks();
      measure(-60, 200); // flipping would put the menu at 200..400, past the 300px viewport
      const second = render(<MoreActions label="More" items={items} align="end" />);
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(second.container.firstElementChild).toHaveAttribute("data-align", "end");
    });
  });

  it("has no axe violations, closed and open", async () => {
    const { user, trigger, container } = setup();
    expect(await axe(container)).toHaveNoViolations();
    await user.click(trigger);
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("sheet presentation", () => {
    function setupSheet(presentation: "sheet" | "auto" = "sheet", list: readonly MoreActionItem[] = items) {
      withLayout();
      const user = userEvent.setup();
      const view = render(
        <>
          <button type="button">Before</button>
          <MoreActions label="More actions" items={list} presentation={presentation} />
        </>,
      );
      return { user, view, trigger: screen.getByRole("button", { name: "More actions" }) };
    }

    it("portals the menu to the body, over a backdrop, and makes the page behind inert", async () => {
      const { user, view, trigger } = setupSheet();
      await user.click(trigger);
      const menu = screen.getByRole("menu", { name: "More actions" });
      expect(view.container.contains(menu)).toBe(false);
      expect(document.body.contains(menu)).toBe(true);
      expect(view.container).toHaveAttribute("inert");
      expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    });

    it("closes on Escape and returns focus to the trigger, leaving the page live", async () => {
      const { user, view, trigger } = setupSheet();
      await user.click(trigger);
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(view.container).not.toHaveAttribute("inert");
    });

    it("closes on a tap on the backdrop but not on a press on the sheet", async () => {
      const { user, trigger } = setupSheet();
      await user.click(trigger);
      await user.click(screen.getByRole("menuitem", { name: "Archive" }));
      expect(screen.getByRole("menu")).toBeInTheDocument();
      const backdrop = document.body.querySelector<HTMLElement>('[aria-hidden="true"][class*="backdrop"]')!;
      await user.click(backdrop);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it("keeps Tab inside the sheet", async () => {
      const { user, trigger } = setupSheet();
      await user.click(trigger);
      await user.keyboard("{Tab}");
      expect(screen.getByRole("menuitem", { name: /Export/ })).toHaveFocus();
      await user.keyboard("{Shift>}{Tab}{/Shift}{Shift>}{Tab}{/Shift}");
      expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("runs the chosen action after the sheet has closed and focus is back on the trigger", async () => {
      const { user, trigger } = setupSheet();
      let focusedAtCall: Element | null = null;
      onSelect.mockImplementation(() => {
        focusedAtCall = document.activeElement;
      });
      await user.click(trigger);
      await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(focusedAtCall).toBe(trigger);
      onSelect.mockReset();
    });

    it("gives every item a leading slot when only some have an icon", async () => {
      const { user, trigger } = setupSheet("sheet", [
        { key: "a", label: "With", icon: <svg /> },
        { key: "b", label: "Without" },
      ]);
      await user.click(trigger);
      expect(
        screen.getByRole("menuitem", { name: "Without" }).querySelectorAll('[aria-hidden="true"]'),
      ).toHaveLength(1);
    });

    it("adds no leading slot when no item has an icon", async () => {
      const { user, trigger } = setupSheet("sheet", [{ key: "a", label: "Plain" }]);
      await user.click(trigger);
      expect(
        screen.getByRole("menuitem", { name: "Plain" }).querySelectorAll('[aria-hidden="true"]'),
      ).toHaveLength(0);
    });

    it('"auto" is a popover on a wide page and a sheet on a narrow one', async () => {
      const match = (matches: boolean) =>
        vi.stubGlobal("matchMedia", (query: string) => ({
          matches,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }));
      match(false);
      const wide = setupSheet("auto");
      await wide.user.click(wide.trigger);
      expect(wide.view.container.contains(screen.getByRole("menu"))).toBe(true);
      wide.view.unmount();
      match(true);
      const narrow = setupSheet("auto");
      await narrow.user.click(narrow.trigger);
      expect(narrow.view.container.contains(screen.getByRole("menu"))).toBe(false);
      vi.unstubAllGlobals();
    });

    it("moves focus to the first item with defaultOpen, so the keys work", async () => {
      withLayout();
      render(<MoreActions label="More actions" items={items} presentation="sheet" defaultOpen />);
      expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getByRole("menuitem", { name: /Export/ })).toHaveFocus();
    });

    it("renders on the server without touching the document", () => {
      const html = renderToString(
        <MoreActions label="More actions" items={items} presentation="sheet" defaultOpen />,
      );
      expect(html).toContain("More actions");
    });

    it("moves focus into the new presentation when the breakpoint is crossed while open", async () => {
      withLayout();
      let narrow = true;
      const listeners = new Set<() => void>();
      vi.stubGlobal("matchMedia", (query: string) => ({
        get matches() {
          return narrow;
        },
        media: query,
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      }));
      const user = userEvent.setup();
      const view = render(<MoreActions label="More actions" items={items} presentation="auto" />);
      await user.click(screen.getByRole("button", { name: "More actions" }));
      expect(view.container.contains(screen.getByRole("menu"))).toBe(false);
      await user.keyboard("{ArrowDown}");
      narrow = false;
      act(() => listeners.forEach((fn) => fn()));
      expect(view.container.contains(screen.getByRole("menu"))).toBe(true);
      expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
      vi.unstubAllGlobals();
    });

    it("has no axe violations while open", async () => {
      const { user, trigger } = setupSheet();
      await user.click(trigger);
      // The sheet is a body-level overlay, outside any landmark by design: the page-level `region` rule does not apply to it.
      const noRegion = configureAxe({
        rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
      });
      expect(await noRegion(document.body)).toHaveNoViolations();
    });
  });

  describe("hydration with defaultOpen", () => {
    async function hydrate(presentation: "popover" | "sheet") {
      withLayout();
      const element = (
        <MoreActions label="More actions" items={items} presentation={presentation} defaultOpen />
      );
      const host = document.createElement("div");
      document.body.append(host);
      host.innerHTML = renderToString(element);
      let root!: ReturnType<typeof hydrateRoot>;
      await act(async () => {
        root = hydrateRoot(host, element);
      });
      return () => {
        act(() => root.unmount());
        host.remove();
      };
    }

    it("leaves focus alone for a popover", async () => {
      const cleanup = await hydrate("popover");
      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(document.activeElement?.getAttribute("role")).not.toBe("menuitem");
      cleanup();
    });

    it("moves focus to the first item for a sheet", async () => {
      const cleanup = await hydrate("sheet");
      expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
      cleanup();
    });
  });

  describe("opening a dialog from an item", () => {
    /** The dialog is owned by the caller, outside the menu, so it stays mounted after the menu closes. */
    function WithDialog({ presentation }: { presentation: "popover" | "sheet" }) {
      const [open, setOpen] = useState(false);
      return (
        <>
          <MoreActions
            label="More actions"
            presentation={presentation}
            items={[{ key: "rename", label: "Rename", onSelect: () => setOpen(true) }]}
          />
          <Modal open={open} onClose={() => setOpen(false)} title="Rename record">
            <p>Pick a new name.</p>
          </Modal>
        </>
      );
    }

    it.each(["popover", "sheet"] as const)(
      "moves focus into the dialog and back to the trigger when it closes (%s)",
      async (presentation) => {
        withLayout();
        const user = userEvent.setup();
        render(<WithDialog presentation={presentation} />);
        const trigger = screen.getByRole("button", { name: "More actions" });

        await user.click(trigger);
        await user.click(screen.getByRole("menuitem", { name: "Rename" }));
        const dialog = await screen.findByRole("dialog", { name: "Rename record" });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(dialog).toContainElement(document.activeElement as HTMLElement);

        await user.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(trigger).toHaveFocus();
      },
    );
  });

  it("renders item data attributes on the menuitem, button or link, without overriding its role", async () => {
    const { user, trigger } = setup([
      { key: "a", label: "Export", attributes: { "data-tour": "export" } },
      { key: "b", label: "Docs", href: "/docs", attributes: { "data-tour": "docs", "data-x": "1" } },
    ]);
    await user.click(trigger);
    expect(screen.getByRole("menuitem", { name: "Export" })).toHaveAttribute("data-tour", "export");
    const link = screen.getByRole("menuitem", { name: "Docs" });
    expect(link).toHaveAttribute("data-tour", "docs");
    expect(link).toHaveAttribute("data-x", "1");
  });

  it("marks the narrow-only scope on the root and entries, viewport by default", async () => {
    const { user, trigger, container } = setup([{ key: "a", label: "Export", narrowOnly: true }]);
    expect(container.querySelector("[data-narrow-scope]")).toHaveAttribute("data-narrow-scope", "viewport");
    await user.click(trigger);
    expect(screen.getByRole("menuitem", { name: "Export" }).closest("li")).toHaveAttribute(
      "data-narrow-scope",
      "viewport",
    );
  });
});
