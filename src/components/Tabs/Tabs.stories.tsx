import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { GridIcon, InboxIcon, UsersIcon } from "../../docs/demo";
import { Tabs, type TabsItem, type TabsProps } from "./Tabs";

const tabItems: TabsItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <GridIcon size={16} />,
    panel: <p>Totals and what changed.</p>,
  },
  { key: "work", label: "Work", icon: <InboxIcon size={16} />, panel: <p>What needs attention today.</p> },
  { key: "people", label: "People", icon: <UsersIcon size={16} />, panel: <p>Everyone on the team.</p> },
  { key: "reports", label: "Reports", panel: <p>Scheduled and ad hoc reports.</p> },
];

const linkItems: TabsItem[] = tabItems.map((item) => ({ ...item, panel: undefined, href: `#${item.key}` }));

const manyItems: TabsItem[] = Array.from({ length: 12 }, (_, index) => ({
  key: `section-${index}`,
  label: `Section number ${index + 1}`,
  panel: <p>Content of section {index + 1}.</p>,
}));

/** Holds the chosen key in state for the stories that show a URL-driven set, as a router would. */
function Linked(props: TabsProps) {
  const [value, setValue] = useState(props.value);
  return (
    <div
      onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest("a");
        if (!link) return;
        event.preventDefault();
        if (link.getAttribute("aria-disabled") !== "true") setValue(link.getAttribute("href")!.slice(1));
      }}
    >
      <Tabs {...props} value={value} />
    </div>
  );
}

const meta = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    activation: { control: "inline-radio", options: ["automatic", "manual"] },
  },
  args: { label: "Sections", items: tabItems },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 40rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Automatic activation: an arrow key focuses and chooses. */
export const Default: Story = {};
/** Arrow keys only browse; Enter or Space chooses. Use it when showing a panel is slow. */
export const ManualActivation: Story = { args: { activation: "manual" } };
export const Vertical: Story = { args: { orientation: "vertical" } };
export const DisabledTab: Story = {
  args: { items: tabItems.map((item) => (item.key === "work" ? { ...item, disabled: true } : item)) },
};
/** Panels of tabs that are not chosen stay in the DOM, hidden, so their state survives. */
export const KeepMounted: Story = {
  args: {
    keepMounted: true,
    items: tabItems.map((item) => ({ ...item, panel: <input aria-label={`${item.key} note`} /> })),
  },
};
export const Controlled: Story = {
  args: { value: "people" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Tabs {...args} value={value} onValueChange={setValue} />;
  },
};
/** When the tabs do not fit, the row scrolls sideways inside itself; the page does not widen. */
export const Overflow: Story = {
  args: { items: manyItems },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 20rem)" }}>
        <Story />
      </div>
    ),
  ],
};
/** Every item has an `href`: a `<nav>` of links through the provider's link component, the current one `aria-current="page"`. */
export const Links: Story = {
  args: { items: linkItems, value: "overview" },
  render: (args) => <Linked {...args} />,
};
export const LinksVertical: Story = {
  args: { items: linkItems, value: "work", orientation: "vertical" },
  render: (args) => <Linked {...args} />,
};
export const Phone320: Story = {
  args: { items: manyItems },
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
      <Tabs {...args} />
    </ThemeMatrix>
  ),
};
