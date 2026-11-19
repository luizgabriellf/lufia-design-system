import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Disclosure, disclosureClasses } from "./Disclosure";

const meta = {
  title: "Components/Data display/Disclosure",
  component: Disclosure,
  parameters: { layout: "padded" },
  args: {
    summary: "What is included in the plan?",
    children:
      "Unlimited projects, five team members and email support. Upgrade at any time from the billing page.",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["boxed", "plain"] },
    size: { control: "inline-radio", options: ["default", "compact"] },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 40rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OpenByDefault: Story = { args: { defaultOpen: true } };
export const Plain: Story = { args: { variant: "plain", defaultOpen: true } };

/**
 * A consuming app restores the inline padding of a plain disclosure without a specificity fight: through the documented
 * custom properties, or with an ordinary `root > summary` rule of its own.
 */
export const PlainWithConsumerPadding: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <style>
        {
          ".consumer-padded > summary { padding-inline: 1rem; } .consumer-padded > div { padding-inline: 1rem; }"
        }
      </style>
      <Disclosure
        variant="plain"
        defaultOpen
        summary="Padded by a single-class rule"
        className="consumer-padded"
      >
        Content
      </Disclosure>
      <Disclosure
        variant="plain"
        defaultOpen
        summary="Padded by the custom properties"
        style={
          {
            "--lufia-disclosure-summary-padding-inline": "1.5rem",
            "--lufia-disclosure-panel-padding-inline": "1.5rem",
          } as CSSProperties
        }
      >
        Content
      </Disclosure>
    </div>
  ),
};

/** `size="compact"` tightens the row and the padding, for dense lists and sidebars. */
export const Compact: Story = { args: { size: "compact", defaultOpen: true } };
export const CompactPlain: Story = { args: { size: "compact", variant: "plain", defaultOpen: true } };

/** `summaryClassName` styles the summary row. */
export const SummaryClassName: Story = {
  args: { summaryClassName: "story-summary", defaultOpen: true },
  decorators: [
    (Story) => (
      <>
        <style>{".story-summary { text-transform: uppercase; letter-spacing: 0.05em; }"}</style>
        <Story />
      </>
    ),
  ],
};

/** `indicator` replaces the chevron with any node; it does not turn, so style it from `details[open]`. */
export const CustomIndicator: Story = {
  args: { indicator: <span style={{ fontVariantNumeric: "tabular-nums" }}>3 items</span>, defaultOpen: true },
};

/** `description` adds a secondary line under the summary and `meta` a trailing count or badge before the chevron. */
export const DescriptionAndMeta: Story = {
  args: {
    summary: "Notifications",
    description: "Choose what reaches you and when.",
    meta: <span>4 on</span>,
    defaultOpen: true,
  },
};

/** `indicator={null}` shows nothing at the end of the row. */
export const NoIndicator: Story = { args: { indicator: null, defaultOpen: true } };

const questions = [
  ["How do I invite a team member?", "Open Team, choose Invite and enter their email address."],
  ["Can I export my invoices?", "Yes. Every list has an Export action that produces a CSV file."],
  ["Where do I change the billing address?", "Under Billing, in the Company details section."],
];

/** Details that share a `name` open one at a time, natively: opening one closes the others. No script is involved. */
export const ExclusiveGroup: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {questions.map(([question, answer], index) => (
        <Disclosure key={question} summary={question} name="help" defaultOpen={index === 0}>
          {answer}
        </Disclosure>
      ))}
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    summary:
      "A summary that is long enough to wrap onto a second line on narrow screens, with the chevron kept at the end",
    defaultOpen: true,
    children: (
      <>
        <p style={{ margin: 0 }}>
          Find in page opens a closed section that holds the match, so long content stays searchable.
        </p>
        <ul>
          <li>
            https://example.com/a/very/long/unbroken/address/that/should/not/break/the/layout/of/the/panel
          </li>
          <li>Second item</li>
        </ul>
      </>
    ),
  },
};

export const OnPhone: Story = {
  ...LongContent,
  globals: { viewport: { value: "w320", isRotated: false } },
};

/** An existing `<details>` gets the same look from the exported class names. */
export const ClassesOnNativeDetails: Story = {
  render: () => (
    <details className={disclosureClasses.root}>
      <summary className={disclosureClasses.summary}>A plain native details</summary>
      <div className={disclosureClasses.panel}>Styled from the class names, with no component around it.</div>
    </details>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: 8 }}>
        <Disclosure {...args} defaultOpen />
        <Disclosure {...args} summary="Closed" />
      </div>
    </ThemeMatrix>
  ),
  decorators: [(Story) => <Story />],
};
