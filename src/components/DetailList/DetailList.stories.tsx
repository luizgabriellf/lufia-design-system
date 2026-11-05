import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DetailList } from "./DetailList";

const rows = [
  { label: "Name", value: "Ada Example" },
  { label: "Role", value: "Team lead" },
  { label: "Identifier", value: "A-1042", mono: true },
  { label: "Start date", value: "2026-01-15", mono: true },
];

const meta = {
  title: "Components/DetailList",
  component: DetailList,
  parameters: { layout: "padded" },
  args: { rows },
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 480px)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DetailList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const RichValues: Story = {
  args: {
    rows: [
      { label: "Website", value: <a href="https://example.com">example.com</a> },
      { label: "Status", value: <strong>Active</strong> },
    ],
  },
};
export const LongLabel: Story = {
  args: {
    rows: [
      {
        label:
          "A very long label reused from a form control that would otherwise push every value out of the container",
        value: "Value",
      },
      { label: "Short", value: "reference-0123456789-abcdefghijklmnopqrstuvwxyz-0123456789" },
    ],
  },
};
export const Empty: Story = { args: { rows: [] } };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <DetailList {...args} />
    </ThemeMatrix>
  ),
};
