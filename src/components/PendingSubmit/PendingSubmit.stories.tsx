import type { Meta, StoryObj } from "@storybook/react-vite";
import { useActionState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { PendingSubmit } from "./PendingSubmit";

const meta = {
  title: "Components/Forms/PendingSubmit",
  component: PendingSubmit,
  parameters: { layout: "padded" },
  args: { children: "Save changes", pendingLabel: "Saving…" },
} satisfies Meta<typeof PendingSubmit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
/** Driven by the `pending` prop: the way to use it with `useActionState`, a transition or your own request state. */
export const Pending: Story = { args: { pending: true } };
export const PendingSecondary: Story = { args: { pending: true, variant: "secondary" } };
/** The first label shows at once; the others replace it after their delay (3 s and 7 s here), timed in CSS. */
export const WithProgress: Story = {
  args: {
    pending: true,
    progress: [
      [3000, "Still saving…"],
      [7000, "Almost there…"],
    ],
  },
};
export const Disabled: Story = { args: { disabled: true } };
/** A real form action: the button follows the form through `useFormStatus` and cannot submit twice. Press it. */
export const InAForm: Story = {
  render: (args) => {
    const [message, submit] = useActionState(async (count: number) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return count + 1;
    }, 0);
    return (
      <form action={submit} style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
        <PendingSubmit {...args} progress={[[1200, "Still saving…"]]} />
        <p style={{ margin: 0, color: "var(--lufia-color-text-muted)", fontSize: "0.875rem" }}>
          Saved {message} {message === 1 ? "time" : "times"}. Press Enter or click twice quickly: it saves
          once.
        </p>
      </form>
    );
  },
};
export const LongText: Story = {
  args: {
    children: "Save changes and continue to the review step",
    pendingLabel: "Saving, this can take a moment…",
    pending: true,
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 20rem)" }}>
        <Story />
      </div>
    ),
  ],
};
export const Phone320: Story = {
  args: { pending: true, progress: [[2000, "Still saving…"]] },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { pending: true },
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
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <PendingSubmit {...args} />
        <PendingSubmit {...args} pending />
        <PendingSubmit {...args} variant="secondary" />
        <PendingSubmit {...args} variant="secondary" pending />
        <PendingSubmit {...args} disabled />
      </div>
    </ThemeMatrix>
  ),
};
