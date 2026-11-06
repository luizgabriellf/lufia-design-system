import type { Meta, StoryObj } from "@storybook/react-vite";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

function Readout() {
  const reduced = usePrefersReducedMotion();
  return (
    <p role="status" style={{ margin: 0 }}>
      prefers-reduced-motion: <strong>{reduced ? "reduce" : "no-preference"}</strong>
    </p>
  );
}

const meta = {
  title: "Hooks/usePrefersReducedMotion",
  component: Readout,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Readout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Toggle "Emulate CSS media feature prefers-reduced-motion" in the browser devtools to watch it change. */
export const Default: Story = {};
