import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { PlayIcon, PlusIcon, SearchIcon, SettingsIcon } from "../../docs/demo";
import { IconButton } from "./IconButton";

const VARIANTS = ["primary", "secondary", "ghost", "danger"] as const;

const meta = {
  title: "Components/Actions/IconButton",
  component: IconButton,
  parameters: { layout: "padded" },
  args: { icon: <SettingsIcon size={18} />, "aria-label": "Open settings" },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["default", "circle"] },
    tooltipPlacement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or focus it with the keyboard: the package tooltip shows the `title`, which defaults to the accessible name. */
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
export const TooltipBelow: Story = { args: { tooltipPlacement: "bottom" } };
export const NoTooltip: Story = { args: { tooltip: false } };

function Poster() {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        inlineSize: "min(100%, 22rem)",
        aspectRatio: "16 / 9",
        borderRadius: "var(--lufia-radius-card)",
        background:
          "linear-gradient(135deg, var(--lufia-color-accent-subtle), var(--lufia-color-bg-surface-raised))",
      }}
    >
      <IconButton
        size="xl"
        shape="circle"
        variant="primary"
        icon={<PlayIcon size={28} />}
        aria-label="Play video"
      />
    </div>
  );
}

/** `size="xl"` with `shape="circle"`: a 4rem round media control over a poster. */
export const MediaPlay: Story = { render: () => <Poster /> };
export const MediaPlayAllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Poster />
    </ThemeMatrix>
  ),
};
/** A theme sets `--lufia-icon-button-size` to resize every icon-only box at once. */
export const SizeHook: Story = {
  render: () => (
    <div style={{ "--lufia-icon-button-size": "3.5rem" } as React.CSSProperties}>
      <IconButton
        shape="circle"
        variant="secondary"
        icon={<SettingsIcon size={22} />}
        aria-label="Settings"
      />
    </div>
  ),
};

function Grid() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          {VARIANTS.map((variant) => (
            <IconButton
              key={variant}
              variant={variant}
              size={size}
              icon={<SettingsIcon size={size === "sm" ? 16 : size === "xl" ? 28 : 18} />}
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

/** A toggle: `aria-pressed` gives the accent subtle fill, border and text, apart from hover and rest. */
export const Pressed: Story = {
  args: { variant: "ghost", "aria-pressed": true, "aria-label": "Bold", icon: <PlusIcon size={18} /> },
};
export const PressedSecondary: Story = { args: { ...Pressed.args, variant: "secondary" } };
export const AllVariantsAndSizes: Story = { render: () => <Grid /> };
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Grid />
      <div style={{ display: "flex", gap: "0.5rem", marginBlockStart: "0.75rem" }}>
        <IconButton icon={<PlusIcon size={18} />} aria-label="Ghost off" aria-pressed={false} />
        <IconButton icon={<PlusIcon size={18} />} aria-label="Ghost on" aria-pressed />
        <IconButton
          icon={<PlusIcon size={18} />}
          aria-label="Secondary on"
          variant="secondary"
          aria-pressed
        />
      </div>
    </ThemeMatrix>
  ),
};
