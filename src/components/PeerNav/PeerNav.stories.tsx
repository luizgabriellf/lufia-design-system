import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ChartIcon, GridIcon, InboxIcon, SettingsIcon, UsersIcon } from "../../docs/demo";
import { LufiaProvider } from "../LufiaProvider";
import { PeerNav, type PeerNavItem, type PeerNavProps } from "./PeerNav";

const tabItems: PeerNavItem[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Totals and what changed",
    icon: <GridIcon size={18} />,
  },
  { key: "work", label: "Work", description: "What needs attention today", icon: <InboxIcon size={18} /> },
  { key: "people", label: "People", description: "Everyone on the team", icon: <UsersIcon size={18} /> },
];

const linkItems: PeerNavItem[] = tabItems.map((item) => ({ ...item, href: `#${item.key}` }));

const manyItems: PeerNavItem[] = [
  ...linkItems,
  {
    key: "reports",
    label: "Reports",
    description: "Scheduled and ad hoc",
    icon: <ChartIcon size={18} />,
    href: "#reports",
  },
  {
    key: "settings",
    label: "Settings",
    description: "Preferences for this workspace",
    icon: <SettingsIcon size={18} />,
    href: "#settings",
  },
];

/** Keeps the chosen key in state so the stories behave like a router would. */
function Stateful(props: PeerNavProps<unknown>) {
  const [value, setValue] = useState(props.value);
  return (
    <PeerNav
      {...props}
      value={value}
      onValueChange={(key, event) => {
        event?.preventDefault();
        setValue(key);
      }}
    />
  );
}

const meta = {
  title: "Components/Navigation/PeerNav",
  component: PeerNav,
  parameters: { layout: "padded" },
  args: { label: "Dashboard views", items: linkItems, value: "overview" },
  render: (args) => <Stateful {...args} />,
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 61rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PeerNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every item has an `href`: a `<nav>` of links, the current one marked `aria-current="page"`. */
export const Links: Story = {};
/** An item without an `href` makes the whole set a tablist with arrow-key navigation. */
export const Tabs: Story = { args: { items: tabItems } };
/**
 * `href` can be any value the `linkComponent` on `LufiaProvider` accepts, such as a typed route object. The provider's link
 * receives it unchanged; this one turns it into a string.
 */
export const ObjectHref: Story = {
  args: {
    items: tabItems.map((item) => ({ ...item, href: { pathname: `/${item.key}` } })),
  },
  decorators: [
    (Story) => (
      <LufiaProvider
        linkComponent={({ href, children, ...rest }) => (
          <a {...rest} href={`#${(href as unknown as { pathname: string }).pathname}`}>
            {children}
          </a>
        )}
      >
        <Story />
      </LufiaProvider>
    ),
  ],
};
export const WithoutDescriptions: Story = {
  args: { items: linkItems.map((item) => ({ ...item, description: undefined })) },
};
export const WithoutIcons: Story = {
  args: { items: linkItems.map((item) => ({ ...item, icon: undefined })) },
};
export const TwoViews: Story = { args: { items: linkItems.slice(0, 2) } };
export const DisabledItem: Story = {
  args: { items: linkItems.map((item) => (item.key === "people" ? { ...item, disabled: true } : item)) },
};
/** Five or more items scroll instead of squeezing the labels, with a fade on the edge that hides more. */
export const ManyItems: Story = { args: { items: manyItems, value: "reports" } };
export const LongText: Story = {
  args: {
    items: linkItems.map((item) => ({
      ...item,
      label: `${item.label} with a considerably longer label`,
      description: `${item.description} and a description that is much too long to fit on one line`,
    })),
  },
};
/** `layout="scroll"` sizes each item to its label, so long labels stay on one line and the strip scrolls. */
export const LongLabelsScroll: Story = {
  args: {
    layout: "scroll",
    items: linkItems.map((item) => ({ ...item, label: `${item.label} with a considerably longer label` })),
  },
};
/** A word too long for its share of the row breaks inside the item instead of running into the next one. */
export const LongWordFit: Story = {
  args: {
    layout: "fit",
    items: linkItems.map((item) => ({ ...item, label: "Incomprehensibilities" })),
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "26rem" }}>
        <Story />
      </div>
    ),
  ],
};
export const Phone320: Story = {
  args: { items: manyItems.slice(0, 4) },
  globals: { viewport: { value: "w320", isRotated: false } },
};
/** Four items wrap into two rows of two on a phone, so each label keeps its width. */
export const PhoneTwoByTwo: Story = {
  args: { phoneGrid: "2x2" },
  globals: { viewport: { value: "w390", isRotated: false } },
};
/** The consuming theme sets the --lufia-peer-nav-* variables; here they are set on the nav. */
export const ThemedByVariables: Story = {
  args: {
    style: {
      "--lufia-peer-nav-max-inline-size": "61rem",
      "--lufia-peer-nav-radius": "0.875rem",
      "--lufia-peer-nav-item-radius": "0.625rem",
      "--lufia-peer-nav-label-size": "0.9rem",
      "--lufia-peer-nav-label-line-height": "1.25",
      "--lufia-peer-nav-description-size": "0.74rem",
      "--lufia-peer-nav-disabled-opacity": "0.5",
      "--lufia-peer-nav-focus-width": "2.5px",
    } as CSSProperties,
  },
};
export const Phone390: Story = { globals: { viewport: { value: "w390", isRotated: false } } };
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
      <Stateful {...args} />
    </ThemeMatrix>
  ),
};
export const AllThemesTabs: Story = {
  args: { items: tabItems },
  render: AllThemes.render,
};
