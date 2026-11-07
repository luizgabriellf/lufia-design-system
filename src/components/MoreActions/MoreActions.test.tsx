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

  describe("placement", () => {
    const box = (left: number, top: number, width: number, height: number) =>
      ({
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
        x: left,
        y: top,
      }) as DOMRect;

    /** The trigger is a 40x30 box at (triggerLeft, triggerTop) and the menu is menuWidth x menuHeight; the viewport is 300x300. */
    function measure({
      triggerLeft = 100,
      triggerTop = 20,
      menuWidth = 200,
      menuHeight = 100,
    }: { triggerLeft?: number; triggerTop?: number; menuWidth?: number; menuHeight?: number } = {}) {
      withLayout();
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
        this: HTMLElement,
      ) {
        return this.getAttribute("role") === "menu"
          ? box(0, 0, menuWidth, menuHeight)
          : box(triggerLeft, triggerTop, 40, 30);
      });
      Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 300 });
      Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, value: 300 });
    }

    async function open(align: "start" | "end" = "end") {
      const user = userEvent.setup();
      const view = render(<MoreActions label="More" items={items} align={align} />);
      await user.click(screen.getByRole("button", { name: "More" }));
      return { user, view, menu: screen.getByRole("menu", { name: "More" }) };
    }

    it("portals the open menu to the body, outside the component, with fixed coordinates below the trigger", async () => {
      measure({ triggerLeft: 200 });
      const { view, menu } = await open();
      expect(menu.parentElement).toBe(document.body);
      expect(view.container.contains(menu)).toBe(false);
      expect(menu).toHaveAttribute("data-side", "bottom");
      // End-aligned: the menu's right edge is the trigger's (240), half a rem below its bottom edge (50).
      expect(menu.style.left).toBe("40px");
      expect(menu.style.top).toBe("58px");
    });

    it("renders in place until mounted, then moves to the body", () => {
      withLayout();
      const html = renderToString(<MoreActions label="More" items={items} defaultOpen />);
      expect(html).toContain('role="menu"');
      expect(html.indexOf("<ul")).toBeGreaterThan(html.indexOf("<button"));
      expect(html.indexOf("</div>")).toBeGreaterThan(html.indexOf("<ul"));
    });

    it("opens upward when there is no room below and more above", async () => {
      measure({ triggerTop: 250, menuHeight: 100 }); // 20px below the trigger, 234px above
      const { menu } = await open();
      expect(menu).toHaveAttribute("data-side", "top");
      expect(menu.style.top).toBe("142px"); // 250 - 8 - 100
    });

    it("stays below, capped to the room, when neither side fits the whole menu but below is larger", async () => {
      measure({ triggerTop: 20, menuHeight: 400 });
      const { menu } = await open();
      expect(menu).toHaveAttribute("data-side", "bottom");
      expect(menu.style.maxBlockSize).toBe("234px"); // 300 - 50 - 16
    });

    it("flips to the other edge when the menu would run past the viewport and the other edge fits", async () => {
      measure({ triggerLeft: 20 }); // end-aligned left edge would be -140; start-aligned (20..220) fits
      const { menu } = await open("end");
      expect(menu).toHaveAttribute("data-align", "start");
      expect(menu.style.left).toBe("20px");
    });

    it("keeps the alignment when it fits, or when the other edge would not fit either", async () => {
      measure({ triggerLeft: 200 }); // end-aligned: 40..240
      const first = await open("end");
      expect(first.menu).toHaveAttribute("data-align", "end");
      first.view.unmount();
      vi.restoreAllMocks();
      measure({ triggerLeft: 150 }); // end-aligned -50, start-aligned 150..350: neither fits
      const second = await open("end");
      expect(second.menu).toHaveAttribute("data-align", "end");
      expect(second.menu.style.left).toBe("0px");
    });

    it("repositions on scroll and resize while open", async () => {
      measure({ triggerLeft: 200 });
      const { menu } = await open("end");
      expect(menu.style.top).toBe("58px");
      measure({ triggerLeft: 200, triggerTop: 60 });
      act(() => {
        document.dispatchEvent(new Event("scroll", { bubbles: false }));
        window.dispatchEvent(new Event("scroll"));
      });
      expect(menu.style.top).toBe("98px");
      measure({ triggerLeft: 200, triggerTop: 80 });
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });
      expect(menu.style.top).toBe("118px");
    });

    it("counts the portalled menu as inside for a press, and closes on a press outside", async () => {
      measure({ triggerLeft: 200 });
      const { user, menu } = await open();
      await user.pointer({ keys: "[MouseLeft]", target: menu });
      expect(screen.getByRole("menu")).toBeInTheDocument();
      await user.click(document.body);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("returns focus to the trigger on Escape and after a selection", async () => {
      measure({ triggerLeft: 200 });
      const { user } = await open();
      await user.keyboard("{Escape}");
      expect(screen.getByRole("button", { name: "More" })).toHaveFocus();
      await user.click(screen.getByRole("button", { name: "More" }));
      await user.click(screen.getByRole("menuitem", { name: /Export/ }));
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "More" })).toHaveFocus();
    });

    it("portals into the open modal it sits in, where the page behind is inert", async () => {
      measure({ triggerLeft: 200 });
      const user = userEvent.setup();
      render(
        <Modal open title="Row" onClose={() => {}}>
          <MoreActions label="More" items={items} />
        </Modal>,
      );
      await user.click(screen.getByRole("button", { name: "More" }));
      const menu = screen.getByRole("menu", { name: "More" });
      expect(menu.closest('[aria-modal="true"]')).not.toBeNull();
      await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    describe("narrow-only items in container scope", () => {
      const list: MoreActionItem[] = [
        { key: "n", label: "Narrow item", narrowOnly: true },
        { key: "a", label: "Always" },
      ];

      async function inContainer(width: number | null) {
        measure({ triggerLeft: 200 });
        const host = document.createElement("div");
        document.body.append(host);
        if (width !== null) {
          Object.defineProperty(host, "clientWidth", { configurable: true, value: width });
          const real = window.getComputedStyle.bind(window);
          vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) =>
            element === host
              ? ({
                  containerType: "inline-size",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                } as CSSStyleDeclaration)
              : real(element, pseudo),
          );
        }
        const user = userEvent.setup();
        const view = render(<MoreActions label="More" items={list} narrowOnlyScope="container" />, {
          container: host,
        });
        await user.click(screen.getByRole("button", { name: "More" }));
        const menu = screen.getByRole("menu", { name: "More" });
        view.unmount();
        host.remove();
        return menu;
      }

      it("marks the menu narrow when the container content box is below 50rem", async () => {
        expect(await inContainer(831)).toHaveAttribute("data-container-narrow"); // 799 content
        // 50rem is 800px at the default root size: 799 is narrow, 800 is not.
      });

      it("leaves the menu unmarked in a wide container and with no container at all", async () => {
        expect(await inContainer(900)).not.toHaveAttribute("data-container-narrow");
        expect(await inContainer(null)).not.toHaveAttribute("data-container-narrow");
      });
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
      expect(screen.getByRole("menu").closest('[data-lufia-part="layer"]')).toBeNull();
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
      expect(screen.getByRole("menu").closest('[data-lufia-part="layer"]')).toBeNull();
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
