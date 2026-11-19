import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { CheckIcon, UsersIcon } from "../../docs/demo";
import { OptionRow } from "./OptionRow";

/** Stands in for a router link: an anchor that passes everything through. */
function DemoLink({ children, ...rest }: ComponentProps<"a">) {
  return <a {...rest}>{children}</a>;
}

const meta = {
  title: "Components/Forms/OptionRow",
  component: OptionRow,
  parameters: { layout: "padded" },
  args: {
    title: "Team plan",
    description: "Up to ten people, shared reports.",
    leading: <UsersIcon size={18} />,
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 30rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true, trailing: <CheckIcon size={18} /> } };
export const WithTrailingText: Story = { args: { trailing: "12 EUR / month" } };
export const TitleOnly: Story = { args: { description: undefined, leading: undefined } };
export const Disabled: Story = { args: { disabled: true } };
/** `render` swaps in an element of your own, such as a router link; `selected` then reads as `aria-current`. */
export const Rendered: Story = { args: { render: <DemoLink href="#plan" />, selected: true } };
export const LongText: Story = {
  args: {
    title: "A title that is far longer than the row can show on a single line without wrapping",
    description: "A description with unbroken_identifiers_that_wrap_instead_of_overflowing.",
    trailing: "A long trailing text",
  },
};

function Choice() {
  const [picked, setPicked] = useState("team");
  return (
    <ul style={{ display: "grid", gap: "0.5rem", margin: 0, padding: 0, listStyle: "none" }}>
      {[
        ["solo", "Solo plan", "One person."],
        ["team", "Team plan", "Up to ten people."],
        ["org", "Organisation plan", "Unlimited people."],
      ].map(([id, title, description]) => (
        <li key={id}>
          <OptionRow
            title={title}
            description={description}
            leading={<UsersIcon size={18} />}
            selected={picked === id}
            trailing={picked === id ? <CheckIcon size={18} /> : undefined}
            onClick={() => setPicked(id!)}
          />
        </li>
      ))}
    </ul>
  );
}
export const ChoiceList: Story = { render: () => <Choice /> };
export const Phone320: Story = {
  render: () => <Choice />,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  render: () => <Choice />,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <OptionRow
          title="Rest"
          description="Not chosen"
          leading={<UsersIcon size={18} />}
          onClick={() => {}}
        />
        <OptionRow
          title="Selected"
          description="Chosen"
          leading={<UsersIcon size={18} />}
          selected
          trailing={<CheckIcon size={18} />}
          onClick={() => {}}
        />
        <OptionRow title="Disabled" description="Unavailable" disabled onClick={() => {}} />
      </div>
    </ThemeMatrix>
  ),
};
