import { useState } from "react";
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
  title: "Components/Forms/SegmentedToggle",
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

const resultOptions: SegmentedToggleOption[] = [
  { value: "pass", label: "Pass", tone: "success" },
  { value: "fail", label: "Fail", tone: "danger" },
  { value: "na", label: "N/A", tone: "neutral" },
];

/**
 * A per-row status picker for a checklist. A fresh row has no status (`value={null}`), each result has a tone, rows use the
 * small size and `allowDeselect` lets the user clear a choice by activating it again.
 */
export const StatusPicker: Story = {
  render: () => {
    const [rows, setRows] = useState<Record<string, string | null>>({
      "Build passes": "pass",
      "Docs updated": null,
      Reviewed: "fail",
    });
    return (
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
        {Object.entries(rows).map(([item, status]) => (
          <li
            key={item}
            data-testid="status-row"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.75rem",
              justifyContent: "space-between",
            }}
          >
            <span>{item}</span>
            <SegmentedToggle
              label={`Status: ${item}`}
              size="sm"
              allowDeselect
              options={resultOptions}
              value={status}
              onValueChange={(next) => setRows((current) => ({ ...current, [item]: next }))}
              onDeselect={() => setRows((current) => ({ ...current, [item]: null }))}
            />
          </li>
        ))}
      </ul>
    );
  },
};
