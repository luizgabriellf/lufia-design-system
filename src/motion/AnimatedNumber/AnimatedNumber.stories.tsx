import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { AnimatedNumber, type AnimatedNumberProps } from "./AnimatedNumber";
import { DemoButton } from "../../docs/demo";

const euros = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);

function Demo(args: AnimatedNumberProps) {
  const [value, setValue] = useState(args.value);
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
        <AnimatedNumber {...args} value={value} />
      </p>
      <DemoButton onClick={() => setValue(Math.round(Math.random() * 5000))}>Change value</DemoButton>
    </div>
  );
}

const meta = {
  title: "Motion/AnimatedNumber",
  component: AnimatedNumber,
  parameters: { layout: "padded" },
  args: { value: 1280 },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof AnimatedNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Formatted: Story = { args: { value: 1280.5, format: euros } };
export const Slow: Story = { args: { duration: 1500 } };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
    </ThemeMatrix>
  ),
};
