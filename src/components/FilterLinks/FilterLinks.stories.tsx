import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { FilterLinks, type FilterLinksItem } from "./FilterLinks";

const statusItems: FilterLinksItem[] = [
  { key: "all", label: "All", href: "#all", count: 128 },
  { key: "open", label: "Open", href: "#open", count: 42 },
  { key: "waiting", label: "Waiting for reply", href: "#waiting", count: 7 },
  { key: "resolved", label: "Resolved", href: "#resolved", count: 79 },
  { key: "archived", label: "Archived", href: "#archived", count: 0 },
];

const meta = {
  title: "Components/Navigation/FilterLinks",
  component: FilterLinks,
  parameters: { layout: "padded" },
  args: { label: "Filter by status", items: statusItems, value: "open" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 40rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutCounts: Story = {
  args: { items: statusItems.map(({ key, label, href }) => ({ key, label, href })) },
};
export const NoneCurrent: Story = { args: { value: undefined } };
/** Many filters wrap onto more lines; the page does not gain a horizontal scrollbar. */
/** An item with `native` is a plain `<a>`, for a link that must do a full document navigation. */
export const NativeItem: Story = {
  args: {
    items: statusItems.map((item) => (item.key === "archived" ? { ...item, native: true } : item)),
  },
};

export const Wrapping: Story = {
  args: {
    items: Array.from({ length: 14 }, (_, index) => ({
      key: `f${index}`,
      label: `Category number ${index + 1}`,
      href: `#f${index}`,
      count: index * 3,
    })),
    value: "f2",
  },
};
export const Phone320: Story = {
  args: { items: statusItems },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
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
      <FilterLinks {...args} />
    </ThemeMatrix>
  ),
};
