import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../../components/Button";
import { Collapse, type CollapseProps } from "./Collapse";

function Demo({ open: initial, children }: CollapseProps) {
  const [open, setOpen] = useState(initial);
  const id = useId();
  return (
    <div
      style={{
        inlineSize: "min(100%, 24rem)",
        border: "1px solid var(--lufia-color-border-subtle)",
        borderRadius: "var(--lufia-radius-card)",
      }}
    >
      <Button
        variant="ghost"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        style={{ inlineSize: "100%", justifyContent: "flex-start", borderRadius: 0 }}
      >
        Shipping details
      </Button>
      <Collapse id={id} open={open}>
        <div style={{ padding: "0 1rem 1rem" }}>{children}</div>
      </Collapse>
    </div>
  );
}

const meta = {
  title: "Motion/Collapse",
  component: Collapse,
  parameters: { layout: "padded" },
  args: {
    open: false,
    children: (
      <>
        <p style={{ marginBlock: "0 0.5rem" }}>
          Orders ship within two working days. Height is never measured in JavaScript.
        </p>
        <a href="#details">Tracking</a>
      </>
    ),
  },
  render: (args) => <Demo {...args} />,
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { open: true } };
export const LongContent: Story = {
  args: {
    open: true,
    children: Array.from({ length: 12 }, (_, i) => (
      <p key={i} style={{ marginBlock: "0 0.5rem" }}>
        Paragraph {i + 1}: a long, unpredictable amount of content that reaches its natural height.
      </p>
    )),
  },
};
export const AllThemes: Story = {
  args: { open: true },
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} />
    </ThemeMatrix>
  ),
};
