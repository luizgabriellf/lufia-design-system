import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Components/Data display/ProgressBar",
  component: ProgressBar,
  parameters: { layout: "padded" },
  args: { value: 45, label: "Storage used" },
  argTypes: {
    tone: { control: "inline-radio", options: ["accent", "success", "warning", "danger", "neutral"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 20rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Empty: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100, tone: "success" } };
export const Warning: Story = { args: { value: 85, tone: "warning" } };
export const Danger: Story = { args: { value: 97, tone: "danger" } };
export const CustomRange: Story = {
  args: { value: 12, max: 40, valueText: "12 of 40 steps", label: "Steps done" },
};
export const WithVisibleFigure: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "0.375rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
        <span>Storage used</span>
        <span>{args.value}%</span>
      </div>
      <ProgressBar {...args} />
    </div>
  ),
};
export const AnimatedChanges: Story = {
  args: { animateChanges: true, label: "Upload" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <ProgressBar {...args} value={value} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={() => setValue((v) => Math.max(0, v - 25))}>
            -25
          </button>
          <button type="button" onClick={() => setValue((v) => Math.min(100, v + 25))}>
            +25
          </button>
        </div>
      </div>
    );
  },
};
export const AnimatedAtRest: Story = { args: { animateChanges: true, value: 60 } };
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "min(100%, 20rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <ProgressBar {...args} />
        <ProgressBar {...args} value={90} tone="danger" label="Quota" />
      </div>
    </ThemeMatrix>
  ),
};
