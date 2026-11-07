import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "./Card";

const meta = {
  title: "Components/Data display/Card",
  component: Card,
  parameters: { layout: "padded" },
  args: {
    title: "Quarterly report",
    children: "Totals for the period, grouped by team, with the changes since last quarter.",
  },
  argTypes: {
    padding: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6] },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 24rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHeaderAction: Story = { args: { headerAction: <Badge tone="success">Approved</Badge> } };
export const WithFooter: Story = {
  args: {
    footer: (
      <>
        <Button size="sm" variant="primary">
          Open
        </Button>
        <Button size="sm" variant="ghost">
          Share
        </Button>
      </>
    ),
  },
};
export const WithDescription: Story = { args: { description: "Updated every night at 02:00." } };
/** The body spans the card; the header and footer keep their padding. For lists and tables with their own rows. */
export const Flush: Story = {
  args: {
    description: "Updated every night at 02:00.",
    headerAction: <Badge tone="info">3 new</Badge>,
    children: (
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {["North", "South", "East"].map((name) => (
          <li
            key={name}
            style={{
              padding: "0.625rem 1.25rem",
              borderBlockStart: "1px solid var(--lufia-color-border-subtle)",
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    ),
    flush: true,
  },
};
/** `divider` draws a rule under the header. Its colour is `--lufia-card-divider-color`. */
export const Divider: Story = { args: { description: "Updated every night at 02:00.", divider: true } };
/** The card's spacing and shadow are component tokens, so an app can restyle every card from one place. */
export const ThemedByTokens: Story = {
  args: { divider: true },
  decorators: [
    (Story) => (
      <div
        style={
          {
            inlineSize: "min(100%, 24rem)",
            "--lufia-card-header-padding": "1rem 1.5rem",
            "--lufia-card-body-padding": "1.5rem",
            "--lufia-card-shadow": "var(--lufia-shadow-lg)",
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};
export const BodyOnly: Story = { args: { title: undefined } };
/** The whole card is the hit area of one link, the title. The ring shows on the card. */
export const Interactive: Story = { args: { href: "#report", headerAction: <Badge tone="info">New</Badge> } };
/** A button in the footer sits above the stretched link and keeps working on its own. */
export const InteractiveWithFooterButton: Story = {
  args: {
    href: "#report",
    footer: (
      <Button size="sm" variant="secondary">
        Download
      </Button>
    ),
  },
};
/** Controls and links in the body are lifted above the stretched link and work with a mouse. */
export const InteractiveWithBodyControls: Story = {
  args: {
    href: "#report",
    children: (
      <>
        Totals for the period. <a href="#glossary">What is a total?</a>{" "}
        <Button size="sm" variant="secondary">
          Refresh
        </Button>
      </>
    ),
  },
};
export const PaddingNone: Story = { args: { padding: "none" } };
export const PaddingSmall: Story = { args: { padding: "sm" } };
export const PaddingLarge: Story = { args: { padding: "lg" } };
export const LongText: Story = {
  args: {
    title: "A card title long enough that it has to wrap onto several lines in a narrow column",
    href: "#long",
    children:
      "A body that keeps going and going so the card has to grow with its content instead of clipping it: a short sentence, a longer one, and then a final line.",
    headerAction: <Badge tone="warning">Expires soon</Badge>,
  },
};
export const Phone320: Story = {
  args: Interactive.args,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: Interactive.args,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Card {...args} headerAction={<Badge tone="success">Approved</Badge>} />
        <Card {...args} href="#report" footer={<Button size="sm">Download</Button>} />
      </div>
    </ThemeMatrix>
  ),
};
