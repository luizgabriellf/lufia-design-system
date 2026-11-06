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
