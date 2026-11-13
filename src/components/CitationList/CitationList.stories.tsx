import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Card } from "../Card";
import { CitationList, type CitationItem } from "./CitationList";

const items: CitationItem[] = [
  { key: "std", label: "Standard", reference: "Standard 123, clause 4", href: "#standard-123" },
  { key: "guide", label: "Guide", reference: "Handling guide, section 2.1", href: "#guide" },
  { key: "reg", reference: "Regulation 45/2020, article 7" },
];

const meta = {
  title: "Components/Data display/CitationList",
  component: CitationList,
  parameters: { layout: "padded" },
  args: { items, title: "Sources" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 30rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CitationList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutTitle: Story = { args: { title: undefined, "aria-label": "Sources" } };
export const SingleItem: Story = { args: { items: [items[0]!] } };
export const ManyItems: Story = {
  args: {
    items: Array.from({ length: 9 }, (_, index) => ({
      key: `item-${index}`,
      reference: `Standard ${120 + index}, clause ${index + 1}`,
      href: `#standard-${index}`,
    })),
  },
};
export const LongReference: Story = {
  args: {
    items: [
      {
        key: "long",
        label: "Standard",
        reference:
          "A reference with a very long title that has to wrap inside its chip instead of overflowing the row on a narrow screen",
        href: "#long",
      },
      {
        key: "token",
        reference: "identifier-0123456789-abcdefghijklmnopqrstuvwxyz-0123456789-abcdefghijklmnop",
      },
    ],
  },
};
export const InsideCard: Story = {
  render: (args) => (
    <Card title="Where this comes from">
      <CitationList {...args} title={undefined} aria-label="Sources" />
    </Card>
  ),
};
export const Empty: Story = { args: { items: [] } };
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: "min(100%, 30rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  decorators: [],
  render: (args) => (
    <ThemeMatrix>
      <CitationList {...args} />
    </ThemeMatrix>
  ),
};
