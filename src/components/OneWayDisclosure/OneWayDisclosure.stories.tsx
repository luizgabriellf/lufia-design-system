import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { TextInput } from "../TextInput";
import { OneWayDisclosure } from "./OneWayDisclosure";

const form = (
  <form style={{ display: "grid", gap: 12 }}>
    <TextInput aria-label="Full name" />
    <TextInput aria-label="Email" type="email" />
    <Button type="submit" variant="primary">
      Save
    </Button>
  </form>
);

const meta = {
  title: "Components/Data display/OneWayDisclosure",
  component: OneWayDisclosure,
  parameters: { layout: "padded" },
  args: { trigger: "Fill in now", label: "Your details", children: form, variant: "primary" },
  argTypes: { variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] } },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 28rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OneWayDisclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Activating the button shows the form, hides the button and moves focus to the form. */
export const Default: Story = {};
/** Starts open: the content renders with no button and focus is not moved. */
export const OpenByDefault: Story = { args: { defaultOpen: true } };
export const Secondary: Story = { args: { variant: "secondary" } };
/** The app owns the state, so it can also close the content again; the button comes back. */
export const Controlled: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <OneWayDisclosure {...args} open={open} onOpenChange={setOpen}>
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0 }}>Nothing to fill in after all?</p>
          <Button onClick={() => setOpen(false)}>Hide again</Button>
        </div>
      </OneWayDisclosure>
    );
  },
};
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <OneWayDisclosure {...args} />
    </ThemeMatrix>
  ),
};
