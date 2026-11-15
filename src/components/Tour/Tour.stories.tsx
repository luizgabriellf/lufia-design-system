import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { Tour, type TourLabels, type TourProps, type TourStep } from "./Tour";

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

const guidedLabels: TourLabels = {
  ...labels,
  doHint: "Do this on the page to continue.",
  skipStep: "Skip step",
  seeking: "Opening this part of the screen…",
  blocked: "Close the open window to see this part.",
};

function Guided({
  steps: given,
  status = "ready",
  ...rest
}: { steps: TourStep[]; status?: TourProps["targetStatus"] } & Partial<TourProps>) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  return (
    <div style={{ display: "grid", gap: "1rem", padding: "1.5rem", minBlockSize: "24rem" }}>
      <label style={{ display: "grid", gap: "0.25rem", maxInlineSize: "20rem" }}>
        Record name
        <input data-tour="name" style={{ font: "inherit", padding: "0.5rem 0.75rem" }} />
      </label>
      <div>
        <Button
          variant="primary"
          data-tour="save"
          onClick={() => setIndex((value) => Math.min(value + 1, given.length - 1))}
        >
          Save record
        </Button>
      </div>
      <Tour
        steps={given}
        open={open}
        stepIndex={index}
        onStepChange={setIndex}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        labels={guidedLabels}
        targetStatus={status}
        {...rest}
      />
    </div>
  );
}

const doSteps: TourStep[] = [
  {
    target: '[data-tour="save"]',
    mode: "do",
    title: "Save the record",
    body: "Press Save to continue.",
    missingBody: "The save button is not on this screen.",
  },
  { title: "Saved", body: "The record is in your list." },
];

/** A `do` step: the next button is hidden and a hint says what to do. Pressing Save here moves the tour on, as a host would. */
export const DoStep: StoryObj = { render: () => <Guided steps={doSteps} /> };
/** The host reports the target as missing: the step shows its own body and can be skipped. */
export const DoStepMissing: StoryObj = { render: () => <Guided steps={doSteps} status="missing" /> };
/** The host is still opening the part of the screen that holds the target. */
export const Seeking: StoryObj = { render: () => <Guided steps={doSteps} status="seeking" /> };
/** Something else (an open window) is in the way. */
export const Blocked: StoryObj = { render: () => <Guided steps={doSteps} status="blocked" /> };
/** A host resolver finds the target, and a note says the element is only a stand-in for the real one. */
export const CustomTarget: StoryObj = {
  render: () => (
    <Guided
      steps={[
        {
          title: "Export",
          body: "Export lives in the overflow menu.",
          standInNote: "It is behind this button: open it to find Export.",
        },
      ]}
      resolveTarget={() => document.querySelector('[data-tour="save"]')}
      isStandIn={() => true}
    />
  ),
};
/** On a phone, while a text field has focus the card shrinks to its title and buttons. Focus the field to see it. */
export const CompactWhileTyping: StoryObj = {
  render: () => (
    <Guided
      steps={[
        { target: '[data-tour="name"]', title: "Name it", body: "Type a name for the record.", mode: "do" },
      ]}
      compactOnTyping
    />
  ),
  globals: { viewport: { value: "w390", isRotated: false } },
};
/** A host that always offers an explicit leave action keeps the skip button on the last step too. */
export const SkipOnLastStep: StoryObj = {
  render: () => <Guided steps={doSteps.slice(0, 1)} skipOnLastStep />,
};

/** A last `do` step with the close button off still shows skip: the card is never left with no action. */
export const LastDoStepNoClose: StoryObj = {
  render: () => <Guided steps={doSteps.slice(0, 1)} showCloseButton={false} />,
};

/** The package's own close button, Escape and arrow keys are each switchable, for a host that owns that behaviour. */
export const SwitchesOff: StoryObj = {
  render: () => (
    <Guided steps={doSteps} showCloseButton={false} closeOnEscape={false} arrowKeyNavigation={false} />
  ),
};

function InsideDialog({ dialogLayout }: Pick<TourProps, "dialogLayout">) {
  const [open, setOpen] = useState(true);
  return (
    <dialog
      open
      style={{
        position: "fixed",
        inset: 0,
        margin: "auto",
        inlineSize: "min(28rem, 100%)",
        blockSize: "min(30rem, 100%)",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--lufia-color-border-strong)",
        background: "var(--lufia-color-bg-surface-solid)",
        color: "var(--lufia-color-text-default)",
      }}
    >
      <header style={{ padding: "1rem" }}>Edit record</header>
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        <div style={{ blockSize: "14rem" }}>Earlier fields</div>
        <Button variant="secondary" data-tour="more">
          Add detail
        </Button>
        <div style={{ blockSize: "24rem" }} />
      </div>
      <footer style={{ padding: "1rem" }}>
        <Button variant="primary">Save</Button>
      </footer>
      <Tour
        steps={[{ target: '[data-tour="more"]', title: "Add detail", body: "Extra detail goes here." }]}
        open={open}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        labels={labels}
        dialogLayout={dialogLayout}
      />
    </dialog>
  );
}

