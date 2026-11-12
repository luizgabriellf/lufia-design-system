import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { axe } from "../../test/axe";
import { mockDialog } from "../../test/dialog";
import { mockReducedMotion } from "../../test/motion";
import { NavSheet } from "./NavSheet";
import { dragDismisses, SHEET_DRAG_THRESHOLD } from "./useSheetDrag";

function Harness({
  swipe = true,
  initial = false,
  renderAs,
  closeOnNavigate,
}: {
  swipe?: boolean;
  initial?: boolean;
  renderAs?: "portal" | "dialog";
  closeOnNavigate?: boolean;
}) {
  const [open, setOpen] = useState(initial);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open menu
      </button>
      <p>Page content</p>
      <NavSheet
        open={open}
        onOpenChange={setOpen}
        label="Menu"
        header={<b>Brand</b>}
        swipeToDismiss={swipe}
        renderAs={renderAs}
        closeOnNavigate={closeOnNavigate}
        footer={closeOnNavigate === undefined ? undefined : <a href="/help">Help</a>}
      >
        <a href="/one">One</a>
        <a href="/two">Two</a>
        {closeOnNavigate === undefined ? null : (
          <a href="/new" target="_blank" rel="noreferrer">
            New tab
          </a>
        )}
      </NavSheet>
    </>
  );
}

function Refusing() {
  return (
    <NavSheet open onOpenChange={() => {}} label="Menu">
      <a href="/one">One</a>
    </NavSheet>
  );
}

const sheet = () => screen.queryByRole("dialog", { name: "Menu" });

