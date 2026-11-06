import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { SortableTh, type SortDirection } from "./SortableTh";

const meta = {
  title: "Components/Data display/SortableTh",
  component: SortableTh,
  parameters: { layout: "padded" },
  args: { label: "Name", active: true, dir: "asc", onSort: () => {} },
  argTypes: { dir: { control: "inline-radio", options: ["asc", "desc"] } },
  decorators: [
    (Story) => (
      <table
        style={{
          borderCollapse: "collapse",
          color: "var(--lufia-color-text-muted)",
          textTransform: "uppercase",
          fontSize: 12,
        }}
      >
        <thead>
          <tr>
            <Story />
          </tr>
        </thead>
      </table>
    ),
  ],
} satisfies Meta<typeof SortableTh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ascending: Story = {};
export const Descending: Story = { args: { dir: "desc" } };
export const Inactive: Story = { args: { active: false } };

function Interactive() {
  const [sort, setSort] = useState<{ key: string; dir: SortDirection }>({ key: "name", dir: "asc" });
  const toggle = (key: string) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  return (
    <>
      {["name", "role", "date"].map((key) => (
        <SortableTh
          key={key}
          label={key}
          active={sort.key === key}
          dir={sort.dir}
          onSort={() => toggle(key)}
          style={{ padding: "8px 16px", textAlign: "left" }}
        />
      ))}
    </>
  );
}

/** Click or press Enter / Space on a header to sort; the arrow and `aria-sort` follow. */
export const InteractiveSort: Story = { render: () => <Interactive /> };

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <table>
        <thead>
          <tr>
            <SortableTh {...args} />
            <SortableTh {...args} label="Date" active={false} />
          </tr>
        </thead>
      </table>
    </ThemeMatrix>
  ),
  decorators: [(Story) => <Story />],
};
