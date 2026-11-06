import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Badge, StatusBadge, type BadgeTone } from "./Badge";

const TONES: BadgeTone[] = ["neutral", "info", "success", "warning", "danger", "ai"];
const LABELS: Record<BadgeTone, string> = {
  neutral: "Draft",
  info: "In review",
  success: "Approved",
  warning: "Expires soon",
  danger: "Overdue",
  ai: "AI suggestion",
};

const meta = {
  title: "Components/Data display/Badge",
  component: Badge,
  parameters: { layout: "padded" },
  args: { children: "Approved", tone: "success" },
  argTypes: { tone: { control: "inline-radio", options: TONES } },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDot: Story = { args: { dot: true } };
/** `StatusBadge` is a `Badge` with the dot on, for the state of a record. */
export const Status: Story = {
  render: (args) => <StatusBadge {...args} />,
  args: { tone: "warning", children: "Pending" },
};
export const LongText: Story = {
  args: { children: "A status label that is far too long for the room it has been given" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "12rem" }}>
        <Story />
      </div>
    ),
  ],
};

function Tones({ dot }: { dot?: boolean }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {TONES.map((tone) => (
        <Badge key={tone} tone={tone} dot={dot}>
          {LABELS[tone]}
        </Badge>
      ))}
    </div>
  );
}

export const AllTones: Story = { render: () => <Tones /> };
export const AllTonesWithDot: Story = { render: () => <Tones dot /> };
export const Phone320: Story = {
  render: () => <Tones dot />,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Tones />
        <Tones dot />
      </div>
    </ThemeMatrix>
  ),
};
