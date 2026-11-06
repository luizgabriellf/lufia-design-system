import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DocumentIcon, UsersIcon } from "../../docs/demo";
import { NavRow } from "./NavRow";

const meta = {
  title: "Components/Navigation/NavRow",
  component: NavRow,
  parameters: { layout: "padded" },
  args: {
    title: "Team members",
    description: "Invite people and manage their roles.",
    meta: "Updated 2 days ago",
    icon: <UsersIcon size={18} />,
    badge: 12,
    href: "#members",
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 30rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** With an `href` the row is a link. */
export const AsLink: Story = {};
/** With `onClick` and no `href` it is a button. */
export const AsButton: Story = { args: { href: undefined, onClick: () => {} } };
/** With neither it is a plain block: no chevron, nothing to activate. */
export const Static: Story = { args: { href: undefined } };
export const TitleOnly: Story = {
  args: { description: undefined, meta: undefined, badge: undefined, icon: undefined },
};
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = {
  args: {
    title: "A title that is far longer than the row can show on a single line without wrapping",
    description:
      "A description that keeps going to prove that long words and unbroken_identifiers_wrap_instead_of_overflowing.",
    meta: "Last changed by someone with a very long name on a date",
  },
};
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const InAList: Story = {
  render: () => (
    <ul style={{ display: "grid", gap: "0.5rem", margin: 0, padding: 0, listStyle: "none" }}>
      <li>
        <NavRow
          title="Documents"
          description="Contracts and policies"
          icon={<DocumentIcon size={18} />}
          href="#docs"
        />
      </li>
      <li>
        <NavRow title="Members" badge={12} icon={<UsersIcon size={18} />} href="#members" />
      </li>
      <li>
        <NavRow title="Archived" meta="Read only" disabled />
      </li>
    </ul>
  ),
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <NavRow {...args} />
    </ThemeMatrix>
  ),
};
