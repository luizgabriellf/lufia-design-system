import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DemoButton } from "../../docs/demo";
import { ConfirmDialog, useConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";

type DemoProps = Pick<
  ConfirmDialogProps,
  "destructive" | "title" | "message" | "confirmLabel" | "cancelLabel"
> & {
  startOpen?: boolean;
  /** Confirming keeps the dialog busy for a moment, as a real request would. */
  slow?: boolean;
  stuckBusy?: boolean;
  container?: Element | null;
};

function Demo({ startOpen = false, slow = false, stuckBusy = false, ...args }: DemoProps) {
  const [open, setOpen] = useState(startOpen);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <DemoButton
        variant={args.destructive ? "secondary" : "primary"}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {args.destructive ? "Delete invoice" : "Publish"}
      </DemoButton>
      <ConfirmDialog
        {...args}
        open={open}
        busy={busy || stuckBusy}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (!slow) return setOpen(false);
          setBusy(true);
          setTimeout(() => {
            setBusy(false);
            setOpen(false);
          }, 2500);
        }}
      />
    </>
  );
}

const meta = {
  title: "Components/ConfirmDialog",
  component: Demo,
  parameters: { layout: "padded" },
  args: {
    title: "Publish this report?",
    message: "Everyone on the team will be able to see it.",
    confirmLabel: "Publish",
    cancelLabel: "Not yet",
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OpenByDefault: Story = { args: { startOpen: true } };
const destructiveArgs = {
  destructive: true,
  title: "Delete invoice 2041?",
  message: "The invoice and its payment history are removed. This cannot be undone.",
  confirmLabel: "Delete invoice",
  cancelLabel: "Keep invoice",
};

export const Destructive: Story = { args: { ...destructiveArgs, startOpen: true } };
export const Busy: Story = {
  args: { ...destructiveArgs, startOpen: true, stuckBusy: true },
  parameters: {
    docs: {
      description: {
        story: "Busy: Escape, outside clicks and Cancel are refused, focus stays on the button.",
      },
    },
  },
};
export const SlowConfirmation: Story = {
  args: { ...destructiveArgs, slow: true },
  parameters: {
    docs: { description: { story: "Confirm to see the busy state for 2.5 s before it closes." } },
  },
};
export const LongText: Story = {
  args: {
    startOpen: true,
    title: "Remove every member of the Regional Operations and Facilities Planning group from the workspace?",
    message:
      "They lose access to all shared projects, scheduled reports and saved filters straight away, and any report they own is reassigned to the workspace administrators until a new owner is chosen.",
    confirmLabel: "Remove all members",
    cancelLabel: "Cancel",
    destructive: true,
  },
};
export const Phone: Story = {
  args: { ...destructiveArgs, startOpen: true },
  globals: { viewport: { value: "w390", isRotated: false } },
};

function PromiseDemo() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [result, setResult] = useState("Nothing asked yet.");
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <DemoButton
        onClick={async () => {
          const yes = await confirm({
            title: "Discard changes?",
            message: "Your unsaved edits will be lost.",
            confirmLabel: "Discard",
            cancelLabel: "Keep editing",
            destructive: true,
          });
          setResult(yes ? "Confirmed: changes discarded." : "Cancelled: kept editing.");
        }}
      >
        Discard changes
      </DemoButton>
      <p style={{ margin: 0 }} aria-live="polite">
        {result}
      </p>
      {confirmDialog}
    </div>
  );
}

export const PromiseBased: Story = { render: () => <PromiseDemo /> };

function ThemeCell() {
  const [cell, setCell] = useState<HTMLElement | null>(null);
  return (
    <div style={{ position: "relative", contain: "layout", minBlockSize: "22rem" }}>
      <div ref={setCell} />
      <Demo {...destructiveArgs} container={cell?.parentElement} />
    </div>
  );
}

export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <ThemeCell />
    </ThemeMatrix>
  ),
};
