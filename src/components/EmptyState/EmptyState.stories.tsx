import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: {
    icon: "📄",
    title: "No documents yet",
    body: "Documents you upload will appear here.",
    action: <button type="button">Upload document</button>,
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 480px)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { icon: undefined, body: undefined, action: undefined } };
export const NoAction: Story = { args: { action: undefined } };
export const SearchNoResults: Story = {
  args: {
    icon: "🔍",
    title: "No results for “reference-0123456789-abcdefghij”",
    body: "Try a different search term or clear the filters.",
    action: <button type="button">Clear filters</button>,
  },
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <EmptyState {...args} />
    </ThemeMatrix>
  ),
};
