import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { FormField, type FormFieldProps } from "./FormField";

const input: CSSProperties = {
  font: "inherit",
  padding: "0.625rem 0.75rem",
  color: "var(--lufia-color-text-default)",
  background: "var(--lufia-color-bg-field)",
  border: "1px solid var(--lufia-color-border-strong)",
  borderRadius: "var(--lufia-radius-control)",
};

/** A native input stands in for any control: the render prop hands it the ids it needs. */
function Field(props: Omit<FormFieldProps, "children">) {
  return <FormField {...props}>{(control) => <input {...control} style={input} />}</FormField>;
}

const meta = {
  title: "Forms/FormField",
  component: FormField,
  parameters: { layout: "padded" },
  args: { label: "Project name", children: null },
  render: (args) => <Field {...args} />,
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 24rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "Shown on invoices and in the sidebar." } };
export const Required: Story = {
  args: { required: true, hint: "Required fields carry an asterisk and a text for screen readers." },
};
/** The message is announced when it appears and is linked to the control with `aria-describedby`. */
export const Invalid: Story = {
  args: { required: true, hint: "Up to 40 characters.", error: "Enter a project name to continue." },
};
export const Disabled: Story = { args: { disabled: true, hint: "Only an owner can rename the project." } };
export const LongText: Story = {
  args: {
    label: "A considerably longer label that has to wrap onto a second line on narrow screens",
    hint: "A hint can be long too, and it keeps wrapping inside the width of the field instead of overflowing it.",
    error: "An error message that is long enough to wrap, with its icon staying aligned to the first line.",
  },
};
export const Phone320: Story = {
  args: { required: true, error: "Enter a project name to continue." },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { required: true, hint: "A hint", error: "An error" },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  args: { required: true, hint: "Up to 40 characters.", error: "Enter a project name to continue." },
  render: (args) => (
    <ThemeMatrix>
      <Field {...args} />
    </ThemeMatrix>
  ),
};
