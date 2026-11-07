import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { AnimatedNumber } from "../../motion";
import { Button } from "../Button";
import { Sparkline } from "../Sparkline";
import { StatTile } from "./StatTile";

const meta = {
  title: "Components/Data display/StatTile",
  component: StatTile,
  parameters: { layout: "padded" },
  args: { label: "Open items", value: "128", hint: "Across all teams" },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "success", "warning", "danger"] },
    trend: { control: "inline-radio", options: [undefined, "up", "down", "flat"] },
    deltaTone: { control: "inline-radio", options: ["neutral", "success", "warning", "danger"] },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 15rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDelta: Story = {
  args: { delta: "12% vs last week", trend: "up", trendLabel: "Up", deltaTone: "success" },
};
export const FallingIsGood: Story = {
  args: {
    label: "Open tickets",
    value: "7",
    delta: "3 fewer than last week",
    trend: "down",
    trendLabel: "Down",
    deltaTone: "success",
  },
};
export const Flat: Story = { args: { delta: "No change", trend: "flat", trendLabel: "Flat" } };
export const WithSparkline: Story = {
  args: {
    sparkline: <Sparkline values={[3, 5, 4, 8, 6, 9, 12]} label={null} />,
    delta: "12% vs last week",
    trend: "up",
    trendLabel: "Up",
  },
};
export const Warning: Story = {
  args: { label: "Due this week", value: "9", tone: "warning", hint: "2 are unassigned" },
};
export const Danger: Story = {
  args: { label: "Overdue", value: "4", tone: "danger", hint: "Oldest: 12 days" },
};
export const Success: Story = { args: { label: "Completed", value: "96%", tone: "success" } };
/** The label is the one link and its hit area covers the tile. The figure and the lines under it are its description. */
export const AsLink: Story = {
  args: { href: "#items", delta: "12% vs last week", trend: "up", trendLabel: "Up" },
};
export const AsButton: Story = { args: { onClick: () => {} } };
export const Loading: Story = { args: { loading: true, loadingLabel: "Loading open items" } };
export const LongLabel: Story = {
  args: {
    label: "A label long enough to wrap onto several lines in a narrow tile",
    href: "#long",
    hint: "A hint that is long too",
  },
};

function Counting() {
  const [value, setValue] = useState(128);
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "stretch" }}>
      <StatTile
        label="Open items"
        value={<AnimatedNumber value={value} />}
        hint="Counts when the value changes"
      />
      <Button size="sm" onClick={() => setValue((v) => v + 37)}>
        Add 37
      </Button>
    </div>
  );
}
export const WithAnimatedNumber: Story = { render: () => <Counting /> };

/** Guards the width: a tile in a flex row shares the space and never collapses to its padding. */
export const InFlexRow: Story = {
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 40rem)" }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <StatTile label="Open items" value="128" />
      <StatTile label="Overdue" value="4" tone="danger" />
    </div>
  ),
};

export const Grid: Story = {
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 56rem)" }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div
      style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))" }}
    >
      <StatTile label="Open items" value="128" href="#a" delta="12%" trend="up" trendLabel="Up" />
      <StatTile label="Overdue" value="4" tone="danger" href="#b" hint="Oldest: 12 days" />
      <StatTile
        label="Completed"
        value="96%"
        tone="success"
        sparkline={<Sparkline values={[2, 4, 3, 6, 8]} label={null} />}
      />
      <StatTile label="Loading" value="0" loading loadingLabel="Loading" />
    </div>
  ),
};
export const Phone320: Story = {
  args: AsLink.args,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: WithSparkline.args,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <StatTile
          label="Open items"
          value="128"
          href="#a"
          delta="12%"
          trend="up"
          trendLabel="Up"
          hint="Across all teams"
        />
        <StatTile label="Overdue" value="4" tone="danger" />
        <StatTile label="Due this week" value="9" tone="warning" />
      </div>
    </ThemeMatrix>
  ),
};
