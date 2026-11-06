import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { PlusIcon } from "../../docs/demo";
import { PageHeader } from "../PageHeader";
import type { MoreActionItem } from "../MoreActions";
import { PageActions, type PageActionItem } from "./PageActions";

const primary: PageActionItem = { key: "new", label: "New report", icon: <PlusIcon size={16} /> };
const secondary: PageActionItem[] = [
  { key: "import", label: "Import" },
  { key: "share", label: "Share" },
];
const overflow: MoreActionItem[] = [
  { key: "export", label: "Export all" },
  { key: "del", label: "Delete all", tone: "danger" },
];

const meta = {
  title: "Components/PageActions",
  component: PageActions,
  parameters: { layout: "padded" },
  args: { primary, secondary, overflow, moreLabel: "More actions" },
  decorators: [
    (Story) => (
      <div style={{ minBlockSize: "14rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wide: primary and secondary buttons, plus the overflow menu. Narrow: the secondary actions join the menu. */
export const Default: Story = {};
export const PrimaryOnly: Story = { args: { secondary: [], overflow: [] } };
/** With no overflow items, the menu button appears only on narrow screens. */
export const SecondaryOnly: Story = { args: { overflow: [] } };
export const OverflowOnly: Story = { args: { secondary: [] } };
export const PrimaryAsLink: Story = { args: { primary: { ...primary, href: "#new" } } };
export const Disabled: Story = { args: { primary: { ...primary, disabled: true } } };
export const InPageHeader: Story = {
  render: (args) => (
    <PageHeader
      eyebrow="Reports"
      title="Quarterly overview"
      description="Totals for the period, grouped by team."
      actions={<PageActions {...args} />}
    />
  ),
};
export const Phone320: Story = {
  render: InPageHeader.render,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const Phone390: Story = {
  render: InPageHeader.render,
  globals: { viewport: { value: "w390", isRotated: false } },
};
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
      <PageActions {...args} />
    </ThemeMatrix>
  ),
};
