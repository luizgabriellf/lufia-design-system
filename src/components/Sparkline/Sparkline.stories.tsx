import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Sparkline } from "./Sparkline";

const meta = {
  title: "Components/Data display/Sparkline",
  component: Sparkline,
  parameters: { layout: "padded" },
  args: { values: [3, 5, 4, 8, 6, 9, 12], label: "Deliveries per week: 3, 5, 4, 8, 6, 9, 12" },
  argTypes: {
    variant: { control: "inline-radio", options: ["columns", "line"] },
    tone: { control: "inline-radio", options: ["accent", "success", "warning", "danger", "neutral"] },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "7.5rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Columns: Story = {};
export const Line: Story = { args: { variant: "line" } };
export const Tones: Story = {
  decorators: [],
  render: (args) => (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "7.5rem" }}>
      {(["accent", "success", "warning", "danger", "neutral"] as const).map((tone) => (
        <Sparkline key={tone} {...args} tone={tone} label={`${tone} series`} />
      ))}
    </div>
  ),
};
/** Zeros are drawn as a thin baseline mark so an empty week is visible but quiet. */
export const WithZeros: Story = { args: { values: [0, 0, 3, 0, 5, 0, 2], label: "Mostly empty weeks" } };
export const SingleValue: Story = { args: { values: [5], label: "One value" } };
export const ConstantLine: Story = { args: { values: [4, 4, 4, 4], variant: "line", label: "Flat" } };
export const ManyValues: Story = {
  args: {
    values: Array.from({ length: 30 }, (_, i) => 5 + Math.round(4 * Math.sin(i / 2))),
    label: "Thirty days",
  },
};
export const Empty: Story = { args: { values: [], label: "No data" } };
/** Use `label={null}` only when the numbers are printed as text beside the drawing. */
export const Decorative: Story = {
  args: { label: null },
  render: (args) => (
    <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span>3, 5, 4, 8, 6, 9, 12 per week</span>
      <Sparkline {...args} />
    </p>
  ),
  decorators: [],
};
export const RightToLeft: Story = {
  args: { variant: "line" },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "7.5rem" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.75rem", inlineSize: "7.5rem" }}>
        <Sparkline {...args} />
        <Sparkline {...args} variant="line" tone="success" />
      </div>
    </ThemeMatrix>
  ),
};
