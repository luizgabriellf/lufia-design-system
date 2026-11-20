import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useEffect, useState } from "react";
import { axe } from "../../test/axe";
import { mockDialog } from "../../test/dialog";
import { mockReducedMotion } from "../../test/motion";
import { LufiaProvider } from "../LufiaProvider";
import { Modal } from "../Modal";
import { ToastProvider, useOptionalToast, useToast, type ToastApi, type ToastProviderProps } from "./Toast";

const captured: { current: ToastApi | null } = { current: null };
/** The API of the provider under test. */
const api = () => captured.current!;
function Capture() {
  const toast = useToast();
  useEffect(() => {
    captured.current = toast;
  }, [toast]);
  return null;
}

function setup(props?: Partial<ToastProviderProps>) {
  return render(
    <ToastProvider {...props}>
      <Capture />
    </ToastProvider>,
  );
}

/** Queries inside the visible stack (the announcer holds a second, screen-reader-only copy of each message). */
const list = () => within(screen.getByRole("region", { name: "Notifications" }));
const polite = () => document.querySelector<HTMLElement>('[aria-live="polite"]')!;
/** The announcer of one host: the body's, or the one inside a dialog. */
const politeIn = (host: Element) =>
  host.querySelector<HTMLElement>(":scope > [data-lufia-announcer] [aria-live='polite']");
const bodyPolite = () => politeIn(document.body)!;
const assertive = () => document.querySelector<HTMLElement>('[aria-live="assertive"]')!;
/** Runs timers and the frame that removes a toast once its exit is over (no stylesheet here, so no animation to wait for). */
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
/** `advance`, then the frame in which a dismissed toast is removed (React renders the dismissal only after the timer ran). */
const advanceAndSettle = (ms: number) => {
  advance(ms);
  advance(50);
};

beforeEach(() => vi.useFakeTimers());
let dialogMock: ReturnType<typeof mockDialog>;
beforeEach(() => {
  dialogMock = mockDialog();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  dialogMock.restore();
});

