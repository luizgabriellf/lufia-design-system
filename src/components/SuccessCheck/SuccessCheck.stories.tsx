import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { SuccessCheck } from "./SuccessCheck";

function Demo({ size }: { size: number }) {
  const [run, setRun] = useState(0);
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        color: "var(--lufia-color-status-success-fg)",
      }}
    >
      <SuccessCheck key={run} size={size} />
      <span style={{ color: "var(--lufia-color-text-default)" }}>Saved</span>
      <Button size="sm" onClick={() => setRun((n) => n + 1)}>
        Replay
      </Button>
    </div>
  );
}

const meta = {
  title: "Components/SuccessCheck",
  component: Demo,
  parameters: { layout: "padded" },
  args: { size: 16 },
  argTypes: { size: { control: { type: "number", min: 12, max: 64 } } },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { size: 48 } };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
    </ThemeMatrix>
  ),
};
