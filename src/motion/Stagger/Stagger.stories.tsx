import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../../components/Button";
import { Stagger, type StaggerProps } from "./Stagger";

const tile = {
  padding: "1rem",
  background: "var(--lufia-color-bg-surface)",
  border: "1px solid var(--lufia-color-border-subtle)",
  borderRadius: "var(--lufia-radius-card)",
} as const;

function Tiles({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} style={tile}>
      Tile {index + 1}
    </div>
  ));
}

/** Remounts the group so the entrance can be watched again. */
function Replay(args: StaggerProps & { count: number }) {
  const [run, setRun] = useState(0);
  const { count, ...rest } = args;
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Button size="sm" onClick={() => setRun(run + 1)} style={{ justifySelf: "start" }}>
        Replay
      </Button>
      <Stagger
        key={run}
        {...rest}
        style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))" }}
      >
        <Tiles count={count} />
      </Stagger>
    </div>
  );
}

const meta = {
  title: "Components/Motion/Stagger",
  component: Stagger,
  parameters: { layout: "padded" },
  args: { limit: 5 },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 40rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stagger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Replay {...args} count={6} /> };
/** Past the limit, children enter together with the last step, so the whole sequence stays short. */
export const LongList: Story = { render: (args) => <Replay {...args} count={20} /> };
export const LowLimit: Story = { args: { limit: 2 }, render: (args) => <Replay {...args} count={6} /> };
export const AsList: Story = {
  render: (args) => (
    <Stagger {...args} style={{ display: "grid", gap: "0.5rem" }}>
      <p style={tile}>First</p>
      <p style={tile}>Second</p>
      <p style={tile}>Third</p>
    </Stagger>
  ),
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Stagger {...args} style={{ display: "grid", gap: "0.5rem" }}>
        <div style={tile}>First</div>
        <div style={tile}>Second</div>
        <div style={tile}>Third</div>
      </Stagger>
    </ThemeMatrix>
  ),
};
