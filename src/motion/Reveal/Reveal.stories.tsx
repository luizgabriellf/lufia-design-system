import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Reveal, type RevealProps } from "./Reveal";
import { DemoButton } from "../../docs/demo";

const card = {
  padding: "1rem",
  background: "var(--lufia-color-bg-surface)",
  border: "1px solid var(--lufia-color-border-subtle)",
  borderRadius: "var(--lufia-radius-card)",
} as const;

function Demo(args: RevealProps) {
  const [show, setShow] = useState(args.show);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 22rem)" }}>
      <DemoButton aria-expanded={show} onClick={() => setShow(!show)}>
        {show ? "Hide" : "Show"} details
      </DemoButton>
      <div style={{ minBlockSize: "5rem" }}>
        <Reveal {...args} show={show}>
          <div style={card}>Your changes were saved. This panel enters in 240 ms and leaves in 160 ms.</div>
        </Reveal>
      </div>
    </div>
  );
}

const meta = {
  title: "Motion/Reveal",
  component: Reveal,
  parameters: { layout: "padded" },
  args: { show: true, variant: "rise", appear: false },
  argTypes: { variant: { control: "inline-radio", options: ["fade", "rise", "scale"] } },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof Reveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Fade: Story = { args: { variant: "fade" } };
export const Scale: Story = { args: { variant: "scale" } };
export const StartsHidden: Story = { args: { show: false } };
export const AppearsOnMount: Story = { args: { appear: true } };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
    </ThemeMatrix>
  ),
};
