import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMediaQuery } from "./useMediaQuery";

function Demo({ query }: { query: string }) {
  const matches = useMediaQuery(query);
  return (
    <p style={{ margin: 0 }} aria-live="polite">
      <code>{query}</code> {matches ? "matches" : "does not match"}. Resize the viewport to change it.
    </p>
  );
}

const meta = {
  title: "Hooks/useMediaQuery",
  component: Demo,
  parameters: { layout: "padded" },
  args: { query: "(max-width: 40rem)" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Narrow: Story = {};
export const DarkColourScheme: Story = { args: { query: "(prefers-color-scheme: dark)" } };
export const HoverCapable: Story = { args: { query: "(hover: hover)" } };
