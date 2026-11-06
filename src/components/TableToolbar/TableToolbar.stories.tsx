import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { TableToolbar } from "./TableToolbar";

const filters = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "done", label: "Done" },
];

const meta = {
  title: "Components/Data display/TableToolbar",
  component: TableToolbar,
  parameters: { layout: "padded" },
  args: {
    filters,
    activeFilter: "open",
    onFilterChange: () => {},
    search: "",
    onSearchChange: () => {},
    searchPlaceholder: "Search items",
    clearSearchLabel: "Clear search",
  },
  argTypes: { variant: { control: "inline-radio", options: ["inline", "standalone"] } },
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 720px)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TableToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSearchValue: Story = { args: { search: "review" } };
export const FiltersOnly: Story = { args: { onSearchChange: undefined } };
export const SearchOnly: Story = { args: { filters: undefined } };
export const Standalone: Story = { args: { variant: "standalone" } };
export const WithExtraControls: Story = {
  render: (args) => (
    <TableToolbar {...args}>
      <select aria-label="Owner">
        <option>Anyone</option>
        <option>Me</option>
      </select>
    </TableToolbar>
  ),
};
export const ManyFilters: Story = {
  args: {
    filters: Array.from({ length: 8 }, (_, i) => ({ key: `f${i}`, label: `Filter number ${i + 1}` })),
    activeFilter: "f2",
  },
  globals: { viewport: { value: "w320", isRotated: false } },
};

function Controlled() {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  return (
    <TableToolbar
      filters={filters}
      activeFilter={active}
      onFilterChange={setActive}
      search={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search items"
      clearSearchLabel="Clear search"
    />
  );
}

export const Interactive: Story = { render: () => <Controlled /> };
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <TableToolbar {...args} />
    </ThemeMatrix>
  ),
};
