import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { PlusIcon } from "../../docs/demo";
import { Button } from "../Button";
import { PageHeader } from "../PageHeader";
import { SkeletonPageHeader } from "./SkeletonPageHeader";

const meta = {
  title: "Components/Feedback/SkeletonPageHeader",
  component: SkeletonPageHeader,
  parameters: { layout: "padded" },
  args: { eyebrow: true, description: true, actions: 1 },
} satisfies Meta<typeof SkeletonPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { eyebrow: false, description: false, actions: 0 } };
export const TwoActions: Story = { args: { actions: 2 } };

/** Above the loaded header it stands for: same spacing, same title size at every breakpoint. */
export const AboveLoaded: Story = {
  render: (args) => (
    <div>
      <SkeletonPageHeader {...args} />
      <PageHeader
        headingLevel={2}
        eyebrow="Reports"
        title="Quarterly overview"
        description="Totals for the period, grouped by team."
        actions={
          <Button variant="primary" iconStart={<PlusIcon size={16} />}>
            New report
          </Button>
        }
      />
    </div>
  ),
};

/** The widths the overflow test checks. */
export const Widths: Story = {
  parameters: { layout: "fullscreen" },
  args: { actions: 2 },
  render: (args) => (
    <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
      {["100%", "18rem", "40rem"].map((width) => (
        <div key={width} style={{ inlineSize: `min(100%, ${width})` }} data-skeleton-host="">
          <SkeletonPageHeader {...args} />
        </div>
      ))}
    </div>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <SkeletonPageHeader {...args} still />
    </ThemeMatrix>
  ),
};
