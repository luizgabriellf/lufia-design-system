import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ArrowRightIcon, PlusIcon } from "../../docs/demo";
import { Button, type ButtonVariant } from "./Button";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];

const meta = {
  title: "Components/Actions/Button",
  component: Button,
  parameters: { layout: "padded" },
  args: { children: "Save changes" },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "secondary" } };
export const Primary: Story = { args: { variant: "primary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete record" } };
export const Disabled: Story = { args: { variant: "primary", disabled: true } };
/** The width of the idle button is kept, so nothing around it shifts when the work starts. */
export const Loading: Story = { args: { variant: "primary", loading: true } };
export const WithIcons: Story = {
  args: { variant: "primary", iconStart: <PlusIcon size={16} />, children: "New report" },
};
export const IconEnd: Story = {
  args: { variant: "secondary", iconEnd: <ArrowRightIcon size={16} />, children: "Continue" },
};
export const FullWidth: Story = {
  args: { variant: "primary", fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 24rem)" }}>
        <Story />
      </div>
    ),
  ],
};
/** With `href` the button renders as a link, for actions that navigate. */
export const AsLink: Story = {
  args: {
    variant: "primary",
    href: "#destination",
    children: "Open the report",
    iconEnd: <ArrowRightIcon size={16} />,
  },
};
export const LongLabel: Story = {
  args: {
    variant: "secondary",
    children: "A considerably longer label that has to wrap instead of overflowing its container",
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "14rem" }}>
        <Story />
      </div>
    ),
  ],
};

function Grid() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
          <Button variant="primary" size={size} loading>
            loading
          </Button>
          <Button variant="secondary" size={size} disabled>
            disabled
          </Button>
        </div>
      ))}
    </div>
  );
}

export const AllVariantsAndSizes: Story = { render: () => <Grid /> };
export const Phone320: Story = {
  render: () => <Grid />,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { variant: "primary", iconStart: <PlusIcon size={16} />, loading: true },
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
      <Grid />
    </ThemeMatrix>
  ),
};
