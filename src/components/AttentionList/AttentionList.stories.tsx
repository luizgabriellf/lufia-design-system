import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Card } from "../Card";
import { AttentionList, type AttentionItem } from "./AttentionList";

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
