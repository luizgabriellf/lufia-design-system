import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { Popover, type PopoverProps } from "./Popover";

type DemoProps = Omit<PopoverProps, "trigger" | "children" | "label"> &
  Partial<Pick<PopoverProps, "label" | "children">>;

const content = (
  <div style={{ display: "grid", gap: "0.75rem" }}>
    <p style={{ margin: 0 }}>Filters apply to every table on this page.</p>
    <label style={{ display: "grid", gap: "0.25rem" }}>
      Owner
      <input
        type="text"
        style={{
          font: "inherit",
          padding: "0.5rem 0.75rem",
          color: "var(--lufia-color-text-default)",
          background: "var(--lufia-color-bg-field)",
          border: "1px solid var(--lufia-color-border-strong)",
          borderRadius: "var(--lufia-radius-control)",
        }}
      />
    </label>
    <Button variant="primary" size="sm">
      Apply
    </Button>
  </div>
);

function Demo({ label = "Filters", children = content, ...rest }: DemoProps) {
  return (
    <Popover
      label={label}
      trigger={(props) => (
        <Button variant="secondary" {...props}>
          Filters
        </Button>
      )}
      {...rest}
    >
      {children}
    </Popover>
  );
}

const meta = {
  title: "Components/Overlays/Popover",
  component: Demo,
  parameters: { layout: "padded" },
  argTypes: {
    placement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    initialFocus: { control: "inline-radio", options: ["first", "panel"] },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "center", minBlockSize: "22rem", paddingBlock: "8rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed. Press Enter or Space on the button; Escape or a press outside closes it and focus returns to the button. */
export const Default: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const PlacedAbove: Story = { args: { defaultOpen: true, placement: "top" } };
export const PlacedAtStart: Story = { args: { defaultOpen: true, placement: "start" } };
export const PlacedAtEnd: Story = { args: { defaultOpen: true, placement: "end" } };
export const AlignedToEnd: Story = { args: { defaultOpen: true, align: "end" } };
export const Centered: Story = { args: { defaultOpen: true, align: "center" } };
export const LongContent: Story = {
  args: {
    defaultOpen: true,
    children: (
      <div>
        {Array.from({ length: 24 }, (_, index) => (
          <p key={index} style={{ margin: "0 0 0.5rem" }}>
            A line of content that makes the panel taller than the room it has, so it scrolls inside.
          </p>
        ))}
      </div>
    ),
  },
};

function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "grid", gap: "1rem", justifyItems: "start" }}>
      <Button variant="ghost" onClick={() => setOpen((value) => !value)}>
        {open ? "Close from outside" : "Open from outside"}
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        label="Filters"
        trigger={(props) => (
          <Button variant="secondary" {...props}>
            Filters
          </Button>
        )}
      >
        {content}
      </Popover>
    </div>
  );
}

/** `open` and `onOpenChange` put the state in the caller, which can also open or close it from elsewhere. */
export const ControlledByTheCaller: Story = { render: () => <Controlled /> };

/** A trigger near the bottom edge: the panel flips above it instead of running off the page. */
export const FlipsNearTheBottom: Story = {
  args: { defaultOpen: true },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ position: "fixed", insetBlockEnd: "1rem", insetInlineStart: "1rem" }}>
        <Story />
      </div>
    ),
  ],
};

/** A trigger at the end edge: the panel shifts inward and stays inside the viewport. */
export const ShiftsNearTheEdge: Story = {
  args: { defaultOpen: true, align: "start" },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ position: "fixed", insetBlockStart: "6rem", insetInlineEnd: "0.5rem" }}>
        <Story />
      </div>
    ),
  ],
};

/** A card with `overflow: hidden`. The panel is portalled out of it, so it is not clipped. */
export const InClippingCard: Story = {
  name: "In a clipping card",
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <div
        data-testid="clipping-card"
        style={{
          overflow: "hidden",
          inlineSize: "14rem",
          blockSize: "4rem",
          padding: "1rem",
          borderRadius: "var(--lufia-radius-panel)",
          border: "1px solid var(--lufia-color-border-subtle)",
          background: "var(--lufia-color-bg-surface-solid)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const Phone320: Story = {
  args: { defaultOpen: true },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const Phone390: Story = {
  args: { defaultOpen: true },
  globals: { viewport: { value: "w390", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { defaultOpen: true, placement: "start" },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ display: "flex", justifyContent: "center", minBlockSize: "22rem" }}>
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <ThemeMatrix>
      <div style={{ minBlockSize: "20rem", paddingBlockStart: "1rem" }}>
        <Demo {...args} />
      </div>
    </ThemeMatrix>
  ),
};
