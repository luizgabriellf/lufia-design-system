import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { ArrowRightIcon } from "../../docs/demo";
import { Link } from "./Link";

const meta = {
  title: "Components/Actions/Link",
  component: Link,
  parameters: { layout: "padded" },
  args: { href: "#guide", children: "read the guide" },
  decorators: [
    (Story) => (
      <p style={{ maxInlineSize: "32rem", margin: 0 }}>
        Before you start, <Story /> and check the requirements.
      </p>
    ),
  ],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Opens in a new tab: the indicator is visual, and the hidden label tells assistive technology. */
export const External: Story = {
  args: {
    href: "https://example.com",
    externalLabel: "(opens in new tab)",
    children: "the specification",
  },
};
/** No underline at rest and a medium weight; the underline shows on hover and focus. For a link on its own line. */
export const Standalone: Story = {
  args: { variant: "standalone", children: "View all reports" },
  decorators: [
    (Story) => (
      <p style={{ margin: 0 }}>
        <Story />
      </p>
    ),
  ],
};
/** The icon moves 2px along the inline axis on hover, and stays still under reduced motion. */
export const WithIconEnd: Story = {
  args: { variant: "standalone", children: "View all reports", iconEnd: <ArrowRightIcon size="1em" /> },
  decorators: Standalone.decorators,
};
export const InlineWithIconEnd: Story = {
  args: { children: "read the guide", iconEnd: <ArrowRightIcon size="1em" /> },
};
export const LongText: Story = {
  args: {
    children: "a link whose text is long enough to wrap across more than one line of the paragraph around it",
    externalLabel: "(opens in new tab)",
    href: "https://example.com",
  },
};
export const Phone320: Story = {
  args: External.args,
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: External.args,
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
      <p style={{ margin: 0 }}>
        <Link href="#a">Internal</Link>,{" "}
        <Link href="https://example.com" externalLabel="(opens in new tab)">
          external
        </Link>
        .
      </p>
      <p style={{ margin: 0 }}>
        <Link href="#c" variant="standalone" iconEnd={<ArrowRightIcon size="1em" />}>
          Standalone
        </Link>
      </p>
    </ThemeMatrix>
  ),
};
