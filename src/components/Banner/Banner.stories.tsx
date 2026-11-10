import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Collapse } from "../../motion/Collapse";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Link } from "../Link";
import { BANNER_VARIANTS, Banner, type BannerVariant } from "./Banner";

const TITLES: Record<BannerVariant, string> = {
  info: "Changes are saved as drafts",
  success: "Import finished",
  warning: "Access expires in 3 days",
  danger: "The last sync failed",
  neutral: "This record is archived",
};
const TEXT: Record<BannerVariant, string> = {
  info: "Publish the draft when you are ready for others to see it.",
  success: "All 128 rows were added to the list.",
  warning: "Renew it to keep editing without interruption.",
  danger: "Some changes were not sent. Try again, or contact support if it keeps happening.",
  neutral: "It is read-only until it is restored.",
};

const meta = {
  title: "Components/Feedback/Banner",
  component: Banner,
  parameters: { layout: "padded" },
  args: { variant: "info", title: TITLES.info, children: TEXT.info },
  argTypes: {
    variant: { control: "inline-radio", options: BANNER_VARIANTS },
    size: { control: "inline-radio", options: ["md", "compact"] },
    live: { control: "inline-radio", options: [undefined, "polite", "assertive", "off"] },
    icon: { control: false },
    action: { control: false },
    onDismiss: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 44rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every variant with a title and a description. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {BANNER_VARIANTS.map((variant) => (
        <Banner key={variant} variant={variant} title={TITLES[variant]}>
          {TEXT[variant]}
        </Banner>
      ))}
    </div>
  ),
};

export const WithoutTitle: Story = { args: { title: undefined, children: TEXT.info } };
export const TitleOnly: Story = { args: { children: undefined } };

export const WithAction: Story = {
  args: {
    variant: "warning",
    title: TITLES.warning,
    children: TEXT.warning,
    action: (
      <>
        <Button size="sm" variant="primary">
          Renew access
        </Button>
        <Link href="#details">Details</Link>
      </>
    ),
  },
};

/** The dismiss button is named by `dismissLabel`; the banner collapses by composing `Collapse`. */
export const Dismissible: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <Collapse open={open}>
          <Banner {...args} onDismiss={() => setOpen(false)} dismissLabel="Dismiss message" />
        </Collapse>
        {open ? null : <Button onClick={() => setOpen(true)}>Show the banner again</Button>}
      </div>
    );
  },
};

export const DismissibleWithAction: Story = {
  args: {
    variant: "danger",
    title: TITLES.danger,
    children: TEXT.danger,
    action: <Button size="sm">Try again</Button>,
    onDismiss: () => {},
    dismissLabel: "Dismiss message",
  },
};

export const Compact: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {BANNER_VARIANTS.map((variant) => (
        <Banner key={variant} variant={variant} size="compact">
          {TEXT[variant]}
        </Banner>
      ))}
      <Banner
        size="compact"
        variant="warning"
        title={TITLES.warning}
        action={<Link href="#details">Details</Link>}
        onDismiss={() => {}}
        dismissLabel="Dismiss message"
      >
        {TEXT.warning}
      </Banner>
    </div>
  ),
};

export const CustomIcon: Story = {
  args: { icon: <span style={{ fontSize: "1.25rem" }}>#</span>, variant: "neutral", children: TEXT.neutral },
};
export const NoIcon: Story = { args: { icon: null, title: "Heads up: read this before you continue" } };

/** Long text wraps and long unbroken words break; nothing paints past the banner. */
export const LongText: Story = {
  args: {
    variant: "warning",
    title: "A title that runs on for much longer than the room it has been given so it has to wrap",
    children:
      "https://example.com/a/very/long/path/that/has/no/break/opportunity/at/all/0123456789/abcdefghijklmnopqrstuvwxyz " +
      "followed by a sentence that explains what happened, why it matters and what the person can do about it next.",
    action: (
      <>
        <Button size="sm" variant="primary">
          Primary next step
        </Button>
        <Button size="sm">Secondary</Button>
      </>
    ),
    onDismiss: () => {},
    dismissLabel: "Dismiss message",
  },
};

/** At 320px the actions stack below the text. */
export const Narrow: Story = {
  ...LongText,
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "20rem" }}>
        <Story />
      </div>
    ),
  ],
};

/** The enter motion (`animateIn`) plays on mount; it is off under reduced motion. */
export const AnimatedIn: Story = { args: { animateIn: true } };

export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {BANNER_VARIANTS.map((variant) => (
          <Banner
            key={variant}
            variant={variant}
            title={TITLES[variant]}
            action={<Link href="#details">Details</Link>}
            onDismiss={() => {}}
            dismissLabel="Dismiss message"
          >
            {TEXT[variant]}
          </Banner>
        ))}
      </div>
    </ThemeMatrix>
  ),
};

/** The component tokens a theme can set. */
export const ThemedByTokens: Story = {
  render: () => (
    <div
      style={
        {
          "--lufia-banner-radius": "0",
          "--lufia-banner-border-width": "2px",
          "--lufia-banner-padding-block": "1rem",
        } as React.CSSProperties
      }
    >
      <Banner variant="success" title={TITLES.success}>
        {TEXT.success}
      </Banner>
    </div>
  ),
};
