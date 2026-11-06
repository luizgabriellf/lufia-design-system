import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DemoBrand,
  DemoFooter,
  DemoPage,
  DemoShell,
  demoGroups,
  demoLabels,
} from "../../docs/demo/AppShellDemo";
import { AppShell } from "./AppShell";

const meta = {
  title: "Components/Navigation/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, iframeHeight: 640 } },
  },
  args: { groups: demoGroups, labels: demoLabels, children: null },
  render: (args) => <DemoShell {...args} />,
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wide screens: the sidebar with its groups. Choose items to move the current page. */
export const Desktop: Story = {
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** The sidebar as a rail: icons only, names kept for assistive technology, tooltips from `title`. */
export const Rail: Story = {
  args: { defaultCollapsed: true },
  globals: { viewport: { value: "w1440", isRotated: false } },
};

export const GroupOpenOnArrival: Story = {
  render: (args) => <DemoShell {...args} initialPath="/insights/trends" />,
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** Phones: the top bar, the floating bar above the safe area and, behind the menu button, the navigation sheet. */
export const Phone: Story = {
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const SmallPhone: Story = {
  globals: { viewport: { value: "w320", isRotated: false } },
};

export const Tablet: Story = {
  globals: { viewport: { value: "w768", isRotated: false } },
};

/** The floating bar without a main action: search and the menu. */
export const PhoneWithoutPrimaryAction: Story = {
  args: { primaryAction: undefined },
  globals: { viewport: { value: "w390", isRotated: false } },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  globals: { viewport: { value: "w1440", isRotated: false } },
};

/** Fully custom slots and a page of your own. */
export const CustomSlots: Story = {
  render: (args) => (
    <DemoShell
      {...args}
      brand={({ collapsed }) => <DemoBrand collapsed={collapsed} />}
      footer={({ collapsed }) => <DemoFooter collapsed={collapsed} />}
      groups={demoGroups.slice(0, 1)}
    >
      <DemoPage title="One group, no search" />
    </DemoShell>
  ),
  args: { search: undefined },
  globals: { viewport: { value: "w1440", isRotated: false } },
};
