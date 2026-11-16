import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { ChevronDownIcon, CopyIcon, DownloadIcon, FileTextIcon, HomeIcon, UsersIcon } from "../Icon/icons";
import { Menu, type MenuEntry, type MenuItem, type MenuProps } from "./Menu";

type DemoProps = Omit<MenuProps, "trigger" | "label" | "items"> &
  Partial<Pick<MenuProps, "label" | "items">> & { triggerLabel?: string };

const exportItems: MenuEntry[] = [
  { key: "csv", label: "Export as CSV", meta: "CSV", icon: <DownloadIcon /> },
  { key: "pdf", label: "Export as PDF", meta: "PDF", icon: <FileTextIcon /> },
  { type: "separator", key: "sep" },
  { key: "copy", label: "Copy link", icon: <CopyIcon /> },
  { key: "locked", label: "Export to the archive", disabled: true, description: "Needs the archive add-on" },
];

function Demo({ label = "Export", items = exportItems, triggerLabel = "Export", ...rest }: DemoProps) {
  return (
    <Menu
      label={label}
      items={items}
      trigger={(props) => (
        <Button variant="secondary" {...props}>
          {triggerLabel}
        </Button>
      )}
      {...rest}
    />
  );
}

const meta = {
  title: "Components/Overlays/Menu",
  component: Demo,
  parameters: { layout: "padded" },
  argTypes: {
    role: { control: "inline-radio", options: ["menu", "listbox"] },
    placement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    initialFocus: { control: "inline-radio", options: ["current", "first"] },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minBlockSize: "22rem",
          paddingBlock: "6rem",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed. Press Enter, Space or ArrowDown on the button; Escape closes it and focus returns to the button. */
export const Default: Story = {};
export const Open: Story = { args: { defaultOpen: true } };

const links: MenuEntry[] = [
  { key: "overview", label: "Overview", href: "#overview", icon: <HomeIcon />, current: true },
  { key: "team", label: "Team", href: "#team", icon: <UsersIcon /> },
  { key: "reports", label: "Reports", href: "#reports", icon: <FileTextIcon /> },
];

/** Link items render through the provider's link adapter; the current one carries `aria-current="page"`. */
export const LinkItems: Story = {
  args: { defaultOpen: true, label: "Sections", items: links, triggerLabel: "Sections" },
};

const withDetails: MenuEntry[] = [
  {
    type: "group",
    key: "personal",
    label: "Personal",
    items: [
      { key: "a", label: "Rita Gomes", description: "Owner, 4 sites", meta: "Admin" },
      { key: "b", label: "Tomas Faria", description: "Member, 1 site", meta: "Viewer" },
    ],
  },
  { type: "separator", key: "sep" },
  {
    type: "group",
    key: "shared",
    label: "Shared",
    items: [{ key: "c", label: "Operations", description: "Seven people", meta: "Team" }],
  },
];

/** Descriptions, trailing meta text, group headings and a separator. */
export const WithDescriptionsAndGroups: Story = {
  args: { defaultOpen: true, label: "Switch workspace", items: withDetails, triggerLabel: "Workspace" },
};

const choiceList: MenuItem[] = [
  { key: "all", label: "All workspaces" },
  { key: "north", label: "North region" },
  { key: "south", label: "South region" },
  { key: "archived", label: "Archived", disabled: true },
];
const choices: MenuEntry[] = choiceList.map((item) => ({ ...item, current: item.key === "all" }));

/** `role="listbox"`: options, the current one `aria-selected` and marked with a check. */
export const Listbox: Story = {
  args: {
    defaultOpen: true,
    role: "listbox",
    label: "Scope",
    items: choices,
    triggerLabel: "All workspaces",
  },
};

function ListboxPicker() {
  const [value, setValue] = useState("all");
  const picked = choiceList.find((item) => item.key === value);
  return (
    <Menu
      role="listbox"
      label="Scope"
      items={choiceList.map((item) => ({
        ...item,
        current: item.key === value,
        onSelect: () => setValue(item.key),
      }))}
      matchTriggerWidth
      trigger={(props) => (
        <Button variant="secondary" iconEnd={<ChevronDownIcon />} {...props}>
          {picked?.label}
        </Button>
      )}
    />
  );
}

/** A picker that keeps its value: the trigger shows the selection and the list is as wide as the trigger. */
export const ListboxPicked: Story = { render: () => <ListboxPicker /> };

const longItems: MenuEntry[] = [
  {
    key: "long",
    label: "A workspace with a very long name that has to wrap instead of running out of the list",
    description:
      "And a description that is just as long, so that the second line wraps too and nothing overflows the panel",
    meta: "Enterprise plan",
    current: true,
  },
  {
    key: "unbroken",
    label: "Averyveryveryveryverylongwordwithoutanyspacestobreakon_workspace_identifier_2026",
  },
  { key: "short", label: "Short" },
];

export const LongLabels: Story = {
  args: { defaultOpen: true, label: "Workspaces", items: longItems, triggerLabel: "Workspaces" },
};

function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "grid", gap: "1rem", justifyItems: "start" }}>
      <Button variant="ghost" onClick={() => setOpen((value) => !value)}>
        {open ? "Close from outside" : "Open from outside"}
      </Button>
      <Demo open={open} onOpenChange={setOpen} />
    </div>
  );
}

/** `open` and `onOpenChange` put the state in the caller. */
export const ControlledByTheCaller: Story = { render: () => <Controlled /> };

export const PlacedAbove: Story = { args: { defaultOpen: true, placement: "top" } };
export const PlacedAtEnd: Story = { args: { defaultOpen: true, placement: "end" } };
export const AlignedToEnd: Story = { args: { defaultOpen: true, align: "end" } };

/** A trigger near the bottom edge: the list flips above it instead of running off the page. */
export const FlipsNearTheBottom: Story = {
  args: { defaultOpen: true },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ position: "fixed", insetBlockEnd: "1rem", insetInlineStart: "1rem" }}>
        <Story />
      </div>
    ),
  ],
};

/** A card with `overflow: hidden`. The list is portalled out of it, so it is not clipped. */
export const InClippingCard: Story = {
  name: "In a clipping card",
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <div
        style={{
          overflow: "hidden",
          inlineSize: "14rem",
          blockSize: "4rem",
          padding: "1rem",
          borderRadius: "var(--lufia-radius-panel)",
          border: "1px solid var(--lufia-color-border-subtle)",
          background: "var(--lufia-color-bg-surface-solid)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/** `presentation="inline"`: the same items as a plain, always-visible list, for a phone sheet or a page. */
export const Inline: Story = {
  render: () => (
    <div style={{ inlineSize: "min(100%, 22rem)" }}>
      <Menu presentation="inline" role="listbox" label="Scope" items={choices} />
    </div>
  ),
  decorators: [],
};

export const InlineLinks: Story = {
  render: () => (
    <div style={{ inlineSize: "min(100%, 22rem)" }}>
      <Menu presentation="inline" label="Sections" items={links} />
    </div>
  ),
  decorators: [],
};

export const Phone320: Story = {
  args: { defaultOpen: true, items: longItems },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const Phone390: Story = {
  args: { defaultOpen: true, items: withDetails },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { defaultOpen: true, placement: "start" },
  decorators: [
    (Story) => (
      <div
        dir="rtl"
        style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minBlockSize: "22rem" }}
      >
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  args: { defaultOpen: true, items: withDetails },
  render: (args) => (
    <ThemeMatrix>
      <div style={{ minBlockSize: "22rem", paddingBlockStart: "1rem" }}>
        <Demo {...args} />
      </div>
    </ThemeMatrix>
  ),
};
