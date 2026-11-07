import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { ToastProvider, useToast, type ToastPlacement } from "./Toast";

type DemoProps = {
  placement?: ToastPlacement;
  limit?: number;
  duration?: number;
  /** Show all four tones on mount, kept until dismissed (for visual review). */
  showAll?: boolean;
  viewportClassName?: string;
};

function Controls({ showAll }: { showAll: boolean }) {
  const toast = useToast();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!showAll) return;
    toast.info("Syncing 3 files in the background.", { duration: null });
    toast.success("Changes saved.", { duration: null });
    toast.warning("Storage is 90% full.", { duration: null });
    toast.error("Upload failed. Check your connection and try again.", {
      duration: null,
      action: { label: "Retry", onAction: () => {} },
    });
    return () => toast.clear();
  }, [showAll, toast]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxInlineSize: "34rem" }}>
      <Button onClick={() => toast.success("Changes saved.")}>Success</Button>
      <Button onClick={() => toast.info("A new version is available.")}>Info</Button>
      <Button onClick={() => toast.warning("Storage is 90% full.")}>Warning</Button>
      <Button onClick={() => toast.error("Upload failed. It stays until you dismiss it.")}>Error</Button>
      <Button
        onClick={() =>
          toast.info("Invoice moved to the trash.", {
            action: { label: "Undo", onAction: () => toast.success("Invoice restored.") },
          })
        }
      >
        With action
      </Button>
      <Button
        onClick={() => {
          toast.success(`Saved (${count + 1})`);
          setCount((n) => n + 1);
        }}
      >
        Stack another
      </Button>
      <Button onClick={() => toast.clear()}>Clear all</Button>
    </div>
  );
}

function Demo({ showAll = false, ...provider }: DemoProps) {
  return (
    <ToastProvider {...provider}>
      <Controls showAll={showAll} />
    </ToastProvider>
  );
}

const meta = {
  title: "Components/Feedback/Toast",
  component: Demo,
  parameters: { layout: "padded" },
  args: {},
  argTypes: {
    placement: { control: "inline-radio", options: ["bottom-end", "bottom-start", "top-end", "top-start"] },
    limit: { control: { type: "number", min: 1, max: 8 } },
    duration: { control: { type: "number", min: 1000, step: 500 } },
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllTones: Story = { args: { showAll: true } };
export const TopStart: Story = { args: { placement: "top-start", showAll: true } };
export const LongMessage: Story = {
  render: () => (
    <ToastProvider>
      <LongMessageButton />
    </ToastProvider>
  ),
};
export const Phone: Story = {
  args: { showAll: true },
  globals: { viewport: { value: "w390", isRotated: false } },
};

function LongMessageButton() {
  const toast = useToast();
  return (
    <Button
      onClick={() =>
        toast.error(
          "The report could not be exported because the selected date range contains more rows than the export limit allows. Narrow the range and try again.",
          { action: { label: "Change range", onAction: () => {} } },
        )
      }
    >
      Show a long message
    </Button>
  );
}

function AboveModal() {
  const toast = useToast();
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Share report"
        footer={
          <Button variant="primary" onClick={() => toast.success("Link copied.", { duration: null })}>
            Copy link
          </Button>
        }
      >
        Toasts stay visible and reachable above an open modal.
      </Modal>
    </>
  );
}

function AboveNativeDialog() {
  const toast = useToast();
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal
        open={open}
        renderAs="dialog"
        onClose={() => setOpen(false)}
        title="Share report"
        footer={
          <Button variant="primary" onClick={() => toast.success("Link copied.", { duration: null })}>
            Copy link
          </Button>
        }
      >
        The region is hosted inside this native dialog, so toasts sit in the top layer with it.
      </Modal>
    </>
  );
}

export const AboveANativeDialog: Story = {
  render: () => (
    <ToastProvider>
      <AboveNativeDialog />
    </ToastProvider>
  ),
};

function AliasButtons() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Button onClick={() => toast.show({ message: "Saved.", tone: "ok" })}>ok</Button>
      <Button onClick={() => toast.show({ message: "Check the date.", tone: "warn" })}>warn</Button>
    </div>
  );
}

/** Sets the layout tokens on `:root` (the stack is portaled to the body), as a consuming theme would. */
function TokenTheme({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const tokens = {
      "--lufia-toast-width": "30rem",
      "--lufia-toast-gap": "0.5rem",
      "--lufia-toast-padding-block": "0.5rem",
      "--lufia-toast-padding-inline": "1rem",
      "--lufia-toast-align-items": "center",
      "--lufia-toast-line-height": "1.3",
    };
    for (const [name, value] of Object.entries(tokens)) root.style.setProperty(name, value);
    return () => {
      for (const name of Object.keys(tokens)) root.style.removeProperty(name);
    };
  }, []);
  return children;
}

/** The layout tokens (`--lufia-toast-width`, `-gap`, `-padding-block`, `-padding-inline`, `-align-items`, `-line-height`) and `viewportClassName`. */
export const ThemedByTokens: Story = {
  render: () => (
    <TokenTheme>
      <ToastProvider viewportClassName="app-toast-viewport">
        <Controls showAll />
      </ToastProvider>
    </TokenTheme>
  ),
};

export const ToneAliases: Story = {
  render: () => (
    <ToastProvider toneAliases={{ ok: "success", warn: "warning" }} duration={3500}>
      <AliasButtons />
    </ToastProvider>
  ),
};

export const AboveAModal: Story = {
  render: () => (
    <ToastProvider>
      <AboveModal />
    </ToastProvider>
  ),
};
