import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { DetailAttentionCard } from "./DetailAttentionCard";

const meta = {
  title: "Components/DetailAttentionCard",
  component: DetailAttentionCard,
  parameters: { layout: "padded" },
  args: {
    tone: "warn",
    title: "Review due in 5 days",
    description: "Schedule the review before the deadline.",
    meta: "Last checked 2 days ago",
    toneLabel: "Warning",
    action: <button type="button">Schedule</button>,
  },
  argTypes: { tone: { control: "inline-radio", options: ["ok", "warn", "danger", "critical", "neutral"] } },
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 480px)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DetailAttentionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warn: Story = {};
export const Ok: Story = {
  args: { tone: "ok", title: "Everything is up to date", toneLabel: "OK", action: undefined },
};
export const Danger: Story = {
  args: { tone: "danger", title: "Subscription expired", toneLabel: "Expired" },
};
export const Critical: Story = {
  args: { tone: "critical", title: "Immediate action required", toneLabel: "Critical" },
};
export const Neutral: Story = {
  args: { tone: "neutral", title: "No data yet", toneLabel: "No data", meta: undefined },
};
export const TitleOnly: Story = { args: { description: undefined, meta: undefined, action: undefined } };

export const LongContent: Story = {
  args: {
    title: "A very long title that must wrap instead of overflowing the card at a 320 pixel viewport width",
    description:
      "Long descriptions use overflow-wrap: anywhere so unbroken strings such as reference-0123456789-abcdefghijklmnopqrstuvwxyz never push the layout.",
  },
};

export const AllTones: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["ok", "warn", "danger", "critical", "neutral"] as const).map((tone) => (
        <DetailAttentionCard key={tone} {...args} tone={tone} title={`Tone: ${tone}`} toneLabel={tone} />
      ))}
    </div>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: 8 }}>
        {(["ok", "warn", "danger", "neutral"] as const).map((tone) => (
          <DetailAttentionCard
            key={tone}
            {...args}
            tone={tone}
            title={`Tone: ${tone}`}
            toneLabel={tone}
            action={undefined}
          />
        ))}
      </div>
    </ThemeMatrix>
  ),
};
