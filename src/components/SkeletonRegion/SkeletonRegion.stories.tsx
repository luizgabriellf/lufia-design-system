import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Card } from "../Card";
import { SkeletonCard } from "../SkeletonCard";
import { SkeletonPageHeader } from "../SkeletonPageHeader";
import { SkeletonTable } from "../SkeletonTable";
import { SkeletonRegion } from "./SkeletonRegion";

const meta = {
  title: "Components/Feedback/SkeletonRegion",
  component: SkeletonRegion,
  parameters: { layout: "padded" },
  args: { label: "Loading invoices" },
  render: (args) => (
    <SkeletonRegion {...args} style={{ inlineSize: "min(100%, 48rem)" }}>
      <Card title="Invoices" flush>
        <div style={{ paddingInline: "1.25rem" }}>
          <SkeletonTable rows={5} columns={3} />
        </div>
      </Card>
    </SkeletonRegion>
  ),
} satisfies Meta<typeof SkeletonRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One region names the whole page while its header and cards load. */
export const WholePage: Story = {
  args: { label: "Loading the dashboard" },
  render: (args) => (
    <SkeletonRegion {...args} style={{ display: "grid", gap: "1.5rem", inlineSize: "min(100%, 48rem)" }}>
      <SkeletonPageHeader />
      <div
        style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))" }}
      >
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
    </SkeletonRegion>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <SkeletonRegion {...args}>
        <SkeletonCard lines={2} />
      </SkeletonRegion>
    </ThemeMatrix>
  ),
};
