import type { ComponentProps, CSSProperties } from "react";
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
/** Stands in for a router link that takes more than `href`. */
function LocaleLink({ locale, children, ...rest }: ComponentProps<"a"> & { locale: string }) {
  return (
    <a {...rest} hrefLang={locale}>
      {children}
    </a>
  );
}
/** `render` swaps in an element of your own, for a link the provider's link component cannot express. */
export const Rendered: Story = {
  args: {
    variant: "primary",
    render: <LocaleLink href="#destination" locale="en" />,
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

/** What a theme sets to give buttons a richer surface: demo values built from the shared tokens. */
const THEMED_SURFACE = {
  "--lufia-button-primary-bg":
    "linear-gradient(135deg, var(--lufia-color-accent-default), var(--lufia-color-accent-hover))",
  "--lufia-button-primary-bg-hover":
    "linear-gradient(135deg, var(--lufia-color-accent-hover), var(--lufia-color-accent-default))",
  "--lufia-button-primary-border": "var(--lufia-color-accent-hover)",
  "--lufia-button-primary-shadow": "var(--lufia-shadow-sm)",
  "--lufia-button-primary-shadow-hover": "var(--lufia-shadow-lg)",
  "--lufia-button-secondary-shadow": "var(--lufia-shadow-sm)",
  "--lufia-button-secondary-shadow-hover": "var(--lufia-shadow-md)",
  "--lufia-button-hover-lift": "2px",
} as CSSProperties;

function ThemedSurfaceGrid() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {(["light", "dark"] as const).map((mode) => (
        <section
          key={mode}
          data-lufia-theme="default"
          data-lufia-mode={mode}
          aria-label={`Themed surface, ${mode}`}
          style={{
            ...THEMED_SURFACE,
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            padding: "1.5rem",
            background: "var(--lufia-color-bg-canvas)",
            color: "var(--lufia-color-text-default)",
          }}
        >
          <Button variant="primary">Primary {mode}</Button>
          <Button variant="secondary">Secondary {mode}</Button>
          <Button variant="primary" disabled>
            Disabled {mode}
          </Button>
        </section>
      ))}
    </div>
  );
}

/**
 * A theme that sets a gradient fill, a border, elevation and a hover lift through the `--lufia-button-*` hooks. The
 * border has its own hook because a gradient is not a valid border colour; the lift applies only where a pointer can
 * hover, and is dropped for disabled buttons and under reduced motion.
 */
export const ThemedSurface: Story = { render: () => <ThemedSurfaceGrid /> };
