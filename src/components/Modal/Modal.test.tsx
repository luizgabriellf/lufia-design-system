import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
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
});
