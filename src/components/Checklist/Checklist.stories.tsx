import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Card } from "../Card";
import { Checklist, type ChecklistItem } from "./Checklist";

const items: ChecklistItem[] = [
  { key: "extinguisher", text: "Check the fire extinguisher inspection date", status: "done" },
  {
    key: "exits",
    text: "Clear the emergency exit route",
    status: "attention",
    hint: "Boxes were found in the corridor on the last visit",
  },
  { key: "signage", text: "Replace the faded safety signs" },
  { key: "log", text: "File the monthly inspection log", status: "todo", hint: "Due on the 30th" },
];

const statusLabels = { todo: "To do", done: "Done", attention: "Needs attention" };

const meta = {
  title: "Components/Data display/Checklist",
  component: Checklist,
  parameters: { layout: "padded" },
  args: { items, title: "Site inspection", statusLabels },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 30rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutTitle: Story = { args: { title: undefined, "aria-label": "Site inspection" } };
/** `density="sm"` tightens the rows for dense panels. */
export const Compact: Story = { args: { density: "sm" } };
export const AllDone: Story = {
  args: { items: items.map((item) => ({ ...item, status: "done" as const })) },
};
export const LongText: Story = {
  args: {
    items: [
      {
        key: "long",
        text: "A line of text that keeps going so it has to wrap onto several lines on a narrow screen without pushing the icon away",
        status: "attention",
        hint: "reference-0123456789-abcdefghijklmnopqrstuvwxyz-0123456789-abcdefghijklmnopqrstuvwxyz",
      },
      items[0]!,
    ],
  },
};
export const InsideCard: Story = {
  render: (args) => (
    <Card title="Before you leave">
      <Checklist {...args} title={undefined} aria-label="Before you leave" />
    </Card>
  ),
};
export const Empty: Story = { args: { items: [] } };
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "min(100%, 30rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <Checklist {...args} />
    </ThemeMatrix>
  ),
};
