import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { STATUS_TONES, StatusIcon } from "./StatusIcon";

const meta = {
  title: "Components/Feedback/StatusIcon",
  component: StatusIcon,
  args: { tone: "warning", variant: "bare", size: "md" },
  argTypes: {
    tone: { control: "select", options: STATUS_TONES },
    variant: { control: "inline-radio", options: ["bare", "ring", "mark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof StatusIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const table = {
  borderCollapse: "collapse",
  color: "var(--lufia-color-text-default)",
  fontSize: "0.8125rem",
} as const;
const cell = { padding: "0.5rem 0.75rem", textAlign: "center" } as const;

/** Every tone in every variant. The shape alone names the tone; colour only reinforces it. */
export const Tones: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: "start" }}>Tone</th>
            <th style={cell}>bare</th>
            <th style={cell}>ring</th>
            <th style={cell}>mark</th>
          </tr>
        </thead>
        <tbody>
          {STATUS_TONES.map((tone) => (
            <tr key={tone}>
              <td style={{ ...cell, textAlign: "start" }}>
                <code>{tone}</code>
              </td>
              <td style={cell}>
                <StatusIcon tone={tone} />
              </td>
              <td style={cell}>
                <StatusIcon tone={tone} variant="ring" />
              </td>
              <td style={cell}>
                <StatusIcon tone={tone} variant="mark" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {(["bare", "ring"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {(["sm", "md", "lg"] as const).map((size) => (
            <StatusIcon key={size} tone="success" variant={variant} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** With `label` the icon is announced; leave it out when visible text already names the status. */
export const Labelled: Story = { args: { tone: "danger", variant: "ring", label: "Overdue" } };

export const AllThemes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {STATUS_TONES.map((tone) => (
            <StatusIcon key={tone} tone={tone} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {STATUS_TONES.map((tone) => (
            <StatusIcon key={tone} tone={tone} variant="ring" />
          ))}
        </div>
      </div>
    </ThemeMatrix>
  ),
};
