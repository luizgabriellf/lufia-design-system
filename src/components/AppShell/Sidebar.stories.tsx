import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DemoBrand, DemoFooter } from "../../docs/demo/AppShellDemo";
import { HomeIcon, InboxIcon, SettingsIcon, UsersIcon } from "../../docs/demo";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";

const meta = {
  title: "Components/AppShell/Sidebar",
  component: Sidebar,
  parameters: { layout: "padded" },
  args: {
    label: "Main navigation",
    collapseLabel: "Collapse sidebar",
    expandLabel: "Expand sidebar",
    children: null,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          blockSize: "34rem",
          inlineSize: "17rem",
          border: "1px solid var(--lufia-color-border-subtle)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Composed({ startCollapsed = false }: { startCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  return (
    <Sidebar
      label="Main navigation"
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      collapseLabel="Collapse sidebar"
      expandLabel="Expand sidebar"
      header={<DemoBrand collapsed={collapsed} />}
      footer={<DemoFooter collapsed={collapsed} />}
    >
      <SidebarGroup label="Workspace">
        <SidebarItem label="Overview" href="#overview" icon={<HomeIcon size={18} />} active />
        <SidebarItem label="Inbox" href="#inbox" icon={<InboxIcon size={18} />} badge={3} />
        <SidebarItem label="People" href="#people" icon={<UsersIcon size={18} />} />
        <SidebarItem label="Archive (soon)" icon={<InboxIcon size={18} />} disabled />
      </SidebarGroup>
      <SidebarGroup label="Admin" icon={<SettingsIcon size={18} />} collapsible defaultOpen={false}>
        <SidebarItem label="Settings" href="#settings" icon={<SettingsIcon size={18} />} />
        <SidebarItem label="Billing" href="#billing" icon={<SettingsIcon size={18} />} />
      </SidebarGroup>
    </Sidebar>
  );
}

export const Composition: Story = { render: () => <Composed /> };
export const Rail: Story = {
  render: () => <Composed startCollapsed />,
  decorators: [
    (Story) => (
      <div
        style={{
          blockSize: "34rem",
          inlineSize: "4.75rem",
          border: "1px solid var(--lufia-color-border-subtle)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export const ItemStates: Story = {
  render: () => (
    <Sidebar label="States">
      <SidebarGroup label="States">
        <SidebarItem label="Default" href="#a" icon={<HomeIcon size={18} />} />
        <SidebarItem label="Current page" href="#b" icon={<HomeIcon size={18} />} active />
        <SidebarItem label="Heading to (pending)" href="#c" icon={<HomeIcon size={18} />} highlighted />
        <SidebarItem label="Button item" icon={<HomeIcon size={18} />} onClick={() => {}} />
        <SidebarItem label="Disabled" href="#d" icon={<HomeIcon size={18} />} disabled />
        <SidebarItem label="With a badge" href="#e" icon={<InboxIcon size={18} />} badge={12} />
        <SidebarItem
          label="A label that is far too long to fit on one line of the sidebar"
          href="#f"
          icon={<HomeIcon size={18} />}
        />
      </SidebarGroup>
    </Sidebar>
  ),
};
