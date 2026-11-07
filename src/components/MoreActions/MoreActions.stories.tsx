import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DocumentIcon, SettingsIcon, UploadIcon } from "../../docs/demo";
import { useState } from "react";
import { Modal } from "../Modal";
import { MoreActions, type MoreActionItem } from "./MoreActions";

const items: MoreActionItem[] = [
  { key: "dup", label: "Duplicate", icon: <DocumentIcon size={16} />, description: "Copy this record" },
  { key: "exp", label: "Export", icon: <UploadIcon size={16} />, description: "As CSV or PDF" },
  { key: "set", label: "Settings", icon: <SettingsIcon size={16} />, href: "#settings" },
  { key: "arc", label: "Archive", disabled: true },
  { key: "del", label: "Delete record", tone: "danger" },
];

const meta = {
  title: "Components/Actions/MoreActions",
  component: MoreActions,
  parameters: { layout: "padded" },
  args: { label: "More actions", items },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "end"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div
        style={{ display: "flex", justifyContent: "flex-end", minBlockSize: "22rem", maxInlineSize: "24rem" }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoreActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed. Press Enter, Space or the arrow keys on it; type a letter inside the menu to jump to an item. */
export const Default: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const AlignedToStart: Story = {
  args: { defaultOpen: true, align: "start" },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-start", minBlockSize: "22rem" }}>
        <Story />
      </div>
    ),
  ],
};
export const Secondary: Story = { args: { variant: "secondary", size: "sm" } };
export const LongLabels: Story = {
  args: {
    defaultOpen: true,
    items: [
      {
        key: "a",
        label: "An action label long enough that it has to wrap inside the menu",
        description: "And a description that is just as long, so the item grows instead of clipping",
      },
      { key: "b", label: "Short" },
    ],
  },
};
export const Phone320: Story = {
  args: { defaultOpen: true },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const Phone390: Story = {
  args: { defaultOpen: true },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ display: "flex", justifyContent: "flex-end", minBlockSize: "22rem" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <ThemeMatrix>
      <div style={{ display: "flex", justifyContent: "flex-end", minBlockSize: "21rem" }}>
        <MoreActions {...args} />
      </div>
    </ThemeMatrix>
  ),
};

const manyItems: MoreActionItem[] = Array.from({ length: 14 }, (_, index) => ({
  key: `item-${index}`,
  label: `Action number ${index + 1}`,
  description: index % 3 === 0 ? "A short description" : undefined,
}));

/** A bottom sheet over a backdrop that covers the page. Escape, a tap on the backdrop or choosing an item closes it. */
export const Sheet: Story = { args: { defaultOpen: true, presentation: "sheet" } };
/** Items without an icon keep a leading slot, so labels line up with the ones that have one. */
export const SheetMixedIcons: Story = {
  args: { defaultOpen: true, presentation: "sheet", items: items.slice(0, 4) },
};
export const SheetWithoutIcons: Story = {
  args: {
    defaultOpen: true,
    presentation: "sheet",
    items: [
      { key: "a", label: "Duplicate" },
      { key: "b", label: "Export", description: "As CSV or PDF" },
      { key: "c", label: "Delete record", tone: "danger" },
    ],
  },
};
/** Past the sheet's maximum height the list scrolls inside the sheet, and the page behind does not. */
export const SheetManyItems: Story = {
  args: { defaultOpen: true, presentation: "sheet", items: manyItems },
};
/** `presentation="auto"` is a popover on wide pages and a sheet below 60rem. */
export const AutoPhone390: Story = {
  args: { defaultOpen: true, presentation: "auto" },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const SheetPhone320: Story = {
  args: { defaultOpen: true, presentation: "sheet" },
  globals: { viewport: { value: "w320", isRotated: false } },
};
/** A fixed dock with a high z-index. The app raises `--lufia-overlay-z` on the root above it, and the sheet clears the dock. */
export const SheetOverDock: Story = {
  args: { defaultOpen: true, presentation: "sheet" },
  globals: { viewport: { value: "w390", isRotated: false } },
  decorators: [
    (Story) => (
      <>
        <style>{":root { --lufia-overlay-z: 9999; }"}</style>
        <div
          data-testid="header"
          style={{
            position: "fixed",
            insetInline: 0,
            insetBlockStart: 0,
            blockSize: "3rem",
            zIndex: 9000,
            background: "var(--lufia-color-bg-surface-solid)",
            borderBlockEnd: "1px solid var(--lufia-color-border-strong)",
          }}
        />
        <div
          data-testid="dock"
          style={{
            position: "fixed",
            insetInline: 0,
            insetBlockEnd: 0,
            blockSize: "4rem",
            zIndex: 9000,
            background: "var(--lufia-color-bg-surface-solid)",
            borderBlockStart: "1px solid var(--lufia-color-border-strong)",
          }}
        />
        {/* A transformed ancestor makes a stacking context; the sheet is portaled to the body so it is not trapped in it. */}
        <div
          data-testid="transformed"
          style={{ transform: "translateZ(0)", position: "relative", zIndex: 1 }}
        >
          <Story />
        </div>
      </>
    ),
  ],
};

function DialogFromItem() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MoreActions
        label="More actions"
        presentation="auto"
        items={[
          { key: "rename", label: "Rename", onSelect: () => setOpen(true) },
          { key: "dup", label: "Duplicate" },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Rename record">
        <p>Pick a new name for this record.</p>
      </Modal>
    </>
  );
}

/** The item's `onSelect` opens a dialog the caller owns. The menu closes first, focus is on the button, and closing the dialog returns focus there. */
export const OpenADialogFromAMenuItem: Story = {
  name: "Open a dialog from a menu item",
  render: () => <DialogFromItem />,
};
