import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { FormField, type FormFieldProps } from "../FormField";
import { DateField, type DateFieldProps, type DateFieldType } from "./DateField";

type DemoProps = DateFieldProps & Pick<FormFieldProps, "label" | "hint" | "error">;

function Demo({ label, hint, error, required, disabled, ...input }: DemoProps) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled}>
      <DateField {...input} />
    </FormField>
  );
}

const TYPES: readonly { type: DateFieldType; label: string; value: string }[] = [
  { type: "date", label: "Date", value: "2030-01-31" },
  { type: "time", label: "Time", value: "14:30" },
  { type: "datetime-local", label: "Date and time", value: "2030-01-31T14:30" },
  { type: "month", label: "Month", value: "2030-01" },
];

const meta = {
  title: "Components/Forms/DateField",
  component: Demo,
  parameters: { layout: "padded" },
  args: { label: "Start date", type: "date" },
  argTypes: {
    type: { control: "inline-radio", options: TYPES.map((t) => t.type) },
    onValueChange: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 24rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every native control, with a value, in the same box. */
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {TYPES.map(({ type, label, value }) => (
        <Demo key={type} type={type} label={label} defaultValue={value} />
      ))}
    </div>
  ),
};

/** The same controls empty: the box keeps its height, which iOS Safari otherwise collapses. */
export const AllTypesEmpty: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {TYPES.map(({ type, label }) => (
        <Demo key={type} type={type} label={label} />
      ))}
    </div>
  ),
};

export const WithHint: Story = { args: { hint: "Shown in the local time zone." } };
export const WithMinAndMax: Story = {
  args: { min: "2030-01-01", max: "2030-12-31", defaultValue: "2030-06-15", hint: "Choose a day in 2030." },
};
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { required: true, error: "Choose a date to continue." } };
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "2030-01-31", hint: "Fixed by your plan." },
};
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "2030-01-31" } };

/** `clearLabel` adds a clear button while the field has a value. It never shows on a required field. */
export const Clearable: Story = { args: { clearLabel: "Clear date", defaultValue: "2030-01-31" } };

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("2030-01-31");
    return (
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <Demo {...args} value={value} onValueChange={setValue} clearLabel="Clear date" />
        <output>Value: {value === "" ? "(empty)" : value}</output>
      </div>
    );
  },
};

/** A 160px box: the value keeps its start alignment and never paints past the box. */
export const Narrow: Story = {
  args: { type: "datetime-local", defaultValue: "2030-01-31T14:30", clearLabel: "Clear date" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "10rem" }}>
        <Story />
      </div>
    ),
  ],
};

export const Phone320: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {TYPES.map(({ type, label }) => (
        <Demo key={type} type={type} label={label} required error="Choose a value to continue." />
      ))}
    </div>
  ),
  globals: { viewport: { value: "w320", isRotated: false } },
};

export const RightToLeft: Story = {
  args: { clearLabel: "Clear date", defaultValue: "2030-01-31" },
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
      <div style={{ display: "grid", gap: "1rem" }}>
        <Demo label="Default" defaultValue="2030-01-31" clearLabel="Clear date" />
        <Demo label="Time" type="time" />
        <Demo label="Invalid" required error="Choose a date to continue." />
        <Demo label="Disabled" disabled defaultValue="2030-01-31" />
      </div>
    </ThemeMatrix>
  ),
};
