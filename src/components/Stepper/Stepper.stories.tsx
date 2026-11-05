import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Stepper } from "./Stepper";
import { DemoButton } from "../../docs/demo";

const steps = [
  { key: "details", label: "Details" },
  { key: "people", label: "People" },
  { key: "review", label: "Review" },
  { key: "confirm", label: "Confirm" },
];

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: { layout: "padded" },
  args: { steps, current: 1, onStepClick: () => {} },
  argTypes: { current: { control: { type: "number", min: 0, max: 3 } } },
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 560px)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FirstStep: Story = { args: { current: 0 } };
export const LastStep: Story = { args: { current: 3 } };
export const ReadOnly: Story = { args: { onStepClick: undefined } };
export const LongLabels: Story = {
  args: { steps: steps.map((s) => ({ ...s, label: `${s.label} with a considerably longer label` })) },
};
export const Mobile: Story = { globals: { viewport: { value: "w320", isRotated: false } } };

function Flow() {
  const [current, setCurrent] = useState(0);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Stepper steps={steps} current={current} onStepClick={setCurrent} />
      <div style={{ display: "flex", gap: 8 }}>
        <DemoButton disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Back
        </DemoButton>
        <DemoButton disabled={current === steps.length - 1} onClick={() => setCurrent((c) => c + 1)}>
          Next
        </DemoButton>
      </div>
    </div>
  );
}

export const Interactive: Story = { render: () => <Flow /> };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Stepper {...args} />
    </ThemeMatrix>
  ),
};
