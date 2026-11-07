import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Link } from "../Link";
import { SectionHeader } from "./SectionHeader";

const meta = {
  title: "Components/Navigation/SectionHeader",
  component: SectionHeader,
  parameters: { layout: "padded" },
  args: { title: "Recent activity" },
  argTypes: { headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6] } },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: "The last five things that changed in this workspace." },
};
export const WithLink: Story = { args: { actions: <Link href="#all">View all</Link> } };
export const WithButtons: Story = {
  args: {
    description: "Filters apply to every figure below.",
    actions: (
      <>
        <Button size="sm" variant="secondary">
          Export
        </Button>
        <Button size="sm" variant="primary">
          Add
        </Button>
      </>
    ),
  },
};
export const LongTitle: Story = {
  args: {
    title: "A section title long enough to wrap onto several lines when the column is narrow",
    description: "And a description that wraps as well, without pushing the actions out of view.",
    actions: <Link href="#all">View all</Link>,
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 22rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const Phone320: Story = {
  args: WithButtons.args,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: WithLink.args,
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
      <SectionHeader {...args} description="Last five changes" actions={<Link href="#all">View all</Link>} />
    </ThemeMatrix>
  ),
};
