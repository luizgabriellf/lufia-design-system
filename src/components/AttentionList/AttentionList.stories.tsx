import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Card } from "../Card";
import { AttentionList, type AttentionGroup, type AttentionItem } from "./AttentionList";

const items: AttentionItem[] = [
  {
    id: "contract",
    tone: "danger",
    toneLabel: "Overdue",
    title: "Renew the supplier contract",
    meta: "3 days overdue",
    action: (
      <Button size="sm" variant="ghost">
        Open
      </Button>
    ),
  },
  {
    id: "draft",
    tone: "warning",
    toneLabel: "Due soon",
    title: "Review the draft report",
    meta: "Due tomorrow",
    action: (
      <Button size="sm" variant="ghost">
        Review
      </Button>
    ),
  },
  {
    id: "sync",
    tone: "info",
    toneLabel: "Info",
    title: "A new integration is ready to connect",
    meta: "Added today",
  },
  { id: "note", title: "Archive last quarter's files" },
];

const groups: AttentionGroup[] = [
  {
    id: "overdue",
    tone: "danger",
    label: "Overdue",
    items: [
      {
        id: "contract",
        title: "Renew the supplier contract",
        meta: "Deadline · 12 days ago",
        href: "#contract",
      },
      { id: "audit", title: "Submit the yearly audit", meta: "Deadline · 3 days ago", href: "#audit" },
    ],
  },
  {
    id: "to-resolve",
    tone: "warning",
    label: "To resolve",
    items: [
      { id: "draft", title: "Review the draft report", meta: "Deadline · in 5 days", href: "#draft" },
      { id: "people", title: "Accounts without an owner", count: "14", href: "#people" },
    ],
  },
];

const meta = {
  title: "Components/Data display/AttentionList",
  component: AttentionList,
  parameters: { layout: "padded" },
  args: { items, "aria-label": "Needs attention" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 34rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AttentionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleItem: Story = { args: { items: [items[0]!] } };
export const NoActions: Story = { args: { items: items.map((item) => ({ ...item, action: undefined })) } };
export const LongText: Story = {
  args: {
    items: [
      {
        id: "long",
        tone: "warning",
        toneLabel: "Due soon",
        title:
          "A title that keeps going so it has to wrap, and the action has to drop under it instead of overflowing",
        meta: "A long line of context that wraps as well on a narrow screen",
        action: <Button size="sm">Open</Button>,
      },
    ],
  },
};
/** `barStyle="inset"` draws the tone bar as a rounded pill set in from the card edge. */
export const InsetBar: Story = { args: { barStyle: "inset" } };
/** The inset is set per axis, falling back to `--lufia-attention-list-bar-inset`. */
export const InsetPerAxis: Story = {
  args: { barStyle: "inset" },
  decorators: [
    (Story) => (
      <div
        style={
          {
            "--lufia-attention-list-bar-inset-inline": "1rem",
            "--lufia-attention-list-bar-inset-block": "0.75rem",
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};
/** The bar width is a component token. */
export const ThickBar: Story = {
  args: { barStyle: "inset" },
  decorators: [
    (Story) => (
      <div style={{ "--lufia-attention-list-bar-width": "0.375rem" } as React.CSSProperties}>
        <Story />
      </div>
    ),
  ],
};
/** `groups` sorts rows under urgency headers on a neutral surface. Each row is one target with a chevron. */
export const Groups: Story = { args: { items: undefined, groups } };
/** Each row keeps a 44px target on a phone, and long copy wraps before the chevron. */
export const GroupsPhone320: Story = {
  args: {
    items: undefined,
    groups: [
      {
        ...groups[0]!,
        items: [
          {
            id: "long",
            title: "A title that keeps going so it has to wrap before it reaches the chevron at the end",
            meta: "A long line of context that wraps as well on a narrow screen",
            href: "#long",
          },
          ...groups[0]!.items,
        ],
      },
      groups[1]!,
    ],
  },
  globals: { viewport: { value: "w320", isRotated: false } },
};
/** The chevron and the rail mirror in a right-to-left layout. */
export const GroupsRightToLeft: Story = {
  args: { items: undefined, groups },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "min(100%, 34rem)" }}>
        <Story />
      </div>
    ),
  ],
};
/** Inside a flush `Card`, the groups span the card. */
export const GroupsInsideCard: Story = {
  args: { items: undefined, groups },
  render: (args) => (
    <Card title="Needs attention" flush divider>
      <AttentionList {...args} />
    </Card>
  ),
};
export const GroupsAllThemes: Story = {
  args: { items: undefined, groups },
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <AttentionList {...args} />
    </ThemeMatrix>
  ),
};
export const Empty: Story = { args: { items: [] } };
/** Inside a flush `Card`, the list spans the card and brings its own row padding. */
export const InsideCard: Story = {
  render: (args) => (
    <Card title="Needs attention" description="Decide on these first." flush>
      <AttentionList {...args} />
    </Card>
  ),
};
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "min(100%, 34rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <AttentionList {...args} />
    </ThemeMatrix>
  ),
};
