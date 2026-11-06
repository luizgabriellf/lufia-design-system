import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ChangeHighlight, type ChangeHighlightProps } from "./ChangeHighlight";

const STATUSES = ["Pending", "Shipped", "Delivered"];

function Demo(args: ChangeHighlightProps) {
  const [index, setIndex] = useState(0);
  const status = STATUSES[index % STATUSES.length];
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <p style={{ margin: 0 }}>
        Order status:{" "}
        <ChangeHighlight {...args} value={status}>
          <strong>{status}</strong>
        </ChangeHighlight>
      </p>
      <button type="button" onClick={() => setIndex(index + 1)}>
        Advance status
      </button>
    </div>
  );
}

const meta = {
  title: "Motion/ChangeHighlight",
  component: ChangeHighlight,
  parameters: { layout: "padded" },
  args: { value: "Pending" },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof ChangeHighlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
    </ThemeMatrix>
  ),
};
