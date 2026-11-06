import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { ConfirmDialog, useConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

const base: ConfirmDialogProps = {
  open: true,
  title: "Delete invoice 2041?",
  message: "This cannot be undone.",
  confirmLabel: "Delete invoice",
  cancelLabel: "Keep invoice",
  onConfirm: () => {},
  onCancel: () => {},
};

describe("ConfirmDialog", () => {
  it("is an alert dialog named by the title and described by the message", () => {
    render(<ConfirmDialog {...base} />);
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAccessibleName("Delete invoice 2041?");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  it("starts on the safe action for a destructive confirmation, on Confirm otherwise", () => {
    const { rerender } = render(<ConfirmDialog {...base} destructive />);
    expect(screen.getByRole("button", { name: "Keep invoice" })).toHaveFocus();
    rerender(<ConfirmDialog {...base} open={false} destructive={false} />);
    rerender(<ConfirmDialog {...base} open destructive={false} />);
    expect(screen.getByRole("button", { name: "Delete invoice" })).toHaveFocus();
  });

  it("marks a destructive confirm button and leaves the close X out", () => {
    render(<ConfirmDialog {...base} destructive />);
    expect(screen.getByRole("button", { name: "Delete invoice" })).toHaveAttribute("data-variant", "danger");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("confirms and cancels through the buttons and cancels on Escape", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog {...base} onConfirm={onConfirm} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: "Delete invoice" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Keep invoice" }));
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("cycles Tab between the two buttons only", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...base} destructive />);
    expect(screen.getByRole("button", { name: "Keep invoice" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Delete invoice" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Keep invoice" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Delete invoice" })).toHaveFocus();
  });

  it("does not close, confirm or cancel while busy, and keeps focus where it was", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog {...base} busy onConfirm={onConfirm} onCancel={onCancel} destructive />);
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Delete invoice" })).toHaveAttribute("aria-busy", "true");
    await user.click(screen.getByRole("button", { name: "Delete invoice" }));
    await user.click(screen.getByRole("button", { name: "Keep invoice" }));
    await user.keyboard("{Escape}");
    const backdrop = document.querySelector<HTMLElement>('[aria-hidden="true"][data-state]')!;
    fireEvent.pointerDown(backdrop);
    fireEvent.click(backdrop);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete invoice" })).toBeEnabled();
  });

  it("returns focus to the trigger after it closes", async () => {
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Delete
          </button>
          <ConfirmDialog
            {...base}
            open={open}
            onCancel={() => setOpen(false)}
            onConfirm={() => setOpen(false)}
          />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Host />);
    const trigger = screen.getByRole("button", { name: "Delete" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Delete invoice" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("has no axe violations while open, destructive and busy", async () => {
    const { rerender } = render(<ConfirmDialog {...base} destructive />);
    expect(await axe(document.body)).toHaveNoViolations();
    rerender(<ConfirmDialog {...base} destructive busy />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("useConfirmDialog", () => {
  function Host({ onResult }: { onResult: (value: boolean) => void }) {
    const { confirm, confirmDialog } = useConfirmDialog();
    return (
      <>
        <button
          type="button"
          onClick={async () =>
            onResult(
              await confirm({
                title: "Remove member?",
                message: "They lose access immediately.",
                confirmLabel: "Remove",
                cancelLabel: "Cancel",
                destructive: true,
              }),
            )
          }
        >
          Ask
        </button>
        {confirmDialog}
      </>
    );
  }

  it("resolves true when confirmed and false when cancelled", async () => {
    const onResult = vi.fn();
    const user = userEvent.setup();
    render(<Host onResult={onResult} />);
    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false));
  });

  it("settles a pending confirmation with false when the host unmounts", async () => {
    const onResult = vi.fn();
    const user = userEvent.setup();
    const { unmount } = render(<Host onResult={onResult} />);
    await user.click(screen.getByRole("button", { name: "Ask" }));
    unmount();
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });
});