/** Wide screens: the card sits beside the dialog, and the spotlight stops where the dialog's scroll area does. */
export const BesideTheDialog: StoryObj = {
  render: () => <InsideDialog dialogLayout={{ beside: true, clipSpotlight: true }} />,
};
/** Phones: the dialog shrinks to the viewport minus the card, so the card sits below it instead of covering its footer. */
export const DockedDialog: StoryObj = {
  render: () => <InsideDialog dialogLayout={{ dock: true, clipSpotlight: true }} />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

const modalSteps: TourStep[] = [
  {
    target: '[data-tour="low-field"]',
    title: "Further down",
    body: "The dialog keeps its header and footer in view and the card sits below it.",
  },
  { title: "That is all", body: "The card hands the dialog back when the tour ends." },
];

function DockedInModal({ renderAs }: { renderAs: "dialog" | "portal" }) {
  const [open, setOpen] = useState(true);
  return (
    <Modal
      open
      onClose={() => {}}
      renderAs={renderAs}
      sheetHeight="full"
      title="Edit record"
      footer={<Button variant="primary">Save</Button>}
    >
      <div style={{ blockSize: "40rem" }}>Earlier fields</div>
      <Button variant="secondary" data-tour="low-field">
        Add detail
      </Button>
      <div style={{ blockSize: "6rem" }} />
      <Tour
        steps={modalSteps}
        open={open}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        labels={labels}
        dialogLayout={{ dock: true, beside: true, clipSpotlight: true }}
      />
    </Modal>
  );
}

/** Phones: a full-height `Modal` (native dialog) shrinks above the card; its header keeps its height and the footer stays reachable. */
export const DockedModal: StoryObj = {
  render: () => <DockedInModal renderAs="dialog" />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** The same for the portal `Modal`, which is not a native dialog. */
export const DockedPortalModal: StoryObj = {
  render: () => <DockedInModal renderAs="portal" />,
  globals: { viewport: { value: "w390", isRotated: false } },
};

const lonelySteps: TourStep[] = [
  { title: "Before you start", body: "This step points at nothing, so it is a card in the middle." },
  { title: "Then this", body: "Its buttons stay reachable while a modal is open." },
];

function NoTargetInModal({ kind }: { kind: "dialog" | "portal" | "native" }) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const native = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (kind === "native") native.current?.showModal();
  }, [kind]);
  return (
    <>
      {kind === "native" ? (
        <dialog ref={native} aria-label="Native dialog" style={{ padding: "2rem" }}>
          A native dialog opened with showModal().
        </dialog>
      ) : (
        <Modal open onClose={() => {}} title="Open modal" renderAs={kind}>
          The page behind is inert.
        </Modal>
      )}
      <Tour
        steps={lonelySteps}
        open={open}
        stepIndex={index}
        onStepChange={setIndex}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        labels={labels}
      />
    </>
  );
}

/** A step with no target while a native `dialog` is open with `showModal()`: the card is hosted in it, so it can be reached. */
export const NoTargetInNativeDialog: StoryObj = { render: () => <NoTargetInModal kind="native" /> };
/** The same in the package `Modal`, rendered as a native dialog. */
export const NoTargetInDialogModal: StoryObj = { render: () => <NoTargetInModal kind="dialog" /> };
/** The same in the portal `Modal`, which is not a native dialog. */
export const NoTargetInPortalModal: StoryObj = { render: () => <NoTargetInModal kind="portal" /> };

/**
 * On a short viewport (a phone with the keyboard up) the card steps aside entirely while a field has focus, and comes back
 * when typing stops or the viewport grows. Resize the viewport below 480 px of height and focus the field to see it.
 */
export const HiddenWhileTypingOnShortViewport: StoryObj = {
  render: () => (
    <Guided
      steps={[
        { target: '[data-tour="name"]', title: "Name it", body: "Type a name for the record.", mode: "do" },
      ]}
      compactOnTyping={{ hideBelowHeight: 480 }}
    />
  ),
  globals: { viewport: { value: "w390", isRotated: false } },
};

/** `placement: "auto"` takes the first side with room: bottom, top, end, then start. */
export const AutoPlacement: StoryObj = {
  render: () => (
    <Guided
      steps={[
        {
          target: '[data-tour="save"]',
          title: "Save",
          body: "The card opens where there is room.",
          placement: "auto",
        },
      ]}
    />
  ),
};

function SeekingThenReady() {
  const [status, setStatus] = useState<TourProps["targetStatus"]>("seeking");
  useEffect(() => {
    const timer = window.setTimeout(() => setStatus("ready"), 1200);
    return () => window.clearTimeout(timer);
  }, []);
  return <Guided steps={doSteps} status={status} />;
}

/** The target turns ready after a moment: the heading is read again, unless focus is in a field being typed in. */
export const FocusAfterSeeking: StoryObj = { render: () => <SeekingThenReady /> };
