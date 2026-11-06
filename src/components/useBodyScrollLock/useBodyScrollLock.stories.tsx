import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button";
import { isBodyScrollLocked, useBodyScrollLock } from "./useBodyScrollLock";

function Demo({ scrollContainerSelectors }: { scrollContainerSelectors?: string[] }) {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open, { scrollContainerSelectors });
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Button onClick={() => setOpen(true)}>Open overlay</Button>
      <p style={{ margin: 0 }}>Lock held: {String(isBodyScrollLocked())}</p>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Demo overlay"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgb(0 0 0 / 0.5)",
          }}
        >
          <div
            style={{
              padding: 24,
              background: "var(--lufia-color-bg-surface-solid)",
              color: "var(--lufia-color-text-default)",
              borderRadius: 12,
            }}
          >
            <p>While this is open, the page behind cannot scroll.</p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Components/useBodyScrollLock",
  component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DocumentScroll: Story = {};
export const InnerScrollShell: Story = { args: { scrollContainerSelectors: [".app-shell-scroller"] } };
