import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  DemoButton,
  DocumentIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
  UploadIcon,
  UsersIcon,
} from "../../docs/demo";
import { CommandPalette, type CommandItem, type CommandPaletteLabels } from "./CommandPalette";

const labels: CommandPaletteLabels = {
  title: "Search or run a command",
  placeholder: "Type a command or search…",
  empty: (query) => `No results for “${query}”`,
  resultCount: (count) => `${count} ${count === 1 ? "result" : "results"}`,
};

const noop = () => {};

const items: CommandItem[] = [
  {
    key: "new-doc",
    label: "New document",
    description: "Start from a blank page",
    group: "Actions",
    icon: <PlusIcon size={16} />,
    onSelect: noop,
  },
  {
    key: "upload",
    label: "Upload files",
    description: "Add files from your computer",
    group: "Actions",
    icon: <UploadIcon size={16} />,
    keywords: "import",
    onSelect: noop,
  },
  {
    key: "home",
    label: "Overview",
    description: "Go to the dashboard",
    group: "Go to",
    icon: <HomeIcon size={16} />,
    onSelect: noop,
  },
  {
    key: "people",
    label: "People",
    description: "Everyone on the team",
    group: "Go to",
    icon: <UsersIcon size={16} />,
    onSelect: noop,
  },
  { key: "docs", label: "Documents", group: "Go to", icon: <DocumentIcon size={16} />, onSelect: noop },
  {
    key: "settings",
    label: "Settings",
    description: "Preferences for the workspace",
    group: "Go to",
    icon: <SettingsIcon size={16} />,
    keywords: "preferences",
    onSelect: noop,
  },
];

function Demo({
  initialOpen = false,
  commands = items,
}: {
  initialOpen?: boolean;
  commands?: CommandItem[];
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div style={{ padding: "1rem", display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <DemoButton onClick={() => setOpen(true)}>Open the palette</DemoButton>
      <p style={{ margin: 0, color: "var(--lufia-color-text-muted)" }}>
        Or press <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> on a Mac).
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={commands}
        labels={labels}
        hint="Search by name, or choose an action."
      />
    </div>
  );
}

const meta = {
  title: "Components/CommandPalette",
  component: Demo,
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OpenOnLoad: Story = { args: { initialOpen: true } };
export const SingleGroup: Story = {
  args: { initialOpen: true, commands: items.slice(2).map((i) => ({ ...i, group: undefined })) },
};
export const LongText: Story = {
  args: {
    initialOpen: true,
    commands: [
      {
        key: "long",
        label: "A command with a name that is much too long to fit on a single line of the palette",
        description:
          "And a description that keeps going to prove that unbroken_identifiers_wrap_instead_of_overflowing.",
        group: "Actions",
        onSelect: noop,
      },
    ],
  },
};
export const Phone390: Story = {
  args: { initialOpen: true },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const Phone320: Story = {
  args: { initialOpen: true },
  globals: { viewport: { value: "w320", isRotated: false } },
};
