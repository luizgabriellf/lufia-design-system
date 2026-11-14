import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { FormField, type FormFieldProps } from "../FormField";
import { Textarea, type TextareaProps } from "./Textarea";

type DemoProps = TextareaProps & Pick<FormFieldProps, "label" | "hint" | "error">;

function Demo({ label, hint, error, required, disabled, ...input }: DemoProps) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled}>
      <Textarea {...input} />
    </FormField>
  );
}

const meta = {
  title: "Components/Forms/Textarea",
  component: Demo,
  parameters: { layout: "padded" },
  args: { label: "Notes", placeholder: "Anything the team should know" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 28rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "Visible to everyone on the project." } };
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { required: true, error: "Write a short note before saving." } };
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked while the report is being sent." },
};
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "Delivered to the loading dock before 8:00.",
    hint: "Written by the driver.",
  },
};
/** The count is part of the description. It is read out only in the last tenth of the limit. */
export const WithCount: Story = { args: { showCount: true, maxLength: 200 } };
export const NearLimit: Story = {
  args: { showCount: true, maxLength: 40, defaultValue: "Thirty-six characters of text, nearly." },
};
export const CountWithoutLimit: Story = {
  args: { showCount: true, defaultValue: "No limit, just a running count." },
};
/** `formatCount` rewords or localises the count. */
export const CustomCount: Story = {
  args: { showCount: true, maxLength: 120, formatCount: (n, max) => `${(max ?? 0) - n} characters left` },
};
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("Controlled value");
    return (
      <Demo {...args} showCount maxLength={60} value={value} onChange={(e) => setValue(e.target.value)} />
    );
  },
};
/** `autoSize`: grows with the content from `rows` (the minimum) up to `maxRows`, then scrolls. */
export const AutoSize: Story = {
  args: { autoSize: true, rows: 2, maxRows: 8, hint: "Grows as you type, up to eight rows." },
};
export const AutoSizeUnbounded: Story = {
  args: { autoSize: true, rows: 1, hint: "One row to start, no limit." },
};
/** Controlled: the height follows a value set from outside as well as typing. */
export const AutoSizeControlled: Story = {
  args: { autoSize: true, rows: 2, maxRows: 6 },
  render: (args) => {
    const [value, setValue] = useState("A controlled value.");
    return <Demo {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
  },
};
/** In a flex row the root fills the space a sibling leaves, with `autoSize` too. `rootClassName` sizes it further. */
export const InFlexRow: Story = {
  args: { autoSize: true, rows: 2, maxRows: 6 },
  render: ({ rows, maxRows, autoSize }) => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", inlineSize: "100%" }}>
      <Textarea aria-label="Notes" rows={rows} maxRows={maxRows} autoSize={autoSize} />
      <button type="button" style={{ flex: "none" }}>
        Send
      </button>
    </div>
  ),
};
/** Read-only and required: the value is not something the person has to fill in, so there is no mark. */
export const ReadOnlyRequired: Story = {
  args: { readOnly: true, required: true, defaultValue: "Delivered to the loading dock before 8:00." },
};
export const LongText: Story = {
  args: {
    label: "A considerably longer label that has to wrap onto a second line on narrow screens",
    defaultValue:
      "A long paragraph of text that keeps going until it wraps across several lines of the box, to show the line height and the padding when the content is taller than the default four rows can show at once without scrolling. ".repeat(
        2,
      ),
  },
};
export const Phone320: Story = {
  args: { required: true, showCount: true, maxLength: 80, error: "Write a short note before saving." },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { showCount: true, maxLength: 80, hint: "A hint" },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  args: { showCount: true, maxLength: 80, defaultValue: "Some text" },
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Invalid" error="Write a short note before saving." />
      </div>
    </ThemeMatrix>
  ),
};
