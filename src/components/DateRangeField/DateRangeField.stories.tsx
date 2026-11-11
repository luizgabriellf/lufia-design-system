import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DateRangeField, type DateRange } from "./DateRangeField";

const meta = {
  title: "Components/Forms/DateRangeField",
  component: DateRangeField,
  parameters: { layout: "padded" },
  args: { legend: "Stay", startLabel: "From", endLabel: "To" },
  argTypes: {
    type: { control: "inline-radio", options: ["date", "time", "datetime-local", "month"] },
    onValueChange: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 32rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateRangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Pick an end first: the other end's native `min` or `max` follows it. */
export const WithValues: Story = {
  args: {
    defaultValue: { start: "2030-01-10", end: "2030-01-20" },
    hint: "The end cannot be before the start.",
  },
};
export const WithMinAndMax: Story = {
  args: { min: "2030-01-01", max: "2030-12-31", hint: "Choose days in 2030." },
};
export const Months: Story = { args: { type: "month", legend: "Period" } };
export const DatesAndTimes: Story = { args: { type: "datetime-local", legend: "Event" } };
export const Required: Story = { args: { required: true } };
export const Invalid: Story = {
  args: {
    required: true,
    error: "The stay must be at most 14 nights.",
    defaultValue: { start: "2030-01-01", end: "2030-03-01" },
  },
};
export const Disabled: Story = {
  args: { disabled: true, defaultValue: { start: "2030-01-10", end: "2030-01-20" } },
};
export const Clearable: Story = {
  args: { clearLabel: "Clear date", defaultValue: { start: "2030-01-10", end: "2030-01-20" } },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRange>({ start: "2030-01-10", end: "" });
    return (
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <DateRangeField {...args} value={value} onValueChange={setValue} />
        <output>
          {value.start || "…"} to {value.end || "…"}
        </output>
      </div>
    );
  },
};

/** The ends stack below about 24rem, with no media query. */
export const Narrow: Story = {
  args: {
    required: true,
    clearLabel: "Clear date",
    defaultValue: { start: "2030-01-10", end: "2030-01-20" },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "15rem" }}>
        <Story />
      </div>
    ),
  ],
};

export const Phone320: Story = {
  args: { required: true, error: "Choose both dates to continue." },
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
      <div style={{ display: "grid", gap: "1rem" }}>
        <DateRangeField {...args} defaultValue={{ start: "2030-01-10", end: "2030-01-20" }} />
        <DateRangeField {...args} legend="Invalid" error="Choose both dates to continue." required />
      </div>
    </ThemeMatrix>
  ),
};
