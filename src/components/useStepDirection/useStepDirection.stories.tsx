import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button";
import { useStepDirection } from "./useStepDirection";

function Demo() {
  const [step, setStep] = useState(0);
  const direction = useStepDirection(step);
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <p style={{ margin: 0 }}>
        Step {step + 1} of 4. Direction: <code>{direction ?? "undefined"}</code>
      </p>
      <p style={{ margin: 0, color: "var(--lufia-color-text-muted)" }} data-step-direction={direction}>
        The container would carry <code>data-step-direction=&quot;{direction ?? ""}&quot;</code>.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <Button disabled={step === 3} onClick={() => setStep((s) => s + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: "Components/useStepDirection",
  component: Demo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
