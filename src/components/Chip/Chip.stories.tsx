import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { PlusIcon } from "../../docs/demo";
import { Chip } from "./Chip";

const meta = {
  title: "Components/Actions/Chip",
  component: Chip,
  parameters: { layout: "padded" },
  args: { children: "Summarise this report" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] } },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An action chip: a suggestion the user applies. */
export const Default: Story = { args: { onClick: () => {} } };
export const WithIcon: Story = { args: { onClick: () => {}, iconStart: <PlusIcon size="sm" /> } };
export const Small: Story = { args: { onClick: () => {}, size: "sm" } };
export const Selected: Story = { args: { selected: true, onClick: () => {}, children: "Open" } };
export const Disabled: Story = { args: { onClick: () => {}, disabled: true } };
export const Static: Story = { args: { children: "Read only" } };
export const Removable: Story = {
  args: { onRemove: () => {}, removeLabel: "Remove Draft", children: "Draft" },
};
export const RemovableDisabled: Story = {
  args: { onRemove: () => {}, removeLabel: "Remove Draft", children: "Draft", disabled: true },
};
export const LongLabel: Story = {
  args: {
    onClick: () => {},
    children: "A considerably longer label that has to wrap instead of overflowing its container",
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "14rem" }}>
        <Story />
      </div>
    ),
  ],
};

function Toggles() {
  const [picked, setPicked] = useState<string[]>(["Open"]);
  return (
    <div role="group" aria-label="Status" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {["Open", "Waiting", "Resolved"].map((label) => (
        <Chip
          key={label}
          selected={picked.includes(label)}
          onClick={() =>
            setPicked((now) => (now.includes(label) ? now.filter((x) => x !== label) : [...now, label]))
          }
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}
export const ToggleGroup: Story = { render: () => <Toggles /> };

function Removables() {
  const [tags, setTags] = useState(["Draft", "Urgent", "Needs review"]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          removeLabel={`Remove ${tag}`}
          onRemove={() => setTags((now) => now.filter((x) => x !== tag))}
        >
          {tag}
        </Chip>
      ))}
    </div>
  );
}
export const RemovableList: Story = { render: () => <Removables /> };

function Grid() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {(["sm", "md"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <Chip size={size} onClick={() => {}}>
            Action
          </Chip>
          <Chip size={size} onClick={() => {}} iconStart={<PlusIcon size="sm" />}>
            With icon
          </Chip>
          <Chip size={size} selected>
            Selected
          </Chip>
          <Chip size={size} onClick={() => {}} disabled>
            Disabled
          </Chip>
          <Chip size={size} onRemove={() => {}} removeLabel="Remove">
            Removable
          </Chip>
          <Chip size={size}>Static</Chip>
        </div>
      ))}
    </div>
  );
}

function PopoverDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Chip
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="chip-popover"
        onClick={() => setOpen(!open)}
      >
        Filters
      </Chip>
      <div id="chip-popover" hidden={!open}>
        Filter options
      </div>
    </div>
  );
}

const tones = ["neutral", "accent", "success", "warning", "danger"] as const;

function Tones() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      {tones.map((tone) => (
        <Chip key={tone} tone={tone}>
          {tone}
        </Chip>
      ))}
      {tones.map((tone) => (
        <Chip key={`${tone}-action`} tone={tone} onClick={() => {}}>
          {tone} action
        </Chip>
      ))}
    </div>
  );
}
/** Colour comes from the semantic tokens; the label carries the meaning. */
export const AllTones: Story = { render: () => <Tones /> };
export const Danger: Story = { args: { tone: "danger", onClick: () => {}, children: "Overdue" } };
/** The chip forwards `aria-expanded`, `aria-haspopup` and `aria-controls`, so it can open a popover or a menu. */
export const PopoverTrigger: Story = { render: () => <PopoverDemo /> };
export const AllStatesAndSizes: Story = { render: () => <Grid /> };
export const Phone320: Story = {
  render: () => <Grid />,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  render: () => <Grid />,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
/** Every theme and mode: the selected state keeps its contrast in each. */
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <Grid />
      <Tones />
    </ThemeMatrix>
  ),
};
