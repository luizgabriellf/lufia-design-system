import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { DemoButton } from "../../docs/demo";
import { Modal } from "../Modal";
import { ToastProvider, useToast, type ToastPlacement } from "./Toast";

type DemoProps = {
  placement?: ToastPlacement;
  limit?: number;
  duration?: number;
  /** Show all four tones on mount, kept until dismissed (for visual review). */
  showAll?: boolean;
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
      <DemoButton onClick={() => toast.success("Changes saved.")}>Success</DemoButton>
      <DemoButton onClick={() => toast.info("A new version is available.")}>Info</DemoButton>
      <DemoButton onClick={() => toast.warning("Storage is 90% full.")}>Warning</DemoButton>
      <DemoButton onClick={() => toast.error("Upload failed. It stays until you dismiss it.")}>
        Error
      </DemoButton>
      <DemoButton
        onClick={() =>
          toast.info("Invoice moved to the trash.", {
            action: { label: "Undo", onAction: () => toast.success("Invoice restored.") },
          })
        }
      >
        With action
      </DemoButton>
      <DemoButton
        onClick={() => {
          toast.success(`Saved (${count + 1})`);
          setCount((n) => n + 1);
        }}
      >
        Stack another
      </DemoButton>
      <DemoButton onClick={() => toast.clear()}>Clear all</DemoButton>
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
  title: "Components/Toast",
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
    <DemoButton
      onClick={() =>
        toast.error(
          "The report could not be exported because the selected date range contains more rows than the export limit allows. Narrow the range and try again.",
          { action: { label: "Change range", onAction: () => {} } },
        )
      }
    >
      Show a long message
    </DemoButton>
  );
}

function AboveModal() {
  const toast = useToast();
  const [open, setOpen] = useState(true);
  return (
    <>
      <DemoButton onClick={() => setOpen(true)}>Open modal</DemoButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Share report"
        footer={
          <DemoButton variant="primary" onClick={() => toast.success("Link copied.", { duration: null })}>
            Copy link
          </DemoButton>
        }
      >
        Toasts stay visible and reachable above an open modal.
      </Modal>
    </>
  );
}

export const AboveAModal: Story = {
  render: () => (
    <ToastProvider>
      <AboveModal />
    </ToastProvider>
  ),
};
