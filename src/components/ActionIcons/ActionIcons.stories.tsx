import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ACTION_ICONS, DeleteIcon } from "./ActionIcons";

const meta = {
  title: "Components/ActionIcons",
  component: DeleteIcon,
  args: { size: 16 },
  argTypes: { size: { control: { type: "number", min: 12, max: 48 } } },
} satisfies Meta<typeof DeleteIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Gallery: Story = {
  render: (args) => (
    <ul style={{ display: "flex", gap: 24, listStyle: "none", padding: 0, flexWrap: "wrap" }}>
      {Object.entries(ACTION_ICONS).map(([name, Icon]) => (
        <li key={name} style={{ display: "grid", justifyItems: "center", gap: 8, fontSize: 12 }}>
          <Icon {...args} />
          {name}
        </li>
      ))}
    </ul>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {[13, 16, 24, 32].map((size) => (
        <DeleteIcon key={size} size={size} />
      ))}
    </div>
  ),
};

/** Passing `aria-label` turns the icon into an image with an accessible name. */
export const Meaningful: Story = { args: { "aria-label": "Delete item", size: 24 } };

export const AllThemes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "flex", gap: 12, color: "var(--lufia-color-text-default)" }}>
        {Object.entries(ACTION_ICONS).map(([name, Icon]) => (
          <Icon key={name} size={20} />
        ))}
      </div>
    </ThemeMatrix>
  ),
};