describe("ToastProvider", () => {
  it("keeps labelled, empty live regions mounted so later toasts are announced", () => {
    setup();
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    expect(polite()).toBeEmptyDOMElement();
    expect(assertive()).toBeEmptyDOMElement();
  });

  it("announces errors assertively and everything else politely", () => {
    setup();
    act(() => {
      api().success("Saved");
      api().info("Syncing");
      api().warning("Almost full");
      api().error("Upload failed");
    });
    expect(within(polite()).getByText("Saved")).toBeInTheDocument();
    expect(within(polite()).getByText("Syncing")).toBeInTheDocument();
    expect(within(polite()).getByText("Almost full")).toBeInTheDocument();
    expect(within(assertive()).getByText("Upload failed")).toBeInTheDocument();
    expect(polite()).not.toHaveTextContent("Upload failed");
  });

  it("closes a toast by itself after the default duration", () => {
    setup();
    act(() => void api().success("Saved"));
    advance(4999);
    expect(list().getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(1);
    expect(list().queryByText("Saved")).not.toBeInTheDocument();
  });

  it("honours a custom provider duration and a per-toast duration", () => {
    setup({ duration: 1000 });
    act(() => {
      api().success("Quick");
      api().success("Slow", { duration: 3000 });
    });
    advanceAndSettle(1100);
    expect(list().queryByText("Quick")).not.toBeInTheDocument();
    expect(list().getByText("Slow")).toBeInTheDocument();
  });

  it("never closes an error, or a toast with an action, by itself", () => {
    setup();
    act(() => {
      api().error("Upload failed");
      api().info("Moved to trash", { action: { label: "Undo", onAction: () => {} } });
    });
    advanceAndSettle(60_000);
    expect(list().getByText("Upload failed")).toBeInTheDocument();
    expect(list().getByText("Moved to trash")).toBeInTheDocument();
  });

  it("lets a caller opt an error into a timeout, or keep a toast until dismissed", () => {
    setup();
    act(() => {
      api().error("Transient", { duration: 2000 });
      api().success("Sticky", { duration: null });
    });
    advanceAndSettle(2100);
    expect(list().queryByText("Transient")).not.toBeInTheDocument();
    advanceAndSettle(60_000);
    expect(list().getByText("Sticky")).toBeInTheDocument();
  });

  it("pauses while hovered and gives the person time to read when the pointer leaves", () => {
    setup();
    act(() => void api().success("Saved"));
    const toast = list().getByText("Saved").closest("li")!;
    advance(3000);
    fireEvent.pointerEnter(toast);
    advanceAndSettle(30_000);
    expect(list().getByText("Saved")).toBeInTheDocument();
    fireEvent.pointerLeave(toast);
    advance(1900); // the 2 s that were left when it was paused
    expect(list().getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(200);
    expect(list().queryByText("Saved")).not.toBeInTheDocument();
  });

  it("pauses while a control inside has focus and resumes on blur", () => {
    setup();
    act(() => void api().success("Saved"));
    advance(4500); // 0.5 s left: resuming grants at least 1.5 s
    const dismissButton = screen.getByRole("button", { name: "Dismiss" });
    act(() => dismissButton.focus());
    advanceAndSettle(30_000);
    expect(list().getByText("Saved")).toBeInTheDocument();
    act(() => dismissButton.blur());
    advance(1400);
    expect(list().getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(200);
    expect(list().queryByText("Saved")).not.toBeInTheDocument();
  });

  it("dismisses with the dismiss button and with Escape on a focused toast", () => {
    setup();
    act(() => {
      api().error("First");
      api().error("Second");
    });
    fireEvent.click(
      within(list().getByText("First").closest("li")!).getByRole("button", { name: "Dismiss" }),
    );
    advance(50);
    expect(list().queryByText("First")).not.toBeInTheDocument();
    const second = within(list().getByText("Second").closest("li")!).getByRole("button", { name: "Dismiss" });
    act(() => second.focus());
    fireEvent.keyDown(second, { key: "Escape" });
    advance(50);
    expect(list().queryByText("Second")).not.toBeInTheDocument();
  });

  it("runs the action once and dismisses the toast", () => {
    const onAction = vi.fn();
    setup();
    act(() => void api().info("Moved to trash", { action: { label: "Undo", onAction } }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    advance(50);
    expect(list().queryByText("Moved to trash")).not.toBeInTheDocument();
  });

  it("does not stack an identical visible toast, and de-duplicates by id", () => {
    setup();
    let first = "";
    let again = "";
    act(() => {
      first = api().success("Saved");
      again = api().success("Saved");
      api().info("A", { id: "sync" });
      api().info("B", { id: "sync" });
    });
    expect(again).toBe(first);
    expect(list().getAllByText("Saved")).toHaveLength(1);
    expect(list().getByText("A")).toBeInTheDocument();
    expect(list().queryByText("B")).not.toBeInTheDocument();
  });

  it("re-shows a toast whose id is reused while the first copy is still leaving", () => {
    setup();
    act(() => void api().success("First", { id: "save" }));
    act(() => {
      api().dismiss("save");
      api().success("Second", { id: "save" });
    });
    advanceAndSettle(50);
    expect(list().queryByText("First")).not.toBeInTheDocument();
    expect(list().getByText("Second")).toBeInTheDocument();
  });

  it("shows at most `limit` toasts, dropping the oldest", () => {
    setup({ limit: 2 });
    act(() => {
      api().error("one");
      api().error("two");
      api().error("three");
    });
    advance(50);
    expect(list().queryByText("one")).not.toBeInTheDocument();
    expect(list().getByText("two")).toBeInTheDocument();
    expect(list().getByText("three")).toBeInTheDocument();
  });

  it("clears every toast", () => {
    setup();
    act(() => {
      api().error("one");
      api().success("two");
      api().clear();
    });
    advance(50);
    expect(list().queryByText("one")).not.toBeInTheDocument();
    expect(list().queryByText("two")).not.toBeInTheDocument();
  });

  it("removes a dismissed toast at once under reduced motion", () => {
    mockReducedMotion(true);
    setup();
    act(() => void api().error("Upload failed"));
    act(() => api().clear());
    advance(20);
    expect(list().queryByText("Upload failed")).not.toBeInTheDocument();
  });

  it("takes the dismiss button's name and the region's name from the provider", () => {
    render(
      <LufiaProvider labels={{ dismiss: "Dispensar", notifications: "Avisos" }}>
        <ToastProvider>
          <Capture />
        </ToastProvider>
      </LufiaProvider>,
    );
    act(() => void api().error("Falhou"));
    expect(screen.getByRole("region", { name: "Avisos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dispensar" })).toBeInTheDocument();
  });

  it("reflects the placement on the viewport and marks it exempt from the inert background", () => {
    setup({ placement: "top-start" });
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveAttribute("data-placement", "top-start");
    expect(region).toHaveAttribute("data-lufia-inert-exempt");
  });

  it("has no axe violations with every tone and an action on screen", async () => {
    vi.useRealTimers();
    setup();
    act(() => {
      api().info("Syncing");
      api().success("Saved");
      api().warning("Almost full");
      api().error("Upload failed", { action: { label: "Retry", onAction: () => {} } });
    });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("swiping a toast away", () => {
  const touch = { pointerId: 1, pointerType: "touch", isPrimary: true, button: 0 };

  function swipeSetup() {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 300,
      height: 48,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 300,
      bottom: 48,
      toJSON: () => ({}),
    });
    setup();
    act(() => void api().success("Saved"));
    return list().getByText("Saved").closest("li")!;
  }
  const move = (toast: Element, x: number, y = 0, init: object = touch) =>
    fireEvent.pointerMove(toast, { ...init, clientX: x, clientY: y });
  const down = (toast: Element, init: object = touch) =>
    fireEvent.pointerDown(toast, { ...init, clientX: 100, clientY: 100 });
  const up = (toast: Element, x: number, y = 100, init: object = touch) =>
    fireEvent.pointerUp(toast, { ...init, clientX: x, clientY: y });
  const gone = () => {
    advance(50);
    return list().queryByText("Saved") === null;
  };

  afterEach(() => vi.restoreAllMocks());

  it("follows the finger and fades while it is dragged", () => {
    const toast = swipeSetup();
    down(toast);
    move(toast, 160, 100);
    expect(toast).toHaveAttribute("data-dragging", "true");
    expect(toast.style.getPropertyValue("--toast-drag-x")).toBe("60px");
    expect(Number(toast.style.getPropertyValue("--toast-drag-opacity"))).toBeCloseTo(0.65);
  });

  it("dismisses past 40% of the width and leaves in the direction of the swipe", () => {
    const toast = swipeSetup();
    down(toast);
    move(toast, 20, 100);
    advance(500);
    up(toast, -20);
    expect(toast).toHaveAttribute("data-swipe", "start");
    expect(toast).not.toHaveAttribute("data-dragging");
    expect(gone()).toBe(true);
  });

  it("leaves toward the end when swiped that way", () => {
    const toast = swipeSetup();
    down(toast);
    move(toast, 240, 100);
    advance(500);
    up(toast, 240);
    expect(toast).toHaveAttribute("data-swipe", "end");
    expect(gone()).toBe(true);
  });

  it("dismisses on a fast short flick", () => {
    const toast = swipeSetup();
    down(toast);
    advance(10);
    move(toast, 110, 100);
    advance(10);
    move(toast, 140, 100);
    up(toast, 140);
    expect(gone()).toBe(true);
  });

  it("does not treat a quick pull back toward rest as a flick", () => {
    const toast = swipeSetup();
    down(toast);
    advance(10);
    move(toast, 170, 100);
    advance(10);
    move(toast, 135, 100);
    up(toast, 135);
    expect(toast).not.toHaveAttribute("data-swipe");
    expect(gone()).toBe(false);
  });

  it("does not treat a held finger as a flick", () => {
    const toast = swipeSetup();
    down(toast);
    advance(10);
    move(toast, 110, 100);
    advance(10);
    move(toast, 140, 100);
    advance(400);
    up(toast, 140);
    expect(toast).not.toHaveAttribute("data-swipe");
    expect(gone()).toBe(false);
  });

  it("returns to rest after a short, slow drag", () => {
    const toast = swipeSetup();
    down(toast);
    advance(300);
    move(toast, 130, 100);
    advance(300);
    move(toast, 140, 100);
    advance(300);
    up(toast, 140);
    expect(toast).not.toHaveAttribute("data-dragging");
    expect(toast).not.toHaveAttribute("data-swipe");
    expect(toast.style.getPropertyValue("--toast-drag-x")).toBe("0px");
    expect(gone()).toBe(false);
  });

  it("ignores a mostly vertical drag", () => {
    const toast = swipeSetup();
    down(toast);
    move(toast, 105, 160);
    move(toast, 300, 170);
    up(toast, 300, 170);
    expect(toast).not.toHaveAttribute("data-dragging");
    expect(toast.style.getPropertyValue("--toast-drag-x")).toBe("");
    expect(gone()).toBe(false);
  });

  it("ignores a mouse drag", () => {
    const toast = swipeSetup();
    const mouse = { ...touch, pointerType: "mouse" };
    down(toast, mouse);
    move(toast, 300, 100, mouse);
    up(toast, 300, 100, mouse);
    expect(toast).not.toHaveAttribute("data-dragging");
    expect(gone()).toBe(false);
  });

  it("returns to rest when the browser cancels the gesture", () => {
    const toast = swipeSetup();
    down(toast);
    move(toast, 250, 100);
    fireEvent.pointerCancel(toast, touch);
    expect(toast).not.toHaveAttribute("data-dragging");
    expect(toast.style.getPropertyValue("--toast-drag-x")).toBe("0px");
    expect(gone()).toBe(false);
  });

  it("holds the timer during the drag and gives the person time to read after a return", () => {
    const toast = swipeSetup();
    advance(3000);
    down(toast);
    move(toast, 140, 100);
    advanceAndSettle(30_000);
    expect(list().getByText("Saved")).toBeInTheDocument();
    up(toast, 100);
    advance(1900); // the 2 s that were left when the drag started
    expect(list().getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(200);
    expect(list().queryByText("Saved")).not.toBeInTheDocument();
  });

  it("keeps a tap on the close button a single click, with no drag", () => {
    const toast = swipeSetup();
    const close = within(toast).getByRole("button", { name: "Dismiss" });
    down(close);
    move(close, 103, 102);
    up(close, 103, 102);
    expect(toast).not.toHaveAttribute("data-dragging");
    expect(list().getByText("Saved")).toBeInTheDocument();
    fireEvent.click(close);
    expect(gone()).toBe(true);
  });

  it("still dismisses on a swipe under reduced motion, and removes it at once", () => {
    mockReducedMotion(true);
    const toast = swipeSetup();
    down(toast);
    move(toast, 260, 100);
    advance(500);
    up(toast, 260);
    advance(20);
    expect(list().queryByText("Saved")).not.toBeInTheDocument();
  });
});

describe("useToast", () => {
  it("throws outside a provider, and useOptionalToast returns null", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    function Probe() {
      return <p>{useOptionalToast() === null ? "none" : "some"}</p>;
    }
    render(<Probe />);
    expect(screen.getByText("none")).toBeInTheDocument();
    expect(() => render(<Capture />)).toThrow(/ToastProvider/);
    quiet.mockRestore();
  });

  describe("hosting", () => {
    it("renders in document.body by default", () => {
      setup();
      expect(screen.getByRole("region", { name: "Notifications" }).parentElement).toBe(document.body);
    });

    it("renders in the element given as container", () => {
      const host = document.createElement("div");
      document.body.append(host);
      setup({ container: host });
      expect(screen.getByRole("region", { name: "Notifications" }).parentElement).toBe(host);
      host.remove();
    });

    it("hosts the region inside the topmost modal dialog, and moves back to the body when it closes", async () => {
      const first = document.createElement("dialog");
      const second = document.createElement("dialog");
      document.body.append(first, second);
      setup();
      const region = () => screen.getByRole("region", { name: "Notifications" });
      expect(region().parentElement).toBe(document.body);

      await act(async () => {
        first.showModal();
        second.showModal();
      });
      expect(region().parentElement).toBe(second);

      await act(async () => second.close());
      expect(region().parentElement).toBe(first);

      await act(async () => first.close());
      expect(region().parentElement).toBe(document.body);
      first.remove();
      second.remove();
    });

    it("does not follow a non-modal dialog", async () => {
      const dialog = document.createElement("dialog");
      document.body.append(dialog);
      setup();
      await act(async () => dialog.setAttribute("open", ""));
      expect(screen.getByRole("region", { name: "Notifications" }).parentElement).toBe(document.body);
      dialog.remove();
    });

    it("keeps toasts raised before a dialog opened", async () => {
      const dialog = document.createElement("dialog");
      document.body.append(dialog);
      setup();
      act(() => void api().error("Upload failed"));
      await act(async () => dialog.showModal());
      expect(within(dialog).getByText("Upload failed")).toBeInTheDocument();
      dialog.remove();
    });

    it("ignores dialogs when container is null", async () => {
      const dialog = document.createElement("dialog");
      document.body.append(dialog);
      setup({ container: null });
      await act(async () => dialog.showModal());
      expect(screen.getByRole("region", { name: "Notifications" }).parentElement).toBe(document.body);
      dialog.remove();
    });
  });

  describe("announcing across a host change", () => {
    it("announces a toast raised as a native dialog closes, in a live region that existed before", async () => {
      vi.useRealTimers();
      function Screen() {
        const [open, setOpen] = useState(true);
        return (
          <Modal
            open={open}
            renderAs="dialog"
            onClose={() => setOpen(false)}
            title="Edit"
            footer={
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  api().success("Saved");
                }}
              >
                Save
              </button>
            }
          >
            Body
          </Modal>
        );
      }
      render(
        <ToastProvider>
          <Capture />
          <Screen />
        </ToastProvider>,
      );
      await act(async () => {});
      const region = bodyPolite();
      const added: Node[] = [];
      new MutationObserver((records) => records.forEach((r) => added.push(...r.addedNodes))).observe(region, {
        childList: true,
        subtree: true,
      });
      // The visible stack moved into the dialog when it opened.
      expect(screen.getByRole("dialog")).toContainElement(
        screen.getByRole("region", { name: "Notifications" }),
      );
      await act(async () => screen.getByRole("button", { name: "Save" }).click());
      await act(async () => {});
      // The dialog leaves on the next frame (no stylesheet, so no exit animation to wait for).
      await waitFor(() => expect(document.querySelector("dialog")).toBeNull());
      expect(bodyPolite()).toBe(region);
      expect(region.isConnected).toBe(true);
      expect(region).toHaveTextContent("Saved");
      expect(added.some((node) => node.textContent === "Saved")).toBe(true);
      // And the visible stack followed the host back to the body without replaying its enter.
      const stack = screen.getByRole("region", { name: "Notifications" });
      expect(stack.parentElement).toBe(document.body);
      expect(within(stack).getByText("Saved").closest("li")).toHaveAttribute("data-moved");
    });
  });

  describe("announcer hosts", () => {
    it("keeps a persistent announcer pair inside each open modal dialog and removes it when the dialog closes", async () => {
      const dialog = document.createElement("dialog");
      document.body.append(dialog);
      setup();
      expect(politeIn(dialog)).toBeNull();
      await act(async () => dialog.showModal());
      const inside = politeIn(dialog)!;
      expect(inside).toHaveAttribute("role", "status");
      expect(dialog.querySelector("[role='alert']")).not.toBeNull();
      await act(async () => dialog.close());
      expect(inside.isConnected).toBe(false);
      expect(politeIn(document.body)).not.toBeNull();
      dialog.remove();
    });

    it("announces a toast raised while a dialog stays open in that dialog's announcer, not in the body's", async () => {
      const dialog = document.createElement("dialog");
      document.body.append(dialog);
      setup();
      await act(async () => dialog.showModal());
      act(() => void api().error("Save failed"));
      act(() => void api().success("Saved"));
      expect(dialog.querySelector("[role='alert']")).toHaveTextContent("Save failed");
      expect(politeIn(dialog)).toHaveTextContent("Saved");
      expect(bodyPolite()).toBeEmptyDOMElement();
      dialog.remove();
    });

    it("follows a dialog that the app removes from the document while it is open", async () => {
      const dialog = document.createElement("dialog");
      document.body.append(dialog);
      dialog.showModal();
      setup();
      expect(screen.getByRole("region", { name: "Notifications" }).parentElement).toBe(dialog);
      await act(async () => dialog.remove());
      expect(screen.getByRole("region", { name: "Notifications" }).parentElement).toBe(document.body);
    });
  });

  describe("a kept-mounted dialog", () => {
    it("announces a toast raised as it closes in the body's announcer, not in the closed dialog", async () => {
      vi.useRealTimers();
      function Screen() {
        const [open, setOpen] = useState(true);
        return (
          <Modal
            open={open}
            renderAs="dialog"
            keepMounted
            onClose={() => setOpen(false)}
            title="Edit"
            footer={
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  api().success("Saved");
                }}
              >
                Save
              </button>
            }
          >
            Body
          </Modal>
        );
      }
      render(
        <ToastProvider>
          <Capture />
          <Screen />
        </ToastProvider>,
      );
      await act(async () => {});
      await act(async () => screen.getByRole("button", { name: "Save" }).click());
      await act(async () => {});
      await waitFor(() => expect(document.querySelector("dialog")).not.toHaveAttribute("open"));
      const holders = Array.from(document.querySelectorAll("[data-lufia-announcer] [aria-live]")).filter(
        (region) => region.textContent?.includes("Saved"),
      );
      expect(holders.map((region) => (region.closest("dialog") ? "dialog" : "body"))).toEqual(["body"]);
    });
  });

  describe("tone aliases", () => {
    it("maps an app's tone names onto the built-in tones", () => {
      setup({ toneAliases: { ok: "success", warn: "warning", bad: "error" } });
      act(() => {
        api().show({ message: "Done", tone: "ok" });
        api().show({ message: "Careful", tone: "warn" });
        api().show({ message: "Broken", tone: "bad" });
      });
      expect(list().getByText("Done").closest("li")).toHaveAttribute("data-tone", "success");
      expect(list().getByText("Careful").closest("li")).toHaveAttribute("data-tone", "warning");
      // An aliased error is still announced assertively and stays until dismissed.
      expect(within(assertive()).getByText("Broken")).toBeInTheDocument();
      expect(list().getByText("Broken").closest("li")).toHaveAttribute("data-tone", "error");
      advance(60_000);
      expect(list().getByText("Broken")).toBeInTheDocument();
    });

    it("de-duplicates by resolved tone and falls back to info for an unknown name", () => {
      setup({ toneAliases: { ok: "success" } });
      act(() => {
        api().show({ message: "Saved", tone: "ok" });
        api().success("Saved");
        api().show({ message: "Mystery", tone: "nope" });
      });
      expect(list().getAllByText("Saved")).toHaveLength(1);
      expect(list().getByText("Mystery").closest("li")).toHaveAttribute("data-tone", "info");
    });
  });

  it("uses the provider's default duration", () => {
    setup({ duration: 3500 });
    act(() => void api().success("Saved"));
    advance(3499);
    expect(list().getByText("Saved")).toBeInTheDocument();
    advanceAndSettle(1);
    expect(list().queryByText("Saved")).not.toBeInTheDocument();
  });

  it("puts viewportClassName and a stable part hook on the notification region", () => {
    setup({ viewportClassName: "legacy-viewport" });
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveClass("legacy-viewport");
    expect(region).toHaveAttribute("data-lufia-part", "viewport");
  });

  it("keeps its live regions mounted before any message, so the first one is announced", () => {
    setup();
    expect(document.querySelector('[role="alert"][aria-live="assertive"]')).toBeEmptyDOMElement();
    expect(document.querySelector('[role="status"][aria-live="polite"]')).toBeEmptyDOMElement();
  });
});
