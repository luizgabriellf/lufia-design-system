import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { AnimatedNumber } from "../../motion";
import { Button } from "../Button";
import { Sparkline } from "../Sparkline";
import { StatTile } from "./StatTile";
import { computeStatDelta } from "./statDelta";

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
/** Label colour, font, size and tracking and the value size are component tokens. */
export const ThemedByTokens: Story = {
  decorators: [
    (Story) => (
      <div
        style={
          {
            inlineSize: "min(100%, 15rem)",
            "--lufia-stat-tile-label-color": "var(--lufia-color-text-accent)",
            "--lufia-stat-tile-label-font": "var(--lufia-font-family-body)",
            "--lufia-stat-tile-label-size": "var(--lufia-font-size-xs)",
            "--lufia-stat-tile-label-tracking": "0.14em",
            "--lufia-stat-tile-value-size": "2.5rem",
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};
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
const deltaLabels = { up: "Up", down: "Down", flat: "No change", comparison: "vs previous 30 days" };

/** A rise in a figure where more is good: `computeStatDelta` gives the text, direction word and tone. */
export const ComputedPercent: Story = {
  args: {
    label: "Orders",
    value: "1,120",
    ...computeStatDelta({
      current: 1120,
      previous: 1000,
      goodDirection: "up",
      labels: deltaLabels,
      locale: "en",
    }),
  },
};
/** On a base under `minBase` (5) the change is absolute: "+3", never "+300%". */
export const ComputedSmallBase: Story = {
  args: {
    label: "Orders",
    value: "4",
    ...computeStatDelta({ current: 4, previous: 1, goodDirection: "up", labels: deltaLabels, locale: "en" }),
  },
};
/** Within plus or minus 0.5% the change is flat: grey, with the flat arrow. */
export const ComputedFlat: Story = {
  args: {
    label: "Orders",
    value: "1,003",
    ...computeStatDelta({
      current: 1003,
      previous: 1000,
      goodDirection: "up",
      labels: deltaLabels,
      locale: "en",
    }),
  },
};
/** More incidents is bad, so a fall is `success` and a rise is `warning`. */
export const ComputedFallingIsGood: Story = {
  args: {
    label: "Open tickets",
    value: "7",
    ...computeStatDelta({
      current: 7,
      previous: 10,
      goodDirection: "down",
      labels: deltaLabels,
      locale: "en",
    }),
  },
};
/** `computeStatDelta` returns `null` without a previous value: spread nothing and the tile has no change line. */
export const ComputedNoHistory: Story = {
  args: {
    label: "Orders",
    value: "1,120",
    ...computeStatDelta({
      current: 1120,
      previous: null,
      goodDirection: "up",
      labels: deltaLabels,
      locale: "en",
    }),
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
function FilterRow() {
  const [active, setActive] = useState("open");
  const filters = [
    { key: "open", label: "Open items", value: "128" },
    { key: "overdue", label: "Overdue", value: "4", tone: "danger" as const },
    { key: "done", label: "Completed", value: "96%", tone: "success" as const },
    { key: "all", label: "All", value: "412" },
  ];
  return (
    <div
      style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))" }}
    >
      {filters.map(({ key, ...tile }) => (
        <StatTile key={key} {...tile} pressed={active === key} onClick={() => setActive(key)} />
      ))}
    </div>
  );
}
/** A row of tiles that filters a list: `pressed` marks the active one and the button exposes `aria-pressed`. */
export const AsFilters: Story = {
  name: "As filters",
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 56rem)" }}>
        <Story />
      </div>
    ),
  ],
  render: () => <FilterRow />,
};
export const Loading: Story = { args: { loading: true, loadingLabel: "Loading open items" } };
const full = {
  label: "Open items",
  value: "128",
  delta: "12% vs last week",
  trend: "up",
  trendLabel: "Up",
  hint: "Across all teams",
} as const;
/** Pass the same `delta`, `hint` and `sparkline` as the loaded tile: the skeleton lines then keep its exact height. */
export const LoadingKeepsHeight: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
      {[false, true].map((loading) => (
        <div key={String(loading)} style={{ inlineSize: "15rem" }}>
          <StatTile
            {...full}
            loading={loading}
            loadingLabel="Loading open items"
            sparkline={<Sparkline values={[3, 5, 4, 8, 6, 9, 12]} label={null} />}
          />
        </div>
      ))}
    </div>
  ),
};
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
