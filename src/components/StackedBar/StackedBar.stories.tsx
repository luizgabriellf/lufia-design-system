import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { StackedBar } from "./StackedBar";

const segments = [
  { key: "active", label: "Active", value: 48, tone: "accent" },
  { key: "trial", label: "Trial", value: 21, tone: "success" },
  { key: "expired", label: "Expired", value: 9, tone: "warning" },
] as const;

const meta = {
  title: "Components/Data display/StackedBar",
  component: StackedBar,
  parameters: { layout: "padded" },
  args: { label: "Accounts by status", segments },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 28rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StackedBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPercent: Story = { args: { showPercent: true } };
export const FormattedValues: Story = {
  args: {
    formatValue: (value) => `${value} accounts`,
    formatPercent: (percent) => `${percent.toFixed(1)} %`,
    showPercent: true,
  },
};
/** The legend is off but the bar keeps its text alternative: a screen reader still reads every label, value and share. */
export const LegendHidden: Story = { args: { legend: "hidden" } };
export const ZeroSegment: Story = {
  args: {
    segments: [
      { key: "active", label: "Active", value: 48 },
      { key: "trial", label: "Trial", value: 0 },
      { key: "expired", label: "Expired", value: 9, tone: "warning" },
    ],
  },
};
export const ZeroTotal: Story = {
  args: {
    segments: [
      { key: "active", label: "Active", value: 0 },
      { key: "trial", label: "Trial", value: 0 },
    ],
  },
};
export const SingleSegment: Story = { args: { segments: [{ key: "all", label: "Everything", value: 12 }] } };
/** A pattern tells two segments apart without colour; forced-colors mode gives every segment its own pattern. */
export const Hatched: Story = {
  args: {
    segments: [
      { key: "actual", label: "Delivered", value: 60, tone: "success" },
      { key: "forecast", label: "Forecast", value: 30, tone: "success", pattern: "hatch" },
    ],
  },
};
export const ManySegments: Story = {
  args: {
    segments: [
      { key: "a", label: "North", value: 30 },
      { key: "b", label: "South", value: 25 },
      { key: "c", label: "East", value: 20 },
      { key: "d", label: "West", value: 15 },
      { key: "e", label: "Central", value: 10 },
    ],
  },
};
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "min(100%, 28rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "1rem" }}>
        <StackedBar {...args} />
        <StackedBar {...args} legend="hidden" label="Accounts by status, no legend" />
      </div>
    </ThemeMatrix>
  ),
};
