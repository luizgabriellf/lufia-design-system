import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ActionIcons } from "../../docs/placeholders";
import { DetailList } from "../DetailList";
import { Button } from "../Button";
import { DetailSectionCard } from "./DetailSectionCard";

const meta = {
  title: "Components/Data display/DetailSectionCard",
  component: DetailSectionCard,
  parameters: { layout: "padded" },
  args: {
    title: "Contact details",
    description: "Where we reach this person.",
    children: (
      <DetailList
        rows={[
          { label: "Email", value: "ada@example.com" },
          { label: "Phone", value: "+00 000 000 000", mono: true },
        ]}
      />
    ),
  },
  argTypes: { icon: { control: false }, action: { control: false }, children: { control: false } },
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 520px)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DetailSectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIconAndAction: Story = {
  args: { icon: <ActionIcons.Edit />, action: <Button size="sm">Edit</Button> },
};
export const TitleOnly: Story = { args: { description: undefined } };
export const LongContent: Story = {
  args: {
    title: "A long section title that wraps onto several lines on narrow screens without clipping",
    action: <Button size="sm">Edit details</Button>,
    description: "reference-0123456789-abcdefghijklmnopqrstuvwxyz-0123456789-abcdefghijklmnopqrstuvwxyz",
  },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <DetailSectionCard {...args} icon={<ActionIcons.Edit />} action={<Button size="sm">Edit</Button>} />
    </ThemeMatrix>
  ),
};
