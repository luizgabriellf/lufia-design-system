import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Switch } from "./Switch";

const meta = {
  title: "Forms/Switch",
  component: Switch,
  parameters: { layout: "padded" },
  args: { label: "Email alerts" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 24rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const WithHint: Story = { args: { hint: "One message a day, at most.", defaultChecked: true } };
export const Invalid: Story = { args: { error: "Could not save the setting. Try again." } };
export const Disabled: Story = { args: { disabled: true, hint: "Managed by your administrator." } };
export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };
/** Controlled: the parent owns the state and can refuse a change, for example while a request is in flight. */
export const Controlled: Story = {
  render: (args) => {
    const [on, setOn] = useState(true);
    return (
      <Switch
        {...args}
        checked={on}
        onCheckedChange={setOn}
        hint={on ? "Alerts are on." : "Alerts are off."}
      />
    );
  },
};
export const LongText: Story = {
  args: {
    label: "Send me an e-mail whenever a colleague mentions me in a comment on any project I follow",
    hint: "The label wraps next to the switch instead of pushing it out of view.",
  },
};
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const RightToLeft: Story = {
  args: { defaultChecked: true, hint: "A hint" },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Switch {...args} defaultChecked />
      <Switch {...args} label="Off" />
      <Switch {...args} label="Invalid" error="Could not save." />
      <Switch {...args} label="Disabled" disabled defaultChecked />
    </ThemeMatrix>
  ),
};
