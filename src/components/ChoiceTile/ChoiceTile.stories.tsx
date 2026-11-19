import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ChoiceTile } from "./ChoiceTile";

const meta = {
  title: "Components/Forms/ChoiceTile",
  component: ChoiceTile,
  parameters: { layout: "padded" },
  args: { label: "16:30" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    emphasis: { control: "inline-radio", options: ["solid", "subtle"] },
  },
} satisfies Meta<typeof ChoiceTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const SelectedSubtle: Story = { args: { selected: true, emphasis: "subtle" } };
export const Small: Story = { args: { size: "sm" } };
export const WithEyebrow: Story = { args: { eyebrow: "Thursday", label: "19/11" } };
export const WithDescription: Story = { args: { label: "Team", description: "10 seats" } };
export const Disabled: Story = { args: { disabled: true } };
export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "12rem" }}>
        <Story />
      </div>
    ),
  ],
};
export const LongLabel: Story = {
  args: { eyebrow: "Wednesday afternoon", label: "A considerably longer label" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "8rem" }}>
        <Story />
      </div>
    ),
  ],
};

const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "16:30", "17:00"];

function TimeSlots({ emphasis, size }: { emphasis?: "solid" | "subtle"; size?: "sm" | "md" }) {
  const [picked, setPicked] = useState("10:00");
  return (
    <div role="group" aria-label="Time" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {times.map((time) => (
        <ChoiceTile
          key={time}
          label={time}
          emphasis={emphasis}
          size={size}
          selected={picked === time}
          disabled={time === "11:00"}
          onClick={() => setPicked(time)}
        />
      ))}
    </div>
  );
}
/** Single-line tiles in a wrapping grid. The selected one is the strongest element of the set. */
export const TimeSlotGrid: Story = { render: () => <TimeSlots /> };

const days = [
  ["Monday", "17/11"],
  ["Tuesday", "18/11"],
  ["Wednesday", "19/11"],
  ["Thursday", "20/11"],
  ["Friday", "21/11"],
  ["Saturday", "22/11"],
  ["Sunday", "23/11"],
  ["Monday", "24/11"],
  ["Tuesday", "25/11"],
] as const;

function DayStrip({ emphasis }: { emphasis?: "solid" | "subtle" }) {
  const [picked, setPicked] = useState("19/11");
  return (
    <div
      role="group"
      aria-label="Day"
      style={{
        display: "flex",
        gap: "0.5rem",
        overflowX: "auto",
        paddingBlock: "0.25rem",
        paddingInline: "0.25rem",
        maxInlineSize: "22rem",
      }}
    >
      {days.map(([weekday, date]) => (
        <ChoiceTile
          key={date}
          eyebrow={weekday}
          label={date}
          emphasis={emphasis}
          selected={picked === date}
          onClick={() => setPicked(date)}
          style={{ flex: "none" }}
        />
      ))}
    </div>
  );
}
/** Two-line tiles in a horizontally scrolling strip; each keeps its width. */
export const DayStripScrolling: Story = { render: () => <DayStrip /> };
export const SubtleEmphasis: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TimeSlots emphasis="subtle" />
      <DayStrip emphasis="subtle" />
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TimeSlots size="sm" />
      <TimeSlots size="md" />
    </div>
  ),
};

function Grid() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {(["solid", "subtle"] as const).map((emphasis) => (
        <div
          key={emphasis}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}
        >
          <ChoiceTile emphasis={emphasis} label="16:30" />
          <ChoiceTile emphasis={emphasis} label="16:30" selected />
          <ChoiceTile emphasis={emphasis} label="16:30" disabled />
          <ChoiceTile emphasis={emphasis} eyebrow="Thursday" label="19/11" description="2 free" />
          <ChoiceTile emphasis={emphasis} eyebrow="Thursday" label="19/11" description="2 free" selected />
          <ChoiceTile emphasis={emphasis} size="sm" label="16:30" selected />
        </div>
      ))}
    </div>
  );
}
export const AllStates: Story = { render: () => <Grid /> };
export const Phone320: Story = {
  render: () => <TimeSlots />,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <DayStrip />
      <Grid />
    </div>
  ),
};
/** Every theme and mode: the selected tile keeps its contrast in each. */
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Grid />
    </ThemeMatrix>
  ),
};
