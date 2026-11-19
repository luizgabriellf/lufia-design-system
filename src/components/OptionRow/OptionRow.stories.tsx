import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { CheckIcon, UsersIcon } from "../../docs/demo";
import { ChevronDownIcon, ClockIcon } from "../Icon/icons";
import { OptionRow } from "./OptionRow";

/** Stands in for a router link: an anchor that passes everything through. */
function DemoLink({ children, ...rest }: ComponentProps<"a">) {
  return <a {...rest}>{children}</a>;
}

const meta = {
  title: "Components/Forms/OptionRow",
  component: OptionRow,
  parameters: { layout: "padded" },
  args: {
    title: "Team plan",
    description: "Up to ten people, shared reports.",
    leading: <UsersIcon size={18} />,
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 30rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true, trailing: <CheckIcon size={18} /> } };
export const WithTrailingText: Story = { args: { trailing: "12 EUR / month" } };
export const TitleOnly: Story = { args: { description: undefined, leading: undefined } };
export const Disabled: Story = { args: { disabled: true } };
/** `render` swaps in an element of your own, such as a router link; `selected` then reads as `aria-current`. */
export const Rendered: Story = { args: { render: <DemoLink href="#plan" />, selected: true } };
export const LongText: Story = {
  args: {
    title: "A title that is far longer than the row can show on a single line without wrapping",
    description: "A description with unbroken_identifiers_that_wrap_instead_of_overflowing.",
    trailing: "A long trailing text",
  },
};

const initials: React.CSSProperties = {
  display: "inline-grid",
  placeItems: "center",
  inlineSize: "2rem",
  blockSize: "2rem",
  borderRadius: "50%",
  background: "var(--lufia-color-accent-subtle)",
  color: "var(--lufia-color-text-accent)",
  fontSize: "0.75rem",
  fontWeight: 600,
};

/** A guide-style row: eyebrow, title, description, meta with an inline icon and a trailing action label. */
export const GuideRow: Story = {
  args: {
    eyebrow: "Step 2 of 5",
    title: "Set up your workspace",
    description: "Name it, invite the team and pick a starting template.",
    meta: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
        <ClockIcon size={14} /> 5 min
      </span>
    ),
    leading: undefined,
    trailing: <span style={{ fontWeight: 600 }}>Start</span>,
  },
};

/** `truncate` keeps the title and description to one line each; the text column shrinks inside a narrow flex row. */
export const TruncatedTrigger: Story = {
  args: {
    truncate: true,
    title: "A workspace name that is far too long for this narrow container",
    description: "owner@example.com and a long second line",
    leading: <span style={initials}>AB</span>,
    trailing: <ChevronDownIcon size={16} />,
    "aria-haspopup": "menu",
    "aria-expanded": false,
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "15rem" }}>
        <Story />
      </div>
    ),
  ],
};

/** A trigger that spreads `aria-expanded="true"` takes the open look; it does not rotate anything by itself. */
export const Expanded: Story = {
  args: { ...TruncatedTrigger.args, "aria-expanded": true },
  decorators: TruncatedTrigger.decorators,
};

/** `highlighted` is visual only (no `aria-pressed`, no `aria-current`), for a suggested next item. */
export const Highlighted: Story = {
  args: { eyebrow: "Suggested", highlighted: true, trailing: <ChevronDownIcon size={16} /> },
};

/** `interactive={false}`: the same layout as a plain element, with no hover, press, focus or button semantics. */
export const Static: Story = {
  args: { interactive: false, eyebrow: "Summary", meta: "Updated today", onClick: undefined },
};

/** A theme tunes the row through the size hooks, with no override of the component's rules. */
export const SizeHooks: Story = {
  decorators: [
    (Story) => (
      <div
        style={
          {
            "--lufia-option-row-min-block-size": "5rem",
            "--lufia-option-row-padding-inline": "1.25rem",
            "--lufia-option-row-title-size": "1.125rem",
            "--lufia-option-row-description-size": "var(--lufia-font-size-xs)",
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};

function Choice({ density }: { density?: "comfortable" | "compact" }) {
  const [picked, setPicked] = useState("team");
  return (
    <ul
      style={{
        display: "grid",
        gap: density === "compact" ? "0.125rem" : "0.5rem",
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {[
        ["solo", "Solo plan", "One person."],
        ["team", "Team plan", "Up to ten people."],
        ["org", "Organisation plan", "Unlimited people."],
      ].map(([id, title, description]) => (
        <li key={id}>
          <OptionRow
            title={title}
            description={description}
            leading={<UsersIcon size={18} />}
            density={density}
            selected={picked === id}
            trailing={picked === id ? <CheckIcon size={18} /> : undefined}
            onClick={() => setPicked(id!)}
          />
        </li>
      ))}
    </ul>
  );
}
export const ChoiceList: Story = { render: () => <Choice /> };
/** `density="compact"` for a long pick list inside a menu, sheet or modal: no card chrome, tighter rows. */
export const CompactList: Story = { render: () => <Choice density="compact" /> };
export const CompactAsLink: Story = {
  args: { density: "compact", render: <DemoLink href="#plan" />, selected: true },
};
export const CompactDisabled: Story = { args: { density: "compact", disabled: true } };
export const Phone320: Story = {
  render: () => <Choice />,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  render: () => <Choice />,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <OptionRow
          title="Rest"
          description="Not chosen"
          leading={<UsersIcon size={18} />}
          onClick={() => {}}
        />
        <OptionRow
          title="Selected"
          description="Chosen"
          leading={<UsersIcon size={18} />}
          selected
          trailing={<CheckIcon size={18} />}
          onClick={() => {}}
        />
        <OptionRow title="Disabled" description="Unavailable" disabled onClick={() => {}} />
        <OptionRow title="Highlighted" eyebrow="Suggested" highlighted onClick={() => {}} />
        <OptionRow title="Expanded" aria-haspopup="menu" aria-expanded onClick={() => {}} />
        <OptionRow title="Static" description="Nothing to press" meta="Meta line" interactive={false} />
        <OptionRow density="compact" title="Compact" description="Rest" onClick={() => {}} />
        <OptionRow
          density="compact"
          title="Compact selected"
          description="Chosen"
          selected
          trailing={<CheckIcon size={18} />}
          onClick={() => {}}
        />
      </div>
    </ThemeMatrix>
  ),
};
