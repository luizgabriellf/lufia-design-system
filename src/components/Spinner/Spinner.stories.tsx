import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Spinner } from "./Spinner";

const meta = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  parameters: { layout: "padded" },
  args: { size: "md", label: "Loading" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Spinner {...args} size="sm" label="Small" />
      <Spinner {...args} size="md" label="Medium" />
      <Spinner {...args} size="lg" label="Large" />
    </div>
  ),
};

/** Without a `label` the spinner is `aria-hidden`: the line of text beside it carries the meaning. */
export const Decorative: Story = {
  args: { label: undefined },
  render: (args) => (
    <p style={{ display: "flex", gap: 8, alignItems: "center", margin: 0 }}>
      <Spinner {...args} size="sm" />
      Loading projects…
    </p>
  ),
};

/** The ring takes the colour of the text around it. */
export const InheritsColour: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <span style={{ color: "var(--lufia-color-text-muted)" }}>
        <Spinner {...args} label="Muted" />
      </span>
      <span style={{ color: "var(--lufia-color-text-accent)" }}>
        <Spinner {...args} label="Accent" />
      </span>
      <span style={{ color: "var(--lufia-color-status-danger-fg)" }}>
        <Spinner {...args} label="Danger" />
      </span>
    </div>
  ),
};

export const InAButton: Story = {
  render: () => (
    <Button variant="secondary" aria-busy="true">
      <Spinner size="sm" /> Saving
    </Button>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", color: "var(--lufia-color-text-default)" }}
      >
        <Spinner {...args} size="sm" />
        <Spinner {...args} />
        <Spinner {...args} size="lg" />
      </div>
    </ThemeMatrix>
  ),
};
