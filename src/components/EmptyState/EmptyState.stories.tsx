import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { EmptyState } from "./EmptyState";
import { DocumentIcon, SearchIcon, UploadIcon } from "../../docs/demo";

const meta = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: {
    icon: <DocumentIcon size={40} />,
    title: "No documents yet",
    body: "Documents you upload will appear here.",
    action: (
      <Button variant="primary" iconStart={<UploadIcon size={16} />}>
        Upload document
      </Button>
    ),
  },
  argTypes: { icon: { control: false }, action: { control: false } },
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
    icon: <SearchIcon size={40} />,
    title: "No results for “reference-0123456789-abcdefghij”",
    body: "Try a different search term or clear the filters.",
    action: <Button>Clear filters</Button>,
  },
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <EmptyState {...args} />
    </ThemeMatrix>
  ),
};
