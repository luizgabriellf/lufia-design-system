import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Card } from "../Card";
import { SkeletonTable } from "./SkeletonTable";

const meta = {
  title: "Components/Feedback/SkeletonTable",
  component: SkeletonTable,
  parameters: { layout: "padded" },
  args: { rows: 5, columns: 3 },
} satisfies Meta<typeof SkeletonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** In a flush card, the usual home of a table. */
export const InACard: Story = {
  render: (args) => (
    <div aria-busy="true" style={{ inlineSize: "min(100%, 48rem)" }}>
      <Card title="Invoices" flush>
        <div style={{ paddingInline: "1.25rem" }}>
          <SkeletonTable {...args} />
        </div>
      </Card>
    </div>
  ),
};

/** Six columns in a 30rem box: still nothing overflows. With `stackBelow="20rem"` the rows keep their columns. */
export const ManyColumns: Story = {
  args: { columns: 6, rows: 3, stackBelow: "20rem" },
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 30rem)", border: "1px dashed var(--lufia-color-border-strong)" }}>
      <SkeletonTable {...args} />
    </div>
  ),
};

/** Every width the overflow test checks: a narrow box stacks, a wide one keeps the columns. */
export const Widths: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div style={{ display: "grid", gap: "1.5rem", padding: "1rem" }}>
      {["100%", "20rem", "40rem", "60rem"].map((width) => (
        <div key={width} style={{ inlineSize: `min(100%, ${width})` }} data-skeleton-host="">
          <SkeletonTable {...args} columns={4} />
        </div>
      ))}
    </div>
  ),
};

export const Still: Story = { args: { still: true } };

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <SkeletonTable {...args} rows={3} still />
    </ThemeMatrix>
  ),
};
