import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { IconButton } from "../IconButton";
import { MenuToggleIcon } from "./MenuToggleIcon";

const meta = {
  title: "Components/Utilities/MenuToggleIcon",
  component: MenuToggleIcon,
  parameters: { layout: "padded" },
  args: { open: false, size: "md" },
  argTypes: {
    open: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg", "1em", 32] },
  },
} satisfies Meta<typeof MenuToggleIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { open: true } };

function Toggle() {
  const [open, setOpen] = useState(false);
  return (
    <IconButton
      variant="secondary"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
      icon={<MenuToggleIcon open={open} />}
    />
  );
}

/** The button owns the name and `aria-expanded`; the icon is decorative and morphs with the state. */
export const InIconButton: Story = { render: () => <Toggle /> };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      {(["sm", "md", "lg", 32] as const).map((size) => (
        <span key={size} style={{ display: "inline-flex", gap: "0.75rem" }}>
          <MenuToggleIcon open={false} size={size} />
          <MenuToggleIcon open size={size} />
        </span>
      ))}
    </div>
  ),
};

export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Toggle />
    </ThemeMatrix>
  ),
};
