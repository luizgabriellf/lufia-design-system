import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { Tour, type TourLabels, type TourStep } from "./Tour";

const labels: TourLabels = {
  next: "Next",
  back: "Back",
  skip: "Skip tour",
  close: "Close tour",
  finish: "Done",
  stepOf: (current, total) => `Step ${current} of ${total}`,
};

const steps: TourStep[] = [
  {
    target: '[data-tour="search"]',
    title: "Find anything",
    body: "Type a name or a number to narrow the list. Results update as you type.",
  },
  {
    target: '[data-tour="filters"]',
    title: "Narrow it down",
    body: "Filters stay in place while you move between pages.",
    placement: "bottom",
  },
  {
    target: '[data-tour="create"]',
    title: "Add a record",
    body: "This button starts a new record. You can try it now: the page is still yours.",
    placement: "start",
  },
  { title: "That is all", body: "You can open this tour again from the help menu." },
];

type DemoProps = {
  steps?: TourStep[];
  startOpen?: boolean;
  startIndex?: number;
};

function Demo({ steps: given = steps, startOpen = true, startIndex = 0 }: DemoProps) {
  const [open, setOpen] = useState(startOpen);
  const [index, setIndex] = useState(startIndex);
  return (
    <div style={{ display: "grid", gap: "1rem", padding: "1.5rem", minBlockSize: "24rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between" }}>
        <input
          data-tour="search"
          aria-label="Search records"
          placeholder="Search records"
          style={{
            font: "inherit",
            padding: "0.5rem 0.75rem",
            color: "var(--lufia-color-text-default)",
            background: "var(--lufia-color-bg-field)",
            border: "1px solid var(--lufia-color-border-strong)",
            borderRadius: "var(--lufia-radius-control)",
          }}
        />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="secondary" data-tour="filters">
            Filters
          </Button>
          <Button variant="primary" data-tour="create">
            New record
          </Button>
        </div>
      </div>
      <p style={{ margin: 0, color: "var(--lufia-color-text-muted)" }}>
        The page behind the tour stays usable: try the controls while the card is open.
      </p>
      <div>
        <Button
          variant="ghost"
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
        >
          Restart tour
        </Button>
      </div>
      <Tour
        steps={given}
        open={open}
        stepIndex={index}
        onStepChange={setIndex}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        labels={labels}
      />
    </div>
  );
}

const meta = {
  title: "Components/Overlays/Tour",
  component: Demo,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The spotlight dims the page around the target; the card sits beside it. Arrow keys or the buttons step; Escape closes. */
export const Default: Story = {};
export const SecondStep: Story = { args: { startIndex: 1 } };
export const PlacedAtStart: Story = { args: { startIndex: 2 } };
/** A step without a target, or whose target is missing or hidden, is a centred card. */
export const CentredCard: Story = { args: { startIndex: 3 } };
export const MissingTarget: Story = {
  args: {
    steps: [
      {
        target: '[data-tour="not-on-this-page"]',
        title: "Not here",
        body: "This part of the page is not showing.",
      },
    ],
  },
};
export const Closed: Story = { args: { startOpen: false } };
/** Below 40rem the card is a sheet on the bottom edge, and the target is scrolled clear of it. */
export const Phone390: Story = {
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const Phone320: Story = {
  args: { startIndex: 1 },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { startIndex: 2 },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

function InsideModal() {
  const [open, setOpen] = useState(true);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <Modal open onClose={() => {}} title="Project settings">
      <Button ref={trigger} variant="secondary">
        Rename project
      </Button>
      <Tour
        steps={[
          {
            target: trigger,
            title: "Rename here",
            body: "The tour sits inside the dialog that holds its target, so the dialog's own focus rules do not lock it out.",
          },
        ]}
        open={open}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        labels={labels}
      />
    </Modal>
  );
}

/** A target inside an open modal: the tour is portalled into the modal, and the modal's backdrop does the dimming. */
export const InsideAModal: Story = { render: () => <InsideModal /> };
