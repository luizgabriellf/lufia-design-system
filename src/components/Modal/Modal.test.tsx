import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { mockDialog } from "../../test/dialog";
import { mockReducedMotion } from "../../test/motion";
import { isBodyScrollLocked } from "../useBodyScrollLock";
import { LufiaProvider } from "../LufiaProvider";
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
});
