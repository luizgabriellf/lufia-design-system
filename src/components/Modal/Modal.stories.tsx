import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DemoButton } from "../../docs/demo";
import { Modal, type ModalProps } from "./Modal";

type DemoProps = Partial<Omit<ModalProps, "open" | "onClose">> & {
  startOpen?: boolean;
  /** Fill the body with this many paragraphs. */
  paragraphs?: number;
  /** Footer actions simulate a slow save that keeps the modal busy. */
  slowSave?: boolean;
};

const field: CSSProperties = {
  font: "inherit",
  padding: "0.5rem 0.75rem",
  color: "var(--lufia-color-text-default)",
  background: "var(--lufia-color-bg-field)",
  border: "1px solid var(--lufia-color-border-strong)",
  borderRadius: "var(--lufia-radius-control)",
};

function Demo({ startOpen = false, paragraphs = 0, slowSave = false, footer, ...rest }: DemoProps) {
  const [open, setOpen] = useState(startOpen);
  const [busy, setBusy] = useState(false);

  function save() {
    if (!slowSave) return setOpen(false);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setOpen(false);
    }, 2500);
  }

  return (
    <>
      <DemoButton variant="primary" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Open modal
      </DemoButton>
      <Modal
        title="Edit project"
        {...rest}
        open={open}
        busy={busy || rest.busy}
        onClose={() => setOpen(false)}
        footer={
          footer ?? (
            <>
              <DemoButton disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </DemoButton>
              <DemoButton variant="primary" aria-busy={busy || undefined} onClick={save}>
                {busy ? "Saving…" : "Save changes"}
              </DemoButton>
            </>
          )
        }
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.375rem" }}>
            Project name
            <input style={field} defaultValue="Quarterly report" />
          </label>
          {Array.from({ length: paragraphs }, (_, index) => (
            <p key={index} style={{ margin: 0 }}>
              Everyone with access to this project can see these settings. Changes are saved for the whole
              team and recorded in the activity log, so a colleague can always tell what changed and when.
              Section {index + 1}.
            </p>
          ))}
        </div>
      </Modal>
    </>
  );
}

const meta = {
  title: "Components/Modal",
  component: Demo,
  parameters: { layout: "padded" },
  args: {},
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    role: { control: "inline-radio", options: ["dialog", "alertdialog"] },
    initialFocus: { control: "inline-radio", options: ["container", "first"] },
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OpenByDefault: Story = { args: { startOpen: true } };
export const WithDescription: Story = {
  args: { startOpen: true, description: "Rename the project or change who can see it." },
};
export const Small: Story = { args: { startOpen: true, size: "sm" } };
export const Large: Story = { args: { startOpen: true, size: "lg" } };
export const ExtraLarge: Story = { args: { startOpen: true, size: "xl" } };
export const LongContent: Story = { args: { startOpen: true, paragraphs: 14 } };
export const LongTitle: Story = {
  args: {
    startOpen: true,
    title:
      "Review the changes to the quarterly financial reporting package before it is shared with the board",
  },
};
export const HeaderAction: Story = {
  args: { startOpen: true, headerAction: <DemoButton size="sm">Help</DemoButton> },
};
export const NoCloseButton: Story = { args: { startOpen: true, hideCloseButton: true } };
export const BusyWhileSaving: Story = {
  args: { slowSave: true },
  parameters: {
    docs: {
      description: {
        story: "Press Save: the close button disables and Escape and outside clicks are refused for 2.5 s.",
      },
    },
  },
};
export const StrictDismissal: Story = {
  args: { closeOnEscape: false, closeOnOutsideClick: false, startOpen: true },
  parameters: {
    docs: { description: { story: "Escape and outside clicks do nothing; only the buttons close it." } },
  },
};
export const FocusFirstElement: Story = { args: { startOpen: true, initialFocus: "first" } };
export const Phone: Story = {
  args: { startOpen: true, paragraphs: 3 },
  globals: { viewport: { value: "w390", isRotated: false } },
};

function Stacked() {
  const [first, setFirst] = useState(true);
  const [second, setSecond] = useState(false);
  return (
    <>
      <DemoButton variant="primary" onClick={() => setFirst(true)}>
        Open modal
      </DemoButton>
      <Modal
        open={first}
        onClose={() => setFirst(false)}
        title="Invite people"
        footer={<DemoButton onClick={() => setSecond(true)}>Review permissions</DemoButton>}
      >
        Escape closes only the top dialog, and focus returns to the control that opened it.
      </Modal>
      <Modal open={second} onClose={() => setSecond(false)} size="sm" title="Permissions">
        Editors can change content; viewers can only read it.
      </Modal>
    </>
  );
}

export const StackedModals: Story = { render: () => <Stacked /> };

/** Each cell portals its own modal into itself (`container`), so the four theme and mode combinations can be compared. */
function ThemeCell() {
  return (
    <div
      style={{
        position: "relative",
        contain: "layout",
        minBlockSize: "26rem",
        display: "grid",
        alignContent: "start",
      }}
    >
      <ModalInCell />
    </div>
  );
}

function ModalInCell() {
  const [open, setOpen] = useState(false);
  const [cell, setCell] = useState<HTMLElement | null>(null);
  return (
    <div ref={setCell}>
      <DemoButton variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </DemoButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        container={cell?.parentElement}
        title="Edit project"
        description="Rename the project or change who can see it."
        footer={
          <>
            <DemoButton onClick={() => setOpen(false)}>Cancel</DemoButton>
            <DemoButton variant="primary" onClick={() => setOpen(false)}>
              Save changes
            </DemoButton>
          </>
        }
      >
        <label style={{ display: "grid", gap: "0.375rem" }}>
          Project name
          <input style={field} defaultValue="Quarterly report" />
        </label>
      </Modal>
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
