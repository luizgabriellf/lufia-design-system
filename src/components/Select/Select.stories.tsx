import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { FormField, type FormFieldProps } from "../FormField";
import { Select, type SelectOption, type SelectProps } from "./Select";

const countries: SelectOption[] = [
  { value: "pt", label: "Portugal" },
  { value: "es", label: "Spain" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "it", label: "Italy", disabled: true },
];

type DemoProps = SelectProps & Pick<FormFieldProps, "label" | "hint" | "error">;

function Demo({ label, hint, error, required, disabled, ...input }: DemoProps) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled}>
      <Select {...input} />
    </FormField>
  );
}

const meta = {
  title: "Components/Forms/Select",
  component: Demo,
  parameters: { layout: "padded" },
  args: { label: "Country", options: countries, defaultValue: "pt" },
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
export const WithPlaceholder: Story = { args: { placeholder: "Choose a country", defaultValue: "" } };
export const OptionalWithEmptyChoice: Story = {
  args: {
    placeholder: "No preference",
    allowEmpty: true,
    defaultValue: "",
    hint: "You can leave this empty.",
  },
};
export const WithHint: Story = { args: { hint: "Used to pick your tax rules." } };
export const Required: Story = {
  args: { required: true, placeholder: "Choose a country", defaultValue: "" },
};
export const Invalid: Story = {
  args: {
    required: true,
    placeholder: "Choose a country",
    defaultValue: "",
    error: "Choose a country to continue.",
  },
};
export const Disabled: Story = { args: { disabled: true, hint: "Fixed by your plan." } };
export const WithGroups: Story = {
  args: { options: undefined },
  render: (args) => (
    <Demo {...args} label="City">
      <optgroup label="Portugal">
        <option>Lisbon</option>
        <option>Porto</option>
      </optgroup>
      <optgroup label="Spain">
        <option>Madrid</option>
        <option>Seville</option>
      </optgroup>
    </Demo>
  ),
};
export const LongText: Story = {
  args: {
    label: "A considerably longer label that has to wrap onto a second line on narrow screens",
    options: [
      {
        value: "x",
        label: "An option whose label is far too long to fit inside the box without being clipped",
      },
    ],
    defaultValue: "x",
  },
};
export const Phone320: Story = {
  args: {
    required: true,
    placeholder: "Choose a country",
    defaultValue: "",
    error: "Choose a country to continue.",
  },
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
      <Demo {...args} />
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Invalid" error="Choose a country to continue." />
      </div>
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Disabled" disabled />
      </div>
    </ThemeMatrix>
  ),
};
