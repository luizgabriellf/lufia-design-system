import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Forms/Checkbox",
  component: Checkbox,
  parameters: { layout: "padded" },
  args: { label: "Send me the weekly report" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 24rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = {
  args: { label: "Select all invoices", indeterminate: true, onChange: () => {} },
};
export const WithHint: Story = { args: { hint: "Sent on Mondays at 8:00." } };
export const Required: Story = { args: { label: "I accept the terms of service", required: true } };
export const Invalid: Story = {
  args: { label: "I accept the terms of service", required: true, error: "Accept the terms to continue." },
};
export const Disabled: Story = { args: { disabled: true, hint: "Managed by your administrator." } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
/** A parent box that reflects its children: mixed while some are checked. */
export const SelectAll: Story = {
  render: () => {
    const [items, setItems] = useState({ a: true, b: false, c: false });
    const values = Object.values(items);
    const all = values.every(Boolean);
    const none = values.every((value) => !value);
    return (
      <div>
        <Checkbox
          label="All invoices"
          checked={all}
          indeterminate={!all && !none}
          onChange={(event) =>
            setItems({ a: event.target.checked, b: event.target.checked, c: event.target.checked })
          }
        />
        <div style={{ paddingInlineStart: "2rem" }}>
          {(Object.keys(items) as (keyof typeof items)[]).map((key) => (
            <Checkbox
              key={key}
              label={`Invoice ${key.toUpperCase()}`}
              checked={items[key]}
              onChange={(event) => setItems({ ...items, [key]: event.target.checked })}
            />
          ))}
        </div>
      </div>
    );
  },
};
export const LongText: Story = {
  args: {
    label:
      "I confirm that the information above is correct and I understand that changing it later may take up to two working days",
    hint: "A hint stays aligned with the label when it wraps onto several lines on a narrow screen.",
  },
};
export const Phone320: Story = {
  args: { required: true, error: "Accept the terms to continue." },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { hint: "A hint", defaultChecked: true },
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
      <Checkbox {...args} defaultChecked />
      <Checkbox {...args} label="Mixed" indeterminate onChange={() => {}} />
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} label="Invalid" error="Accept to continue." />
      <Checkbox {...args} label="Disabled" disabled />
    </ThemeMatrix>
  ),
};
