import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Skeleton } from "./Skeleton";

function Card({ still }: { still?: boolean }) {
  return (
    <div aria-busy="true" style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 22rem)" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Skeleton variant="circle" width="2.5rem" still={still} />
        <div style={{ flex: 1, display: "grid", gap: "0.5rem" }}>
          <Skeleton width="60%" still={still} />
          <Skeleton width="40%" still={still} />
        </div>
      </div>
      <Skeleton variant="rect" height="6rem" still={still} label="Loading profile" />
    </div>
  );
}

const meta = {
  title: "Motion/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  args: { variant: "text", label: undefined },
  argTypes: { variant: { control: "inline-radio", options: ["text", "rect", "circle"] } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { args: { width: "16rem" } };
export const Rect: Story = { args: { variant: "rect", width: "16rem" } };
export const Circle: Story = { args: { variant: "circle" } };
export const Still: Story = { args: { width: "16rem", still: true } };
export const Composed: Story = { render: () => <Card /> };
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Card />
    </ThemeMatrix>
  ),
};
