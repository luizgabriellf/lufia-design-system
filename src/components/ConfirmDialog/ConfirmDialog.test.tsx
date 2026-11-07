import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { axe } from "../../test/axe";
import { registerOverlayLayer, type OverlayLayer } from "../useFocusTrap";
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

/** Legacy layers registered by a test are released afterwards, so a failing test cannot leak one into the next. */
const legacyLayers: OverlayLayer[] = [];
const track = (layer: OverlayLayer) => {
  legacyLayers.push(layer);
  return layer;
};
afterEach(() => {
  for (const layer of legacyLayers.splice(0)) layer.release();
});

describe("ConfirmDialog migration hooks", () => {
  it("carries stable part hooks and the per-part class names", async () => {
    render(
      <ConfirmDialog
        {...base}
        className="legacy-panel"
        classNames={{
          layer: "legacy-layer",
          backdrop: "legacy-backdrop",
          header: "legacy-header",
          body: "legacy-body",
          footer: "legacy-footer",
          cancel: "legacy-cancel",
          confirm: "legacy-confirm",
        }}
      />,
    );
    const part = (name: string) => document.querySelector<HTMLElement>(`[data-lufia-part="${name}"]`)!;
    expect(part("panel")).toBe(screen.getByRole("alertdialog"));
    expect(part("panel")).toHaveClass("legacy-panel");
    expect(part("layer")).toHaveClass("legacy-layer");
    expect(part("backdrop")).toHaveClass("legacy-backdrop");
    expect(part("header")).toHaveClass("legacy-header");
    expect(part("title")).toHaveTextContent("Delete invoice 2041?");
    expect(part("body")).toHaveClass("legacy-body");
    expect(part("footer")).toHaveClass("legacy-footer");
    expect(part("cancel")).toHaveClass("legacy-cancel");
    expect(part("confirm")).toHaveClass("legacy-confirm");
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("takes size and sheetPlacement, defaulting to a small bottom sheet", () => {
    const { rerender } = render(<ConfirmDialog {...base} />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-sheet", "bottom");
    rerender(<ConfirmDialog {...base} size="lg" sheetPlacement="top" />);
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-size", "lg");
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-sheet", "top");
  });

  it("passes the options of useConfirmDialog through", async () => {
    const user = userEvent.setup();
    function Host() {
      const { confirm, confirmDialog } = useConfirmDialog();
      return (
        <>
          <button
            type="button"
            onClick={() =>
              void confirm({
                title: "Remove?",
                message: "Gone for good.",
                confirmLabel: "Remove",
                cancelLabel: "Keep",
                size: "xl",
                className: "legacy-panel",
                classNames: { confirm: "legacy-confirm" },
              })
            }
          >
            Ask
          </button>
          {confirmDialog}
        </>
      );
    }
    render(<Host />);
    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-size", "xl");
    expect(screen.getByRole("alertdialog")).toHaveClass("legacy-panel");
    expect(screen.getByRole("button", { name: "Remove" })).toHaveClass("legacy-confirm");
  });

  it("closes only the topmost layer on Escape when a legacy layer sits under it, then the next one", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onLegacyEscape = vi.fn();
    // A legacy trap registered through the public API, with its own Escape listener.
    const legacy = track(registerOverlayLayer());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && legacy.isTop()) onLegacyEscape();
    };
    document.addEventListener("keydown", onKeyDown);
    try {
      render(<ConfirmDialog {...base} onCancel={onCancel} />);
      await user.keyboard("{Escape}");
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onLegacyEscape).not.toHaveBeenCalled();
      cleanup();

      await user.keyboard("{Escape}");
      expect(onLegacyEscape).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener("keydown", onKeyDown);
    }
  });

  it("leaves Escape to a legacy layer registered above the dialog", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...base} onCancel={onCancel} />);
    const legacy = track(registerOverlayLayer());
    await user.keyboard("{Escape}");
    expect(onCancel).not.toHaveBeenCalled();
    legacy.release();
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("keeps the dialog on top, with Escape and Tab, when the legacy host re-renders", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onLegacyKey = vi.fn();

    // A legacy host following the documented pattern: it registers once per open, `onEscape` goes through a ref.
    function LegacyHost({ onEscape, children }: { onEscape: () => void; children?: ReactNode }) {
      const ref = useRef(onEscape);
      useEffect(() => {
        ref.current = onEscape;
      });
      useEffect(() => {
        const layer = registerOverlayLayer();
        const onKeyDown = (event: KeyboardEvent) => {
          if (!layer.isTop()) return;
          onLegacyKey(event.key);
          if (event.key === "Escape") ref.current();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
          document.removeEventListener("keydown", onKeyDown);
          layer.release();
        };
      }, []);
      return <div>{children}</div>;
    }

    // The host mounts first, so its layer is under the dialog that opens afterwards.
    const tree = (tick: number, withDialog: boolean) => (
      <LegacyHost onEscape={() => void tick}>
        {withDialog ? <ConfirmDialog {...base} destructive onCancel={onCancel} /> : null}
      </LegacyHost>
    );
    const { rerender } = render(tree(0, false));
    rerender(tree(1, true));
    rerender(tree(2, true));
    rerender(tree(3, true));

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(screen.getByRole("button", { name: "Delete invoice" })).toHaveFocus();
    expect(onLegacyKey).not.toHaveBeenCalled();
  });

  it("shares the stack through globalThis, so another module copy agrees", () => {
    const stack = (globalThis as { __lufiaOverlayStack?: symbol[] }).__lufiaOverlayStack;
    const before = stack?.length ?? 0;
    const layer = track(registerOverlayLayer());
    const shared = (globalThis as { __lufiaOverlayStack?: symbol[] }).__lufiaOverlayStack!;
    expect(shared).toHaveLength(before + 1);
    expect(layer.isTop()).toBe(true);
    layer.release();
    layer.release();
    expect(shared).toHaveLength(before);
  });
});
