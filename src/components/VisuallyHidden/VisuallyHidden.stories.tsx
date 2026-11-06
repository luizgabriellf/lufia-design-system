import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DemoButton } from "../../docs/demo";
import { VisuallyHidden } from "./VisuallyHidden";

const meta = {
  title: "Components/VisuallyHidden",
  component: VisuallyHidden,
  parameters: { layout: "padded" },
  args: { children: "Delete invoice 2041" },
  render: (args) => (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <DemoButton>
        <span aria-hidden="true">Delete</span>
        <VisuallyHidden {...args} />
      </DemoButton>
      <p style={{ margin: 0, color: "var(--lufia-color-text-muted)" }}>
        The button reads &ldquo;Delete invoice 2041&rdquo; to a screen reader and shows &ldquo;Delete&rdquo;.
      </p>
    </div>
  ),
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <DemoButton>
        <span aria-hidden="true">Delete</span>
        <VisuallyHidden {...args} />
      </DemoButton>
    </ThemeMatrix>
  ),
};
