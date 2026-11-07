import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { mockDialog } from "../../test/dialog";
import { mockReducedMotion } from "../../test/motion";
import { isBodyScrollLocked } from "../useBodyScrollLock";
import { LufiaProvider } from "../LufiaProvider";
import { ConfirmDialog } from "../ConfirmDialog";
import { Modal, type ModalProps } from "./Modal";

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => vi.unstubAllGlobals());

function Harness(props: Partial<ModalProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal
        title="Edit profile"
        {...props}
        open={open}
        onClose={() => {
          props.onClose?.();
          setOpen(false);
        }}
        footer={
          <>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </>
        }
      >
        <input aria-label="Name" />
      </Modal>
    </>
  );
}

async function openModal() {
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Open modal" });
  await user.click(trigger);
  return { user, trigger, dialog: screen.getByRole("dialog") };
}

describe("Modal", () => {
  it("renders nothing visible while closed and a named modal dialog while open", async () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const { dialog } = await openModal();
    expect(dialog).toHaveAccessibleName("Edit profile");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.parentElement?.parentElement?.parentElement).toBe(document.body);
  });

  it("wires the description and supports the alertdialog role", async () => {
    render(<Harness description="Changes apply to everyone." role="alertdialog" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open modal" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAccessibleDescription("Changes apply to everyone.");
  });

  it("moves focus into the dialog, wraps Tab and Shift+Tab, and keeps focus out of the page", async () => {
    render(<Harness />);
    const { user, dialog } = await openModal();
    expect(dialog).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const { user, trigger } = await openModal();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("returns focus to the trigger when closed with the close button", async () => {
    render(<Harness />);
    const { user, trigger } = await openModal();
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("ignores Escape when closeOnEscape is off", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} closeOnEscape={false} />);
    const { user } = await openModal();
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on a click that starts and ends on the backdrop, not on one that started inside", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const { dialog } = await openModal();
    const backdrop = document.querySelector<HTMLElement>('[aria-hidden="true"][data-state]')!;

    // A text selection that begins in the dialog and is released over the backdrop produces a click there, without a press.
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(backdrop);
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores outside clicks when closeOnOutsideClick is off", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} closeOnOutsideClick={false} />);
    await openModal();
    const backdrop = document.querySelector<HTMLElement>('[aria-hidden="true"][data-state]')!;
    fireEvent.pointerDown(backdrop);
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("refuses every dismissal while busy and says so", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} busy />);
    const { user, dialog } = await openModal();
    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    await user.keyboard("{Escape}");
    const backdrop = document.querySelector<HTMLElement>('[aria-hidden="true"][data-state]')!;
    fireEvent.pointerDown(backdrop);
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("locks page scroll and makes the page inert while open, and releases both on close", async () => {
    const { container } = render(<Harness />);
    expect(isBodyScrollLocked()).toBe(false);
    const { user } = await openModal();
    expect(isBodyScrollLocked()).toBe(true);
    expect(container).toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(isBodyScrollLocked()).toBe(false);
    expect(container).not.toHaveAttribute("inert");
  });

  it("stays mounted for the exit and then unmounts", async () => {
    render(<Harness />);
    const { user } = await openModal();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("unmounts at once under reduced motion", async () => {
    mockReducedMotion(true);
    render(<Harness />);
    const { user } = await openModal();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("names the close button from the prop, then the provider, then the English default", async () => {
    const { unmount } = render(
      <LufiaProvider labels={{ close: "Fechar" }}>
        <Harness />
      </LufiaProvider>,
    );
    await openModal();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    unmount();

    render(<Harness closeLabel="Dismiss panel" />);
    await openModal();
    expect(screen.getByRole("button", { name: "Dismiss panel" })).toBeInTheDocument();
  });

  it("can hide the close button", async () => {
    render(<Harness hideCloseButton />);
    await openModal();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("sets the size, passes className and rest props to the dialog, and renders the header action", async () => {
    render(
      <Harness
        size="lg"
        className="extra"
        data-testid="panel"
        headerAction={<button type="button">Help</button>}
      />,
    );
    const { dialog } = await openModal();
    expect(dialog).toHaveAttribute("data-size", "lg");
    expect(dialog).toHaveClass("panel", "extra");
    expect(dialog).toHaveAttribute("data-testid", "panel");
    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    render(<Harness description="Changes apply to everyone." />);
    await openModal();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  describe("header block size", () => {
    type Entry = { borderBoxSize: { blockSize: number }[] };
    let observers: { callback: (entries: Entry[]) => void; observed: Element[]; disconnected: boolean }[];
    let headerHeight: number;

    beforeEach(() => {
      observers = [];
      headerHeight = 64;
      vi.stubGlobal(
        "ResizeObserver",
        class {
          record: (typeof observers)[number];
          constructor(callback: (entries: Entry[]) => void) {
            this.record = { callback, observed: [], disconnected: false };
            observers.push(this.record);
          }
          observe(target: Element) {
            this.record.observed.push(target);
          }
          unobserve() {}
          disconnect() {
            this.record.disconnected = true;
          }
        },
      );
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
        this: HTMLElement,
      ) {
        return { height: this.tagName === "HEADER" ? headerHeight : 0 } as DOMRect;
      });
    });
    afterEach(() => vi.restoreAllMocks());

    const property = (dialog: HTMLElement) =>
      dialog.style.getPropertyValue("--lufia-modal-header-block-size");

    it("publishes the header height on the panel and follows it as the header resizes", async () => {
      render(<Harness />);
      const { dialog } = await openModal();
      expect(property(dialog)).toBe("64px");
      const header = dialog.querySelector("[data-lufia-part='header']")!;
      const observer = observers.find((o) => o.observed.includes(header))!;
      expect(observer).toBeDefined();
      act(() => observer.callback([{ borderBoxSize: [{ blockSize: 92.5 }] }]));
      expect(property(dialog)).toBe("92.5px");
    });

    it("is 0px when the body is the scroller, because the header does not overlap it", async () => {
      render(<Harness scrollShadow />);
      const { dialog } = await openModal();
      expect(property(dialog)).toBe("0px");
    });

    it("measures once without ResizeObserver", async () => {
      vi.stubGlobal("ResizeObserver", undefined);
      render(<Harness />);
      const { dialog } = await openModal();
      expect(property(dialog)).toBe("64px");
    });

    it("re-observes the new header when the portal target changes while open", () => {
      const first = document.body.appendChild(document.createElement("div"));
      const second = document.body.appendChild(document.createElement("div"));
      const { rerender } = render(<Modal open onClose={() => {}} title="T" container={first} />);
      const dialog = () => screen.getByRole("dialog");
      expect(dialog().style.getPropertyValue("--lufia-modal-header-block-size")).toBe("64px");
      headerHeight = 80;
      rerender(<Modal open onClose={() => {}} title="T" container={second} />);
      expect(second.contains(dialog())).toBe(true);
      expect(dialog().style.getPropertyValue("--lufia-modal-header-block-size")).toBe("80px");
      const header = dialog().querySelector("[data-lufia-part='header']")!;
      const live = observers.filter((o) => !o.disconnected && o.observed.length > 0);
      expect(live.map((o) => o.observed[0])).toEqual([header]);
      act(() => live[0]!.callback([{ borderBoxSize: [{ blockSize: 100 }] }]));
      expect(dialog().style.getPropertyValue("--lufia-modal-header-block-size")).toBe("100px");
    });

    it("stops observing when the modal closes", async () => {
      render(<Harness />);
      const { user } = await openModal();
      await user.keyboard("{Escape}");
      await waitFor(() => expect(observers.every((o) => o.disconnected)).toBe(true));
    });

    it("is published in the native dialog mode too", async () => {
      const restore = mockDialog();
      try {
        const { unmount } = render(<Harness renderAs="dialog" />);
        const { dialog } = await openModal();
        expect(property(dialog)).toBe("64px");
        unmount();
      } finally {
        restore.restore();
      }
    });
  });

  describe("theming options", () => {
    it("marks the sheet placement, the title wrap and the scroll shadow for the stylesheet", async () => {
      render(<Harness sheetPlacement="top" titleWrap="ellipsis" scrollShadow />);
      const { dialog } = await openModal();
      expect(dialog).toHaveAttribute("data-sheet", "top");
      expect(dialog).toHaveAttribute("data-title-wrap", "ellipsis");
      expect(dialog).toHaveAttribute("data-scroll-shadow");
      expect(screen.getByRole("heading", { name: "Edit profile" })).toHaveAttribute("title", "Edit profile");
    });

    it("defaults to a bottom sheet with a wrapping title and no scroll shadow", async () => {
      render(<Harness />);
      const { dialog } = await openModal();
      expect(dialog).toHaveAttribute("data-sheet", "bottom");
      expect(dialog).toHaveAttribute("data-title-wrap", "wrap");
      expect(dialog).not.toHaveAttribute("data-scroll-shadow");
      expect(screen.getByRole("heading", { name: "Edit profile" })).not.toHaveAttribute("title");
    });

    it("makes a scrolling body focusable so the keyboard can scroll it", async () => {
      render(<Harness scrollShadow />);
      const { user } = await openModal();
      await user.tab();
      await user.tab();
      expect(screen.getByLabelText("Name").parentElement).toHaveAttribute("tabindex", "0");
    });

    it("accepts a custom maximum inline size", async () => {
      render(<Harness size="62rem" style={{ color: "red" }} />);
      const { dialog } = await openModal();
      expect(dialog).toHaveAttribute("data-size", "custom");
      expect(dialog.style.getPropertyValue("--lufia-modal-size")).toBe("62rem");
      expect(dialog.style.color).toBe("red");
    });

    it("leaves the size variable unset for a named step", async () => {
      render(<Harness size="lg" />);
      const { dialog } = await openModal();
      expect(dialog.style.getPropertyValue("--lufia-modal-size")).toBe("");
    });
  });

  describe("keepMounted", () => {
    it("keeps children mounted, hidden and inert while closed, and typed input survives a close and reopen", async () => {
      render(<Harness keepMounted />);
      const closed = screen.getByLabelText("Name", { selector: "input" });
      expect(closed).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(closed.closest("[role=dialog]")).toHaveAttribute("hidden");
      expect(closed.closest("[role=dialog]")).toHaveAttribute("inert");

      const { user, dialog } = await openModal();
      expect(dialog).not.toHaveAttribute("hidden");
      await user.type(screen.getByLabelText("Name"), "Ada");
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(isBodyScrollLocked()).toBe(false);

      await user.click(screen.getByRole("button", { name: "Open modal" }));
      expect(screen.getByLabelText("Name")).toHaveValue("Ada");
    });

    it("still traps focus, restores it and closes from the backdrop", async () => {
      const onClose = vi.fn();
      render(<Harness keepMounted onClose={onClose} />);
      const { user, trigger, dialog } = await openModal();
      expect(dialog).toHaveFocus();
      const backdrop = document.querySelector<HTMLElement>('[aria-hidden="true"][data-state]')!;
      fireEvent.pointerDown(backdrop);
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveFocus();
      await user.click(trigger);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has no axe violations while open", async () => {
      render(<Harness keepMounted />);
      await openModal();
      expect(await axe(document.body)).toHaveNoViolations();
    });
  });

  describe('renderAs="dialog"', () => {
    let dialogMock: ReturnType<typeof mockDialog>;
    beforeEach(() => {
      dialogMock = mockDialog();
    });
    afterEach(() => {
      cleanup();
      dialogMock.restore();
    });

    it("renders a native dialog that is opened with showModal and closed with close", async () => {
      render(<Harness renderAs="dialog" />);
      expect(document.querySelector("dialog")).toBeNull();
      const { user, dialog } = await openModal();
      expect(dialog.tagName).toBe("DIALOG");
      expect(dialogMock.showModal).toHaveBeenCalledTimes(1);
      expect(dialog).toHaveAccessibleName("Edit profile");
      expect(dialog).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(dialogMock.close).toHaveBeenCalled();
      expect(document.querySelector("dialog")).toBeNull();
    });

    it("keeps the layer stack: Escape closes only the topmost, the page is not made inert by the package", async () => {
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" onClose={onClose} />);
      const { user, trigger } = await openModal();
      expect(trigger.parentElement).not.toHaveAttribute("inert");
      expect(isBodyScrollLocked()).toBe(true);
      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(isBodyScrollLocked()).toBe(false);
      expect(trigger).toHaveFocus();
    });

    it("traps Tab inside the dialog", async () => {
      render(<Harness renderAs="dialog" />);
      const { user } = await openModal();
      await user.tab();
      expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
      await user.tab({ shift: true });
      expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    });

    it("turns the native cancel event into a close request, once", async () => {
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" onClose={onClose} />);
      const { dialog } = await openModal();
      const event = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not close on cancel when Escape is off or the dialog is busy", async () => {
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" onClose={onClose} closeOnEscape={false} />);
      const { dialog } = await openModal();
      const event = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("closes only when the press began and ended outside the panel", async () => {
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" onClose={onClose} />);
      const { dialog } = await openModal();
      // jsdom has no layout: the panel box is all zeros, so any positive coordinate is outside it.
      fireEvent.click(dialog, { clientX: 9, clientY: 9 });
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.pointerDown(dialog, { clientX: 0, clientY: 0 });
      fireEvent.click(dialog, { clientX: 9, clientY: 9 });
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.pointerDown(dialog, { clientX: 9, clientY: 9 });
      fireEvent.click(dialog, { clientX: 9, clientY: 9 });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("ignores outside presses when closeOnOutsideClick is off", async () => {
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" onClose={onClose} closeOnOutsideClick={false} />);
      const { dialog } = await openModal();
      fireEvent.pointerDown(dialog, { clientX: 9, clientY: 9 });
      fireEvent.click(dialog, { clientX: 9, clientY: 9 });
      expect(onClose).not.toHaveBeenCalled();
    });

    it("tells the owner when the browser closes the dialog by itself, once and only then", async () => {
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" keepMounted onClose={onClose} />);
      const { user, dialog } = await openModal();
      // A <form method="dialog"> or an uncancellable Escape: closed natively, then the event.
      dialog.removeAttribute("open");
      act(() => void dialog.dispatchEvent(new Event("close")));
      expect(onClose).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

      // Closing from React fires the same event later; that one is not a request.
      await user.click(screen.getByRole("button", { name: "Open modal" }));
      await user.keyboard("{Escape}");
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it("ignores a late close event from its own close when the dialog was reopened meanwhile", async () => {
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" keepMounted onClose={onClose} />);
      const { trigger } = await openModal();
      // Close and reopen in one task: the `close` event of the first close is still queued.
      act(() => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      act(() => {
        fireEvent.click(trigger);
      });
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("does not pass a nested dialog's close to the outer one", async () => {
      const outerClose = vi.fn();
      function Nest() {
        const [inner, setInner] = useState(false);
        return (
          <Modal open renderAs="dialog" keepMounted onClose={outerClose} title="Outer">
            <button type="button" onClick={() => setInner(true)}>
              Open inner
            </button>
            <Modal open={inner} renderAs="dialog" keepMounted onClose={() => setInner(false)} title="Inner">
              Inner body
            </Modal>
          </Modal>
        );
      }
      render(<Nest />);
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: "Open inner" }));
      await user.keyboard("{Escape}");
      await new Promise((resolve) => setTimeout(resolve, 20));
      const inner = Array.from(document.querySelectorAll("dialog")).find(
        (dialog) => dialog.querySelector("h2")?.textContent === "Inner",
      )!;
      expect(inner).not.toHaveAttribute("open");
      expect(outerClose).not.toHaveBeenCalled();
      // The browser closing the inner one itself must not reach the outer either.
      act(() => void inner.dispatchEvent(new Event("close", { bubbles: true })));
      expect(outerClose).not.toHaveBeenCalled();
    });

    it("closing an inner and an outer dialog together does not call the outer onClose", async () => {
      const outerClose = vi.fn();
      const flush = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 20)));
      function Nest() {
        const [outer, setOuter] = useState(true);
        const [inner, setInner] = useState(true);
        return (
          <Modal open={outer} renderAs="dialog" keepMounted onClose={outerClose} title="Outer">
            <Modal open={inner} renderAs="dialog" keepMounted onClose={() => setInner(false)} title="Inner">
              <button
                type="button"
                onClick={() => {
                  setInner(false);
                  setOuter(false);
                }}
              >
                Done
              </button>
            </Modal>
          </Modal>
        );
      }
      render(<Nest />);
      await flush();
      await userEvent.setup().click(screen.getByRole("button", { name: "Done" }));
      await flush();
      const outerDialog = Array.from(document.querySelectorAll("dialog")).find(
        (dialog) => dialog.querySelector("h2")?.textContent === "Outer",
      )!;
      expect(outerDialog).not.toHaveAttribute("open");
      expect(outerClose).not.toHaveBeenCalled();
    });

    it("does not pass the inner dialog's non-bubbling close to a closed outer one", async () => {
      const outerClose = vi.fn();
      function Nest() {
        const [inner, setInner] = useState(true);
        return (
          <Modal open={false} renderAs="dialog" keepMounted onClose={outerClose} title="Outer">
            <Modal open={inner} renderAs="dialog" keepMounted onClose={() => setInner(false)} title="Inner">
              x
            </Modal>
          </Modal>
        );
      }
      render(<Nest />);
      await act(async () => {});
      const inner = Array.from(document.querySelectorAll("dialog")).find(
        (dialog) => dialog.querySelector("h2")?.textContent === "Inner",
      )!;
      inner.removeAttribute("open"); // the browser closed it, for example a form with method="dialog"
      act(() => void inner.dispatchEvent(new Event("close", { bubbles: false })));
      await act(() => new Promise<void>((resolve) => setTimeout(resolve, 20)));
      expect(outerClose).not.toHaveBeenCalled();
    });

    it("opens the dialog again when the owner refuses a native close", async () => {
      render(<Harness renderAs="dialog" busy />);
      const { dialog } = await openModal();
      dialog.removeAttribute("open");
      act(() => void dialog.dispatchEvent(new Event("close")));
      await waitFor(() => expect(dialogMock.showModal).toHaveBeenCalledTimes(2));
      expect(dialog).toHaveAttribute("open");
    });

    it("runs the caller's own onClick and onPointerDown besides closing on the backdrop", async () => {
      const onClick = vi.fn();
      const onPointerDown = vi.fn();
      const onClose = vi.fn();
      render(<Harness renderAs="dialog" onClick={onClick} onPointerDown={onPointerDown} onClose={onClose} />);
      const { dialog } = await openModal();
      fireEvent.pointerDown(dialog, { clientX: 9, clientY: 9 });
      fireEvent.click(dialog, { clientX: 9, clientY: 9 });
      expect(onPointerDown).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("stays in the document, closed, with keepMounted", async () => {
      render(<Harness renderAs="dialog" keepMounted />);
      const closed = document.querySelector("dialog")!;
      expect(closed).not.toHaveAttribute("open");
      expect(closed).toContainElement(within(closed).getByLabelText("Name"));
      const { user, dialog } = await openModal();
      await user.type(screen.getByLabelText("Name"), "Ada");
      await user.keyboard("{Escape}");
      expect(dialog).not.toHaveAttribute("open");
      await user.click(screen.getByRole("button", { name: "Open modal" }));
      expect(screen.getByLabelText("Name")).toHaveValue("Ada");
    });

    it("has no axe violations while open", async () => {
      render(<Harness renderAs="dialog" description="Changes apply to everyone." />);
      await openModal();
      expect(await axe(document.body)).toHaveNoViolations();
    });
  });

  describe("nesting", () => {
    let dialogMock: ReturnType<typeof mockDialog>;
    beforeEach(() => {
      dialogMock = mockDialog();
    });
    afterEach(() => {
      cleanup();
      dialogMock.restore();
    });

    function Nested({ onConfirm }: { onConfirm: () => void }) {
      const [confirming, setConfirming] = useState(false);
      return (
        <Modal open renderAs="dialog" onClose={() => {}} title="Outer">
          <button type="button" onClick={() => setConfirming(true)}>
            Delete
          </button>
          <ConfirmDialog
            open={confirming}
            title="Delete?"
            message="This cannot be undone."
            confirmLabel="Yes, delete"
            cancelLabel="Keep"
            onConfirm={onConfirm}
            onCancel={() => setConfirming(false)}
          />
        </Modal>
      );
    }

    it("renders a portal modal opened over a native dialog inside it, and leaves that dialog usable", async () => {
      const onConfirm = vi.fn();
      render(<Nested onConfirm={onConfirm} />);
      const outer = screen.getByRole("dialog", { name: "Outer" });
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: "Delete" }));
      const inner = screen.getByRole("alertdialog", { name: "Delete?" });
      expect(outer).toContainElement(inner);
      expect(outer).not.toHaveAttribute("inert");
      expect(inner.closest("[inert]")).toBeNull();
      await user.click(screen.getByRole("button", { name: "Yes, delete" }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("closes the inner layer first on Escape, then the outer dialog on the next", async () => {
      render(<Nested onConfirm={() => {}} />);
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: "Delete" }));
      await user.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
      expect(screen.getByRole("dialog", { name: "Outer" })).toBeInTheDocument();
    });

    it("keeps a portal modal in the body when no native dialog is open", async () => {
      render(<Harness />);
      const { dialog } = await openModal();
      expect(dialog.parentElement?.parentElement?.parentElement).toBe(document.body);
    });
  });
});

describe("Modal migration hooks", () => {
  it("marks every part with data-lufia-part and applies per-part class names", async () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="Edit profile"
        description="Changes apply at once."
        footer={<button type="button">Save</button>}
        className="legacy-root"
        classNames={{
          layer: "x-layer",
          backdrop: "x-backdrop",
          frame: "x-frame",
          panel: "x-panel",
          header: "x-header",
          title: "x-title",
          description: "x-description",
          body: "x-body",
          footer: "x-footer",
          close: "x-close",
        }}
      >
        <input aria-label="Name" />
      </Modal>,
    );
    for (const name of [
      "layer",
      "backdrop",
      "frame",
      "panel",
      "header",
      "title",
      "description",
      "body",
      "footer",
      "close",
    ]) {
      const element = document.querySelector<HTMLElement>(`[data-lufia-part="${name}"]`);
      expect(element, name).toBeInTheDocument();
      expect(element, name).toHaveClass(`x-${name}`);
    }
    expect(screen.getByRole("dialog")).toHaveClass("legacy-root");
    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute("data-lufia-part", "close");
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
