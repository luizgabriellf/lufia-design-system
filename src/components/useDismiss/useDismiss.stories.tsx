import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Button } from "../Button";
import { useDismiss } from "./useDismiss";

function Demo() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLElement | null>(null);
  useDismiss(open, () => setOpen(false), root, toggle);
  return (
    <div ref={root} style={{ position: "relative", display: "inline-block" }}>
      <Button
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(event) => {
          toggle.current = event.currentTarget;
          setOpen((v) => !v);
        }}
      >
        Options
      </Button>
      {open ? (
        <ul
          aria-label="Options"
          style={{
            position: "absolute",
            insetBlockStart: "calc(100% + 0.25rem)",
            insetInlineStart: 0,
            margin: 0,
            padding: "0.5rem 1rem",
            listStyle: "none",
            minInlineSize: "10rem",
            background: "var(--lufia-color-bg-surface-solid)",
            color: "var(--lufia-color-text-default)",
            border: "1px solid var(--lufia-color-border-strong)",
            borderRadius: "var(--lufia-radius-control)",
            boxShadow: "var(--lufia-shadow-md)",
          }}
        >
          <li>Rename</li>
          <li>Duplicate</li>
        </ul>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Hooks/useDismiss",
  component: Demo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