describe("NavSheet", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders nothing while closed", () => {
    render(<Harness />);
    expect(sheet()).toBeNull();
  });

  it("opens as a modal dialog and puts focus on the sheet itself", async () => {
    render(<Harness />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = sheet()!;
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveFocus();
  });

  it("makes the rest of the page inert while open and restores it after", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(container).toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(container).not.toHaveAttribute("inert");
  });

  it("closes on Escape and returns focus to the opener", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(sheet()).toBeNull());
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });

  it("closes from the close button and from a click on the dimmed page", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(sheet()).toBeNull());
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const backdrop = document.querySelector<HTMLElement>('[aria-hidden="true"][class*="backdrop"]')!;
    await user.click(backdrop);
    await waitFor(() => expect(sheet()).toBeNull());
  });

  it("keeps Tab inside the sheet", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "One" })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  describe("swipe to dismiss", () => {
    const grabber = () => document.querySelector<HTMLElement>("[data-swipe]")!;
    const drag = (to: number, steps = 4) => {
      fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
      for (let i = 1; i <= steps; i += 1) {
        fireEvent.pointerMove(grabber(), {
          pointerId: 1,
          clientY: 100 + (to * i) / steps,
          pointerType: "touch",
        });
      }
      return () => fireEvent.pointerUp(grabber(), { pointerId: 1, clientY: 100 + to, pointerType: "touch" });
    };

    it("follows the finger and dismisses past the threshold", async () => {
      render(<Harness initial />);
      const release = drag(200);
      expect(sheet()).toHaveAttribute("data-dragging", "true");
      expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).toBe("200px");
      act(() => release());
      await waitFor(() => expect(sheet()).toBeNull());
    });

    it("springs back after a short drag", () => {
      render(<Harness initial />);
      const release = drag(20);
      act(() => release());
      expect(sheet()).not.toBeNull();
      expect(sheet()).not.toHaveAttribute("data-dragging");
      expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).toBe("0px");
    });

    const at = (time: number, act: () => void) => {
      vi.spyOn(performance, "now").mockReturnValue(time);
      act();
    };

    it("dismisses on a quick flick that is shorter than the distance threshold", async () => {
      render(<Harness initial />);
      at(0, () =>
        fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" }),
      );
      at(10, () => fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 130, pointerType: "touch" }));
      at(20, () => fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 160, pointerType: "touch" }));
      act(() => {
        at(30, () => fireEvent.pointerUp(grabber(), { pointerId: 1, clientY: 160, pointerType: "touch" }));
      });
      await waitFor(() => expect(sheet()).toBeNull());
    });

    it("does not dismiss a slow drag of the same distance", () => {
      render(<Harness initial />);
      at(0, () =>
        fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" }),
      );
      at(500, () => fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 130, pointerType: "touch" }));
      at(1000, () => fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 160, pointerType: "touch" }));
      at(1500, () => fireEvent.pointerUp(grabber(), { pointerId: 1, clientY: 160, pointerType: "touch" }));
      expect(sheet()).not.toBeNull();
    });

    it("springs back when the pointer is cancelled mid-drag", () => {
      render(<Harness initial />);
      fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
      fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 300, pointerType: "touch" });
      expect(sheet()).toHaveAttribute("data-dragging", "true");
      fireEvent.pointerCancel(grabber(), { pointerId: 1, pointerType: "touch" });
      expect(sheet()).not.toHaveAttribute("data-dragging");
      expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).toBe("0px");
      expect(sheet()).not.toBeNull();
    });

    it("returns to rest when the owner refuses the dismissal", async () => {
      render(<Refusing />);
      fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
      fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 300, pointerType: "touch" });
      act(() => {
        fireEvent.pointerUp(grabber(), { pointerId: 1, clientY: 300, pointerType: "touch" });
      });
      await waitFor(() => expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).toBe("0px"));
      expect(sheet()).not.toBeNull();
    });

    it("never moves up", () => {
      render(<Harness initial />);
      drag(-80);
      expect(sheet()!.style.getPropertyValue("--lufia-sheet-drag")).not.toMatch(/^[1-9]/);
    });

    it("leaves the close button to its own click", async () => {
      render(<Harness initial />);
      fireEvent.pointerDown(screen.getByRole("button", { name: "Close" }), {
        pointerId: 1,
        clientY: 100,
        button: 0,
      });
      fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 400 });
      expect(sheet()).not.toHaveAttribute("data-dragging");
    });

    describe("from a link in the header", () => {
      function BrandLinkSheet({ onFollow }: { onFollow: () => void }) {
        const [open, setOpen] = useState(true);
        return (
          <NavSheet
            open={open}
            onOpenChange={setOpen}
            label="Menu"
            header={
              <a
                href="/home"
                onClick={(event) => {
                  event.preventDefault();
                  onFollow();
                }}
              >
                Brand
              </a>
            }
          >
            <a href="/one">One</a>
          </NavSheet>
        );
      }
      const brand = () => screen.getByRole("link", { name: "Brand" });

      it("starts a drag past the slop and cancels the link's click", async () => {
        const onFollow = vi.fn();
        render(<BrandLinkSheet onFollow={onFollow} />);
        fireEvent.pointerDown(brand(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
        fireEvent.pointerMove(brand(), { pointerId: 1, clientY: 105, pointerType: "touch" });
        // Inside the link's larger slop nothing moves yet.
        expect(sheet()).not.toHaveAttribute("data-dragging");
        // A short drag: it springs back, so the link is still there for the click its release sends.
        fireEvent.pointerMove(brand(), { pointerId: 1, clientY: 120, pointerType: "touch" });
        expect(sheet()).toHaveAttribute("data-dragging", "true");
        fireEvent.pointerUp(brand(), { pointerId: 1, clientY: 120, pointerType: "touch" });
        const click = new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 });
        brand().dispatchEvent(click);
        expect(click.defaultPrevented).toBe(true);
        expect(onFollow).not.toHaveBeenCalled();
        // Only that one click: the next tap follows the link again.
        await userEvent.setup().click(brand());
        expect(onFollow).toHaveBeenCalledOnce();
      });

      it("dismisses on a long drag that began on the link", async () => {
        render(<BrandLinkSheet onFollow={() => {}} />);
        fireEvent.pointerDown(brand(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
        fireEvent.pointerMove(brand(), { pointerId: 1, clientY: 300, pointerType: "touch" });
        act(() => {
          fireEvent.pointerUp(brand(), { pointerId: 1, clientY: 300, pointerType: "touch" });
        });
        await waitFor(() => expect(sheet()).toBeNull());
      });

      it("keeps a plain tap on the link", async () => {
        const onFollow = vi.fn();
        render(<BrandLinkSheet onFollow={onFollow} />);
        fireEvent.pointerDown(brand(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
        fireEvent.pointerMove(brand(), { pointerId: 1, clientY: 103, pointerType: "touch" });
        fireEvent.pointerUp(brand(), { pointerId: 1, clientY: 103, pointerType: "touch" });
        await userEvent.setup().click(brand());
        expect(onFollow).toHaveBeenCalledOnce();
        expect(sheet()).not.toBeNull();
      });

      it("does not let the browser drag the link itself", () => {
        render(<BrandLinkSheet onFollow={() => {}} />);
        const event = new Event("dragstart", { bubbles: true, cancelable: true });
        brand().dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
      });
    });

    it("is off when swipeToDismiss is false", () => {
      render(<Harness initial swipe={false} />);
      expect(document.querySelector("[data-swipe]")).toBeNull();
    });
  });

  it("renders context in its own fixed region between the header and the scrolling body", () => {
    render(
      <NavSheet
        open
        onOpenChange={() => {}}
        label="Menu"
        context={<button type="button">Acme Lisbon</button>}
      >
        <a href="/one">One</a>
      </NavSheet>,
    );
    const region = document.querySelector<HTMLElement>('[data-lufia-part="nav-sheet-context"]')!;
    expect(region).toContainElement(screen.getByRole("button", { name: "Acme Lisbon" }));
    expect(region.closest("[data-swipe]")).toBeNull();
    expect(region.nextElementSibling).toHaveAttribute("data-sheet-body");
    const css = readFileSync("src/components/AppShell/NavSheet.module.css", "utf8");
    expect(css).toMatch(
      /\.context \{[^}]*max-block-size: 30dvh;[^}]*border-block-end:[^}]*overflow: hidden auto;/,
    );
    expect(css).toMatch(
      /\.context \+ \.body \{[^}]*min-block-size: min\(8rem, 25dvh\);[^}]*padding-block-start/,
    );
  });

  it("renders no context region without context", () => {
    render(<Harness initial />);
    expect(document.querySelector('[data-lufia-part="nav-sheet-context"]')).toBeNull();
  });

  it("waits for the exit animation unless motion is reduced", async () => {
    mockReducedMotion(false);
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    // Without a stylesheet there is no animation, so it unmounts on the next frame.
    await waitFor(() => expect(sheet()).toBeNull());
  });

  it("has no axe violations open", async () => {
    render(<Harness initial />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('NavSheet renderAs="dialog"', () => {
  let dialogMock: ReturnType<typeof mockDialog>;
  beforeEach(() => {
    mockReducedMotion(true);
    dialogMock = mockDialog();
  });
  afterEach(() => {
    cleanup();
    dialogMock.restore();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders a native dialog opened with showModal, and nothing while closed", async () => {
    render(<Harness renderAs="dialog" />);
    expect(sheet()).toBeNull();
    await userEvent.setup().click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = sheet()!;
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialogMock.showModal).toHaveBeenCalledTimes(1);
    expect(dialog).toHaveFocus();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape and the close button, returning focus, and does not inert the page itself", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness renderAs="dialog" />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(container).not.toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(sheet()).toBeNull();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(sheet()).toBeNull();
  });

  it("closes from the native backdrop (a press outside the panel) and from a cancel event", async () => {
    const user = userEvent.setup();
    render(<Harness renderAs="dialog" />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    // jsdom has no layout: the panel box is all zeros, so any positive coordinate is outside it.
    fireEvent.pointerDown(sheet()!, { clientX: 9, clientY: 9 });
    fireEvent.click(sheet()!, { clientX: 9, clientY: 9 });
    await waitFor(() => expect(sheet()).toBeNull());

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const cancel = new Event("cancel", { cancelable: true });
    act(() => void sheet()!.dispatchEvent(cancel));
    expect(cancel.defaultPrevented).toBe(true);
    await waitFor(() => expect(sheet()).toBeNull());
  });

  it("keeps swipe to dismiss", async () => {
    render(<Harness renderAs="dialog" initial />);
    const grabber = document.querySelector<HTMLElement>("[data-swipe]")!;
    fireEvent.pointerDown(grabber, { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(grabber, { pointerId: 1, clientY: 300, pointerType: "touch" });
    expect(sheet()).toHaveAttribute("data-dragging", "true");
    act(() => {
      fireEvent.pointerUp(grabber, { pointerId: 1, clientY: 300, pointerType: "touch" });
    });
    await waitFor(() => expect(sheet()).toBeNull());
  });

  it("closes on a followed link in the body or footer only when closeOnNavigate is on", async () => {
    const user = userEvent.setup();
    const stop = (event: Event) => event.preventDefault();
    const { unmount } = render(<Harness initial closeOnNavigate={false} />);
    const off = screen.getByRole("link", { name: "One" });
    off.addEventListener("click", stop);
    await user.click(off);
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    unmount();

    render(<Harness initial closeOnNavigate />);
    const help = screen.getByRole("link", { name: "Help" });
    help.addEventListener("click", stop);
    await user.click(help);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("with closeOnNavigate leaves the sheet open for a new-tab click, a modified click and a _blank link", async () => {
    const user = userEvent.setup();
    render(<Harness initial closeOnNavigate />);
    const one = screen.getByRole("link", { name: "One" });
    const newTab = screen.getByRole("link", { name: "New tab" });
    for (const link of [one, newTab]) link.addEventListener("click", (event) => event.preventDefault());
    await user.keyboard("{Control>}");
    await user.click(one);
    await user.keyboard("{/Control}");
    await user.click(newTab);
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
  });

  it("has no axe violations open", async () => {
    render(<Harness renderAs="dialog" initial />);
    // The browser makes the page behind inert; jsdom does not, so check the dialog alone.
    expect(await axe(sheet()!)).toHaveNoViolations();
  });
});

describe("NavSheet theming hooks", () => {
  function Scoped({ layerProps }: { layerProps?: Parameters<typeof NavSheet>[0]["layerProps"] }) {
    const anchor = useRef<HTMLDivElement>(null);
    return (
      <div data-lufia-theme="default" data-lufia-mode="dark">
        <div ref={anchor} />
        <NavSheet open onOpenChange={() => {}} label="Menu" layerProps={layerProps} inheritThemeFrom={anchor}>
          <a href="/one">One</a>
        </NavSheet>
      </div>
    );
  }

  it("marks its parts and carries layer props onto the portalled root", () => {
    render(<Scoped layerProps={{ className: "app-palette", "data-scope": "app" }} />);
    const layer = document.body.querySelector('[data-lufia-part="nav-sheet-layer"]');
    expect(layer).toHaveClass("app-palette");
    expect(layer).toHaveAttribute("data-scope", "app");
    expect(layer?.parentElement).toBe(document.body);
    expect(document.body.querySelector('[data-lufia-part="nav-sheet-backdrop"]')).not.toBeNull();
    expect(screen.getByRole("dialog", { name: "Menu" })).toHaveAttribute("data-lufia-part", "nav-sheet");
  });

  it("copies a scoped theme and mode onto the layer, and lets layer props win", () => {
    const { unmount } = render(<Scoped />);
    let layer = document.body.querySelector('[data-lufia-part="nav-sheet-layer"]');
    expect(layer).toHaveAttribute("data-lufia-theme", "default");
    expect(layer).toHaveAttribute("data-lufia-mode", "dark");
    unmount();
    render(<Scoped layerProps={{ "data-lufia-mode": "light" }} />);
    layer = document.body.querySelector('[data-lufia-part="nav-sheet-layer"]');
    expect(layer).toHaveAttribute("data-lufia-mode", "light");
  });
});

describe("NavSheet dragThreshold", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it("keeps the documented defaults", () => {
    expect(SHEET_DRAG_THRESHOLD).toEqual({
      ratio: 0.18,
      min: 64,
      max: 112,
      flickVelocity: 0.6,
      flickDistance: 24,
    });
    // 18% of 400 is 72: inside the 64..112 band.
    expect(dragDismisses(71, 0, 400)).toBe(false);
    expect(dragDismisses(72, 0, 400)).toBe(true);
    // A short sheet still needs 64, a tall one never more than 112.
    expect(dragDismisses(63, 0, 100)).toBe(false);
    expect(dragDismisses(112, 0, 2000)).toBe(true);
    expect(dragDismisses(30, 0.7, 2000)).toBe(true);
    expect(dragDismisses(20, 0.7, 2000)).toBe(false);
  });

  it("applies each field given and keeps the default for the rest", () => {
    expect(dragDismisses(72, 0, 400, { min: 100 })).toBe(false);
    expect(dragDismisses(100, 0, 400, { min: 100 })).toBe(true);
    expect(dragDismisses(50, 0, 1000, { ratio: 0.05, min: 0 })).toBe(true);
    expect(dragDismisses(40, 0, 2000, { max: 40 })).toBe(true);
    expect(dragDismisses(30, 0.7, 2000, { flickVelocity: 1 })).toBe(false);
    expect(dragDismisses(30, 0.7, 2000, { flickDistance: 40 })).toBe(false);
    expect(dragDismisses(72, 0, 400, { min: undefined })).toBe(true);
  });

  const grabber = () => document.querySelector<HTMLElement>("[data-swipe]")!;
  const slowDrag = (to: number) => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => (now += 500));
    fireEvent.pointerDown(grabber(), { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(grabber(), { pointerId: 1, clientY: 100 + to, pointerType: "touch" });
    act(() => {
      fireEvent.pointerUp(grabber(), { pointerId: 1, clientY: 100 + to, pointerType: "touch" });
    });
  };

  it("the grabber honours a longer distance", () => {
    const onOpenChange = vi.fn();
    render(
      <NavSheet open onOpenChange={onOpenChange} label="Menu" dragThreshold={{ min: 300, max: 300 }}>
        <a href="/one">One</a>
      </NavSheet>,
    );
    slowDrag(200);
    expect(onOpenChange).not.toHaveBeenCalled();
    slowDrag(320);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("the body honours a shorter distance", () => {
    const onOpenChange = vi.fn();
    render(
      <NavSheet open onOpenChange={onOpenChange} label="Menu" dragThreshold={{ min: 30, max: 30 }}>
        <a href="/one">One</a>
      </NavSheet>,
    );
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => (now += 500));
    const body = document.querySelector<HTMLElement>("[data-sheet-body]")!;
    fireEvent.touchStart(body, { touches: [{ identifier: 1, clientX: 50, clientY: 100 }] });
    fireEvent.touchMove(body, { touches: [{ identifier: 1, clientX: 50, clientY: 120 }] });
    fireEvent.touchMove(body, { touches: [{ identifier: 1, clientX: 50, clientY: 140 }] });
    fireEvent.touchEnd(body, { touches: [], changedTouches: [{ identifier: 1, clientX: 50, clientY: 140 }] });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("NavSheet dock", () => {
  function Docked({ renderAs, initial = false }: { renderAs?: "portal" | "dialog"; initial?: boolean }) {
    const [open, setOpen] = useState(initial);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open menu
        </button>
        <NavSheet
          open={open}
          onOpenChange={setOpen}
          label="Menu"
          renderAs={renderAs}
          footer={<a href="/help">Help</a>}
          dock={
            <div role="group" aria-label="Bar">
              <button type="button" onClick={() => setOpen(false)}>
                Close menu
              </button>
            </div>
          }
        >
          <a href="/one">One</a>
        </NavSheet>
      </>
    );
  }

  let dialogMock: ReturnType<typeof mockDialog>;
  beforeEach(() => {
    mockReducedMotion(true);
    dialogMock = mockDialog();
  });
  afterEach(() => {
    cleanup();
    dialogMock.restore();
    vi.unstubAllGlobals();
  });

  for (const renderAs of ["portal", "dialog"] as const) {
    describe(renderAs, () => {
      it("puts the dock inside the dialog, outside the sheet, and drops the header's own close button", async () => {
        const user = userEvent.setup();
        render(<Docked renderAs={renderAs} />);
        await user.click(screen.getByRole("button", { name: "Open menu" }));
        const dialog = sheet()!;
        const dock = dialog.querySelector('[data-lufia-part="nav-sheet-dock"]')!;
        const panel = dialog.querySelector('[data-lufia-part="nav-sheet"]')!;
        expect(dock).toContainElement(screen.getByRole("group", { name: "Bar" }));
        expect(panel).not.toContainElement(dock as HTMLElement);
        expect(panel).toHaveAttribute("data-docked");
        expect(screen.getAllByRole("button", { name: /close/i })).toHaveLength(1);
      });

      it("lets Tab reach the dock after the sheet's content, and closes from it with focus back on the opener", async () => {
        const user = userEvent.setup();
        render(<Docked renderAs={renderAs} />);
        const opener = screen.getByRole("button", { name: "Open menu" });
        await user.click(opener);
        await user.tab();
        expect(screen.getByRole("link", { name: "One" })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("link", { name: "Help" })).toHaveFocus();
        await user.tab();
        const close = screen.getByRole("button", { name: "Close menu" });
        expect(close).toHaveFocus();
        await user.click(close);
        expect(sheet()).toBeNull();
        expect(opener).toHaveFocus();
      });

      it("has no axe violations open", async () => {
        render(<Docked renderAs={renderAs} initial />);
        expect(await axe(document.body)).toHaveNoViolations();
      });
    });
  }

  it("keeps the dock, untouchable, while the sheet animates out after a drag", () => {
    mockReducedMotion(false);
    render(<Docked initial />);
    const grabber = document.querySelector<HTMLElement>("[data-swipe]")!;
    fireEvent.pointerDown(grabber, { pointerId: 1, clientY: 100, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(grabber, { pointerId: 1, clientY: 200, pointerType: "touch" });
    fireEvent.pointerMove(grabber, { pointerId: 1, clientY: 300, pointerType: "touch" });
    act(() => {
      fireEvent.pointerUp(grabber, { pointerId: 1, clientY: 300, pointerType: "touch" });
    });
    const layer = document.querySelector('[data-lufia-part="nav-sheet-layer"]');
    expect(layer).toHaveAttribute("data-state", "closed");
    expect(layer!.querySelector('[data-lufia-part="nav-sheet-dock"]')).not.toBeNull();
    expect(dockCss).toMatch(/\.root\[data-state="closed"\] \.dock \{\s*pointer-events: none;/);
  });

  it("keeps the end of the sheet clear of the dock", () => {
    expect(dockCss).toMatch(
      /\.panel\[data-docked\] > \.foot \{\s*padding-block-end: calc\(var\(--lufia-nav-sheet-dock-clearance, 4\.75rem\) \+ env\(safe-area-inset-bottom\)\);/,
    );
  });
});

it("scrolls a focused item to above the dock, not under it", () => {
  expect(dockCss).toMatch(
    /\.panel\[data-docked\] > \.body \{\s*scroll-padding-block-end: calc\(\s*var\(--lufia-nav-sheet-dock-clearance, 4\.75rem\) \+ env\(safe-area-inset-bottom\)\s*\);/,
  );
});

const dockCss = readFileSync("src/components/AppShell/NavSheet.module.css", "utf8");
