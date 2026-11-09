import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { QueueSummary, type QueueSummaryItem } from "./QueueSummary";

const queues: QueueSummaryItem[] = [
  { id: "review", label: "Awaiting review", count: 0, hint: "Items waiting for a decision", href: "#review" },
  {
    id: "overdue",
    label: "Overdue renewals",
    count: 7,
    tone: "danger",
    hint: "Past their date",
    href: "#overdue",
  },
  { id: "ready", label: "Ready to send", count: 0, hint: "Prepared and waiting", href: "#ready" },
  {
    id: "sign",
    label: "Awaiting signature",
    count: 3,
    tone: "warning",
    hint: "3 records · 2 people",
    href: "#sign",
  },
  { id: "low", label: "Below minimum", count: 0, hint: "Stock under the minimum", href: "#low" },
  {
    id: "tools",
    label: "Late returns",
    count: 1,
    tone: "warning",
    hint: "Loans out of time",
    href: "#tools",
  },
];

const shared = {
  clearLabel: (count: number) => `${count} ${count === 1 ? "queue" : "queues"} clear`,
  allClearTitle: "All caught up",
  allClearBody: "Nothing is waiting for you in this workspace.",
};

const meta = {
  title: "Components/Data display/QueueSummary",
  component: QueueSummary,
  parameters: { layout: "padded" },
  args: { ...shared, items: queues },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: "60rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QueueSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Mixed: Story = {};

export const AllClear: Story = {
  args: { items: queues.map((queue) => ({ ...queue, count: 0, tone: "neutral" })) },
};

export const ManyOpen: Story = {
  args: {
    items: queues.map((queue, index) => ({
      ...queue,
      count: index + 2,
      tone: index % 2 ? "warning" : "neutral",
    })),
  },
};

export const UnknownCount: Story = {
  args: {
    items: [
      ...queues.slice(0, 2),
      {
        id: "unknown",
        label: "Offline captures",
        count: null,
        hint: "Unavailable, open the queue",
        href: "#x",
      },
    ],
  },
};

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: "20rem" }}>
        <Story />
      </div>
    ),
  ],
};

export const Themes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <QueueSummary {...args} />
    </ThemeMatrix>
  ),
};
