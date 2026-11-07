import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { BulletBar } from "./BulletBar";

const meta = {
  title: "Components/Data display/BulletBar",
  component: BulletBar,
  parameters: { layout: "padded" },
  args: { value: 80, target: 100, label: "Delivered 80 of 100" },
  argTypes: {
    tone: { control: "inline-radio", options: ["accent", "success", "warning", "danger", "neutral"] },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 20rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BulletBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OverTarget: Story = { args: { value: 118, tone: "success", label: "Delivered 118 of 100" } };
export const FarOverTarget: Story = { args: { value: 400, label: "Delivered 400 of 100" } };
export const Empty: Story = { args: { value: 0, label: "Delivered 0 of 100" } };
export const NoTarget: Story = { args: { target: 0, label: "Delivered 80" } };
/** Bars of different rows share one "percent of target" axis, so the tick sits in the same place. */
export const Rows: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {[
        ["North", 60, 100],
        ["South", 90, 100],
        ["East", 30, 40],
        ["West", 200, 150],
      ].map(([name, value, target]) => (
        <div key={name} style={{ display: "grid", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.875rem" }}>
            {name}: {value} of {target}
          </span>
          <BulletBar value={Number(value)} target={Number(target)} label={null} />
        </div>
      ))}
    </div>
  ),
};
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
      <div style={{ display: "grid", gap: "1rem" }}>
        <BulletBar {...args} />
        <BulletBar {...args} value={30} tone="danger" label="Delivered 30 of 100" />
      </div>
    </ThemeMatrix>
  ),
};
