import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Button } from "../Button";
import { useFocusTrap, type UseFocusTrapOptions } from "./useFocusTrap";

const panel = {
  display: "grid",
  gap: "0.75rem",
  padding: "1rem",
  background: "var(--lufia-color-bg-surface-solid)",
  color: "var(--lufia-color-text-default)",
  border: "1px solid var(--lufia-color-border-strong)",
  borderRadius: "var(--lufia-radius-card)",
  inlineSize: "min(100%, 22rem)",
} as const;

function Demo({ initialFocus, restoreFocus }: Pick<UseFocusTrapOptions, "initialFocus" | "restoreFocus">) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref, { onEscape: () => setOpen(false), initialFocus, restoreFocus });
  return (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <Button aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Open trap
      </Button>
      <Button>Another control on the page</Button>
      {open ? (
        <div ref={ref} role="dialog" aria-label="Focus trap demo" tabIndex={-1} style={panel}>
          <p style={{ margin: 0 }}>
            Tab and Shift+Tab stay in here. Escape closes and returns focus to the opener.
          </p>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            Name
            <input style={{ font: "inherit", padding: "0.5rem" }} />
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Hooks/useFocusTrap",
  component: Demo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusContainer: Story = {};
export const FocusFirstElement: Story = { args: { initialFocus: "first" } };
export const NoFocusRestore: Story = { args: { restoreFocus: false } };
