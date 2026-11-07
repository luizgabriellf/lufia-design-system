import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Modal, type ModalProps } from "./Modal";

type DemoProps = Partial<Omit<ModalProps, "open" | "onClose">> & {
  startOpen?: boolean;
  /** Fill the body with this many paragraphs. */
  paragraphs?: number;
  /** Footer actions simulate a slow save that keeps the modal busy. */
  slowSave?: boolean;
  /** Put a toolbar at the top of the body that sticks under the header with `--lufia-modal-header-block-size`. */
  stickyBar?: boolean;
};

const field: CSSProperties = {
  font: "inherit",
  padding: "0.5rem 0.75rem",
  color: "var(--lufia-color-text-default)",
  background: "var(--lufia-color-bg-field)",
  border: "1px solid var(--lufia-color-border-strong)",
  borderRadius: "var(--lufia-radius-control)",
};

function Demo({
  startOpen = false,
  paragraphs = 0,
  slowSave = false,
  stickyBar = false,
  footer,
  ...rest
}: DemoProps) {
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
      <Button variant="primary" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        title="Edit project"
        {...rest}
        open={open}
        busy={busy || rest.busy}
        onClose={() => setOpen(false)}
        footer={
          footer ?? (
            <>
              <Button disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={busy} onClick={save}>
                Save changes
              </Button>
            </>
          )
        }
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          {stickyBar ? (
            <div
              style={{
                position: "sticky",
                insetBlockStart: "var(--lufia-modal-header-block-size, 0px)",
                zIndex: 1,
                padding: "0.5rem 0",
                background: "var(--lufia-color-bg-surface-solid)",
                borderBlockEnd: "1px solid var(--lufia-color-border-subtle)",
              }}
            >
              Sticky toolbar: top is var(--lufia-modal-header-block-size)
            </div>
          ) : null}
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
  title: "Components/Overlays/Modal",
  component: Demo,
  parameters: { layout: "padded" },
  args: {},
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    role: { control: "inline-radio", options: ["dialog", "alertdialog"] },
    initialFocus: { control: "inline-radio", options: ["container", "first"] },
    sheetPlacement: { control: "inline-radio", options: ["bottom", "top"] },
    titleWrap: { control: "inline-radio", options: ["wrap", "ellipsis"] },
    renderAs: { control: "inline-radio", options: ["portal", "dialog"] },
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
  args: { startOpen: true, headerAction: <Button size="sm">Help</Button> },
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
export const TitleEllipsis: Story = {
  args: {
    startOpen: true,
    titleWrap: "ellipsis",
    title:
      "Review the changes to the quarterly financial reporting package before it is shared with the board",
  },
};
export const ScrollShadow: Story = {
  args: { startOpen: true, scrollShadow: true, paragraphs: 14 },
  parameters: {
    docs: {
      description: {
        story:
          "The body scrolls between a fixed header and footer; a shadow shows where more content is hidden.",
      },
    },
  },
};
/** Sticky content in the body: its `top` is the header height the panel publishes, so it never slides under the header. */
export const StickyContentUnderHeader: Story = {
  args: {
    startOpen: true,
    stickyBar: true,
    title: "A long title that wraps onto a second line on a narrow screen, making the header taller",
    paragraphs: 12,
  },
};
export const CustomSize: Story = {
  args: { startOpen: true, size: "min(100%, 70rem)" },
  parameters: {
    docs: { description: { story: "`size` also accepts any CSS length as a maximum inline size." } },
  },
};
/** Each part carries a stable `data-lufia-part` and takes an extra class through `classNames`, for an app's own styles or test selectors. */
export const PartClassNames: Story = {
  args: {
    startOpen: true,
    description: "Inspect the panel: every part has data-lufia-part and the class names below.",
    classNames: {
      panel: "app-modal",
      header: "app-modal__header",
      body: "app-modal__body",
      footer: "app-modal__footer",
      close: "app-modal__close",
      backdrop: "app-modal__backdrop",
    },
  },
};
export const ThemedByVariables: Story = {
  args: {
    startOpen: true,
    description: "The consuming theme sets the --lufia-modal-* variables; here they are set on the panel.",
    titleWrap: "ellipsis",
    style: {
      "--lufia-modal-radius": "1.125rem",
      "--lufia-modal-header-padding": "1.125rem 1.375rem",
      "--lufia-modal-body-padding": "1.25rem 1.375rem",
      "--lufia-modal-title-size": "1.05rem",
      "--lufia-modal-close-size": "2.25rem",
    } as CSSProperties,
  },
};
export const TopSheetOnPhone: Story = {
  args: {
    startOpen: true,
    sheetPlacement: "top",
    paragraphs: 3,
    style: { "--lufia-modal-sheet-offset": "3.375rem" } as CSSProperties,
  },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const NativeTopLayer: Story = {
  args: {
    startOpen: true,
    renderAs: "dialog",
    description: "A native dialog opened with showModal(), in the top layer.",
  },
};
export const NativeKeepMounted: Story = {
  args: { renderAs: "dialog", keepMounted: true },
  parameters: {
    docs: {
      description: {
        story: "Type in the field, close the dialog and reopen it: the typed text is still there.",
      },
    },
  },
};
export const KeepMounted: Story = {
  args: { keepMounted: true },
  parameters: {
    docs: {
      description: {
        story: "Type in the field, close the modal and reopen it: the typed text is still there.",
      },
    },
  },
};
export const Phone: Story = {
  args: { startOpen: true, paragraphs: 3 },
  globals: { viewport: { value: "w390", isRotated: false } },
};

function Stacked() {
  const [first, setFirst] = useState(true);
  const [second, setSecond] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setFirst(true)}>
        Open modal
      </Button>
      <Modal
        open={first}
        onClose={() => setFirst(false)}
        title="Invite people"
        footer={<Button onClick={() => setSecond(true)}>Review permissions</Button>}
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
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        container={cell?.parentElement}
        title="Edit project"
        description="Rename the project or change who can see it."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save changes
            </Button>
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
