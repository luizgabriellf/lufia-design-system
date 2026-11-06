import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { PlusIcon, SearchIcon, SettingsIcon } from "../../docs/demo";
import { IconButton } from "./IconButton";

const VARIANTS = ["primary", "secondary", "ghost", "danger"] as const;

const meta = {
  title: "Components/Actions/IconButton",
  component: IconButton,
  parameters: { layout: "padded" },
  args: { icon: <SettingsIcon size={18} />, "aria-label": "Open settings" },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover it: the tooltip is the `title`, which defaults to the accessible name. */
export const Default: Story = {};
export const Secondary: Story = {
  args: { variant: "secondary", icon: <SearchIcon size={18} />, "aria-label": "Search" },
};
export const Primary: Story = {
  args: { variant: "primary", icon: <PlusIcon size={18} />, "aria-label": "Add item" },
};
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { variant: "primary", loading: true } };
export const AsLink: Story = { args: { href: "#settings", variant: "secondary" } };
export const CustomTitle: Story = { args: { title: "Settings (S)" } };

function Grid() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          {VARIANTS.map((variant) => (
            <IconButton
              key={variant}
              variant={variant}
              size={size}
              icon={<SettingsIcon size={size === "sm" ? 16 : 18} />}
              aria-label={`${variant} ${size}`}
            />
          ))}
          <IconButton
            size={size}
            icon={<SettingsIcon size={18} />}
            aria-label="Loading"
            variant="primary"
            loading
          />
          <IconButton size={size} icon={<SettingsIcon size={18} />} aria-label="Disabled" disabled />
        </div>
      ))}
    </div>
  );
}

export const AllVariantsAndSizes: Story = { render: () => <Grid /> };
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Grid />
    </ThemeMatrix>
  ),
};
