import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Card } from "../Card";
import { ActivityList, type ActivityItem } from "./ActivityList";

const items: ActivityItem[] = [
  {
    id: "published",
    title: "Quarterly report published",
    meta: "By Ana Costa",
    time: "2 h ago",
    dateTime: "2026-03-12T10:00:00Z",
    tone: "success",
  },
  {
    id: "failed",
    title: "Export to the archive failed",
    meta: "Timed out after 60 s",
    time: "Yesterday",
    tone: "danger",
    toneLabel: "Failed",
    action: (
      <Button size="sm" variant="ghost">
        Retry
      </Button>
    ),
  },
  { id: "comment", title: "Rui Alves commented on the budget", time: "10 Mar", tone: "info" },
  { id: "created", title: "Workspace created", time: "2 Mar" },
];

const meta = {
  title: "Components/Data display/ActivityList",
  component: ActivityList,
  parameters: { layout: "padded" },
  args: { items, "aria-label": "Recent activity" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 34rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Timeline: Story = { args: { timeline: true } };
export const SingleEntry: Story = { args: { items: [items[0]!], timeline: true } };
export const LongText: Story = {
  args: {
    timeline: true,
    items: [
      {
        id: "long",
        title:
          "An entry whose title is long enough that it has to wrap onto several lines in a narrow column",
        meta: "And a line of context that wraps too",
        time: "2 h ago",
        action: <Button size="sm">Open</Button>,
      },
      { id: "short", title: "Short", time: "1 d ago" },
    ],
  },
};
export const Empty: Story = { args: { items: [] } };
export const InsideCard: Story = {
  render: (args) => (
    <Card title="Recent activity" flush>
      <ActivityList {...args} timeline />
    </Card>
  ),
};
export const Phone320: Story = {
  args: { timeline: true },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { timeline: true },
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
      <ActivityList {...args} timeline />
    </ThemeMatrix>
  ),
};
