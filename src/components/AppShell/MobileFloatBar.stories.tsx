import type { Meta, StoryObj } from "@storybook/react-vite";
import { MenuIcon, PlusIcon, SearchIcon } from "../../docs/demo";
import { MobileFloatBar, MobileFloatBarButton, MobileFloatBarSeparator } from "./MobileFloatBar";

const meta = {
  title: "Components/Navigation/AppShell/MobileFloatBar",
  component: MobileFloatBar,
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 240 } } },
  args: { label: "Quick navigation", children: null },
  decorators: [
    (Story) => (
      <div style={{ blockSize: "14rem", padding: "1rem" }}>
        <p style={{ margin: 0 }}>The bar floats at the bottom edge of the screen.</p>
        <Story />
      </div>
    ),
  ],
  globals: { viewport: { value: "w390", isRotated: false } },
} satisfies Meta<typeof MobileFloatBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <MobileFloatBar {...args}>
      <MobileFloatBarButton label="Search…" icon={<SearchIcon size={18} />} />
      <MobileFloatBarSeparator />
      <MobileFloatBarButton variant="primary" label="New item" icon={<PlusIcon size={16} />} />
      <MobileFloatBarButton variant="icon" label="Menu" icon={<MenuIcon size={19} />} />
    </MobileFloatBar>
  ),
};

export const WithoutMainAction: Story = {
  render: (args) => (
    <MobileFloatBar {...args}>
      <MobileFloatBarButton label="Search…" icon={<SearchIcon size={18} />} />
      <MobileFloatBarSeparator />
      <MobileFloatBarButton variant="icon" label="Menu" icon={<MenuIcon size={19} />} />
    </MobileFloatBar>
  ),
};

export const LongActionName: Story = {
  render: (args) => (
    <MobileFloatBar {...args}>
      <MobileFloatBarButton label="Search…" icon={<SearchIcon size={18} />} />
      <MobileFloatBarSeparator />
      <MobileFloatBarButton
        variant="primary"
        label="Register a new delivery for the selected person"
        icon={<PlusIcon size={16} />}
      />
      <MobileFloatBarButton variant="icon" label="Menu" icon={<MenuIcon size={19} />} />
    </MobileFloatBar>
  ),
};

export const ActionAsLink: Story = {
  render: (args) => (
    <MobileFloatBar {...args}>
      <MobileFloatBarButton variant="primary" label="New item" icon={<PlusIcon size={16} />} href="#new" />
      <MobileFloatBarButton variant="icon" label="Menu" icon={<MenuIcon size={19} />} />
    </MobileFloatBar>
  ),
};

export const SmallPhone: Story = {
  ...Default,
  globals: { viewport: { value: "w320", isRotated: false } },
};

const longPage = (
  <div style={{ padding: "1rem", paddingBlockEnd: "7rem" }}>
    <h1 style={{ marginBlock: "0 1rem", fontSize: "1.25rem" }}>Recent activity</h1>
    {Array.from({ length: 14 }, (_, index) => (
      <article
        key={index}
        data-row={index}
        style={{
          marginBlockEnd: "0.75rem",
          padding: "1rem",
          border: "1px solid var(--lufia-color-border-subtle)",
          borderRadius: "var(--lufia-radius-card)",
          background: "var(--lufia-color-bg-surface)",
        }}
      >
        <strong>Item {index + 1}</strong>
        <p style={{ margin: "0.25rem 0 0", color: "var(--lufia-color-text-muted)" }}>
          Updated a few minutes ago, with a line long enough to wrap on a phone.
        </p>
      </article>
    ))}
  </div>
);

/**
 * The scrim (on by default): content scrolling under the bar fades into the canvas instead of ending in a hard edge, from
 * a little above the bar down through the safe area. It never takes a tap, and it moves with the bar when the keyboard
 * lifts it. Switch the colour mode in the toolbar to see it in dark.
 */
export const ScrimOverContent: Story = {
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: "100dvh", background: "var(--lufia-color-bg-canvas)" }}>
        {longPage}
        <Story />
      </div>
    ),
  ],
  parameters: { docs: { story: { inline: false, iframeHeight: 640 } } },
  render: (args) => (
    <MobileFloatBar {...args}>
      <MobileFloatBarButton label="Search…" icon={<SearchIcon size={18} />} />
      <MobileFloatBarSeparator />
      <MobileFloatBarButton variant="icon" label="Menu" icon={<MenuIcon size={19} />} />
    </MobileFloatBar>
  ),
};

/** `scrim={false}`: the bar floats over the page with nothing behind it. */
export const WithoutScrim: Story = {
  ...ScrimOverContent,
  args: { scrim: false },
};
