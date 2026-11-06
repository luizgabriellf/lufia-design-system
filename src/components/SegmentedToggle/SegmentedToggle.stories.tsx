import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { GridIcon, InboxIcon, ServerIcon } from "../../docs/demo";
import { SegmentedToggle, type SegmentedToggleOption } from "./SegmentedToggle";

const options: SegmentedToggleOption[] = [
  { value: "list", label: "List" },
  { value: "board", label: "Board" },
  { value: "calendar", label: "Calendar" },
];

const meta = {
  title: "Forms/SegmentedToggle",
  component: SegmentedToggle,
  parameters: { layout: "padded" },
  args: { label: "View", options, defaultValue: "board" },
} satisfies Meta<typeof SegmentedToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TwoChoices: Story = {
  args: { label: "Source", options: [options[0]!, options[1]!], defaultValue: "list" },
};
export const WithIcons: Story = {
  args: {
    options: [
      { value: "list", label: "List", icon: <InboxIcon size={16} /> },
      { value: "board", label: "Board", icon: <GridIcon size={16} /> },
      { value: "calendar", label: "Calendar", icon: <ServerIcon size={16} /> },
    ],
  },
};
export const DisabledSegment: Story = {
  args: {
    options: options.map((option) => (option.value === "calendar" ? { ...option, disabled: true } : option)),
  },
};
export const Disabled: Story = { args: { disabled: true } };
/** Shares the full width, for forms and narrow containers. */
export const Fill: Story = {
  args: { width: "fill" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 28rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const LongText: Story = {
  args: {
    options: [
      { value: "a", label: "Upload a file from this computer" },
      { value: "b", label: "Paste a link to a file that is stored elsewhere" },
    ],
    defaultValue: "a",
  },
};
export const Phone320: Story = {
  args: { width: "fill" },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <SegmentedToggle {...args} />
      <div style={{ marginBlockStart: "1rem" }}>
        <SegmentedToggle {...args} label="Disabled" disabled />
      </div>
    </ThemeMatrix>
  ),
};
