import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { VisuallyHidden } from "../VisuallyHidden";
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
  args: {
    label: "City",
    options: undefined,
    defaultValue: "lisbon",
    groups: [
      {
        label: "Portugal",
        options: [
          { value: "lisbon", label: "Lisbon" },
          { value: "porto", label: "Porto" },
        ],
      },
      {
        label: "Spain",
        options: [
          { value: "madrid", label: "Madrid" },
          { value: "seville", label: "Seville", disabled: true },
        ],
      },
    ],
  },
};
export const WithChildGroups: Story = {
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
/** A long selected label in a 96px box: the text ellipsizes before the chevron instead of running under it. */
export const NarrowLongLabel: Story = {
  args: {
    label: "Country",
    options: [{ value: "x", label: "An option whose label is far too long to fit inside the box" }],
    defaultValue: "x",
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "6rem" }}>
        <Story />
      </div>
    ),
  ],
};
/** `size="sm"`: the compact control for a toolbar. It sizes to its content and has no visible label; the name is an `aria-label`. */
export const Compact: Story = {
  render: (args) => <Select {...args} aria-label="Country" size="sm" />,
};
export const CompactPill: Story = {
  render: (args) => <Select {...args} aria-label="Country" size="sm" variant="pill" />,
};
/** A filter row: compact selects beside pill buttons, one with a visually hidden `<label>` instead of `aria-label`. */
export const InFilterRow: Story = {
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 36rem)" }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      <label htmlFor="filter-country">
        <VisuallyHidden>Country</VisuallyHidden>
      </label>
      <Select {...args} id="filter-country" size="sm" variant="pill" />
      <Select
        {...args}
        aria-label="Status"
        size="sm"
        variant="pill"
        options={[{ value: "a", label: "Active" }]}
      />
      <Button size="sm" variant="secondary">
        Clear
      </Button>
    </div>
  ),
};
/** A long selected label in a 96px compact box: the text ellipsizes before the smaller chevron. */
export const CompactNarrowLongLabel: Story = {
  args: {
    options: [{ value: "x", label: "An option whose label is far too long to fit inside the box" }],
    defaultValue: "x",
  },
  render: (args) => (
    <div style={{ inlineSize: "6rem", display: "flex" }}>
      <Select {...args} aria-label="Country" size="sm" variant="pill" />
    </div>
  ),
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
