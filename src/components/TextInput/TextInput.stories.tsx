import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { SearchIcon } from "../../docs/demo";
import { FormField, type FormFieldProps } from "../FormField";
import { TextInput, type TextInputProps } from "./TextInput";

type DemoProps = TextInputProps & Pick<FormFieldProps, "label" | "hint" | "error" | "requiredLabel">;

/** The input inside its field, which is how it is meant to be used. */
function Demo({ label, hint, error, requiredLabel, required, disabled, ...input }: DemoProps) {
  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      requiredLabel={requiredLabel}
    >
      <TextInput {...input} />
    </FormField>
  );
}

const meta = {
  title: "Components/Forms/TextInput",
  component: Demo,
  parameters: { layout: "padded" },
  args: { label: "Project name", placeholder: "Quarterly report" },
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
export const WithValue: Story = { args: { defaultValue: "Quarterly report" } };
export const WithHint: Story = { args: { hint: "Shown on invoices and in the sidebar." } };
export const Required: Story = { args: { required: true } };
export const Invalid: Story = {
  args: { required: true, defaultValue: "", error: "Enter a project name to continue." },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "Quarterly report" } };
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "INV-2041",
    label: "Invoice number",
    hint: "Assigned automatically.",
  },
};
export const Prefix: Story = {
  args: { label: "Amount", prefix: "EUR", type: "text", inputMode: "decimal", placeholder: "0.00" },
};
export const Suffix: Story = {
  args: { label: "Weight", suffix: "kg", inputMode: "decimal", placeholder: "0.0" },
};
export const PrefixAndSuffix: Story = {
  args: {
    label: "Website",
    prefix: "https://",
    suffix: ".example",
    placeholder: "acme",
  },
};
export const WithIcon: Story = {
  args: {
    label: "Customer",
    prefix: <SearchIcon size={16} aria-hidden="true" />,
    placeholder: "Search by name",
  },
};
export const Password: Story = {
  args: { label: "Password", type: "password", defaultValue: "correct horse" },
};
export const LongText: Story = {
  args: {
    label: "A considerably longer label that has to wrap onto a second line on narrow screens",
    defaultValue: "A value that is much too long to fit inside the box without being clipped by it",
    hint: "A hint can be long too, and it wraps inside the width of the field instead of overflowing.",
  },
};
export const Phone320: Story = {
  args: { required: true, error: "Enter a project name to continue.", defaultValue: "" },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { prefix: "EUR", suffix: "kg", hint: "A hint" },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  args: { required: true, hint: "Up to 40 characters.", defaultValue: "Quarterly report", suffix: "kg" },
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Invalid" error="Enter a project name to continue." />
      </div>
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Disabled" disabled />
      </div>
    </ThemeMatrix>
  ),
};
