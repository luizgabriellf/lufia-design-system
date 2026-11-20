import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { SearchIcon, SettingsIcon } from "../Icon";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Tooltip, type TooltipProps } from "./Tooltip";

type DemoProps = Omit<TooltipProps, "children">;

function Demo(props: DemoProps) {
  return (
    <Tooltip {...props}>
      {(trigger) => (
        <Button variant="secondary" {...trigger}>
          Export
        </Button>
      )}
    </Tooltip>
  );
}

const meta = {
  title: "Components/Overlays/Tooltip",
  component: Demo,
  parameters: { layout: "padded" },
  args: { content: "Export the table as CSV" },
  argTypes: {
    placement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] },
    relation: { control: "inline-radio", options: ["description", "label"] },
    delay: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "center", paddingBlock: "5rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover the button, or Tab to it. Escape, leaving, blur and scrolling hide it. */
export const Default: Story = {};
export const Below: Story = { args: { placement: "bottom" } };
export const AtStart: Story = { args: { placement: "start" } };
export const AtEnd: Story = { args: { placement: "end" } };
export const NoDelay: Story = { args: { delay: 0 } };
export const Disabled: Story = { args: { disabled: true } };

const bare = {
  display: "inline-grid",
  placeItems: "center",
  padding: "0.5rem",
  border: "1px solid var(--lufia-color-border-strong)",
  borderRadius: "var(--lufia-radius-control)",
  background: "var(--lufia-color-bg-surface)",
  color: "var(--lufia-color-text-default)",
} as const;

/** An icon-only control named by the tooltip: `relation="label"` points `aria-labelledby` at a hidden copy of the text. */
export const OnlyName: Story = {
  render: () => (
    <Tooltip content="Search" relation="label">
      {(trigger) => (
        <button type="button" style={bare} {...trigger}>
          <SearchIcon />
        </button>
      )}
    </Tooltip>
  ),
};

/** The tooltip describes a control that already has a name; both are read. */
export const OnIconButton: Story = {
  render: () => (
    <Tooltip content="Opens the workspace settings">
      {(trigger) => <IconButton {...trigger} tooltip={false} icon={<SettingsIcon />} aria-label="Settings" />}
    </Tooltip>
  ),
};

/** Near the top edge it does not fit above, so it opens below. */
export const FlipsNearTheEdge: Story = {
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "center", paddingBlock: "0" }}>
        <Story />
      </div>
    ),
  ],
};

export const LongText: Story = {
  args: {
    content:
      "A longer explanation that wraps onto several lines instead of running off the screen, still short enough to read at a glance.",
  },
};

export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Demo content="Export the table as CSV" />
    </ThemeMatrix>
  ),
};
