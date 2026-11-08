import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Card } from "../Card";
import { SkeletonCard } from "./SkeletonCard";

const meta = {
  title: "Components/Feedback/SkeletonCard",
  component: SkeletonCard,
  parameters: { layout: "padded" },
  args: { header: true, lines: 3, block: false },
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 22rem)" }}>
      <SkeletonCard {...args} />
    </div>
  ),
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithBlock: Story = { args: { block: true } };
export const BlockOnly: Story = { args: { header: false, lines: 0, block: "10rem" } };

/** Next to the loaded card it stands for: the padding box and the line boxes match. */
export const BesideLoaded: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
        gap: "1rem",
        alignItems: "start",
        inlineSize: "min(100%, 40rem)",
      }}
    >
      <SkeletonCard {...args} lines={2} />
      <Card title="Storage">
        14.2 of 20 GB used across every project in the workspace, with room for the next import.
      </Card>
    </div>
  ),
};

/** Every padding: the bars follow the card's own padding token. */
export const Paddings: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "1rem", inlineSize: "min(100%, 22rem)" }}>
      {(["sm", "md", "lg"] as const).map((padding) => (
        <SkeletonCard key={padding} {...args} padding={padding} />
      ))}
    </div>
  ),
};

/** The widths the overflow test checks. */
export const Widths: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
      {["100%", "16rem", "30rem"].map((width) => (
        <div key={width} style={{ inlineSize: `min(100%, ${width})` }} data-skeleton-host="">
          <SkeletonCard {...args} block />
        </div>
      ))}
    </div>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <div style={{ inlineSize: "min(100%, 20rem)" }}>
        <SkeletonCard {...args} block still />
      </div>
    </ThemeMatrix>
  ),
};
