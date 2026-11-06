import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
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
    </ThemeMatrix>
  ),
};
