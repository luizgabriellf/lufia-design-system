import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { Stepper } from "./Stepper";

const steps = [
  { key: "details", label: "Details" },
  { key: "people", label: "People" },
  { key: "review", label: "Review" },
  { key: "confirm", label: "Confirm" },
];

const meta = {
  title: "Components/Navigation/Stepper",
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
        <Button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Back
        </Button>
        <Button disabled={current === steps.length - 1} onClick={() => setCurrent((c) => c + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export const Interactive: Story = { render: () => <Flow /> };

function InModal() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New request"
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        <p style={{ margin: "0 0 1rem" }}>Scroll the dialog: the step dots pass under the sticky header.</p>
        <div style={{ blockSize: "6rem" }} />
        <Stepper steps={steps} current={2} onStepClick={() => {}} data-testid="stepper-in-modal" />
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>
            Step content line {i + 1}. Long enough to make the dialog scroll, so its header sticks over the
            stepper.
          </p>
        ))}
      </Modal>
    </>
  );
}

/**
 * A stepper inside a modal whose panel scrolls. The step list is its own stacking context, so the dots (lifted above the
 * connector) never paint over the modal's sticky header.
 */
export const InScrolledModal: Story = {
  render: () => <InModal />,
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const panel = doc.querySelector<HTMLElement>('[data-lufia-part="panel"]');
    const stepper = doc.querySelector<HTMLElement>('[data-testid="stepper-in-modal"]');
    const header = doc.querySelector<HTMLElement>('[data-lufia-part="header"]');
    if (!panel || !stepper || !header) return;
    // Put the step dots right under the sticky header.
    const offset = stepper.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    panel.scrollTop += offset + 12;
  },
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Stepper {...args} />
    </ThemeMatrix>
  ),
};
