import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { StatusTimeline, type StatusTimelineTrack } from "./StatusTimeline";
import { DemoButton } from "../../docs/demo";

const tracks: StatusTimelineTrack[] = [
  {
    id: "review",
    title: "Review",
    nodes: [
      {
        id: "r1",
        label: "Request submitted",
        state: "done",
        stateLabel: "Done",
        timestampLabel: "5 Nov 2026, 10:42",
      },
      {
        id: "r2",
        label: "Written feedback",
        state: "pending",
        stateLabel: "Pending",
        deadlineLabel: "Due 12 Nov 2026",
        hint: "Attach the checklist.",
      },
      {
        id: "r3",
        label: "Sign-off",
        state: "needsTimestamp",
        stateLabel: "Needs a date",
        action: <DemoButton size="sm">Record date</DemoButton>,
      },
    ],
  },
  {
    id: "release",
    title: "Release",
    nodes: [
      {
        id: "i1",
        label: "Build published",
        state: "overdue",
        stateLabel: "Overdue",
        deadlineLabel: "Was due 1 Nov 2026",
      },
      { id: "i2", label: "Announcement", state: "notApplicable", stateLabel: "Not applicable" },
    ],
  },
];

const meta = {
  title: "Components/StatusTimeline",
  component: StatusTimeline,
  parameters: { layout: "padded" },
  args: { tracks },
  decorators: [
    (Story) => (
      <div style={{ width: "min(100%, 520px)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleTrack: Story = { args: { tracks: tracks.slice(0, 1) } };
export const EmptyTrackOmitted: Story = {
  args: { tracks: [...tracks, { id: "none", title: "Not rendered", nodes: [] }] },
};
export const LongContent: Story = {
  args: {
    tracks: [
      {
        id: "long",
        title: "A long track heading that wraps on small screens",
        nodes: [
          {
            id: "l1",
            label: "A node label long enough to need several lines at 320 pixels wide",
            state: "pending",
            stateLabel: "Pending review by the responsible person",
            hint: "Hint with reference-0123456789-abcdefghijklmnopqrstuvwxyz-0123456789",
          },
        ],
      },
    ],
  },
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <StatusTimeline {...args} />
    </ThemeMatrix>
  ),
};
