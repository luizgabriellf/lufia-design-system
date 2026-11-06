import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { PlusIcon } from "../../docs/demo";
import { Button } from "../Button";
import { PageHeader } from "./PageHeader";

const actions = (
  <Button variant="primary" iconStart={<PlusIcon size={16} />}>
    New report
  </Button>
);

const meta = {
  title: "Components/Navigation/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  args: {
    eyebrow: "Reports",
    title: "Quarterly overview",
    description: "Totals for the period, grouped by team, with the changes since last quarter.",
    actions,
  },
  argTypes: { headingLevel: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] } },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { eyebrow: undefined, description: undefined, actions: undefined } };
export const WithoutActions: Story = { args: { actions: undefined } };
export const WithoutEyebrow: Story = { args: { eyebrow: undefined } };
export const SectionHeading: Story = { args: { headingLevel: 2 } };
export const LongText: Story = {
  args: {
    title:
      "A page title that is long enough to need several lines on a narrow screen without breaking the layout",
    description:
      "A description that runs on for a while so that the text column has to wrap and the actions move below it when there is no more room to keep them on the same row.",
  },
};
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
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
      <PageHeader {...args} />
    </ThemeMatrix>
  ),
};
