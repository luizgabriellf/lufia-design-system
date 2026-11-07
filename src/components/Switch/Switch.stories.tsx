import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Switch } from "./Switch";
import { SwitchInput } from "./SwitchInput";

const meta = {
  title: "Components/Forms/Switch",
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
/** The form-submitting variant: a native checkbox with `role="switch"`. The form owns the value; submit to read it. */
export const InForm: Story = {
  render: function Render(args) {
    const [submitted, setSubmitted] = useState<string>("(not submitted yet)");
    return (
      <form
        style={{ display: "grid", gap: "0.75rem" }}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <SwitchInput
          label={args.label}
          name="alerts"
          value="yes"
          defaultChecked
          hint="Read from the form on submit."
        />
        <SwitchInput label="Weekly digest" name="digest" />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
        <output>{submitted}</output>
      </form>
    );
  },
};
export const InputStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <SwitchInput label="Off" name="a" />
      <SwitchInput label="On" name="b" defaultChecked />
      <SwitchInput label="Invalid" name="c" error="Could not save." />
      <SwitchInput label="Disabled" name="d" disabled defaultChecked />
      <SwitchInput
        label="Send me an e-mail sempre que um colega me mencionar num comentário de qualquer projeto que eu siga"
        name="e"
        hint="O rótulo quebra junto ao interruptor em vez de o empurrar para fora do ecrã."
      />
    </div>
  ),
};
export const InputRightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  render: () => <SwitchInput label="On" name="a" defaultChecked hint="A hint" />,
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
      <SwitchInput label="Form switch, on" name="a" defaultChecked />
      <SwitchInput label="Form switch, off" name="b" />
      <SwitchInput label="Form switch, invalid" name="c" error="Could not save." />
    </ThemeMatrix>
  ),
};
